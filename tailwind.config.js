/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			// DeafSpace Design Principles - High Contrast, Visual Clarity
			fontSize: {
				'base': '1.125rem', // 18px - larger base for accessibility
				'xs': '0.875rem',
				'sm': '1rem',
				'lg': '1.25rem',
				'xl': '1.5rem',
				'2xl': '1.875rem',
				'3xl': '2.25rem',
				'4xl': '3rem',
			},
			spacing: {
				// Ample whitespace for visual clarity (DeafSpace principle)
				'rhythm': '1.5rem',
			},
			borderRadius: {
				// Softer, more organic shapes (DeafSpace principle)
				'deafspace': '1.5rem',
			},
			colors: {
				// InterpretReflect Brand Colors - WCAG AAA Compliant
				brand: {
					// Primary Green (Logo) - Growth & Renewal
					primary: "#5C7F4F",
					"primary-hover": "#4A6A3F",
					"primary-light": "#E8F3E5",

					// Calm Blue - Clarity & Trust (Data/Insights)
					blue: "#4A7C9B",
					"blue-light": "#E8F1F7",

					// Warm Taupe - Grounding & Humanity
					taupe: "#6B5B4A",
					"taupe-light": "#F5F3F1",

					// Functional Colors
					warning: "#C07A3B",
					"warning-light": "#FEF3E8",
					error: "#B94A48",
					"error-light": "#FDEEED",
					success: "#5C7F4F",
					"success-light": "#E8F3E5",
				},
				// Legacy sage colors (keeping for backwards compatibility)
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
