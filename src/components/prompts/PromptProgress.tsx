'use client';

interface PromptProgressProps {
  progress: {
    percentage: number;
    byCategory: Record<string, { answered: number; total: number }>;
  };
  categories: Array<{ id: string; name: string; icon: string }>;
}

export const PromptProgress: React.FC<PromptProgressProps> = ({ 
  progress, 
  categories 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
      {/* Overall Progress */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Overall Progress</span>
          <span className="text-sm font-semibold text-blue-600">{progress.percentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
      </div>

      {/* Category Progress */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {categories.map(category => {
          const categoryProgress = progress.byCategory[category.id] || { answered: 0, total: 0 };
          const categoryPercentage = categoryProgress.total > 0
            ? Math.round((categoryProgress.answered / categoryProgress.total) * 100)
            : 0;

          return (
            <div key={category.id} className="text-center">
              <div className="relative inline-block mb-2">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                  <span className="text-2xl">{category.icon}</span>
                </div>
                {/* Progress Ring */}
                <svg className="absolute inset-0 w-16 h-16 transform -rotate-90">
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="#E5E7EB"
                    strokeWidth="4"
                    fill="none"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="#3B82F6"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={`${175.84}`}
                    strokeDashoffset={`${175.84 - (175.84 * categoryPercentage) / 100}`}
                    className="transition-all duration-300"
                  />
                </svg>
              </div>
              <p className="text-xs font-medium text-gray-700">{category.name}</p>
              <p className="text-xs text-gray-500">
                {categoryProgress.answered}/{categoryProgress.total}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};