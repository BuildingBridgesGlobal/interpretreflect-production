import React from 'react';
import { Link } from 'react-router-dom';
import { termsService } from '../services/termsService';

export const PrivacyPage: React.FC = () => {
  const privacyContent = termsService.formatTermsForDisplay('privacy');

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, var(--color-surface) 0%, var(--color-card) 100%)" }}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Navigation */}
        <Link
          to="/"
          className="mb-6 inline-block transition-all hover:-translate-y-0.5 text-sm font-semibold"
          style={{ color: "var(--color-green-600)" }}
        >
          ← Back to Home
        </Link>

        {/* Header */}
        <div className="rounded-2xl shadow-clean p-8 mb-8" style={{
          backgroundColor: "var(--color-card)",
          border: "1px solid var(--color-slate-200)"
        }}>
          <h1 className="text-3xl font-bold text-center mb-2" style={{ color: "var(--color-slate-700)" }}>
            PRIVACY POLICY
          </h1>
          <p className="text-center text-sm uppercase tracking-wide" style={{ color: "var(--color-slate-600)" }}>
            Version {privacyContent.version} • Effective Date: {privacyContent.effectiveDate}
          </p>

          {/* Privacy Notice */}
          <div className="mt-6 p-4 rounded-xl" style={{
            backgroundColor: "var(--color-green-50)",
            borderLeft: "4px solid var(--color-green-600)"
          }}>
            <p className="font-bold mb-1 uppercase text-sm" style={{ color: "var(--color-green-700)" }}>
              Privacy Statement
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "var(--color-slate-600)" }}>
              We are committed to protecting your personal information and being transparent
              about how we collect, use, and safeguard your data. This policy describes our privacy practices.
            </p>
          </div>
        </div>

        {/* Privacy Content */}
        <div className="rounded-2xl shadow-clean p-12" style={{
          backgroundColor: "var(--color-card)",
          border: "1px solid var(--color-slate-200)"
        }}>
          <div
            className="prose prose-gray max-w-none legal-document"
            dangerouslySetInnerHTML={{
              __html: privacyContent.content
                .replace(/# /g, '<h1 class="text-2xl font-bold mb-1 mt-8 uppercase border-b pb-2" style="color: var(--color-slate-700); border-color: var(--color-slate-300);">')
                .replace(/## /g, '<h2 class="text-2xl font-bold mb-1 mt-6" style="color: var(--color-slate-700);">')
                .replace(/### /g, '<h3 class="text-base font-semibold mb-1 mt-4" style="color: var(--color-slate-600);">')
                .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold" style="color: var(--color-slate-700);">$1</strong>')
                .replace(/^- (.+)$/gm, '<li class="ml-8 mb-2 list-disc leading-relaxed text-base" style="color: var(--color-slate-600);">$1</li>')
                .replace(/^\d+\. (.+)$/gm, '<li class="ml-8 mb-2 list-decimal leading-relaxed text-base" style="color: var(--color-slate-600);">$1</li>')
                .replace(/\n\n/g, '</p><p class="mb-4 leading-relaxed text-base" style="color: var(--color-slate-600);">')
                .replace(/^/, '<p class="mb-4 leading-relaxed text-base" style="color: var(--color-slate-600);">')
                .replace(/$/, '</p>')
            }}
          />
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 text-center text-sm" style={{
          borderTop: "1px solid var(--color-slate-200)",
          color: "var(--color-slate-600)"
        }}>
          <p>
            For privacy-related inquiries, please contact:{' '}
            <a
              href="mailto:privacy@interpretreflect.com"
              className="underline hover:-translate-y-0.5 transition-all font-semibold"
              style={{ color: "var(--color-green-600)" }}
            >
              privacy@interpretreflect.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};