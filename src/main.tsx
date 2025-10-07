import "./utils/suppressExtensionErrors";
import "./utils/preventDuplicateElements";
import "./utils/unregisterServiceWorker";
import { testSupabaseAccess } from "./utils/testSupabaseAccess";
import { testBurnoutDirectly } from "./utils/testBurnoutDirectly";
import { testBurnoutComplete } from "./utils/testBurnoutComplete";
import { initializeMobileOptimizations } from "./utils/mobileOptimization";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

import App from "./App.tsx";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { AuthProvider } from "./contexts/AuthContext";
import "./index.css";
import "./styles/accessibility.css";
import "./styles/typography.css";
import "./styles/header.css";
import "./styles/accessibleColors.css";
import "./styles/yellowSelection.css";
import "./styles/icons.css";

// Disable console logs in production for better performance and security
if (import.meta.env.PROD) {
	console.log = () => {};
	console.warn = () => {};
	// Keep console.error for critical issues
}

console.log("Main.tsx is loading...");

// Initialize mobile optimizations
initializeMobileOptimizations();

const rootElement = document.getElementById("root");
console.log("Root element found:", rootElement);

if (rootElement) {
	createRoot(rootElement).render(
		<StrictMode>
			<ErrorBoundary>
				<BrowserRouter>
					<AuthProvider>
						<App />
						<Analytics />
						<SpeedInsights />
					</AuthProvider>
				</BrowserRouter>
			</ErrorBoundary>
		</StrictMode>,
	);
	console.log("React app mounted successfully");

	// Make test functions available globally
	(window as any).testSupabaseAccess = testSupabaseAccess;
	(window as any).testBurnoutDirectly = testBurnoutDirectly;
	(window as any).testBurnoutComplete = testBurnoutComplete;
	console.log("Supabase test functions available:");
	console.log("- Run 'testSupabaseAccess()' for general diagnosis");
	console.log("- Run 'testBurnoutDirectly()' to test burnout table specifically");
	console.log("- Run 'testBurnoutComplete()' to test complete save/fetch flow");
} else {
	console.error("Root element not found!");
}
