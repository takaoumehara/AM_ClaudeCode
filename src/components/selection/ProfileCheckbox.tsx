'use client';

interface ProfileCheckboxProps {
  profileId: string;
  isSelected: boolean;
  canSelect: boolean;
  onToggle: (profileId: string) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const ProfileCheckbox: React.FC<ProfileCheckboxProps> = ({
  profileId,
  isSelected,
  canSelect,
  onToggle,
  className = "",
  size = 'md'
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation(); // Prevent triggering parent click events
    onToggle(profileId);
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4';
      case 'lg':
        return 'w-6 h-6';
      default:
        return 'w-5 h-5';
    }
  };

  const isDisabled = !isSelected && !canSelect;

  return (
    <div className={`relative ${className}`}>
      <label
        className={`inline-flex items-center cursor-pointer ${isDisabled ? 'cursor-not-allowed opacity-50' : ''}`}
        htmlFor={`checkbox-${profileId}`}
      >
        <input
          id={`checkbox-${profileId}`}
          type="checkbox"
          checked={isSelected}
          onChange={handleChange}
          disabled={isDisabled}
          className={`
            ${getSizeClasses()}
            rounded border-gray-300 text-blue-600 
            focus:ring-blue-500 focus:ring-2 focus:ring-offset-2
            disabled:cursor-not-allowed disabled:opacity-50
            transition-colors duration-150
          `}
          aria-label={`Select profile for comparison`}
        />
        
        {/* Custom checkbox styling for better visual feedback */}
        <div className={`
          absolute inset-0 ${getSizeClasses()} pointer-events-none
          ${isSelected ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}
          ${isDisabled ? 'bg-gray-100 border-gray-200' : ''}
          rounded transition-all duration-150
        `}>
          {isSelected && (
            <svg
              className={`${getSizeClasses()} text-white`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>
      </label>
    </div>
  );
};

// Compact checkbox variant for list views
export const CompactProfileCheckbox: React.FC<ProfileCheckboxProps> = (props) => {
  return (
    <ProfileCheckbox
      {...props}
      size="sm"
      className={`${props.className} mr-2`}
    />
  );
};

// Selection indicator showing current count
export const SelectionIndicator: React.FC<{
  count: number;
  maxCount: number;
  className?: string;
}> = ({ count, maxCount, className = "" }) => {
  if (count === 0) return null;

  return (
    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${className}`}>
      <div className="w-2 h-2 bg-blue-600 rounded-full mr-1" />
      {count} of {maxCount} selected
    </div>
  );
};