'use client';

interface ComparisonHighlightProps {
  text: string;
  isCommon: boolean;
  type: 'skill' | 'team' | 'interest';
  className?: string;
}

export const ComparisonHighlight: React.FC<ComparisonHighlightProps> = ({
  text,
  isCommon,
  type,
  className = ""
}) => {
  const getBaseStyles = () => {
    switch (type) {
      case 'skill':
        return isCommon 
          ? 'bg-blue-100 text-blue-800 border-blue-200' 
          : 'bg-gray-100 text-gray-800 border-gray-200';
      case 'team':
        return isCommon 
          ? 'bg-purple-100 text-purple-800 border-purple-200' 
          : 'bg-gray-100 text-gray-800 border-gray-200';
      case 'interest':
        return isCommon 
          ? 'bg-green-100 text-green-800 border-green-200' 
          : 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getIcon = () => {
    if (!isCommon) return null;
    
    return (
      <svg 
        className="w-3 h-3 mr-1" 
        fill="currentColor" 
        viewBox="0 0 20 20"
        aria-label="Common element"
      >
        <path 
          fillRule="evenodd" 
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
          clipRule="evenodd" 
        />
      </svg>
    );
  };

  return (
    <span 
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getBaseStyles()} ${className}`}
      title={isCommon ? `Common ${type} found in other profiles` : undefined}
    >
      {getIcon()}
      {text}
    </span>
  );
};