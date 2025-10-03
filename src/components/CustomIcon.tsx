import React from "react";

export type IconType =
	| "heart-pulse"
	| "notepad"
	| "hourglass-person"
	| "community"
	| "growth"
	| "secure-lock"
	| "target"
	| "chat-bubble";

interface CustomIconProps {
	type: IconType;
	size?: number;
	className?: string;
}

const iconPositions = {
	"heart-pulse": { x: 0, y: 0 },
	notepad: { x: 1, y: 0 },
	"hourglass-person": { x: 2, y: 0 },
	community: { x: 3, y: 0 },
	growth: { x: 0, y: 1 },
	"secure-lock": { x: 1, y: 1 },
	target: { x: 2, y: 1 },
	"chat-bubble": { x: 3, y: 1 },
};

export function CustomIcon({
	type,
	size = 24,
	className = "",
}: CustomIconProps) {
	const position = iconPositions[type];

	// The image appears to be 384x192 pixels (4 icons x 2 rows)
	// Each icon is 96x96 pixels
	const spriteWidth = 384;
	const spriteHeight = 192;
	const iconWidth = spriteWidth / 4;
	const iconHeight = spriteHeight / 2;

	// Calculate scale factor for crisp rendering
	const scale = size / iconWidth;

	const style = {
		width: `${size}px`,
		height: `${size}px`,
		backgroundImage: "url(/icons.png)",
		backgroundSize: `${spriteWidth * scale}px ${spriteHeight * scale}px`,
		backgroundPosition: `-${position.x * iconWidth * scale}px -${position.y * iconHeight * scale}px`,
		backgroundRepeat: "no-repeat",
		display: "inline-block",
		imageRendering: "auto" as any, // Let browser optimize
		WebkitFontSmoothing: "antialiased" as any,
		MozOsxFontSmoothing: "grayscale" as any,
		WebkitBackfaceVisibility: "hidden" as any,
		transform: "translateZ(0) scale(1.001)", // Slight scale to trigger GPU
		willChange: "transform",
	};

	return (
		<span
			className={`custom-icon ${className}`}
			style={style}
			aria-label={type.replace("-", " ")}
		/>
	);
}

// Convenience components for each icon type
export const HeartPulseIcon = (props: Omit<CustomIconProps, "type">) => (
	<CustomIcon type="heart-pulse" {...props} />
);

export const NotepadIcon = (props: Omit<CustomIconProps, "type">) => (
	<CustomIcon type="notepad" {...props} />
);

export const HourglassPersonIcon = (props: Omit<CustomIconProps, "type">) => (
	<CustomIcon type="hourglass-person" {...props} />
);

export const CommunityIcon = (props: Omit<CustomIconProps, "type">) => (
	<CustomIcon type="community" {...props} />
);

export const GrowthIcon = (props: Omit<CustomIconProps, "type">) => (
	<CustomIcon type="growth" {...props} />
);

export const SecureLockIcon = (props: Omit<CustomIconProps, "type">) => (
	<CustomIcon type="secure-lock" {...props} />
);

export const TargetIcon = (props: Omit<CustomIconProps, "type">) => (
	<CustomIcon type="target" {...props} />
);

export const ChatBubbleIcon = (props: Omit<CustomIconProps, "type">) => (
	<CustomIcon type="chat-bubble" {...props} />
);
