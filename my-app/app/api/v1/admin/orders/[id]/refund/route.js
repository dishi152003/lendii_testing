import { getMockOrders } from '@/lib/mockOrders';

export async function POST(request, { params }) {
  const { id } = await params;
  const mockOrders = getMockOrders();
  const orderIndex = mockOrders.findIndex(o => o.id === id);

  if (orderIndex === -1) {
    return Response.json({ success: false, error: "Order not found" }, { status: 404 });
  }

  // Set status as refunded
  mockOrders[orderIndex].status = "refunded";

  return Response.json({
    success: true,
    message: "Refund processed successfully",
    data: mockOrders[orderIndex]
  });
}
