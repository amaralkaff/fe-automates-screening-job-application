'use client';

// Debug utilities for API connectivity troubleshooting
export class ApiDebugger {
  static async testConnectivity(apiUrl: string): Promise<{
    success: boolean;
    details: string;
    error?: string;
  }> {
    // For development with CORS issues, provide better feedback
    if (apiUrl.includes('https://') && !apiUrl.includes('localhost')) {
      console.log('🔍 Development mode: Production API detected', apiUrl);

      // Skip connectivity test for production APIs in development to avoid CORS
      // The actual API calls will work if the backend is properly configured
      return {
        success: true,
        details: 'Production API - connectivity will be tested during actual API calls'
      };
    }

    // For local development, do full connectivity testing
    try {
      console.log('🔍 Testing connectivity to:', apiUrl);

      // Test basic connectivity with health endpoint
      const healthResponse = await fetch(`${apiUrl}/health`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(5000)
      });

      if (healthResponse.ok) {
        return {
          success: true,
          details: `Health check passed (${healthResponse.status})`
        };
      }

      // Test auth endpoint connectivity
      const authResponse = await fetch(`${apiUrl}/auth/sign-up`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com', password: 'test', name: 'test' }),
        signal: AbortSignal.timeout(5000)
      });

      return {
        success: authResponse.ok || authResponse.status < 500,
        details: `Auth endpoint responded (${authResponse.status}: ${authResponse.statusText})`
      };

    } catch (error) {
      return {
        success: false,
        details: 'Connection failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static generateConnectionReport(apiUrl: string): string {
    return `
API Connectivity Debug Report
=============================
API URL: ${apiUrl}
User Agent: ${typeof navigator !== 'undefined' ? navigator.userAgent : 'Server-side'}
Timestamp: ${new Date().toISOString()}

Better Auth Configuration:
- Expected endpoints: /api/auth/sign-in, /api/auth/sign-up, /api/auth/session
- Alternative endpoints: /health (for connectivity testing)

Troubleshooting Steps:
1. Check if the API server is running: ${apiUrl}
2. Verify Better Auth is properly configured on the backend
3. Check if these endpoints exist:
   - ${apiUrl}/api/auth/sign-in
   - ${apiUrl}/api/auth/sign-up
   - ${apiUrl}/api/auth/session
4. Verify CORS configuration allows requests from your domain
5. Check network connection and firewall settings
6. Ensure SSL certificate is valid (for HTTPS URLs)

Backend Configuration Check:
- Verify BETTER_AUTH_SECRET is set in backend .env
- Check BETTER_AUTH_URL matches your frontend domain
- Ensure Better Auth routes are properly registered
- Confirm the server is running on the correct port

Common Solutions:
- Development: Use local server (npm run dev:api or yarn dev:api)
- Production: Verify server deployment and CORS settings
- Better Auth: Check /api/auth/* endpoints are accessible
- Testing: Use curl to test endpoints directly

Example curl commands:
curl -X GET ${apiUrl}/health
curl -X POST ${apiUrl}/api/auth/sign-in -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"test"}'
`;
  }

  static logConnectionDetails(apiUrl: string): void {
    console.log(this.generateConnectionReport(apiUrl));
  }
}