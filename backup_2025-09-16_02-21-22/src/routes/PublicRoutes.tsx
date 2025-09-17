import React from 'react';
import { Route } from 'react-router-dom';

// Page imports
import { PrivacyPolicy } from '../pages/PrivacyPolicy';
import { TermsOfService } from '../pages/TermsOfService';
import { Contact } from '../pages/Contact';
import { About } from '../pages/About';
import { Accessibility } from '../pages/Accessibility';
import { PricingProduction } from '../pages/PricingProduction';
import { PricingNew } from '../pages/PricingNew';
import { PricingTest } from '../pages/PricingTest';
import { PaymentSuccess } from '../pages/PaymentSuccess';

/**
 * Public routes that don't require authentication
 * These are standalone pages with their own layouts
 */
export const publicRoutes = (
  <>
    {/* Legal and Info Pages */}
    <Route path="/privacy" element={<PrivacyPolicy />} />
    <Route path="/terms" element={<TermsOfService />} />
    <Route path="/contact" element={<Contact />} />
    <Route path="/about" element={<About />} />
    <Route path="/accessibility" element={<Accessibility />} />
    
    {/* Pricing Pages */}
    <Route path="/pricing" element={<PricingProduction />} />
    <Route path="/pricing-old" element={<PricingNew />} />
    <Route path="/pricing-test" element={<PricingTest />} />
    
    {/* Payment Success */}
    <Route path="/payment-success" element={<PaymentSuccess />} />
  </>
);