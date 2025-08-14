import { Resend } from 'resend';
import { SENDER_EMAIL, APP_NAME } from '@/lib/constants';
import { Order } from '@/types';
import dotenv from 'dotenv';
dotenv.config();

import PurchaseReceiptEmail from './purchase-receipt';

export const sendPurchaseReceipt = async ({ order }: { order: Order }) => {
  // Initialize Resend client only when needed
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY is not set, skipping email sending');
    return;
  }
  
  const resend = new Resend(process.env.RESEND_API_KEY);
  
  await resend.emails.send({
    from: `${APP_NAME} <${SENDER_EMAIL}>`,
    to: order.user.email,
    subject: `Order Confirmation ${order.id}`,
    react: <PurchaseReceiptEmail order={order} />,
  });
};