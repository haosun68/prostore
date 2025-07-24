import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/db/prisma';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compareSync } from 'bcrypt-ts-edge';
import type { NextAuthConfig } from 'next-auth';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';


export const config: NextAuthConfig = {
  pages: {
    signIn: '/sign-in',
    error: '/sign-in',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      credentials: {
        email: { type: 'email' },
        password: { type: 'password' }
      },
      async authorize(credentials) {
        if (credentials == null) return null;
        const user = await prisma.user.findFirst({
          where: {
            email: credentials.email as string
          }
        });
        if (user && user.password) {
          const isMatch = compareSync(
            credentials.password as string,
            user.password
          );
          if (isMatch) {
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
            };
          }
        }
        return null;
      }
    })
  ],
  callbacks: {
    async session({ session, user, trigger, token }: any) {
      session.user.id = token.sub;
      session.user.name = token.name;
      session.user.role = token.role;

      if (trigger === 'update' && user?.name) {
        session.user.name = user.name;
      }
      return session;
    },
    async jwt({ token, user, trigger, session }: any) {
      // Assign user fields to token
      if (user) {
        token.id = user.id;
        token.role = user.role;
        // If user has no name then use the email
        if (user.name === 'NO_NAME') {
          token.name = user.email!.split('@')[0];
          
          // Update database to reflect the token name only when needed
          try {
            await prisma.user.update({
              where: { id: token.sub },
              data: { name: token.name }
            });
          } catch (error) {
            console.error('Failed to update user name:', error);
            // Don't break the auth flow even if DB update fails
          }
        }
      }

      if ((trigger === 'signIn' || trigger === 'signUp') && user) {
        try {
          const cookiesObject = await cookies();
          const sessionCartId = cookiesObject.get('sessionCartId')?.value;
          
          console.log('Cart migration: sessionCartId =', sessionCartId);
          console.log('Cart migration: user.id =', user.id);
          
          if (sessionCartId && user.id) {
            const sessionCart = await prisma.cart.findFirst({
              where: { sessionCartId }
            });
            
            console.log('Cart migration: found sessionCart =', !!sessionCart);
            
            if (sessionCart) {
              // Delete current user cart if exists
              await prisma.cart.deleteMany({
                where: { userId: user.id },
              });
              
              // Assign session cart to user
              await prisma.cart.update({
                where: { id: sessionCart.id },
                data: { userId: user.id },
              });
              
              // Revalidate cart page to show updated data
              revalidatePath('/cart');
              
              console.log('Cart migration: successfully migrated cart');
            }
          }
        } catch (error) {
          console.error('Failed to handle cart during sign in:', error);
          // Don't break the auth flow even if cart handling fails
        }
      }

      // Handle session updates
      if (session?.user.name && trigger === 'update') {
        token.name = session.user.name;
      }
      
      return token;
    },
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);
