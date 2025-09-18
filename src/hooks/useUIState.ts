import { useState } from 'react';

export interface UIState {
  // Navigation
  activeTab: string;
  activeCategory: string;
  structuredSubTab: string;
  insightsTimePeriod: string;

  // UI Elements
  showUserDropdown: boolean;
  selectedTechnique: string | null;
  selectedContextCategory: string | null;
  selectedSkillCategory: string | null;

  // Security
  showPrivacyConsent: boolean;
  showSessionWarning: boolean;
  sessionTimeRemaining: number;

  // Welcome
  showWelcomeModal: boolean;
}

export interface UIActions {
  // Navigation
  setActiveTab: (tab: string) => void;
  setActiveCategory: (category: string) => void;
  setStructuredSubTab: (subTab: string) => void;
  setInsightsTimePeriod: (period: string) => void;

  // UI Elements
  setShowUserDropdown: (show: boolean) => void;
  setSelectedTechnique: (technique: string | null) => void;
  setSelectedContextCategory: (category: string | null) => void;
  setSelectedSkillCategory: (category: string | null) => void;

  // Security
  setShowPrivacyConsent: (show: boolean) => void;
  setShowSessionWarning: (show: boolean) => void;
  setSessionTimeRemaining: (time: number) => void;

  // Welcome
  setShowWelcomeModal: (show: boolean) => void;

  // Utility functions
  resetUIState: () => void;
}

const initialUIState: UIState = {
  // Navigation
  activeTab: 'home',
  activeCategory: 'structured',
  structuredSubTab: 'reflections',
  insightsTimePeriod: 'month',

  // UI Elements
  showUserDropdown: false,
  selectedTechnique: null,
  selectedContextCategory: null,
  selectedSkillCategory: null,

  // Security
  showPrivacyConsent: false,
  showSessionWarning: false,
  sessionTimeRemaining: 0,

  // Welcome
  showWelcomeModal: false,
};

export const useUIState = (): UIState & UIActions => {
  const [uiState, setUIState] = useState<UIState>(initialUIState);

  const actions: UIActions = {
    // Navigation
    setActiveTab: (tab: string) =>
      setUIState(prev => ({ ...prev, activeTab: tab })),

    setActiveCategory: (category: string) =>
      setUIState(prev => ({ ...prev, activeCategory: category })),

    setStructuredSubTab: (subTab: string) =>
      setUIState(prev => ({ ...prev, structuredSubTab: subTab })),

    setInsightsTimePeriod: (period: string) =>
      setUIState(prev => ({ ...prev, insightsTimePeriod: period })),

    // UI Elements
    setShowUserDropdown: (show: boolean) =>
      setUIState(prev => ({ ...prev, showUserDropdown: show })),

    setSelectedTechnique: (technique: string | null) =>
      setUIState(prev => ({ ...prev, selectedTechnique: technique })),

    setSelectedContextCategory: (category: string | null) =>
      setUIState(prev => ({ ...prev, selectedContextCategory: category })),

    setSelectedSkillCategory: (category: string | null) =>
      setUIState(prev => ({ ...prev, selectedSkillCategory: category })),

    // Security
    setShowPrivacyConsent: (show: boolean) =>
      setUIState(prev => ({ ...prev, showPrivacyConsent: show })),

    setShowSessionWarning: (show: boolean) =>
      setUIState(prev => ({ ...prev, showSessionWarning: show })),

    setSessionTimeRemaining: (time: number) =>
      setUIState(prev => ({ ...prev, sessionTimeRemaining: time })),

    // Welcome
    setShowWelcomeModal: (show: boolean) =>
      setUIState(prev => ({ ...prev, showWelcomeModal: show })),

    // Utility functions
    resetUIState: () => setUIState(initialUIState),
  };

  return {
    ...uiState,
    ...actions,
  };
};

export default useUIState;