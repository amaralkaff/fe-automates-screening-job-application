'use client';

import { useState } from 'react';
import { Card } from '@/components/retroui/Card';
import { Button } from '@/components/retroui/Button';
import { Input } from '@/components/retroui/Input';
import { Label } from '@/components/retroui/Label';
import { Alert } from '@/components/retroui/Alert';
import { Eye, EyeOff, Mail, Lock, User, RefreshCw } from 'lucide-react';
import { SignUpRequest } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { ApiDebugger } from '@/lib/debug';

interface SignupFormProps {
  onToggleMode: () => void;
}

export default function SignupForm({ onToggleMode }: SignupFormProps) {
  const { signUp } = useAuth();
  const [formData, setFormData] = useState<SignUpRequest>({
    email: '',
    password: '',
    name: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDebugMode, setIsDebugMode] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'failed' | 'unknown'>('unknown');

  const checkConnection = async () => {
    // Use relative URL for production, absolute for local development
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:8000' : '');
    setConnectionStatus('checking');

    const result = await ApiDebugger.testConnectivity(apiUrl);
    setConnectionStatus(result.success ? 'connected' : 'failed');

    if (!result.success) {
      console.error('API Connection Failed:', result.error);
    }

    return result.success;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // For production APIs, skip connectivity check to avoid CORS issues
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:8000' : '');
      const isProductionApi = !apiUrl.includes('localhost');
      
      if (!isProductionApi) {
        const isConnected = await checkConnection();
        if (!isConnected) {
          setError('Cannot connect to the server. Please check your internet connection or try again later.');
          return;
        }
      }

      await signUp(formData);
    } catch (error: unknown) {
      let errorMessage = 'Failed to create account. Please try again.';

      if (error instanceof Error) {
        errorMessage = error.message;

        // Provide specific guidance for network errors
        if (error.message.includes('Network error') || error.message.includes('Unable to connect')) {
          errorMessage += ' Please check your internet connection and ensure the server is running.';
        }
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <Card className="w-full">
      <Card.Header>
        <div className="text-center space-y-2">
          <Card.Title className="text-xl">Create Account</Card.Title>
          <p className="text-muted-foreground">Join the Job Application Analyzer</p>
        </div>
      </Card.Header>
      <Card.Content>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert status="error">
              {error}
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                disabled={isLoading}
                className="pl-10"
                required
                minLength={2}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a password (min 6 characters)"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
                className="pl-10 pr-10"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full text-center"
            disabled={isLoading || !formData.email || !formData.password || !formData.name}
            size="lg"
          >
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </Button>

          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <button
                type="button"
                onClick={onToggleMode}
                className="text-primary hover:underline font-bold hover:text-primary-hover focus:outline-none focus:ring-2 focus:ring-primary/50"
                disabled={isLoading}
              >
                Sign in here
              </button>
            </p>

            {/* Debug Mode Toggle */}
            <button
              type="button"
              onClick={() => setIsDebugMode(!isDebugMode)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              {isDebugMode ? 'Hide' : 'Show'} Debug Info
            </button>
          </div>

          {/* Debug Information */}
          {isDebugMode && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg text-xs">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Connection Status:</span>
                  <div className="flex items-center gap-2">
                    {connectionStatus === 'checking' && <RefreshCw className="h-3 w-3 animate-spin" />}
                    <span className={
                      connectionStatus === 'connected' ? 'text-green-600' :
                      connectionStatus === 'failed' ? 'text-red-600' : 'text-muted-foreground'
                    }>
                      {connectionStatus}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="font-semibold">API URL:</span> {process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:8000' : 'https://amangly.web.id')}
                </div>
                <button
                  type="button"
                  onClick={() => checkConnection()}
                  className="w-full bg-primary/10 hover:bg-primary/20 text-primary px-2 py-1 rounded text-xs"
                  disabled={connectionStatus === 'checking'}
                >
                  Test Connection
                </button>
              </div>
            </div>
          )}
        </form>
      </Card.Content>
    </Card>
  );
}