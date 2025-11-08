'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext.next';
import { createClient } from '@/lib/supabase/client';
import { BookOpen, Plus, Search, Filter, Star, Brain, ChevronRight, Trash2, Edit2, Check, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface GlossaryTerm {
  id: string;
  term: string;
  definition: string;
  context: string | null;
  domain: string | null;
  category: string | null;
  source: string | null;
  proficiency_level: number;
  confidence_score: number;
  last_reviewed: string | null;
  next_review_date: string | null;
  review_count: number;
  correct_count: number;
  created_at: string;
}

export default function GlossaryPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const [terms, setTerms] = useState<GlossaryTerm[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDomain, setFilterDomain] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showReviewMode, setShowReviewMode] = useState(false);
  const [reviewTerms, setReviewTerms] = useState<GlossaryTerm[]>([]);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Fetch glossary terms
  useEffect(() => {
    if (!user) return;
    fetchTerms();
  }, [user]);

  const fetchTerms = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('glossary_terms')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTerms(data || []);
    } catch (error) {
      console.error('Error fetching terms:', error);
      toast.error('Failed to load glossary');
    } finally {
      setLoading(false);
    }
  };

  const getTermsDueForReview = () => {
    const today = new Date().toISOString().split('T')[0];
    return terms.filter(term => {
      if (!term.next_review_date) return true; // Never reviewed
      return term.next_review_date <= today;
    });
  };

  const startReviewSession = () => {
    const dueTerms = getTermsDueForReview();
    if (dueTerms.length === 0) {
      toast.error('No terms due for review!');
      return;
    }
    setReviewTerms(dueTerms);
    setCurrentReviewIndex(0);
    setShowReviewMode(true);
  };

  const filteredTerms = terms.filter((term) => {
    const matchesSearch = !searchQuery ||
      term.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
      term.definition.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (term.context?.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesDomain = filterDomain === 'all' || term.domain === filterDomain;

    return matchesSearch && matchesDomain;
  });

  const domains = Array.from(new Set(terms.map(t => t.domain).filter(Boolean)));

  const stats = {
    total: terms.length,
    dueForReview: getTermsDueForReview().length,
    mastered: terms.filter(t => t.proficiency_level >= 4).length,
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

  if (showReviewMode) {
    return (
      <ReviewMode
        terms={reviewTerms}
        currentIndex={currentReviewIndex}
        onNext={() => setCurrentReviewIndex(currentReviewIndex + 1)}
        onComplete={() => {
          setShowReviewMode(false);
          setCurrentReviewIndex(0);
          fetchTerms();
        }}
        onExit={() => {
          setShowReviewMode(false);
          setCurrentReviewIndex(0);
        }}
      />
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
                My Terminology Glossary
              </h1>
              <p className="text-white/90 font-body">
                Build your personal interpreter lexicon with spaced repetition
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={startReviewSession}
                disabled={stats.dueForReview === 0}
                className="bg-brand-electric text-brand-primary font-bold px-6 py-3 rounded-data hover:bg-brand-electric-hover transition-all shadow-sm font-sans disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Brain className="w-5 h-5" />
                Review ({stats.dueForReview})
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-white text-brand-primary font-bold px-6 py-3 rounded-data hover:bg-brand-gray-100 transition-all shadow-sm font-sans flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Term
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-data p-4 border border-white/20">
              <div className="flex items-center gap-3 mb-2">
                <BookOpen className="w-6 h-6 text-brand-electric" />
                <span className="text-sm text-white/80 font-body">Total Terms</span>
              </div>
              <div className="text-3xl font-bold text-white font-mono">{stats.total}</div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-data p-4 border border-white/20">
              <div className="flex items-center gap-3 mb-2">
                <Brain className="w-6 h-6 text-brand-electric" />
                <span className="text-sm text-white/80 font-body">Due for Review</span>
              </div>
              <div className="text-3xl font-bold text-white font-mono">{stats.dueForReview}</div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-data p-4 border border-white/20">
              <div className="flex items-center gap-3 mb-2">
                <Star className="w-6 h-6 text-brand-electric" />
                <span className="text-sm text-white/80 font-body">Mastered</span>
              </div>
              <div className="text-3xl font-bold text-white font-mono">{stats.mastered}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Search & Filters */}
        <div className="bg-white rounded-data shadow-card p-4 border border-brand-gray-200 mb-6">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[240px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-gray-400" />
              <input
                type="text"
                placeholder="Search terms, definitions, or context..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-brand-gray-300 rounded-data focus:outline-none focus:ring-2 focus:ring-brand-electric font-body"
              />
            </div>

            <select
              value={filterDomain}
              onChange={(e) => setFilterDomain(e.target.value)}
              className="px-4 py-2 border border-brand-gray-300 rounded-data focus:outline-none focus:ring-2 focus:ring-brand-electric font-body"
            >
              <option value="all">All Domains</option>
              {domains.map((domain) => (
                <option key={domain} value={domain!}>{domain}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Terms List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-electric mx-auto mb-4"></div>
            <p className="text-brand-gray-600 font-body">Loading glossary...</p>
          </div>
        ) : filteredTerms.length === 0 ? (
          <div className="bg-white rounded-data p-12 text-center border border-brand-gray-200">
            <BookOpen className="w-16 h-16 text-brand-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-brand-primary mb-2 font-sans">
              {searchQuery || filterDomain !== 'all' ? 'No matching terms' : 'No terms yet'}
            </h3>
            <p className="text-brand-gray-600 mb-6 font-body">
              {searchQuery || filterDomain !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Start building your professional terminology database'}
            </p>
            {!searchQuery && filterDomain === 'all' && (
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-gradient-to-r from-brand-energy to-brand-energy-hover text-white font-bold px-6 py-3 rounded-data hover:shadow-lg transition-all inline-flex items-center gap-2 font-sans"
              >
                <Plus className="w-5 h-5" />
                Add Your First Term
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredTerms.map((term) => (
              <TermCard key={term.id} term={term} onUpdate={fetchTerms} />
            ))}
          </div>
        )}
      </div>

      {/* Add Term Modal */}
      {showAddModal && (
        <AddTermModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchTerms();
          }}
        />
      )}
    </div>
  );
}

// Term Card Component
function TermCard({ term, onUpdate }: { term: GlossaryTerm; onUpdate: () => void }) {
  const { user } = useAuth();
  const supabase = createClient();
  const [isEditing, setIsEditing] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this term?')) return;

    try {
      const { error } = await supabase
        .from('glossary_terms')
        .delete()
        .eq('id', term.id)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast.success('Term deleted');
      onUpdate();
    } catch (error) {
      console.error('Error deleting term:', error);
      toast.error('Failed to delete term');
    }
  };

  const getProficiencyColor = (level: number) => {
    if (level >= 4) return 'text-green-700 bg-green-100';
    if (level >= 3) return 'text-blue-700 bg-blue-100';
    if (level >= 2) return 'text-yellow-700 bg-yellow-100';
    return 'text-orange-700 bg-orange-100';
  };

  const getProficiencyLabel = (level: number) => {
    if (level >= 4) return 'Mastered';
    if (level >= 3) return 'Proficient';
    if (level >= 2) return 'Learning';
    return 'New';
  };

  return (
    <div className="bg-white rounded-data p-6 border border-brand-gray-200 hover:border-brand-electric transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-bold text-brand-primary font-sans">{term.term}</h3>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getProficiencyColor(term.proficiency_level)} font-mono`}>
              {getProficiencyLabel(term.proficiency_level)}
            </span>
            {term.domain && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-brand-gray-100 text-brand-gray-700 font-mono">
                {term.domain}
              </span>
            )}
          </div>
          <p className="text-brand-gray-700 mb-3 font-body">{term.definition}</p>
          {term.context && (
            <p className="text-sm text-brand-gray-600 italic mb-3 font-body">
              "{term.context}"
            </p>
          )}
          <div className="flex items-center gap-4 text-sm text-brand-gray-500">
            {term.review_count > 0 && (
              <span className="font-body">Reviewed {term.review_count} times</span>
            )}
            {term.review_count > 0 && term.correct_count > 0 && (
              <span className="font-mono">
                {Math.round((term.correct_count / term.review_count) * 100)}% accuracy
              </span>
            )}
            {term.next_review_date && (
              <span className="font-body">
                Next review: {new Date(term.next_review_date).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2 ml-4">
          <button
            onClick={handleDelete}
            className="text-brand-error hover:text-brand-error-dark p-2"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Add Term Modal Component
function AddTermModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const { user } = useAuth();
  const supabase = createClient();

  const [term, setTerm] = useState('');
  const [definition, setDefinition] = useState('');
  const [context, setContext] = useState('');
  const [domain, setDomain] = useState('');
  const [category, setCategory] = useState('');
  const [source, setSource] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !term.trim() || !definition.trim()) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      setSubmitting(true);

      // Calculate next review date (1 day from now for new terms)
      const nextReviewDate = new Date();
      nextReviewDate.setDate(nextReviewDate.getDate() + 1);

      const { error } = await supabase.from('glossary_terms').insert({
        user_id: user.id,
        term: term.trim(),
        definition: definition.trim(),
        context: context.trim() || null,
        domain: domain.trim() || null,
        category: category.trim() || null,
        source: source.trim() || null,
        proficiency_level: 1,
        confidence_score: 0.5,
        next_review_date: nextReviewDate.toISOString().split('T')[0],
        review_count: 0,
        correct_count: 0,
      });

      if (error) throw error;

      toast.success('Term added successfully!');
      onSuccess();
    } catch (error) {
      console.error('Error adding term:', error);
      toast.error('Failed to add term');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-data max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-brand-gray-200">
          <h2 className="text-2xl font-bold text-brand-primary font-sans">Add New Term</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-brand-primary mb-2 font-sans">
              Term *
            </label>
            <input
              type="text"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="e.g., Myocardial Infarction"
              required
              className="w-full px-4 py-3 border border-brand-gray-300 rounded-data focus:outline-none focus:ring-2 focus:ring-brand-electric font-body"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-primary mb-2 font-sans">
              Definition *
            </label>
            <textarea
              value={definition}
              onChange={(e) => setDefinition(e.target.value)}
              placeholder="Enter the definition..."
              rows={4}
              required
              className="w-full px-4 py-3 border border-brand-gray-300 rounded-data focus:outline-none focus:ring-2 focus:ring-brand-electric font-body resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-primary mb-2 font-sans">
              Context / Example (optional)
            </label>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Example sentence or usage context..."
              rows={2}
              className="w-full px-4 py-3 border border-brand-gray-300 rounded-data focus:outline-none focus:ring-2 focus:ring-brand-electric font-body resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-brand-primary mb-2 font-sans">
                Domain
              </label>
              <select
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-full px-4 py-3 border border-brand-gray-300 rounded-data focus:outline-none focus:ring-2 focus:ring-brand-electric font-body"
              >
                <option value="">Select domain</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Legal">Legal</option>
                <option value="Educational">Educational</option>
                <option value="Mental Health">Mental Health</option>
                <option value="Business">Business</option>
                <option value="Technology">Technology</option>
                <option value="Government">Government</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-primary mb-2 font-sans">
                Category
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g., Anatomy, Procedure"
                className="w-full px-4 py-3 border border-brand-gray-300 rounded-data focus:outline-none focus:ring-2 focus:ring-brand-electric font-body"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-primary mb-2 font-sans">
              Source
            </label>
            <input
              type="text"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="Where did you learn this term?"
              className="w-full px-4 py-3 border border-brand-gray-300 rounded-data focus:outline-none focus:ring-2 focus:ring-brand-electric font-body"
            />
          </div>

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
              disabled={submitting || !term.trim() || !definition.trim()}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-brand-energy to-brand-energy-hover text-white rounded-data hover:shadow-lg font-sans font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Adding...' : 'Add Term'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Review Mode Component
function ReviewMode({
  terms,
  currentIndex,
  onNext,
  onComplete,
  onExit
}: {
  terms: GlossaryTerm[];
  currentIndex: number;
  onNext: () => void;
  onComplete: () => void;
  onExit: () => void;
}) {
  const { user } = useAuth();
  const supabase = createClient();
  const [showAnswer, setShowAnswer] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (currentIndex >= terms.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-gray-50">
        <div className="bg-white rounded-data p-12 text-center border border-brand-gray-200 max-w-md">
          <CheckCircle className="w-16 h-16 text-brand-success mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-brand-primary mb-3 font-sans">Review Complete!</h2>
          <p className="text-brand-gray-600 mb-6 font-body">
            You've reviewed {terms.length} terms. Great work!
          </p>
          <button
            onClick={onComplete}
            className="bg-gradient-to-r from-brand-energy to-brand-energy-hover text-white font-bold px-8 py-3 rounded-data hover:shadow-lg transition-all font-sans"
          >
            Back to Glossary
          </button>
        </div>
      </div>
    );
  }

  const currentTerm = terms[currentIndex];

  const handleRating = async (correct: boolean) => {
    try {
      setSubmitting(true);

      // Update review count and correct count
      const newReviewCount = currentTerm.review_count + 1;
      const newCorrectCount = currentTerm.correct_count + (correct ? 1 : 0);

      // Calculate new proficiency level
      const accuracy = newCorrectCount / newReviewCount;
      let newProficiency = currentTerm.proficiency_level;
      if (correct) {
        newProficiency = Math.min(5, newProficiency + 0.5);
      } else {
        newProficiency = Math.max(1, newProficiency - 0.5);
      }

      // Calculate next review date using spaced repetition
      const daysToAdd = correct ? Math.pow(2, newProficiency) : 1;
      const nextReviewDate = new Date();
      nextReviewDate.setDate(nextReviewDate.getDate() + daysToAdd);

      const { error } = await supabase
        .from('glossary_terms')
        .update({
          review_count: newReviewCount,
          correct_count: newCorrectCount,
          proficiency_level: newProficiency,
          confidence_score: accuracy,
          last_reviewed: new Date().toISOString(),
          next_review_date: nextReviewDate.toISOString().split('T')[0],
        })
        .eq('id', currentTerm.id)
        .eq('user_id', user?.id);

      if (error) throw error;

      setShowAnswer(false);
      onNext();
    } catch (error) {
      console.error('Error updating term:', error);
      toast.error('Failed to record review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm text-brand-gray-600 mb-2">
            <span className="font-body">Progress: {currentIndex + 1} / {terms.length}</span>
            <button
              onClick={onExit}
              className="text-brand-error hover:text-brand-error-dark font-semibold font-body"
            >
              Exit Review
            </button>
          </div>
          <div className="w-full bg-brand-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-brand-energy to-brand-energy-hover rounded-full h-2 transition-all duration-500"
              style={{ width: `${((currentIndex + 1) / terms.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Flashcard */}
        <div className="bg-white rounded-data shadow-card p-8 border border-brand-gray-200 min-h-[400px] flex flex-col justify-between">
          <div>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-brand-primary mb-4 font-sans">
                {currentTerm.term}
              </h2>
              {currentTerm.domain && (
                <span className="inline-block px-4 py-1 bg-brand-gray-100 text-brand-gray-700 rounded-full text-sm font-mono">
                  {currentTerm.domain}
                </span>
              )}
            </div>

            {showAnswer ? (
              <div className="space-y-4">
                <div className="p-4 bg-brand-gray-50 rounded-data">
                  <p className="text-lg text-brand-charcoal font-body leading-relaxed">
                    {currentTerm.definition}
                  </p>
                </div>
                {currentTerm.context && (
                  <div className="p-4 bg-blue-50 rounded-data border border-blue-200">
                    <p className="text-sm text-blue-900 italic font-body">
                      "{currentTerm.context}"
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <Brain className="w-16 h-16 text-brand-gray-300 mx-auto mb-4" />
                <p className="text-brand-gray-500 font-body">Try to recall the definition...</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-8">
            {!showAnswer ? (
              <button
                onClick={() => setShowAnswer(true)}
                className="w-full bg-gradient-to-r from-brand-primary to-brand-slate text-white font-bold px-8 py-4 rounded-data hover:shadow-lg transition-all font-sans"
              >
                Show Answer
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleRating(false)}
                  disabled={submitting}
                  className="bg-orange-100 text-orange-700 font-bold px-6 py-4 rounded-data hover:bg-orange-200 transition-all font-sans disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <X className="w-5 h-5" />
                  Need Practice
                </button>
                <button
                  onClick={() => handleRating(true)}
                  disabled={submitting}
                  className="bg-green-100 text-green-700 font-bold px-6 py-4 rounded-data hover:bg-green-200 transition-all font-sans disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  Got It!
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Missing import
function CheckCircle({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
