export async function POST(request) {
  // Normally you would use stripe.webhooks.constructEvent
  return Response.json({
    success: true,
    message: "Stripe webhook received"
  }, { status: 200 });
}
