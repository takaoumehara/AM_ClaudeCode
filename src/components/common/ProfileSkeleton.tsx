'use client';

interface ProfileSkeletonProps {
  count?: number;
  viewMode?: 'cards' | 'list';
}

export const ProfileSkeleton: React.FC<ProfileSkeletonProps> = ({ 
  count = 6, 
  viewMode = 'cards' 
}) => {
  if (viewMode === 'list') {
    return (
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-center p-4 bg-white border rounded-lg animate-pulse">
            <div className="w-16 h-16 bg-gray-200 rounded-xl flex-shrink-0"></div>
            <div className="ml-4 flex-1">
              <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
              <div className="flex gap-2">
                <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                <div className="h-6 bg-gray-200 rounded-full w-14"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg p-6 animate-pulse">
          <div className="w-24 h-24 bg-gray-200 rounded-xl mx-auto mb-4"></div>
          <div className="text-center">
            <div className="h-5 bg-gray-200 rounded w-32 mx-auto mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-24 mx-auto mb-4"></div>
            <div className="flex justify-center gap-2 mb-4">
              <div className="h-6 bg-gray-200 rounded-full w-16"></div>
              <div className="h-6 bg-gray-200 rounded-full w-20"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};