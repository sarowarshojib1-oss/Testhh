import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Settings, 
  Cast, 
  Subtitles, 
  Loader2, 
  FileVideo, 
  ExternalLink 
} from 'lucide-react';

interface VideoPlayerProps {
  videoId: string;
  videoType?: 'drive' | 'youtube' | 'facebook' | 'pinterest' | 'pixabay';
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoId, videoType = 'drive' }) => {
  const [useIframe, setUseIframe] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [volume, setVolume] = useState(1);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<number | null>(null);

  // URLs
  // For Pixabay, videoId is the direct URL. For Drive, we construct the proxy URL.
  const nativeUrl = videoType === 'pixabay' 
    ? videoId 
    : `https://drive.google.com/uc?export=download&id=${videoId}`;
    
  const embedUrl = `https://drive.google.com/file/d/${videoId}/preview`;

  useEffect(() => {
    setUseIframe(false);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setIsLoading(true);
    setShowControls(true);
  }, [videoId, videoType]);

  // --- YouTube Renderer ---
  if (videoType === 'youtube') {
    return (
      <div className="w-full max-w-[900px] mx-auto bg-black rounded-xl overflow-hidden shadow-2xl relative group">
        <div className="relative w-full overflow-hidden" style={{ paddingTop: '56.25%' }}>
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&iv_load_policy=3&controls=1`}
            className="absolute left-0 w-full border-0"
            style={{ 
              top: '-65px', 
              height: 'calc(100% + 65px)' 
            }}
            allow="autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            title="YouTube Video"
            allowFullScreen
          />
        </div>
        <div className="absolute top-0 right-0 w-40 h-16 z-20 pointer-events-auto cursor-default" />
      </div>
    );
  }

  // --- Facebook Renderer ---
  if (videoType === 'facebook') {
    return (
      <div className="w-full max-w-[900px] mx-auto bg-black rounded-xl overflow-hidden shadow-2xl relative">
        <div className="relative w-full overflow-hidden" style={{ paddingTop: '56.25%' }}>
          <iframe
            src={`https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(videoId)}&show_text=false&t=0`}
            className="absolute top-0 left-0 w-full h-full border-0"
            style={{ border: 'none', overflow: 'hidden' }}
            scrolling="no"
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            allowFullScreen={true}
            title="Facebook Video"
          />
        </div>
      </div>
    );
  }

  // --- Pinterest Renderer ---
  if (videoType === 'pinterest') {
    // Stricter environment for Pinterest to prevent redirection.
    // 1. Dark background to match player look.
    // 2. JS event listener to kill all link clicks immediately.
    // 3. CSS to disable pointer events on anchor tags (failsafe).
    const pinterestHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { 
            margin: 0; 
            padding: 0; 
            display: flex; 
            justify-content: center; 
            align-items: center; 
            height: 100vh; 
            background-color: #000; 
            overflow: hidden;
          }
          /* Disable pointer events on links to prevent accidental navigation */
          a {
             cursor: default !important;
          }
        </style>
      </head>
      <body>
        <!-- data-pin-terse="true" attempts to hide text/links -->
        <a data-pin-do="embedPin" data-pin-width="large" data-pin-terse="true" href="${videoId}"></a>
        <script async defer src="https://assets.pinterest.com/js/pinit.js"></script>
        <script>
            // Intercept and block all link clicks
            document.addEventListener('click', function(e) {
                // Check if the clicked element or any parent is an anchor tag
                const link = e.target.closest('a');
                if (link) {
                    // Stop everything
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }
            }, true); // Capture phase to catch it early
        </script>
      </body>
      </html>
    `;

    return (
      <div className="w-full max-w-[600px] mx-auto bg-black rounded-xl overflow-hidden shadow-xl border border-slate-800 relative">
        <div className="w-full h-[650px] relative">
          <iframe 
            srcDoc={pinterestHtml}
            className="absolute inset-0 w-full h-full border-0"
            title="Pinterest Video"
            // STRICT SANDBOX:
            // - allow-scripts: Needed for the player.
            // - allow-presentation: Needed for fullscreen.
            // - REMOVED: allow-same-origin (Prevents script from accessing top window location)
            // - REMOVED: allow-top-navigation (Prevents standard redirects)
            // - REMOVED: allow-popups (Prevents opening new tabs)
            sandbox="allow-scripts allow-presentation"
          />
        </div>
      </div>
    );
  }

  // --- Pixabay Page Helper (Non-MP4 link) ---
  if (videoType === 'pixabay' && !videoId.match(/\.mp4($|\?)/i)) {
    return (
       <div className="w-full max-w-[900px] mx-auto bg-slate-900 rounded-xl overflow-hidden shadow-2xl relative flex flex-col items-center justify-center text-center p-8 text-white min-h-[400px]">
        <div className="bg-blue-600/20 p-4 rounded-full mb-6 animate-pulse">
           <FileVideo className="w-8 h-8 text-blue-400" />
        </div>
        <h3 className="text-xl md:text-2xl font-bold mb-3">Direct Video Link Required</h3>
        <p className="text-slate-300 max-w-md mb-8 leading-relaxed">
          You pasted a Pixabay <strong>page URL</strong>. To ensure high-quality playback, please provide the direct <strong>.mp4 video file URL</strong>.
        </p>
        
        <div className="bg-slate-800/80 p-6 rounded-xl text-sm text-left w-full max-w-md border border-slate-700 shadow-inner">
           <div className="flex items-center gap-2 mb-4 text-blue-400 font-semibold uppercase tracking-wider text-xs">
             <ExternalLink className="w-4 h-4" /> Instructions
           </div>
           <ol className="list-decimal list-inside space-y-3 text-slate-300">
             <li className="pl-1">Go back to the Pixabay video page.</li>
             <li className="pl-1"><strong>Right-click</strong> directly on the video player.</li>
             <li className="pl-1">Select <strong>"Copy Video Address"</strong> (or "Copy video URL").</li>
             <li className="pl-1">Paste that link here (it must end in .mp4).</li>
           </ol>
        </div>
      </div>
    );
  }

  // --- Google Drive & Pixabay (Direct MP4) Renderer (Custom UI) ---

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handlePlayPause = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const newMutedState = !isMuted;
      videoRef.current.muted = newMutedState;
      setIsMuted(newMutedState);
      if (newMutedState) {
        setVolume(0);
      } else {
        setVolume(1);
        videoRef.current.volume = 1;
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setIsLoading(false);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setIsLoading(false);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  // Internal fullscreen logic (disconnected from button as per request)
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => console.error(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleError = () => {
    if (videoType === 'pixabay') {
      console.warn("Pixabay video failed to load. The link might be expired or restricted.");
      setIsLoading(false);
      return;
    }
    console.warn("Stream playback failed. Falling back to universal player.");
    setUseIframe(true);
    setIsLoading(false);
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      window.clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = window.setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 2500);
  };

  // Render: Iframe Fallback (Standard Google Player) - Only shown if native Drive playback fails
  if (useIframe && videoType === 'drive') {
    return (
      <div className="w-full max-w-[900px] mx-auto bg-black rounded-xl overflow-hidden shadow-2xl relative group">
        <div className="relative w-full overflow-hidden" style={{ paddingTop: '56.25%' }}>
          <iframe
            src={embedUrl}
            className="absolute left-0 w-full border-0"
            // Shift up by 60px to hide the top bar
            style={{ 
              top: '-60px', 
              height: 'calc(100% + 60px)' 
            }}
            allow="autoplay; fullscreen"
            title="Video Content"
          />
        </div>
        {/* Invisible overlay on top right to prevent clicking any remaining sliver of the button */}
        <div className="absolute top-0 right-0 w-24 h-16 z-20 pointer-events-auto cursor-default" />
      </div>
    );
  }

  // Render: Custom "Pro" Player (Drive & Pixabay)
  return (
    <div 
      ref={containerRef}
      className={`relative w-full max-w-[900px] mx-auto bg-black shadow-2xl rounded-xl overflow-hidden group select-none transition-all duration-300 ${!showControls && isPlaying ? 'cursor-none' : ''}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      style={{ aspectRatio: '16/9' }}
    >
      <video
        ref={videoRef}
        src={nativeUrl}
        className="w-full h-full object-contain"
        onClick={handlePlayPause}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onWaiting={() => setIsLoading(true)}
        onPlaying={() => setIsLoading(false)}
        onError={handleError}
        playsInline
        crossOrigin="anonymous" 
      />

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-40 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
             <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
             <p className="text-white text-xs font-medium tracking-wider uppercase opacity-70">Buffering</p>
          </div>
        </div>
      )}

      {/* Center Play Button Overlay */}
      {!isPlaying && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
          <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg transition-transform transform group-hover:scale-110 pointer-events-auto cursor-pointer" onClick={handlePlayPause}>
            <Play className="w-8 h-8 text-white fill-white ml-1" />
          </div>
        </div>
      )}

      {/* Bottom Gradient for Controls */}
      <div 
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent px-5 pb-5 pt-16 transition-opacity duration-500 z-50 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Progress Bar Container */}
        <div className="relative w-full h-1.5 group/slider mb-4 cursor-pointer flex items-center">
           {/* Seek Input */}
           <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="absolute z-20 w-full h-full opacity-0 cursor-pointer"
          />
          
          {/* Background Track */}
          <div className="absolute w-full h-1 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm group-hover/slider:h-1.5 transition-all">
             <div className="absolute top-0 left-0 h-full w-full bg-white/10" />
             <div 
               className="h-full bg-blue-500 relative transition-all duration-100 ease-out"
               style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
             >
             </div>
          </div>
          
          {/* Thumb Indicator */}
          <div 
            className="absolute h-3.5 w-3.5 bg-white rounded-full shadow-md opacity-0 group-hover/slider:opacity-100 transition-opacity pointer-events-none"
            style={{ left: `${(currentTime / (duration || 1)) * 100}%`, transform: 'translateX(-50%)' }}
          />
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-between text-white/90">
          
          {/* Left Controls */}
          <div className="flex items-center gap-5">
            <button onClick={handlePlayPause} className="hover:text-white text-white/80 transition-colors">
              {isPlaying ? <Pause className="w-7 h-7 fill-current" /> : <Play className="w-7 h-7 fill-current" />}
            </button>
            
            <div className="flex items-center gap-3 group/volume">
              <button onClick={toggleMute} className="hover:text-white text-white/80 transition-colors">
                {isMuted || volume === 0 ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
              </button>
              <div className="w-0 overflow-hidden group-hover/volume:w-24 transition-all duration-300 ease-in-out">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-20 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
            </div>

            <span className="text-xs font-medium font-mono text-white/70 tracking-wide">
              {formatTime(currentTime)} <span className="text-white/30 mx-1">/</span> {formatTime(duration)}
            </span>
          </div>

          {/* Right Controls - "Broken" Buttons as requested */}
          <div className="flex items-center gap-4">
             {/* Settings - Visual only, no onClick */}
             <button className="hover:text-white text-white/80 transition-colors cursor-pointer" title="Settings">
               <Settings className="w-5 h-5" />
             </button>
             
             {/* CC - Visual only, no onClick */}
             <button className="hover:text-white text-white/80 transition-colors cursor-pointer" title="Subtitles">
               <Subtitles className="w-5 h-5" />
             </button>
             
             {/* Cast - Visual only */}
             <button className="hover:text-white text-white/80 transition-colors hidden sm:block cursor-pointer" title="Cast">
               <Cast className="w-5 h-5" />
             </button>
             
             {/* Fullscreen - Visual only, onClick removed */}
             <button className="hover:text-white text-white/80 transition-colors cursor-pointer">
               <Maximize className="w-6 h-6" />
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};