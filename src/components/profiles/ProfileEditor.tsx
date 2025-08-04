'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProfile, createUserProfile, type UserProfile } from '@/lib/firebase/profiles';
import { ProfileForm } from './ProfileForm';
import { ImageUpload } from './ImageUpload';

interface ProfileEditorProps {
  onComplete?: (profile: UserProfile) => void;
  showTitle?: boolean;
}

export const ProfileEditor: React.FC<ProfileEditorProps> = ({
  onComplete,
  showTitle = true
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState('');

  // Load existing profile
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;

      setLoading(true);
      try {
        const existingProfile = await getUserProfile(user.uid);
        setProfile(existingProfile);
      } catch (err) {
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  const handleProfileSave = async (coreData: UserProfile['core']) => {
    if (!user) return;

    try {
      const updatedProfile: UserProfile = {
        core: coreData,
        personal: profile?.personal || {},
        profiles: profile?.profiles || {}
      };

      await createUserProfile(user.uid, updatedProfile);
      setProfile(updatedProfile);

      if (onComplete) {
        onComplete(updatedProfile);
      }
    } catch (err) {
      setError('Failed to save profile');
    }
  };

  const handlePhotoUpdate = (photoUrl: string) => {
    if (profile) {
      const updatedProfile = {
        ...profile,
        core: {
          ...profile.core,
          photoUrl
        }
      };
      setProfile(updatedProfile);
    }
  };

  const handlePhotoRemove = () => {
    if (profile) {
      const updatedProfile = {
        ...profile,
        core: {
          ...profile.core,
          photoUrl: ''
        }
      };
      setProfile(updatedProfile);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      {showTitle && (
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {profile ? 'Edit Your Profile' : 'Create Your Profile'}
          </h1>
          <p className="text-gray-600">
            Tell others about yourself and your professional background
          </p>
        </div>
      )}

      {error && (
        <div className="mb-6 text-red-600 text-center bg-red-50 p-4 rounded-md">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border p-6 space-y-8">
        {/* Photo Upload Section */}
        <ImageUpload
          currentPhotoUrl={profile?.core?.photoUrl}
          onPhotoUpdate={handlePhotoUpdate}
          onPhotoRemove={handlePhotoRemove}
        />

        {/* Profile Form Section */}
        <div className="border-t pt-6">
          <ProfileForm
            initialData={profile?.core}
            onSave={handleProfileSave}
          />
        </div>
      </div>
    </div>
  );
};