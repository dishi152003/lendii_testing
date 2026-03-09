import { getMockOrders } from '@/lib/mockOrders';

export async function GET(request) {
  const orders = getMockOrders();
  
  const totalRevenue = orders.reduce((acc, order) => {
    return acc + (order.total_amount || 0);
  }, 0);

  return Response.json({
    success: true,
    data: {
      total_orders: orders.length,
      total_revenue: totalRevenue,
      active_listings: 12,
      pending_returns: 4,
      avg_order_value: orders.length ? (totalRevenue / orders.length).toFixed(2) : 0,
      conversion_rate: "5%"
    }
  });
}
