import Stripe from 'stripe';

const apiVersion: Stripe.LatestApiVersion = '2024-06-20';

export const getStripeClient = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY is not set. Add it to your environment to enable payments.');
  }

  return new Stripe(secretKey, { apiVersion });
};
