import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPageEnhanced from './LandingPageEnhanced';
import { Header } from './components/layout/Header';
import { NavigationTabs } from './components/layout/NavigationTabs';
import { useAuth } from './contexts/AuthContext';
import { PrivacyConsent } from './components/PrivacyConsent';
import { SecurityBanner, SessionTimeoutModal } from './components/SecurityBanner';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsOfService } from './pages/TermsOfService';
import { Contact } from './pages/Contact';
import { About } from './pages/About';
import { Accessibility } from './pages/Accessibility';
import { PricingNew } from './pages/PricingNew';
import { AdminDashboard } from './pages/AdminDashboard';
import { HeaderDemo } from './pages/HeaderDemo';
import { PaymentSuccess } from './pages/PaymentSuccess';
import { AuthTest } from './pages/AuthTest';
import { SyncStatusIndicator } from './components/SyncStatusIndicator';
import { runDatabaseCheck } from './utils/checkDatabaseStatus';

// Import our new hooks
import { useModalState } from './hooks/useModalState';
import { useUIState } from './hooks/useUIState';
import { useDataState } from './hooks/useDataState';
import { useTechniqueState } from './hooks/useTechniqueState';

// Import extracted components
import StressResetSection from './components/StressResetSection';

// Import existing components (to be gradually replaced)
import { PersonalizedHomepage } from './components/PersonalizedHomepage';
import { AgenticFlowChat } from './components/AgenticFlowChat';
import { OnboardingFlow } from './components/OnboardingFlow';
import { useOnboarding } from './hooks/useOnboarding';

function AppRefactored() {
  const { user, loading, signOut, extendSession } = useAuth();
  const {
    isVisible: onboardingVisible,
    completeOnboarding,
    hideOnboarding
  } = useOnboarding();

  // Use our extracted hooks
  const modalState = useModalState();
  const uiState = useUIState();
  const dataState = useDataState();
  const techniqueState = useTechniqueState();

  // Automatically enable dev mode in development environment
  const [devMode, setDevMode] = React.useState(
    import.meta.env.DEV ||
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  );

  // Load saved tab preference or default to home
  React.useEffect(() => {
    const savedTab = localStorage.getItem('preferredTab');
    if (savedTab) {
      uiState.setActiveTab(savedTab);
    }
  }, []);

  // Save tab preference when it changes
  React.useEffect(() => {
    if (uiState.activeTab) {
      localStorage.setItem('preferredTab', uiState.activeTab);
    }
  }, [uiState.activeTab]);

  // Check for privacy consent on mount
  useEffect(() => {
    const checkPrivacyConsent = () => {
      const consent = localStorage.getItem('privacyConsent');
      if (!consent && user) {
        uiState.setShowPrivacyConsent(true);
      }
    };
    checkPrivacyConsent();
  }, [user]);

  // Listen for session warning events
  useEffect(() => {
    const handleSessionWarning = (event: CustomEvent) => {
      uiState.setSessionTimeRemaining(event.detail.timeRemaining);
      uiState.setShowSessionWarning(true);
    };

    window.addEventListener('sessionWarning', handleSessionWarning as EventListener);
    return () => {
      window.removeEventListener('sessionWarning', handleSessionWarning as EventListener);
    };
  }, []);

  // Helper function to save a reflection
  const saveReflection = async (type: string, data: Record<string, unknown>) => {
    console.log('App.tsx - saveReflection called with:', { type, data });

    // If user is authenticated, save to Supabase
    if (user?.id) {
      const { reflectionService } = await import('./services/reflectionService');
      const result = await reflectionService.saveReflection(user.id, type, data);

      console.log('App.tsx - Save result:', result);

      if (result.success) {
        console.log('Reflection saved to Supabase successfully');
        // Still update local state for immediate UI feedback
        const newReflection = {
          id: result.id || Date.now().toString(),
          type,
          data,
          timestamp: new Date().toISOString(),
        };
        dataState.addReflection(newReflection);
        console.log('App.tsx - Updated savedReflections:', dataState.savedReflections);
      } else {
        console.error('Failed to save to Supabase:', result.error);
        // Fall back to localStorage if Supabase fails
        const newReflection = {
          id: Date.now().toString(),
          type,
          data,
          timestamp: new Date().toISOString(),
        };
        dataState.addReflection(newReflection);
        localStorage.setItem('savedReflections', JSON.stringify(dataState.savedReflections));
      }
    } else {
      // Not authenticated or in dev mode - use localStorage
      const newReflection = {
        id: Date.now().toString(),
        type,
        data,
        timestamp: new Date().toISOString(),
      };

      dataState.addReflection(newReflection);
      localStorage.setItem('savedReflections', JSON.stringify(dataState.savedReflections));
    }
  };

  // Helper function to track technique start
  const trackTechniqueStart = (technique: string) => {
    const usage = {
      id: Date.now().toString(),
      technique,
      startTime: new Date().toISOString(),
      completed: false,
      stressLevelBefore: null,
      stressLevelAfter: null,
    };

    dataState.addTechniqueUsage(usage);
    localStorage.setItem('techniqueUsage', JSON.stringify(dataState.techniqueUsage));

    // Also track start in Supabase if user is authenticated
    if (user?.id) {
      import('./services/reflectionService').then(({ reflectionService }) => {
        reflectionService.saveStressResetLog(user.id, technique, {
          notes: `Started ${technique} technique`
        }).catch(console.error);
      });
    }

    return usage.id;
  };

  // Helper function to track technique completion
  const trackTechniqueComplete = (techniqueId: string, duration: number | string) => {
    const updatedUsage = dataState.techniqueUsage.map(usage => {
      if (usage.id === techniqueId) {
        return {
          ...usage,
          completed: true,
          duration,
          endTime: new Date().toISOString(),
        };
      }
      return usage;
    });

    dataState.setTechniqueUsage(updatedUsage);
    localStorage.setItem('techniqueUsage', JSON.stringify(updatedUsage));

    // Save completion to Supabase if user is authenticated
    if (user?.id) {
      const completedTechnique = updatedUsage.find(u => u.id === techniqueId);
      if (completedTechnique?.technique) {
        const durationMinutes = typeof duration === 'number' ? Math.round(duration / 60) : 5;
        import('./services/reflectionService').then(({ reflectionService }) => {
          reflectionService.saveStressResetLog(user.id, completedTechnique.technique, {
            duration: durationMinutes,
            stressLevelBefore: completedTechnique.stressLevelBefore ?? undefined,
            stressLevelAfter: completedTechnique.stressLevelAfter ?? undefined,
            notes: `Completed ${completedTechnique.technique} technique`
          }).catch(console.error);
        });
      }
    }
  };

  // Show landing page if not authenticated and not in dev mode
  if (!devMode && !user && !loading) {
    return (
      <Routes>
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
        <Route path="/accessibility" element={<Accessibility />} />
        <Route path="/pricing" element={<PricingNew />} />
        <Route path="/landing" element={<LandingPageEnhanced onGetStarted={() => setDevMode(true)} />} />
        <Route path="*" element={
          <>
            <LandingPageEnhanced onGetStarted={() => setDevMode(true)} />
            {/* Dev Mode Toggle for Testing */}
            <button
              onClick={() => setDevMode(true)}
              className="fixed bottom-4 right-4 px-4 py-2 bg-red-600 text-white rounded-lg shadow-lg hover:bg-red-700 transition-colors text-sm font-medium z-50"
              title="Skip authentication for development"
            >
              🛠️ Enable Dev Mode
            </button>
          </>
        } />
      </Routes>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #FAF9F6 0%, #F0EDE8 100%)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show main app for authenticated users or dev mode
  return (
    <>
      {/* Data Sync Indicator */}
      <SyncStatusIndicator />

      {/* Database Status Check Button - TEMPORARY for testing */}
      {user && (
        <button
          onClick={async () => {
            console.log('Checking database status...');
            const status = await runDatabaseCheck();
            if (status?.allMigrationsApplied) {
              alert('✅ All database migrations are applied!');
            } else if (status) {
              alert(`⚠️ Missing ${status.missing} tables. Check console for details.`);
            }
          }}
          style={{
            position: 'fixed',
            bottom: '60px',
            right: '20px',
            zIndex: 9999,
            padding: '10px 20px',
            background: 'linear-gradient(135deg, #1b5e20, #2e7d32)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          Check DB Status
        </button>
      )}

      {/* Security Components */}
      <PrivacyConsent
        isOpen={uiState.showPrivacyConsent}
        onAccept={() => uiState.setShowPrivacyConsent(false)}
        onDecline={() => uiState.setShowPrivacyConsent(false)}
      />

      <SessionTimeoutModal
        isOpen={uiState.showSessionWarning}
        timeRemaining={uiState.sessionTimeRemaining}
        onExtend={() => {
          extendSession();
          uiState.setShowSessionWarning(false);
        }}
        onLogout={async () => {
          await signOut();
          uiState.setShowSessionWarning(false);
        }}
      />

      {/* Security Banner for authenticated users */}
      {user && <SecurityBanner type="info" />}

      <Routes>
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
        <Route path="/accessibility" element={<Accessibility />} />
        <Route path="/pricing" element={<PricingNew />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/header-demo" element={<HeaderDemo />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/auth-test" element={<AuthTest />} />
        <Route path="*" element={
          <div
            className="min-h-screen"
            style={{
              background: 'linear-gradient(180deg, #FAF9F6 0%, #F0EDE8 100%)',
              minHeight: '100vh',
            }}
          >
            {/* Skip to main content link for screen readers */}
            <a
              href="#main-content"
              className="skip-link"
            >
              Skip to main content
            </a>

            <Header
              user={user}
              devMode={devMode}
              showUserDropdown={uiState.showUserDropdown}
              setShowUserDropdown={uiState.setShowUserDropdown}
              setDevMode={setDevMode}
              signOut={signOut}
            />

            <NavigationTabs activeTab={uiState.activeTab} setActiveTab={uiState.setActiveTab} />

            {/* Main content area with proper semantic structure */}
            <main id="main-content" role="main" className="flex-1">
              {/* Premium Upgrade Banner - Show for free users */}
              {user && !devMode && uiState.activeTab === 'home' && (
                <div
                  className="mx-4 mt-4 p-4 rounded-xl flex items-center justify-between"
                  style={{
                    background: 'linear-gradient(135deg, rgba(27, 94, 32, 0.05), rgba(46, 125, 50, 0.05))',
                    border: '1px solid rgba(27, 94, 32, 0.2)',
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(135deg, rgb(27, 94, 32), rgb(46, 125, 50))',
                      }}
                    >
                      <span className="text-white text-xl">✨</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg" style={{ color: '#1A1A1A' }}>
                        Unlock Your Full Wellness Potential
                      </h3>
                      <p className="text-sm" style={{ color: '#666' }}>
                        Get unlimited access to Elya AI, advanced insights, and premium tools for just $12.99/month
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => window.open('https://buy.stripe.com/3cIcN5fYa7Ry2bA9i1b7y03', '_blank')}
                    className="px-6 py-2.5 rounded-lg font-semibold text-sm transition-all whitespace-nowrap"
                    style={{
                      background: 'linear-gradient(135deg, rgb(27, 94, 32), rgb(46, 125, 50))',
                      color: '#FFFFFF',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.05)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(27, 94, 32, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    Start Free Trial →
                  </button>
                </div>
              )}

              <div role="tabpanel" id={`${uiState.activeTab}-panel`} aria-labelledby={uiState.activeTab}>
                {uiState.activeTab === 'reflection' && (
                  <div className="text-center py-12">
                    <p className="text-lg">Reflection Studio - Coming Soon</p>
                    <p className="text-sm text-gray-600 mt-2">This section is being refactored for better performance</p>
                  </div>
                )}
                {uiState.activeTab === 'home' && (
                  <PersonalizedHomepage
                    onNavigate={uiState.setActiveTab}
                    reflections={dataState.savedReflections}
                  />
                )}
                {uiState.activeTab === 'stress' && (
                  <StressResetSection
                    onTechniqueStart={trackTechniqueStart}
                    onTechniqueComplete={trackTechniqueComplete}
                  />
                )}
                {uiState.activeTab === 'insights' && (
                  <div className="text-center py-12">
                    <p className="text-lg">Growth Insights - Coming Soon</p>
                    <p className="text-sm text-gray-600 mt-2">This section is being refactored for better performance</p>
                  </div>
                )}
              </div>
            </main>

            {/* AgenticFlow Chat */}
            <AgenticFlowChat />

            {/* Onboarding Flow Modal */}
            {onboardingVisible && (
              <OnboardingFlow
                onComplete={completeOnboarding}
                onClose={hideOnboarding}
              />
            )}
          </div>
        } />
      </Routes>
    </>
  );
}

export default AppRefactored;