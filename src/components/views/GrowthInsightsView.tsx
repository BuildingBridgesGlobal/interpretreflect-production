import React from 'react';
import { GrowthInsights } from '../GrowthInsights';

interface GrowthInsightsViewProps {
  savedReflections: any[];
  burnoutData: any[];
  showSummaryView: 'weekly' | 'monthly';
  setShowSummaryView: (view: 'weekly' | 'monthly') => void;
}

export const GrowthInsightsView: React.FC<GrowthInsightsViewProps> = ({
  savedReflections,
  burnoutData,
  showSummaryView,
  setShowSummaryView,
}) => {
  // This is a wrapper that could be expanded later
  // For now, it delegates to the existing GrowthInsights component
  return (
    <main
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      role="main"
      aria-labelledby="growth-insights-heading"
    >
      <GrowthInsights />
    </main>
  );
};