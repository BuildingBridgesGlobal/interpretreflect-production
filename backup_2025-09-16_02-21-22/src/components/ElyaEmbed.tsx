import React, { useEffect, useState } from 'react';
import { MessageCircle, X, Minimize2, Maximize2 } from 'lucide-react';

interface ElyaEmbedProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  defaultOpen?: boolean;
  bubbleColor?: string;
  headerColor?: string;
}

export const ElyaEmbed: React.FC<ElyaEmbedProps> = ({
  position = 'bottom-right',
  defaultOpen = false,
  bubbleColor = 'linear-gradient(135deg, #5C7F4F 0%, #8FA881 100%)',
  headerColor = 'linear-gradient(135deg, #5C7F4F 0%, #8FA881 100%)'
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isMinimized, setIsMinimized] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  // Agentic Flow Agent Configuration
  const AGENT_ID = 'a1cab40c-bcc2-49d8-ab97-f233f9b83fb2';
  const WORKSPACE_ID = '73561e0f-dd3b-4a81-a7ea-75fc44591dff';
  
  // Embed URL for Agentic Flow agent
  const embedUrl = `https://agenticflow.ai/embed/agent/${AGENT_ID}`;
  
  // Alternative: Use the workspace URL
  // const embedUrl = `https://agenticflow.ai/app/workspaces/${WORKSPACE_ID}/agents/${AGENT_ID}/embed`;

  useEffect(() => {
    // Add custom CSS for smooth animations
    const style = document.createElement('style');
    style.textContent = `
      @keyframes elya-slide-up {
        from {
          transform: translateY(100%);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }
      
      @keyframes elya-fade-in {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      .elya-chat-widget {
        animation: elya-slide-up 0.3s ease-out;
      }
      
      .elya-chat-bubble {
        animation: elya-fade-in 0.3s ease-out;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const positionStyles = {
    'bottom-right': { bottom: '20px', right: '20px' },
    'bottom-left': { bottom: '20px', left: '20px' },
    'top-right': { top: '20px', right: '20px' },
    'top-left': { top: '20px', left: '20px' }
  };

  const chatPositionStyles = {
    'bottom-right': { bottom: '90px', right: '20px' },
    'bottom-left': { bottom: '90px', left: '20px' },
    'top-right': { top: '90px', right: '20px' },
    'top-left': { top: '90px', left: '20px' }
  };

  return (
    <>
      {/* Chat Widget Container */}
      {isOpen && (
        <div
          className="elya-chat-widget"
          style={{
            position: 'fixed',
            ...chatPositionStyles[position],
            width: '380px',
            height: isMinimized ? '60px' : '600px',
            maxHeight: '80vh',
            zIndex: 9998,
            transition: 'height 0.3s ease-out',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)'
          }}
        >
          {/* Header */}
          <div
            style={{
              background: headerColor,
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              color: 'white',
              cursor: 'pointer'
            }}
            onClick={() => setIsMinimized(!isMinimized)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#10B981',
                  boxShadow: '0 0 8px #10B981'
                }}
              />
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
                  Elya - Wellness Coach
                </h3>
                {!isMinimized && (
                  <p style={{ margin: 0, fontSize: '12px', opacity: 0.9 }}>
                    Your AI burnout prevention companion
                  </p>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMinimized(!isMinimized);
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  borderRadius: '8px',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
              >
                {isMinimized ? 
                  <Maximize2 size={16} color="white" /> : 
                  <Minimize2 size={16} color="white" />
                }
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  borderRadius: '8px',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
              >
                <X size={16} color="white" />
              </button>
            </div>
          </div>

          {/* Chat iframe */}
          {!isMinimized && (
            <div style={{ height: 'calc(100% - 68px)', background: 'white' }}>
              {!iframeLoaded && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  background: '#F9FAFB'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div className="animate-spin" style={{
                      width: '40px',
                      height: '40px',
                      border: '4px solid #E5E7EB',
                      borderTop: '4px solid #5C7F4F',
                      borderRadius: '50%',
                      margin: '0 auto 16px'
                    }} />
                    <p style={{ color: '#6B7280', fontSize: '14px' }}>
                      Connecting to Elya...
                    </p>
                  </div>
                </div>
              )}
              <iframe
                src={embedUrl}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  display: iframeLoaded ? 'block' : 'none'
                }}
                onLoad={() => setIframeLoaded(true)}
                title="Elya Chat"
                allow="microphone; camera"
              />
            </div>
          )}
        </div>
      )}

      {/* Floating Chat Bubble */}
      {!isOpen && (
        <button
          className="elya-chat-bubble"
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            ...positionStyles[position],
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: bubbleColor,
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            zIndex: 9999,
            transition: 'transform 0.2s, box-shadow 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = '0 6px 24px rgba(0, 0, 0, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.15)';
          }}
          aria-label="Open Elya Chat"
        >
          <MessageCircle size={28} color="white" />
          
          {/* Pulsing indicator */}
          <div
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              width: '12px',
              height: '12px',
              backgroundColor: '#10B981',
              borderRadius: '50%',
              border: '2px solid white'
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '-2px',
                left: '-2px',
                right: '-2px',
                bottom: '-2px',
                borderRadius: '50%',
                backgroundColor: '#10B981',
                opacity: 0.4,
                animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite'
              }}
            />
          </div>
        </button>
      )}

      {/* Add ping animation */}
      <style>{`
        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
};

export default ElyaEmbed;