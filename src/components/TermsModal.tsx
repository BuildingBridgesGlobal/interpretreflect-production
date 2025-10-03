import React, { useState, useEffect } from 'react';
import { X, Shield, AlertTriangle, FileText, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { termsService } from '../services/termsService';
import { useAuth } from '../contexts/AuthContext';

interface TermsModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onAccept: () => void;
  canClose?: boolean;
  showPrivacy?: boolean;
}

export const TermsModal: React.FC<TermsModalProps> = ({
  isOpen,
  onClose,
  onAccept,
  canClose = false,
  showPrivacy = true
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>('terms');
  const [hasReadTerms, setHasReadTerms] = useState(false);
  const [hasReadPrivacy, setHasReadPrivacy] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [scrolledToBottom, setScrolledToBottom] = useState({ terms: false, privacy: false });
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const termsContent = termsService.getTermsContent();
  const canAccept = hasReadTerms && (!showPrivacy || hasReadPrivacy);

  useEffect(() => {
    if (!isOpen) {
      setHasReadTerms(false);
      setHasReadPrivacy(false);
      setScrolledToBottom({ terms: false, privacy: false });
      setExpandedSections(new Set());
    }
  }, [isOpen]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>, type: 'terms' | 'privacy') => {
    const element = e.currentTarget;
    const isAtBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 10;

    if (isAtBottom && !scrolledToBottom[type]) {
      setScrolledToBottom(prev => ({ ...prev, [type]: true }));
      if (type === 'terms') setHasReadTerms(true);
      if (type === 'privacy') setHasReadPrivacy(true);
    }
  };

  const handleAccept = async () => {
    if (!user || !canAccept) return;

    setIsAccepting(true);
    try {
      const metadata = {
        userAgent: navigator.userAgent,
        ipAddress: undefined // This would be set server-side for security
      };

      const success = await termsService.acceptTerms(user.id, metadata);

      if (success) {
        onAccept();
      } else {
        alert('Failed to record terms acceptance. Please try again.');
      }
    } catch (error) {
      console.error('Error accepting terms:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsAccepting(false);
    }
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const renderContent = (content: string, type: 'terms' | 'privacy') => {
    const lines = content.split('\n');
    let currentSection = '';

    return lines.map((line, index) => {
      // Handle headers
      if (line.startsWith('# ')) {
        return (
          <h1 key={index} className="text-2xl font-bold mb-4 mt-6 text-gray-900">
            {line.substring(2)}
          </h1>
        );
      }

      if (line.startsWith('## ')) {
        currentSection = `${type}-${index}`;
        const isExpanded = expandedSections.has(currentSection);
        const sectionTitle = line.substring(3);

        // Important sections that should be highlighted
        const isImportant = sectionTitle.includes('DISCLAIMER') ||
                           sectionTitle.includes('LIABILITY') ||
                           sectionTitle.includes('CONFIDENTIALITY') ||
                           sectionTitle.includes('EMERGENCY');

        return (
          <div key={index} className="mt-6 mb-3">
            <button
              onClick={() => toggleSection(currentSection)}
              className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                isImportant ? 'bg-red-50 hover:bg-red-100' : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-2">
                {isImportant && <AlertTriangle className="w-5 h-5 text-red-600" />}
                <h2 className={`text-lg font-semibold ${
                  isImportant ? 'text-red-900' : 'text-gray-900'
                }`}>
                  {sectionTitle}
                </h2>
              </div>
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-gray-600" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>
        );
      }

      if (line.startsWith('### ')) {
        return (
          <h3 key={index} className="text-md font-semibold mb-2 mt-4 text-gray-800">
            {line.substring(4)}
          </h3>
        );
      }

      // Handle bold text
      if (line.includes('**')) {
        const parts = line.split('**');
        return (
          <p key={index} className="mb-2 text-gray-700">
            {parts.map((part, i) =>
              i % 2 === 0 ? part : <strong key={i} className="font-semibold text-gray-900">{part}</strong>
            )}
          </p>
        );
      }

      // Handle list items
      if (line.startsWith('- ')) {
        return (
          <li key={index} className="ml-6 mb-1 text-gray-700 list-disc">
            {line.substring(2)}
          </li>
        );
      }

      // Handle numbered items
      if (/^\d+\.\s/.test(line)) {
        return (
          <li key={index} className="ml-6 mb-1 text-gray-700 list-decimal">
            {line.substring(line.indexOf('.') + 2)}
          </li>
        );
      }

      // Regular paragraphs
      if (line.trim()) {
        return (
          <p key={index} className="mb-2 text-gray-700">
            {line}
          </p>
        );
      }

      return null;
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}>
        {/* Backdrop */}
        <div
          className="fixed inset-0"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}
          onClick={canClose ? onClose : undefined}
        />

        {/* Modal */}
        <div className="relative rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col" style={{
          backgroundColor: "#FFFFFF",
          boxShadow: "0 25px 60px rgba(0, 0, 0, 0.15)",
        }}>
          {/* Header */}
          <div className="flex items-center justify-between p-8 border-b" style={{ borderColor: "rgba(0, 0, 0, 0.05)", backgroundColor: "#FAFAF8" }}>
            <div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: "#1A1A1A" }}>
                Terms and Conditions
              </h2>
              <p className="text-sm" style={{ color: "#525252" }}>
                Please review and accept our terms to continue
              </p>
            </div>
            {canClose && onClose && (
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" style={{ color: "#525252" }} />
              </button>
            )}
          </div>

          {/* Important Notice */}
          <div className="mx-8 mt-6 p-4 rounded-lg" style={{ backgroundColor: "#FFF7ED", border: "1px solid #FED7AA" }}>
            <div className="text-sm">
              <p className="font-semibold mb-1" style={{ color: "#1A1A1A" }}>
                Important Legal Agreement
              </p>
              <p style={{ color: "#525252" }}>
                This agreement contains important disclaimers about services,
                confidentiality, and liability. Please read carefully.
              </p>
            </div>
          </div>

          {/* Tabs */}
          {showPrivacy && (
            <div className="flex gap-2 px-8 mt-4">
              <button
                onClick={() => setActiveTab('terms')}
                className="px-4 py-2 rounded-lg font-medium transition-colors"
                style={{
                  backgroundColor: activeTab === 'terms' ? '#2D5F3F' : '#FAFAF8',
                  color: activeTab === 'terms' ? '#FFFFFF' : '#525252',
                  border: activeTab === 'terms' ? 'none' : '1px solid rgba(0, 0, 0, 0.05)'
                }}
              >
                <div className="flex items-center gap-2">
                  Terms & Conditions
                  {hasReadTerms && <Check className="w-4 h-4" />}
                </div>
              </button>
              <button
                onClick={() => setActiveTab('privacy')}
                className="px-4 py-2 rounded-lg font-medium transition-colors"
                style={{
                  backgroundColor: activeTab === 'privacy' ? '#2D5F3F' : '#FAFAF8',
                  color: activeTab === 'privacy' ? '#FFFFFF' : '#525252',
                  border: activeTab === 'privacy' ? 'none' : '1px solid rgba(0, 0, 0, 0.05)'
                }}
              >
                <div className="flex items-center gap-2">
                  Privacy Policy
                  {hasReadPrivacy && <Check className="w-4 h-4" />}
                </div>
              </button>
            </div>
          )}

          {/* Content */}
          <div
            className="flex-1 overflow-y-auto px-6 py-4 min-h-[400px]"
            onScroll={(e) => handleScroll(e, activeTab)}
          >
            <div className="prose prose-gray max-w-none">
              {activeTab === 'terms' && (
                <>
                  <div className="mb-4 text-sm text-gray-600">
                    Version {termsContent.terms.version} •
                    Effective {termsContent.terms.effectiveDate}
                  </div>
                  {renderContent(termsContent.terms.content, 'terms')}
                </>
              )}
              {activeTab === 'privacy' && showPrivacy && (
                <>
                  <div className="mb-4 text-sm text-gray-600">
                    Version {termsContent.privacy.version} •
                    Effective {termsContent.privacy.effectiveDate}
                  </div>
                  {renderContent(termsContent.privacy.content, 'privacy')}
                </>
              )}
            </div>

            {/* Scroll indicator */}
            {!scrolledToBottom[activeTab] && (
              <div className="sticky bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white via-white/90 to-transparent pointer-events-none flex items-end justify-center pb-2">
                <div className="bg-gray-900 text-white px-3 py-1 rounded-full text-sm pointer-events-auto">
                  ↓ Scroll to continue
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t p-8" style={{ borderColor: "rgba(0, 0, 0, 0.05)" }}>
            <div className="flex items-center justify-between">
              <div className="text-sm" style={{ color: "#525252" }}>
                {!hasReadTerms && (
                  <p>Please read the Terms & Conditions to continue</p>
                )}
                {hasReadTerms && showPrivacy && !hasReadPrivacy && (
                  <p>Please read the Privacy Policy to continue</p>
                )}
                {canAccept && (
                  <p style={{ color: "#2D5F3F" }} className="font-medium">
                    ✓ You have read all required documents
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                {canClose && onClose && (
                  <button
                    onClick={onClose}
                    className="px-6 py-3 rounded-lg font-medium transition-colors"
                    style={{
                      backgroundColor: "#FFFFFF",
                      border: "2px solid #E5E7EB",
                      color: "#525252",
                    }}
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={handleAccept}
                  disabled={!canAccept || isAccepting}
                  className="px-6 py-3 rounded-lg font-medium text-white transition-all"
                  style={{
                    background: canAccept && !isAccepting
                      ? "linear-gradient(135deg, #2D5F3F, #5B9378)"
                      : "#E5E7EB",
                    boxShadow: canAccept && !isAccepting
                      ? "0 4px 15px rgba(27, 94, 32, 0.3)"
                      : "none",
                    cursor: canAccept && !isAccepting ? "pointer" : "not-allowed",
                    color: canAccept && !isAccepting ? "#FFFFFF" : "#9CA3AF"
                  }}
                >
                  {isAccepting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Accepting...
                    </div>
                  ) : (
                    'I Accept Terms & Conditions'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};