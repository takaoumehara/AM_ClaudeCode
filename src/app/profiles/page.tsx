'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/contexts/OrganizationContext';
import { getUserProfile, type UserProfile } from '@/lib/firebase/profiles';

export default function ProfilesPage() {
  const { user } = useAuth();
  const { currentOrganization } = useOrganization();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user profile
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;

      try {
        const userProfile = await getUserProfile(user.uid);
        setProfile(userProfile);
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);


  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Welcome Section */}
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    {profile?.core?.name ? `Welcome, ${profile.core.name}!` : 'Welcome to Your Profile Dashboard'}
                  </h2>
                  <p className="text-lg text-gray-600 mb-6">
                    {profile ? 'Manage your profile and connect with others' : 'Get started by creating your profile'}
                  </p>
                  
                  {/* Quick Actions */}
                  <div className="flex justify-center gap-4">
                    <Link
                      href="/browse"
                      className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Browse Profiles
                    </Link>
                    {!profile && (
                      <Link
                        href="/profile/edit"
                        className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Create Profile
                      </Link>
                    )}
                  </div>
                </div>

                {/* Profile Overview */}
                {profile ? (
                  <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-6 py-8">
                      <div className="flex items-center space-x-6">
                        {/* Profile Photo */}
                        <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                          {profile.core?.photoUrl ? (
                            <img
                              src={profile.core.photoUrl}
                              alt={profile.core?.name || 'Profile'}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="text-gray-400 text-2xl">
                              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                          )}
                        </div>

                        {/* Profile Info */}
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-gray-900">{profile.core?.name || 'Unnamed Profile'}</h3>
                          {profile.core?.mainTitle && (
                            <p className="text-lg text-gray-600 mt-1">{profile.core.mainTitle}</p>
                          )}
                          
                          {/* Skills */}
                          {profile.core?.mainSkills && profile.core.mainSkills.length > 0 && (
                            <div className="mt-4">
                              <h4 className="text-sm font-medium text-gray-700 mb-2">Skills</h4>
                              <div className="flex flex-wrap gap-2">
                                {profile.core.mainSkills.map((skill) => (
                                  <span
                                    key={skill}
                                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Edit Button */}
                        <div>
                          <Link
                            href="/profile/edit"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            Edit Profile
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* No Profile - Call to Action */
                  <div className="text-center bg-white shadow rounded-lg p-8">
                    <div className="w-24 h-24 mx-auto bg-gray-200 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Create Your Profile
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Set up your profile to get started with AboutMe Cards
                    </p>
                    <Link
                      href="/profile/edit"
                      className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Create Profile
                    </Link>
                  </div>
                )}

                {/* Status Section */}
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Account Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Email:</span>
                      <span className="ml-2 text-gray-900">{user?.email}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Auth Provider:</span>
                      <span className="ml-2 text-gray-900">{user?.providerData[0]?.providerId || 'email'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Organization:</span>
                      <span className="ml-2 text-gray-900">{currentOrganization?.name || 'None selected'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Profile Status:</span>
                      <span className={`ml-2 ${profile ? 'text-green-600' : 'text-yellow-600'}`}>
                        {profile ? 'Complete' : 'Incomplete'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Success Message */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 text-sm">
                    🎉 <strong>Story 1.1 Ready!</strong> Basic profile setup functionality is now available. 
                    You can create and edit your profile information including photo, name, title, and skills.
                  </p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}