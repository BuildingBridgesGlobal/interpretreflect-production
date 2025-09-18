import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDanger?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title = 'Confirm Action',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  isDanger = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6" style={{ backgroundColor: '#FAF9F6' }}>
        <div className="flex items-start gap-4 mb-4">
          <div
            className="p-2 rounded-full"
            style={{
              background: isDanger
                ? 'linear-gradient(135deg, #fee2e2, #fecaca)'
                : 'linear-gradient(135deg, #e0f2fe, #bae6fd)'
            }}
          >
            <AlertTriangle
              className="w-5 h-5"
              style={{ color: isDanger ? '#dc2626' : '#0284c7' }}
            />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {title}
            </h3>
            <p className="text-gray-600">
              {message}
            </p>
          </div>
        </div>

        <div className="flex gap-3 justify-end mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-white rounded-lg transition-all shadow-sm hover:shadow-md hover:opacity-90"
            style={{
              background: isDanger
                ? 'linear-gradient(135deg, #dc2626, #ef4444)'
                : 'linear-gradient(135deg, #1b5e20, #2e7d32)'
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};