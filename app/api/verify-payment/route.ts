import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json({ unlocked: false, error: '決済設定が未完了です。' }, { status: 503 });
  }

  try {
    const { sessionId } = (await request.json()) as { sessionId?: string };
    if (!sessionId || !sessionId.startsWith('cs_')) {
      return NextResponse.json({ unlocked: false }, { status: 400 });
    }

    const stripe = new Stripe(secretKey);
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const valid =
      session.payment_status === 'paid' &&
      session.amount_total === 200 &&
      session.currency === 'jpy' &&
      session.metadata?.product === 'type-code-premium';

    return NextResponse.json({ unlocked: valid });
  } catch (error) {
    console.error('Stripe verification error', error);
    return NextResponse.json({ unlocked: false }, { status: 400 });
  }
}
