import { getMockOrders } from '@/lib/mockOrders';

export async function PATCH(request, { params }) {
  const { id } = await params;
  const mockOrders = getMockOrders();
  const orderIndex = mockOrders.findIndex(o => o.id === id);

  if (orderIndex === -1) {
    return Response.json({ success: false, error: "Order not found" }, { status: 404 });
  }

  // Update status to shipped
  mockOrders[orderIndex].status = "shipped";

  return Response.json({
    success: true,
    data: mockOrders[orderIndex]
  });
}
