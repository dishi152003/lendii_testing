import { getMockOrders } from '@/lib/mockOrders';

export async function GET(request) {
  const allOrders = getMockOrders();
  
  return Response.json({
    success: true,
    count: allOrders.length,
    data: allOrders
  });
}

