'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { DEMO_ACCOUNTS, DEMO_ORG, DEMO_PROFILES, DEPARTMENTS } from '@/lib/demo/demoData';

export default function DemoPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);

  const filteredProfiles = selectedDepartment
    ? DEMO_PROFILES.filter(p => p.department === selectedDepartment)
    : DEMO_PROFILES;

  const departmentCounts = DEPARTMENTS.map(dept => ({
    ...dept,
    count: DEMO_PROFILES.filter(p => p.department === dept.name).length
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">TechCorp Innovation Hub Demo</h1>
            <p className="text-xl mb-8">
              Explore a fully-functional organization with 50 diverse professionals
            </p>
            <div className="flex justify-center gap-4">
              <Link
                href="/auth/signin"
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
              >
                Sign In to Demo
              </Link>
              <a
                href="#accounts"
                className="bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-800 transition"
              >
                View Demo Accounts
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Accounts Section */}
      <div id="accounts" className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Demo Accounts</h2>
          
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Admin Account */}
            <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-blue-500">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  A
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Admin Account</h3>
                  <p className="text-sm text-gray-600">{DEMO_ACCOUNTS.admin.role}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-gray-500">Email:</span>
                  <p className="font-mono text-sm bg-gray-100 p-2 rounded">{DEMO_ACCOUNTS.admin.email}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Password:</span>
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-sm bg-gray-100 p-2 rounded flex-1">
                      {showPassword ? DEMO_ACCOUNTS.admin.password : '••••••••'}
                    </p>
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-blue-50 rounded">
                  <p className="text-sm text-blue-800">
                    <strong>Admin Capabilities:</strong> Full organization management, user management, 
                    settings configuration, and complete data access.
                  </p>
                </div>
              </div>
            </div>

            {/* Member Account */}
            <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-green-500">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  M
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Member Account</h3>
                  <p className="text-sm text-gray-600">{DEMO_ACCOUNTS.member.role}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-gray-500">Email:</span>
                  <p className="font-mono text-sm bg-gray-100 p-2 rounded">{DEMO_ACCOUNTS.member.email}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Password:</span>
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-sm bg-gray-100 p-2 rounded flex-1">
                      {showPassword ? DEMO_ACCOUNTS.member.password : '••••••••'}
                    </p>
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-green-50 rounded">
                  <p className="text-sm text-green-800">
                    <strong>Member Capabilities:</strong> View organization profiles, edit own profile, 
                    create new organizations, limited admin access.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> All demo accounts use the same password: <code className="font-mono bg-yellow-100 px-1 rounded">{DEMO_ACCOUNTS.admin.password}</code>
            </p>
          </div>
        </div>

        {/* Organization Overview */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Organization Overview</h2>
          
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">{DEMO_ORG.name}</h3>
            <p className="text-gray-600 mb-6">{DEMO_ORG.description}</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{DEMO_PROFILES.length}</div>
                <div className="text-sm text-gray-600">Total Members</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{DEPARTMENTS.length}</div>
                <div className="text-sm text-gray-600">Departments</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">15+</div>
                <div className="text-sm text-gray-600">Avg Years Experience</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">200+</div>
                <div className="text-sm text-gray-600">Combined Skills</div>
              </div>
            </div>
          </div>

          {/* Department Filter */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter by Department</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedDepartment(null)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  selectedDepartment === null
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                All ({DEMO_PROFILES.length})
              </button>
              {departmentCounts.map(dept => (
                <button
                  key={dept.id}
                  onClick={() => setSelectedDepartment(dept.name)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                    selectedDepartment === dept.name
                      ? `${dept.color} text-white`
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {dept.name} ({dept.count})
                </button>
              ))}
            </div>
          </div>

          {/* Team Members Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProfiles.map(profile => (
              <div key={profile.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
                <div className="flex items-start gap-4">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                    <Image
                      src={profile.photoUrl}
                      alt={profile.name}
                      width={64}
                      height={64}
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 truncate">{profile.name}</h4>
                    <p className="text-sm text-gray-600 truncate">{profile.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{profile.department}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {profile.skills.slice(0, 3).map((skill, idx) => (
                        <span
                          key={idx}
                          className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded"
                        >
                          {skill}
                        </span>
                      ))}
                      {profile.skills.length > 3 && (
                        <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                          +{profile.skills.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Demo Features</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Profile Management</h3>
              <p className="text-sm text-gray-600">
                View and edit comprehensive profiles with skills, experience, and personal information.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Organization Structure</h3>
              <p className="text-sm text-gray-600">
                Explore departments, teams, and reporting structures within the organization.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Search & Discovery</h3>
              <p className="text-sm text-gray-600">
                Find team members by skills, department, or expertise with advanced filtering.
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Explore?</h2>
          <p className="text-gray-600 mb-8">
            Sign in with one of the demo accounts above to experience the full functionality
          </p>
          <Link
            href="/auth/signin"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition inline-block"
          >
            Sign In to Demo
          </Link>
        </div>
      </div>
    </div>
  );
}