import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  Loader2, 
  Settings,
  Cast,
  Subtitles
} from 'lucide-react';

interface VideoPlayerProps {
  videoId: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoId }) => {
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
  // Using 'uc' (User Content) export for direct stream where possible
  const nativeUrl = `https://drive.google.com/uc?export=download&id=${videoId}`;
  const embedUrl = `https://drive.google.com/file/d/${videoId}/preview`;

  useEffect(() => {
    setUseIframe(false);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setIsLoading(true);
    setShowControls(true);
  }, [videoId]);

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

  // Fullscreen logic kept for internal use if needed, but disconnected from button
  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Automatically fall back to iframe if the "native" video fails to load (e.g. CORS or Codec issues)
  const handleError = () => {
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

  // Render: Iframe Fallback (Standard Google Player) - Only shown if native fails
  // We apply a crop technique here to hide the top bar (pop-out button)
  if (useIframe) {
    return (
      <div className="w-full max-w-[900px] mx-auto bg-black rounded-xl overflow-hidden shadow-2xl relative group">
        <div className="relative w-full overflow-hidden" style={{ paddingTop: '56.25%' }}>
          <iframe
            src={embedUrl}
            className="absolute left-0 w-full border-0"
            // Shift up by 60px to hide the top bar, increase height to keep bottom controls
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

  // Render: Custom "Pro" Player
  return (
    <div 
      ref={containerRef}
      className={`relative w-full max-w-[900px] mx-auto bg-black shadow-2xl rounded-xl overflow-hidden group select-none transition-all duration-300 ${!showControls && isPlaying ? 'cursor-none' : ''}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      // Removed onDoubleClick={toggleFullscreen} to fully disable easy fullscreen access if requested, 
      // or we can leave it as a hidden feature. For now, removing to match the "broken button" vibe.
      style={{ aspectRatio: '16/9' }}
    >
      {/* Video Element */}
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

      {/* Loading Spinner */}
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
           {/* Seek Input (Hidden but functional) */}
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
             {/* Buffered/Loaded (Simulated for UI) */}
             <div className="absolute top-0 left-0 h-full w-full bg-white/10" />
             
             {/* Active Progress */}
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

          {/* Right Controls */}
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