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
    <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
      {/* User info and sign out */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div>
            <p className="text-xs sm:text-sm font-medium">Welcome back,</p>
            <p className="text-sm sm:text-lg font-bold">{userName}</p>
          </div>
        </div>
        <div className="flex items-center space-x-1 sm:space-x-2">
          {!pathname.startsWith('/recent') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/recent')}
              className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 h-8 sm:h-9 text-xs sm:text-sm"
            >
              <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Recent</span>
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={onSignOut}
            className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 h-8 sm:h-9 text-xs sm:text-sm"
          >
            <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Sign Out</span>
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
            <h1 className="text-xl sm:text-3xl font-bold">Job Application Analyzer</h1>
          </button>
        </div>
      </div>
    </div>
  );
}