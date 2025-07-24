'use client';

import { useState, ReactNode } from 'react';

interface CollapsibleSectionProps {
  title: string;
  children: ReactNode;
  defaultExpanded?: boolean;
  expandOnDesktop?: boolean;
  className?: string;
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  children,
  defaultExpanded = true,
  expandOnDesktop = true,
  className = ""
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border overflow-hidden ${className}`}>
      {/* Header */}
      <button
        onClick={handleToggle}
        className={`w-full px-6 py-4 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset transition-colors duration-200 ${
          expandOnDesktop ? 'lg:cursor-default' : 'hover:bg-gray-50'
        }`}
        disabled={expandOnDesktop}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {title}
          </h2>
          
          {/* Toggle icon - hidden on desktop if expandOnDesktop is true */}
          <div className={`${expandOnDesktop ? 'lg:hidden' : ''}`}>
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                isExpanded ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </button>

      {/* Content */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          expandOnDesktop 
            ? `${isExpanded ? 'lg:block' : 'lg:block'} ${isExpanded ? 'block' : 'hidden lg:block'}`
            : isExpanded ? 'block' : 'hidden'
        }`}
      >
        <div className="px-6 pb-6">
          {children}
        </div>
      </div>
    </div>
  );
};