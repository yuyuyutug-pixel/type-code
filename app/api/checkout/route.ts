import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json(
      { error: '決済設定がまだ完了していません。' },
      { status: 503 },
    );
  }

  try {
    const stripe = new Stripe(secretKey);
    const origin = request.nextUrl.origin;
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'jpy',
            unit_amount: 200,
            product_data: {
              name: 'TYPE CODE 詳細分析レポート',
              description: '診断結果の詳細6軸分析・強み・注意点・恋愛・仕事・相性TOP3を買い切りで閲覧',
            },
          },
        },
      ],
      success_url: `${origin}/?purchase=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?purchase=cancelled`,
      metadata: {
        product: 'type-code-premium-report',
      },
      allow_promotion_codes: false,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error', error);
    return NextResponse.json(
      { error: '決済ページを作成できませんでした。時間をおいて再度お試しください。' },
      { status: 500 },
    );
  }
}
