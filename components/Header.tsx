import React from 'react';
import { Play } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <Play className="w-5 h-5 text-white fill-current" />
          </div>
          <span className="font-bold text-lg text-slate-800 tracking-tight">DriveStream</span>
        </div>
        <nav>
          <a 
            href="#" 
            className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors"
          >
            Documentation
          </a>
        </nav>
      </div>
    </header>
  );
};