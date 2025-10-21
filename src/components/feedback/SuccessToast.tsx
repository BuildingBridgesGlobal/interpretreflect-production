import { CheckCircle, X } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";

interface SuccessToastProps {
  message: string;
  subMessage?: string;
  show: boolean;
  onClose: () => void;
  duration?: number;
}

export const SuccessToast: React.FC<SuccessToastProps> = ({
  message,
  subMessage,
  show,
  onClose,
  duration = 4000,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for fade out
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  if (!show && !isVisible) return null;

  return (
    <div
      className={`fixed top-4 right-4 z-50 transition-all duration-300 transform ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div
        className="rounded-xl shadow-clean-lg p-4 pr-12 max-w-md relative"
        style={{
          background: 'linear-gradient(135deg, var(--color-success-light), rgba(107, 130, 104, 0.1))',
          border: '2px solid var(--color-success)',
        }}
      >
        {/* Close button */}
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="absolute top-3 right-3 p-1 rounded-lg transition-all"
          style={{ backgroundColor: '#FFFFFF' }}
          aria-label="Close notification"
        >
          <X className="w-4 h-4" style={{ color: '#000000' }} />
        </button>

        {/* Content */}
        <div className="flex items-start gap-3">
          <div
            className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: 'var(--color-success)',
            }}
          >
            <CheckCircle className="w-5 h-5 text-white" />
          </div>

          <div className="flex-1">
            <h4
              className="font-bold text-sm mb-1"
              style={{ color: 'var(--color-success)' }}
            >
              {message}
            </h4>
            {subMessage && (
              <p
                className="text-xs"
                style={{
                  color: 'var(--color-slate-600)',
                }}
              >
                {subMessage}
              </p>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div
          className="absolute bottom-0 left-0 h-1 rounded-b-xl transition-all"
          style={{
            backgroundColor: 'var(--color-success)',
            width: isVisible ? '0%' : '100%',
            transition: `width ${duration}ms linear`,
          }}
        />
      </div>
    </div>
  );
};
