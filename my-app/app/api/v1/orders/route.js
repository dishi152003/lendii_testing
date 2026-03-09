import { getMockOrders, addMockOrder } from '@/lib/mockOrders';

export async function GET(request) {
  // Return current user's mock orders
  return Response.json({
    success: true,
    data: getMockOrders()
  });
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch (err) {
    return Response.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const newOrder = {
    id: `ord-${Math.random().toString(36).substring(2, 10)}`,
    created_at: new Date().toISOString(),
    start_date: body.start_date || new Date().toISOString(),
    end_date: body.end_date || new Date(Date.now() + 86400000).toISOString(),
    total_amount: body.total_amount || 0,
    status: body.status || "paid",
    listings: {
      title: body.listing_title || "New Checked Out Item",
      category: body.listing_category || "Womenswear",
      size: body.listing_size || "M",
      image: body.listing_image || "/product.png"
    },
    users: {
      email: body.user_email || "testuser@example.com"
    }
  };

  addMockOrder(newOrder);

  return Response.json({
    success: true,
    data: newOrder
  }, { status: 201 });
}
