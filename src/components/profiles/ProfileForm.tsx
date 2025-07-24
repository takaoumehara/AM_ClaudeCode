'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProfile, updateUserCore, searchSkills, type UserProfile } from '@/lib/firebase/profiles';

interface ProfileFormProps {
  onSave?: (profile: UserProfile['core']) => void;
  initialData?: UserProfile['core'];
}

export const ProfileForm: React.FC<ProfileFormProps> = ({ onSave, initialData }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Form data state
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    mainTitle: initialData?.mainTitle || '',
    mainSkills: initialData?.mainSkills || []
  });

  // Skills management
  const [skillInput, setSkillInput] = useState('');
  const [skillSuggestions, setSkillSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Load user profile on mount
  useEffect(() => {
    const loadProfile = async () => {
      if (!user || initialData) return;

      setLoading(true);
      try {
        const profile = await getUserProfile(user.uid);
        if (profile?.core) {
          setFormData({
            name: profile.core.name || '',
            mainTitle: profile.core.mainTitle || '',
            mainSkills: profile.core.mainSkills || []
          });
        }
      } catch (err) {
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user, initialData]);

  // Handle skill input changes and search
  useEffect(() => {
    const searchSkillsAsync = async () => {
      if (skillInput.length < 2) {
        setSkillSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      try {
        const skills = await searchSkills(skillInput);
        const suggestions = skills
          .map(skill => skill.name)
          .filter(name => !formData.mainSkills.includes(name))
          .slice(0, 5);
        setSkillSuggestions(suggestions);
        setShowSuggestions(suggestions.length > 0);
      } catch (err) {
        console.error('Error searching skills:', err);
      }
    };

    const debounceTimer = setTimeout(searchSkillsAsync, 300);
    return () => clearTimeout(debounceTimer);
  }, [skillInput, formData.mainSkills]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
    setSuccessMessage('');
  };

  const handleSkillAdd = (skillName: string) => {
    if (skillName && !formData.mainSkills.includes(skillName)) {
      setFormData(prev => ({
        ...prev,
        mainSkills: [...prev.mainSkills, skillName]
      }));
      setSkillInput('');
      setShowSuggestions(false);
    }
  };

  const handleSkillRemove = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      mainSkills: prev.mainSkills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleSkillInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (skillSuggestions.length > 0) {
        handleSkillAdd(skillSuggestions[0]);
      } else if (skillInput.trim()) {
        handleSkillAdd(skillInput.trim());
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Basic validation
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const coreData = {
        name: formData.name.trim(),
        mainTitle: formData.mainTitle.trim(),
        mainSkills: formData.mainSkills,
        teamIds: initialData?.teamIds || [],
        photoUrl: initialData?.photoUrl || ''
      };

      await updateUserCore(user.uid, coreData);
      setSuccessMessage('Profile saved successfully!');
      
      if (onSave) {
        onSave(coreData);
      }
    } catch (err) {
      setError('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
      <div className="space-y-4">
        {/* Name Field */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your full name"
          />
        </div>

        {/* Main Title Field */}
        <div>
          <label htmlFor="mainTitle" className="block text-sm font-medium text-gray-700 mb-1">
            Main Title
          </label>
          <input
            type="text"
            id="mainTitle"
            name="mainTitle"
            value={formData.mainTitle}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Senior Developer, Product Manager"
          />
        </div>

        {/* Skills Field */}
        <div>
          <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-1">
            Main Skills
          </label>
          
          {/* Current Skills */}
          {formData.mainSkills.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.mainSkills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleSkillRemove(skill)}
                    className="ml-2 text-blue-600 hover:text-blue-800 focus:outline-none"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Skill Input */}
          <div className="relative">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={handleSkillInputKeyDown}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Add a skill..."
            />
            
            {/* Skill Suggestions */}
            {showSuggestions && skillSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                {skillSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => handleSkillAdd(suggestion)}
                    className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                  >
                    {suggestion}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => handleSkillAdd(skillInput.trim())}
                  className="w-full px-3 py-2 text-left text-blue-600 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 border-t border-gray-200"
                >
                  Add "{skillInput.trim()}" as new skill
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-md">
          {error}
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="text-green-600 text-sm text-center bg-green-50 p-3 rounded-md">
          {successMessage}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={saving}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {saving ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Saving...
          </>
        ) : (
          'Save Profile'
        )}
      </button>
    </form>
  );
};