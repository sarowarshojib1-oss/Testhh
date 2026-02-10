import React, { useState, useCallback } from 'react';
import { VideoPlayer } from './components/VideoPlayer';
import { UrlInput } from './components/UrlInput';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { extractVideoSource, VideoSource } from './utils/driveUtils';
import { PlayCircle, AlertCircle, Info } from 'lucide-react';

// Default video (Google Drive ID)
const DEFAULT_VIDEO: VideoSource = {
  type: 'drive',
  id: '1V23bLDG4sGJL2cSSWOaOq-e47mtwrLXn'
};

const App: React.FC = () => {
  const [currentVideo, setCurrentVideo] = useState<VideoSource>(DEFAULT_VIDEO);
  const [error, setError] = useState<string | null>(null);

  const handleUrlSubmit = useCallback((input: string) => {
    setError(null);
    if (!input.trim()) {
      setError("Please enter a valid URL or ID.");
      return;
    }

    const source = extractVideoSource(input);
    if (source) {
      setCurrentVideo(source);
    } else {
       setError("Could not recognize a valid Google Drive, YouTube, Facebook, Pinterest, or Pixabay link.");
    }
  }, []);

  const getSourceLabel = (type: string) => {
    if (type === 'youtube') return 'YouTube';
    if (type === 'facebook') return 'Facebook';
    if (type === 'pinterest') return 'Pinterest';
    if (type === 'pixabay') return 'Pixabay';
    return 'Drive';
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12 flex flex-col items-center">
        <div className="w-full max-w-4xl space-y-8">
          
          <div className="text-center space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-800 tracking-tight">
              Universal Video Player
            </h1>
            <p className="text-slate-500 max-w-lg mx-auto">
              Embed and play videos seamlessly from Google Drive, YouTube, Facebook, Pinterest, or Pixabay.
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
               <h2>Now Playing ({getSourceLabel(currentVideo.type)})</h2>
            </div>
            
            <VideoPlayer videoId={currentVideo.id} videoType={currentVideo.type} />

            {/* Troubleshooting Guide */}
            {currentVideo.type === 'drive' && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-amber-900">Playback Issues?</h3>
                    <ul className="text-sm text-amber-800 list-disc list-inside space-y-1">
                      <li>Ensure the video file is shared as <strong>"Anyone with the link"</strong> on Drive.</li>
                      <li>Large files or files with high traffic may require the fallback player.</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
             {currentVideo.type === 'pixabay' && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-blue-900">Pixabay Tip</h3>
                    <p className="text-sm text-blue-800">
                      Ensure you are using the direct video URL ending in <strong>.mp4</strong> for the best experience.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default App;