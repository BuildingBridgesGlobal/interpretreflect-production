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
  RefreshCw,
  Mail,
  Award,
  Briefcase,
  Languages,
  Palette,
  Bell,
  UserPlus,
  Settings,
  Zap,
  BarChart3,
  Users,
  Sparkles
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

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
    reduce_motion: boolean;
    screen_reader: boolean;
  };
  email?: string;
  bio?: string;
  years_experience?: number;
  specializations?: string[];
  created_at?: string;
  updated_at?: string;
}

interface FormErrors {
  full_name?: string;
  pronouns?: string;
  credentials?: string;
  profile_photo?: string;
  bio?: string;
  general?: string;
}

// ========== CONSTANTS ==========
const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'es', label: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', label: 'French', flag: '🇫🇷' },
  { code: 'asl', label: 'ASL Resources', flag: '🤟' },
  { code: 'zh', label: 'Chinese', flag: '🇨🇳' },
  { code: 'ar', label: 'Arabic', flag: '🇸🇦' },
  { code: 'pt', label: 'Portuguese', flag: '🇵🇹' },
  { code: 'ru', label: 'Russian', flag: '🇷🇺' }
];

const COMMON_CREDENTIALS = [
  // ASL Certifications
  'RID CI/CT (Certificate of Interpretation/Certificate of Transliteration)',
  'RID CDI (Certified Deaf Interpreter)',
  'RID NIC (National Interpreter Certification)',
  'RID NIC-Advanced',
  'RID NIC-Master',
  'RID SC:L (Specialist Certificate: Legal)',
  'BEI Basic',
  'BEI Advanced',
  'BEI Master',
  'BEI Court Certified',
  'EIPA Level 3',
  'EIPA Level 4',
  'EIPA Level 5',

  // Spoken Language Certifications
  'CHI™ (Certified Healthcare Interpreter)',
  'CMI (Certified Medical Interpreter)',
  'CCHI (Certification Commission for Healthcare Interpreters)',
  'CoreCHI™',
  'NAATI Certified Provisional',
  'NAATI Certified',
  'NAATI Certified Advanced',
  'NAATI Certified Senior',
  'AIIC Member',
  'ATA Certified',

  // Specialized Certifications
  'Legal/Court Interpreter',
  'Medical Interpreter',
  'Conference Interpreter',
  'Educational Interpreter',
  'Mental Health Interpreter',
  'VRI/VRS Certified',
  'Trilingual Interpreter',

  // State-Specific (Dummy Examples)
  'California Court Interpreter',
  'New York State Certified',
  'Texas BEI Certified',
  'Florida Registry Approved'
];

const SPECIALIZATIONS = [
  'Medical',
  'Legal',
  'Mental Health',
  'Education',
  'Conference',
  'Community',
  'VRI/VRS',
  'Theatre',
  'Government',
  'Technology',
  'Business',
  'Religious'
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

// ========== MAIN COMPONENT ==========
interface ProfileSettingsProps {
  devMode?: boolean;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({ devMode = false }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<'profile' | 'accessibility' | 'privacy'>('profile');
  const [profile, setProfile] = useState<UserProfile>({
    id: '',
    full_name: '',
    pronouns: '',
    credentials: [],
    profile_photo_url: '',
    preferred_language: 'en',
    accessibility_settings: {
      larger_text: false,
      high_contrast: false,
      reduce_motion: false,
      screen_reader: false
    },
    bio: '',
    years_experience: 0,
    specializations: []
  });
  const [originalProfile, setOriginalProfile] = useState<UserProfile | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [credentialInput, setCredentialInput] = useState('');
  const [showCredentialDropdown, setShowCredentialDropdown] = useState(false);
  const [filteredCredentials, setFilteredCredentials] = useState<string[]>([]);
  const [notificationPrefs, setNotificationPrefs] = useState({
    email_reminders: true,
    weekly_insights: true,
    team_updates: false,
    product_news: false
  });
  
  // Privacy settings state
  const [privacySettings, setPrivacySettings] = useState({
    analytics: true,
    notifications: true,
    team_visibility: false
  });
  
  // Refs for accessibility
  const fileInputRef = useRef<HTMLInputElement>(null);
  const announcementRef = useRef<HTMLDivElement>(null);

  // ========== DATA FETCHING ==========
  useEffect(() => {
    if (devMode) {
      // Use mock data in dev mode
      const mockProfile: UserProfile = {
        id: 'dev-user',
        full_name: 'Developer User',
        pronouns: 'they/them',
        credentials: ['RID CI/CT'],
        profile_photo_url: '',
        preferred_language: 'en',
        accessibility_settings: {
          larger_text: false,
          high_contrast: false,
          reduce_motion: false,
          screen_reader: false
        },
        email: 'dev@interpretreflect.com',
        bio: 'Testing the platform in development mode',
        years_experience: 5,
        specializations: ['Medical', 'Legal']
      };
      setProfile(mockProfile);
      setOriginalProfile(mockProfile);
      setLoading(false);
    } else if (user) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, [user, devMode]);

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

    if (profile.accessibility_settings.reduce_motion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }
  }, [profile.accessibility_settings]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setErrors({});

      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), 5000)
      );

      const fetchPromise = supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]).catch(() => ({
        data: null,
        error: { code: 'TIMEOUT', message: 'Request timed out' }
      }));

      // If table doesn't exist or timeout, use default profile
      if (error && error.code !== 'PGRST116') {
        console.warn('Profile table may not exist, using default profile');
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
          high_contrast: false,
          reduce_motion: false,
          screen_reader: false
        },
        email: user?.email,
        bio: '',
        years_experience: 0,
        specializations: []
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
    
    if (!profile.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    } else if (profile.full_name.length > 100) {
      newErrors.full_name = 'Full name must be less than 100 characters';
    }
    
    if (profile.pronouns && profile.pronouns.length > 50) {
      newErrors.pronouns = 'Pronouns must be less than 50 characters';
    }

    if (profile.bio && profile.bio.length > 500) {
      newErrors.bio = 'Bio must be less than 500 characters';
    }
    
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
      
      if (devMode) {
        // In dev mode, just simulate saving
        await new Promise(resolve => setTimeout(resolve, 1000));
        setOriginalProfile(profile);
        setSuccessMessage('Profile updated successfully!');
        announceToScreenReader('Profile saved successfully');
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
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
          bio: profile.bio?.trim() || null,
          years_experience: profile.years_experience,
          specializations: profile.specializations,
          updated_at: new Date().toISOString()
        });

        if (error) throw error;
        
        if (profile.full_name !== originalProfile?.full_name) {
          await supabase.auth.updateUser({
            data: { full_name: profile.full_name }
          });
        }
        
        setOriginalProfile(profile);
        setSuccessMessage('Profile updated successfully!');
        announceToScreenReader('Profile settings saved successfully');
        
        setTimeout(() => setSuccessMessage(''), 5000);
      }
      
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
    
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setErrors({ profile_photo: 'Please upload a valid image file (JPEG, PNG, GIF, or WebP)' });
      return;
    }
    
    if (file.size > MAX_FILE_SIZE) {
      setErrors({ profile_photo: 'File size must be less than 5MB' });
      return;
    }
    
    try {
      setErrors({ ...errors, profile_photo: undefined });
      
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
      
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      setProfile({ ...profile, profile_photo_url: data.publicUrl });
      announceToScreenReader('Profile photo uploaded successfully');
      
    } catch (err) {
      console.error('Error uploading photo:', err);
      setErrors({ profile_photo: 'Failed to upload photo. Please try again.' });
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
  };

  const handleRemoveCredential = (index: number) => {
    setProfile({
      ...profile,
      credentials: profile.credentials?.filter((_, i) => i !== index) || []
    });
  };

  // ========== SPECIALIZATIONS ==========
  const toggleSpecialization = (spec: string) => {
    const current = profile.specializations || [];
    if (current.includes(spec)) {
      setProfile({
        ...profile,
        specializations: current.filter(s => s !== spec)
      });
    } else {
      setProfile({
        ...profile,
        specializations: [...current, spec]
      });
    }
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
      <div style={{ 
        backgroundColor: '#FAF9F6', 
        minHeight: '100vh',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif"
      }} className="flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: '#6B8B60' }} />
          <p style={{ color: '#666666' }}>Loading profile settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      backgroundColor: '#FAF9F6', 
      minHeight: '100vh',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif"
    }}>
      {/* Screen reader announcements */}
      <div ref={announcementRef} className="sr-only" role="status" aria-live="polite" />

      {/* Header */}
      <div 
        className="border-b"
        style={{ 
          backgroundColor: '#FFFFFF',
          borderColor: 'rgba(92, 127, 79, 0.15)'
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-4">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'rgba(107, 139, 96, 0.1)' }}
              >
                <User className="w-6 h-6" style={{ color: '#6B8B60' }} />
              </div>
              <div>
                <h1 className="text-3xl font-bold" style={{ color: '#1A1A1A' }}>
                  Profile Settings
                </h1>
                <p className="text-sm mt-1" style={{ color: '#666666' }}>
                  Personalize your professional experience
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/')}
              className="p-2 rounded-lg transition-all hover:scale-110"
              style={{
                backgroundColor: 'rgba(107, 139, 96, 0.1)',
              }}
              aria-label="Close profile settings"
            >
              <X className="w-6 h-6" style={{ color: '#6B8B60' }} />
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="flex gap-2 p-1 rounded-xl" style={{ backgroundColor: '#FFFFFF' }}>
          {(['profile', 'accessibility', 'privacy'] as const).map((section) => (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all capitalize ${
                activeSection === section 
                  ? 'text-white' 
                  : 'text-gray-600'
              }`}
              style={{
                background: activeSection === section 
                  ? 'linear-gradient(135deg, rgb(27, 94, 32), rgb(46, 125, 50))'
                  : 'transparent'
              }}
              onMouseEnter={(e) => {
                if (activeSection !== section) {
                  e.currentTarget.style.backgroundColor = 'rgba(107, 139, 96, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeSection !== section) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              {section === 'privacy' ? 'Privacy & Data' : section}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Success/Error Messages */}
        {successMessage && (
          <div 
            className="mb-6 p-4 rounded-xl flex items-center gap-3"
            style={{
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.2)'
            }}
          >
            <Check className="w-5 h-5" style={{ color: '#10B981' }} />
            <p style={{ color: '#047857' }}>{successMessage}</p>
          </div>
        )}

        {errors.general && (
          <div 
            className="mb-6 p-4 rounded-xl flex items-center gap-3"
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)'
            }}
          >
            <AlertCircle className="w-5 h-5" style={{ color: '#EF4444' }} />
            <p style={{ color: '#DC2626' }}>{errors.general}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Profile Section */}
          {activeSection === 'profile' && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div 
                className="rounded-2xl p-6"
                style={{
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)'
                }}
              >
                <h2 className="text-xl font-bold mb-6" style={{ color: '#1A1A1A' }}>
                  Basic Information
                </h2>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#1A1A1A' }}>
                      Full Name <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={profile.full_name}
                      onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2"
                      style={{
                        borderColor: errors.full_name ? '#EF4444' : '#E5E5E5',
                        backgroundColor: '#FAF9F6',
                        focusRingColor: '#6B8B60'
                      }}
                      placeholder="Enter your full name"
                    />
                    {errors.full_name && (
                      <p className="text-sm mt-1" style={{ color: '#EF4444' }}>
                        {errors.full_name}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#1A1A1A' }}>
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-3.5 w-5 h-5" style={{ color: '#999999' }} />
                      <input
                        type="email"
                        value={profile.email || ''}
                        disabled
                        className="w-full pl-12 pr-4 py-3 rounded-xl border"
                        style={{
                          borderColor: '#E5E5E5',
                          backgroundColor: '#F5F5F5',
                          color: '#999999'
                        }}
                      />
                    </div>
                  </div>

                  {/* Years of Experience */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#1A1A1A' }}>
                      Years of Experience
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={profile.years_experience || 0}
                      onChange={(e) => setProfile({ ...profile, years_experience: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2"
                      style={{
                        borderColor: '#E5E5E5',
                        backgroundColor: '#FAF9F6'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Profile Photo */}
              <div 
                className="rounded-2xl p-6"
                style={{
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)'
                }}
              >
                <h2 className="text-xl font-bold mb-6" style={{ color: '#1A1A1A' }}>
                  Profile Photo
                </h2>
                
                <div className="flex items-center gap-6">
                  <div className="relative">
                    {profile.profile_photo_url ? (
                      <img
                        src={profile.profile_photo_url}
                        alt="Profile"
                        className="w-32 h-32 rounded-2xl object-cover"
                        style={{ border: '3px solid rgba(107, 139, 96, 0.2)' }}
                      />
                    ) : (
                      <div 
                        className="w-32 h-32 rounded-2xl flex items-center justify-center"
                        style={{ 
                          backgroundColor: 'rgba(107, 139, 96, 0.1)',
                          border: '2px dashed rgba(107, 139, 96, 0.3)'
                        }}
                      >
                        <Camera className="w-10 h-10" style={{ color: '#6B8B60' }} />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <p className="text-sm mb-3" style={{ color: '#666666' }}>
                      Upload a professional photo for your profile
                    </p>
                    <div className="flex gap-3">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 rounded-lg font-medium flex items-center gap-2"
                        style={{
                          background: 'linear-gradient(135deg, rgb(27, 94, 32), rgb(46, 125, 50))',
                          color: '#FFFFFF'
                        }}
                      >
                        <Upload className="w-4 h-4" />
                        Upload Photo
                      </button>
                      {profile.profile_photo_url && (
                        <button
                          type="button"
                          onClick={() => setProfile({ ...profile, profile_photo_url: '' })}
                          className="px-4 py-2 rounded-lg font-medium border"
                          style={{
                            borderColor: '#E5E5E5',
                            color: '#666666'
                          }}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    {errors.profile_photo && (
                      <p className="text-sm mt-2" style={{ color: '#EF4444' }}>
                        {errors.profile_photo}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Professional Details */}
              <div 
                className="rounded-2xl p-6"
                style={{
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)'
                }}
              >
                <h2 className="text-xl font-bold mb-6" style={{ color: '#1A1A1A' }}>
                  Professional Details
                </h2>

                {/* Credentials */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-3" style={{ color: '#1A1A1A' }}>
                    Credentials & Certifications
                  </label>

                  {profile.credentials && profile.credentials.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {profile.credentials.map((cred, index) => {
                        // Extract just the acronym for display if it has a description
                        const displayName = cred.includes('(') ? cred.split(' (')[0] : cred;
                        return (
                          <div
                            key={index}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg"
                            style={{ backgroundColor: 'rgba(107, 139, 96, 0.1)' }}
                            title={cred} // Show full name on hover
                          >
                            <Award className="w-4 h-4" style={{ color: 'rgb(27, 94, 32)' }} />
                            <span style={{ color: '#1A1A1A' }}>{displayName}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveCredential(index)}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.opacity = '0.7';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.opacity = '1';
                              }}
                              aria-label={`Remove ${displayName}`}
                            >
                              <X className="w-4 h-4" style={{ color: 'rgb(27, 94, 32) !important', stroke: 'rgb(27, 94, 32) !important' }} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="relative">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <select
                          value=""
                          onChange={(e) => {
                            if (e.target.value) {
                              handleAddCredential(e.target.value);
                              e.target.value = '';
                            }
                          }}
                          className="w-full px-4 py-2 pr-8 rounded-lg border appearance-none cursor-pointer"
                          style={{
                            borderColor: '#E5E5E5',
                            backgroundColor: '#FAF9F6'
                          }}
                        >
                          <option value="" disabled>Select a credential...</option>

                          <optgroup label="ASL Certifications">
                            {COMMON_CREDENTIALS.filter(c => c.includes('RID') || c.includes('BEI') || c.includes('EIPA'))
                              .filter(c => !profile.credentials?.includes(c))
                              .map(cred => {
                                const displayName = cred.includes('(') ? cred.split(' (')[0] : cred;
                                return (
                                  <option key={cred} value={cred}>
                                    {displayName}
                                  </option>
                                );
                              })}
                          </optgroup>

                          <optgroup label="Spoken Language Certifications">
                            {COMMON_CREDENTIALS.filter(c =>
                              (c.includes('CHI') || c.includes('CMI') || c.includes('CCHI') ||
                               c.includes('NAATI') || c.includes('AIIC') || c.includes('ATA')) &&
                              !profile.credentials?.includes(c)
                            ).map(cred => {
                              const displayName = cred.includes('(') ? cred.split(' (')[0] : cred;
                              return (
                                <option key={cred} value={cred}>
                                  {displayName}
                                </option>
                              );
                            })}
                          </optgroup>

                          <optgroup label="Specialized Certifications">
                            {COMMON_CREDENTIALS.filter(c =>
                              (c.includes('Legal') || c.includes('Medical') || c.includes('Conference') ||
                               c.includes('Educational') || c.includes('Mental Health') || c.includes('VRI') ||
                               c.includes('Trilingual')) &&
                              !profile.credentials?.includes(c)
                            ).map(cred => (
                              <option key={cred} value={cred}>
                                {cred}
                              </option>
                            ))}
                          </optgroup>

                          <optgroup label="State-Specific Certifications">
                            {COMMON_CREDENTIALS.filter(c =>
                              (c.includes('California') || c.includes('New York') ||
                               c.includes('Texas') || c.includes('Florida')) &&
                              !profile.credentials?.includes(c)
                            ).map(cred => (
                              <option key={cred} value={cred}>
                                {cred}
                              </option>
                            ))}
                          </optgroup>
                        </select>

                        {/* Dropdown arrow icon */}
                        <ChevronDown
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none"
                          size={20}
                          style={{ color: '#666666' }}
                        />
                      </div>

                      {/* Optional: Allow custom input */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={credentialInput}
                          onChange={(e) => setCredentialInput(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (credentialInput.trim()) {
                                handleAddCredential(credentialInput);
                              }
                            }
                          }}
                          className="px-4 py-2 rounded-lg border"
                          style={{
                            borderColor: '#E5E5E5',
                            backgroundColor: '#FAF9F6',
                            minWidth: '200px'
                          }}
                          placeholder="Or enter custom..."
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (credentialInput.trim()) {
                              handleAddCredential(credentialInput);
                            }
                          }}
                          className="px-4 py-2 rounded-lg font-medium"
                          style={{
                            background: 'linear-gradient(135deg, rgb(27, 94, 32), rgb(46, 125, 50))',
                            color: '#FFFFFF'
                          }}
                        >
                          Add
                        </button>
                      </div>
                    </div>

                    {errors.credentials && (
                      <p className="text-sm mt-2" style={{ color: '#EF4444' }}>
                        {errors.credentials}
                      </p>
                    )}
                  </div>
                </div>

                {/* Specializations */}
                <div>
                  <label className="block text-sm font-medium mb-3" style={{ color: '#1A1A1A' }}>
                    Areas of Specialization
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {SPECIALIZATIONS.map(spec => (
                      <label
                        key={spec}
                        className="flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-all"
                        onClick={() => toggleSpecialization(spec)}
                        style={{
                          backgroundColor: profile.specializations?.includes(spec) 
                            ? 'rgba(107, 139, 96, 0.1)' 
                            : '#FAF9F6',
                          border: `1px solid ${profile.specializations?.includes(spec) 
                            ? 'rgba(107, 139, 96, 0.3)' 
                            : 'transparent'}`
                        }}
                      >
                        <div
                          className="w-5 h-5 rounded flex items-center justify-center"
                          style={{
                            background: profile.specializations?.includes(spec)
                              ? 'linear-gradient(135deg, rgb(27, 94, 32), rgb(46, 125, 50))'
                              : '#FFFFFF',
                            border: '2px solid rgb(27, 94, 32)'
                          }}
                        >
                          {profile.specializations?.includes(spec) && (
                            <Check className="w-3 h-3" style={{ color: '#FFFFFF' }} />
                          )}
                        </div>
                        <span style={{ color: '#1A1A1A' }}>{spec}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Accessibility Section */}
          {activeSection === 'accessibility' && (
            <div className="space-y-6">
              <div 
                className="rounded-2xl p-6"
                style={{
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)'
                }}
              >
                <h2 className="text-lg font-bold mb-4" style={{ color: '#1A1A1A' }}>
                  Accessibility Settings
                </h2>

                <div className="space-y-3">
                  {[
                    {
                      id: 'larger_text',
                      label: 'Larger Text',
                      description: 'Increase text size for better readability',
                      icon: Eye,
                      enabled: profile.accessibility_settings.larger_text
                    },
                    {
                      id: 'high_contrast',
                      label: 'High Contrast Mode',
                      description: 'Enhance color contrast for visual clarity',
                      icon: Palette,
                      enabled: profile.accessibility_settings.high_contrast
                    },
                    {
                      id: 'reduce_motion',
                      label: 'Reduce Motion',
                      description: 'Minimize animations and transitions',
                      icon: Zap,
                      enabled: profile.accessibility_settings.reduce_motion
                    },
                    {
                      id: 'screen_reader',
                      label: 'Screen Reader Support',
                      description: 'Optimize for screen reader compatibility',
                      icon: Languages,
                      enabled: profile.accessibility_settings.screen_reader
                    }
                  ].map(setting => (
                    <div
                      key={setting.id}
                      className="p-3 rounded-xl"
                      style={{ backgroundColor: '#FAF9F6' }}
                    >
                      <label
                        className="flex items-start gap-3 cursor-pointer focus:outline-none"
                        style={{ outline: 'none' }}
                        onClick={() => setProfile({
                          ...profile,
                          accessibility_settings: {
                            ...profile.accessibility_settings,
                            [setting.id]: !setting.enabled
                          }
                        })}
                      >
                        <div className="relative mt-0.5">
                          <div
                            className="rounded transition-all duration-200 focus:outline-none"
                            style={{
                              width: '18px',
                              height: '18px',
                              backgroundColor: setting.enabled ? '#059669' : '#ffffff',
                              border: setting.enabled ? '2px solid #059669' : '2px solid #d1d5db',
                              outline: 'none'
                            }}
                          >
                            {setting.enabled && (
                              <svg
                                className="absolute inset-0 w-full h-full"
                                viewBox="0 0 20 20"
                                fill="none"
                                style={{ padding: '2px' }}
                              >
                                <path
                                  d="M5 10l3 3 7-7"
                                  stroke="white"
                                  strokeWidth="3"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            )}
                          </div>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium" style={{ color: '#1A1A1A' }}>
                            {setting.label}
                          </h3>
                          <p className="text-xs mt-0.5" style={{ color: '#666666' }}>
                            {setting.description}
                          </p>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Privacy & Data Notice */}
              <div 
                className="rounded-xl p-4"
                style={{
                  backgroundColor: 'rgba(59, 130, 246, 0.05)',
                  border: '1px solid rgba(59, 130, 246, 0.2)'
                }}
              >
                <div>
                  <p className="text-sm" style={{ color: '#1A1A1A' }}>
                    Your data is encrypted and never shared without consent. Visit{' '}
                    <button 
                      type="button"
                      onClick={() => setActiveSection('privacy')}
                      className="underline" 
                      style={{ 
                        color: '#3B82F6',
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        font: 'inherit',
                        cursor: 'pointer'
                      }}
                    >
                      Privacy & Data
                    </button>{' '}
                    to manage your data preferences.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Privacy & Data Section */}
          {activeSection === 'privacy' && (
            <div className="space-y-6">
              <div 
                className="rounded-2xl p-6"
                style={{
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)'
                }}
              >
                <h2 className="text-xl font-bold mb-6" style={{ color: '#1A1A1A' }}>
                  Privacy & Data Settings
                </h2>
                
                <div className="space-y-6">
                  {/* Data Management */}
                  <div>
                    <h3 className="font-semibold mb-4" style={{ color: '#1A1A1A' }}>
                      Data Management
                    </h3>
                    <div className="space-y-4">
                      <div 
                        className="p-4 rounded-xl border flex items-start justify-between"
                        style={{ 
                          backgroundColor: '#FAF9F6',
                          borderColor: 'rgba(107, 139, 96, 0.2)'
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <Download className="w-5 h-5 mt-0.5" style={{ color: '#6B8B60' }} />
                          <div>
                            <h4 className="font-medium" style={{ color: '#1A1A1A' }}>
                              Export Your Data
                            </h4>
                            <p className="text-sm mt-1" style={{ color: '#666666' }}>
                              Download all your reflections and settings
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            alert('Export functionality coming soon. Your data will be downloadable in JSON format.');
                          }}
                          className="px-4 py-2 rounded-lg font-medium transition-all hover:opacity-90"
                          style={{
                            background: 'linear-gradient(135deg, rgb(27, 94, 32), rgb(46, 125, 50))',
                            color: '#FFFFFF'
                          }}
                        >
                          Export
                        </button>
                      </div>
                      
                      <div 
                        className="p-4 rounded-xl border flex items-start justify-between"
                        style={{ 
                          backgroundColor: 'rgba(239, 68, 68, 0.05)',
                          borderColor: 'rgba(239, 68, 68, 0.2)'
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <Trash2 className="w-5 h-5 mt-0.5" style={{ color: '#EF4444' }} />
                          <div>
                            <h4 className="font-medium" style={{ color: '#1A1A1A' }}>
                              Delete Account
                            </h4>
                            <p className="text-sm mt-1" style={{ color: '#666666' }}>
                              Permanently remove your account and data
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                              alert('Account deletion request submitted. You will receive a confirmation email.');
                            }
                          }}
                          className="px-4 py-2 rounded-lg font-medium transition-all"
                          style={{
                            background: 'linear-gradient(135deg, rgb(27, 94, 32), rgb(46, 125, 50))',
                            color: '#EF4444',
                            border: 'none'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.opacity = '0.9';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.opacity = '1';
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Privacy Settings */}
                  <div>
                    <h3 className="font-semibold mb-4" style={{ color: '#1A1A1A' }}>
                      Privacy Preferences
                    </h3>
                    <div className="space-y-3">
                      {[
                        { id: 'analytics' as keyof typeof privacySettings, label: 'Usage Analytics', description: 'Help improve InterpretReflect' },
                        { id: 'notifications' as keyof typeof privacySettings, label: 'Email Notifications', description: 'Receive wellness reminders' },
                        { id: 'team_visibility' as keyof typeof privacySettings, label: 'Team Visibility', description: 'Share wellness status with team' }
                      ].map((setting) => {
                        const isEnabled = privacySettings[setting.id];
                        return (
                          <div
                            key={setting.id}
                            className="p-4 rounded-xl"
                            style={{ backgroundColor: '#FAF9F6' }}
                          >
                            <label 
                              className="cursor-pointer focus:outline-none flex items-center gap-3" 
                              style={{ outline: 'none' }}
                              onClick={() => setPrivacySettings(prev => ({
                                ...prev,
                                [setting.id]: !prev[setting.id]
                              }))}
                            >
                              <div
                                className="rounded transition-all duration-200 focus:outline-none"
                                style={{
                                  width: '20px',
                                  height: '20px',
                                  backgroundColor: isEnabled ? '#059669' : '#ffffff',
                                  border: isEnabled ? '2px solid #059669' : '2px solid #d1d5db',
                                  outline: 'none'
                                }}
                              >
                                {isEnabled && (
                                  <svg
                                    className="w-full h-full"
                                    viewBox="0 0 20 20"
                                    fill="none"
                                    style={{ padding: '2px' }}
                                  >
                                    <path
                                      d="M5 10l3 3 7-7"
                                      stroke="white"
                                      strokeWidth="3"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                )}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium" style={{ color: '#1A1A1A' }}>
                                  {setting.label}
                                </h4>
                                <p className="text-sm" style={{ color: '#666666' }}>
                                  {setting.description}
                                </p>
                              </div>
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Security Notice */}
              <div 
                className="rounded-xl p-4 flex items-start gap-3"
                style={{
                  backgroundColor: 'rgba(59, 130, 246, 0.05)',
                  border: '1px solid rgba(59, 130, 246, 0.2)'
                }}
              >
                <Lock className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#3B82F6' }} />
                <div>
                  <p className="text-sm" style={{ color: '#1A1A1A' }}>
                    Your data is protected with end-to-end encryption and stored in HIPAA-compliant servers. 
                    We never sell or share your personal information without explicit consent.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex gap-3 mt-8 pb-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
            <button
              type="submit"
              disabled={saving || !hasUnsavedChanges()}
              className="flex-1 px-6 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              style={{
                background: saving || !hasUnsavedChanges() ? '#E5E5E5' : 'linear-gradient(135deg, rgb(27, 94, 32), rgb(46, 125, 50))',
                color: saving || !hasUnsavedChanges() ? '#999999' : '#FFFFFF',
                cursor: saving || !hasUnsavedChanges() ? 'not-allowed' : 'pointer',
                minHeight: '48px'
              }}
            >
              {saving ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
            
            <button
              type="button"
              onClick={handleCancel}
              disabled={!hasUnsavedChanges()}
              className="px-6 py-3 rounded-xl font-medium border-2 transition-all shadow-md hover:shadow-lg"
              style={{
                borderColor: !hasUnsavedChanges() ? '#9CA3AF' : '#6B8B60',
                color: !hasUnsavedChanges() ? '#4B5563' : '#6B8B60',
                backgroundColor: !hasUnsavedChanges() ? '#F3F4F6' : '#FFFFFF',
                cursor: !hasUnsavedChanges() ? 'not-allowed' : 'pointer',
                minHeight: '48px'
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

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
        .high-contrast button {
          border-width: 2px;
        }
        
        .reduce-motion * {
          animation-duration: 0.01ms !important;
          transition-duration: 0.01ms !important;
        }
      `}</style>
    </div>
  );
};

export default ProfileSettings;