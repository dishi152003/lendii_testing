import { getMockOrders } from '@/lib/mockOrders';

export async function PATCH(request, { params }) {
  const { id } = await params;
  
  let body;
  try {
    body = await request.json();
  } catch (err) {
    return Response.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const mockOrders = getMockOrders();
  const orderIndex = mockOrders.findIndex(o => o.id === id);

  if (orderIndex === -1) {
    return Response.json({ success: false, error: "Order not found" }, { status: 404 });
  }

  // Update notes
  mockOrders[orderIndex].admin_notes = body.notes || "";

  return Response.json({
    success: true,
    data: mockOrders[orderIndex]
  });
}
