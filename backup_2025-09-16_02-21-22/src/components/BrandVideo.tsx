import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react';

interface BrandVideoProps {
  videoUrl?: string;
  posterUrl?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  className?: string;
}

export const BrandVideo: React.FC<BrandVideoProps> = ({
  videoUrl = '/videos/interpretreflect-intro.mp4',
  posterUrl = '/images/video-poster.jpg',
  autoPlay = true,
  muted = true,
  loop = true,
  className = ''
}) => {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(muted);
  const [showControls, setShowControls] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(() => {
          // Auto-play was prevented, update state
          setIsPlaying(false);
        });
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        containerRef.current.requestFullscreen();
      }
    }
  };

  // Fallback animated content if video is not available
  const AnimatedLogo = () => (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-sage-50 to-sage-100">
      <div className="text-center animate-fade-in">
        <div className="relative inline-block">
          {/* Animated circles */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 rounded-full border-4 border-sage-300 animate-pulse" />
            <div className="absolute w-24 h-24 rounded-full border-4 border-sage-400 animate-ping" />
          </div>
          
          {/* Logo Text */}
          <h1 className="relative z-10 text-6xl font-bold">
            <span style={{ color: '#2D3A31' }}>Interpret</span>
            <span style={{ color: '#5C7F4F' }}>Reflect</span>
          </h1>
        </div>
        
        <p className="mt-6 text-xl text-gray-600 animate-slide-up">
          Wellness Platform for Interpreters
        </p>
        
        {/* Animated tagline */}
        <div className="mt-8 space-y-2 animate-fade-in-delayed">
          <p className="text-lg text-sage-600">✓ Prevent Burnout</p>
          <p className="text-lg text-sage-600">✓ Manage Vicarious Trauma</p>
          <p className="text-lg text-sage-600">✓ Maintain Healthy Boundaries</p>
        </div>
      </div>
    </div>
  );

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden rounded-lg ${className}`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      style={{ backgroundColor: '#F5F7F5' }}
    >
      {/* Video Element or Animated Fallback */}
      {videoUrl ? (
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          poster={posterUrl}
          muted={isMuted}
          loop={loop}
          playsInline
          aria-label="InterpretReflect brand video"
        >
          <source src={videoUrl} type="video/mp4" />
          <source src={videoUrl.replace('.mp4', '.webm')} type="video/webm" />
          {/* Fallback for browsers that don't support video */}
          <AnimatedLogo />
        </video>
      ) : (
        <AnimatedLogo />
      )}

      {/* Video Controls Overlay */}
      {videoUrl && (
        <div 
          className={`absolute inset-0 bg-gradient-to-t from-black/50 to-transparent transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Center Play/Pause Button */}
          <button
            onClick={togglePlay}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                     bg-white/90 backdrop-blur-sm rounded-full p-4 transition-all hover:scale-110"
            aria-label={isPlaying ? 'Pause video' : 'Play video'}
          >
            {isPlaying ? (
              <Pause className="w-8 h-8" style={{ color: '#5C7F4F' }} />
            ) : (
              <Play className="w-8 h-8" style={{ color: '#5C7F4F' }} />
            )}
          </button>

          {/* Bottom Controls */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Mute/Unmute */}
              <button
                onClick={toggleMute}
                className="bg-white/90 backdrop-blur-sm rounded-lg p-2 transition-all hover:bg-white"
                aria-label={isMuted ? 'Unmute video' : 'Mute video'}
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5" style={{ color: '#5C7F4F' }} />
                ) : (
                  <Volume2 className="w-5 h-5" style={{ color: '#5C7F4F' }} />
                )}
              </button>
            </div>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="bg-white/90 backdrop-blur-sm rounded-lg p-2 transition-all hover:bg-white"
              aria-label="Toggle fullscreen"
            >
              <Maximize className="w-5 h-5" style={{ color: '#5C7F4F' }} />
            </button>
          </div>
        </div>
      )}

      {/* Brand Overlay Text */}
      <div className="absolute top-8 left-8 z-10">
        <div className="bg-white/95 backdrop-blur-sm rounded-lg px-6 py-4">
          <h2 className="text-3xl font-bold">
            <span style={{ color: '#2D3A31' }}>Interpret</span>
            <span style={{ color: '#5C7F4F' }}>Reflect</span>
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Your Wellness Journey Starts Here
          </p>
        </div>
      </div>
    </div>
  );
};

// CSS Animations (add to your global styles or use CSS-in-JS)
const styles = `
  @keyframes fade-in {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slide-up {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fade-in-delayed {
    0% {
      opacity: 0;
      transform: translateY(10px);
    }
    50% {
      opacity: 0;
      transform: translateY(10px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-fade-in {
    animation: fade-in 1s ease-out;
  }

  .animate-slide-up {
    animation: slide-up 1s ease-out 0.5s both;
  }

  .animate-fade-in-delayed {
    animation: fade-in-delayed 2s ease-out;
  }
`;

// Add styles to document head
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default BrandVideo;