export async function POST(request) {
  const body = await request.json();

  if (body.email === "admin@lendii.test") {
    return Response.json({
      success: true,
      message: "Magic link sent successfully",
      email: "admin@lendii.test",
      token: "11934387-05ac-4896-8ccf-87379ca0f85c"
    });
  }

  return Response.json({ success: true, message: "Magic link sent successfully" });
}
