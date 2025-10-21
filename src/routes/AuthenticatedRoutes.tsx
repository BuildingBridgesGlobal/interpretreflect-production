import React from "react";
import { Route } from "react-router-dom";
import { BillingPlanDetails } from "../components/BillingPlanDetails";
import { CustomizePreferences } from "../components/CustomizePreferences";
import { GrowthInsights } from "../components/GrowthInsights";
import { GrowthInsightsDashboard } from "../components/GrowthInsightsDashboard";
import { ManageSubscription } from "../components/ManageSubscription";
import { PreAssignmentPrepV5 } from "../components/PreAssignmentPrepV5";
import { ProfileSettingsSimplified as ProfileSettings } from "../components/ProfileSettingsSimplified";
// Component imports
import LandingPageEnhanced from "../LandingPageEnhanced";
import { AdminDashboard } from "../pages/AdminDashboard";
import { AuthTest } from "../pages/AuthTest";
import { HeaderDemo } from "../pages/HeaderDemo";

interface AuthenticatedRoutesProps {
	devMode: boolean;
	setDevMode: (value: boolean) => void;
}

/**
 * Routes that require authentication or are part of the main app
 */
export const authenticatedRoutes = ({
	devMode,
	setDevMode,
}: AuthenticatedRoutesProps) => (
	<>
		{/* Admin and Testing */}
		<Route path="/admin" element={<AdminDashboard />} />
		<Route path="/header-demo" element={<HeaderDemo />} />
		<Route path="/auth-test" element={<AuthTest />} />

		{/* Landing */}
		<Route
			path="/landing"
			element={<LandingPageEnhanced onGetStarted={() => setDevMode(true)} />}
		/>

		{/* Growth and Insights */}
		<Route path="/growth-insights" element={<GrowthInsights />} />
		<Route path="/growth-dashboard" element={<GrowthInsightsDashboard />} />

		{/* Assignments */}
		<Route path="/pre-assignment" element={<PreAssignmentPrepV5 />} />

		{/* Profile and Settings */}
		<Route
			path="/profile-settings"
			element={<ProfileSettings devMode={devMode} />}
		/>
		<Route path="/customize-preferences" element={<CustomizePreferences />} />
		<Route path="/manage-subscription" element={<ManageSubscription />} />
		<Route path="/billing-plan-details" element={<BillingPlanDetails />} />
	</>
);
