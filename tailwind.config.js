/** @type {import('tailwindcss').Config} */
export default {
    content: ["./src/**/*.{js,ts,jsx,tsx}"],
    darkMode: 'class',
	theme: {
		extend: {
			// Performance Optimization Platform Design System
			fontFamily: {
				sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
				body: ['IBM Plex Sans', 'system-ui', 'sans-serif'],
				mono: ['JetBrains Mono', 'Consolas', 'monospace'],
			},
			fontSize: {
				'base': '1rem', // 16px - standard for performance platforms
				'xs': '0.75rem',
				'sm': '0.875rem',
				'lg': '1.125rem',
				'xl': '1.25rem',
				'2xl': '1.5rem',
				'3xl': '1.875rem',
				'4xl': '2.25rem',
				'5xl': '3rem',
			},
			spacing: {
				'grid': '1rem', // Tight, data-focused spacing
			},
			borderRadius: {
				'sharp': '0.25rem', // Sharper, more technical aesthetic
				'data': '0.5rem',
			},
			colors: {
				// InterpretReflect Performance Platform Colors
				brand: {
					// Primary - Deep Navy (Authority & Depth)
					primary: "#0A2463",
					"primary-hover": "#08193B",
					"primary-light": "#E8EBF2",
					"primary-dark": "#051230",

					// Energy - Orange (Achievement & Progress) - Professional middle-ground
					energy: "#E67E00",
					"energy-hover": "#CC7000",
					"energy-light": "#FFF4E6",
					"energy-dark": "#994D00",

					// Electric Cyan (Data & Analytics) - WCAG AA Compliant
					electric: "#0088BB",
					"electric-hover": "#006699",
					"electric-light": "#E5F9FF",
					"electric-glow": "rgba(0, 136, 187, 0.2)",

					// Slate Blue (Professional & Calm)
					slate: "#1B4965",
					"slate-hover": "#14374D",
					"slate-light": "#E9EEF1",

					// Warmth - Coral (Human Connection & Community)
					warmth: "#FF6B9D",
					"warmth-hover": "#E85A8A",
					"warmth-light": "#FFE8F0",

					// Coral (Legacy - keeping for backwards compatibility)
					coral: "#FF6B6B",
					"coral-hover": "#E85555",
					"coral-light": "#FFF0F0",

					// Neutrals - Charcoal & Cool Gray
					charcoal: "#2C3E50",
					"charcoal-light": "#374B5E",
					gray: {
						50: "#F8F9FA",
						100: "#E9ECEF",
						200: "#DEE2E6",
						300: "#CED4DA",
						400: "#ADB5BD",
						500: "#6C757D",
						600: "#495057",
						700: "#343A40",
						800: "#212529",
						900: "#0D1117",
					},

					// Success - Emerald (Achievement)
					success: "#10B981",
					"success-light": "#D1FAE5",
					"success-dark": "#065F46",

					// Warning - Amber (Attention)
					warning: "#F59E0B",
					"warning-light": "#FEF3C7",
					"warning-dark": "#92400E",

					// Error - Red (Critical)
					error: "#EF4444",
					"error-light": "#FEE2E2",
					"error-dark": "#991B1B",

					// Info - Blue (Insight)
					info: "#3B82F6",
					"info-light": "#DBEAFE",
					"info-dark": "#1E40AF",
				},
			},
			boxShadow: {
				'glow': '0 0 20px rgba(0, 136, 187, 0.3)',
				'glow-sm': '0 0 10px rgba(0, 136, 187, 0.2)',
				'data': '0 1px 3px rgba(10, 36, 99, 0.1)',
				'card': '0 2px 8px rgba(10, 36, 99, 0.08)',
				'card-hover': '0 4px 16px rgba(10, 36, 99, 0.12)',
			},
			animation: {
				'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
			},
			keyframes: {
				'pulse-glow': {
					'0%, 100%': {
						boxShadow: '0 0 20px rgba(0, 136, 187, 0.3)',
						opacity: '1'
					},
					'50%': {
						boxShadow: '0 0 30px rgba(0, 136, 187, 0.5)',
						opacity: '0.8'
					},
				},
			},
		},
	},
	plugins: [],
};
