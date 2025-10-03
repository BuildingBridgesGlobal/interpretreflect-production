import React, { useMemo, useState } from "react";

/**
 * Legal Pages – Polished Components
 * - Same visual language as the Privacy & Security Notice component
 * - Inherits site font; clean, accessible styling with Tailwind
 * - Tabbed switcher between Terms and Privacy
 * - Collapsible sections with deep links (ids)
 * - Copy aligned to v3 policies with key updates:
 *    • Removes "Privacy Shield principles" → uses EU‑U.S. Data Privacy Framework (if certified) and/or SCCs
 *    • Fixes backup retention consistency (encrypted backups; purge within 90 days)
 *    • Changes WebAuthn note to present‑tense, non‑dated phrasing
 */

interface Section {
  id: string;
  title: string;
  content: React.ReactNode;
}

export default function LegalPages() {
  const [tab, setTab] = useState<'terms' | 'privacy'>('terms');

  return (
    <section className="w-full max-w-5xl mx-auto rounded-2xl border border-neutral-200/70 dark:border-neutral-800/70 bg-white dark:bg-neutral-900 shadow-sm p-6 md:p-8">
      <header className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
            Legal Center
          </h1>
          <p className="mt-1 text-sm md:text-base text-neutral-600 dark:text-neutral-300">
            Please review and accept to continue.
          </p>
        </div>
        <div className="inline-flex rounded-xl border border-neutral-300 dark:border-neutral-700 overflow-hidden">
          <button
            onClick={() => setTab('terms')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              tab === 'terms'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
            aria-pressed={tab === 'terms'}
          >
            Terms & Conditions
          </button>
          <button
            onClick={() => setTab('privacy')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              tab === 'privacy'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
            aria-pressed={tab === 'privacy'}
          >
            Privacy Policy
          </button>
        </div>
      </header>

      {tab === 'terms' ? <TermsContent /> : <PrivacyContent />}

      <footer className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-neutral-200 dark:border-neutral-800 pt-6">
        <ul className="text-xs text-neutral-600 dark:text-neutral-400 list-disc pl-5">
          <li>By continuing, you acknowledge you've read and agree to the applicable document.</li>
          <li>You can manage consent and preferences anytime in Settings.</li>
          <li>We'll notify you of material changes.</li>
        </ul>
        <button
          type="button"
          className="inline-flex justify-center rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 px-6 py-3 text-sm font-medium shadow hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-opacity"
        >
          I Accept
        </button>
      </footer>
    </section>
  );
}

function TermsContent() {
  const sections = useMemo(() => TERMS_SECTIONS, []);
  return (
    <TwoColumnLayout
      title="Terms and Conditions"
      version="Version 3.0.0 • Effective Jan 22, 2025 • Last Updated Jan 23, 2025"
      sections={sections}
    />
  );
}

function PrivacyContent() {
  const sections = useMemo(() => PRIVACY_SECTIONS, []);
  return (
    <TwoColumnLayout
      title="Privacy Policy"
      version="Version 3.0.0 • Effective Jan 22, 2025 • Last Updated Jan 23, 2025"
      sections={sections}
    />
  );
}

function TwoColumnLayout({
  title,
  version,
  sections
}: {
  title: string;
  version: string;
  sections: Section[];
}) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [activeSection, setActiveSection] = useState<string>(sections[0]?.id || '');

  const toggleSection = (id: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedSections(newExpanded);
  };

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="flex gap-6">
      {/* Sidebar Navigation */}
      <nav className="hidden lg:block w-64 flex-shrink-0">
        <div className="sticky top-6 space-y-1">
          <h3 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-3">
            Table of Contents
          </h3>
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                activeSection === section.id
                  ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-medium'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
              }`}
            >
              {section.title}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <div className="mb-6 pb-6 border-b border-neutral-200 dark:border-neutral-800">
          <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
            {title}
          </h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {version}
          </p>
        </div>

        <div className="space-y-4">
          {sections.map((section) => (
            <div
              key={section.id}
              id={section.id}
              className="rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden"
            >
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full px-5 py-4 flex items-center justify-between bg-neutral-50 dark:bg-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                  {section.title}
                </h3>
                <span className="text-neutral-500 dark:text-neutral-400 text-lg">
                  {expandedSections.has(section.id) ? '−' : '+'}
                </span>
              </button>

              {expandedSections.has(section.id) && (
                <div className="px-5 py-4 text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed bg-white dark:bg-neutral-900">
                  {section.content}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Terms Sections - Updated with legal fixes
const TERMS_SECTIONS: Section[] = [
  {
    id: "acceptance",
    title: "1. Acceptance of Terms",
    content: (
      <div className="space-y-3">
        <p>
          By accessing or using InterpretReflect ("Service"), you agree to be bound by these Terms and Conditions ("Terms").
          If you disagree with any part of these terms, you may not access the Service.
        </p>
        <p className="font-medium">
          IMPORTANT: This Service is restricted to individuals 18 years or older.
          By using this Service, you represent that you are at least 18 years old.
        </p>
      </div>
    )
  },
  {
    id: "health-disclaimers",
    title: "2. Health and Medical Disclaimers",
    content: (
      <div className="space-y-3">
        <p className="font-medium text-red-600 dark:text-red-400">
          CRITICAL HEALTH DISCLAIMERS - PLEASE READ CAREFULLY
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>This Service is NOT a substitute for professional medical or mental health care</li>
          <li>We do NOT provide medical advice, diagnosis, or treatment</li>
          <li>The Service is for wellness and self-reflection purposes only</li>
          <li>Always consult qualified healthcare providers for health concerns</li>
          <li>In emergencies, call 911 or your local emergency number immediately</li>
        </ul>
        <p>
          <strong>Crisis Resources:</strong> If you're experiencing a mental health crisis, please contact:
        </p>
        <ul className="list-disc pl-6">
          <li>US: 988 Suicide & Crisis Lifeline</li>
          <li>UK: 116 123 (Samaritans)</li>
          <li>Canada: Talk Suicide Canada (1-833-456-4566)</li>
          <li>Australia: Lifeline (13 11 14)</li>
        </ul>
      </div>
    )
  },
  {
    id: "hipaa-compliance",
    title: "3. HIPAA and Healthcare Regulations",
    content: (
      <div className="space-y-3">
        <p>
          <strong>We are NOT a HIPAA covered entity.</strong> However:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>For specific healthcare integrations where we sign a Business Associate Agreement (BAA), we comply with HIPAA for those data flows only</li>
          <li>Otherwise, we follow the FTC Health Breach Notification Rule and applicable privacy laws</li>
          <li>We are NOT an FDA-regulated medical device or software</li>
          <li>The Service is not intended for clinical decision-making</li>
        </ul>
      </div>
    )
  },
  {
    id: "ai-disclosures",
    title: "4. AI and Automated Systems",
    content: (
      <div className="space-y-3">
        <p>Our Service uses AI and automated systems. You acknowledge that:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>AI responses are not from human professionals</li>
          <li>AI can make errors and should not be relied upon for critical decisions</li>
          <li>We comply with applicable AI regulations including:
            <ul className="list-circle pl-6 mt-2">
              <li>EU AI Act (phased compliance through 2030)</li>
              <li>California SB 1001 (bot disclosure requirements)</li>
              <li>Colorado AI Act (effective 2026)</li>
            </ul>
          </li>
          <li>You will receive clear notice when interacting with AI systems</li>
        </ul>
      </div>
    )
  },
  {
    id: "privacy-security",
    title: "5. Privacy and Data Security",
    content: (
      <div className="space-y-3">
        <p>Your privacy is protected through:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Encryption:</strong> AES-256-GCM at rest, TLS 1.3 in transit</li>
          <li><strong>Application-layer encryption</strong> for personal reflections with user-managed keys</li>
          <li><strong>Access controls:</strong> We cannot view your encrypted content without explicit permission</li>
          <li><strong>Note:</strong> This is not a zero-knowledge system - we maintain some metadata for service operation</li>
          <li><strong>Backups:</strong> Encrypted and purged within 90 days of account deletion</li>
          <li><strong>Authentication:</strong> Multi-factor authentication and WebAuthn support where available</li>
        </ul>
      </div>
    )
  },
  {
    id: "liability",
    title: "6. Limitation of Liability",
    content: (
      <div className="space-y-3">
        <p className="font-medium">
          TO THE MAXIMUM EXTENT PERMITTED BY LAW:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>The Service is provided "AS IS" without warranties of any kind</li>
          <li>We disclaim all implied warranties including merchantability and fitness</li>
          <li>Our total liability shall not exceed the amount paid by you in the past 12 months</li>
          <li>We are not liable for indirect, incidental, or consequential damages</li>
        </ul>
        <p className="font-medium">
          EXCEPTIONS: These limitations do not apply to:
        </p>
        <ul className="list-disc pl-6">
          <li>Gross negligence or willful misconduct</li>
          <li>Death or personal injury caused by our negligence</li>
          <li>Fraud or fraudulent misrepresentation</li>
          <li>Any liability that cannot be excluded by law</li>
        </ul>
      </div>
    )
  },
  {
    id: "arbitration",
    title: "7. Arbitration and Class Action Waiver",
    content: (
      <div className="space-y-3">
        <p className="font-medium">
          PLEASE READ CAREFULLY - THIS AFFECTS YOUR LEGAL RIGHTS:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Disputes will be resolved through binding arbitration, not court</li>
          <li>Arbitration will be conducted by JAMS under its Streamlined Rules</li>
          <li>You waive the right to participate in class actions or class arbitrations</li>
          <li>Small claims court remains available for qualifying claims</li>
          <li>30-day right to opt out by emailing legal@interpretreflect.com</li>
        </ul>
      </div>
    )
  },
  {
    id: "termination",
    title: "8. Termination",
    content: (
      <div className="space-y-3">
        <p>We may terminate or suspend your account immediately, without prior notice, for:</p>
        <ul className="list-disc pl-6">
          <li>Breach of these Terms</li>
          <li>Illegal or harmful activities</li>
          <li>At our sole discretion to protect the Service or users</li>
        </ul>
        <p>
          Upon termination, your right to use the Service ceases immediately.
          You may export your data within 30 days of termination.
        </p>
      </div>
    )
  },
  {
    id: "changes",
    title: "9. Changes to Terms",
    content: (
      <div className="space-y-3">
        <p>
          We reserve the right to modify these Terms at any time. When we do:
        </p>
        <ul className="list-disc pl-6">
          <li>We'll notify you via email and in-app notification</li>
          <li>Provide at least 30 days notice for material changes</li>
          <li>Your continued use constitutes acceptance of new Terms</li>
          <li>You may close your account if you disagree with changes</li>
        </ul>
      </div>
    )
  },
  {
    id: "governing-law",
    title: "10. Governing Law",
    content: (
      <p>
        These Terms are governed by the laws of Delaware, USA, without regard to conflict of law principles.
        The UN Convention on Contracts for the International Sale of Goods does not apply.
      </p>
    )
  }
];

// Privacy Sections - Updated with legal fixes
const PRIVACY_SECTIONS: Section[] = [
  {
    id: "information-collect",
    title: "1. Information We Collect",
    content: (
      <div className="space-y-3">
        <p><strong>Information you provide:</strong></p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Account information (email, name, optional profile details)</li>
          <li>Wellness reflections and self-assessments</li>
          <li>Communications with us</li>
        </ul>

        <p className="mt-3"><strong>Information collected automatically:</strong></p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Usage data and interaction patterns</li>
          <li>Device information and browser type</li>
          <li>IP address and approximate location (country/region only)</li>
          <li>Cookies and similar technologies (with consent where required)</li>
        </ul>

        <p className="mt-3"><strong>We do NOT collect:</strong></p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Precise location data</li>
          <li>Biometric information</li>
          <li>Third-party advertising cookies</li>
          <li>Health records from external providers (unless you explicitly share them)</li>
        </ul>
      </div>
    )
  },
  {
    id: "use-information",
    title: "2. How We Use Your Information",
    content: (
      <div className="space-y-3">
        <p>We use your information to:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Provide and improve the Service</li>
          <li>Personalize your wellness journey</li>
          <li>Send service-related communications</li>
          <li>Ensure security and prevent fraud</li>
          <li>Comply with legal obligations</li>
          <li>With consent: send optional wellness tips and updates</li>
        </ul>
        <p className="mt-3">
          <strong>We NEVER:</strong> Sell your personal information or use it for targeted advertising
        </p>
      </div>
    )
  },
  {
    id: "sharing-information",
    title: "3. Information Sharing",
    content: (
      <div className="space-y-3">
        <p>We share information only:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>With your consent:</strong> When you explicitly authorize sharing</li>
          <li><strong>Service providers:</strong> Trusted partners who help operate our Service (under strict contracts)</li>
          <li><strong>Legal requirements:</strong> When required by law or valid legal process</li>
          <li><strong>Protection:</strong> To protect rights, safety, or property</li>
          <li><strong>Business transfers:</strong> In connection with merger or acquisition (with notice)</li>
        </ul>
        <p className="mt-3">
          All service providers are contractually bound to protect your data and use it only for specified purposes.
        </p>
      </div>
    )
  },
  {
    id: "data-security",
    title: "4. Data Security",
    content: (
      <div className="space-y-3">
        <p>We protect your data through:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Encryption:</strong> AES-256-GCM at rest, TLS 1.3 in transit</li>
          <li><strong>Access controls:</strong> Role-based with comprehensive audit logging</li>
          <li><strong>Security testing:</strong> Quarterly penetration testing and continuous monitoring</li>
          <li><strong>Incident response:</strong> 24/7 monitoring with defined breach procedures</li>
          <li><strong>Employee training:</strong> Regular security and privacy training</li>
          <li><strong>Backups:</strong> Encrypted backups purged within 90 days of deletion</li>
        </ul>
      </div>
    )
  },
  {
    id: "your-rights",
    title: "5. Your Rights and Choices",
    content: (
      <div className="space-y-3">
        <p>You have the right to:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Access:</strong> Request a copy of your personal information</li>
          <li><strong>Correction:</strong> Update inaccurate information</li>
          <li><strong>Deletion:</strong> Request deletion of your account and data</li>
          <li><strong>Portability:</strong> Export your data in a standard format</li>
          <li><strong>Objection:</strong> Opt-out of certain data uses</li>
          <li><strong>Restriction:</strong> Limit how we process your data</li>
        </ul>
        <p className="mt-3">
          Exercise these rights through Settings or by emailing privacy@interpretreflect.com
        </p>
      </div>
    )
  },
  {
    id: "retention",
    title: "6. Data Retention",
    content: (
      <div className="space-y-3">
        <p>We retain your data:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Active accounts:</strong> As long as your account is active</li>
          <li><strong>After deletion:</strong> Personal data deleted within 30 days</li>
          <li><strong>Backups:</strong> Purged from encrypted backups within 90 days</li>
          <li><strong>Legal requirements:</strong> Longer if required by law</li>
          <li><strong>Anonymized data:</strong> May be retained for analytics</li>
        </ul>
      </div>
    )
  },
  {
    id: "cookies",
    title: "7. Cookies and Tracking",
    content: (
      <div className="space-y-3">
        <p>We use cookies for:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Essential:</strong> Authentication and security</li>
          <li><strong>Functional:</strong> Remember preferences</li>
          <li><strong>Analytics:</strong> Understand usage (with consent)</li>
        </ul>
        <p className="mt-3">
          We respect Global Privacy Control (GPC) signals and Do Not Track preferences.
          Manage cookie preferences in Settings.
        </p>
      </div>
    )
  },
  {
    id: "international",
    title: "8. International Data Transfers",
    content: (
      <div className="space-y-3">
        <p>If we transfer data internationally:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>We use Standard Contractual Clauses (SCCs) approved by the European Commission</li>
          <li>If certified, we may rely on the EU-U.S. Data Privacy Framework</li>
          <li>We ensure appropriate safeguards per GDPR requirements</li>
          <li>You can request details of transfer mechanisms</li>
        </ul>
      </div>
    )
  },
  {
    id: "childrens-privacy",
    title: "9. Children's Privacy",
    content: (
      <div className="space-y-3">
        <p>
          Our Service is not intended for children under 18. We do not knowingly collect data from children under 18.
          If we learn we've collected such information, we will delete it immediately.
        </p>
        <p>
          Parents who believe their child has provided information should contact privacy@interpretreflect.com
        </p>
      </div>
    )
  },
  {
    id: "contact",
    title: "10. Contact Information",
    content: (
      <div className="space-y-3">
        <p>For privacy questions or to exercise your rights:</p>
        <ul className="list-none space-y-2">
          <li><strong>Email:</strong> privacy@interpretreflect.com</li>
          <li><strong>Mail:</strong> InterpretReflect Privacy Team, [Address]</li>
          <li><strong>Response time:</strong> Within 30 days (or as required by law)</li>
        </ul>
        <p className="mt-3">
          For immediate privacy concerns, use our 24/7 support line: 1-800-PRIVACY
        </p>
      </div>
    )
  }
];

export { LegalPages as default };