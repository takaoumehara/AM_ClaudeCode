import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase/admin';
import { ProfileVisibility } from '@/lib/firebase/profiles';

// Only allow in development
const isDevelopment = process.env.NODE_ENV === 'development';

// Demo data configuration
const DEMO_ORG_NAME = 'TechCorp Innovation Hub';
const DEMO_ORG_ID = 'techcorp-innovation-hub';
const DEMO_PASSWORD = 'Demo2024!';

// Simplified profile templates
const profileTemplates = [
  // Frontend Engineers (3)
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
    name: 'Emily Rodriguez',
    title: 'Lead Frontend Engineer',
    department: 'Engineering',
    skills: ['Angular', 'RxJS', 'TypeScript', 'Nx', 'Storybook'],
    bio: 'Leading frontend architecture initiatives.'
  },
  // Backend Engineers (3)
  {
    name: 'Alex Kumar',
    title: 'Backend Engineer',
    department: 'Engineering',
    skills: ['Node.js', 'Express', 'PostgreSQL', 'Redis', 'Docker'],
    bio: 'Building robust APIs and scalable backend systems.'
  },
  {
    name: 'Jessica Park',
    title: 'Senior Backend Developer',
    department: 'Engineering',
    skills: ['Python', 'Django', 'FastAPI', 'MongoDB', 'Kubernetes'],
    bio: 'Python expert focused on high-performance services.'
  },
  {
    name: 'David Thompson',
    title: 'Staff Backend Engineer',
    department: 'Engineering',
    skills: ['Go', 'gRPC', 'Kafka', 'Cassandra', 'Terraform'],
    bio: 'Distributed systems architect.'
  },
  // DevOps (2)
  {
    name: 'Rachel Green',
    title: 'DevOps Engineer',
    department: 'Engineering',
    skills: ['Kubernetes', 'Jenkins', 'Terraform', 'AWS', 'GitLab CI'],
    bio: 'Automating everything that can be automated.'
  },
  {
    name: 'Tom Wilson',
    title: 'Senior DevOps Engineer',
    department: 'Engineering',
    skills: ['AWS', 'Docker', 'CircleCI', 'Datadog', 'Vault'],
    bio: 'Building reliable CI/CD pipelines.'
  },
  // ML Engineers (2)
  {
    name: 'Dr. Lisa Wang',
    title: 'Machine Learning Engineer',
    department: 'Engineering',
    skills: ['TensorFlow', 'PyTorch', 'Scikit-learn', 'CUDA', 'MLflow'],
    bio: 'PhD in Computer Vision. Building production ML systems.'
  },
  {
    name: 'Carlos Mendez',
    title: 'Senior ML Engineer',
    department: 'Engineering',
    skills: ['NLP', 'Transformers', 'JAX', 'Apache Spark', 'Airflow'],
    bio: 'Specializing in NLP and large-scale ML systems.'
  },
  // UX Designers (3)
  {
    name: 'Maya Patel',
    title: 'Senior UX Designer',
    department: 'Design',
    skills: ['Figma', 'User Research', 'Prototyping', 'Design Thinking'],
    bio: 'User advocate designing intuitive experiences.'
  },
  {
    name: 'Oliver Brown',
    title: 'Lead UX Designer',
    department: 'Design',
    skills: ['Design Systems', 'Information Architecture', 'Usability Testing'],
    bio: 'Leading design strategy and building design systems.'
  },
  {
    name: 'Sophia Lee',
    title: 'UX Researcher',
    department: 'Design',
    skills: ['User Interviews', 'A/B Testing', 'Analytics', 'Journey Mapping'],
    bio: 'Turning user insights into actionable decisions.'
  },
  // UI Designers (2)
  {
    name: 'James Miller',
    title: 'UI Designer',
    department: 'Design',
    skills: ['Figma', 'Adobe CC', 'Animation', 'Typography'],
    bio: 'Creating pixel-perfect interfaces.'
  },
  {
    name: 'Nina Volkov',
    title: 'Senior UI Designer',
    department: 'Design',
    skills: ['Design Tokens', 'Component Libraries', 'CSS', 'Framer'],
    bio: 'Bridging design and development.'
  },
  // Product Designers (2)
  {
    name: 'Robert Kim',
    title: 'Product Designer',
    department: 'Design',
    skills: ['End-to-End Design', 'Wireframing', 'User Flows', 'Metrics'],
    bio: 'Full-stack designer from research to launch.'
  },
  {
    name: 'Amanda Foster',
    title: 'Senior Product Designer',
    department: 'Design',
    skills: ['Design Leadership', 'Design Sprints', 'Systems Thinking'],
    bio: 'Leading product design initiatives.'
  },
  // Graphic Designer (1)
  {
    name: 'Isabella Martinez',
    title: 'Graphic Designer',
    department: 'Design',
    skills: ['Illustrator', 'Photoshop', 'Brand Design', 'Social Media'],
    bio: 'Creating compelling visual narratives.'
  },
  // Product Managers (3)
  {
    name: 'Michael Chang',
    title: 'Product Manager',
    department: 'Product',
    skills: ['Product Strategy', 'Analytics', 'Agile', 'SQL'],
    bio: 'Data-driven PM building products users love.'
  },
  {
    name: 'Jennifer Adams',
    title: 'Senior Product Manager',
    department: 'Product',
    skills: ['Product Vision', 'A/B Testing', 'Go-to-Market', 'Leadership'],
    bio: 'Launching successful products at scale.'
  },
  {
    name: 'Daniel Roberts',
    title: 'Principal Product Manager',
    department: 'Product',
    skills: ['Platform Strategy', 'Business Model', 'Executive Communication'],
    bio: 'Leading platform product strategy.'
  },
  // Technical PMs (2)
  {
    name: 'Priya Sharma',
    title: 'Technical Product Manager',
    department: 'Product',
    skills: ['API Design', 'Developer Experience', 'Documentation'],
    bio: 'Building developer platforms and APIs.'
  },
  {
    name: 'Ryan O\'Brien',
    title: 'Senior Technical PM',
    department: 'Product',
    skills: ['Infrastructure', 'Performance', 'Cost Optimization'],
    bio: 'Optimizing technical products for scale.'
  },
  // VP Product (1)
  {
    name: 'Victoria Chen',
    title: 'VP of Product',
    department: 'Product',
    skills: ['Product Leadership', 'Strategy', 'Team Management'],
    bio: 'Product executive building winning teams.'
  },
  // Data Scientists (2)
  {
    name: 'Dr. Samuel Johnson',
    title: 'Data Scientist',
    department: 'Data',
    skills: ['Python', 'R', 'Machine Learning', 'Statistics'],
    bio: 'PhD in Statistics. Turning data into insights.'
  },
  {
    name: 'Elena Petrova',
    title: 'Senior Data Scientist',
    department: 'Data',
    skills: ['Predictive Modeling', 'NLP', 'BigQuery', 'Databricks'],
    bio: 'Building ML models that drive business value.'
  },
  // Data Analysts (2)
  {
    name: 'Kevin Liu',
    title: 'Data Analyst',
    department: 'Data',
    skills: ['SQL', 'Tableau', 'Python', 'Business Intelligence'],
    bio: 'Turning data into stories.'
  },
  {
    name: 'Grace Thompson',
    title: 'Senior Data Analyst',
    department: 'Data',
    skills: ['Analytics', 'Looker', 'dbt', 'Snowflake'],
    bio: 'Strategic analyst driving growth through data.'
  },
  // Data Engineer (1)
  {
    name: 'Ahmed Hassan',
    title: 'Data Engineer',
    department: 'Data',
    skills: ['Apache Spark', 'Airflow', 'ETL', 'Kafka'],
    bio: 'Building robust data pipelines.'
  },
  // Marketing (5)
  {
    name: 'Rebecca White',
    title: 'Content Marketing Manager',
    department: 'Marketing',
    skills: ['Content Strategy', 'SEO', 'Copywriting', 'Analytics'],
    bio: 'Creating content that connects and converts.'
  },
  {
    name: 'Chris Taylor',
    title: 'Senior Content Strategist',
    department: 'Marketing',
    skills: ['Editorial Planning', 'Brand Voice', 'Video Marketing'],
    bio: 'Building content engines that scale.'
  },
  {
    name: 'Alexandra Dimitrov',
    title: 'Growth Marketing Manager',
    department: 'Marketing',
    skills: ['Growth Hacking', 'Conversion Optimization', 'Paid Acquisition'],
    bio: 'Data-driven marketer obsessed with growth.'
  },
  {
    name: 'Jordan Phillips',
    title: 'Brand Manager',
    department: 'Marketing',
    skills: ['Brand Strategy', 'Campaign Management', 'Creative Direction'],
    bio: 'Building memorable brands that resonate.'
  },
  {
    name: 'Patricia Anderson',
    title: 'Marketing Director',
    department: 'Marketing',
    skills: ['Marketing Leadership', 'Strategic Planning', 'PR'],
    bio: 'Marketing leader scaling brands to IPO.'
  },
  // Sales (4)
  {
    name: 'William Davis',
    title: 'Account Executive',
    department: 'Sales',
    skills: ['Sales', 'Negotiation', 'CRM', 'Prospecting'],
    bio: 'Top-performing AE exceeding quota.'
  },
  {
    name: 'Maria Garcia',
    title: 'Senior Account Executive',
    department: 'Sales',
    skills: ['Enterprise Sales', 'Solution Selling', 'Forecasting'],
    bio: 'Enterprise sales expert closing 7-figure deals.'
  },
  {
    name: 'Jason Wright',
    title: 'Sales Engineer',
    department: 'Sales',
    skills: ['Technical Sales', 'Demo Creation', 'Solution Architecture'],
    bio: 'Technical expert bridging sales and engineering.'
  },
  {
    name: 'Richard Stone',
    title: 'VP of Sales',
    department: 'Sales',
    skills: ['Sales Leadership', 'Revenue Growth', 'Team Scaling'],
    bio: 'Sales executive building high-performing teams.'
  },
  // HR/People (4)
  {
    name: 'Emma Wilson',
    title: 'HR Generalist',
    department: 'People',
    skills: ['Employee Relations', 'Benefits', 'HRIS', 'Training'],
    bio: 'Creating positive employee experiences.'
  },
  {
    name: 'Anthony Martinez',
    title: 'Senior HR Business Partner',
    department: 'People',
    skills: ['Strategic HR', 'Performance Management', 'Coaching'],
    bio: 'Strategic HR partner driving effectiveness.'
  },
  {
    name: 'Samantha Lee',
    title: 'Technical Recruiter',
    department: 'People',
    skills: ['Technical Recruiting', 'Sourcing', 'Diversity Hiring'],
    bio: 'Connecting top tech talent with opportunities.'
  },
  {
    name: 'Dr. Michelle Roberts',
    title: 'Head of People',
    department: 'People',
    skills: ['People Strategy', 'Culture Building', 'Executive Coaching'],
    bio: 'People leader building world-class cultures.'
  },
  // Legal (3)
  {
    name: 'Jonathan Edwards',
    title: 'General Counsel',
    department: 'Legal',
    skills: ['Corporate Law', 'Contract Negotiation', 'M&A', 'IP Law'],
    bio: 'Technology lawyer with startup to IPO experience.'
  },
  {
    name: 'Sarah Mitchell',
    title: 'Privacy Officer',
    department: 'Legal',
    skills: ['Data Privacy', 'GDPR', 'CCPA', 'Security Compliance'],
    bio: 'Privacy professional ensuring compliance.'
  },
  {
    name: 'David Chen',
    title: 'Compliance Analyst',
    department: 'Legal',
    skills: ['Regulatory Compliance', 'Audit', 'Risk Assessment'],
    bio: 'Ensuring regulatory compliance.'
  },
  // Finance (3)
  {
    name: 'Elizabeth Walker',
    title: 'Chief Financial Officer',
    department: 'Finance',
    skills: ['Financial Strategy', 'Fundraising', 'M&A', 'IPO'],
    bio: 'CFO scaling companies from Series A to IPO.'
  },
  {
    name: 'Matthew Brown',
    title: 'Senior Financial Analyst',
    department: 'Finance',
    skills: ['Financial Modeling', 'FP&A', 'Budgeting', 'Forecasting'],
    bio: 'Strategic finance partner to business leaders.'
  },
  {
    name: 'Linda Zhang',
    title: 'Controller',
    department: 'Finance',
    skills: ['Accounting', 'Financial Reporting', 'Tax', 'ERP'],
    bio: 'Accounting leader ensuring accuracy.'
  },
  // Executives (2)
  {
    name: 'Thomas Harrison',
    title: 'Chief Executive Officer',
    department: 'Executive',
    skills: ['Executive Leadership', 'Vision Setting', 'Fundraising'],
    bio: '3x founder and CEO. Building the future of work.'
  },
  {
    name: 'Dr. Robert Kim',
    title: 'Chief Technology Officer',
    department: 'Executive',
    skills: ['Technical Leadership', 'Architecture', 'Innovation'],
    bio: 'Technology leader and innovator. 50+ patents.'
  }
];

function generateEmail(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '.').replace(/'/g, '') + '@techcorp.demo';
}

function generateAvatarUrl(name: string): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=400&background=random`;
}

export async function POST(request: Request) {
  // Only allow in development
  if (!isDevelopment) {
    return NextResponse.json(
      { error: 'Demo generation only available in development' },
      { status: 403 }
    );
  }

  try {
    console.log('Starting demo data generation...');

    // Create the demo organization
    const orgData = {
      id: DEMO_ORG_ID,
      name: DEMO_ORG_NAME,
      description: 'A cutting-edge technology company building the future of work',
      settings: {
        allowedDomains: ['techcorp.demo'],
        requireApproval: false,
        visibility: 'public'
      },
      members: [],
      admins: ['demo-admin'],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await adminDb.collection('organizations').doc(DEMO_ORG_ID).set(orgData);

    // Create admin user
    const adminUser = await adminAuth.createUser({
      email: 'admin@techcorp.demo',
      password: DEMO_PASSWORD,
      displayName: 'Demo Admin',
      uid: 'demo-admin'
    });

    // Create all user accounts and profiles
    const createdUsers = [];
    
    for (let i = 0; i < profileTemplates.length; i++) {
      const template = profileTemplates[i];
      const email = generateEmail(template.name);
      const uid = `demo-user-${i + 1}`;

      // Create user account
      try {
        const user = await adminAuth.createUser({
          email,
          password: DEMO_PASSWORD,
          displayName: template.name,
          uid
        });

        // Determine visibility
        let visibility: ProfileVisibility = 'organization';
        if (template.title.includes('VP') || template.title.includes('Chief') || template.title.includes('Head')) {
          visibility = 'public';
        }

        // Create profile
        const profileData = {
          userId: uid,
          organizationId: DEMO_ORG_ID,
          core: {
            name: template.name,
            mainTitle: template.title,
            mainSkills: template.skills,
            photoUrl: generateAvatarUrl(template.name),
            teamIds: [template.department.toLowerCase()]
          },
          professional: {
            experience: `${3 + Math.floor(Math.random() * 15)} years`,
            education: 'Bachelor\'s Degree',
            certifications: [],
            achievements: []
          },
          personal: {
            bio: template.bio,
            interests: ['Innovation', 'Technology', 'Collaboration'],
            values: ['Excellence', 'Integrity', 'Growth'],
            goals: ['Make an impact', 'Build great products']
          },
          visibility: {
            overall: visibility,
            fields: {
              email: 'private',
              phone: 'private',
              professional: 'organization',
              personal: 'team',
              social: 'public'
            }
          },
          metadata: {
            createdAt: new Date(),
            updatedAt: new Date(),
            lastActive: new Date(),
            profileCompleteness: 85 + Math.floor(Math.random() * 15)
          }
        };

        await adminDb.collection('profiles').doc(uid).set(profileData);

        // Update organization members
        await adminDb.collection('organizations').doc(DEMO_ORG_ID).update({
          members: adminDb.FieldValue.arrayUnion(uid)
        });

        createdUsers.push({
          email,
          name: template.name,
          title: template.title,
          department: template.department
        });

      } catch (error: any) {
        console.error(`Failed to create user ${email}:`, error.message);
      }
    }

    // Create teams
    const departments = [...new Set(profileTemplates.map(p => p.department))];
    for (const dept of departments) {
      const teamMembers = profileTemplates
        .map((p, i) => p.department === dept ? `demo-user-${i + 1}` : null)
        .filter(Boolean);

      await adminDb.collection('teams').doc(dept.toLowerCase()).set({
        id: dept.toLowerCase(),
        name: dept,
        organizationId: DEMO_ORG_ID,
        members: teamMembers,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    const summary = {
      organization: DEMO_ORG_NAME,
      totalProfiles: createdUsers.length,
      departments: departments.length,
      adminCredentials: {
        email: 'admin@techcorp.demo',
        password: DEMO_PASSWORD
      },
      demoPassword: DEMO_PASSWORD,
      sampleUsers: createdUsers.slice(0, 10)
    };

    console.log('Demo data generation complete!');

    return NextResponse.json({
      success: true,
      summary,
      message: 'Demo data generated successfully!'
    });

  } catch (error: any) {
    console.error('Error generating demo data:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate demo data' },
      { status: 500 }
    );
  }
}