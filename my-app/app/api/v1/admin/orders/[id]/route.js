import { getMockOrders } from '@/lib/mockOrders';

export async function GET(request, { params }) {
  const { id } = await params;
  const mockOrders = getMockOrders();
  const order = mockOrders.find(o => o.id === id);

  if (!order) {
    return Response.json({ success: false, error: "Order not found" }, { status: 404 });
  }

  return Response.json({
    success: true,
    data: order
  });
}
