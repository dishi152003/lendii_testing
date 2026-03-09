import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const session_id = searchParams.get('session_id');
  const start = searchParams.get('start') || '';

  if (!session_id) {
    return NextResponse.json({ success: false, error: "Missing session ID" }, { status: 400 });
  }

  // NOTE: In a production environment, you would retrieve the full session from Stripe
  // using `stripe.checkout.sessions.retrieve(session_id)` to verify payment status,
  // and then update your database to mark the order as "PAID" before redirecting.
  
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const redirectUrl = new URL(`/order-confirmation?start=${start}&status=success&session_id=${session_id}`, baseUrl);

  return NextResponse.redirect(redirectUrl);
}
