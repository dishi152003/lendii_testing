import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const session_id = searchParams.get('session_id');
  const listing_id = searchParams.get('listing_id');
  const start = searchParams.get('start') || '';
  const end = searchParams.get('end') || '';

  if (!session_id) {
    return NextResponse.json({ success: false, error: "Missing session ID" }, { status: 400 });
  }

  // NOTE: Here you could update your database to mark the order or cart intent as CANCELED.

  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const redirectPath = listing_id 
      ? `/checkout/${listing_id}/payment?start=${start}&end=${end}` 
      : `/order-confirmation?start=${start}&status=failed`;

  const redirectUrl = new URL(redirectPath, baseUrl);

  return NextResponse.redirect(redirectUrl);
}
