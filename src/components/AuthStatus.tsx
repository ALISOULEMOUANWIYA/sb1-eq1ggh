import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

interface AuthStatusProps {
  platform: string;
  isAuthenticated: boolean;
  onConnect: () => void;
}

export function AuthStatus({ platform, isAuthenticated, onConnect }: AuthStatusProps) {
  return (
    <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 flex items-center justify-center">
          {isAuthenticated ? (
            <CheckCircle className="text-green-500 w-6 h-6" />
          ) : (
            <XCircle className="text-red-500 w-6 h-6" />
          )}
        </div>
        <span className="font-medium capitalize">{platform}</span>
      </div>
      
      {!isAuthenticated && (
        <button
          onClick={onConnect}
          className="px-4 py-1 text-sm bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors"
        >
          Connecter
        </button>
      )}
    </div>
  );
}