'use client';

import { useState, useRef, useEffect } from 'react';

interface SkillFilterProps {
  availableSkills: string[];
  selectedSkills: string[];
  onSkillsChange: (skills: string[]) => void;
  loading?: boolean;
}

export const SkillFilter: React.FC<SkillFilterProps> = ({
  availableSkills,
  selectedSkills,
  onSkillsChange,
  loading = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredSkills = availableSkills.filter(skill =>
    skill.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSkillToggle = (skill: string) => {
    const isSelected = selectedSkills.includes(skill);
    if (isSelected) {
      onSkillsChange(selectedSkills.filter(s => s !== skill));
    } else {
      onSkillsChange([...selectedSkills, skill]);
    }
  };

  const handleClearAll = () => {
    onSkillsChange([]);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className="relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="flex items-center">
          <span className="block truncate">
            {selectedSkills.length === 0 ? (
              <span className="text-gray-400">Filter by skills...</span>
            ) : (
              <span>
                {selectedSkills.length} skill{selectedSkills.length !== 1 ? 's' : ''} selected
              </span>
            )}
          </span>
        </span>
        <span className="ml-3 absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <svg
            className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
              isOpen ? 'transform rotate-180' : ''
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
        </span>
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none">
          {/* Search input */}
          <div className="sticky top-0 z-10 bg-white px-3 py-2 border-b border-gray-200">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search skills..."
              className="w-full px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Clear all button */}
          {selectedSkills.length > 0 && (
            <div className="px-3 py-2 border-b border-gray-200">
              <button
                type="button"
                onClick={handleClearAll}
                className="text-sm text-red-600 hover:text-red-800 focus:outline-none"
              >
                Clear all ({selectedSkills.length})
              </button>
            </div>
          )}

          {/* Skills list */}
          <div className="max-h-40 overflow-auto">
            {filteredSkills.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500">
                {searchTerm ? `No skills found matching "${searchTerm}"` : 'No skills available'}
              </div>
            ) : (
              filteredSkills.map((skill) => {
                const isSelected = selectedSkills.includes(skill);
                return (
                  <label
                    key={skill}
                    className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleSkillToggle(skill)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-3 text-sm text-gray-900">{skill}</span>
                  </label>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Selected skills display */}
      {selectedSkills.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {selectedSkills.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
              {skill}
              <button
                type="button"
                onClick={() => handleSkillToggle(skill)}
                className="ml-1 text-blue-600 hover:text-blue-800 focus:outline-none"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};