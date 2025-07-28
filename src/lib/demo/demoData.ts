// Pre-populated demo data for TechCorp Innovation Hub
export const DEMO_ORG = {
  id: 'techcorp-innovation-hub',
  name: 'TechCorp Innovation Hub',
  description: 'A cutting-edge technology company building the future of work'
};

export const DEMO_ACCOUNTS = {
  admin: {
    email: 'admin@techcorp.demo',
    password: 'Demo2024!',
    displayName: 'Alex Thompson',
    role: 'Organization Admin'
  },
  member: {
    email: 'sarah.chen@techcorp.demo',
    password: 'Demo2024!',
    displayName: 'Sarah Chen',
    role: 'Senior Frontend Engineer'
  }
};

// Complete 50-person organization
export const DEMO_PROFILES = [
  // Leadership (2)
  {
    id: 'demo-ceo',
    name: 'Thomas Harrison',
    email: 'thomas.harrison@techcorp.demo',
    title: 'Chief Executive Officer',
    department: 'Executive',
    skills: ['Executive Leadership', 'Vision Setting', 'Fundraising', 'Strategic Planning', 'Public Speaking'],
    bio: '3x founder and CEO. Building the future of work. YC alum and angel investor.',
    experience: 22,
    photoUrl: 'https://ui-avatars.com/api/?name=Thomas+Harrison&size=400&background=6366f1&color=fff'
  },
  {
    id: 'demo-cto',
    name: 'Dr. Robert Kim',
    email: 'robert.kim@techcorp.demo',
    title: 'Chief Technology Officer',
    department: 'Executive',
    skills: ['Technical Leadership', 'Architecture', 'Innovation', 'Team Building', 'Research'],
    bio: 'Technology leader and innovator. PhD in Computer Science. 50+ patents.',
    experience: 18,
    photoUrl: 'https://ui-avatars.com/api/?name=Robert+Kim&size=400&background=6366f1&color=fff'
  },

  // Engineering (10)
  {
    id: 'demo-eng-1',
    name: 'Sarah Chen',
    email: 'sarah.chen@techcorp.demo',
    title: 'Senior Frontend Engineer',
    department: 'Engineering',
    skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Redux', 'GraphQL'],
    bio: 'Passionate about creating beautiful, accessible web experiences. Love turning complex problems into simple, elegant solutions.',
    experience: 6,
    photoUrl: 'https://ui-avatars.com/api/?name=Sarah+Chen&size=400&background=3b82f6&color=fff'
  },
  {
    id: 'demo-eng-2',
    name: 'Marcus Johnson',
    email: 'marcus.johnson@techcorp.demo',
    title: 'Frontend Developer',
    department: 'Engineering',
    skills: ['Vue.js', 'JavaScript', 'CSS3', 'Webpack', 'Jest', 'Cypress'],
    bio: 'Vue.js enthusiast building reactive interfaces. Contributor to several open-source projects.',
    experience: 3,
    photoUrl: 'https://ui-avatars.com/api/?name=Marcus+Johnson&size=400&background=3b82f6&color=fff'
  },
  {
    id: 'demo-eng-3',
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@techcorp.demo',
    title: 'Lead Frontend Engineer',
    department: 'Engineering',
    skills: ['Angular', 'RxJS', 'TypeScript', 'Nx', 'Storybook', 'Micro-frontends'],
    bio: 'Leading frontend architecture initiatives. Passionate about scalable solutions and team growth.',
    experience: 8,
    photoUrl: 'https://ui-avatars.com/api/?name=Emily+Rodriguez&size=400&background=3b82f6&color=fff'
  },
  {
    id: 'demo-eng-4',
    name: 'Alex Kumar',
    email: 'alex.kumar@techcorp.demo',
    title: 'Backend Engineer',
    department: 'Engineering',
    skills: ['Node.js', 'Express', 'PostgreSQL', 'Redis', 'Docker', 'AWS'],
    bio: 'Building robust APIs and scalable backend systems. AWS certified solutions architect.',
    experience: 5,
    photoUrl: 'https://ui-avatars.com/api/?name=Alex+Kumar&size=400&background=3b82f6&color=fff'
  },
  {
    id: 'demo-eng-5',
    name: 'Jessica Park',
    email: 'jessica.park@techcorp.demo',
    title: 'Senior Backend Developer',
    department: 'Engineering',
    skills: ['Python', 'Django', 'FastAPI', 'MongoDB', 'Elasticsearch', 'Kubernetes'],
    bio: 'Python expert focused on high-performance backend services and data pipelines.',
    experience: 7,
    photoUrl: 'https://ui-avatars.com/api/?name=Jessica+Park&size=400&background=3b82f6&color=fff'
  },
  {
    id: 'demo-eng-6',
    name: 'David Thompson',
    email: 'david.thompson@techcorp.demo',
    title: 'Staff Backend Engineer',
    department: 'Engineering',
    skills: ['Go', 'gRPC', 'Kafka', 'Cassandra', 'Prometheus', 'Terraform'],
    bio: 'Distributed systems architect with a passion for building resilient, scalable infrastructure.',
    experience: 10,
    photoUrl: 'https://ui-avatars.com/api/?name=David+Thompson&size=400&background=3b82f6&color=fff'
  },
  {
    id: 'demo-eng-7',
    name: 'Rachel Green',
    email: 'rachel.green@techcorp.demo',
    title: 'DevOps Engineer',
    department: 'Engineering',
    skills: ['Kubernetes', 'Jenkins', 'Terraform', 'Ansible', 'GitLab CI', 'Monitoring'],
    bio: 'Automating everything that can be automated. Kubernetes certified administrator.',
    experience: 4,
    photoUrl: 'https://ui-avatars.com/api/?name=Rachel+Green&size=400&background=3b82f6&color=fff'
  },
  {
    id: 'demo-eng-8',
    name: 'Tom Wilson',
    email: 'tom.wilson@techcorp.demo',
    title: 'Senior DevOps Engineer',
    department: 'Engineering',
    skills: ['AWS', 'Docker', 'CircleCI', 'Datadog', 'Vault', 'Service Mesh'],
    bio: 'Building reliable CI/CD pipelines and cloud infrastructure. AWS DevOps Professional certified.',
    experience: 6,
    photoUrl: 'https://ui-avatars.com/api/?name=Tom+Wilson&size=400&background=3b82f6&color=fff'
  },
  {
    id: 'demo-eng-9',
    name: 'Dr. Lisa Wang',
    email: 'lisa.wang@techcorp.demo',
    title: 'Machine Learning Engineer',
    department: 'Engineering',
    skills: ['TensorFlow', 'PyTorch', 'Scikit-learn', 'CUDA', 'MLflow', 'Kubeflow'],
    bio: 'PhD in Computer Vision. Building production ML systems that solve real-world problems.',
    experience: 5,
    photoUrl: 'https://ui-avatars.com/api/?name=Lisa+Wang&size=400&background=3b82f6&color=fff'
  },
  {
    id: 'demo-eng-10',
    name: 'Carlos Mendez',
    email: 'carlos.mendez@techcorp.demo',
    title: 'Senior ML Engineer',
    department: 'Engineering',
    skills: ['NLP', 'Transformers', 'JAX', 'Apache Spark', 'Airflow', 'Model Serving'],
    bio: 'Specializing in NLP and large-scale ML systems. Published researcher in applied ML.',
    experience: 7,
    photoUrl: 'https://ui-avatars.com/api/?name=Carlos+Mendez&size=400&background=3b82f6&color=fff'
  },

  // Design (8)
  {
    id: 'demo-design-1',
    name: 'Maya Patel',
    email: 'maya.patel@techcorp.demo',
    title: 'Senior UX Designer',
    department: 'Design',
    skills: ['Figma', 'User Research', 'Prototyping', 'Design Thinking', 'Accessibility', 'Workshops'],
    bio: 'User advocate designing intuitive experiences. Certified in inclusive design practices.',
    experience: 6,
    photoUrl: 'https://ui-avatars.com/api/?name=Maya+Patel&size=400&background=8b5cf6&color=fff'
  },
  {
    id: 'demo-design-2',
    name: 'Oliver Brown',
    email: 'oliver.brown@techcorp.demo',
    title: 'Lead UX Designer',
    department: 'Design',
    skills: ['Design Systems', 'Information Architecture', 'Usability Testing', 'Sketch', 'Principle', 'Strategy'],
    bio: 'Leading design strategy and building cohesive design systems for enterprise products.',
    experience: 9,
    photoUrl: 'https://ui-avatars.com/api/?name=Oliver+Brown&size=400&background=8b5cf6&color=fff'
  },
  {
    id: 'demo-design-3',
    name: 'Sophia Lee',
    email: 'sophia.lee@techcorp.demo',
    title: 'UX Researcher',
    department: 'Design',
    skills: ['User Interviews', 'A/B Testing', 'Analytics', 'Journey Mapping', 'Surveys', 'Ethnography'],
    bio: 'Turning user insights into actionable design decisions. Mixed methods research expert.',
    experience: 4,
    photoUrl: 'https://ui-avatars.com/api/?name=Sophia+Lee&size=400&background=8b5cf6&color=fff'
  },
  {
    id: 'demo-design-4',
    name: 'James Miller',
    email: 'james.miller@techcorp.demo',
    title: 'UI Designer',
    department: 'Design',
    skills: ['Figma', 'Adobe CC', 'Animation', 'Iconography', 'Typography', 'Color Theory'],
    bio: 'Creating pixel-perfect interfaces with attention to detail. Passionate about micro-interactions.',
    experience: 3,
    photoUrl: 'https://ui-avatars.com/api/?name=James+Miller&size=400&background=8b5cf6&color=fff'
  },
  {
    id: 'demo-design-5',
    name: 'Nina Volkov',
    email: 'nina.volkov@techcorp.demo',
    title: 'Senior UI Designer',
    department: 'Design',
    skills: ['Design Tokens', 'Component Libraries', 'Responsive Design', 'CSS', 'Lottie', 'Framer'],
    bio: 'Bridging design and development with systematic approaches to UI design.',
    experience: 5,
    photoUrl: 'https://ui-avatars.com/api/?name=Nina+Volkov&size=400&background=8b5cf6&color=fff'
  },
  {
    id: 'demo-design-6',
    name: 'Robert Chen',
    email: 'robert.chen@techcorp.demo',
    title: 'Product Designer',
    department: 'Design',
    skills: ['End-to-End Design', 'Wireframing', 'User Flows', 'Competitive Analysis', 'Metrics', 'Collaboration'],
    bio: 'Full-stack designer comfortable with research, design, and validation. Startup veteran.',
    experience: 5,
    photoUrl: 'https://ui-avatars.com/api/?name=Robert+Chen&size=400&background=8b5cf6&color=fff'
  },
  {
    id: 'demo-design-7',
    name: 'Amanda Foster',
    email: 'amanda.foster@techcorp.demo',
    title: 'Senior Product Designer',
    department: 'Design',
    skills: ['Design Leadership', 'Cross-functional Collaboration', 'Design Sprints', 'Systems Thinking', 'OKRs', 'Mentoring'],
    bio: 'Leading product design initiatives from concept to launch. Mentor to junior designers.',
    experience: 8,
    photoUrl: 'https://ui-avatars.com/api/?name=Amanda+Foster&size=400&background=8b5cf6&color=fff'
  },
  {
    id: 'demo-design-8',
    name: 'Isabella Martinez',
    email: 'isabella.martinez@techcorp.demo',
    title: 'Graphic Designer',
    department: 'Design',
    skills: ['Illustrator', 'Photoshop', 'InDesign', 'Brand Design', 'Print Design', 'Social Media'],
    bio: 'Creating compelling visual narratives for digital and print media. Brand identity specialist.',
    experience: 4,
    photoUrl: 'https://ui-avatars.com/api/?name=Isabella+Martinez&size=400&background=8b5cf6&color=fff'
  },

  // Product (6)
  {
    id: 'demo-product-1',
    name: 'Michael Chang',
    email: 'michael.chang@techcorp.demo',
    title: 'Product Manager',
    department: 'Product',
    skills: ['Product Strategy', 'Roadmapping', 'Analytics', 'User Stories', 'Agile', 'SQL'],
    bio: 'Data-driven PM building products users love. Former startup founder.',
    experience: 5,
    photoUrl: 'https://ui-avatars.com/api/?name=Michael+Chang&size=400&background=10b981&color=fff'
  },
  {
    id: 'demo-product-2',
    name: 'Jennifer Adams',
    email: 'jennifer.adams@techcorp.demo',
    title: 'Senior Product Manager',
    department: 'Product',
    skills: ['Product Vision', 'Stakeholder Management', 'A/B Testing', 'Metrics', 'Go-to-Market', 'Leadership'],
    bio: 'Launching successful products at scale. Focused on user outcomes and business impact.',
    experience: 7,
    photoUrl: 'https://ui-avatars.com/api/?name=Jennifer+Adams&size=400&background=10b981&color=fff'
  },
  {
    id: 'demo-product-3',
    name: 'Daniel Roberts',
    email: 'daniel.roberts@techcorp.demo',
    title: 'Principal Product Manager',
    department: 'Product',
    skills: ['Platform Strategy', 'Technical Architecture', 'Business Model', 'Team Building', 'Executive Communication', 'M&A'],
    bio: 'Leading platform product strategy. Experience scaling products from 0 to millions of users.',
    experience: 12,
    photoUrl: 'https://ui-avatars.com/api/?name=Daniel+Roberts&size=400&background=10b981&color=fff'
  },
  {
    id: 'demo-product-4',
    name: 'Priya Sharma',
    email: 'priya.sharma@techcorp.demo',
    title: 'Technical Product Manager',
    department: 'Product',
    skills: ['API Design', 'System Architecture', 'Developer Experience', 'Documentation', 'Integration', 'Security'],
    bio: 'Building developer platforms and APIs. Engineering background with product mindset.',
    experience: 6,
    photoUrl: 'https://ui-avatars.com/api/?name=Priya+Sharma&size=400&background=10b981&color=fff'
  },
  {
    id: 'demo-product-5',
    name: 'Ryan O\'Brien',
    email: 'ryan.obrien@techcorp.demo',
    title: 'Senior Technical PM',
    department: 'Product',
    skills: ['Infrastructure', 'Performance', 'Scalability', 'Cost Optimization', 'SLAs', 'Monitoring'],
    bio: 'Optimizing technical products for scale and reliability. Former SRE turned product leader.',
    experience: 8,
    photoUrl: 'https://ui-avatars.com/api/?name=Ryan+OBrien&size=400&background=10b981&color=fff'
  },
  {
    id: 'demo-product-6',
    name: 'Victoria Chen',
    email: 'victoria.chen@techcorp.demo',
    title: 'VP of Product',
    department: 'Product',
    skills: ['Product Leadership', 'Strategy', 'Vision Setting', 'Team Management', 'Board Reporting', 'P&L Management'],
    bio: 'Product executive with track record of building winning products and teams. Board advisor.',
    experience: 15,
    photoUrl: 'https://ui-avatars.com/api/?name=Victoria+Chen&size=400&background=10b981&color=fff'
  },

  // Data (5)
  {
    id: 'demo-data-1',
    name: 'Dr. Samuel Johnson',
    email: 'samuel.johnson@techcorp.demo',
    title: 'Data Scientist',
    department: 'Data',
    skills: ['Python', 'R', 'Statistics', 'Machine Learning', 'Deep Learning', 'Experimentation'],
    bio: 'PhD in Statistics. Turning data into insights and models into products.',
    experience: 4,
    photoUrl: 'https://ui-avatars.com/api/?name=Samuel+Johnson&size=400&background=f59e0b&color=fff'
  },
  {
    id: 'demo-data-2',
    name: 'Elena Petrova',
    email: 'elena.petrova@techcorp.demo',
    title: 'Senior Data Scientist',
    department: 'Data',
    skills: ['Predictive Modeling', 'NLP', 'Computer Vision', 'BigQuery', 'Databricks', 'Model Deployment'],
    bio: 'Building ML models that drive business value. Specializing in NLP applications.',
    experience: 7,
    photoUrl: 'https://ui-avatars.com/api/?name=Elena+Petrova&size=400&background=f59e0b&color=fff'
  },
  {
    id: 'demo-data-3',
    name: 'Kevin Liu',
    email: 'kevin.liu@techcorp.demo',
    title: 'Data Analyst',
    department: 'Data',
    skills: ['SQL', 'Tableau', 'Excel', 'Python', 'Business Intelligence', 'Reporting'],
    bio: 'Turning data into stories that drive decisions. Tableau certified professional.',
    experience: 3,
    photoUrl: 'https://ui-avatars.com/api/?name=Kevin+Liu&size=400&background=f59e0b&color=fff'
  },
  {
    id: 'demo-data-4',
    name: 'Grace Thompson',
    email: 'grace.thompson@techcorp.demo',
    title: 'Senior Data Analyst',
    department: 'Data',
    skills: ['Analytics', 'Looker', 'dbt', 'Snowflake', 'Statistical Analysis', 'Forecasting'],
    bio: 'Strategic analyst partnering with business leaders to drive growth through data.',
    experience: 5,
    photoUrl: 'https://ui-avatars.com/api/?name=Grace+Thompson&size=400&background=f59e0b&color=fff'
  },
  {
    id: 'demo-data-5',
    name: 'Ahmed Hassan',
    email: 'ahmed.hassan@techcorp.demo',
    title: 'Data Engineer',
    department: 'Data',
    skills: ['Apache Spark', 'Airflow', 'ETL', 'Data Warehousing', 'Kafka', 'Cloud Platforms'],
    bio: 'Building robust data pipelines that power analytics and ML. Certified cloud architect.',
    experience: 6,
    photoUrl: 'https://ui-avatars.com/api/?name=Ahmed+Hassan&size=400&background=f59e0b&color=fff'
  },

  // Marketing (5)
  {
    id: 'demo-marketing-1',
    name: 'Rebecca White',
    email: 'rebecca.white@techcorp.demo',
    title: 'Content Marketing Manager',
    department: 'Marketing',
    skills: ['Content Strategy', 'SEO', 'Copywriting', 'Analytics', 'Social Media', 'Email Marketing'],
    bio: 'Creating content that connects and converts. Published writer and marketing strategist.',
    experience: 5,
    photoUrl: 'https://ui-avatars.com/api/?name=Rebecca+White&size=400&background=ec4899&color=fff'
  },
  {
    id: 'demo-marketing-2',
    name: 'Chris Taylor',
    email: 'chris.taylor@techcorp.demo',
    title: 'Senior Content Strategist',
    department: 'Marketing',
    skills: ['Editorial Planning', 'Brand Voice', 'Content Operations', 'Video Marketing', 'Podcasting', 'Automation'],
    bio: 'Building content engines that scale. Former journalist turned content strategist.',
    experience: 7,
    photoUrl: 'https://ui-avatars.com/api/?name=Chris+Taylor&size=400&background=ec4899&color=fff'
  },
  {
    id: 'demo-marketing-3',
    name: 'Alexandra Dimitrov',
    email: 'alexandra.dimitrov@techcorp.demo',
    title: 'Growth Marketing Manager',
    department: 'Marketing',
    skills: ['Growth Hacking', 'Conversion Optimization', 'Product Analytics', 'Paid Acquisition', 'Retention', 'Experimentation'],
    bio: 'Data-driven marketer obsessed with growth metrics. Scaled user acquisition 10x at last startup.',
    experience: 4,
    photoUrl: 'https://ui-avatars.com/api/?name=Alexandra+Dimitrov&size=400&background=ec4899&color=fff'
  },
  {
    id: 'demo-marketing-4',
    name: 'Jordan Phillips',
    email: 'jordan.phillips@techcorp.demo',
    title: 'Brand Manager',
    department: 'Marketing',
    skills: ['Brand Strategy', 'Visual Identity', 'Campaign Management', 'Market Research', 'Creative Direction', 'Partnerships'],
    bio: 'Building memorable brands that resonate. Award-winning campaign creator.',
    experience: 6,
    photoUrl: 'https://ui-avatars.com/api/?name=Jordan+Phillips&size=400&background=ec4899&color=fff'
  },
  {
    id: 'demo-marketing-5',
    name: 'Patricia Anderson',
    email: 'patricia.anderson@techcorp.demo',
    title: 'Marketing Director',
    department: 'Marketing',
    skills: ['Marketing Leadership', 'Budget Management', 'Team Building', 'Strategic Planning', 'PR', 'Event Marketing'],
    bio: 'Marketing leader with experience scaling brands from startup to IPO. TEDx speaker.',
    experience: 12,
    photoUrl: 'https://ui-avatars.com/api/?name=Patricia+Anderson&size=400&background=ec4899&color=fff'
  },

  // Sales (4)
  {
    id: 'demo-sales-1',
    name: 'William Davis',
    email: 'william.davis@techcorp.demo',
    title: 'Account Executive',
    department: 'Sales',
    skills: ['Sales', 'Negotiation', 'CRM', 'Prospecting', 'Presentation', 'Relationship Building'],
    bio: 'Top-performing AE consistently exceeding quota. President\'s Club winner 2023.',
    experience: 4,
    photoUrl: 'https://ui-avatars.com/api/?name=William+Davis&size=400&background=14b8a6&color=fff'
  },
  {
    id: 'demo-sales-2',
    name: 'Maria Garcia',
    email: 'maria.garcia@techcorp.demo',
    title: 'Senior Account Executive',
    department: 'Sales',
    skills: ['Enterprise Sales', 'Solution Selling', 'Contract Negotiation', 'Pipeline Management', 'Forecasting', 'Team Collaboration'],
    bio: 'Enterprise sales expert closing 7-figure deals. Bilingual professional with global experience.',
    experience: 7,
    photoUrl: 'https://ui-avatars.com/api/?name=Maria+Garcia&size=400&background=14b8a6&color=fff'
  },
  {
    id: 'demo-sales-3',
    name: 'Jason Wright',
    email: 'jason.wright@techcorp.demo',
    title: 'Sales Engineer',
    department: 'Sales',
    skills: ['Technical Sales', 'Demo Creation', 'API Integration', 'Solution Architecture', 'Customer Success', 'Training'],
    bio: 'Technical expert bridging sales and engineering. Making complex solutions simple for customers.',
    experience: 5,
    photoUrl: 'https://ui-avatars.com/api/?name=Jason+Wright&size=400&background=14b8a6&color=fff'
  },
  {
    id: 'demo-sales-4',
    name: 'Richard Stone',
    email: 'richard.stone@techcorp.demo',
    title: 'VP of Sales',
    department: 'Sales',
    skills: ['Sales Leadership', 'Revenue Growth', 'Team Scaling', 'Sales Strategy', 'Board Presentations', 'M&A'],
    bio: 'Sales executive with track record of building high-performing teams. 3x VP of Sales.',
    experience: 18,
    photoUrl: 'https://ui-avatars.com/api/?name=Richard+Stone&size=400&background=14b8a6&color=fff'
  },

  // HR/People (4)
  {
    id: 'demo-hr-1',
    name: 'Emma Wilson',
    email: 'emma.wilson@techcorp.demo',
    title: 'HR Generalist',
    department: 'People',
    skills: ['Employee Relations', 'Benefits Administration', 'HRIS', 'Compliance', 'Training', 'Policy Development'],
    bio: 'Creating positive employee experiences. SHRM certified professional.',
    experience: 4,
    photoUrl: 'https://ui-avatars.com/api/?name=Emma+Wilson&size=400&background=7c3aed&color=fff'
  },
  {
    id: 'demo-hr-2',
    name: 'Anthony Martinez',
    email: 'anthony.martinez@techcorp.demo',
    title: 'Senior HR Business Partner',
    department: 'People',
    skills: ['Strategic HR', 'Performance Management', 'Organizational Development', 'Coaching', 'Change Management', 'Analytics'],
    bio: 'Strategic HR partner driving organizational effectiveness. ICF certified coach.',
    experience: 8,
    photoUrl: 'https://ui-avatars.com/api/?name=Anthony+Martinez&size=400&background=7c3aed&color=fff'
  },
  {
    id: 'demo-hr-3',
    name: 'Samantha Lee',
    email: 'samantha.lee@techcorp.demo',
    title: 'Technical Recruiter',
    department: 'People',
    skills: ['Technical Recruiting', 'Sourcing', 'Interview Coordination', 'Employer Branding', 'Diversity Hiring', 'ATS'],
    bio: 'Connecting top tech talent with amazing opportunities. Building diverse, inclusive teams.',
    experience: 5,
    photoUrl: 'https://ui-avatars.com/api/?name=Samantha+Lee&size=400&background=7c3aed&color=fff'
  },
  {
    id: 'demo-hr-4',
    name: 'Dr. Michelle Roberts',
    email: 'michelle.roberts@techcorp.demo',
    title: 'Head of People',
    department: 'People',
    skills: ['People Strategy', 'Culture Building', 'Executive Coaching', 'Compensation Design', 'M&A Integration', 'Board Reporting'],
    bio: 'People leader building world-class cultures. PhD in Organizational Psychology.',
    experience: 14,
    photoUrl: 'https://ui-avatars.com/api/?name=Michelle+Roberts&size=400&background=7c3aed&color=fff'
  },

  // Legal (3)
  {
    id: 'demo-legal-1',
    name: 'Jonathan Edwards',
    email: 'jonathan.edwards@techcorp.demo',
    title: 'General Counsel',
    department: 'Legal',
    skills: ['Corporate Law', 'Contract Negotiation', 'Compliance', 'Risk Management', 'M&A', 'IP Law'],
    bio: 'Technology lawyer with startup to IPO experience. Former BigLaw partner.',
    experience: 16,
    photoUrl: 'https://ui-avatars.com/api/?name=Jonathan+Edwards&size=400&background=dc2626&color=fff'
  },
  {
    id: 'demo-legal-2',
    name: 'Sarah Mitchell',
    email: 'sarah.mitchell@techcorp.demo',
    title: 'Privacy Officer',
    department: 'Legal',
    skills: ['Data Privacy', 'GDPR', 'CCPA', 'Security Compliance', 'Policy Writing', 'Training'],
    bio: 'Privacy professional ensuring compliance and user trust. CIPP/E certified.',
    experience: 7,
    photoUrl: 'https://ui-avatars.com/api/?name=Sarah+Mitchell&size=400&background=dc2626&color=fff'
  },
  {
    id: 'demo-legal-3',
    name: 'David Chen',
    email: 'david.chen@techcorp.demo',
    title: 'Compliance Analyst',
    department: 'Legal',
    skills: ['Regulatory Compliance', 'Audit', 'Risk Assessment', 'Documentation', 'Process Improvement', 'Reporting'],
    bio: 'Ensuring regulatory compliance in fast-paced tech environment. CPA candidate.',
    experience: 4,
    photoUrl: 'https://ui-avatars.com/api/?name=David+Chen&size=400&background=dc2626&color=fff'
  },

  // Finance (3)
  {
    id: 'demo-finance-1',
    name: 'Elizabeth Walker',
    email: 'elizabeth.walker@techcorp.demo',
    title: 'Chief Financial Officer',
    department: 'Finance',
    skills: ['Financial Strategy', 'Fundraising', 'Financial Planning', 'Board Reporting', 'M&A', 'IPO Readiness'],
    bio: 'CFO with experience scaling companies from Series A to IPO. Former investment banker.',
    experience: 20,
    photoUrl: 'https://ui-avatars.com/api/?name=Elizabeth+Walker&size=400&background=059669&color=fff'
  },
  {
    id: 'demo-finance-2',
    name: 'Matthew Brown',
    email: 'matthew.brown@techcorp.demo',
    title: 'Senior Financial Analyst',
    department: 'Finance',
    skills: ['Financial Modeling', 'FP&A', 'Budgeting', 'Forecasting', 'Business Intelligence', 'Excel'],
    bio: 'Strategic finance partner to business leaders. MBA in Finance.',
    experience: 6,
    photoUrl: 'https://ui-avatars.com/api/?name=Matthew+Brown&size=400&background=059669&color=fff'
  },
  {
    id: 'demo-finance-3',
    name: 'Linda Zhang',
    email: 'linda.zhang@techcorp.demo',
    title: 'Controller',
    department: 'Finance',
    skills: ['Accounting', 'Financial Reporting', 'Tax', 'Internal Controls', 'ERP Systems', 'Team Management'],
    bio: 'Accounting leader ensuring financial accuracy and compliance. CPA with Big 4 experience.',
    experience: 10,
    photoUrl: 'https://ui-avatars.com/api/?name=Linda+Zhang&size=400&background=059669&color=fff'
  },

  // Admin Account (1)
  {
    id: 'demo-admin',
    name: 'Alex Thompson',
    email: 'admin@techcorp.demo',
    title: 'Organization Administrator',
    department: 'Administration',
    skills: ['System Administration', 'User Management', 'Security', 'Process Optimization', 'Training', 'Support'],
    bio: 'Managing TechCorp Innovation Hub operations and ensuring smooth collaboration across all teams.',
    experience: 10,
    photoUrl: 'https://ui-avatars.com/api/?name=Alex+Thompson&size=400&background=6b7280&color=fff'
  }
];

// Departments for categorization
export const DEPARTMENTS = [
  { id: 'executive', name: 'Executive', color: 'bg-indigo-500' },
  { id: 'engineering', name: 'Engineering', color: 'bg-blue-500' },
  { id: 'design', name: 'Design', color: 'bg-purple-500' },
  { id: 'product', name: 'Product', color: 'bg-green-500' },
  { id: 'data', name: 'Data', color: 'bg-yellow-500' },
  { id: 'marketing', name: 'Marketing', color: 'bg-pink-500' },
  { id: 'sales', name: 'Sales', color: 'bg-teal-500' },
  { id: 'people', name: 'People', color: 'bg-violet-500' },
  { id: 'legal', name: 'Legal', color: 'bg-red-500' },
  { id: 'finance', name: 'Finance', color: 'bg-emerald-500' },
  { id: 'administration', name: 'Administration', color: 'bg-gray-500' }
];

// Teams structure
export const TEAMS = [
  { id: 'leadership', name: 'Leadership Team', members: ['demo-ceo', 'demo-cto', 'demo-product-6', 'demo-marketing-5', 'demo-sales-4', 'demo-hr-4', 'demo-legal-1', 'demo-finance-1'] },
  { id: 'frontend', name: 'Frontend Team', members: ['demo-eng-1', 'demo-eng-2', 'demo-eng-3'] },
  { id: 'backend', name: 'Backend Team', members: ['demo-eng-4', 'demo-eng-5', 'demo-eng-6'] },
  { id: 'devops', name: 'DevOps Team', members: ['demo-eng-7', 'demo-eng-8'] },
  { id: 'ml', name: 'Machine Learning Team', members: ['demo-eng-9', 'demo-eng-10'] },
  { id: 'design-team', name: 'Design Team', members: ['demo-design-1', 'demo-design-2', 'demo-design-3', 'demo-design-4', 'demo-design-5', 'demo-design-6', 'demo-design-7', 'demo-design-8'] },
  { id: 'product-team', name: 'Product Team', members: ['demo-product-1', 'demo-product-2', 'demo-product-3', 'demo-product-4', 'demo-product-5', 'demo-product-6'] },
  { id: 'data-team', name: 'Data Team', members: ['demo-data-1', 'demo-data-2', 'demo-data-3', 'demo-data-4', 'demo-data-5'] },
  { id: 'marketing-team', name: 'Marketing Team', members: ['demo-marketing-1', 'demo-marketing-2', 'demo-marketing-3', 'demo-marketing-4', 'demo-marketing-5'] },
  { id: 'sales-team', name: 'Sales Team', members: ['demo-sales-1', 'demo-sales-2', 'demo-sales-3', 'demo-sales-4'] }
];