import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 bg-white py-6">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm text-slate-500">
          Built for seamless Google Drive video embedding. 
        </p>
        <p className="text-xs text-slate-400 mt-2">
          This tool is not affiliated with Google.
        </p>
      </div>
    </footer>
  );
};