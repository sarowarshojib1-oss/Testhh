import React, { useState } from 'react';
import { ExternalLink, RefreshCw, Smartphone } from 'lucide-react';

interface VideoPlayerProps {
  videoId: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoId }) => {
  const [playerMode, setPlayerMode] = useState<'embed' | 'native'>('embed');

  const embedUrl = `https://drive.google.com/file/d/${videoId}/preview`;
  const nativeUrl = `https://drive.google.com/uc?export=download&id=${videoId}`;
  const viewUrl = `https://drive.google.com/file/d/${videoId}/view?usp=sharing`;

  const togglePlayerMode = () => {
    setPlayerMode(prev => prev === 'embed' ? 'native' : 'embed');
  };

  return (
    <div className="w-full max-w-[800px] mx-auto space-y-4">
      {/* 
        Video Container matching the user's "trick" CSS structure exactly.
        Removed overflow-hidden and rounded-corners which can clip touch events on some mobile browsers.
      */}
      <div 
        className="relative w-full bg-black shadow-2xl"
        style={{ paddingTop: '56.25%' }}
      >
        {playerMode === 'embed' ? (
          <iframe
            src={embedUrl}
            className="absolute top-0 left-0 w-full h-full border-0 z-10"
            allow="autoplay"
            title="Google Drive Video Player"
          />
        ) : (
          <video
            src={nativeUrl}
            controls
            autoPlay
            playsInline
            className="absolute top-0 left-0 w-full h-full z-10"
          >
            Your browser does not support the video tag.
          </video>
        )}
      </div>

      {/* Controls & Help */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span className={`flex h-2 w-2 rounded-full ${playerMode === 'embed' ? 'bg-blue-500' : 'bg-green-500'}`}></span>
            Mode: <span className="font-semibold text-slate-900">{playerMode === 'embed' ? 'Google Player' : 'Native Player'}</span>
          </div>

          <button
            onClick={togglePlayerMode}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-800 hover:bg-slate-900 rounded transition-all active:scale-95"
          >
            {playerMode === 'embed' ? (
              <>
                <Smartphone className="w-4 h-4" />
                Video stuck? Try Native Player
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Switch to Google Player
              </>
            )}
          </button>
        </div>

        <div className="flex justify-center sm:justify-end">
          <a 
            href={viewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-blue-600 transition-colors"
          >
            <span>Open in Drive App</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};