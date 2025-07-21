export async function GET() {
  return new Response(
    JSON.stringify({
      MONGODB_URI: process.env.MONGODB_URI || "❌ Not defined",
    }),
    {
      headers: { "Content-Type": "application/json" },
      status: 200,
    }
  );
}
