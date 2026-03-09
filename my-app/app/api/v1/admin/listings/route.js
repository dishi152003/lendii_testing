export async function POST(req) {
  try {
    const body = await req.json();
    return Response.json({
      success: true,
      data: {
        id: "new-listing-" + Date.now().toString(),
        title: body.title || "New listing",
        description: body.description || "",
        category: body.category || "dresses",
        size: body.size || "M",
        brand: body.brand || "Lendii",
        condition: body.condition || "new",
        rental_price: body.rental_price || 0,
        retail_price: body.retail_price || 0,
        deposit: body.deposit || 0,
        images: body.images || [],
        status: "draft",
        is_available: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    }, { status: 201 });
  } catch (error) {
    return Response.json({ success: false, error: "Invalid request body" }, { status: 400 });
  }
}
