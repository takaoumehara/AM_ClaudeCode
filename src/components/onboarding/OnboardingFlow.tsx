'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/contexts/OrganizationContext';
import { 
  getUserInvitations, 
  acceptInvitation, 
  declineInvitation, 
  searchOrganizations,
  Organization,
  OrganizationInvitation 
} from '@/lib/firebase/organizations';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ProfileVisibilitySetup, ProfileVisibilitySettings } from './ProfileVisibilitySetup';

type OnboardingStep = 'invitations' | 'discovery' | 'profile-setup' | 'completion';

interface OnboardingFlowProps {
  onComplete?: () => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const router = useRouter();
  const { user } = useAuth();
  const { 
    organizations, 
    currentOrganization, 
    setCurrentOrganization, 
    createNewOrganization, 
    joinExistingOrganization,
    refreshOrganizations 
  } = useOrganization();

  const [currentStep, setCurrentStep] = useState<OnboardingStep>('invitations');
  const [invitations, setInvitations] = useState<OrganizationInvitation[]>([]);
  const [selectedOrganizations, setSelectedOrganizations] = useState<Organization[]>([]);
  const [primaryOrganization, setPrimaryOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Organization[]>([]);
  const [searching, setSearching] = useState(false);

  // Create organization state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');

  // Load user invitations on mount
  useEffect(() => {
    const loadInvitations = async () => {
      if (!user?.email) return;

      try {
        const userInvitations = await getUserInvitations(user.email);
        setInvitations(userInvitations);
        
        // If user has existing organizations or no invitations, skip to discovery
        if (organizations.length > 0 || userInvitations.length === 0) {
          setCurrentStep('discovery');
        }
      } catch (err) {
        console.error('Error loading invitations:', err);
        setError('Failed to load invitations');
        setCurrentStep('discovery');
      } finally {
        setLoading(false);
      }
    };

    loadInvitations();
  }, [user?.email, organizations.length]);

  const handleAcceptInvitation = async (invitation: OrganizationInvitation) => {
    if (!user) return;

    setProcessing(true);
    setError('');

    try {
      await acceptInvitation(invitation.id, user.uid);
      await refreshOrganizations();
      setInvitations(prev => prev.filter(inv => inv.id !== invitation.id));
      
      // If this was the last invitation, move to next step
      if (invitations.length === 1) {
        setCurrentStep('discovery');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept invitation');
    } finally {
      setProcessing(false);
    }
  };

  const handleDeclineInvitation = async (invitationId: string, feedback?: string) => {
    setProcessing(true);
    setError('');

    try {
      await declineInvitation(invitationId, feedback);
      setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
      
      // If this was the last invitation, move to next step
      if (invitations.length === 1) {
        setCurrentStep('discovery');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to decline invitation');
    } finally {
      setProcessing(false);
    }
  };

  const handleSearchOrganizations = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    setError('');

    try {
      const results = await searchOrganizations(searchTerm.trim());
      // Filter out organizations user is already a member of
      const filteredResults = results.filter(
        org => !organizations.some(userOrg => userOrg.id === org.id)
      );
      setSearchResults(filteredResults);
    } catch (err) {
      setError('Failed to search organizations');
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleJoinOrganization = async (orgId: string) => {
    setProcessing(true);
    setError('');

    try {
      await joinExistingOrganization(orgId);
      await refreshOrganizations();
      setSearchResults([]);
      setSearchTerm('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join organization');
    } finally {
      setProcessing(false);
    }
  };

  const handleCreateOrganization = async () => {
    if (!newOrgName.trim()) {
      setError('Please enter an organization name');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      await createNewOrganization(newOrgName.trim());
      await refreshOrganizations();
      setShowCreateForm(false);
      setNewOrgName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create organization');
    } finally {
      setProcessing(false);
    }
  };

  const handleSelectPrimaryOrganization = (org: Organization) => {
    setPrimaryOrganization(org);
    setCurrentOrganization(org);
    setCurrentStep('profile-setup');
  };

  const handleSaveProfileSettings = async (settings: ProfileVisibilitySettings) => {
    setProcessing(true);
    setError('');

    try {
      // TODO: Save visibility settings to user profile
      // This would typically call an API to save the settings
      console.log('Saving profile settings:', settings);
      
      // For now, just proceed to completion
      setCurrentStep('completion');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile settings');
    } finally {
      setProcessing(false);
    }
  };

  const handleSkipProfileSetup = () => {
    setCurrentStep('completion');
  };

  const handleCompleteOnboarding = () => {
    onComplete?.();
    router.push('/browse');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner />
          <p className="text-gray-600 mt-4">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {(['invitations', 'discovery', 'profile-setup', 'completion'] as OnboardingStep[]).map((step, index) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep === step 
                    ? 'bg-blue-600 text-white' 
                    : index < (['invitations', 'discovery', 'profile-setup', 'completion'] as OnboardingStep[]).indexOf(currentStep)
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {index + 1}
                </div>
                {index < 3 && (
                  <div className={`w-12 h-0.5 ${
                    index < (['invitations', 'discovery', 'profile-setup', 'completion'] as OnboardingStep[]).indexOf(currentStep)
                      ? 'bg-green-500'
                      : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Step Content */}
        {currentStep === 'invitations' && (
          <InvitationsStep
            invitations={invitations}
            onAccept={handleAcceptInvitation}
            onDecline={handleDeclineInvitation}
            onSkip={() => setCurrentStep('discovery')}
            processing={processing}
          />
        )}

        {currentStep === 'discovery' && (
          <DiscoveryStep
            organizations={organizations}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            searchResults={searchResults}
            searching={searching}
            onSearch={handleSearchOrganizations}
            onJoin={handleJoinOrganization}
            showCreateForm={showCreateForm}
            setShowCreateForm={setShowCreateForm}
            newOrgName={newOrgName}
            setNewOrgName={setNewOrgName}
            onCreateOrganization={handleCreateOrganization}
            onSelectPrimary={handleSelectPrimaryOrganization}
            processing={processing}
          />
        )}

        {currentStep === 'profile-setup' && (
          <ProfileVisibilitySetup
            organization={primaryOrganization!}
            onSave={handleSaveProfileSettings}
            onSkip={handleSkipProfileSetup}
            loading={processing}
          />
        )}

        {currentStep === 'completion' && (
          <CompletionStep
            organization={primaryOrganization!}
            hasMultipleOrganizations={organizations.length > 1}
            onComplete={handleCompleteOnboarding}
          />
        )}
      </div>
    </div>
  );
};

// Step Components
const InvitationsStep: React.FC<{
  invitations: OrganizationInvitation[];
  onAccept: (invitation: OrganizationInvitation) => void;
  onDecline: (invitationId: string, feedback?: string) => void;
  onSkip: () => void;
  processing: boolean;
}> = ({ invitations, onAccept, onDecline, onSkip, processing }) => {
  const [declineFeedback, setDeclineFeedback] = useState<{ [key: string]: string }>({});
  const [showDeclineForm, setShowDeclineForm] = useState<string | null>(null);

  return (
    <div className="bg-white shadow-lg rounded-lg p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">You&apos;ve Been Invited!</h1>
        <p className="text-gray-600">
          You have {invitations.length} pending organization invitation{invitations.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="space-y-6">
        {invitations.map((invitation) => (
          <div key={invitation.id} className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  {invitation.organizationLogo && (
                    <img 
                      src={invitation.organizationLogo} 
                      alt={invitation.organizationName}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  )}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {invitation.organizationName}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Invited by {invitation.inviterName}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => onAccept(invitation)}
                  disabled={processing}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  Accept
                </button>
                <button
                  onClick={() => setShowDeclineForm(invitation.id)}
                  disabled={processing}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  Decline
                </button>
              </div>
            </div>

            {showDeclineForm === invitation.id && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <textarea
                  placeholder="Optional: Let them know why you're declining"
                  value={declineFeedback[invitation.id] || ''}
                  onChange={(e) => setDeclineFeedback(prev => ({
                    ...prev,
                    [invitation.id]: e.target.value
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
                <div className="flex justify-end space-x-3 mt-3">
                  <button
                    onClick={() => setShowDeclineForm(null)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      onDecline(invitation.id, declineFeedback[invitation.id]);
                      setShowDeclineForm(null);
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Decline
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {invitations.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <button
            onClick={onSkip}
            className="text-gray-600 hover:text-gray-800 font-medium"
          >
            I&apos;ll decide later
          </button>
        </div>
      )}
    </div>
  );
};

const DiscoveryStep: React.FC<{
  organizations: Organization[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  searchResults: Organization[];
  searching: boolean;
  onSearch: () => void;
  onJoin: (orgId: string) => void;
  showCreateForm: boolean;
  setShowCreateForm: (show: boolean) => void;
  newOrgName: string;
  setNewOrgName: (name: string) => void;
  onCreateOrganization: () => void;
  onSelectPrimary: (org: Organization) => void;
  processing: boolean;
}> = ({ 
  organizations, 
  searchTerm, 
  setSearchTerm, 
  searchResults, 
  searching, 
  onSearch, 
  onJoin,
  showCreateForm,
  setShowCreateForm,
  newOrgName,
  setNewOrgName,
  onCreateOrganization,
  onSelectPrimary,
  processing 
}) => {
  return (
    <div className="bg-white shadow-lg rounded-lg p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Choose Your Organization</h1>
        <p className="text-gray-600">
          {organizations.length > 0 
            ? 'Select your primary organization or find additional ones to join'
            : 'Find an organization to join or create your own'
          }
        </p>
      </div>

      {/* User's Organizations */}
      {organizations.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Your Organizations
            {organizations.length > 1 && (
              <span className="text-sm text-gray-500 ml-2">
                (Choose your primary organization to start with)
              </span>
            )}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {organizations.map((org) => (
              <div key={org.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      {org.logo && (
                        <img 
                          src={org.logo} 
                          alt={org.name}
                          className="w-8 h-8 rounded object-cover"
                        />
                      )}
                      <h3 className="text-lg font-semibold text-gray-900">{org.name}</h3>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">{org.members.length} members</p>
                    {org.type && (
                      <span className={`inline-block px-2 py-1 text-xs rounded-full mb-2 ${
                        org.type === 'corporate' ? 'bg-blue-100 text-blue-800' :
                        org.type === 'community' ? 'bg-green-100 text-green-800' :
                        org.type === 'project' ? 'bg-purple-100 text-purple-800' :
                        org.type === 'startup' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {org.type.charAt(0).toUpperCase() + org.type.slice(1)}
                      </span>
                    )}
                    {org.description && (
                      <p className="text-sm text-gray-600 mb-4">{org.description}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => onSelectPrimary(org)}
                  disabled={processing}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {organizations.length === 1 ? 'Continue' : 'Select as Primary'}
                </button>
              </div>
            ))}
          </div>
          
          {organizations.length > 1 && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 text-sm">
                💡 <strong>Multiple Organizations:</strong> You'll be able to switch between all your organizations 
                once you complete setup. Choose the one you want to start with as your primary workspace.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Search Organizations */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Find Organizations</h2>
        <div className="flex gap-3 mb-4">
          <input
            type="text"
            placeholder="Search for organizations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onKeyPress={(e) => e.key === 'Enter' && onSearch()}
          />
          <button
            onClick={onSearch}
            disabled={searching || !searchTerm.trim()}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {searching ? 'Searching...' : 'Search'}
          </button>
        </div>

        {searchResults.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {searchResults.map((org) => (
              <div key={org.id} className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{org.name}</h3>
                <p className="text-sm text-gray-500 mb-3">{org.members.length} members</p>
                {org.description && (
                  <p className="text-sm text-gray-600 mb-4">{org.description}</p>
                )}
                <button
                  onClick={() => onJoin(org.id)}
                  disabled={processing}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {processing ? 'Joining...' : 'Join Organization'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Organization */}
      <div className="text-center">
        {!showCreateForm ? (
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            + Create New Organization
          </button>
        ) : (
          <div className="max-w-md mx-auto bg-gray-50 p-6 rounded-lg">
            <input
              type="text"
              placeholder="Organization name"
              value={newOrgName}
              onChange={(e) => setNewOrgName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={onCreateOrganization}
                disabled={processing || !newOrgName.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {processing ? 'Creating...' : 'Create'}
              </button>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setNewOrgName('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


const CompletionStep: React.FC<{
  organization: Organization;
  hasMultipleOrganizations: boolean;
  onComplete: () => void;
}> = ({ organization, hasMultipleOrganizations, onComplete }) => {
  return (
    <div className="bg-white shadow-lg rounded-lg p-8">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to AboutMe Cards! 🎉</h1>
        <p className="text-gray-600 text-lg">
          You&apos;re all set up with <strong>{organization.name}</strong>
        </p>
      </div>

      {/* Quick Start Guide */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 text-center">Quick Start Guide</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Explore Profiles</h3>
            <p className="text-sm text-gray-600">
              Browse and discover people in {organization.name}
            </p>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Complete Your Profile</h3>
            <p className="text-sm text-gray-600">
              Add more details to help others connect with you
            </p>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Start Connecting</h3>
            <p className="text-sm text-gray-600">
              Find collaboration opportunities and interesting people
            </p>
          </div>
        </div>
      </div>

      {/* Multi-Organization Tutorial */}
      {hasMultipleOrganizations && (
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-2">🏢 Multiple Organizations</h3>
                <p className="text-blue-800 text-sm mb-3">
                  You have access to multiple organizations! Here&apos;s how to make the most of it:
                </p>
                <ul className="text-blue-800 text-sm space-y-1">
                  <li>• <strong>Organization Switcher:</strong> Click the organization name in the top navigation to switch</li>
                  <li>• <strong>Different Contexts:</strong> Your profile visibility can be different in each organization</li>
                  <li>• <strong>Easy Switching:</strong> No need to log out - just one click to change contexts</li>
                  <li>• <strong>Privacy Control:</strong> Customize what each organization sees in your profile settings</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Visibility Reminder */}
      <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="font-medium text-amber-900">Profile Privacy Reminder</h3>
        </div>
        <p className="text-amber-800 text-sm">
          Your profile visibility settings are now active for {organization.name}. 
          You can always adjust these settings in your profile preferences later.
        </p>
      </div>

      {/* Action Button */}
      <div className="text-center">
        <button
          onClick={onComplete}
          className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-lg font-medium shadow-lg transition-all duration-200 transform hover:scale-105"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
          Start Exploring Profiles
        </button>
        
        <p className="text-gray-500 text-sm mt-3">
          Ready to discover amazing people in {organization.name}!
        </p>
      </div>
    </div>
  );
};