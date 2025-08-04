import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  serverTimestamp,
  writeBatch 
} from 'firebase/firestore';
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword 
} from 'firebase/auth';
import { UserProfile, ProfileVisibility } from '../src/lib/firebase/profiles';
import { Organization } from '../src/lib/firebase/organizations';

// Demo data definitions
const DEMO_ORG_NAME = 'TechCorp Innovation Hub';
const DEMO_ORG_ID = 'techcorp-innovation-hub';

// Profile templates for different roles
const profileTemplates = {
  frontendEngineer: [
    {
      name: 'Sarah Chen',
      title: 'Senior Frontend Engineer',
      skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Redux', 'GraphQL'],
      interests: ['Web Performance', 'Accessibility', 'Design Systems', 'Photography'],
      experience: 6,
      bio: 'Passionate about creating beautiful, accessible web experiences. Love turning complex problems into simple, elegant solutions.'
    },
    {
      name: 'Marcus Johnson',
      title: 'Frontend Developer',
      skills: ['Vue.js', 'JavaScript', 'CSS3', 'Webpack', 'Jest', 'Cypress'],
      interests: ['Open Source', 'Gaming', 'Coffee', 'Hiking'],
      experience: 3,
      bio: 'Vue.js enthusiast building reactive interfaces. Contributor to several open-source projects.'
    },
    {
      name: 'Emily Rodriguez',
      title: 'Lead Frontend Engineer',
      skills: ['Angular', 'RxJS', 'TypeScript', 'Nx', 'Storybook', 'Micro-frontends'],
      interests: ['Architecture', 'Mentoring', 'Travel', 'Cooking'],
      experience: 8,
      bio: 'Leading frontend architecture initiatives. Passionate about scalable solutions and team growth.'
    }
  ],
  backendEngineer: [
    {
      name: 'Alex Kumar',
      title: 'Backend Engineer',
      skills: ['Node.js', 'Express', 'PostgreSQL', 'Redis', 'Docker', 'AWS'],
      interests: ['Cloud Architecture', 'DevOps', 'Music Production', 'Running'],
      experience: 5,
      bio: 'Building robust APIs and scalable backend systems. AWS certified solutions architect.'
    },
    {
      name: 'Jessica Park',
      title: 'Senior Backend Developer',
      skills: ['Python', 'Django', 'FastAPI', 'MongoDB', 'Elasticsearch', 'Kubernetes'],
      interests: ['Machine Learning', 'Data Engineering', 'Rock Climbing', 'Reading'],
      experience: 7,
      bio: 'Python expert focused on high-performance backend services and data pipelines.'
    },
    {
      name: 'David Thompson',
      title: 'Staff Backend Engineer',
      skills: ['Go', 'gRPC', 'Kafka', 'Cassandra', 'Prometheus', 'Terraform'],
      interests: ['Distributed Systems', 'Performance Optimization', 'Chess', 'Gardening'],
      experience: 10,
      bio: 'Distributed systems architect with a passion for building resilient, scalable infrastructure.'
    }
  ],
  devOpsEngineer: [
    {
      name: 'Rachel Green',
      title: 'DevOps Engineer',
      skills: ['Kubernetes', 'Jenkins', 'Terraform', 'Ansible', 'GitLab CI', 'Monitoring'],
      interests: ['Automation', 'Security', 'Yoga', 'Sustainable Living'],
      experience: 4,
      bio: 'Automating everything that can be automated. Kubernetes certified administrator.'
    },
    {
      name: 'Tom Wilson',
      title: 'Senior DevOps Engineer',
      skills: ['AWS', 'Docker', 'CircleCI', 'Datadog', 'Vault', 'Service Mesh'],
      interests: ['Cloud Native', 'SRE', 'Mountain Biking', 'BBQ'],
      experience: 6,
      bio: 'Building reliable CI/CD pipelines and cloud infrastructure. AWS DevOps Professional certified.'
    }
  ],
  mlEngineer: [
    {
      name: 'Dr. Lisa Wang',
      title: 'Machine Learning Engineer',
      skills: ['TensorFlow', 'PyTorch', 'Scikit-learn', 'CUDA', 'MLflow', 'Kubeflow'],
      interests: ['Deep Learning', 'Computer Vision', 'Research', 'Piano'],
      experience: 5,
      bio: 'PhD in Computer Vision. Building production ML systems that solve real-world problems.'
    },
    {
      name: 'Carlos Mendez',
      title: 'Senior ML Engineer',
      skills: ['NLP', 'Transformers', 'JAX', 'Apache Spark', 'Airflow', 'Model Serving'],
      interests: ['Large Language Models', 'Ethics in AI', 'Soccer', 'Teaching'],
      experience: 7,
      bio: 'Specializing in NLP and large-scale ML systems. Published researcher in applied ML.'
    }
  ],
  uxDesigner: [
    {
      name: 'Maya Patel',
      title: 'Senior UX Designer',
      skills: ['Figma', 'User Research', 'Prototyping', 'Design Thinking', 'Accessibility', 'Workshops'],
      interests: ['Human Psychology', 'Art', 'Meditation', 'Travel Photography'],
      experience: 6,
      bio: 'User advocate designing intuitive experiences. Certified in inclusive design practices.'
    },
    {
      name: 'Oliver Brown',
      title: 'Lead UX Designer',
      skills: ['Design Systems', 'Information Architecture', 'Usability Testing', 'Sketch', 'Principle', 'Strategy'],
      interests: ['Service Design', 'Innovation', 'Jazz Music', 'Urban Sketching'],
      experience: 9,
      bio: 'Leading design strategy and building cohesive design systems for enterprise products.'
    },
    {
      name: 'Sophia Lee',
      title: 'UX Researcher',
      skills: ['User Interviews', 'A/B Testing', 'Analytics', 'Journey Mapping', 'Surveys', 'Ethnography'],
      interests: ['Behavioral Science', 'Data Visualization', 'Podcasts', 'Hiking'],
      experience: 4,
      bio: 'Turning user insights into actionable design decisions. Mixed methods research expert.'
    }
  ],
  uiDesigner: [
    {
      name: 'James Miller',
      title: 'UI Designer',
      skills: ['Figma', 'Adobe CC', 'Animation', 'Iconography', 'Typography', 'Color Theory'],
      interests: ['Motion Design', 'Branding', 'Gaming', 'Digital Art'],
      experience: 3,
      bio: 'Creating pixel-perfect interfaces with attention to detail. Passionate about micro-interactions.'
    },
    {
      name: 'Nina Volkov',
      title: 'Senior UI Designer',
      skills: ['Design Tokens', 'Component Libraries', 'Responsive Design', 'CSS', 'Lottie', 'Framer'],
      interests: ['Web Animation', '3D Design', 'Fashion', 'Architecture'],
      experience: 5,
      bio: 'Bridging design and development with systematic approaches to UI design.'
    }
  ],
  productDesigner: [
    {
      name: 'Robert Kim',
      title: 'Product Designer',
      skills: ['End-to-End Design', 'Wireframing', 'User Flows', 'Competitive Analysis', 'Metrics', 'Collaboration'],
      interests: ['Product Strategy', 'Startups', 'Basketball', 'Cooking'],
      experience: 5,
      bio: 'Full-stack designer comfortable with research, design, and validation. Startup veteran.'
    },
    {
      name: 'Amanda Foster',
      title: 'Senior Product Designer',
      skills: ['Design Leadership', 'Cross-functional Collaboration', 'Design Sprints', 'Systems Thinking', 'OKRs', 'Mentoring'],
      interests: ['Design Education', 'Community Building', 'Wine Tasting', 'Gardening'],
      experience: 8,
      bio: 'Leading product design initiatives from concept to launch. Mentor to junior designers.'
    }
  ],
  graphicDesigner: [
    {
      name: 'Isabella Martinez',
      title: 'Graphic Designer',
      skills: ['Illustrator', 'Photoshop', 'InDesign', 'Brand Design', 'Print Design', 'Social Media'],
      interests: ['Typography', 'Street Art', 'Sustainability', 'Cycling'],
      experience: 4,
      bio: 'Creating compelling visual narratives for digital and print media. Brand identity specialist.'
    }
  ],
  productManager: [
    {
      name: 'Michael Chang',
      title: 'Product Manager',
      skills: ['Product Strategy', 'Roadmapping', 'Analytics', 'User Stories', 'Agile', 'SQL'],
      interests: ['Market Research', 'Entrepreneurship', 'Tennis', 'Podcasting'],
      experience: 5,
      bio: 'Data-driven PM building products users love. Former startup founder.'
    },
    {
      name: 'Jennifer Adams',
      title: 'Senior Product Manager',
      skills: ['Product Vision', 'Stakeholder Management', 'A/B Testing', 'Metrics', 'Go-to-Market', 'Leadership'],
      interests: ['Innovation', 'Public Speaking', 'Yoga', 'Travel'],
      experience: 7,
      bio: 'Launching successful products at scale. Focused on user outcomes and business impact.'
    },
    {
      name: 'Daniel Roberts',
      title: 'Principal Product Manager',
      skills: ['Platform Strategy', 'Technical Architecture', 'Business Model', 'Team Building', 'Executive Communication', 'M&A'],
      interests: ['Technology Trends', 'Investing', 'Golf', 'Mentoring'],
      experience: 12,
      bio: 'Leading platform product strategy. Experience scaling products from 0 to millions of users.'
    }
  ],
  technicalPM: [
    {
      name: 'Priya Sharma',
      title: 'Technical Product Manager',
      skills: ['API Design', 'System Architecture', 'Developer Experience', 'Documentation', 'Integration', 'Security'],
      interests: ['Open Source', 'Developer Tools', 'Board Games', 'Baking'],
      experience: 6,
      bio: 'Building developer platforms and APIs. Engineering background with product mindset.'
    },
    {
      name: 'Ryan O\'Brien',
      title: 'Senior Technical PM',
      skills: ['Infrastructure', 'Performance', 'Scalability', 'Cost Optimization', 'SLAs', 'Monitoring'],
      interests: ['Cloud Computing', 'DevOps', 'Craft Beer', 'Woodworking'],
      experience: 8,
      bio: 'Optimizing technical products for scale and reliability. Former SRE turned product leader.'
    }
  ],
  vpProduct: [
    {
      name: 'Victoria Chen',
      title: 'VP of Product',
      skills: ['Product Leadership', 'Strategy', 'Vision Setting', 'Team Management', 'Board Reporting', 'P&L Management'],
      interests: ['Leadership Development', 'Industry Trends', 'Art Collection', 'Philanthropy'],
      experience: 15,
      bio: 'Product executive with track record of building winning products and teams. Board advisor.'
    }
  ],
  dataScientist: [
    {
      name: 'Dr. Samuel Johnson',
      title: 'Data Scientist',
      skills: ['Python', 'R', 'Statistics', 'Machine Learning', 'Deep Learning', 'Experimentation'],
      interests: ['Research', 'Kaggle Competitions', 'Chess', 'Science Fiction'],
      experience: 4,
      bio: 'PhD in Statistics. Turning data into insights and models into products.'
    },
    {
      name: 'Elena Petrova',
      title: 'Senior Data Scientist',
      skills: ['Predictive Modeling', 'NLP', 'Computer Vision', 'BigQuery', 'Databricks', 'Model Deployment'],
      interests: ['AI Ethics', 'Teaching', 'Classical Music', 'Skiing'],
      experience: 7,
      bio: 'Building ML models that drive business value. Specializing in NLP applications.'
    }
  ],
  dataAnalyst: [
    {
      name: 'Kevin Liu',
      title: 'Data Analyst',
      skills: ['SQL', 'Tableau', 'Excel', 'Python', 'Business Intelligence', 'Reporting'],
      interests: ['Data Visualization', 'Economics', 'Basketball', 'Photography'],
      experience: 3,
      bio: 'Turning data into stories that drive decisions. Tableau certified professional.'
    },
    {
      name: 'Grace Thompson',
      title: 'Senior Data Analyst',
      skills: ['Analytics', 'Looker', 'dbt', 'Snowflake', 'Statistical Analysis', 'Forecasting'],
      interests: ['Business Strategy', 'Process Improvement', 'Running', 'Cooking'],
      experience: 5,
      bio: 'Strategic analyst partnering with business leaders to drive growth through data.'
    }
  ],
  dataEngineer: [
    {
      name: 'Ahmed Hassan',
      title: 'Data Engineer',
      skills: ['Apache Spark', 'Airflow', 'ETL', 'Data Warehousing', 'Kafka', 'Cloud Platforms'],
      interests: ['Big Data', 'Architecture', 'Soccer', 'Travel'],
      experience: 6,
      bio: 'Building robust data pipelines that power analytics and ML. Certified cloud architect.'
    }
  ],
  contentMarketer: [
    {
      name: 'Rebecca White',
      title: 'Content Marketing Manager',
      skills: ['Content Strategy', 'SEO', 'Copywriting', 'Analytics', 'Social Media', 'Email Marketing'],
      interests: ['Storytelling', 'Blogging', 'Yoga', 'Sustainable Fashion'],
      experience: 5,
      bio: 'Creating content that connects and converts. Published writer and marketing strategist.'
    },
    {
      name: 'Chris Taylor',
      title: 'Senior Content Strategist',
      skills: ['Editorial Planning', 'Brand Voice', 'Content Operations', 'Video Marketing', 'Podcasting', 'Automation'],
      interests: ['Digital Media', 'Journalism', 'Film', 'Coffee Culture'],
      experience: 7,
      bio: 'Building content engines that scale. Former journalist turned content strategist.'
    }
  ],
  growthMarketer: [
    {
      name: 'Alexandra Dimitrov',
      title: 'Growth Marketing Manager',
      skills: ['Growth Hacking', 'Conversion Optimization', 'Product Analytics', 'Paid Acquisition', 'Retention', 'Experimentation'],
      interests: ['Psychology', 'Data Science', 'Rock Climbing', 'Electronic Music'],
      experience: 4,
      bio: 'Data-driven marketer obsessed with growth metrics. Scaled user acquisition 10x at last startup.'
    }
  ],
  brandManager: [
    {
      name: 'Jordan Phillips',
      title: 'Brand Manager',
      skills: ['Brand Strategy', 'Visual Identity', 'Campaign Management', 'Market Research', 'Creative Direction', 'Partnerships'],
      interests: ['Design Trends', 'Pop Culture', 'Fashion', 'Travel Photography'],
      experience: 6,
      bio: 'Building memorable brands that resonate. Award-winning campaign creator.'
    }
  ],
  marketingDirector: [
    {
      name: 'Patricia Anderson',
      title: 'Marketing Director',
      skills: ['Marketing Leadership', 'Budget Management', 'Team Building', 'Strategic Planning', 'PR', 'Event Marketing'],
      interests: ['Leadership', 'Public Speaking', 'Wine', 'Philanthropy'],
      experience: 12,
      bio: 'Marketing leader with experience scaling brands from startup to IPO. TEDx speaker.'
    }
  ],
  accountExecutive: [
    {
      name: 'William Davis',
      title: 'Account Executive',
      skills: ['Sales', 'Negotiation', 'CRM', 'Prospecting', 'Presentation', 'Relationship Building'],
      interests: ['Networking', 'Golf', 'Sports', 'Podcasts'],
      experience: 4,
      bio: 'Top-performing AE consistently exceeding quota. President\'s Club winner 2023.'
    },
    {
      name: 'Maria Garcia',
      title: 'Senior Account Executive',
      skills: ['Enterprise Sales', 'Solution Selling', 'Contract Negotiation', 'Pipeline Management', 'Forecasting', 'Team Collaboration'],
      interests: ['Business Development', 'Mentoring', 'Salsa Dancing', 'Travel'],
      experience: 7,
      bio: 'Enterprise sales expert closing 7-figure deals. Bilingual professional with global experience.'
    }
  ],
  salesEngineer: [
    {
      name: 'Jason Wright',
      title: 'Sales Engineer',
      skills: ['Technical Sales', 'Demo Creation', 'API Integration', 'Solution Architecture', 'Customer Success', 'Training'],
      interests: ['Technology', 'Innovation', 'Gaming', 'Home Automation'],
      experience: 5,
      bio: 'Technical expert bridging sales and engineering. Making complex solutions simple for customers.'
    }
  ],
  vpSales: [
    {
      name: 'Richard Stone',
      title: 'VP of Sales',
      skills: ['Sales Leadership', 'Revenue Growth', 'Team Scaling', 'Sales Strategy', 'Board Presentations', 'M&A'],
      interests: ['Leadership', 'Golf', 'Wine Collecting', 'Executive Coaching'],
      experience: 18,
      bio: 'Sales executive with track record of building high-performing teams. 3x VP of Sales.'
    }
  ],
  hrGeneralist: [
    {
      name: 'Emma Wilson',
      title: 'HR Generalist',
      skills: ['Employee Relations', 'Benefits Administration', 'HRIS', 'Compliance', 'Training', 'Policy Development'],
      interests: ['Workplace Culture', 'Wellness', 'Yoga', 'Volunteer Work'],
      experience: 4,
      bio: 'Creating positive employee experiences. SHRM certified professional.'
    },
    {
      name: 'Anthony Martinez',
      title: 'Senior HR Business Partner',
      skills: ['Strategic HR', 'Performance Management', 'Organizational Development', 'Coaching', 'Change Management', 'Analytics'],
      interests: ['Leadership Development', 'Psychology', 'Marathon Running', 'Cooking'],
      experience: 8,
      bio: 'Strategic HR partner driving organizational effectiveness. ICF certified coach.'
    }
  ],
  technicalRecruiter: [
    {
      name: 'Samantha Lee',
      title: 'Technical Recruiter',
      skills: ['Technical Recruiting', 'Sourcing', 'Interview Coordination', 'Employer Branding', 'Diversity Hiring', 'ATS'],
      interests: ['Tech Community', 'Networking', 'Social Media', 'Travel'],
      experience: 5,
      bio: 'Connecting top tech talent with amazing opportunities. Building diverse, inclusive teams.'
    }
  ],
  headOfPeople: [
    {
      name: 'Dr. Michelle Roberts',
      title: 'Head of People',
      skills: ['People Strategy', 'Culture Building', 'Executive Coaching', 'Compensation Design', 'M&A Integration', 'Board Reporting'],
      interests: ['Organizational Psychology', 'Executive Education', 'Art', 'Meditation'],
      experience: 14,
      bio: 'People leader building world-class cultures. PhD in Organizational Psychology.'
    }
  ],
  generalCounsel: [
    {
      name: 'Jonathan Edwards',
      title: 'General Counsel',
      skills: ['Corporate Law', 'Contract Negotiation', 'Compliance', 'Risk Management', 'M&A', 'IP Law'],
      interests: ['Legal Tech', 'Policy', 'Classical Literature', 'Tennis'],
      experience: 16,
      bio: 'Technology lawyer with startup to IPO experience. Former BigLaw partner.'
    }
  ],
  privacyOfficer: [
    {
      name: 'Sarah Mitchell',
      title: 'Privacy Officer',
      skills: ['Data Privacy', 'GDPR', 'CCPA', 'Security Compliance', 'Policy Writing', 'Training'],
      interests: ['Privacy Rights', 'Cybersecurity', 'Hiking', 'Photography'],
      experience: 7,
      bio: 'Privacy professional ensuring compliance and user trust. CIPP/E certified.'
    }
  ],
  complianceAnalyst: [
    {
      name: 'David Chen',
      title: 'Compliance Analyst',
      skills: ['Regulatory Compliance', 'Audit', 'Risk Assessment', 'Documentation', 'Process Improvement', 'Reporting'],
      interests: ['FinTech', 'Regulations', 'Chess', 'History'],
      experience: 4,
      bio: 'Ensuring regulatory compliance in fast-paced tech environment. CPA candidate.'
    }
  ],
  cfo: [
    {
      name: 'Elizabeth Walker',
      title: 'Chief Financial Officer',
      skills: ['Financial Strategy', 'Fundraising', 'Financial Planning', 'Board Reporting', 'M&A', 'IPO Readiness'],
      interests: ['Capital Markets', 'Strategy', 'Golf', 'Wine'],
      experience: 20,
      bio: 'CFO with experience scaling companies from Series A to IPO. Former investment banker.'
    }
  ],
  financialAnalyst: [
    {
      name: 'Matthew Brown',
      title: 'Senior Financial Analyst',
      skills: ['Financial Modeling', 'FP&A', 'Budgeting', 'Forecasting', 'Business Intelligence', 'Excel'],
      interests: ['Markets', 'Economics', 'Basketball', 'Podcasts'],
      experience: 6,
      bio: 'Strategic finance partner to business leaders. MBA in Finance.'
    }
  ],
  controller: [
    {
      name: 'Linda Zhang',
      title: 'Controller',
      skills: ['Accounting', 'Financial Reporting', 'Tax', 'Internal Controls', 'ERP Systems', 'Team Management'],
      interests: ['Process Optimization', 'Technology', 'Gardening', 'Cooking'],
      experience: 10,
      bio: 'Accounting leader ensuring financial accuracy and compliance. CPA with Big 4 experience.'
    }
  ],
  ceo: [
    {
      name: 'Thomas Harrison',
      title: 'Chief Executive Officer',
      skills: ['Executive Leadership', 'Vision Setting', 'Fundraising', 'Board Management', 'Strategic Planning', 'Public Speaking'],
      interests: ['Innovation', 'Mentoring', 'Sailing', 'Philanthropy'],
      experience: 22,
      bio: '3x founder and CEO. Building the future of work. YC alum and angel investor.'
    }
  ],
  cto: [
    {
      name: 'Dr. Robert Kim',
      title: 'Chief Technology Officer',
      skills: ['Technical Leadership', 'Architecture', 'Innovation', 'Team Building', 'Strategic Planning', 'Research'],
      interests: ['Emerging Tech', 'Open Source', 'Mountain Climbing', 'Philosophy'],
      experience: 18,
      bio: 'Technology leader and innovator. PhD in Computer Science. 50+ patents.'
    }
  ]
};

// Helper function to generate email
function generateEmail(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '.') + '@techcorp.demo';
}

// Helper function to generate avatar URL
function generateAvatarUrl(name: string, gender?: string): string {
  // Using UI Avatars API for demo purposes
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=400&background=random`;
}

// Helper function to generate a complete profile
function generateProfile(template: any, visibility: ProfileVisibility = 'organization'): Partial<UserProfile> {
  const now = new Date();
  const joinDate = new Date(now.getTime() - Math.random() * 365 * 24 * 60 * 60 * 1000); // Random date within last year

  return {
    core: {
      name: template.name,
      mainTitle: template.title,
      mainSkills: template.skills,
      photoUrl: generateAvatarUrl(template.name),
      teamIds: [] // Will be assigned later
    },
    personal: {
      hobbies: template.interests || [],
      favorites: ['Technology', 'Innovation', 'Learning'],
      learning: ['New technologies', 'Best practices', 'Industry trends'],
      motto: template.bio || 'Striving for excellence',
      activities: ['Coding', 'Mentoring', 'Learning'],
      customFields: {},
      show: {
        hobbies: true,
        favorites: true,
        learning: true,
        motto: true,
        activities: true
      }
    }
  };
}

// Main function to generate all demo data
export async function generateDemoData() {
  console.log('🚀 Starting demo data generation...');

  try {
    // Initialize Firebase Admin (you'll need to set this up)
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
    };

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    // Create admin account for demo
    console.log('Creating admin account...');
    const adminEmail = 'admin@techcorp.demo';
    const adminPassword = 'DemoPassword123!';
    
    try {
      await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        console.log('Admin account already exists, signing in...');
        await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
      } else {
        throw error;
      }
    }

    // Create the demo organization
    console.log('Creating demo organization...');
    const orgData: Organization = {
      id: DEMO_ORG_ID,
      name: DEMO_ORG_NAME,
      admins: [auth.currentUser?.uid || ''],
      members: [],
      orgProfileTemplate: {
        fields: [
          { key: 'department', type: 'string', required: true, publicDefault: true },
          { key: 'title', type: 'string', required: true, publicDefault: true },
          { key: 'skills', type: 'array', required: false, publicDefault: true },
          { key: 'bio', type: 'text', required: false, publicDefault: false }
        ]
      },
      teams: [],
      projects: [],
      inviteLinks: [],
      tags: ['technology', 'innovation', 'demo'],
      createdAt: serverTimestamp() as any
    };

    await setDoc(doc(db, 'organizations', DEMO_ORG_ID), orgData);

    // Generate all profiles
    console.log('Generating 50 user profiles...');
    const batch = writeBatch(db);
    const profiles: Array<{email: string, password: string, profile: any}> = [];

    // Flatten all templates
    const allTemplates = [
      ...profileTemplates.frontendEngineer,
      ...profileTemplates.backendEngineer,
      ...profileTemplates.devOpsEngineer,
      ...profileTemplates.mlEngineer,
      ...profileTemplates.uxDesigner,
      ...profileTemplates.uiDesigner,
      ...profileTemplates.productDesigner,
      ...profileTemplates.graphicDesigner,
      ...profileTemplates.productManager,
      ...profileTemplates.technicalPM,
      ...profileTemplates.vpProduct,
      ...profileTemplates.dataScientist,
      ...profileTemplates.dataAnalyst,
      ...profileTemplates.dataEngineer,
      ...profileTemplates.contentMarketer,
      ...profileTemplates.growthMarketer,
      ...profileTemplates.brandManager,
      ...profileTemplates.marketingDirector,
      ...profileTemplates.accountExecutive,
      ...profileTemplates.salesEngineer,
      ...profileTemplates.vpSales,
      ...profileTemplates.hrGeneralist,
      ...profileTemplates.technicalRecruiter,
      ...profileTemplates.headOfPeople,
      ...profileTemplates.generalCounsel,
      ...profileTemplates.privacyOfficer,
      ...profileTemplates.complianceAnalyst,
      ...profileTemplates.cfo,
      ...profileTemplates.financialAnalyst,
      ...profileTemplates.controller,
      ...profileTemplates.ceo,
      ...profileTemplates.cto
    ];

    // Create user accounts and profiles
    for (let i = 0; i < allTemplates.length; i++) {
      const template = allTemplates[i];
      const email = generateEmail(template.name);
      const password = 'Demo2024!'; // Same password for all demo accounts
      
      // Determine visibility based on role
      let visibility: ProfileVisibility = 'organization';
      if (template.title.includes('VP') || template.title.includes('Chief') || template.title.includes('Head')) {
        visibility = 'public';
      }

      const profile = generateProfile(template, visibility);
      
      profiles.push({
        email,
        password,
        profile: {
          ...profile,
          userId: `demo-user-${i + 1}`,
          organizationId: DEMO_ORG_ID
        }
      });

      // Add to batch
      batch.set(
        doc(db, 'profiles', `demo-user-${i + 1}`),
        {
          ...profile,
          userId: `demo-user-${i + 1}`,
          organizationId: DEMO_ORG_ID
        }
      );
    }

    // Commit the batch
    await batch.commit();
    console.log('✅ All profiles created successfully!');

    // Create teams and assign members
    console.log('Creating team relationships...');
    const teams = [
      { id: 'engineering', name: 'Engineering', members: ['demo-user-1', 'demo-user-2', 'demo-user-3', 'demo-user-4', 'demo-user-5', 'demo-user-6', 'demo-user-7', 'demo-user-8', 'demo-user-9', 'demo-user-10'] },
      { id: 'design', name: 'Design', members: ['demo-user-11', 'demo-user-12', 'demo-user-13', 'demo-user-14', 'demo-user-15', 'demo-user-16', 'demo-user-17', 'demo-user-18'] },
      { id: 'product', name: 'Product', members: ['demo-user-19', 'demo-user-20', 'demo-user-21', 'demo-user-22', 'demo-user-23', 'demo-user-24'] },
      { id: 'data', name: 'Data', members: ['demo-user-25', 'demo-user-26', 'demo-user-27', 'demo-user-28', 'demo-user-29'] },
      { id: 'marketing', name: 'Marketing', members: ['demo-user-30', 'demo-user-31', 'demo-user-32', 'demo-user-33', 'demo-user-34'] },
      { id: 'sales', name: 'Sales', members: ['demo-user-35', 'demo-user-36', 'demo-user-37', 'demo-user-38'] },
      { id: 'people', name: 'People & Culture', members: ['demo-user-39', 'demo-user-40', 'demo-user-41', 'demo-user-42'] },
      { id: 'legal', name: 'Legal & Compliance', members: ['demo-user-43', 'demo-user-44', 'demo-user-45'] },
      { id: 'finance', name: 'Finance', members: ['demo-user-46', 'demo-user-47', 'demo-user-48'] },
      { id: 'leadership', name: 'Leadership', members: ['demo-user-49', 'demo-user-50', 'demo-user-24', 'demo-user-34', 'demo-user-38', 'demo-user-42'] }
    ];

    const teamBatch = writeBatch(db);
    teams.forEach(team => {
      teamBatch.set(doc(db, 'teams', team.id), {
        ...team,
        organizationId: DEMO_ORG_ID,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    });
    await teamBatch.commit();

    // Update profiles with team assignments
    const profileUpdateBatch = writeBatch(db);
    teams.forEach(team => {
      team.members.forEach(memberId => {
        profileUpdateBatch.update(doc(db, 'profiles', memberId), {
          'core.teamIds': team.id
        });
      });
    });
    await profileUpdateBatch.commit();

    console.log('✅ Team relationships created!');

    // Generate summary
    console.log('\n📊 Demo Data Generation Complete!');
    console.log('================================');
    console.log(`Organization: ${DEMO_ORG_NAME}`);
    console.log(`Total Profiles: ${allTemplates.length}`);
    console.log(`Teams Created: ${teams.length}`);
    console.log('\nAccess Credentials:');
    console.log(`Admin Email: ${adminEmail}`);
    console.log(`Admin Password: ${adminPassword}`);
    console.log(`Demo User Password: Demo2024!`);
    console.log('\nSample User Emails:');
    profiles.slice(0, 5).forEach(p => {
      console.log(`- ${p.email} (${p.profile.core.mainTitle})`);
    });
    console.log('\n✨ Demo data is ready to use!');

    // Save credentials to file for reference
    const credentials = {
      adminEmail,
      adminPassword,
      demoPassword: 'Demo2024!',
      sampleUsers: profiles.slice(0, 10).map(p => ({
        email: p.email,
        name: p.profile.core.name,
        title: p.profile.core.mainTitle
      }))
    };

    return credentials;

  } catch (error) {
    console.error('❌ Error generating demo data:', error);
    throw error;
  }
}

// Export for use in scripts
if (require.main === module) {
  generateDemoData()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}