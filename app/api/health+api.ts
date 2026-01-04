export async function GET() {
  return Response.json({
    status: 'success',
    message: 'API is healthy',
    data: {
      timestamp: new Date().toISOString(),
      environment: process.env.EXPO_PUBLIC_APP_ENV || 'development',
    },
  });
}
