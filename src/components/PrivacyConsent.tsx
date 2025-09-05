import React, { useState, useEffect } from 'react';
import { Shield, Lock, Eye, Database, Clock, AlertCircle, Check, X } from 'lucide-react';
import { SECURITY_CONFIG, SECURITY_MESSAGES } from '../config/security';
import { AuditLogger } from '../utils/security';

interface PrivacyConsentProps {
  isOpen: boolean;
  onAccept: () => void;
  onDecline?: () => void;
  required?: boolean;
}

export const PrivacyConsent: React.FC<PrivacyConsentProps> = ({
  isOpen,
  onAccept,
  onDecline,
  required = true,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);

  useEffect(() => {
    // Check if consent was previously given
    const previousConsent = localStorage.getItem('privacyConsent');
    if (previousConsent) {
      const consentData = JSON.parse(previousConsent);
      const daysSinceConsent = (Date.now() - consentData.timestamp) / (1000 * 60 * 60 * 24);
      
      // Re-ask for consent every 90 days
      if (daysSinceConsent < 90) {
        setConsentGiven(true);
      }
    }
  }, []);

  if (!isOpen || consentGiven) return null;

  const handleAccept = () => {
    const consentData = {
      timestamp: Date.now(),
      version: '1.0',
      gdpr: SECURITY_CONFIG.privacy.gdprCompliant,
      hipaa: SECURITY_CONFIG.privacy.hipaaCompliant,
    };
    
    localStorage.setItem('privacyConsent', JSON.stringify(consentData));
    setConsentGiven(true);
    
    // Log consent
    AuditLogger.log({
      action: 'PRIVACY_CONSENT_ACCEPTED',
      category: 'DATA',
      severity: 'INFO',
      details: consentData,
    });
    
    onAccept();
  };

  const handleDecline = () => {
    AuditLogger.log({
      action: 'PRIVACY_CONSENT_DECLINED',
      category: 'DATA',
      severity: 'INFO',
    });
    
    if (onDecline) {
      onDecline();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Privacy & Security Notice</h2>
                <p className="text-sm text-gray-600 mt-1">Your data protection is our priority</p>
              </div>
            </div>
            {!required && (
              <button
                onClick={handleDecline}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            )}
          </div>
        </div>

        <div className="p-6">
          {/* Key Privacy Points */}
          <div className="space-y-4 mb-6">
            <div className="flex items-start space-x-3">
              <Lock className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900">End-to-End Encryption</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Your wellness data is encrypted both in transit (when sending) and at rest (when stored). 
                  Only you have access to your personal information.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Eye className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900">HIPAA Compliant</h3>
                <p className="text-sm text-gray-600 mt-1">
                  We follow strict HIPAA guidelines to protect your health information. 
                  Your data is treated with the same confidentiality as medical records.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Database className="h-5 w-5 text-purple-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900">You Own Your Data</h3>
                <p className="text-sm text-gray-600 mt-1">
                  You can export, download, or delete your data at any time. 
                  We never sell or share your information with third parties.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Clock className="h-5 w-5 text-orange-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900">Auto Session Timeout</h3>
                <p className="text-sm text-gray-600 mt-1">
                  For your security, sessions automatically end after 30 minutes of inactivity. 
                  You'll receive a warning before timeout.
                </p>
              </div>
            </div>
          </div>

          {/* Expandable Details */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors mb-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                {showDetails ? 'Hide' : 'Show'} Detailed Privacy Information
              </span>
              <AlertCircle className="h-4 w-4 text-gray-500" />
            </div>
          </button>

          {showDetails && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-sm text-gray-600 space-y-3">
              <div>
                <strong>What We Collect:</strong>
                <ul className="list-disc ml-5 mt-1 space-y-1">
                  <li>Wellness assessment responses (encrypted)</li>
                  <li>Usage patterns to improve the platform</li>
                  <li>Technical data for security (IP address, browser type)</li>
                  <li>Optional: Profile information you choose to provide</li>
                </ul>
              </div>
              
              <div>
                <strong>What We DON'T Collect:</strong>
                <ul className="list-disc ml-5 mt-1 space-y-1">
                  <li>Personal health records without consent</li>
                  <li>Location tracking data</li>
                  <li>Third-party cookies for advertising</li>
                  <li>Biometric data</li>
                </ul>
              </div>

              <div>
                <strong>Your Rights:</strong>
                <ul className="list-disc ml-5 mt-1 space-y-1">
                  <li>Access your data anytime</li>
                  <li>Request data correction or deletion</li>
                  <li>Opt-out of non-essential data collection</li>
                  <li>Receive notification of any data breaches</li>
                  <li>Transfer your data to another service</li>
                </ul>
              </div>

              <div>
                <strong>Security Measures:</strong>
                <ul className="list-disc ml-5 mt-1 space-y-1">
                  <li>256-bit AES encryption</li>
                  <li>Regular security audits</li>
                  <li>Role-based access controls</li>
                  <li>Audit logs for all data access</li>
                  <li>Automatic data anonymization after {SECURITY_CONFIG.privacy.anonymizeAfterDays} days</li>
                </ul>
              </div>
            </div>
          )}

          {/* Consent Actions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <div className="text-sm text-blue-900">
                <strong>By continuing, you acknowledge that:</strong>
                <ul className="list-disc ml-5 mt-2 space-y-1">
                  <li>You've read and understood our privacy practices</li>
                  <li>Your data will be encrypted and protected</li>
                  <li>You can modify your consent anytime in Settings</li>
                  <li>We'll notify you of any privacy policy changes</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleAccept}
              className="flex-1 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Check className="h-5 w-5" />
              <span>I Accept - Protect My Data</span>
            </button>
            
            {!required && (
              <button
                onClick={handleDecline}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
              >
                Maybe Later
              </button>
            )}
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center space-x-2 text-xs text-gray-600">
              <Shield className="h-4 w-4" />
              <span>HIPAA Compliant</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-gray-600">
              <Lock className="h-4 w-4" />
              <span>256-bit Encryption</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-gray-600">
              <Database className="h-4 w-4" />
              <span>GDPR Ready</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-gray-600">
              <Clock className="h-4 w-4" />
              <span>Auto-Logout Protection</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyConsent;