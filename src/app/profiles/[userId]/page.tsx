'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/contexts/OrganizationContext';
import { getUserProfile, UserProfile } from '@/lib/firebase/profiles';
import { ProfilePage } from '@/components/profile/ProfilePage';
import { BackNavigation } from '@/components/common/BackNavigation';
import Head from 'next/head';

interface ProfilePageParams {
  userId: string;
}

export default function UserProfilePage() {
  const params = useParams() as unknown as ProfilePageParams;
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const { currentOrganization } = useOrganization();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const { userId } = params;
  const isOwnProfile = currentUser?.uid === userId;

  useEffect(() => {
    const loadProfile = async () => {
      if (!userId) {
        setError('No user ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        setNotFound(false);

        const userProfile = await getUserProfile(userId);
        
        if (!userProfile) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        setProfile(userProfile);
      } catch (err) {
        console.error('Error loading profile:', err);
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [userId]);

  // Generate page metadata
  const generatePageTitle = () => {
    if (!profile) return 'Profile - AboutMe Cards';
    return `${profile.core.name} - AboutMe Cards`;
  };

  const generatePageDescription = () => {
    if (!profile) return 'View detailed profile information';
    
    const skills = profile.core.mainSkills?.slice(0, 3).join(', ') || '';
    const title = profile.core.mainTitle || '';
    
    return `${profile.core.name}${title ? ` - ${title}` : ''}${skills ? ` | Skills: ${skills}` : ''}`;
  };

  const handleBackClick = () => {
    // Try to go back to previous page, fallback to browse
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/browse');
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    
    if (navigator.share && profile) {
      try {
        await navigator.share({
          title: `${profile.core.name}'s Profile`,
          text: generatePageDescription(),
          url: url,
        });
      } catch (err) {
        // Fallback to clipboard if share fails
        copyToClipboard(url);
      }
    } else {
      copyToClipboard(url);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Could add a toast notification here
      console.log('URL copied to clipboard');
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Head>
            <title>Loading Profile - AboutMe Cards</title>
          </Head>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <BackNavigation onBack={handleBackClick} />
            
            {/* Loading skeleton */}
            <div className="mt-8 animate-pulse">
              {/* Hero skeleton */}
              <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
                <div className="flex items-start space-x-6">
                  <div className="w-32 h-32 bg-gray-200 rounded-full" />
                  <div className="flex-1 space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/3" />
                    <div className="h-6 bg-gray-200 rounded w-1/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              </div>
              
              {/* Content skeleton */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white rounded-lg shadow-sm p-6">
                      <div className="h-6 bg-gray-200 rounded w-1/4 mb-4" />
                      <div className="space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-full" />
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-4 bg-gray-200 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-6">
                  {[1, 2].map(i => (
                    <div key={i} className="bg-white rounded-lg shadow-sm p-6">
                      <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
                      <div className="space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-full" />
                        <div className="h-4 bg-gray-200 rounded w-2/3" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (notFound) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Head>
            <title>Profile Not Found - AboutMe Cards</title>
          </Head>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <BackNavigation onBack={handleBackClick} />
            
            <div className="mt-16 text-center">
              <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <svg
                  className="w-12 h-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Profile Not Found
              </h1>
              <p className="text-gray-600 mb-6">
                The profile you're looking for doesn't exist or you don't have permission to view it.
              </p>
              <button
                onClick={handleBackClick}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Head>
            <title>Error Loading Profile - AboutMe Cards</title>
          </Head>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <BackNavigation onBack={handleBackClick} />
            
            <div className="mt-16 text-center">
              <div className="w-24 h-24 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-6">
                <svg
                  className="w-12 h-12 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Error Loading Profile
              </h1>
              <p className="text-gray-600 mb-6">
                {error}
              </p>
              <div className="space-x-4">
                <button
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Try Again
                </button>
                <button
                  onClick={handleBackClick}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Head>
        <title>{generatePageTitle()}</title>
        <meta name="description" content={generatePageDescription()} />
        
        {/* Open Graph tags for social sharing */}
        <meta property="og:title" content={generatePageTitle()} />
        <meta property="og:description" content={generatePageDescription()} />
        <meta property="og:type" content="profile" />
        <meta property="og:url" content={typeof window !== 'undefined' ? window.location.href : ''} />
        {profile?.core.photoUrl && (
          <meta property="og:image" content={profile.core.photoUrl} />
        )}
        
        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={generatePageTitle()} />
        <meta name="twitter:description" content={generatePageDescription()} />
        {profile?.core.photoUrl && (
          <meta name="twitter:image" content={profile.core.photoUrl} />
        )}
      </Head>
      
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <BackNavigation 
            onBack={handleBackClick}
            onShare={handleShare}
            showShare={true}
          />
          
          {profile && (
            <ProfilePage
              profile={profile}
              userId={userId}
              isOwnProfile={isOwnProfile}
              currentUser={currentUser}
              currentOrganization={currentOrganization}
            />
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}