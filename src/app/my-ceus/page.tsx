'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext.next';
import { createClient } from '@/lib/supabase/client';
import { Award, Calendar, Clock, Plus, Download, AlertCircle, CheckCircle, TrendingUp, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Certification {
  id: string;
  cert_type: string;
  cert_number: string | null;
  credential_level: string | null;
  issue_date: string | null;
  expiration_date: string | null;
  ceu_hours_required: number;
  ceu_hours_completed: number;
  notes: string | null;
  created_at: string;
}

interface CEUCompletion {
  id: string;
  program_id: string;
  ceu_awarded: number;
  category: string;
  ps_subcategory: string | null;
  completed_at: string;
  certificate_number: string;
  certificate_url: string | null;
  ceu_programs?: {
    title: string;
    program_code: string;
  };
}

export default function MyCEUsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [ceuCompletions, setCeuCompletions] = useState<CEUCompletion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddCertModal, setShowAddCertModal] = useState(false);
  const [totalCEUs, setTotalCEUs] = useState(0);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Fetch certifications and CEU completions
  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch certifications
      const { data: certsData, error: certsError } = await supabase
        .from('certifications')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (certsError) throw certsError;
      setCertifications(certsData || []);

      // Fetch CEU completions
      const { data: ceusData, error: ceusError } = await supabase
        .from('ceu_completions')
        .select(`
          *,
          ceu_programs (
            title,
            program_code
          )
        `)
        .eq('user_id', user?.id)
        .order('completed_at', { ascending: false });

      if (ceusError) throw ceusError;
      setCeuCompletions(ceusData || []);

      // Calculate total CEUs earned
      const total = (ceusData || []).reduce((sum, completion) => sum + Number(completion.ceu_awarded), 0);
      setTotalCEUs(total);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load certification data');
    } finally {
      setLoading(false);
    }
  };

  const getDaysUntilExpiration = (expirationDate: string | null) => {
    if (!expirationDate) return null;
    const today = new Date();
    const expDate = new Date(expirationDate);
    const diffTime = expDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getExpirationStatus = (days: number | null) => {
    if (days === null) return { color: 'text-brand-gray-500', bg: 'bg-brand-gray-100', label: 'No expiration set' };
    if (days < 0) return { color: 'text-brand-error', bg: 'bg-brand-error-light', label: 'Expired' };
    if (days < 90) return { color: 'text-orange-700', bg: 'bg-orange-100', label: `${days} days remaining` };
    if (days < 180) return { color: 'text-yellow-700', bg: 'bg-yellow-100', label: `${days} days remaining` };
    return { color: 'text-brand-success', bg: 'bg-brand-success-light', label: `${days} days remaining` };
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-electric mx-auto mb-4"></div>
          <p className="text-brand-gray-600 font-body">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-primary to-brand-slate border-b border-brand-electric/20">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white font-sans mb-2">
                My CEU Records & Certifications
              </h1>
              <p className="text-white/90 font-body">
                Track your professional development and certification renewals
              </p>
            </div>
            <Link
              href="/ceu-bundles"
              className="bg-brand-electric text-brand-primary font-bold px-6 py-3 rounded-data hover:bg-brand-electric-hover transition-all shadow-sm font-sans"
            >
              Browse CEU Programs
            </Link>
          </div>

          {/* CEU Summary Cards */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-data p-4 border border-white/20">
              <div className="flex items-center gap-3 mb-2">
                <Award className="w-6 h-6 text-brand-electric" />
                <span className="text-sm text-white/80 font-body">Total CEUs Earned</span>
              </div>
              <div className="text-3xl font-bold text-white font-mono">{totalCEUs.toFixed(1)}</div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-data p-4 border border-white/20">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="w-6 h-6 text-brand-electric" />
                <span className="text-sm text-white/80 font-body">Programs Completed</span>
              </div>
              <div className="text-3xl font-bold text-white font-mono">{ceuCompletions.length}</div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-data p-4 border border-white/20">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-6 h-6 text-brand-electric" />
                <span className="text-sm text-white/80 font-body">Active Certifications</span>
              </div>
              <div className="text-3xl font-bold text-white font-mono">
                {certifications.filter(c => {
                  const days = getDaysUntilExpiration(c.expiration_date);
                  return days === null || days >= 0;
                }).length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Certifications */}
          <div className="lg:col-span-2 space-y-6">
            {/* Certifications Section */}
            <div className="bg-white rounded-data shadow-card p-6 border border-brand-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-brand-primary font-sans">
                  My Certifications
                </h2>
                <button
                  onClick={() => setShowAddCertModal(true)}
                  className="bg-gradient-to-r from-brand-energy to-brand-energy-hover text-white font-bold px-4 py-2 rounded-data hover:shadow-lg transition-all flex items-center gap-2 text-sm font-sans"
                >
                  <Plus className="w-4 h-4" />
                  Add Certification
                </button>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-electric mx-auto mb-4"></div>
                  <p className="text-brand-gray-600 font-body">Loading certifications...</p>
                </div>
              ) : certifications.length === 0 ? (
                <div className="text-center py-12">
                  <Award className="w-16 h-16 text-brand-gray-300 mx-auto mb-4" />
                  <p className="text-brand-gray-600 mb-4 font-body">
                    No certifications added yet
                  </p>
                  <button
                    onClick={() => setShowAddCertModal(true)}
                    className="bg-gradient-to-r from-brand-primary to-brand-slate text-white px-6 py-2 rounded-data font-semibold hover:shadow-glow transition-all font-body"
                  >
                    Add Your First Certification
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {certifications.map((cert) => {
                    const daysRemaining = getDaysUntilExpiration(cert.expiration_date);
                    const status = getExpirationStatus(daysRemaining);
                    const ceuProgress = cert.ceu_hours_required > 0
                      ? (cert.ceu_hours_completed / cert.ceu_hours_required) * 100
                      : 0;

                    return (
                      <div key={cert.id} className="border border-brand-gray-200 rounded-data p-4 hover:border-brand-electric transition-all">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-lg font-bold text-brand-primary font-sans">
                              {cert.cert_type}
                            </h3>
                            {cert.credential_level && (
                              <p className="text-sm text-brand-gray-600 font-body">{cert.credential_level}</p>
                            )}
                            {cert.cert_number && (
                              <p className="text-sm text-brand-gray-500 font-mono">#{cert.cert_number}</p>
                            )}
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status.bg} ${status.color} font-mono`}>
                            {status.label}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                          {cert.issue_date && (
                            <div>
                              <span className="text-brand-gray-500 font-body">Issued:</span>
                              <span className="ml-2 text-brand-charcoal font-mono">
                                {new Date(cert.issue_date).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                          {cert.expiration_date && (
                            <div>
                              <span className="text-brand-gray-500 font-body">Expires:</span>
                              <span className="ml-2 text-brand-charcoal font-mono">
                                {new Date(cert.expiration_date).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>

                        {cert.ceu_hours_required > 0 && (
                          <div>
                            <div className="flex items-center justify-between text-sm mb-2">
                              <span className="text-brand-gray-600 font-body">CEU Progress</span>
                              <span className="font-mono text-brand-charcoal">
                                {cert.ceu_hours_completed.toFixed(1)} / {cert.ceu_hours_required.toFixed(1)}
                              </span>
                            </div>
                            <div className="w-full bg-brand-gray-200 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-brand-energy to-brand-energy-hover rounded-full h-2 transition-all duration-500"
                                style={{ width: `${Math.min(ceuProgress, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* CEU Completions History */}
            <div className="bg-white rounded-data shadow-card p-6 border border-brand-gray-200">
              <h2 className="text-2xl font-bold text-brand-primary mb-6 font-sans">
                CEU Completion History
              </h2>

              {ceuCompletions.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-brand-gray-300 mx-auto mb-4" />
                  <p className="text-brand-gray-600 mb-4 font-body">
                    No CEU completions yet
                  </p>
                  <Link
                    href="/ceu-bundles"
                    className="inline-block bg-gradient-to-r from-brand-primary to-brand-slate text-white px-6 py-2 rounded-data font-semibold hover:shadow-glow transition-all font-body"
                  >
                    Browse CEU Programs
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {ceuCompletions.map((completion) => (
                    <div key={completion.id} className="border border-brand-gray-200 rounded-data p-4 hover:border-brand-electric transition-all">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-bold text-brand-primary mb-1 font-sans">
                            {completion.ceu_programs?.title || 'CEU Program'}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-brand-gray-600 mb-2">
                            <span className="font-mono">{completion.ceu_programs?.program_code}</span>
                            <span className="font-body">•</span>
                            <span className="font-body">{new Date(completion.completed_at).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 bg-brand-electric-light text-brand-electric text-xs font-bold rounded-full font-mono">
                              {completion.ceu_awarded} CEUs
                            </span>
                            <span className="px-3 py-1 bg-brand-gray-100 text-brand-gray-700 text-xs font-semibold rounded-full font-mono">
                              {completion.category}
                            </span>
                            {completion.ps_subcategory && (
                              <span className="text-xs text-brand-gray-500 font-body">
                                {completion.ps_subcategory}
                              </span>
                            )}
                          </div>
                        </div>
                        {completion.certificate_url && (
                          <a
                            href={completion.certificate_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-4 text-brand-electric hover:text-brand-electric-hover flex items-center gap-1 text-sm font-body"
                          >
                            <Download className="w-4 h-4" />
                            Certificate
                          </a>
                        )}
                      </div>
                      <p className="text-xs text-brand-gray-500 mt-2 font-mono">
                        Certificate #: {completion.certificate_number}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Info & Actions */}
          <div className="space-y-6">
            {/* RID Requirements */}
            <div className="bg-white rounded-data shadow-card p-6 border border-brand-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-6 h-6 text-brand-electric" />
                <h3 className="font-bold text-brand-primary font-sans">RID CEU Requirements</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="p-3 bg-brand-gray-50 rounded-data">
                  <p className="font-semibold text-brand-charcoal mb-1 font-sans">4-Year Cycle</p>
                  <p className="text-brand-gray-600 font-body">8.0 CEUs required per cycle</p>
                </div>
                <div className="p-3 bg-brand-gray-50 rounded-data">
                  <p className="font-semibold text-brand-charcoal mb-1 font-sans">Professional Studies</p>
                  <p className="text-brand-gray-600 font-body">Minimum 6.0 CEUs (PS)</p>
                </div>
                <div className="p-3 bg-brand-gray-50 rounded-data">
                  <p className="font-semibold text-brand-charcoal mb-1 font-sans">General Studies</p>
                  <p className="text-brand-gray-600 font-body">Maximum 2.0 CEUs (GS)</p>
                </div>
              </div>
              <Link
                href="/ceu-bundles"
                className="mt-4 block text-center bg-gradient-to-r from-brand-energy to-brand-energy-hover text-white px-4 py-2 rounded-data font-semibold hover:shadow-lg transition-all font-sans text-sm"
              >
                View RID-Approved Programs
              </Link>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-data shadow-card p-6 border border-brand-gray-200">
              <h3 className="font-bold text-brand-primary mb-4 font-sans">Quick Actions</h3>
              <div className="space-y-2">
                <Link
                  href="/ceu-bundles"
                  className="block p-3 border border-brand-gray-200 rounded-data hover:border-brand-electric hover:bg-brand-gray-50 transition-all font-body text-sm text-brand-charcoal"
                >
                  Browse CEU Programs
                </Link>
                <button
                  onClick={() => setShowAddCertModal(true)}
                  className="w-full p-3 border border-brand-gray-200 rounded-data hover:border-brand-electric hover:bg-brand-gray-50 transition-all font-body text-sm text-brand-charcoal text-left"
                >
                  Add Certification
                </button>
                <Link
                  href="/dashboard"
                  className="block p-3 border border-brand-gray-200 rounded-data hover:border-brand-electric hover:bg-brand-gray-50 transition-all font-body text-sm text-brand-charcoal"
                >
                  Back to Dashboard
                </Link>
              </div>
            </div>

            {/* Support */}
            <div className="bg-brand-info-light border border-brand-info/20 rounded-data p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-brand-info flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-brand-info-dark mb-1 font-sans">
                    Need Help?
                  </p>
                  <p className="text-xs text-brand-info-dark/80 mb-2 font-body">
                    Questions about CEU tracking or certification requirements?
                  </p>
                  <Link
                    href="/support"
                    className="text-xs text-brand-info hover:text-brand-info-dark font-semibold underline font-body"
                  >
                    Contact Support
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Certification Modal */}
      {showAddCertModal && (
        <AddCertificationModal
          onClose={() => setShowAddCertModal(false)}
          onSuccess={() => {
            setShowAddCertModal(false);
            fetchData();
          }}
        />
      )}
    </div>
  );
}

// Add Certification Modal Component
function AddCertificationModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const { user } = useAuth();
  const supabase = createClient();

  const [certType, setCertType] = useState('');
  const [certNumber, setCertNumber] = useState('');
  const [credentialLevel, setCredentialLevel] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [ceuRequired, setCeuRequired] = useState('8.0');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !certType) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      setSubmitting(true);

      const { error } = await supabase.from('certifications').insert({
        user_id: user.id,
        cert_type: certType,
        cert_number: certNumber || null,
        credential_level: credentialLevel || null,
        issue_date: issueDate || null,
        expiration_date: expirationDate || null,
        ceu_hours_required: parseFloat(ceuRequired) || 0,
        ceu_hours_completed: 0,
        notes: notes || null,
      });

      if (error) throw error;

      toast.success('Certification added successfully!');
      onSuccess();
    } catch (error) {
      console.error('Error adding certification:', error);
      toast.error('Failed to add certification');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-data max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-brand-gray-200">
          <h2 className="text-2xl font-bold text-brand-primary font-sans">Add Certification</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Certification Type */}
          <div>
            <label className="block text-sm font-medium text-brand-primary mb-2 font-sans">
              Certification Type *
            </label>
            <select
              value={certType}
              onChange={(e) => setCertType(e.target.value)}
              required
              className="w-full px-4 py-3 border border-brand-gray-300 rounded-data focus:outline-none focus:ring-2 focus:ring-brand-electric font-body"
            >
              <option value="">Select certification type</option>
              <option value="RID NIC">RID NIC</option>
              <option value="RID CDI">RID CDI</option>
              <option value="NAD">NAD</option>
              <option value="CCHI">CCHI</option>
              <option value="State License">State License</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Certification Number & Level */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-brand-primary mb-2 font-sans">
                Certification Number
              </label>
              <input
                type="text"
                value={certNumber}
                onChange={(e) => setCertNumber(e.target.value)}
                placeholder="e.g., 12345"
                className="w-full px-4 py-3 border border-brand-gray-300 rounded-data focus:outline-none focus:ring-2 focus:ring-brand-electric font-body"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-primary mb-2 font-sans">
                Credential Level
              </label>
              <input
                type="text"
                value={credentialLevel}
                onChange={(e) => setCredentialLevel(e.target.value)}
                placeholder="e.g., NIC Master"
                className="w-full px-4 py-3 border border-brand-gray-300 rounded-data focus:outline-none focus:ring-2 focus:ring-brand-electric font-body"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-brand-primary mb-2 font-sans">
                Issue Date
              </label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full px-4 py-3 border border-brand-gray-300 rounded-data focus:outline-none focus:ring-2 focus:ring-brand-electric font-body"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-primary mb-2 font-sans">
                Expiration Date
              </label>
              <input
                type="date"
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
                className="w-full px-4 py-3 border border-brand-gray-300 rounded-data focus:outline-none focus:ring-2 focus:ring-brand-electric font-body"
              />
            </div>
          </div>

          {/* CEU Hours Required */}
          <div>
            <label className="block text-sm font-medium text-brand-primary mb-2 font-sans">
              CEU Hours Required
            </label>
            <input
              type="number"
              step="0.1"
              value={ceuRequired}
              onChange={(e) => setCeuRequired(e.target.value)}
              placeholder="8.0"
              className="w-full px-4 py-3 border border-brand-gray-300 rounded-data focus:outline-none focus:ring-2 focus:ring-brand-electric font-body"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-brand-primary mb-2 font-sans">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional information..."
              rows={3}
              className="w-full px-4 py-3 border border-brand-gray-300 rounded-data focus:outline-none focus:ring-2 focus:ring-brand-electric font-body resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 px-6 py-3 border-2 border-brand-gray-300 text-brand-gray-700 rounded-data hover:bg-brand-gray-50 font-sans font-semibold disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !certType}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-brand-energy to-brand-energy-hover text-white rounded-data hover:shadow-lg font-sans font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Adding...' : 'Add Certification'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
