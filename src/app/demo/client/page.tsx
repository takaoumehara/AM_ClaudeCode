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

const DEMO_ORG_NAME = 'TechCorp Innovation Hub';
const DEMO_ORG_ID = 'techcorp-innovation-hub';
const DEMO_PASSWORD = 'Demo2024!';

// Simplified profile templates (first 10 for demo)
const profileTemplates = [
  {
    name: 'Sarah Chen',
    title: 'Senior Frontend Engineer',
    department: 'Engineering',
    skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Redux'],
    bio: 'Passionate about creating beautiful, accessible web experiences.'
  },
  {
    name: 'Marcus Johnson',
    title: 'Frontend Developer',
    department: 'Engineering',
    skills: ['Vue.js', 'JavaScript', 'CSS3', 'Webpack', 'Jest'],
    bio: 'Vue.js enthusiast building reactive interfaces.'
  },
  {
    name: 'Alex Kumar',
    title: 'Backend Engineer',
    department: 'Engineering',
    skills: ['Node.js', 'Express', 'PostgreSQL', 'Redis', 'Docker'],
    bio: 'Building robust APIs and scalable backend systems.'
  },
  {
    name: 'Maya Patel',
    title: 'Senior UX Designer',
    department: 'Design',
    skills: ['Figma', 'User Research', 'Prototyping', 'Design Thinking'],
    bio: 'User advocate designing intuitive experiences.'
  },
  {
    name: 'Michael Chang',
    title: 'Product Manager',
    department: 'Product',
    skills: ['Product Strategy', 'Analytics', 'Agile', 'SQL'],
    bio: 'Data-driven PM building products users love.'
  },
  {
    name: 'Dr. Lisa Wang',
    title: 'Machine Learning Engineer',
    department: 'Engineering',
    skills: ['TensorFlow', 'PyTorch', 'Scikit-learn', 'MLflow'],
    bio: 'PhD in Computer Vision. Building production ML systems.'
  },
  {
    name: 'Rebecca White',
    title: 'Content Marketing Manager',
    department: 'Marketing',
    skills: ['Content Strategy', 'SEO', 'Copywriting', 'Analytics'],
    bio: 'Creating content that connects and converts.'
  },
  {
    name: 'William Davis',
    title: 'Account Executive',
    department: 'Sales',
    skills: ['Sales', 'Negotiation', 'CRM', 'Prospecting'],
    bio: 'Top-performing AE consistently exceeding quota.'
  },
  {
    name: 'Emma Wilson',
    title: 'HR Generalist',
    department: 'People',
    skills: ['Employee Relations', 'Benefits', 'HRIS', 'Training'],
    bio: 'Creating positive employee experiences.'
  },
  {
    name: 'Thomas Harrison',
    title: 'Chief Executive Officer',
    department: 'Executive',
    skills: ['Leadership', 'Vision', 'Fundraising', 'Strategy'],
    bio: '3x founder and CEO. Building the future of work.'
  }
];

function generateEmail(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '.').replace(/'/g, '') + '@techcorp.demo';
}

function generateAvatarUrl(name: string): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=400&background=random`;
}

export default function ClientDemoPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: profileTemplates.length });
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
    setProgress({ current: 0, total: profileTemplates.length });

    try {
      addLog('Starting demo data generation...');

      // First, create and sign in as admin
      const adminEmail = 'admin@techcorp.demo';
      addLog(`Creating admin account: ${adminEmail}`);
      
      let adminUser;
      try {
        const credential = await createUserWithEmailAndPassword(auth, adminEmail, DEMO_PASSWORD);
        adminUser = credential.user;
        await updateProfile(adminUser, { displayName: 'Demo Admin' });
      } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
          addLog('Admin already exists, signing in...');
          const credential = await signInWithEmailAndPassword(auth, adminEmail, DEMO_PASSWORD);
          adminUser = credential.user;
        } else {
          throw error;
        }
      }

      // Create admin profile
      addLog('Creating admin profile...');
      const adminProfile: UserProfile = {
        core: {
          name: 'Demo Admin',
          mainTitle: 'System Administrator',
          mainSkills: ['Administration', 'User Management', 'System Configuration'],
          photoUrl: generateAvatarUrl('Demo Admin'),
          teamIds: ['admin']
        },
        personal: {
          customFields: {
            bio: 'Demo administrator account for TechCorp Innovation Hub',
            interests: ['Technology', 'Innovation', 'Team Building'],
            experience: '10+ years',
            education: 'Computer Science'
          },
          show: {
            bio: true,
            interests: true,
            experience: true,
            education: true
          }
        },
        profiles: {
          [DEMO_ORG_ID]: {
            role: 'Administrator',
            department: 'Administration',
            joinedAt: new Date()
          }
        }
      };
      await setDoc(doc(db, 'users', adminUser.uid), adminProfile);

      // Create organization
      addLog(`Creating organization: ${DEMO_ORG_NAME}`);
      const orgData = {
        id: DEMO_ORG_ID,
        name: DEMO_ORG_NAME,
        description: 'A cutting-edge technology company building the future of work',
        settings: {
          allowedDomains: ['techcorp.demo'],
          requireApproval: false,
          visibility: 'public' as const
        },
        members: [adminUser.uid],
        admins: [adminUser.uid],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await setDoc(doc(db, 'organizations', DEMO_ORG_ID), orgData);

      // Create user profiles
      const createdUsers = [];
      
      for (let i = 0; i < profileTemplates.length; i++) {
        const template = profileTemplates[i];
        const email = generateEmail(template.name);
        
        setProgress({ current: i + 1, total: profileTemplates.length });
        addLog(`Creating profile ${i + 1}/${profileTemplates.length}: ${template.name}`);

        try {
          // Create user account
          const userCredential = await createUserWithEmailAndPassword(auth, email, DEMO_PASSWORD);
          const user = userCredential.user;
          
          await updateProfile(user, { 
            displayName: template.name,
            photoURL: generateAvatarUrl(template.name)
          });

          // Create profile matching the existing UserProfile structure
          const profileData: UserProfile = {
            core: {
              name: template.name,
              mainTitle: template.title,
              mainSkills: template.skills,
              photoUrl: generateAvatarUrl(template.name),
              teamIds: [template.department.toLowerCase()]
            },
            personal: {
              customFields: {
                bio: template.bio,
                interests: ['Innovation', 'Technology', 'Collaboration'],
                experience: `${3 + Math.floor(Math.random() * 15)} years`,
                education: 'Bachelor\'s Degree'
              },
              show: {
                bio: true,
                interests: true,
                experience: true,
                education: true
              }
            },
            profiles: {
              [DEMO_ORG_ID]: {
                role: template.title,
                department: template.department,
                joinedAt: new Date()
              }
            }
          };

          await setDoc(doc(db, 'users', user.uid), profileData);

          // Add to organization members
          await updateDoc(doc(db, 'organizations', DEMO_ORG_ID), {
            members: arrayUnion(user.uid)
          });

          createdUsers.push({
            email,
            name: template.name,
            title: template.title,
            department: template.department
          });

        } catch (error: any) {
          addLog(`Error creating ${email}: ${error.message}`);
        }
      }

      // Sign back in as admin
      await signInWithEmailAndPassword(auth, adminEmail, DEMO_PASSWORD);

      const summary = {
        organization: DEMO_ORG_NAME,
        totalProfiles: createdUsers.length,
        adminCredentials: {
          email: adminEmail,
          password: DEMO_PASSWORD
        },
        demoPassword: DEMO_PASSWORD,
        createdUsers
      };

      setResult(summary);
      addLog('✅ Demo data generation complete!');

    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message);
      addLog(`❌ Error: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Demo Data Generator (Client-Side)
          </h1>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">
              This will create:
            </h2>
            <ul className="list-disc list-inside text-blue-800 space-y-1">
              <li>1 Demo Organization: TechCorp Innovation Hub</li>
              <li>10 Sample User Profiles (simplified version)</li>
              <li>Realistic roles across Engineering, Design, Product, etc.</li>
              <li>Professional skills and bios</li>
              <li>All accounts use password: Demo2024!</li>
            </ul>
            <p className="text-sm text-blue-600 mt-2">
              Note: This creates real Firebase Auth accounts. Use only for demo purposes.
            </p>
          </div>

          {!result && !isGenerating && (
            <button
              onClick={generateDemoData}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Generate Demo Data
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
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg max-h-48 overflow-y-auto">
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
                  ✅ Demo Data Generated Successfully!
                </h3>
                <p className="text-green-800">
                  Created {result.totalProfiles} profiles for {result.organization}
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Login Credentials
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-1">Admin Account:</h4>
                    <div className="bg-white p-3 rounded border border-gray-300 font-mono text-sm">
                      <div>Email: {result.adminCredentials.email}</div>
                      <div>Password: {result.adminCredentials.password}</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">
                      Created User Accounts:
                    </h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {result.createdUsers.map((user: any, index: number) => (
                        <div
                          key={index}
                          className="bg-white p-3 rounded border border-gray-200"
                        >
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-gray-600">{user.title}</div>
                          <div className="text-sm text-gray-500 font-mono">
                            {user.email}
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      All accounts use password: {result.demoPassword}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => router.push('/auth/signin')}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Go to Sign In
                </button>
                <button
                  onClick={() => router.push('/profiles')}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  View Profiles
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}