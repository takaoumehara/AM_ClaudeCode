export interface PromptQuestion {
  id: string;
  category: 'professional' | 'skills' | 'interests' | 'values' | 'goals';
  question: string;
  placeholder?: string;
  helperText?: string;
  inputType: 'text' | 'textarea' | 'select' | 'multiselect' | 'chips';
  options?: string[]; // For select/multiselect
  maxLength?: number;
  required?: boolean;
  order: number;
}

export interface PromptAnswer {
  questionId: string;
  answer: string | string[];
  timestamp: Date;
}

export interface PromptSession {
  id: string;
  userId: string;
  organizationId: string;
  startedAt: Date;
  completedAt?: Date;
  currentQuestionIndex: number;
  answers: PromptAnswer[];
  status: 'in_progress' | 'completed' | 'skipped';
}

export interface ProfileSuggestion {
  field: string;
  suggestion: string;
  confidence: number;
  source: 'prompt_answer' | 'ai_generated';
}

export const DEFAULT_PROMPTS: PromptQuestion[] = [
  // Professional Background
  {
    id: 'prof_role',
    category: 'professional',
    question: "What's your current role or job title?",
    placeholder: 'e.g., Senior Software Engineer, Product Manager',
    helperText: 'This helps others understand your professional focus',
    inputType: 'text',
    maxLength: 100,
    required: true,
    order: 1
  },
  {
    id: 'prof_experience',
    category: 'professional',
    question: 'Tell us about your professional journey and key experiences',
    placeholder: 'Share your career highlights, major projects, or achievements...',
    helperText: '2-3 sentences about your professional background',
    inputType: 'textarea',
    maxLength: 500,
    order: 2
  },
  
  // Skills
  {
    id: 'skills_technical',
    category: 'skills',
    question: 'What are your top technical skills?',
    placeholder: 'Add skills like React, Python, AWS...',
    helperText: 'Add up to 10 technical skills you excel at',
    inputType: 'chips',
    order: 3
  },
  {
    id: 'skills_soft',
    category: 'skills',
    question: 'What soft skills do you bring to the team?',
    placeholder: 'e.g., Leadership, Communication, Problem-solving',
    helperText: 'These help showcase your interpersonal strengths',
    inputType: 'chips',
    order: 4
  },
  {
    id: 'skills_learning',
    category: 'skills',
    question: "What skills are you currently learning or want to develop?",
    placeholder: 'Skills you are actively working on...',
    helperText: 'This shows your growth mindset',
    inputType: 'chips',
    order: 5
  },
  
  // Interests & Passions
  {
    id: 'interests_work',
    category: 'interests',
    question: 'What aspects of your work are you most passionate about?',
    placeholder: 'e.g., Building scalable systems, mentoring others, user experience...',
    helperText: 'Share what energizes you at work',
    inputType: 'textarea',
    maxLength: 300,
    order: 6
  },
  {
    id: 'interests_personal',
    category: 'interests',
    question: 'What are your interests outside of work?',
    placeholder: 'Hobbies, activities, causes you care about...',
    helperText: 'This helps colleagues connect with you on a personal level',
    inputType: 'chips',
    order: 7
  },
  
  // Values & Work Style
  {
    id: 'values_work_style',
    category: 'values',
    question: 'How would you describe your ideal work environment?',
    options: [
      'Fast-paced and dynamic',
      'Structured and organized',
      'Collaborative and team-oriented',
      'Independent and autonomous',
      'Creative and innovative',
      'Mission-driven and impactful'
    ],
    helperText: 'Select all that apply to you',
    inputType: 'multiselect',
    order: 8
  },
  {
    id: 'values_collaboration',
    category: 'values',
    question: 'What do you value most when working with others?',
    placeholder: 'e.g., Open communication, mutual respect, shared goals...',
    helperText: 'This helps set expectations for collaboration',
    inputType: 'textarea',
    maxLength: 300,
    order: 9
  },
  
  // Goals & Aspirations
  {
    id: 'goals_short_term',
    category: 'goals',
    question: "What's one professional goal you're working towards?",
    placeholder: 'A goal you want to achieve in the next 6-12 months...',
    helperText: 'Share something specific and meaningful to you',
    inputType: 'textarea',
    maxLength: 300,
    order: 10
  },
  {
    id: 'goals_help_others',
    category: 'goals',
    question: 'How can you help others in the organization?',
    placeholder: 'e.g., Code reviews, mentoring, domain expertise...',
    helperText: 'This helps colleagues know when to reach out',
    inputType: 'chips',
    order: 11
  },
  {
    id: 'goals_seeking_help',
    category: 'goals',
    question: 'What kind of help or connections are you looking for?',
    placeholder: 'e.g., Career advice, technical mentorship, project collaboration...',
    helperText: 'Let others know how they can support you',
    inputType: 'textarea',
    maxLength: 300,
    order: 12
  }
];

// Categories for progress tracking
export const PROMPT_CATEGORIES: Array<{ id: string; name: string; icon: string }> = [
  { id: 'professional', name: 'Professional Background', icon: '💼' },
  { id: 'skills', name: 'Skills & Expertise', icon: '🛠️' },
  { id: 'interests', name: 'Interests & Passions', icon: '🌟' },
  { id: 'values', name: 'Values & Work Style', icon: '🤝' },
  { id: 'goals', name: 'Goals & Aspirations', icon: '🎯' }
];