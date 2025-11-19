import Stripe from 'stripe';

const apiVersion: Stripe.LatestApiVersion = '2023-10-16';

export const getStripeClient = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY is not set. Add it to your environment to enable payments.');
  }

  return new Stripe(secretKey, { apiVersion });
};
