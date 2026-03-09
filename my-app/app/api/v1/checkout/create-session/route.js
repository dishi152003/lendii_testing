import Stripe from 'stripe';

export async function POST(req) {
  // Initialize Stripe inside the handler to ensure it picks up the latest runtime .env values
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2023-10-16',
  });
  try {
    const body = await req.json();

    if (!body.listing_id || !body.start_date || !body.end_date) {
      return Response.json({ success: false, error: "Missing required booking fields" }, { status: 400 });
    }

    const { total_amount = 0, listing_id, start_date, end_date } = body;

    // Create a real Stripe Checkout Session
    const origin = req.headers.get('origin') || 'http://localhost:3000';
    
    // We pass a dummy 'sk_test' key if .env is missing, so Stripe might throw an 
    // invalid API key error if not configured. We will wrap the error to warn the user.
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'gbp',
              product_data: {
                name: `Lendii Rental - Listing ${listing_id.substring(0, 8)}`,
                description: `Rental Period: ${new Date(start_date).toLocaleDateString()} to ${new Date(end_date).toLocaleDateString()}`,
              },
              // Stripe requires at least 30p
              unit_amount: Math.max(30, Math.round(total_amount * 100)), 
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${origin}/api/v1/checkout/success?session_id={CHECKOUT_SESSION_ID}&start=${start_date}`,
        cancel_url: `${origin}/api/v1/checkout/cancel?session_id={CHECKOUT_SESSION_ID}&listing_id=${listing_id}&start=${start_date}&end=${end_date}`,
      });

      return Response.json({
        success: true,
        data: {
          session_id: session.id,
          url: session.url
        }
      });
    } catch (stripeError) {
       console.error("Stripe Error Details: ", stripeError.message);
       // If the key is basically the dummy fallback key, we know exactly why it failed.
       if (stripeError.message.includes("Invalid API Key provided")) {
           return Response.json(
               { success: false, error: "Missing valid STRIPE_SECRET_KEY in environment variables. Please add your Stripe Test Key to .env." }, 
               { status: 500 }
           );
       }
       throw stripeError; // Let outer block catch it
    }

  } catch (error) {
    console.error("Checkout Session Error:", error.message);
    return Response.json({ success: false, error: error.message || "Failed to create checkout session" }, { status: 500 });
  }
}
