'use client';

import { useState, useEffect } from 'react';
import { Organization } from '@/lib/firebase/organizations';
import { useAuth } from '@/contexts/AuthContext';

interface ProfileField {
  key: string;
  label: string;
  description: string;
  defaultVisible: boolean;
  required?: boolean;
}

interface ProfileVisibilitySetupProps {
  organization: Organization;
  onSave: (visibilitySettings: ProfileVisibilitySettings) => void;
  onSkip: () => void;
  loading?: boolean;
}

export interface ProfileVisibilitySettings {
  organizationId: string;
  fieldVisibility: { [fieldKey: string]: boolean };
  completenessLevel: 'minimal' | 'standard' | 'complete';
}

const PROFILE_FIELDS: ProfileField[] = [
  {
    key: 'name',
    label: 'Name',
    description: 'Your full name',
    defaultVisible: true,
    required: true,
  },
  {
    key: 'photo',
    label: 'Profile Photo',
    description: 'Your profile picture',
    defaultVisible: true,
  },
  {
    key: 'title',
    label: 'Job Title',
    description: 'Your current role or position',
    defaultVisible: true,
  },
  {
    key: 'skills',
    label: 'Skills',
    description: 'Your technical and professional skills',
    defaultVisible: true,
  },
  {
    key: 'experience',
    label: 'Experience',
    description: 'Your work history and teams',
    defaultVisible: true,
  },
  {
    key: 'interests',
    label: 'Interests',
    description: 'Your hobbies and interests',
    defaultVisible: false,
  },
  {
    key: 'projects',
    label: 'Projects',
    description: 'Projects you\'ve worked on',
    defaultVisible: true,
  },
  {
    key: 'contact',
    label: 'Contact Information',
    description: 'Email, phone, social media',
    defaultVisible: false,
  },
  {
    key: 'personal',
    label: 'Personal Details',
    description: 'Location, languages, etc.',
    defaultVisible: false,
  },
];

const ORGANIZATION_TYPE_TEMPLATES = {
  corporate: {
    name: 'Corporate',
    description: 'Professional setting with focus on work-related information',
    fields: {
      name: true,
      photo: true,
      title: true,
      skills: true,
      experience: true,
      interests: false,
      projects: true,
      contact: false,
      personal: false,
    },
  },
  community: {
    name: 'Community',
    description: 'Community setting with balance of professional and personal',
    fields: {
      name: true,
      photo: true,
      title: true,
      skills: true,
      experience: true,
      interests: true,
      projects: true,
      contact: false,
      personal: true,
    },
  },
  project: {
    name: 'Project Team',
    description: 'Project-focused with emphasis on skills and experience',
    fields: {
      name: true,
      photo: true,
      title: true,
      skills: true,
      experience: true,
      interests: false,
      projects: true,
      contact: true,
      personal: false,
    },
  },
  startup: {
    name: 'Startup',
    description: 'Startup environment with more personal connection',
    fields: {
      name: true,
      photo: true,
      title: true,
      skills: true,
      experience: true,
      interests: true,
      projects: true,
      contact: true,
      personal: true,
    },
  },
  other: {
    name: 'Custom',
    description: 'Customize your own visibility settings',
    fields: {
      name: true,
      photo: true,
      title: true,
      skills: true,
      experience: true,
      interests: false,
      projects: true,
      contact: false,
      personal: false,
    },
  },
};

export const ProfileVisibilitySetup: React.FC<ProfileVisibilitySetupProps> = ({
  organization,
  onSave,
  onSkip,
  loading = false,
}) => {
  const { user } = useAuth();
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [fieldVisibility, setFieldVisibility] = useState<{ [key: string]: boolean }>({});
  const [showCustomFields, setShowCustomFields] = useState(false);

  // Initialize with organization type template or default
  useEffect(() => {
    const orgType = organization.type || 'other';
    const template = ORGANIZATION_TYPE_TEMPLATES[orgType] || ORGANIZATION_TYPE_TEMPLATES.other;
    
    setSelectedTemplate(orgType);
    setFieldVisibility(template.fields);
  }, [organization]);

  const handleTemplateSelect = (templateKey: string) => {
    const template = ORGANIZATION_TYPE_TEMPLATES[templateKey as keyof typeof ORGANIZATION_TYPE_TEMPLATES];
    if (template) {
      setSelectedTemplate(templateKey);
      setFieldVisibility(template.fields);
      setShowCustomFields(templateKey === 'other');
    }
  };

  const handleFieldToggle = (fieldKey: string) => {
    const field = PROFILE_FIELDS.find(f => f.key === fieldKey);
    if (field?.required) return; // Can't toggle required fields
    
    setFieldVisibility(prev => ({
      ...prev,
      [fieldKey]: !prev[fieldKey],
    }));
  };

  const getCompletenessLevel = (): 'minimal' | 'standard' | 'complete' => {
    const visibleFields = Object.values(fieldVisibility).filter(Boolean).length;
    const totalFields = PROFILE_FIELDS.length;
    const percentage = visibleFields / totalFields;

    if (percentage >= 0.8) return 'complete';
    if (percentage >= 0.5) return 'standard';
    return 'minimal';
  };

  const handleSave = () => {
    const settings: ProfileVisibilitySettings = {
      organizationId: organization.id,
      fieldVisibility,
      completenessLevel: getCompletenessLevel(),
    };
    onSave(settings);
  };

  const visibleFieldsCount = Object.values(fieldVisibility).filter(Boolean).length;
  const completenessLevel = getCompletenessLevel();

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Set Up Your Profile</h1>
        <p className="text-gray-600">
          Choose what information to share with members of <strong>{organization.name}</strong>
        </p>
      </div>

      {/* Template Selection */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Choose a Visibility Template</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(ORGANIZATION_TYPE_TEMPLATES).map(([key, template]) => (
            <div
              key={key}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                selectedTemplate === key
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleTemplateSelect(key)}
            >
              <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
              <p className="text-sm text-gray-600 mb-3">{template.description}</p>
              <div className="text-xs text-gray-500">
                {Object.values(template.fields).filter(Boolean).length} of {Object.keys(template.fields).length} fields visible
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Field Selection */}
      {(showCustomFields || selectedTemplate === 'other') && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Custom Field Settings</h2>
            <button
              onClick={() => setShowCustomFields(!showCustomFields)}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              {showCustomFields ? 'Hide Details' : 'Show Details'}
            </button>
          </div>
          
          {showCustomFields && (
            <div className="space-y-3">
              {PROFILE_FIELDS.map((field) => (
                <div key={field.key} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-gray-900">{field.label}</h3>
                      {field.required && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Required</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{field.description}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={fieldVisibility[field.key] || false}
                      onChange={() => handleFieldToggle(field.key)}
                      disabled={field.required || loading}
                      className="sr-only peer"
                    />
                    <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 ${
                      field.required ? 'opacity-50 cursor-not-allowed' : ''
                    }`}></div>
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Profile Completeness Indicator */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-gray-900">Profile Completeness</h3>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            completenessLevel === 'complete' ? 'bg-green-100 text-green-800' :
            completenessLevel === 'standard' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {completenessLevel.charAt(0).toUpperCase() + completenessLevel.slice(1)}
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              completenessLevel === 'complete' ? 'bg-green-500' :
              completenessLevel === 'standard' ? 'bg-yellow-500' :
              'bg-red-500'
            }`}
            style={{ width: `${(visibleFieldsCount / PROFILE_FIELDS.length) * 100}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-600">
          {visibleFieldsCount} of {PROFILE_FIELDS.length} profile fields will be visible to {organization.name} members
        </p>
      </div>

      {/* Guidance */}
      <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">💡 Profile Tips</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• You can always change these settings later in your profile preferences</li>
          <li>• Different organizations can have different visibility settings</li>
          <li>• Required fields (like name) are always visible for identification</li>
          <li>• Consider your organization's culture when setting visibility levels</li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {loading ? 'Saving Settings...' : 'Save Profile Settings'}
        </button>
        
        <button
          onClick={onSkip}
          disabled={loading}
          className="px-8 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 font-medium"
        >
          Use Default Settings
        </button>
      </div>
    </div>
  );
};