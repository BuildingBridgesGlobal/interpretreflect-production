import React from 'react';
import { X, Calendar, Tag, FileText } from 'lucide-react';

interface ReflectionDetailViewProps {
  reflection: {
    id: string;
    type: string;
    data: any;
    timestamp: string;
  };
  onClose: () => void;
}

export const ReflectionDetailView: React.FC<ReflectionDetailViewProps> = ({ reflection, onClose }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getReflectionTitle = (type: string): string => {
    const titleMap: Record<string, string> = {
      'wellness_checkin': 'Wellness Check-in',
      'wellness_check_in': 'Wellness Check-in',
      'post_assignment': 'Post-Assignment Debrief',
      'post_assignment_debrief': 'Post-Assignment Debrief',
      'pre_assignment': 'Pre-Assignment Prep',
      'pre_assignment_prep': 'Pre-Assignment Preparation',
      'teaming_prep': 'Teaming Preparation',
      'teaming_reflection': 'Teaming Reflection',
      'mentoring_prep': 'Mentoring Preparation',
      'mentoring_reflection': 'Mentoring Reflection',
      'ethics_meaning': 'Ethics & Meaning Check',
      'in_session_self': 'In-Session Self Check',
      'in_session_team': 'In-Session Team Sync',
      'role_space': 'Role Space Reflection',
      'direct_communication': 'Direct Communication Reflection',
      'direct_communication_reflection': 'Direct Communication Reflection',
      'burnout_assessment': 'Burnout Assessment',
      'compass_check': 'Compass Check',
      'breathing_practice': 'Breathing Practice',
      'body_awareness': 'Body Awareness'
    };
    return titleMap[type] || 'Reflection';
  };

  const renderFieldValue = (value: any): string => {
    if (value === null || value === undefined) return 'Not provided';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'string') return value || 'Not provided';
    if (Array.isArray(value)) return value.join(', ') || 'None';
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
  };

  const formatFieldName = (fieldName: string): string => {
    // Convert snake_case or camelCase to Title Case
    return fieldName
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Filter out system fields and timestamps
  const displayFields = Object.entries(reflection.data || {}).filter(([key]) => {
    const skipFields = ['id', 'user_id', 'created_at', 'updated_at', 'timestamp', 'reflection_id'];
    return !skipFields.includes(key) && !key.startsWith('_');
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col" style={{ backgroundColor: '#FAF9F6' }}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {getReflectionTitle(reflection.type)}
              </h2>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatDate(reflection.timestamp)}
                </span>
                <span className="flex items-center gap-1">
                  <Tag className="w-4 h-4" />
                  {reflection.type.replace(/_/g, ' ')}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white rounded-lg transition-all shadow-sm hover:shadow-md hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #1b5e20, #2e7d32)' }}
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {displayFields.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500">No reflection content to display</p>
            </div>
          ) : (
            <div className="space-y-4">
              {displayFields.map(([fieldName, value]) => {
                const displayValue = renderFieldValue(value);
                const isLongText = typeof value === 'string' && value.length > 100;

                return (
                  <div key={fieldName} className="border-b border-gray-100 pb-4 last:border-0">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {formatFieldName(fieldName)}
                    </label>
                    {isLongText ? (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-900 whitespace-pre-wrap">{displayValue}</p>
                      </div>
                    ) : (
                      <p className="text-gray-900">
                        {displayValue}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-white rounded-lg transition-all shadow-sm hover:shadow-md hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #1b5e20, #2e7d32)' }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};