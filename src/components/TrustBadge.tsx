import { Award, BookOpen, ChevronRight, Shield } from "lucide-react";
import type React from "react";
import { useNavigate } from "react-router-dom";

interface TrustBadgeProps {
  variant?: "research" | "privacy" | "professional";
  size?: "sm" | "md";
  className?: string;
  onClick?: () => void;
}

export const TrustBadge: React.FC<TrustBadgeProps> = ({
  variant = "research",
  size = "sm",
  className = "",
  onClick,
}) => {
  const navigate = useNavigate();

  const badges = {
    research: {
      icon: BookOpen,
      text: "Backed by research",
      color: "var(--color-green-600)",
      bgColor: "var(--color-green-50)",
    },
    privacy: {
      icon: Shield,
      text: "HIPAA-aligned practices",
      color: "var(--color-navy-600)",
      bgColor: "var(--color-navy-50)",
    },
    professional: {
      icon: Award,
      text: "Developed with wellness experts",
      color: "var(--color-success)",
      bgColor: "var(--color-success-light)",
    },
  };

  const badge = badges[variant];
  const Icon = badge.icon;

  const sizeClasses = {
    sm: "text-xs px-3 py-1.5",
    md: "text-sm px-4 py-2",
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (variant === "research") {
      navigate("/research");
    }
  };

  const isClickable = onClick || variant === "research";

  return (
    <div
      onClick={isClickable ? handleClick : undefined}
      className={`inline-flex items-center gap-2 rounded-full font-medium transition-all ${
        isClickable ? "cursor-pointer hover:scale-105 hover:shadow-md" : ""
      } ${sizeClasses[size]} ${className}`}
      style={{
        backgroundColor: badge.bgColor,
        color: badge.color,
        border: `1px solid ${badge.color}`,
        opacity: 0.9,
      }}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleClick();
              }
            }
          : undefined
      }
    >
      <Icon className={size === "sm" ? "w-3 h-3" : "w-4 h-4"} />
      <span>{badge.text}</span>
      {isClickable && variant === "research" && (
        <ChevronRight className={size === "sm" ? "w-3 h-3" : "w-4 h-4"} />
      )}
    </div>
  );
};
