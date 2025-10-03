import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Page imports
import { PrivacyPolicy } from '../pages/PrivacyPolicy';
import { TermsOfService } from '../pages/TermsOfService';
import { Contact } from '../pages/Contact';
import { About } from '../pages/About';
import { Accessibility } from '../pages/Accessibility';
import { PricingNew } from '../pages/PricingNew';
import { PricingTest } from '../pages/PricingTest';
import { PricingProduction } from '../pages/PricingProduction';
import { AdminDashboard } from '../pages/AdminDashboard';
import { HeaderDemo } from '../pages/HeaderDemo';
import { PaymentSuccess } from '../pages/PaymentSuccess';
import { AuthTest } from '../pages/AuthTest';

// Component imports
import LandingPageEnhanced from '../LandingPageEnhanced';
import { PreAssignmentPrepV5 } from '../components/PreAssignmentPrepV5';
import { ProfileSettings } from '../components/ProfileSettings';
import { CustomizePreferences } from '../components/CustomizePreferences';
import { ManageSubscription } from '../components/ManageSubscription';
import { BillingPlanDetails } from '../components/BillingPlanDetails';
import { GrowthInsights } from '../components/GrowthInsights';
import { GrowthInsightsDashboard } from '../components/GrowthInsightsDashboard';

interface AppRoutesProps {
  devMode: boolean;
  setDevMode: (value: boolean) => void;
  mainContent: React.ReactNode;
}

export const AppRoutes: React.FC<AppRoutesProps> = ({ devMode, setDevMode, mainContent }) => {
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
      <Route path="/landing" element={<LandingPageEnhanced onGetStarted={() => setDevMode(true)} />} />
      
      {/* Growth and insights */}
      <Route path="/growth-insights" element={<GrowthInsights />} />
      <Route path="/growth-dashboard" element={<GrowthInsightsDashboard />} />
      
      {/* Testing routes */}
      <Route path="/auth-test" element={<AuthTest />} />
      
      {/* Assignment routes */}
      <Route path="/pre-assignment" element={<PreAssignmentPrepV5 />} />
      
      {/* Profile and settings */}
      <Route path="/profile-settings" element={<ProfileSettings devMode={devMode} />} />
      <Route path="/customize-preferences" element={<CustomizePreferences />} />
      <Route path="/manage-subscription" element={<ManageSubscription />} />
      <Route path="/billing-plan-details" element={<BillingPlanDetails />} />
      
      {/* Default route - Main application */}
      <Route path="*" element={mainContent} />
    </Routes>
  );
};