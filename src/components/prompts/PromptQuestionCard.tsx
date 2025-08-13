'use client';

import { useState, useEffect } from 'react';
import { PromptQuestion, PromptAnswer } from '@/lib/prompts/types';

interface PromptQuestionCardProps {
  question: PromptQuestion;
  onAnswer: (answer: string | string[]) => void;
  onSkip: () => void;
  previousAnswer?: PromptAnswer;
}

export const PromptQuestionCard: React.FC<PromptQuestionCardProps> = ({
  question,
  onAnswer,
  onSkip,
  previousAnswer
}) => {
  const [answer, setAnswer] = useState<string | string[]>('');
  const [chips, setChips] = useState<string[]>([]);
  const [currentChip, setCurrentChip] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  // Initialize with previous answer if exists
  useEffect(() => {
    if (previousAnswer) {
      if (question.inputType === 'chips' || question.inputType === 'multiselect') {
        const prevArray = Array.isArray(previousAnswer.answer) 
          ? previousAnswer.answer 
          : [previousAnswer.answer];
        
        if (question.inputType === 'chips') {
          setChips(prevArray);
        } else {
          setSelectedOptions(prevArray);
        }
      } else {
        setAnswer(previousAnswer.answer as string);
      }
    }
  }, [previousAnswer, question.inputType]);

  const handleSubmit = () => {
    let finalAnswer: string | string[];

    switch (question.inputType) {
      case 'chips':
        finalAnswer = chips;
        break;
      case 'multiselect':
        finalAnswer = selectedOptions;
        break;
      default:
        finalAnswer = answer as string;
    }

    if (question.required && (!finalAnswer || (Array.isArray(finalAnswer) && finalAnswer.length === 0))) {
      return; // Don't submit if required and empty
    }

    onAnswer(finalAnswer);
  };

  const handleAddChip = () => {
    if (currentChip.trim() && chips.length < 10) {
      setChips([...chips, currentChip.trim()]);
      setCurrentChip('');
    }
  };

  const handleRemoveChip = (index: number) => {
    setChips(chips.filter((_, i) => i !== index));
  };

  const handleToggleOption = (option: string) => {
    setSelectedOptions(prev =>
      prev.includes(option)
        ? prev.filter(o => o !== option)
        : [...prev, option]
    );
  };

  const renderInput = () => {
    switch (question.inputType) {
      case 'textarea':
        return (
          <textarea
            value={answer as string}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder={question.placeholder}
            maxLength={question.maxLength}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={4}
          />
        );

      case 'chips':
        return (
          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              {chips.map((chip, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                >
                  {chip}
                  <button
                    onClick={() => handleRemoveChip(index)}
                    className="hover:text-blue-900"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={currentChip}
                onChange={(e) => setCurrentChip(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddChip()}
                placeholder={question.placeholder}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleAddChip}
                disabled={!currentChip.trim() || chips.length >= 10}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>
            {chips.length >= 10 && (
              <p className="text-sm text-gray-500 mt-2">Maximum 10 items allowed</p>
            )}
          </div>
        );

      case 'multiselect':
        return (
          <div className="space-y-2">
            {question.options?.map(option => (
              <label
                key={option}
                className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={selectedOptions.includes(option)}
                  onChange={() => handleToggleOption(option)}
                  className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'select':
        return (
          <select
            value={answer as string}
            onChange={(e) => setAnswer(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Choose an option...</option>
            {question.options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );

      default:
        return (
          <input
            type="text"
            value={answer as string}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder={question.placeholder}
            maxLength={question.maxLength}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        );
    }
  };

  const isAnswerValid = () => {
    if (question.inputType === 'chips') {
      return chips.length > 0;
    }
    if (question.inputType === 'multiselect') {
      return selectedOptions.length > 0;
    }
    return answer && answer.toString().trim().length > 0;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-8 mt-6">
      {/* Category Badge */}
      <div className="mb-4">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
          {question.category.charAt(0).toUpperCase() + question.category.slice(1)}
        </span>
      </div>

      {/* Question */}
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        {question.question}
      </h2>

      {/* Helper Text */}
      {question.helperText && (
        <p className="text-gray-600 mb-6">{question.helperText}</p>
      )}

      {/* Input */}
      <div className="mb-6">
        {renderInput()}
      </div>

      {/* Character Count for text inputs */}
      {(question.inputType === 'text' || question.inputType === 'textarea') && question.maxLength && (
        <p className="text-sm text-gray-500 mb-6">
          {(answer as string).length} / {question.maxLength} characters
        </p>
      )}

      {/* Actions */}
      <div className="flex justify-between">
        <button
          onClick={onSkip}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          Skip this question
        </button>
        
        <button
          onClick={handleSubmit}
          disabled={question.required && !isAnswerValid()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {previousAnswer ? 'Update & Continue' : 'Continue'}
        </button>
      </div>
    </div>
  );
};