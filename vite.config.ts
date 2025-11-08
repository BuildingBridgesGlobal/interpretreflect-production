import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		react(),
		VitePWA({
			registerType: "autoUpdate",
			disable: process.env.NODE_ENV === 'development', // Disable service worker in dev mode
			includeAssets: ["favicon.svg", "favicon.ico", "apple-touch-icon.png"],
			manifest: {
				name: "InterpretReflect",
				short_name: "InterpretReflect",
				description: "The wellness platform for interpreters. Prevent burnout, manage vicarious trauma, and maintain healthy boundaries.",
				theme_color: "#5C7F4F",
				background_color: "#FAF9F6",
				display: "standalone",
				scope: "/",
				start_url: "/",
				orientation: "portrait-primary",
				categories: ["health", "wellness", "productivity"],
				icons: [
					{
						src: "/favicon-192x192.png",
						sizes: "192x192",
						type: "image/png",
						purpose: "any maskable"
					},
					{
						src: "/favicon-512x512.png",
						sizes: "512x512",
						type: "image/png",
						purpose: "any maskable"
					}
				]
			},
			workbox: {
				globPatterns: ["**/*.{js,css,html,ico,png,svg,woff,woff2}"],
				runtimeCaching: [
					{
						urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
						handler: "NetworkFirst",
						options: {
							cacheName: "supabase-cache",
							expiration: {
								maxEntries: 50,
								maxAgeSeconds: 60 * 60 * 24 // 24 hours
							},
							cacheableResponse: {
								statuses: [0, 200]
							}
						}
					},
					{
						urlPattern: /^https:\/\/agenticflow\.ai\/.*/i,
						handler: "NetworkFirst",
						options: {
							cacheName: "agenticflow-cache",
							expiration: {
								maxEntries: 10,
								maxAgeSeconds: 60 * 60 // 1 hour
							}
						}
					}
				]
			}
		})
	],
	server: {
		port: 5173,
		host: true, // Allow external connections
	},
	optimizeDeps: {
		exclude: ["lucide-react"],
	},
	build: {
		rollupOptions: {
			output: {
				manualChunks: {
					// Vendor chunks
					'react-vendor': ['react', 'react-dom', 'react-router-dom'],
					'supabase-vendor': ['@supabase/supabase-js'],
					'stripe-vendor': ['@stripe/stripe-js', '@stripe/react-stripe-js'],
					'chart-vendor': ['recharts'],

					// Reflection components chunk
					'reflections': [
						'./src/components/BIPOCWellnessReflection.tsx',
						'./src/components/DeafInterpreterReflection.tsx',
						'./src/components/DirectCommunicationReflection.tsx',
						'./src/components/DecideFrameworkReflection.tsx',
						'./src/components/NeurodivergentInterpreterReflection.tsx',
					],

					// Wellness tools chunk
					'wellness-tools': [
						'./src/components/InSessionSelfCheck.tsx',
						'./src/components/WellnessCheckInAccessible.tsx',
						'./src/components/PostAssignmentDebriefAccessible.tsx',
					],

					// Prep and mentoring chunk
					'prep-mentoring': [
						'./src/components/PreAssignmentPrepV5.tsx',
						'./src/components/PreAssignmentPrepV6.tsx',
						'./src/components/MentoringPrepAccessible.tsx',
						'./src/components/MentoringReflectionAccessible.tsx',
					],

					// Teaming chunk
					'teaming': [
						'./src/components/TeamingPrepEnhanced.tsx',
						'./src/components/TeamingReflectionEnhanced.tsx',
						'./src/components/InSessionTeamSync.tsx',
					],
				},
			},
		},
		chunkSizeWarningLimit: 1000, // Increase to 1000kb to reduce warnings
		minify: 'esbuild',
		esbuild: {
			drop: ['console', 'debugger'], // Remove all console.* and debugger statements in production
		},
	},
});
