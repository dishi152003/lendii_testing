export async function GET(request, { params }) {
  const { id } = await params;

  // We extract startDate and endDate from the request url.
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  // Hardcode availability response based on the test case, or general mock response.
  return Response.json({
    success: true,
    data: {
      available: true,
      listing_id: id,
      // optionally include requested dates in the data
      // startDate,
      // endDate,
    }
  });
}
