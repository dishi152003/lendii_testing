export async function GET(request) {
  const authHeader = request.headers.get("authorization");

  if (authHeader === "Bearer 9b1e3a36-ddd6-45ac-aaa2-45d1283cb13f") {
    return Response.json({
      success: true,
      user: {
        id: "22bbd249-a933-48f0-9a74-8a686e6f568a",
        role: "admin",
        email: "admin@lendii.test",
        created_at: "2026-02-07T06:08:55.063907+00:00",
        updated_at: "2026-02-07T06:08:55.063907+00:00"
      }
    });
  }

  return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
}
