import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { TermsModal } from './TermsModal';
import { termsService } from '../services/termsService';
import { useNavigate, useLocation } from 'react-router-dom';

export const TermsAcceptanceMonitor: React.FC = () => {
  const { user, needsTermsAcceptance, checkTermsAcceptance, handleTermsAccepted } = useAuth();
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Pages that should be accessible without terms acceptance
  const exemptPaths = ['/terms', '/privacy', '/logout', '/support'];

  useEffect(() => {
    const checkTerms = async () => {
      if (!user || hasChecked) return;

      // Skip check on exempt pages
      if (exemptPaths.includes(location.pathname)) {
        return;
      }

      // Check if user needs to accept terms
      await checkTermsAcceptance();
      setHasChecked(true);
    };

    checkTerms();
  }, [user, location.pathname]);

  useEffect(() => {
    // Show modal if user needs to accept terms and we're not on an exempt page
    if (needsTermsAcceptance && user && !exemptPaths.includes(location.pathname)) {
      setShowTermsModal(true);
    }
  }, [needsTermsAcceptance, user, location.pathname]);

  const handleAcceptedCallback = async () => {
    setShowTermsModal(false);
    // Call the context's handler to update state
    await handleTermsAccepted();
    // Optionally navigate to dashboard or refresh current page
    if (location.pathname === '/') {
      navigate('/dashboard');
    } else {
      // Reload the current page to continue
      window.location.reload();
    }
  };

  // Don't render anything if no user or no need for terms
  if (!user || !needsTermsAcceptance) {
    return null;
  }

  return (
    <TermsModal
      isOpen={showTermsModal}
      onAccept={handleAcceptedCallback}
      canClose={false}
      showPrivacy={true}
    />
  );
};