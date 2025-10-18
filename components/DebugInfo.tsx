'use client';

import { useEffect, useState } from 'react';

export function DebugInfo() {
  const [apiUrl, setApiUrl] = useState('');
  const [envInfo, setEnvInfo] = useState<Record<string, string>>({});
  const [testResult, setTestResult] = useState<string>('');

  useEffect(() => {
    // Only run in development or if explicitly enabled
    if (process.env.NODE_ENV === 'development' || localStorage.getItem('debug') === 'true') {
      setApiUrl(process.env.NEXT_PUBLIC_API_URL || 'Not set');

      setEnvInfo({
        'NODE_ENV': process.env.NODE_ENV || 'unknown',
        'NEXT_PUBLIC_API_URL': process.env.NEXT_PUBLIC_API_URL || 'Not set',
        'Origin': window.location.origin,
        'Host': window.location.host,
      });
    }
  }, []);

  const testApiConnection = async () => {
    setTestResult('Testing...');
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/sign-up`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: 'test@example.com', password: 'test123' }),
      });
      setTestResult(`✅ Success: ${response.status} ${response.statusText}`);
    } catch (error: any) {
      setTestResult(`❌ Error: ${error.message}`);
    }
  };

  // Don't render in production unless debug mode is enabled
  if (process.env.NODE_ENV === 'production' && localStorage.getItem('debug') !== 'true') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h4 className="font-bold mb-2">Debug Info</h4>
      <div className="space-y-1 mb-3">
        <div><strong>API URL:</strong> {apiUrl}</div>
        {Object.entries(envInfo).map(([key, value]) => (
          <div key={key}><strong>{key}:</strong> {value}</div>
        ))}
      </div>

      <div className="border-t border-gray-600 pt-2 mb-2">
        <button
          onClick={testApiConnection}
          className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded mb-2 w-full"
        >
          Test API Connection
        </button>
        {testResult && (
          <div className="text-xs">{testResult}</div>
        )}
      </div>

      <div className="flex space-x-2">
        <button
          onClick={() => localStorage.removeItem('debug')}
          className="text-xs bg-red-600 px-2 py-1 rounded"
        >
          Hide Debug
        </button>
        <button
          onClick={() => window.location.reload()}
          className="text-xs bg-gray-600 px-2 py-1 rounded"
        >
          Reload
        </button>
      </div>
    </div>
  );
}