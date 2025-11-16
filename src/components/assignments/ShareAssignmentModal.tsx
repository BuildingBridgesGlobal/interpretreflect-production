'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { X, Mail, Send, CheckCircle } from 'lucide-react';
import type { ShareAssignmentFormData, AccessLevel } from '@/types/assignment';

interface ShareAssignmentModalProps {
  assignmentId: string;
  assignmentName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ShareAssignmentModal({
  assignmentId,
  assignmentName,
  isOpen,
  onClose,
  onSuccess,
}: ShareAssignmentModalProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  const [formData, setFormData] = useState<ShareAssignmentFormData>({
    shared_with_email: '',
    access_level: 'edit',
    personal_message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) throw new Error('Not authenticated');

      // Generate sharing token
      const shareToken = crypto.randomUUID();

      // Create assignment share record
      const { data: shareData, error: shareError } = await supabase
        .from('assignment_shares')
        .insert([
          {
            assignment_id: assignmentId,
            shared_by: user.id,
            shared_with_email: formData.shared_with_email,
            access_level: formData.access_level,
            share_token: shareToken,
            personal_message: formData.personal_message || null,
            is_active: true,
          },
        ])
        .select()
        .single();

      if (shareError) throw shareError;

      // Update assignment's shared_with_emails array
      const { data: assignment } = await supabase
        .from('assignments')
        .select('shared_with_emails')
        .eq('id', assignmentId)
        .single();

      const currentEmails = assignment?.shared_with_emails || [];
      if (!currentEmails.includes(formData.shared_with_email)) {
        await supabase
          .from('assignments')
          .update({
            shared_with_emails: [...currentEmails, formData.shared_with_email],
          })
          .eq('id', assignmentId);
      }

      // Generate share URL
      const baseUrl = window.location.origin;
      const url = `${baseUrl}/shared/assignments/${shareToken}`;
      setShareUrl(url);

      // TODO: Send email notification to team interpreter
      // This would be done via an API route that calls SendGrid/Resend
      // For now, we'll just show the link to copy

      setSuccess(true);
      onSuccess?.();
    } catch (err: any) {
      console.error('Error sharing assignment:', err);
      setError(err.message || 'Failed to share assignment');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    }
  };

  const handleReset = () => {
    setSuccess(false);
    setShareUrl(null);
    setFormData({
      shared_with_email: '',
      access_level: 'edit',
      personal_message: '',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-brand-gray-400 hover:text-brand-primary transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Success State */}
        {success ? (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-brand-primary mb-4 font-sans">
              Assignment Shared Successfully!
            </h2>
            <p className="text-brand-gray-600 mb-6 font-body">
              {formData.shared_with_email} can now access the assignment prep via the link below.
            </p>

            {/* Share Link */}
            <div className="bg-brand-gray-50 rounded-lg p-4 mb-6">
              <label className="block text-sm font-semibold text-brand-primary mb-2 font-body">
                Share Link
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shareUrl || ''}
                  readOnly
                  className="flex-1 px-4 py-2 bg-white border-2 border-brand-gray-200 rounded-data font-mono text-sm"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-2 bg-brand-electric text-white rounded-data font-semibold hover:bg-brand-electric-hover transition-all font-body"
                >
                  Copy
                </button>
              </div>
              <p className="text-xs text-brand-gray-500 mt-2 font-body">
                Anyone with this link can view the assignment. Send it via email or text.
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleReset}
                className="flex-1 py-3 bg-white border-2 border-brand-gray-200 text-brand-gray-700 rounded-data font-semibold hover:bg-brand-gray-50 transition-all font-body"
              >
                Share with Another Person
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-3 bg-gradient-to-r from-brand-primary to-brand-slate text-white rounded-data font-semibold hover:shadow-glow transition-all font-body"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Share Form */
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-brand-primary mb-2 font-sans">
                Share Assignment Prep
              </h2>
              <p className="text-brand-gray-600 font-body">
                Share "{assignmentName}" with your team interpreter
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-data p-4 mb-6">
                <p className="text-red-700 font-body">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Team Interpreter Email */}
              <div>
                <label className="block text-sm font-semibold text-brand-primary mb-2 font-body">
                  Team Interpreter Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.shared_with_email}
                  onChange={e =>
                    setFormData({ ...formData, shared_with_email: e.target.value })
                  }
                  placeholder="caterina.phillips@example.com"
                  className="w-full px-4 py-3 border-2 border-brand-gray-200 rounded-data focus:border-brand-electric focus:outline-none font-body"
                />
              </div>

              {/* Access Level */}
              <div>
                <label className="block text-sm font-semibold text-brand-primary mb-3 font-body">
                  Access Level
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, access_level: 'edit' })}
                    className={`p-4 rounded-data text-left transition-all ${
                      formData.access_level === 'edit'
                        ? 'bg-brand-electric text-white border-2 border-brand-electric'
                        : 'bg-white text-brand-gray-700 border-2 border-brand-gray-200 hover:border-brand-electric'
                    }`}
                  >
                    <p className="font-bold text-sm mb-1 font-body">Can Edit</p>
                    <p className="text-xs opacity-90 font-body">
                      View details and add notes/files
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, access_level: 'view' })}
                    className={`p-4 rounded-data text-left transition-all ${
                      formData.access_level === 'view'
                        ? 'bg-brand-electric text-white border-2 border-brand-electric'
                        : 'bg-white text-brand-gray-700 border-2 border-brand-gray-200 hover:border-brand-electric'
                    }`}
                  >
                    <p className="font-bold text-sm mb-1 font-body">View Only</p>
                    <p className="text-xs opacity-90 font-body">Can see prep, cannot edit</p>
                  </button>
                </div>
              </div>

              {/* Personal Message */}
              <div>
                <label className="block text-sm font-semibold text-brand-primary mb-2 font-body">
                  Personal Message (Optional)
                </label>
                <textarea
                  value={formData.personal_message}
                  onChange={e =>
                    setFormData({ ...formData, personal_message: e.target.value })
                  }
                  placeholder="Hi Caterina! Here's the prep for Saturday's AIIC meeting. Let me know if you want to sync on turn rotation. - Sarah"
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-brand-gray-200 rounded-data focus:border-brand-electric focus:outline-none font-body resize-none"
                />
              </div>

              {/* What's Included */}
              <div className="bg-brand-gray-50 rounded-lg p-4">
                <p className="text-sm font-semibold text-brand-primary mb-2 font-body">
                  What's included in the share:
                </p>
                <ul className="text-sm text-brand-gray-600 space-y-1 font-body">
                  <li>✓ All assignment details and context</li>
                  <li>✓ Client information and meeting link</li>
                  <li>✓ Prep materials (if uploaded)</li>
                  <li>✓ Prep notes and checklist</li>
                  {formData.access_level === 'edit' && (
                    <li>✓ Ability to add shared notes</li>
                  )}
                </ul>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 bg-white border-2 border-brand-gray-200 text-brand-gray-700 rounded-data font-semibold hover:bg-brand-gray-50 transition-all font-body"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-gradient-to-r from-brand-primary to-brand-slate text-white rounded-data font-semibold hover:shadow-glow transition-all disabled:opacity-50 font-body flex items-center justify-center gap-2"
                >
                  {loading ? (
                    'Sharing...'
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Share Assignment
                    </>
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
