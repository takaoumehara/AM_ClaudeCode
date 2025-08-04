'use client';

import { useState, useEffect, useMemo } from 'react';
import { ProfileListItem } from '@/lib/firebase/profiles';
import { SkillsMapProcessor } from '@/lib/skills-map/dataProcessor';
import { SkillMapData, SkillsMapFilters } from '@/lib/skills-map/types';
import { SkillsMapCanvas } from './SkillsMapCanvas';
import { SkillsMapControls } from './SkillsMapControls';
import { SkillsMapStats } from './SkillsMapStats';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface SkillsMapViewProps {
  profiles: ProfileListItem[];
  loading?: boolean;
}

export const SkillsMapView: React.FC<SkillsMapViewProps> = ({ 
  profiles, 
  loading = false 
}) => {
  const [filters, setFilters] = useState<SkillsMapFilters>({});
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [layoutType, setLayoutType] = useState<'force-directed' | 'circular' | 'cluster'>('force-directed');

  // Process profiles into skills map data
  const skillsMapData = useMemo(() => {
    if (profiles.length === 0) return null;
    
    try {
      return SkillsMapProcessor.processProfiles(profiles);
    } catch (error) {
      console.error('Error processing skills map data:', error);
      return null;
    }
  }, [profiles]);

  // Apply filters to the data
  const filteredData = useMemo(() => {
    if (!skillsMapData) return null;

    let filteredNodes = skillsMapData.nodes;

    // Apply category filter
    if (filters.categories && filters.categories.length > 0) {
      filteredNodes = filteredNodes.filter(node => 
        filters.categories!.includes(node.category.id)
      );
    }

    // Apply minimum user count filter
    if (filters.minUserCount && filters.minUserCount > 1) {
      filteredNodes = filteredNodes.filter(node => 
        node.users.length >= filters.minUserCount!
      );
    }

    // Apply search filter
    if (filters.searchTerm && filters.searchTerm.trim()) {
      const searchLower = filters.searchTerm.toLowerCase();
      filteredNodes = filteredNodes.filter(node =>
        node.skillName.toLowerCase().includes(searchLower) ||
        node.users.some(user => user.name.toLowerCase().includes(searchLower))
      );
    }

    // Filter edges to only include connections between visible nodes
    const visibleSkillIds = new Set(filteredNodes.map(node => node.id));
    const filteredEdges = skillsMapData.edges.filter(edge =>
      visibleSkillIds.has(edge.source) && visibleSkillIds.has(edge.target)
    );

    return {
      ...skillsMapData,
      nodes: filteredNodes,
      edges: filteredEdges
    };
  }, [skillsMapData, filters]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" message="Processing skills data..." />
      </div>
    );
  }

  if (!skillsMapData || skillsMapData.nodes.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
        <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1}
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Skills Data Available</h3>
        <p className="text-gray-600 mb-4">
          Ask team members to add skills to their profiles to see the skills map.
        </p>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Invite People
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Header */}
      <SkillsMapStats data={filteredData || skillsMapData} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Controls Panel - Left Sidebar */}
        <div className="col-span-12 lg:col-span-3">
          <SkillsMapControls
            data={skillsMapData}
            filters={filters}
            onFiltersChange={setFilters}
            layoutType={layoutType}
            onLayoutChange={setLayoutType}
            selectedSkill={selectedSkill}
            onSkillSelect={setSelectedSkill}
          />
        </div>

        {/* Main Visualization */}
        <div className="col-span-12 lg:col-span-9">
          <SkillsMapCanvas
            data={filteredData || skillsMapData}
            layoutType={layoutType}
            selectedSkill={selectedSkill}
            onSkillSelect={setSelectedSkill}
            onSkillHover={(skillId) => {
              // Handle hover effects
            }}
          />
        </div>
      </div>
    </div>
  );
};