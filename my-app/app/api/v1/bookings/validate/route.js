export async function POST(req) {
  try {
    const body = await req.json();

    if (!body.listing_id || !body.start_date || !body.end_date) {
      return Response.json({ success: false, error: "Missing required booking fields" }, { status: 400 });
    }

    // Default catch-all dynamic mock response
    return Response.json({
      success: true,
      message: "Booking dates are valid",
      data: {
        valid: true,
        available: true,
        listing_id: body.listing_id,
        start_date: body.start_date,
        end_date: body.end_date
      }
    });

  } catch (error) {
    return Response.json({ success: false, error: "Invalid booking request" }, { status: 400 });
  }
}
