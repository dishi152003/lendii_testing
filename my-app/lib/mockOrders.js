let mockOrders = global.mockOrders;

if (!mockOrders) {
  mockOrders = [
    {
      id: "ord-883a1b2c",
      created_at: new Date().toISOString(),
      start_date: new Date(Date.now() + 86400000).toISOString(),
      end_date: new Date(Date.now() + 86400000 * 4).toISOString(),
      total_amount: 120,
      status: "paid",
      listings: {
        title: "Red Silk Evening Dress",
        category: "Womenswear",
        size: "4",
        image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800"
      },
      users: {
        email: "anna@example.com"
      }
    },
    {
      id: "ord-9b4c2d3e",
      created_at: new Date(Date.now() - 86400000).toISOString(),
      start_date: new Date(Date.now() + 86400000 * 2).toISOString(),
      end_date: new Date(Date.now() + 86400000 * 5).toISOString(),
      total_amount: 85,
      status: "shipped",
      listings: {
        title: "Vintage Denim Jacket",
        category: "Outerwear",
        size: "M",
        image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800"
      },
      users: {
        email: "john_doe@example.com"
      }
    },
    {
      id: "ord-2f8d1c4b",
      created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
      start_date: new Date(Date.now() - 86400000 * 2).toISOString(),
      end_date: new Date(Date.now() + 86400000 * 1).toISOString(),
      total_amount: 200,
      status: "delivered",
      listings: {
        title: "Designer Leather Bag",
        category: "Accessories",
        size: "OS",
        image: "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=800"
      },
      users: {
        email: "sarah_kim@example.com"
      }
    }
  ];
  global.mockOrders = mockOrders;
}

export function getMockOrders() {
  return global.mockOrders;
}

export function addMockOrder(order) {
  global.mockOrders.unshift(order);
}
