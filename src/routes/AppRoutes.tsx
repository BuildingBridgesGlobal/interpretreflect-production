import type React from "react";
import { Route, Routes } from "react-router-dom";
import { BillingPlanDetails } from "../components/BillingPlanDetails";
import { CustomizePreferences } from "../components/CustomizePreferences";
import { GrowthInsights } from "../components/GrowthInsights";
import { GrowthInsightsDashboard } from "../components/GrowthInsightsDashboard";
import { ManageSubscription } from "../components/ManageSubscription";
import { PreAssignmentPrepV5 } from "../components/PreAssignmentPrepV5";
import { ProfileSettings } from "../components/ProfileSettings";
// Component imports
import LandingPageEnhanced from "../LandingPageEnhanced";
import { About } from "../pages/About";
import { Accessibility } from "../pages/Accessibility";
import { AdminDashboard } from "../pages/AdminDashboard";
import { AuthTest } from "../pages/AuthTest";
import { Contact } from "../pages/Contact";
import { HeaderDemo } from "../pages/HeaderDemo";
// Page imports
import { PaymentSuccess } from "../pages/PaymentSuccess";
import { PricingNew } from "../pages/PricingNew";
import { PricingProduction } from "../pages/PricingProduction";
import { PricingTest } from "../pages/PricingTest";
import { PrivacyPolicy } from "../pages/PrivacyPolicy";
import { TermsOfService } from "../pages/TermsOfService";
import { EnchargeTest } from "../pages/EnchargeTest";
import { CognitiveLoadDashboard } from "../components/CognitiveLoadDashboard";
import { EmotionalLaborCalculator } from "../components/EmotionalLaborCalculator";

interface AppRoutesProps {
	devMode: boolean;
	setDevMode: (value: boolean) => void;
	mainContent: React.ReactNode;
}

export const AppRoutes: React.FC<AppRoutesProps> = ({
	devMode,
	setDevMode,
	mainContent,
}) => {
	return (
		<Routes>
			{/* Public routes */}
			<Route path="/privacy" element={<PrivacyPolicy />} />
			<Route path="/terms" element={<TermsOfService />} />
			<Route path="/contact" element={<Contact />} />
			<Route path="/about" element={<About />} />
			<Route path="/accessibility" element={<Accessibility />} />

			{/* Pricing routes */}
			<Route path="/pricing" element={<PricingProduction />} />
			<Route path="/pricing-old" element={<PricingNew />} />
			<Route path="/pricing-test" element={<PricingTest />} />

			{/* Admin routes */}
			<Route path="/admin" element={<AdminDashboard />} />
			<Route path="/header-demo" element={<HeaderDemo />} />

			{/* Payment routes */}
			<Route path="/payment-success" element={<PaymentSuccess />} />

			{/* Landing and onboarding */}
			<Route
				path="/landing"
				element={<LandingPageEnhanced onGetStarted={() => setDevMode(true)} />}
			/>

			{/* Growth and insights */}
			<Route path="/growth-insights" element={<GrowthInsights />} />
			<Route path="/growth-dashboard" element={<GrowthInsightsDashboard />} />

			{/* Testing routes */}
			<Route path="/auth-test" element={<AuthTest />} />
			<Route path="/encharge-test" element={<EnchargeTest />} />

			{/* Patent Technology Routes */}
			<Route path="/cognitive-load" element={<CognitiveLoadDashboard />} />
			<Route path="/emotional-labor" element={<EmotionalLaborCalculator />} />

			{/* Assignment routes */}
			<Route path="/pre-assignment" element={<PreAssignmentPrepV5 />} />

			{/* Profile and settings */}
			<Route
				path="/profile-settings"
				element={<ProfileSettings devMode={devMode} />}
			/>
			<Route path="/customize-preferences" element={<CustomizePreferences />} />
			<Route path="/manage-subscription" element={<ManageSubscription />} />
			<Route path="/billing-plan-details" element={<BillingPlanDetails />} />

			{/* Default route - Main application */}
			<Route path="*" element={mainContent} />
		</Routes>
	);
};
