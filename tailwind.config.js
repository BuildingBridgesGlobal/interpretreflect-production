/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			colors: {
				sage: {
					50: "#f6f7f4",
					100: "#e8ebe3",
					200: "#d3d9c8",
					300: "#b3bfa4",
					400: "#8fa07a",
					500: "#6B8B60",
					600: "#5F7F55",
					700: "#4a6243",
					800: "#3d5037",
					900: "#334330",
				},
			},
		},
	},
	plugins: [],
};
