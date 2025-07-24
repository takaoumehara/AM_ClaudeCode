'use client';

import { SelectionIndicator } from './ProfileCheckbox';

interface SelectionControlsProps {
  selectedCount: number;
  maxSelection: number;
  onCompare: () => void;
  onClear: () => void;
  className?: string;
  position?: 'fixed' | 'static';
}

export const SelectionControls: React.FC<SelectionControlsProps> = ({
  selectedCount,
  maxSelection,
  onCompare,
  onClear,
  className = "",
  position = 'fixed'
}) => {
  if (selectedCount === 0) return null;

  const positionClasses = position === 'fixed' 
    ? 'fixed bottom-6 right-6 z-40' 
    : 'relative';

  return (
    <div className={`${positionClasses} ${className}`}>
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 min-w-[280px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <SelectionIndicator 
              count={selectedCount} 
              maxSelection={maxSelection}
              className="bg-blue-100 text-blue-800"
            />
            
            {selectedCount >= 2 && (
              <button
                onClick={onCompare}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Compare
              </button>
            )}
          </div>

          <button
            onClick={onClear}
            className="text-gray-400 hover:text-gray-600 p-1 rounded"
            aria-label="Clear selection"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {selectedCount === 1 && (
          <p className="text-xs text-gray-500 mt-2">
            Select at least 2 profiles to compare
          </p>
        )}

        {selectedCount >= maxSelection && (
          <p className="text-xs text-orange-600 mt-2">
            Maximum {maxSelection} profiles can be compared at once
          </p>
        )}
      </div>
    </div>
  );
};

// Compact inline selection controls for smaller spaces
export const InlineSelectionControls: React.FC<{
  selectedCount: number;
  maxSelection: number;
  onCompare: () => void;
  onClear: () => void;
  className?: string;
}> = ({ selectedCount, maxSelection, onCompare, onClear, className = "" }) => {
  if (selectedCount === 0) return null;

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <SelectionIndicator 
        count={selectedCount} 
        maxSelection={maxSelection}
        className="bg-gray-100 text-gray-700"
      />
      
      {selectedCount >= 2 && (
        <button
          onClick={onCompare}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Compare
        </button>
      )}
      
      <button
        onClick={onClear}
        className="text-sm text-gray-500 hover:text-gray-700"
      >
        Clear
      </button>
    </div>
  );
};

// Selection toolbar for list/grid headers
export const SelectionToolbar: React.FC<{
  selectedCount: number;
  maxSelection: number;
  totalProfiles: number;
  onCompare: () => void;
  onClear: () => void;
  onSelectAll?: () => void;
  className?: string;
}> = ({ 
  selectedCount, 
  maxSelection, 
  totalProfiles, 
  onCompare, 
  onClear, 
  onSelectAll,
  className = "" 
}) => {
  const canSelectAll = onSelectAll && selectedCount < Math.min(maxSelection, totalProfiles);

  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-lg p-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <SelectionIndicator 
            count={selectedCount} 
            maxSelection={maxSelection}
            className="bg-blue-100 text-blue-800"
          />
          
          {canSelectAll && (
            <button
              onClick={onSelectAll}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Select all ({Math.min(maxSelection - selectedCount, totalProfiles - selectedCount)} more)
            </button>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {selectedCount >= 2 && (
            <button
              onClick={onCompare}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Compare {selectedCount}
            </button>
          )}
          
          <button
            onClick={onClear}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Clear all
          </button>
        </div>
      </div>
    </div>
  );
};