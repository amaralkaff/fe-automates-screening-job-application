'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/retroui/Button';
import { FileText, LogOut } from 'lucide-react';

interface HeaderProps {
  userName?: string;
  onSignOut: () => void;
}

export function Header({ userName, onSignOut }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  return (
    <div className="space-y-4 mb-8">
      {/* User info and sign out */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div>
            <p className="text-sm font-medium">Welcome back,</p>
            <p className="text-lg font-bold">{userName}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {!pathname.startsWith('/recent') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/recent')}
              className="flex items-center space-x-2"
            >
              <FileText className="h-4 w-4" />
              <span>Recent</span>
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={onSignOut}
            className="flex items-center space-x-2"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </Button>
        </div>
      </div>

      {/* Main title */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-3">
          <button
            onClick={() => router.push('/')}
            className="hover:opacity-80 transition-opacity"
          >
            <h1 className="text-3xl font-bold">Job Application Analyzer</h1>
          </button>
        </div>
      </div>
    </div>
  );
}