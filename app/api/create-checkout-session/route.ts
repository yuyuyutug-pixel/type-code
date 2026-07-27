import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json(
      { error: '決済設定がまだ完了していません。' },
      { status: 503 },
    );
  }

  const stripe = new Stripe(secretKey);
  const origin = new URL(request.url).origin;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      locale: 'ja',
      payment_method_types: ['card'],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'jpy',
            unit_amount: 200,
            product_data: {
              name: 'TYPE CODE 詳細分析パス',
              description: '64タイプの詳細分析・相性TOP3・根拠を買い切りで閲覧',
            },
          },
        },
      ],
      success_url: `${origin}/?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?payment=cancelled`,
      metadata: {
        product: 'type-code-premium',
        version: '1',
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout session error', error);
    return NextResponse.json(
      { error: '決済ページを開始できませんでした。' },
      { status: 500 },
    );
  }
}
