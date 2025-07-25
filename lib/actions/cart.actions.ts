'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { CartItem } from '@/types';
import { convertToPlainObject, formatError, round2 } from '../utils';
import { auth } from '@/auth';
import { prisma } from '@/db/prisma';
import { Prisma } from '@prisma/client';
// import { insertCartSchema } from '../validators';

// Calculate cart prices
const calcPrice = (items: CartItem[]) => {
  const itemsPrice = round2(
    items.reduce((acc, item) => acc + Number(item.price) * item.qty, 0)
  );
  const shippingPrice = round2(items.length === 0 ? 0 : (itemsPrice > 100 ? 0 : 10));
  const taxPrice = round2(0.15 * itemsPrice);
  const totalPrice = round2(itemsPrice + taxPrice + shippingPrice);

  return {
    itemsPrice: itemsPrice.toFixed(2),
    shippingPrice: shippingPrice.toFixed(2), 
    taxPrice: taxPrice.toFixed(2),
    totalPrice: totalPrice.toFixed(2),
  };
};

export async function addItemToCart(data: CartItem) {
  try {
    const cookieStore = await cookies();
    let sessionCartId = cookieStore.get('sessionCartId')?.value;
    
    if (!sessionCartId) {
      sessionCartId = crypto.randomUUID();
      cookieStore.set('sessionCartId', sessionCartId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 30 // 30 days
      });
    }

    // Get session and user ID
    const session = await auth();
    const userId = session?.user?.id ? (session.user.id as string) : undefined;

    // Parse and validate item
    const item = data; 

    // Find product in database 
    const product = await prisma.product.findFirst({
      where: { id: item.productId }
    });

    if (!product) throw new Error('Product not found');

    // Find existing cart
    const cart = await prisma.cart.findFirst({
      where: userId ? { userId: userId } : { sessionCartId: sessionCartId }
    });

    if (!cart) {
      // Create new cart object
      // const newCart = insertCartSchema.parse({
      const newCart = {
        userId: userId,
        items: [item],
        sessionCartId: sessionCartId,
        ...calcPrice([item])
      };

      await prisma.cart.create({
        data: newCart
      });

      // Revalidate product page
      revalidatePath(`/product/${product!.slug}`);

      return {
        success: true,
        message: 'Item added to cart',
      };
    } else {
      // Check if item is already in cart
      const existItem = (cart.items as CartItem[]).find((x) => x.productId === item.productId);
      
      if (existItem) {
        // Check stock
        if (product!.stock < existItem.qty + 1) {
          throw new Error('Not enough stock');
        }
        
        // Increase the quantity
        (cart.items as CartItem[]).find((x) => x.productId === item.productId)!.qty = existItem.qty + 1;
      } else {
        // If item does not exist in cart
        // Check stock
        if (product!.stock < 1) throw new Error('Not enough stock');
        
        // Add item to the cart.items
        cart.items.push(item);
      }
      
      // Save to database
      await prisma.cart.update({
        where: { id: cart.id },
        data: {
          items: cart.items as Prisma.CartUpdateitemsInput[],
          ...calcPrice(cart.items as CartItem[])
        }
      });
      
      revalidatePath(`/product/${product!.slug}`);
      
      return {
        success: true,
        message: `${product!.name} ${existItem ? 'updated in' : 'added to'} cart`
      };
    }
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

export async function getMyCart() {
  // Check for cart cookie
  const sessionCartId = (await cookies()).get('sessionCartId')?.value;
  if (!sessionCartId) return undefined;

  // Get session and user ID
  const session = await auth();
  const userId = session?.user?.id ? (session.user.id as string) : undefined;

  // Get user cart from database
  const cart = await prisma.cart.findFirst({
    where: userId ? { userId: userId } : { sessionCartId: sessionCartId }
  });

  if (!cart) return undefined;

  // Convert decimals and return
  return convertToPlainObject({
    ...cart,
    items: cart.items as CartItem[],
    itemsPrice: cart.itemsPrice.toString(),
    totalPrice: cart.totalPrice.toString(),
    shippingPrice: cart.shippingPrice.toString(),
    taxPrice: cart.taxPrice.toString(),
  });
}

export async function removeItemFromCart(productId: string) {
  try {
    // Check for cart cookie
    const sessionCartId = (await cookies()).get('sessionCartId')?.value;
    if (!sessionCartId) throw new Error('Cart session not found');

    // Get Product
    const product = await prisma.product.findFirst({
      where: { id: productId }
    });
    if (!product) throw new Error('Product not found');

    // Get user cart
    const cart = await getMyCart();
    if (!cart) throw new Error('Cart not found');

    // Check for item
    const exist = (cart.items as CartItem[]).find((x) => x.productId === productId);
    if (!exist) throw new Error('Item not found');

    // Check if only one in qty
    if (exist.qty === 1) {
      // Remove from cart
      cart.items = (cart.items as CartItem[]).filter((x) => x.productId !== exist.productId);
    } else {
      // Decrease qty
      (cart.items as CartItem[]).find((x) => x.productId === productId)!.qty = exist.qty - 1;
    }

    // Update cart in database
    await prisma.cart.update({
      where: { id: cart.id },
      data: {
        items: cart.items as Prisma.CartUpdateitemsInput[],
        ...calcPrice(cart.items as CartItem[]),
      }
    });

    revalidatePath(`/product/${product!.slug}`);

    return {
      success: true,
      message: `${product!.name} was removed from cart`,
    };
    
  } catch (error) {
    return { success: false, message: formatError(error) };
  } 
}