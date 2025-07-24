'use client';

import { useState, useRef, useEffect } from 'react';

interface TeamFilterProps {
  availableTeams: string[];
  selectedTeams: string[];
  onTeamsChange: (teams: string[]) => void;
  loading?: boolean;
}

export const TeamFilter: React.FC<TeamFilterProps> = ({
  availableTeams,
  selectedTeams,
  onTeamsChange,
  loading = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
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

  const handleTeamToggle = (team: string) => {
    const isSelected = selectedTeams.includes(team);
    if (isSelected) {
      onTeamsChange(selectedTeams.filter(t => t !== team));
    } else {
      onTeamsChange([...selectedTeams, team]);
    }
  };

  const handleClearAll = () => {
    onTeamsChange([]);
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
            {selectedTeams.length === 0 ? (
              <span className="text-gray-400">Filter by teams...</span>
            ) : (
              <span>
                {selectedTeams.length} team{selectedTeams.length !== 1 ? 's' : ''} selected
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
          {/* Clear all button */}
          {selectedTeams.length > 0 && (
            <div className="px-3 py-2 border-b border-gray-200">
              <button
                type="button"
                onClick={handleClearAll}
                className="text-sm text-red-600 hover:text-red-800 focus:outline-none"
              >
                Clear all ({selectedTeams.length})
              </button>
            </div>
          )}

          {/* Teams list */}
          <div className="max-h-48 overflow-auto">
            {availableTeams.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500">
                No teams available
              </div>
            ) : (
              availableTeams.map((team) => {
                const isSelected = selectedTeams.includes(team);
                return (
                  <label
                    key={team}
                    className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleTeamToggle(team)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-3 text-sm text-gray-900">{team}</span>
                  </label>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Selected teams display */}
      {selectedTeams.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {selectedTeams.map((team) => (
            <span
              key={team}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
            >
              {team}
              <button
                type="button"
                onClick={() => handleTeamToggle(team)}
                className="ml-1 text-green-600 hover:text-green-800 focus:outline-none"
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