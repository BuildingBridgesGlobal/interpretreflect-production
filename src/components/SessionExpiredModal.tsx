import { AlertCircle, LogIn } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface SessionExpiredModalProps {
  isOpen: boolean;
  onSignIn: () => void;
}

const SessionExpiredModal: React.FC<SessionExpiredModalProps> = ({
  isOpen,
  onSignIn,
}) => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (!isOpen) return;

    // Start countdown
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          // Redirect to home page after countdown
          window.location.href = "/";
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-[9999]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="session-expired-title"
    >
      <div
        className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div
            className="p-4 rounded-full"
            style={{
              backgroundColor: "#FFF5EE",
            }}
          >
            <AlertCircle className="h-12 w-12" style={{ color: "#C87137" }} />
          </div>
        </div>

        {/* Title */}
        <h2
          id="session-expired-title"
          className="text-2xl font-bold text-center mb-4"
          style={{ color: "#2D3748" }}
        >
          Session Expired
        </h2>

        {/* Description */}
        <p
          className="text-center mb-6"
          style={{ color: "#4A5568", lineHeight: "1.6" }}
        >
          Your session has expired for security reasons. Please sign in again to
          continue using InterpretReflect.
        </p>

        {/* Info box */}
        <div
          className="rounded-lg p-4 mb-6"
          style={{
            backgroundColor: "#F0F5ED",
            border: "1px solid #7A9B6E",
          }}
        >
          <p className="text-sm" style={{ color: "#2D3748" }}>
            <strong>Note:</strong> Your subscription is still active. You just
            need to sign in again to access your account.
          </p>
        </div>

        {/* Countdown */}
        <p className="text-center text-sm mb-6" style={{ color: "#718096" }}>
          Redirecting to sign in page in {countdown} seconds...
        </p>

        {/* Action Button */}
        <button
          onClick={onSignIn}
          className="w-full py-3 px-6 rounded-xl font-semibold text-white transition-all hover:opacity-90 flex items-center justify-center gap-2"
          style={{
            background: "linear-gradient(135deg, #5C7F4F, #5B9378)",
          }}
        >
          <LogIn className="h-5 w-5" />
          Sign In Now
        </button>
      </div>
    </div>
  );
};

export default SessionExpiredModal;
