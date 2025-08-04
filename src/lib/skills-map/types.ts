export interface SkillCategory {
  id: string;
  name: string;
  color: string;
  icon?: string;
}

export interface UserSkill {
  skillId: string;
  skillName: string;
  proficiency?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  yearsExperience?: number;
  lastUsed?: Date;
  endorsed?: boolean;
}

export interface SkillMapNode {
  id: string;
  skillName: string;
  category: SkillCategory;
  users: Array<{
    userId: string;
    name: string;
    photoUrl?: string;
    proficiency?: string;
  }>;
  position: { x: number; y: number };
  connections: string[]; // Connected skill IDs
  size: number; // Based on user count
  popularity: number; // Normalized user count (0-1)
}

export interface SkillMapEdge {
  source: string;
  target: string;
  strength: number; // Connection strength (0-1)
  userCount: number; // Number of users with both skills
}

export interface SkillMapData {
  nodes: SkillMapNode[];
  edges: SkillMapEdge[];
  categories: SkillCategory[];
  stats: {
    totalSkills: number;
    totalConnections: number;
    mostPopularSkill: string;
    rareSkills: string[];
    averageSkillsPerPerson: number;
  };
}

export interface SkillsMapFilters {
  categories?: string[];
  proficiencyLevels?: string[];
  teams?: string[];
  userIds?: string[];
  minUserCount?: number;
  searchTerm?: string;
}

export interface LayoutConfig {
  type: 'force-directed' | 'circular' | 'hierarchical' | 'cluster';
  nodeSize: (node: SkillMapNode) => number;
  nodeColor: (node: SkillMapNode) => string;
  linkStrength: (edge: SkillMapEdge) => number;
  simulation: {
    forceStrength: number;
    centerForce: number;
    repelForce: number;
  };
}

export const DEFAULT_SKILL_CATEGORIES: SkillCategory[] = [
  { id: 'technical', name: 'Technical', color: '#3B82F6', icon: 'code' },
  { id: 'leadership', name: 'Leadership', color: '#8B5CF6', icon: 'users' },
  { id: 'creative', name: 'Creative', color: '#EC4899', icon: 'palette' },
  { id: 'business', name: 'Business', color: '#10B981', icon: 'briefcase' },
  { id: 'communication', name: 'Communication', color: '#F59E0B', icon: 'chat' },
  { id: 'other', name: 'Other', color: '#6B7280', icon: 'dots' },
];