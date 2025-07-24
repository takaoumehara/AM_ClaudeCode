'use client';

import { ReactNode } from 'react';

interface CardGridProps {
  children: ReactNode;
  loading?: boolean;
  emptyState?: ReactNode;
  className?: string;
}

export const CardGrid: React.FC<CardGridProps> = ({ 
  children, 
  loading = false, 
  emptyState,
  className = "" 
}) => {
  if (loading) {
    return (
      <div className={`grid gap-6 ${className}`} style={{ 
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' 
      }}>
        {/* Loading skeleton cards */}
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden animate-pulse">
            {/* Photo skeleton */}
            <div className="w-full aspect-square bg-gray-200" />
            
            {/* Content skeleton */}
            <div className="p-4 space-y-3">
              {/* Name skeleton */}
              <div className="h-5 bg-gray-200 rounded w-3/4" />
              
              {/* Title skeleton */}
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              
              {/* Skills skeleton */}
              <div className="flex gap-1">
                <div className="h-6 bg-gray-200 rounded-full w-16" />
                <div className="h-6 bg-gray-200 rounded-full w-20" />
                <div className="h-6 bg-gray-200 rounded-full w-14" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!children && emptyState) {
    return <div className="text-center py-12">{emptyState}</div>;
  }

  return (
    <div 
      className={`grid gap-6 ${className}`}
      style={{ 
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' 
      }}
    >
      {children}
    </div>
  );
};

// Default empty state component
export const EmptyProfilesState: React.FC = () => (
  <div className="text-center py-12">
    <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
      <svg 
        className="w-12 h-12 text-gray-400" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" 
        />
      </svg>
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">
      No profiles found
    </h3>
    <p className="text-gray-600">
      There are no profiles to display at the moment.
    </p>
  </div>
);

// Error state component
export const ProfilesErrorState: React.FC<{ 
  onRetry?: () => void;
  message?: string; 
}> = ({ 
  onRetry, 
  message = "Unable to load profiles. Please try again." 
}) => (
  <div className="text-center py-12">
    <div className="w-24 h-24 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
      <svg 
        className="w-12 h-12 text-red-400" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" 
        />
      </svg>
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">
      Something went wrong
    </h3>
    <p className="text-gray-600 mb-4">
      {message}
    </p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Try again
      </button>
    )}
  </div>
);