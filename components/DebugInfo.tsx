'use client';

import { useEffect, useState } from 'react';

export function DebugInfo() {
  const [apiUrl, setApiUrl] = useState('');
  const [envInfo, setEnvInfo] = useState<Record<string, string>>({});

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

  // Don't render in production unless debug mode is enabled
  if (process.env.NODE_ENV === 'production' && localStorage.getItem('debug') !== 'true') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h4 className="font-bold mb-2">Debug Info</h4>
      <div className="space-y-1">
        <div><strong>API URL:</strong> {apiUrl}</div>
        {Object.entries(envInfo).map(([key, value]) => (
          <div key={key}><strong>{key}:</strong> {value}</div>
        ))}
      </div>
      <button
        onClick={() => localStorage.removeItem('debug')}
        className="mt-2 text-xs bg-red-600 px-2 py-1 rounded"
      >
        Hide Debug
      </button>
    </div>
  );
}