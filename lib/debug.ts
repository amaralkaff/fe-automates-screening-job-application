'use client';

// Debug utilities for API connectivity troubleshooting
export class ApiDebugger {
  static async testConnectivity(apiUrl: string): Promise<{
    success: boolean;
    details: string;
    error?: string;
  }> {
    // For production HTTPS URLs, do a simpler check that avoids CORS issues
    if (apiUrl.includes('https://') && !apiUrl.includes('localhost')) {
      console.log('🔍 Testing connectivity to production API (CORS-safe mode):', apiUrl);

      try {
        // Test with a simple auth request instead of health check
        const testResponse = await fetch(`${apiUrl}/auth/sign-in`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'test@example.com', password: 'test' }),
          signal: AbortSignal.timeout(10000),
          mode: 'cors',
          credentials: 'omit'
        });

        // Any response (even 401) means the server is reachable
        return {
          success: true,
          details: `Server reachable (${testResponse.status}: ${testResponse.statusText})`
        };
      } catch (error) {
        return {
          success: false,
          details: 'Connection failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
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

Troubleshooting Steps:
1. Check if the API server is running: ${apiUrl}
2. Verify CORS configuration allows requests from your domain
3. Check network connection and firewall settings
4. Ensure SSL certificate is valid (for HTTPS URLs)
5. Try accessing the API directly in a browser

Common Solutions:
- Development: Use local server (npm run dev:api or yarn dev:api)
- Production: Verify server deployment and CORS settings
- Testing: Check if API endpoint URLs are correct
`;
  }

  static logConnectionDetails(apiUrl: string): void {
    console.log(this.generateConnectionReport(apiUrl));
  }
}