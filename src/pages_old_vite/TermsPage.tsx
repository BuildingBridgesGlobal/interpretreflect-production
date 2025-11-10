import React from 'react';
import { Link } from 'react-router-dom';
import { termsService } from '../services/termsService';

export const TermsPage: React.FC = () => {
  const termsContent = termsService.formatTermsForDisplay('terms');

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Navigation */}
        <Link
          to="/"
          className="text-gray-600 hover:text-gray-900 mb-6 inline-block transition-colors text-sm"
        >
          ← Back to Home
        </Link>

        {/* Header */}
        <div className="bg-white border border-gray-300 p-8 mb-8">
          <h1 className="text-3xl font-serif text-gray-900 text-center mb-2">
            TERMS AND CONDITIONS
          </h1>
          <p className="text-center text-gray-600 text-sm uppercase tracking-wide">
            Version {termsContent.version} • Effective Date: {termsContent.effectiveDate}
          </p>

          {/* Important Notice */}
          <div className="mt-6 p-4 bg-gray-50 border-l-4 border-gray-400">
            <p className="font-semibold text-gray-900 mb-1 uppercase text-sm">
              Important Legal Agreement
            </p>
            <p className="text-gray-700 text-sm leading-relaxed">
              This agreement contains important disclaimers about medical and mental health services,
              confidentiality obligations, and liability limitations. By using this service, you agree to be bound by these terms.
            </p>
          </div>
        </div>

        {/* Terms Content */}
        <div className="bg-white border border-gray-300 p-12">
          <div
            className="prose prose-gray max-w-none legal-document"
            dangerouslySetInnerHTML={{
              __html: termsContent.content
                .replace(/# /g, '<h1 class="text-xl font-bold mb-4 mt-8 text-gray-900 uppercase border-b border-gray-300 pb-2">')
                .replace(/## /g, '<h2 class="text-lg font-bold mb-3 mt-6 text-gray-800">')
                .replace(/### /g, '<h3 class="text-base font-semibold mb-2 mt-4 text-gray-700">')
                .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
                .replace(/^- (.+)$/gm, '<li class="ml-8 mb-2 text-gray-700 list-disc leading-relaxed">$1</li>')
                .replace(/^\d+\. (.+)$/gm, '<li class="ml-8 mb-2 text-gray-700 list-decimal leading-relaxed">$1</li>')
                .replace(/\n\n/g, '</p><p class="mb-4 text-gray-700 leading-relaxed text-justify">')
                .replace(/^/, '<p class="mb-4 text-gray-700 leading-relaxed text-justify">')
                .replace(/$/, '</p>')
            }}
          />
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-gray-300 text-center text-sm text-gray-600">
          <p>
            For questions regarding these terms, please contact:{' '}
            <a
              href="mailto:legal@interpretreflect.com"
              className="text-gray-800 hover:text-gray-900 underline"
            >
              legal@interpretreflect.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};