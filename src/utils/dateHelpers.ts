/**
 * Date and time utility functions
 */

/**
 * Get human-readable time ago string
 */
export const getTimeAgo = (date: Date): string => {
	const now = new Date();
	const diff = now.getTime() - date.getTime();
	const minutes = Math.floor(diff / 60000);
	const hours = Math.floor(diff / 3600000);
	const days = Math.floor(diff / 86400000);

	if (minutes < 1) return "Just now";
	if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
	if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
	if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
	return date.toLocaleDateString();
};

/**
 * Format date for display
 */
export const formatDate = (date: Date | string): string => {
	const d = typeof date === "string" ? new Date(date) : date;
	return d.toLocaleDateString("en-US", {
		weekday: "long",
		month: "long",
		day: "numeric",
	});
};

/**
 * Check if date is within last N days
 */
export const isWithinDays = (date: Date | string, days: number): boolean => {
	const d = typeof date === "string" ? new Date(date) : date;
	const now = new Date();
	const diff = now.getTime() - d.getTime();
	return diff < days * 86400000;
};

/**
 * Get start of week
 */
export const getWeekStart = (date: Date = new Date()): Date => {
	const d = new Date(date);
	const day = d.getDay();
	const diff = d.getDate() - day;
	return new Date(d.setDate(diff));
};

/**
 * Get date N days ago
 */
export const getDaysAgo = (days: number): Date => {
	const date = new Date();
	date.setDate(date.getDate() - days);
	return date;
};
