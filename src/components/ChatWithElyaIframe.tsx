import React, { useState, useEffect } from 'react';
import { Sparkles, Loader, AlertCircle } from 'lucide-react';

export function ChatWithElyaIframe() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Set a timeout to hide loader after iframe should be loaded
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Add CSS to hide powered by text and branding
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      #elya-iframe-container {
        position: relative;
        overflow: hidden;
        border-radius: 0;
      }
      #elya-iframe-container::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 35px;
        background: linear-gradient(to bottom, transparent, white 20%, white);
        pointer-events: none;
        z-index: 2;
      }
      /* Additional masking for safety */
      #elya-iframe-container::before {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 40px;
        background: white;
        pointer-events: none;
        z-index: 1;
      }
      /* Ensure iframe doesn't show scrollbars */
      #elya-iframe {
        overflow: hidden !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const handleIframeLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-green-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Chat with Elya</h1>
                <p className="text-sm text-gray-500">Your AI wellness companion</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <span className="w-2 h-2 bg-[rgba(107,130,104,0.05)]0 rounded-full mr-2 animate-pulse"></span>
                Online
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative">
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-90 z-10 flex items-center justify-center">
            <div className="text-center">
              <Loader className="h-8 w-8 text-green-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Connecting to Elya...</p>
              <p className="text-sm text-gray-500 mt-1">This may take a few moments</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {hasError && (
          <div className="absolute inset-0 bg-white z-10 flex items-center justify-center">
            <div className="text-center max-w-md mx-auto p-6">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Unable to Connect to Elya
              </h2>
              <p className="text-gray-600 mb-4">
                We're having trouble connecting to the AI service. Please check your internet connection and try again.
              </p>
              <button
                onClick={() => {
                  setHasError(false);
                  setIsLoading(true);
                  // Force iframe reload
                  const iframe = document.getElementById('elya-iframe') as HTMLIFrameElement;
                  if (iframe) {
                    iframe.src = iframe.src;
                  }
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Iframe Container */}
        <div id="elya-iframe-container" className="h-full w-full relative">
          <iframe
            id="elya-iframe"
            src="https://agenticflow.ai/embed/agents/a1cab40c-bcc2-49d8-ab97-f233f9b83fb2"
            style={{
              width: '100%',
              height: 'calc(100% + 30px)',
              border: 'none',
              display: hasError ? 'none' : 'block',
              marginBottom: '-30px',
            }}
            title="Chat with Elya - AI Wellness Companion"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            allow="microphone; camera"
            className="bg-white"
          />
        </div>
      </div>

      {/* Footer Info */}
      {!isLoading && !hasError && (
        <div className="bg-white border-t border-gray-200 px-4 py-2">
          <p className="text-xs text-center text-gray-500">
            Elya is here to support your wellness journey. Your conversations are private and secure.
          </p>
        </div>
      )}
    </div>
  );
}