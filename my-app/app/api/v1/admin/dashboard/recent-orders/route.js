import { getMockOrders } from '@/lib/mockOrders';

export async function GET(request) {
  const orders = getMockOrders();
  
  // Return the top 5 most recent
  return Response.json({
    success: true,
    data: orders.slice(0, 5)
  });
}
