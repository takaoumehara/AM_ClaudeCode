'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/contexts/OrganizationContext';
import { PromptQuestion, PromptAnswer, PROMPT_CATEGORIES } from '@/lib/prompts/types';
import { 
  createPromptSession,
  getCurrentSession,
  savePromptAnswer,
  completePromptSession,
  calculateProgress,
  getNextQuestion
} from '@/lib/prompts/promptService';
import { PromptQuestionCard } from './PromptQuestionCard';
import { PromptProgress } from './PromptProgress';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface PromptFlowProps {
  onComplete?: (answers: PromptAnswer[]) => void;
  onSkip?: () => void;
}

export const PromptFlow: React.FC<PromptFlowProps> = ({ 
  onComplete, 
  onSkip 
}) => {
  const { user } = useAuth();
  const { currentOrganization } = useOrganization();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<PromptQuestion | null>(null);
  const [answers, setAnswers] = useState<PromptAnswer[]>([]);
  const [progress, setProgress] = useState({ percentage: 0, byCategory: {} });
  const [error, setError] = useState('');

  // Initialize or resume session
  useEffect(() => {
    const initSession = async () => {
      if (!user || !currentOrganization) return;

      try {
        setLoading(true);
        
        // Check for existing session
        let session = await getCurrentSession(user.uid, currentOrganization.id);
        
        if (!session) {
          // Create new session
          const newSessionId = await createPromptSession(user.uid, currentOrganization.id);
          setSessionId(newSessionId);
          setAnswers([]);
        } else {
          // Resume existing session
          setSessionId(session.id);
          setAnswers(session.answers);
        }
        
        // Get next question
        const answeredIds = session?.answers.map(a => a.questionId) || [];
        const nextQ = getNextQuestion(answeredIds);
        setCurrentQuestion(nextQ);
        
        // Calculate progress
        const prog = calculateProgress(session?.answers || []);
        setProgress(prog);
        
      } catch (err) {
        console.error('Error initializing prompt session:', err);
        setError('Failed to start prompt session');
      } finally {
        setLoading(false);
      }
    };

    initSession();
  }, [user, currentOrganization]);

  const handleAnswer = async (answer: string | string[]) => {
    if (!sessionId || !currentQuestion) return;

    try {
      const promptAnswer: PromptAnswer = {
        questionId: currentQuestion.id,
        answer,
        timestamp: new Date()
      };

      // Save answer to database
      await savePromptAnswer(sessionId, promptAnswer);
      
      // Update local state
      const newAnswers = [...answers, promptAnswer];
      setAnswers(newAnswers);
      
      // Calculate new progress
      const prog = calculateProgress(newAnswers);
      setProgress(prog);
      
      // Get next question
      const answeredIds = newAnswers.map(a => a.questionId);
      const nextQ = getNextQuestion(answeredIds);
      
      if (nextQ) {
        setCurrentQuestion(nextQ);
      } else {
        // All questions answered
        await handleComplete();
      }
    } catch (err) {
      console.error('Error saving answer:', err);
      setError('Failed to save answer. Please try again.');
    }
  };

  const handleSkipQuestion = () => {
    if (!currentQuestion) return;
    
    const answeredIds = answers.map(a => a.questionId);
    const nextQ = getNextQuestion([...answeredIds, currentQuestion.id]);
    
    if (nextQ) {
      setCurrentQuestion(nextQ);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    if (!sessionId) return;

    try {
      await completePromptSession(sessionId);
      onComplete?.(answers);
      router.push('/profile/edit?fromPrompts=true');
    } catch (err) {
      console.error('Error completing session:', err);
      setError('Failed to complete session');
    }
  };

  const handleSkipAll = async () => {
    if (!sessionId) return;

    try {
      await completePromptSession(sessionId, 'skipped');
      onSkip?.();
      router.push('/browse');
    } catch (err) {
      console.error('Error skipping session:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading questions..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => router.push('/browse')}
            className="text-blue-600 hover:text-blue-700"
          >
            Go to Browse
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Let's build your profile
          </h1>
          <p className="text-gray-600">
            Answer a few questions to help others get to know you better
          </p>
        </div>

        {/* Progress */}
        <PromptProgress 
          progress={progress}
          categories={PROMPT_CATEGORIES}
        />

        {/* Current Question */}
        {currentQuestion ? (
          <PromptQuestionCard
            question={currentQuestion}
            onAnswer={handleAnswer}
            onSkip={handleSkipQuestion}
            previousAnswer={answers.find(a => a.questionId === currentQuestion.id)}
          />
        ) : (
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              All done!
            </h2>
            <p className="text-gray-600 mb-6">
              Great job! We've gathered your information and will use it to enhance your profile.
            </p>
            <button
              onClick={handleComplete}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Continue to Profile
            </button>
          </div>
        )}

        {/* Skip All Option */}
        <div className="mt-8 text-center">
          <button
            onClick={handleSkipAll}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            Skip and browse profiles
          </button>
        </div>
      </div>
    </div>
  );
};