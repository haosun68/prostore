'use server';

import { signInFormSchema } from "../validators";
import { signIn, signOut } from "@/auth";
// import { isRedirectError } from "next/dist/client/components/redirect"; // Next.js 15 没有 isRedirectError，如需判断重定向错误可用 getRedirectError

// Sign in the user with credentials
export async function signInWithCredentials(prevState: unknown, formData: FormData) {
  try {
    const user = signInFormSchema.parse({
      email: formData.get('email'),
      password: formData.get('password')
    });
    await signIn('credentials', user);
    return { success: true, message: 'Signed in successfully' };
  } catch {
    // if (isRedirectError(error)) {
    //   throw error;
    // }
    return { success: false, message: 'Invalid email or password' };
  }
}

// Sign user out
export async function signOutUser() {
  await signOut();
} 