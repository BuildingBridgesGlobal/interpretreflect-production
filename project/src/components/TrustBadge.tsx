import { Award, BookOpen, Shield } from "lucide-react";
import type React from "react";

interface TrustBadgeProps {
  variant?: "research" | "privacy" | "professional";
  size?: "sm" | "md";
  className?: string;
}

export const TrustBadge: React.FC<TrustBadgeProps> = ({
  variant = "research",
  size = "sm",
  className = "",
}) => {
  const badges = {
    research: {
      icon: BookOpen,
      text: "Backed by neuroscience research",
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

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full font-medium transition-all hover:scale-105 ${sizeClasses[size]} ${className}`}
      style={{
        backgroundColor: badge.bgColor,
        color: badge.color,
        border: `1px solid ${badge.color}`,
        opacity: 0.9,
      }}
    >
      <Icon className={size === "sm" ? "w-3 h-3" : "w-4 h-4"} />
      <span>{badge.text}</span>
    </div>
  );
};
