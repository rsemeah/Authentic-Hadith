import { NextRequest, NextResponse } from 'next/server';
import { getStripeClient } from '@/lib/stripe';

const successPath = '/paywall?state=success';
const cancelPath = '/paywall?state=cancel';

type CheckoutBody = {
  priceId?: string;
  customerEmail?: string;
  successUrl?: string;
  cancelUrl?: string;
  allowPromotionCodes?: boolean;
};

export async function POST(request: NextRequest) {
  let body: CheckoutBody;

  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  if (!body.priceId) {
    return NextResponse.json({ error: 'Missing priceId for checkout.' }, { status: 400 });
  }

  const origin = request.headers.get('origin') ?? process.env.APP_URL ?? 'http://localhost:3000';
  const successUrl = body.successUrl ?? `${origin}${successPath}`;
  const cancelUrl = body.cancelUrl ?? `${origin}${cancelPath}`;

  try {
    const stripe = getStripeClient();

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: body.allowPromotionCodes ?? true,
      customer_email: body.customerEmail,
      line_items: [{ price: body.priceId, quantity: 1 }],
    });

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error('Failed to create Stripe Checkout session', error);
    return NextResponse.json({ error: 'Unable to start checkout. Please try again shortly.' }, { status: 500 });
  }
}
