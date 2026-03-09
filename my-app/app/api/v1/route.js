export async function GET() {
  return Response.json({
    success: true,
    message: "Welcome to Lendii API v1",
    documentation: "/docs" // placeholder
  });
}
