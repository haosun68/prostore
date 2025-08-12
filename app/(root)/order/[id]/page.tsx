import { Metadata } from 'next';
import { auth } from '@/auth';
import { getOrderById } from '@/lib/actions/order.actions';
import { notFound } from 'next/navigation';
import { ShippingAddress } from '@/types';
import OrderDetailsTable from './order-details-table';
import Stripe from 'stripe';

export const metadata: Metadata = {
  title: 'Order Details',
};

const OrderDetailsPage = async (props: {
  params: Promise<{
    id: string;
  }>;
}) => {
  const { id } = await props.params;

  const order = await getOrderById(id);
  if (!order) notFound();

  const session = await auth();

  let client_secret = null;

  // Check if is not paid and using stripe
  if (order.paymentMethod === 'Stripe' && !order.isPaid) {
    // Check if Stripe secret key is available
    if (!process.env.STRIPE_SECRET_KEY) {
      console.warn('STRIPE_SECRET_KEY is not set, skipping Stripe payment intent creation');
    } else {
      // Init stripe instance
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(Number(order.totalPrice) * 100),
        currency: 'USD',
        metadata: { orderId: order.id }
      });
      client_secret = paymentIntent.client_secret;
    }
  }

  return (
    <OrderDetailsTable
      order={{
        ...order,
        shippingAddress: order.shippingAddress as ShippingAddress,
      }}
      stripeClientSecret={client_secret}
      paypalClientId={process.env.PAYPAL_CLIENT_ID || 'sb'}
      isAdmin={session?.user?.role === 'admin'}
    />
  );
};

export default OrderDetailsPage;
