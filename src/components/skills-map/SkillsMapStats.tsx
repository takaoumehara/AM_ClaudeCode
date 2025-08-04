'use client';

import { SkillMapData } from '@/lib/skills-map/types';

interface SkillsMapStatsProps {
  data: SkillMapData;
}

export const SkillsMapStats: React.FC<SkillsMapStatsProps> = ({ data }) => {
  const { stats, nodes, categories } = data;

  const categoryStats = categories.map(category => ({
    ...category,
    count: nodes.filter(node => node.category.id === category.id).length
  }));

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {/* Total Skills */}
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {stats.totalSkills}
          </div>
          <div className="text-sm text-gray-600">Total Skills</div>
        </div>

        {/* Total Connections */}
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {stats.totalConnections}
          </div>
          <div className="text-sm text-gray-600">Connections</div>
        </div>

        {/* Average Skills */}
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {stats.averageSkillsPerPerson}
          </div>
          <div className="text-sm text-gray-600">Avg per Person</div>
        </div>

        {/* Most Popular Skill */}
        <div className="text-center md:col-span-2 lg:col-span-1">
          <div className="text-lg font-bold text-orange-600 truncate">
            {stats.mostPopularSkill}
          </div>
          <div className="text-sm text-gray-600">Most Popular</div>
        </div>

        {/* Rare Skills Count */}
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">
            {stats.rareSkills.length}
          </div>
          <div className="text-sm text-gray-600">Rare Skills</div>
        </div>

        {/* Categories Breakdown */}
        <div className="col-span-2 md:col-span-4 lg:col-span-6 mt-4 pt-4 border-t border-gray-200">
          <div className="text-sm font-medium text-gray-700 mb-3">Skills by Category</div>
          <div className="flex flex-wrap gap-3">
            {categoryStats.map(category => (
              <div
                key={category.id}
                className="flex items-center gap-2 px-3 py-1 rounded-full text-sm"
                style={{ backgroundColor: `${category.color}15`, color: category.color }}
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <span className="font-medium">{category.name}</span>
                <span className="text-gray-600">({category.count})</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};