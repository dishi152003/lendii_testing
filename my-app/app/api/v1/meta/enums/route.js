export async function GET() {
  return Response.json({
    listingStatuses: [
      "draft",
      "published",
      "rented",
      "archived"
    ],
    categories: [
      "dresses",
      "tops",
      "bottoms",
      "outerwear",
      "accessories",
      "shoes"
    ],
    sizes: [
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "XXL"
    ],
    conditions: [
      "new",
      "excellent",
      "good",
      "fair"
    ],
    orderStatuses: [
      "pending",
      "confirmed",
      "shipped",
      "delivered",
      "returned",
      "completed",
      "cancelled",
      "refunded"
    ],
    paymentStatuses: [
      "pending",
      "completed",
      "failed",
      "refunded"
    ],
    userRoles: [
      "admin",
      "borrower"
    ]
  });
}
