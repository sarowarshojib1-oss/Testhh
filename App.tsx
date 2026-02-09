import React, { useState, useCallback } from 'react';
import { VideoPlayer } from './components/VideoPlayer';
import { UrlInput } from './components/UrlInput';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { extractDriveId } from './utils/driveUtils';
import { PlayCircle, AlertCircle, Info } from 'lucide-react';

const DEFAULT_VIDEO_ID = '1V23bLDG4sGJL2cSSWOaOq-e47mtwrLXn';

const App: React.FC = () => {
  const [videoId, setVideoId] = useState<string>(DEFAULT_VIDEO_ID);
  const [error, setError] = useState<string | null>(null);

  const handleUrlSubmit = useCallback((input: string) => {
    setError(null);
    if (!input.trim()) {
      setError("Please enter a valid URL or ID.");
      return;
    }

    const extractedId = extractDriveId(input);
    if (extractedId) {
      setVideoId(extractedId);
    } else {
      if (/^[a-zA-Z0-9_-]{20,}$/.test(input.trim())) {
         setVideoId(input.trim());
      } else {
         setError("Could not extract a valid Google Drive File ID from the provided URL.");
      }
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12 flex flex-col items-center">
        <div className="w-full max-w-4xl space-y-8">
          
          <div className="text-center space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-800 tracking-tight">
              Google Drive Video Player
            </h1>
            <p className="text-slate-500 max-w-lg mx-auto">
              Embed and play videos directly from Google Drive.
              <br/>
              <span className="text-sm text-slate-400">Works best with public files.</span>
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <UrlInput onSubmit={handleUrlSubmit} />
            {error && (
              <div className="mt-4 flex items-center gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-lg text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center gap-2 text-slate-800 font-semibold px-2">
               <PlayCircle className="w-5 h-5 text-blue-600" />
               <h2>Now Playing</h2>
            </div>
            
            <VideoPlayer videoId={videoId} />

            {/* Troubleshooting Guide */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-amber-900">Playback Issues?</h3>
                  <ul className="text-sm text-amber-800 list-disc list-inside space-y-1">
                    <li>If the video loads but doesn't play, click <strong>"Video stuck? Try Native Player"</strong> above.</li>
                    <li>Ensure the video file is shared as <strong>"Anyone with the link"</strong> on Drive.</li>
                    <li>The Native Player might fail if the video is very large (virus scan warning) or has too many views (quota exceeded).</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default App;