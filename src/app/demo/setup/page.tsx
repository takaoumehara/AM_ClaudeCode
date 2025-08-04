'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile 
} from 'firebase/auth';
import { doc, setDoc, updateDoc, arrayUnion, writeBatch } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';
import { UserProfile } from '@/lib/firebase/profiles';
import { DEMO_ORG, DEMO_PROFILES, DEMO_ACCOUNTS, TEAMS } from '@/lib/demo/demoData';

export default function DemoSetupPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: DEMO_PROFILES.length });
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [logs, setLogs] = useState<string[]>([]);
  const router = useRouter();

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const generateDemoData = async () => {
    setIsGenerating(true);
    setError('');
    setResult(null);
    setLogs([]);
    setProgress({ current: 0, total: DEMO_PROFILES.length });

    try {
      addLog('🚀 Starting TechCorp Innovation Hub setup...');

      // Create organization first
      addLog(`📋 Creating organization: ${DEMO_ORG.name}`);
      const orgData = {
        id: DEMO_ORG.id,
        name: DEMO_ORG.name,
        description: DEMO_ORG.description,
        settings: {
          allowedDomains: ['techcorp.demo'],
          requireApproval: false,
          visibility: 'public' as const
        },
        members: [],
        admins: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await setDoc(doc(db, 'organizations', DEMO_ORG.id), orgData);

      // Create all user accounts and profiles using batch writes
      const createdUsers: any[] = [];
      const batch = writeBatch(db);
      let batchCount = 0;
      const BATCH_SIZE = 20; // Firestore batch limit is 500, we'll use 20 for safety

      for (let i = 0; i < DEMO_PROFILES.length; i++) {
        const profileData = DEMO_PROFILES[i];
        
        setProgress({ current: i + 1, total: DEMO_PROFILES.length });
        addLog(`👤 Creating ${profileData.name} (${profileData.title})`);

        try {
          // Create user account
          const userCredential = await createUserWithEmailAndPassword(
            auth, 
            profileData.email, 
            DEMO_ACCOUNTS.admin.password
          );
          const user = userCredential.user;
          
          await updateProfile(user, { 
            displayName: profileData.name,
            photoURL: profileData.photoUrl
          });

          // Create profile matching existing structure
          const userProfile: UserProfile = {
            core: {
              name: profileData.name,
              mainTitle: profileData.title,
              mainSkills: profileData.skills,
              photoUrl: profileData.photoUrl,
              teamIds: [DEMO_ORG.id, profileData.department.toLowerCase()] // Add org ID to teamIds
            },
            personal: {
              customFields: {
                bio: profileData.bio,
                interests: ['Innovation', 'Technology', 'Collaboration'],
                experience: `${profileData.experience} years`,
                education: 'Bachelor\'s Degree',
                department: profileData.department
              },
              show: {
                bio: true,
                interests: true,
                experience: true,
                education: true,
                department: true
              }
            },
            profiles: {
              [DEMO_ORG.id]: {
                role: profileData.title,
                department: profileData.department,
                joinedAt: new Date(),
                isAdmin: profileData.id === 'demo-admin'
              }
            }
          };

          // Also add organization membership to user document
          userProfile.organizationMemberships = {
            [DEMO_ORG.id]: {
              role: profileData.id === 'demo-admin' ? 'admin' : 'member',
              joinedAt: new Date()
            }
          };

          // Add to batch
          batch.set(doc(db, 'users', user.uid), userProfile);
          batchCount++;

          // Commit batch when it reaches size limit
          if (batchCount >= BATCH_SIZE) {
            await batch.commit();
            addLog(`💾 Saved batch of ${batchCount} profiles`);
            batchCount = 0;
          }

          createdUsers.push({
            id: profileData.id,
            uid: user.uid,
            email: profileData.email,
            name: profileData.name,
            title: profileData.title,
            department: profileData.department,
            isAdmin: profileData.id === 'demo-admin'
          });

        } catch (error: any) {
          if (error.code === 'auth/email-already-in-use') {
            addLog(`⚠️  ${profileData.email} already exists, skipping...`);
            // Try to sign in to get the user ID for updating the org
            try {
              const credential = await signInWithEmailAndPassword(auth, profileData.email, DEMO_ACCOUNTS.admin.password);
              createdUsers.push({
                id: profileData.id,
                uid: credential.user.uid,
                email: profileData.email,
                name: profileData.name,
                title: profileData.title,
                department: profileData.department,
                isAdmin: profileData.id === 'demo-admin'
              });
            } catch (signInError) {
              addLog(`❌ Could not sign in to existing account: ${profileData.email}`);
            }
          } else {
            addLog(`❌ Error creating ${profileData.email}: ${error.message}`);
          }
        }
      }

      // Commit any remaining profiles in the batch
      if (batchCount > 0) {
        await batch.commit();
        addLog(`💾 Saved final batch of ${batchCount} profiles`);
      }

      // Update organization with all members and admins
      addLog('🏢 Updating organization membership...');
      const allMemberIds = createdUsers.map(u => u.uid);
      const adminIds = createdUsers.filter(u => u.isAdmin).map(u => u.uid);

      await updateDoc(doc(db, 'organizations', DEMO_ORG.id), {
        members: allMemberIds,
        admins: adminIds
      });

      // Create teams
      addLog('👥 Creating teams...');
      const teamBatch = writeBatch(db);
      TEAMS.forEach(team => {
        const teamMembers = team.members
          .map(memberId => createdUsers.find(u => u.id === memberId)?.uid)
          .filter(Boolean);

        teamBatch.set(doc(db, 'teams', team.id), {
          id: team.id,
          name: team.name,
          organizationId: DEMO_ORG.id,
          members: teamMembers,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      });
      await teamBatch.commit();

      // Sign in as admin
      const adminUser = createdUsers.find(u => u.isAdmin);
      if (adminUser) {
        await signInWithEmailAndPassword(auth, adminUser.email, DEMO_ACCOUNTS.admin.password);
        addLog('👑 Signed in as admin');
      }

      const summary = {
        organization: DEMO_ORG.name,
        totalProfiles: createdUsers.length,
        departments: [...new Set(createdUsers.map(u => u.department))].length,
        teams: TEAMS.length,
        adminAccount: adminUser,
        createdUsers: createdUsers.slice(0, 10) // First 10 for display
      };

      setResult(summary);
      addLog('✅ TechCorp Innovation Hub setup complete!');

    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message);
      addLog(`❌ Setup failed: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Demo Environment Setup
          </h1>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">
              This will create:
            </h2>
            <ul className="list-disc list-inside text-blue-800 space-y-1">
              <li><strong>{DEMO_ORG.name}</strong> - Complete organization</li>
              <li><strong>{DEMO_PROFILES.length} Professional Profiles</strong> - All departments and roles</li>
              <li><strong>2 Demo Accounts</strong> - Admin and Member access levels</li>
              <li><strong>{TEAMS.length} Teams</strong> - Organized by function and expertise</li>
              <li><strong>Realistic Data</strong> - Skills, experience, and relationships</li>
            </ul>
            <p className="text-sm text-blue-600 mt-2">
              <strong>Warning:</strong> This creates real Firebase accounts. Use only for demo purposes.
            </p>
          </div>

          {!result && !isGenerating && (
            <button
              onClick={generateDemoData}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Setup Demo Environment
            </button>
          )}

          {isGenerating && (
            <div className="space-y-4">
              <div className="bg-gray-100 rounded-lg p-4">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Creating profiles...
                  </span>
                  <span className="text-sm text-gray-500">
                    {progress.current} / {progress.total}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${(progress.current / progress.total) * 100}%`
                    }}
                  />
                </div>
              </div>

              {logs.length > 0 && (
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg max-h-64 overflow-y-auto">
                  <div className="font-mono text-xs space-y-1">
                    {logs.map((log, i) => (
                      <div key={i}>{log}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">Error: {error}</p>
            </div>
          )}

          {result && (
            <div className="mt-6 space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-900 mb-2">
                  ✅ Demo Environment Ready!
                </h3>
                <p className="text-green-800">
                  Created {result.totalProfiles} profiles across {result.departments} departments
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Access Information
                </h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded border">
                    <h4 className="font-medium text-blue-900 mb-2">👑 Admin Account</h4>
                    <div className="text-sm space-y-1">
                      <div><strong>Email:</strong> {DEMO_ACCOUNTS.admin.email}</div>
                      <div><strong>Password:</strong> {DEMO_ACCOUNTS.admin.password}</div>
                      <div><strong>Role:</strong> {DEMO_ACCOUNTS.admin.role}</div>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded border">
                    <h4 className="font-medium text-green-900 mb-2">👤 Member Account</h4>
                    <div className="text-sm space-y-1">
                      <div><strong>Email:</strong> {DEMO_ACCOUNTS.member.email}</div>
                      <div><strong>Password:</strong> {DEMO_ACCOUNTS.member.password}</div>
                      <div><strong>Role:</strong> {DEMO_ACCOUNTS.member.role}</div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-yellow-50 rounded border border-yellow-200">
                  <p className="text-sm text-yellow-800">
                    <strong>All accounts use the same password:</strong> {DEMO_ACCOUNTS.admin.password}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => router.push('/auth/signin')}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Sign In to Demo
                </button>
                <button
                  onClick={() => router.push('/demo')}
                  className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  View Demo Info
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}