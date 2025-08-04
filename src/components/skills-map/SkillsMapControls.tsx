'use client';

import { useState } from 'react';
import { SkillMapData, SkillsMapFilters } from '@/lib/skills-map/types';

interface SkillsMapControlsProps {
  data: SkillMapData;
  filters: SkillsMapFilters;
  onFiltersChange: (filters: SkillsMapFilters) => void;
  layoutType: 'force-directed' | 'circular' | 'cluster';
  onLayoutChange: (layout: 'force-directed' | 'circular' | 'cluster') => void;
  selectedSkill: string | null;
  onSkillSelect: (skillId: string | null) => void;
}

export const SkillsMapControls: React.FC<SkillsMapControlsProps> = ({
  data,
  filters,
  onFiltersChange,
  layoutType,
  onLayoutChange,
  selectedSkill,
  onSkillSelect
}) => {
  const [searchTerm, setSearchTerm] = useState(filters.searchTerm || '');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    onFiltersChange({ ...filters, searchTerm: value });
  };

  const handleCategoryToggle = (categoryId: string) => {
    const currentCategories = filters.categories || [];
    const newCategories = currentCategories.includes(categoryId)
      ? currentCategories.filter(id => id !== categoryId)
      : [...currentCategories, categoryId];
    
    onFiltersChange({ ...filters, categories: newCategories });
  };

  const handleMinUserCountChange = (count: number) => {
    onFiltersChange({ ...filters, minUserCount: count });
  };

  const clearFilters = () => {
    setSearchTerm('');
    onFiltersChange({});
    onSkillSelect(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6 sticky top-6">
      {/* View Options */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">View Options</h3>
        
        {/* Layout Toggle */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Layout</label>
          <div className="grid grid-cols-1 gap-2">
            {[
              { value: 'force-directed', label: 'Network', icon: '🕸️' },
              { value: 'circular', label: 'Circular', icon: '⭕' },
              { value: 'cluster', label: 'Clusters', icon: '🌐' }
            ].map(layout => (
              <button
                key={layout.value}
                onClick={() => onLayoutChange(layout.value as any)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  layoutType === layout.value
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span>{layout.icon}</span>
                {layout.label}
              </button>
            ))}
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="mt-4">
          <label className="text-sm font-medium text-gray-700 mb-2 block">Zoom</label>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
            <button className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
              </svg>
            </button>
            <button className="px-3 py-2 text-xs rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700">
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Search */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Search</h3>
        <div className="relative">
          <input
            type="text"
            placeholder="Search skills or people..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <svg
            className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Filters */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            {showAdvanced ? 'Simple' : 'Advanced'}
          </button>
        </div>

        {/* Category Filters */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700">Categories</label>
          <div className="space-y-2">
            {data.categories.map(category => (
              <label key={category.id} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.categories?.includes(category.id) || false}
                  onChange={() => handleCategoryToggle(category.id)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="ml-2 flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="text-sm text-gray-700">{category.name}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
            {/* Minimum User Count */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Minimum Users ({filters.minUserCount || 1})
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={filters.minUserCount || 1}
                onChange={(e) => handleMinUserCountChange(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1</span>
                <span>10+</span>
              </div>
            </div>
          </div>
        )}

        {/* Clear Filters */}
        {(filters.categories?.length || filters.searchTerm || filters.minUserCount) && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={clearFilters}
              className="w-full px-4 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* Selected Skill Info */}
      {selectedSkill && (
        <div className="pt-4 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Selected Skill</h3>
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="font-medium text-blue-900">
              {data.nodes.find(n => n.id === selectedSkill)?.skillName}
            </div>
            <div className="text-sm text-blue-700 mt-1">
              {data.nodes.find(n => n.id === selectedSkill)?.users.length} people
            </div>
            <button
              onClick={() => onSkillSelect(null)}
              className="text-xs text-blue-600 hover:text-blue-700 mt-2"
            >
              Clear selection
            </button>
          </div>
        </div>
      )}
    </div>
  );
};