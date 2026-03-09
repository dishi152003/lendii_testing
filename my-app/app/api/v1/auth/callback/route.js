export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (token === "11934387-05ac-4896-8ccf-87379ca0f85c") {
    return Response.json({
      success: true,
      access_token: "9b1e3a36-ddd6-45ac-aaa2-45d1283cb13f",
      user: {
        id: "22bbd249-a933-48f0-9a74-8a686e6f568a",
        email: "admin@lendii.test",
        role: "admin",
        created_at: "2026-02-07T06:08:55.063907+00:00",
        updated_at: "2026-02-07T06:08:55.063907+00:00"
      }
    });
  }

  return Response.json({ success: false, error: "Invalid token" }, { status: 400 });
}
