import type React from "react";

interface EmptyReflectionIllustrationProps {
  size?: number;
  className?: string;
}

export const EmptyReflectionIllustration: React.FC<EmptyReflectionIllustrationProps> = ({
  size = 120,
  className = "",
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Warm background circle */}
      <circle
        cx="60"
        cy="60"
        r="55"
        fill="url(#warmGradient)"
        opacity="0.1"
      />

      {/* Journal/Book */}
      <rect
        x="30"
        y="40"
        width="60"
        height="50"
        rx="4"
        fill="var(--color-card)"
        stroke="rgba(107, 130, 104, 0.3)"
        strokeWidth="2"
      />

      {/* Book spine highlight */}
      <rect
        x="30"
        y="40"
        width="8"
        height="50"
        fill="rgba(107, 130, 104, 0.2)"
        opacity="0.6"
      />

      {/* Lines representing text */}
      <line
        x1="45"
        y1="52"
        x2="75"
        y2="52"
        stroke="rgba(107, 130, 104, 0.4)"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.4"
      />
      <line
        x1="45"
        y1="60"
        x2="80"
        y2="60"
        stroke="rgba(107, 130, 104, 0.4)"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.4"
      />
      <line
        x1="45"
        y1="68"
        x2="70"
        y2="68"
        stroke="rgba(107, 130, 104, 0.4)"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.4"
      />

      {/* Pen/Pencil */}
      <g transform="translate(70, 65) rotate(-45)">
        <rect
          x="0"
          y="0"
          width="4"
          height="25"
          rx="2"
          fill="#5B9378"
        />
        <polygon
          points="2,25 0,30 4,30"
          fill="var(--color-slate-700)"
        />
        <circle
          cx="2"
          cy="5"
          r="1.5"
          fill="white"
        />
      </g>

      {/* Heart symbol (emotional wellness) */}
      <g transform="translate(40, 25)">
        <path
          d="M12 4.5C10.5 2.5 8 2 6 3.5C4 5 3.5 7 4.5 9C5.5 11 12 16 12 16C12 16 18.5 11 19.5 9C20.5 7 20 5 18 3.5C16 2 13.5 2.5 12 4.5Z"
          fill="var(--color-indigo-400)"
          opacity="0.5"
        />
      </g>

      {/* Sparkles for positivity */}
      <g opacity="0.6">
        <circle cx="25" cy="70" r="2" fill="rgba(107, 130, 104, 0.4)" />
        <circle cx="95" cy="50" r="1.5" fill="var(--color-indigo-400)" />
        <circle cx="85" cy="30" r="2" fill="rgba(107, 130, 104, 0.3)" />
      </g>

      {/* Gradient definitions */}
      <defs>
        <linearGradient id="warmGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(107, 130, 104, 0.2)" />
          <stop offset="100%" stopColor="var(--color-indigo-200)" />
        </linearGradient>
      </defs>
    </svg>
  );
};
