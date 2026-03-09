import { getMockOrders } from '@/lib/mockOrders';

export async function GET(request, { params }) {
  const { id } = await params;
  
  const mockOrders = getMockOrders();
  let order = mockOrders.find(o => o.id === id);

  // If not found, just return the first one as a fallback for the mock
  if (!order) {
    order = mockOrders[0];
  }

  return Response.json({
    success: true,
    data: order
  });
}
