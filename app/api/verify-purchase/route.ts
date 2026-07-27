import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const sessionId = request.nextUrl.searchParams.get('session_id');

  if (!secretKey || !sessionId) {
    return NextResponse.json({ unlocked: false }, { status: 400 });
  }

  try {
    const stripe = new Stripe(secretKey);
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const valid =
      session.payment_status === 'paid' &&
      session.amount_total === 200 &&
      session.currency === 'jpy' &&
      session.metadata?.product === 'type-code-premium-report';

    return NextResponse.json({
      unlocked: valid,
      receiptEmail: valid ? session.customer_details?.email ?? null : null,
    });
  } catch (error) {
    console.error('Stripe verification error', error);
    return NextResponse.json({ unlocked: false }, { status: 400 });
  }
}
