export async function PATCH(req, { params }) {
  try {
    const { id } = params;
    const body = await req.json();

    return Response.json({
      success: true,
      data: {
        id,
        ...body,
        updated_at: new Date().toISOString()
      }
    }, { status: 200 });
  } catch (error) {
    return Response.json({ success: false, error: "Invalid request body" }, { status: 400 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = params;

    return Response.json({
      success: true,
      message: "Listing deleted successfully"
    }, { status: 200 });
  } catch (error) {
    return Response.json({ success: false, error: "Failed to delete listing" }, { status: 500 });
  }
}
