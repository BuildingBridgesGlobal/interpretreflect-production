import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	server: {
		port: 5173,
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
						'./src/components/EthicsMeaningCheckAccessible.tsx',
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
