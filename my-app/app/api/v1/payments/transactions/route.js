export async function GET(request) {
  return Response.json({
    success: true,
    data: [
      {
        id: "txn_1Qabcdef",
        amount: 120,
        currency: "gbp",
        status: "succeeded",
        created: new Date().toISOString()
      },
      {
        id: "txn_1Qxyzabc",
        amount: 85,
        currency: "gbp",
        status: "succeeded",
        created: new Date(Date.now() - 86400000).toISOString()
      }
    ]
  });
}
