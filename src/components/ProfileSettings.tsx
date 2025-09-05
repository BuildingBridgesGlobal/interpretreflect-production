import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  Camera,
  Shield,
  Globe,
  Save,
  X,
  Check,
  AlertCircle,
  Download,
  Trash2,
  Eye,
  EyeOff,
  HelpCircle,
  Lock,
  ChevronDown,
  Upload,
  RefreshCw
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

// ========== TYPES ==========
interface UserProfile {
  id: string;
  full_name: string;
  pronouns?: string;
  credentials?: string[];
  profile_photo_url?: string;
  preferred_language: string;
  accessibility_settings: {
    larger_text: boolean;
    high_contrast: boolean;
  };
  email?: string;
  created_at?: string;
  updated_at?: string;
}

interface FormErrors {
  full_name?: string;
  pronouns?: string;
  credentials?: string;
  profile_photo?: string;
  general?: string;
}

// ========== CONSTANTS ==========
const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English (default)', flag: '🇺🇸' },
  { code: 'es', label: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', label: 'French', flag: '🇫🇷' },
  { code: 'asl', label: 'ASL Resources', flag: '🤟' },
  { code: 'zh', label: 'Chinese', flag: '🇨🇳' },
  { code: 'ar', label: 'Arabic', flag: '🇸🇦' }
];

const COMMON_CREDENTIALS = [
  'RID CI/CT',
  'NIC-Advanced',
  'BEI Master',
  'CHIT',
  'CCHI',
  'NAATI',
  'AIIC',
  'RID CDI',
  'BEI Court',
  'Medical Interpreter'
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

// ========== MAIN COMPONENT ==========
export const ProfileSettings: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    id: '',
    full_name: '',
    pronouns: '',
    credentials: [],
    profile_photo_url: '',
    preferred_language: 'en',
    accessibility_settings: {
      larger_text: false,
      high_contrast: false
    }
  });
  const [originalProfile, setOriginalProfile] = useState<UserProfile | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [credentialInput, setCredentialInput] = useState('');
  const [showCredentialSuggestions, setShowCredentialSuggestions] = useState(false);
  
  // Refs for accessibility
  const fileInputRef = useRef<HTMLInputElement>(null);
  const announcementRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // ========== DATA FETCHING ==========
  useEffect(() => {
    if (!user) return;
    fetchUserProfile();
  }, [user]);

  // Apply accessibility settings
  useEffect(() => {
    const root = document.documentElement;
    
    if (profile.accessibility_settings.larger_text) {
      root.classList.add('larger-text');
    } else {
      root.classList.remove('larger-text');
    }
    
    if (profile.accessibility_settings.high_contrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
  }, [profile.accessibility_settings]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setErrors({});
      
      // Fetch profile from database
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') { // Not found is ok
        throw error;
      }

      const profileData: UserProfile = data || {
        id: user?.id || '',
        full_name: user?.user_metadata?.full_name || '',
        pronouns: '',
        credentials: [],
        profile_photo_url: user?.user_metadata?.avatar_url || '',
        preferred_language: 'en',
        accessibility_settings: {
          larger_text: false,
          high_contrast: false
        },
        email: user?.email
      };

      setProfile(profileData);
      setOriginalProfile(profileData);
      
    } catch (err) {
      console.error('Error fetching profile:', err);
      setErrors({ general: 'Failed to load profile. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // ========== FORM HANDLERS ==========
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    // Validate full name
    if (!profile.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    } else if (profile.full_name.length > 100) {
      newErrors.full_name = 'Full name must be less than 100 characters';
    }
    
    // Validate pronouns (optional but if provided, check length)
    if (profile.pronouns && profile.pronouns.length > 50) {
      newErrors.pronouns = 'Pronouns must be less than 50 characters';
    }
    
    // Validate credentials
    if (profile.credentials && profile.credentials.length > 10) {
      newErrors.credentials = 'Maximum 10 credentials allowed';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      announceToScreenReader('Please correct the errors in the form');
      return;
    }
    
    try {
      setSaving(true);
      setErrors({});
      setSuccessMessage('');
      
      // Save to database
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          id: user?.id,
          full_name: profile.full_name.trim(),
          pronouns: profile.pronouns?.trim() || null,
          credentials: profile.credentials,
          profile_photo_url: profile.profile_photo_url || null,
          preferred_language: profile.preferred_language,
          accessibility_settings: profile.accessibility_settings,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      
      // Update auth metadata if name changed
      if (profile.full_name !== originalProfile?.full_name) {
        await supabase.auth.updateUser({
          data: { full_name: profile.full_name }
        });
      }
      
      setOriginalProfile(profile);
      setSuccessMessage('Profile updated successfully!');
      announceToScreenReader('Profile settings saved successfully');
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);
      
    } catch (err) {
      console.error('Error saving profile:', err);
      setErrors({ general: 'Failed to save profile. Please try again.' });
      announceToScreenReader('Error saving profile settings');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (originalProfile) {
      setProfile(originalProfile);
      setErrors({});
      setSuccessMessage('');
      announceToScreenReader('Changes canceled');
    }
  };

  // ========== PHOTO UPLOAD ==========
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setErrors({ profile_photo: 'Please upload a valid image file (JPEG, PNG, GIF, or WebP)' });
      announceToScreenReader('Invalid file type. Please upload an image file');
      return;
    }
    
    if (file.size > MAX_FILE_SIZE) {
      setErrors({ profile_photo: 'File size must be less than 5MB' });
      announceToScreenReader('File too large. Please upload a smaller image');
      return;
    }
    
    try {
      setErrors({ ...errors, profile_photo: undefined });
      
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Date.now()}.${fileExt}`;
      const filePath = `profile-photos/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      setProfile({ ...profile, profile_photo_url: data.publicUrl });
      announceToScreenReader('Profile photo uploaded successfully');
      
    } catch (err) {
      console.error('Error uploading photo:', err);
      setErrors({ profile_photo: 'Failed to upload photo. Please try again.' });
      announceToScreenReader('Error uploading photo');
    }
  };

  const handlePhotoRemove = async () => {
    try {
      // Remove from storage if it's a custom upload
      if (profile.profile_photo_url && profile.profile_photo_url.includes('avatars')) {
        const path = profile.profile_photo_url.split('/').pop();
        if (path) {
          await supabase.storage
            .from('avatars')
            .remove([`profile-photos/${path}`]);
        }
      }
      
      setProfile({ ...profile, profile_photo_url: '' });
      announceToScreenReader('Profile photo removed');
      
    } catch (err) {
      console.error('Error removing photo:', err);
      setErrors({ profile_photo: 'Failed to remove photo. Please try again.' });
    }
  };

  // ========== CREDENTIALS MANAGEMENT ==========
  const handleAddCredential = (credential: string) => {
    const trimmed = credential.trim();
    if (!trimmed) return;
    
    if (profile.credentials?.includes(trimmed)) {
      setErrors({ credentials: 'This credential has already been added' });
      return;
    }
    
    if (profile.credentials && profile.credentials.length >= 10) {
      setErrors({ credentials: 'Maximum 10 credentials allowed' });
      return;
    }
    
    setProfile({
      ...profile,
      credentials: [...(profile.credentials || []), trimmed]
    });
    setCredentialInput('');
    setShowCredentialSuggestions(false);
    setErrors({ ...errors, credentials: undefined });
    announceToScreenReader(`Credential ${trimmed} added`);
  };

  const handleRemoveCredential = (index: number) => {
    const removed = profile.credentials?.[index];
    setProfile({
      ...profile,
      credentials: profile.credentials?.filter((_, i) => i !== index) || []
    });
    announceToScreenReader(`Credential ${removed} removed`);
  };

  // ========== DATA MANAGEMENT ==========
  const handleDataExport = async () => {
    try {
      // Gather all user data
      const exportData = {
        profile,
        reflections: await fetchUserReflections(),
        exportedAt: new Date().toISOString()
      };
      
      // Create download
      const blob = new Blob([JSON.stringify(exportData, null, 2)], 
        { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `interpretreflect-data-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      announceToScreenReader('Data export downloaded');
      
    } catch (err) {
      console.error('Error exporting data:', err);
      setErrors({ general: 'Failed to export data. Please try again.' });
    }
  };

  const handleDataDeletion = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }
    
    try {
      // This would trigger a deletion request
      // In production, this should be handled by backend/support
      await supabase.from('deletion_requests').insert({
        user_id: user?.id,
        requested_at: new Date().toISOString()
      });
      
      setSuccessMessage('Deletion request submitted. We will contact you within 48 hours.');
      setShowDeleteConfirm(false);
      announceToScreenReader('Data deletion request submitted');
      
    } catch (err) {
      console.error('Error requesting deletion:', err);
      setErrors({ general: 'Failed to submit deletion request. Please contact support.' });
    }
  };

  const fetchUserReflections = async () => {
    const { data } = await supabase
      .from('reflection_entries')
      .select('*')
      .eq('user_id', user?.id);
    return data || [];
  };

  // ========== UTILITY FUNCTIONS ==========
  const announceToScreenReader = (message: string) => {
    if (announcementRef.current) {
      announcementRef.current.textContent = message;
    }
  };

  const hasUnsavedChanges = (): boolean => {
    return JSON.stringify(profile) !== JSON.stringify(originalProfile);
  };

  // ========== RENDER ==========
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center" role="status" aria-live="polite">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" aria-hidden="true" />
          <p className="text-gray-600">Loading profile settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${
      profile.accessibility_settings.larger_text ? 'text-lg' : ''
    } ${
      profile.accessibility_settings.high_contrast ? 'high-contrast' : ''
    }`}>
      {/* Skip to main content */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-black focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Skip to main content
      </a>

      {/* Screen reader announcements */}
      <div
        ref={announcementRef}
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      />

      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <User className="w-6 h-6 text-blue-600" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Profile Settings
              </h1>
              <p className="text-gray-600 mt-1">
                Personalize your professional experience
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Manage what you share, control how you appear, and update your details securely at any time.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success/Error Messages */}
        {successMessage && (
          <div 
            className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg"
            role="alert"
          >
            <div className="flex items-center">
              <Check className="w-5 h-5 text-green-600 mr-2" aria-hidden="true" />
              <p className="text-green-800">{successMessage}</p>
            </div>
          </div>
        )}

        {errors.general && (
          <div 
            className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg"
            role="alert"
          >
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" aria-hidden="true" />
              <p className="text-red-800">{errors.general}</p>
            </div>
          </div>
        )}

        {/* Profile Form */}
        <form 
          ref={formRef}
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-sm p-6 space-y-6"
          noValidate
        >
          {/* Full Name */}
          <div className="space-y-2">
            <label 
              htmlFor="full-name"
              className="block text-sm font-medium text-gray-700"
            >
              Full Name
              <span className="text-red-500 ml-1" aria-label="required">*</span>
            </label>
            <p className="text-sm text-gray-500">
              Your name as it appears in reflections and records.
            </p>
            <input
              ref={nameInputRef}
              id="full-name"
              type="text"
              value={profile.full_name}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.full_name ? 'border-red-500' : 'border-gray-300'
              }`}
              aria-required="true"
              aria-invalid={!!errors.full_name}
              aria-describedby={errors.full_name ? 'name-error' : 'name-help'}
              autoComplete="name"
            />
            {errors.full_name && (
              <p id="name-error" className="text-sm text-red-600 mt-1" role="alert">
                {errors.full_name}
              </p>
            )}
          </div>

          {/* Pronouns */}
          <div className="space-y-2">
            <label 
              htmlFor="pronouns"
              className="block text-sm font-medium text-gray-700"
            >
              Pronouns
              <span className="text-gray-400 ml-2 text-xs font-normal">(optional)</span>
            </label>
            <p id="pronouns-help" className="text-sm text-gray-500">
              Let others know your pronouns if you wish.
            </p>
            <input
              id="pronouns"
              type="text"
              value={profile.pronouns || ''}
              onChange={(e) => setProfile({ ...profile, pronouns: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.pronouns ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., she/her, he/him, they/them"
              aria-describedby="pronouns-help"
              aria-invalid={!!errors.pronouns}
            />
            {errors.pronouns && (
              <p className="text-sm text-red-600 mt-1" role="alert">
                {errors.pronouns}
              </p>
            )}
          </div>

          {/* Professional Credentials */}
          <div className="space-y-2">
            <label 
              htmlFor="credentials"
              className="block text-sm font-medium text-gray-700"
            >
              Professional Credentials
              <button
                type="button"
                className="ml-2 text-gray-400 hover:text-gray-600"
                aria-label="Help with credentials"
                onClick={() => setShowCredentialSuggestions(!showCredentialSuggestions)}
              >
                <HelpCircle className="w-4 h-4 inline" />
              </button>
            </label>
            <p id="credentials-help" className="text-sm text-gray-500">
              E.g., "RID CI/CT," "NIC-Advanced," "BEI Master," "CHIT"
            </p>
            
            {/* Credential Tags */}
            {profile.credentials && profile.credentials.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2" role="list" aria-label="Your credentials">
                {profile.credentials.map((cred, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    role="listitem"
                  >
                    <span>{cred}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCredential(index)}
                      className="ml-1 hover:text-blue-900"
                      aria-label={`Remove ${cred}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {/* Credential Input */}
            <div className="flex gap-2">
              <input
                id="credentials"
                type="text"
                value={credentialInput}
                onChange={(e) => setCredentialInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCredential(credentialInput);
                  }
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add a credential"
                aria-describedby="credentials-help"
              />
              <button
                type="button"
                onClick={() => handleAddCredential(credentialInput)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label="Add credential"
              >
                Add
              </button>
            </div>
            
            {/* Credential Suggestions */}
            {showCredentialSuggestions && (
              <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-2">Common credentials:</p>
                <div className="flex flex-wrap gap-1">
                  {COMMON_CREDENTIALS.map(cred => (
                    <button
                      key={cred}
                      type="button"
                      onClick={() => handleAddCredential(cred)}
                      className="text-xs px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100"
                    >
                      {cred}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {errors.credentials && (
              <p className="text-sm text-red-600 mt-1" role="alert">
                {errors.credentials}
              </p>
            )}
          </div>

          {/* Profile Photo */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Profile Photo
              <span className="text-gray-400 ml-2 text-xs font-normal">(optional)</span>
            </label>
            <p className="text-sm text-gray-500">
              Upload a photo—used only within your private dashboard.
            </p>
            
            <div className="flex items-center gap-4">
              {/* Photo Preview */}
              <div className="relative">
                {profile.profile_photo_url ? (
                  <img
                    src={profile.profile_photo_url}
                    alt="Profile photo"
                    className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="w-8 h-8 text-gray-400" aria-hidden="true" />
                  </div>
                )}
              </div>
              
              {/* Photo Actions */}
              <div className="flex flex-col gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handlePhotoUpload}
                  className="sr-only"
                  id="photo-upload"
                  aria-label="Upload profile photo"
                />
                <label
                  htmlFor="photo-upload"
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer flex items-center gap-2 text-sm"
                >
                  <Upload className="w-4 h-4" aria-hidden="true" />
                  {profile.profile_photo_url ? 'Replace' : 'Upload'}
                </label>
                {profile.profile_photo_url && (
                  <button
                    type="button"
                    onClick={handlePhotoRemove}
                    className="px-4 py-2 bg-white border border-red-300 text-red-600 rounded-lg hover:bg-red-50 text-sm"
                    aria-label="Remove profile photo"
                  >
                    <Trash2 className="w-4 h-4 inline mr-1" aria-hidden="true" />
                    Remove
                  </button>
                )}
              </div>
            </div>
            
            {errors.profile_photo && (
              <p className="text-sm text-red-600 mt-1" role="alert">
                {errors.profile_photo}
              </p>
            )}
          </div>

          {/* Preferred Language */}
          <div className="space-y-2">
            <label 
              htmlFor="language"
              className="block text-sm font-medium text-gray-700"
            >
              Preferred Language
            </label>
            <p id="language-help" className="text-sm text-gray-500">
              Interact with the platform in your language of choice.
            </p>
            <div className="relative">
              <select
                id="language"
                value={profile.preferred_language}
                onChange={(e) => setProfile({ ...profile, preferred_language: e.target.value })}
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                aria-describedby="language-help"
              >
                {SUPPORTED_LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" aria-hidden="true" />
            </div>
          </div>

          {/* Accessibility Controls */}
          <div className="space-y-4">
            <h2 className="text-sm font-medium text-gray-700">
              Accessibility Controls
            </h2>
            <p className="text-sm text-gray-500">
              Improve readability as needed. Settings are saved automatically.
            </p>
            
            {/* Larger Text Toggle */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-gray-600" aria-hidden="true" />
                <div>
                  <label htmlFor="larger-text" className="text-sm font-medium text-gray-700">
                    Larger Text
                  </label>
                  <p className="text-xs text-gray-500">Increase text size for better readability</p>
                </div>
              </div>
              <button
                type="button"
                id="larger-text"
                role="switch"
                aria-checked={profile.accessibility_settings.larger_text}
                onClick={() => setProfile({
                  ...profile,
                  accessibility_settings: {
                    ...profile.accessibility_settings,
                    larger_text: !profile.accessibility_settings.larger_text
                  }
                })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  profile.accessibility_settings.larger_text ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span className="sr-only">Enable larger text</span>
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    profile.accessibility_settings.larger_text ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            {/* High Contrast Toggle */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-gray-600 bg-black rounded" aria-hidden="true" />
                <div>
                  <label htmlFor="high-contrast" className="text-sm font-medium text-gray-700">
                    High Contrast Mode
                  </label>
                  <p className="text-xs text-gray-500">Enhance color contrast for visual clarity</p>
                </div>
              </div>
              <button
                type="button"
                id="high-contrast"
                role="switch"
                aria-checked={profile.accessibility_settings.high_contrast}
                onClick={() => setProfile({
                  ...profile,
                  accessibility_settings: {
                    ...profile.accessibility_settings,
                    high_contrast: !profile.accessibility_settings.high_contrast
                  }
                })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  profile.accessibility_settings.high_contrast ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span className="sr-only">Enable high contrast mode</span>
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    profile.accessibility_settings.high_contrast ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Security & Privacy Message */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
              <div className="space-y-2 text-sm">
                <p className="font-medium text-blue-900">
                  Your data is always encrypted and never shared outside InterpretReflect without your explicit consent.
                </p>
                <p className="text-blue-800">
                  You may request a copy or deletion of your data at any time:
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <button
                    type="button"
                    onClick={handleDataExport}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-white text-blue-700 border border-blue-300 rounded-lg hover:bg-blue-50 text-sm"
                    aria-label="Request data export"
                  >
                    <Download className="w-4 h-4" aria-hidden="true" />
                    Export Data
                  </button>
                  {!showDeleteConfirm ? (
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-white text-red-700 border border-red-300 rounded-lg hover:bg-red-50 text-sm"
                      aria-label="Request data deletion"
                    >
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                      Request Deletion
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-red-700 text-sm">Confirm deletion?</span>
                      <button
                        type="button"
                        onClick={handleDataDeletion}
                        className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(false)}
                        className="px-3 py-1 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 text-sm"
                      >
                        No
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="submit"
              disabled={saving || !hasUnsavedChanges()}
              className={`flex-1 px-6 py-3 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
                saving || !hasUnsavedChanges()
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
              }`}
              aria-label={saving ? 'Saving changes' : 'Save changes'}
              aria-busy={saving}
            >
              {saving ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin inline mr-2" aria-hidden="true" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 inline mr-2" aria-hidden="true" />
                  Save Changes
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={!hasUnsavedChanges()}
              className={`px-6 py-3 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
                !hasUnsavedChanges()
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-500'
              }`}
              aria-label="Cancel changes"
            >
              Cancel
            </button>
          </div>
        </form>
      </main>

      {/* CSS for accessibility settings */}
      <style jsx global>{`
        .larger-text {
          font-size: 1.125rem;
        }
        
        .larger-text h1 {
          font-size: 2.5rem;
        }
        
        .larger-text h2 {
          font-size: 2rem;
        }
        
        .high-contrast {
          filter: contrast(1.2);
        }
        
        .high-contrast input,
        .high-contrast select,
        .high-contrast button {
          border-width: 2px;
        }
        
        .high-contrast *:focus {
          outline-width: 3px;
          outline-color: #000;
        }
      `}</style>
    </div>
  );
};

export default ProfileSettings;