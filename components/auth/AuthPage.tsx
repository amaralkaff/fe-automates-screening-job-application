'use client';

import { useState } from 'react';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import { PageTransition } from '@/components/ui/PageTransition';

type AuthMode = 'login' | 'signup';

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('login');

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="text-center space-y-4 mb-8">
          <div className="flex items-center justify-center space-x-3">
            <h1 className="text-3xl font-bold">Job Application Analyzer</h1>
          </div>
        </div>

        {/* Auth Forms with transitions */}
        <div className="flex justify-center w-full max-w-lg mx-auto">
          <PageTransition key={mode} className="w-full">
            {mode === 'login' ? (
              <LoginForm onToggleMode={toggleMode} />
            ) : (
              <SignupForm onToggleMode={toggleMode} />
            )}
          </PageTransition>
        </div>
      </div>
    </div>
  );
}