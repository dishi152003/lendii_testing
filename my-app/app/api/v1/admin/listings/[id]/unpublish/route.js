export async function POST(req, { params }) {
  try {
    const { id } = params;

    return Response.json({
      success: true,
      data: {
        id,
        status: "draft",
        updated_at: new Date().toISOString()
      }
    }, { status: 200 });
  } catch (error) {
    return Response.json({ success: false, error: "Failed to unpublish listing" }, { status: 500 });
  }
}
