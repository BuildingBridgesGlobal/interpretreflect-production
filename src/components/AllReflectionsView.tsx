import React, { useState, useEffect } from 'react';
import {
  X,
  Eye,
  Trash2,
  Calendar,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { getSessionToken } from '../services/directSupabaseApi';
import { getDisplayName } from '../config/reflectionTypes';
import { ReflectionDetailView } from './ReflectionDetailView';
import { ConfirmationModal } from './ConfirmationModal';

interface Reflection {
  id: string;
  user_id: string;
  reflection_id: string;
  entry_kind: string;
  data: any;
  created_at: string;
  updated_at: string;
}

interface AllReflectionsViewProps {
  userId: string;
  onClose: () => void;
  initialReflections?: Reflection[];
}

export const AllReflectionsView: React.FC<AllReflectionsViewProps> = ({
  userId,
  onClose,
  initialReflections = []
}) => {
  const [reflections, setReflections] = useState<Reflection[]>(initialReflections);
  const [loading, setLoading] = useState(!initialReflections.length);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReflection, setSelectedReflection] = useState<any>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; reflectionId: string | null }>({
    isOpen: false,
    reflectionId: null
  });
  const itemsPerPage = 10;

  // Load all reflections
  useEffect(() => {
    if (!initialReflections.length) {
      loadAllReflections();
    }
  }, []);

  const loadAllReflections = async () => {
    try {
      const accessToken = await getSessionToken();
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
      const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/reflection_entries?user_id=eq.${userId}&order=created_at.desc`,
        {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${accessToken || SUPABASE_ANON_KEY}`,
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to load reflections');
      }

      const data = await response.json();
      console.log('AllReflectionsView - Fetched reflections:', data);
      setReflections(data);
    } catch (error) {
      console.error('Error loading reflections:', error);
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteReflection = async () => {
    if (!confirmDelete.reflectionId) return;

    const reflectionId = confirmDelete.reflectionId;
    setConfirmDelete({ isOpen: false, reflectionId: null });
    setDeletingId(reflectionId);

    try {
      const accessToken = await getSessionToken();
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
      const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/reflection_entries?id=eq.${reflectionId}`,
        {
          method: 'DELETE',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${accessToken || SUPABASE_ANON_KEY}`,
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete reflection');
      }

      setReflections(prev => prev.filter(r => r.id !== reflectionId));
    } catch (error) {
      console.error('Error deleting reflection:', error);
      alert('Failed to delete reflection. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  // Filter reflections based on search
  const filteredReflections = reflections.filter(reflection => {
    if (searchTerm === '') return true;

    const searchLower = searchTerm.toLowerCase();
    return (
      JSON.stringify(reflection.data).toLowerCase().includes(searchLower) ||
      (reflection.entry_kind && reflection.entry_kind.toLowerCase().includes(searchLower))
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredReflections.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedReflections = filteredReflections.slice(startIndex, startIndex + itemsPerPage);

  // Get unique reflection types
  const reflectionTypes = Array.from(new Set(reflections
    .filter(r => r.entry_kind)
    .map(r => r.entry_kind)));

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Date not available';
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Date not available';
    }
  };

  const getReflectionTitle = (kind: string, data?: any) => {
    console.log('AllReflectionsView - getReflectionTitle called with kind:', kind, 'data:', data);
    // Use centralized function for consistent naming - pass data to infer type if needed
    return getDisplayName(kind, data);
  };

  const getReflectionPreview = (data: any) => {
    if (!data) return 'No content available';

    // Try to find the first meaningful text field
    const previewFields = [
      'commitment',
      'gratitude',
      'affirmation',
      'context_background',
      'situation_description',
      'current_feeling',
      'intention_statement',
      'reflection_text',
      'notes',
      'thoughts',
      'message',
      'content',
      'description',
      'reflection',
      'summary'
    ];

    for (const field of previewFields) {
      if (data[field] && typeof data[field] === 'string' && data[field].length > 0) {
        return data[field].substring(0, 150) + (data[field].length > 150 ? '...' : '');
      }
    }

    // Check for nested reflection data
    if (data.reflectionData) {
      for (const field of previewFields) {
        if (data.reflectionData[field] && typeof data.reflectionData[field] === 'string' && data.reflectionData[field].length > 0) {
          return data.reflectionData[field].substring(0, 150) + (data.reflectionData[field].length > 150 ? '...' : '');
        }
      }
    }

    // If no text fields, show a summary of available data
    const keys = Object.keys(data);
    return `Contains ${keys.length} fields of data`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] flex flex-col" style={{ backgroundColor: '#FAF9F6' }}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">All Reflections</h2>
            <button
              onClick={onClose}
              className="p-2 text-white rounded-lg transition-all shadow-sm hover:shadow-md hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #1b5e20, #2e7d32)' }}
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search reflections..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div className="mt-3 text-sm text-gray-600">
            Showing {paginatedReflections.length} of {filteredReflections.length} reflections
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-500">Loading reflections...</div>
            </div>
          ) : paginatedReflections.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64">
              <Calendar className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-gray-500">
                {searchTerm
                  ? 'No reflections match your search criteria'
                  : 'No reflections yet'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {paginatedReflections.map((reflection) => (
                <div
                  key={reflection.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {getReflectionTitle(reflection.entry_kind, reflection.data)}
                        </h3>
                        {reflection.entry_kind && (
                          <span
                            className="px-2 py-1 text-xs rounded-full text-white"
                            style={{ background: 'linear-gradient(135deg, #1b5e20, #2e7d32)' }}
                          >
                            {reflection.entry_kind.replace(/_/g, ' ')}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mb-2">
                        <Calendar className="inline w-3 h-3 mr-1" />
                        {formatDate(reflection.created_at)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {getReflectionPreview(reflection.data)}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => {
                          // Format the reflection data to match what ReflectionDetailView expects
                          const formattedReflection = {
                            id: reflection.id,
                            type: reflection.entry_kind || 'personal_reflection',
                            data: reflection.data,
                            timestamp: reflection.created_at
                          };
                          setSelectedReflection(formattedReflection);
                        }}
                        className="p-2 text-white rounded-lg transition-all shadow-sm hover:shadow-md hover:opacity-90"
                        style={{ background: 'linear-gradient(135deg, #1b5e20, #2e7d32)' }}
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setConfirmDelete({ isOpen: true, reflectionId: reflection.id })}
                        disabled={deletingId === reflection.id}
                        className={`p-2 text-white rounded-lg transition-all shadow-sm hover:shadow-md hover:opacity-90 ${
                          deletingId === reflection.id ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        style={{ background: 'linear-gradient(135deg, #d32f2f, #f44336)' }}
                        title="Delete reflection"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-200 flex items-center justify-between">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            <div className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all ${
                currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Reflection Detail View Modal */}
      {selectedReflection && (
        <ReflectionDetailView
          reflection={selectedReflection}
          onClose={() => setSelectedReflection(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmDelete.isOpen}
        title="Delete Reflection"
        message="Are you sure you want to delete this reflection? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDeleteReflection}
        onCancel={() => setConfirmDelete({ isOpen: false, reflectionId: null })}
        isDanger={true}
      />
    </div>
  );
};