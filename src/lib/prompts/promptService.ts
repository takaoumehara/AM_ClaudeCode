import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  getDocs,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { 
  PromptSession, 
  PromptAnswer, 
  PromptQuestion,
  ProfileSuggestion,
  DEFAULT_PROMPTS 
} from './types';

// Create a new prompt session
export const createPromptSession = async (
  userId: string, 
  organizationId: string
): Promise<string> => {
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const session: Omit<PromptSession, 'id'> = {
    userId,
    organizationId,
    startedAt: new Date(),
    currentQuestionIndex: 0,
    answers: [],
    status: 'in_progress'
  };

  await setDoc(doc(db, 'promptSessions', sessionId), {
    ...session,
    startedAt: serverTimestamp()
  });

  return sessionId;
};

// Get current prompt session for user
export const getCurrentSession = async (
  userId: string,
  organizationId: string
): Promise<PromptSession | null> => {
  const q = query(
    collection(db, 'promptSessions'),
    where('userId', '==', userId),
    where('organizationId', '==', organizationId),
    where('status', '==', 'in_progress'),
    orderBy('startedAt', 'desc'),
    limit(1)
  );

  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    return null;
  }

  const doc = snapshot.docs[0];
  const data = doc.data();
  
  return {
    id: doc.id,
    ...data,
    startedAt: data.startedAt?.toDate() || new Date(),
    completedAt: data.completedAt?.toDate(),
    answers: data.answers || []
  } as PromptSession;
};

// Save answer for a prompt question
export const savePromptAnswer = async (
  sessionId: string,
  answer: PromptAnswer
): Promise<void> => {
  const sessionRef = doc(db, 'promptSessions', sessionId);
  const sessionDoc = await getDoc(sessionRef);
  
  if (!sessionDoc.exists()) {
    throw new Error('Session not found');
  }

  const session = sessionDoc.data() as PromptSession;
  const existingAnswerIndex = session.answers.findIndex(
    a => a.questionId === answer.questionId
  );

  // Update or add answer
  if (existingAnswerIndex >= 0) {
    session.answers[existingAnswerIndex] = answer;
  } else {
    session.answers.push(answer);
  }

  // Update current question index
  const currentQuestionIndex = DEFAULT_PROMPTS.findIndex(
    q => q.id === answer.questionId
  );
  
  await updateDoc(sessionRef, {
    answers: session.answers,
    currentQuestionIndex: Math.min(currentQuestionIndex + 1, DEFAULT_PROMPTS.length - 1)
  });
};

// Complete a prompt session
export const completePromptSession = async (
  sessionId: string,
  status: 'completed' | 'skipped' = 'completed'
): Promise<void> => {
  await updateDoc(doc(db, 'promptSessions', sessionId), {
    status,
    completedAt: serverTimestamp()
  });
};

// Generate profile suggestions from prompt answers
export const generateProfileSuggestions = (
  answers: PromptAnswer[]
): ProfileSuggestion[] => {
  const suggestions: ProfileSuggestion[] = [];

  // Generate main title suggestion
  const roleAnswer = answers.find(a => a.questionId === 'prof_role');
  if (roleAnswer && typeof roleAnswer.answer === 'string') {
    suggestions.push({
      field: 'mainTitle',
      suggestion: roleAnswer.answer,
      confidence: 0.95,
      source: 'prompt_answer'
    });
  }

  // Generate skills suggestions
  const technicalSkills = answers.find(a => a.questionId === 'skills_technical');
  if (technicalSkills && Array.isArray(technicalSkills.answer)) {
    suggestions.push({
      field: 'mainSkills',
      suggestion: technicalSkills.answer.join(','),
      confidence: 0.9,
      source: 'prompt_answer'
    });
  }

  // Generate bio/about suggestion
  const experienceAnswer = answers.find(a => a.questionId === 'prof_experience');
  const passionAnswer = answers.find(a => a.questionId === 'interests_work');
  
  if (experienceAnswer || passionAnswer) {
    const bioText = [
      experienceAnswer?.answer,
      passionAnswer ? `Passionate about ${passionAnswer.answer}` : ''
    ].filter(Boolean).join('. ');
    
    suggestions.push({
      field: 'bio',
      suggestion: bioText,
      confidence: 0.85,
      source: 'prompt_answer'
    });
  }

  // Generate interests/hobbies suggestions
  const personalInterests = answers.find(a => a.questionId === 'interests_personal');
  if (personalInterests && Array.isArray(personalInterests.answer)) {
    suggestions.push({
      field: 'hobbies',
      suggestion: personalInterests.answer.join(','),
      confidence: 0.9,
      source: 'prompt_answer'
    });
  }

  // Generate learning goals suggestions
  const learningSkills = answers.find(a => a.questionId === 'skills_learning');
  if (learningSkills && Array.isArray(learningSkills.answer)) {
    suggestions.push({
      field: 'learning',
      suggestion: learningSkills.answer.join(','),
      confidence: 0.85,
      source: 'prompt_answer'
    });
  }

  return suggestions;
};

// Get prompts for a specific category
export const getPromptsByCategory = (category: string): PromptQuestion[] => {
  return DEFAULT_PROMPTS.filter(prompt => prompt.category === category);
};

// Get next unanswered question
export const getNextQuestion = (
  answeredQuestionIds: string[]
): PromptQuestion | null => {
  const unansweredQuestion = DEFAULT_PROMPTS.find(
    prompt => !answeredQuestionIds.includes(prompt.id)
  );
  
  return unansweredQuestion || null;
};

// Calculate session progress
export const calculateProgress = (answers: PromptAnswer[]): {
  percentage: number;
  byCategory: Record<string, { answered: number; total: number }>;
} => {
  const totalQuestions = DEFAULT_PROMPTS.length;
  const answeredQuestions = answers.length;
  const percentage = Math.round((answeredQuestions / totalQuestions) * 100);

  // Calculate progress by category
  const byCategory: Record<string, { answered: number; total: number }> = {};
  
  DEFAULT_PROMPTS.forEach(prompt => {
    if (!byCategory[prompt.category]) {
      byCategory[prompt.category] = { answered: 0, total: 0 };
    }
    byCategory[prompt.category].total++;
    
    if (answers.some(a => a.questionId === prompt.id)) {
      byCategory[prompt.category].answered++;
    }
  });

  return { percentage, byCategory };
};