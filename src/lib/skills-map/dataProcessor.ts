import { ProfileListItem } from '@/lib/firebase/profiles';
import { 
  SkillMapData, 
  SkillMapNode, 
  SkillMapEdge, 
  SkillCategory,
  DEFAULT_SKILL_CATEGORIES 
} from './types';

export class SkillsMapProcessor {
  /**
   * Process profiles data into skills map data structure
   */
  static processProfiles(profiles: ProfileListItem[]): SkillMapData {
    // Step 1: Extract and aggregate skills
    const skillAggregation = this.aggregateSkills(profiles);
    
    // Step 2: Calculate skill connections
    const connections = this.calculateSkillConnections(profiles);
    
    // Step 3: Create nodes and edges
    const nodes = this.createSkillNodes(skillAggregation, profiles);
    const edges = this.createSkillEdges(connections);
    
    // Step 4: Calculate statistics
    const stats = this.calculateStats(nodes, edges);
    
    return {
      nodes,
      edges,
      categories: DEFAULT_SKILL_CATEGORIES,
      stats
    };
  }

  /**
   * Aggregate skills from all profiles
   */
  private static aggregateSkills(profiles: ProfileListItem[]): Map<string, {
    name: string;
    users: Array<{
      userId: string;
      name: string;
      photoUrl?: string;
    }>;
    category: SkillCategory;
  }> {
    const skillMap = new Map();

    profiles.forEach(({ profile, id: userId }) => {
      const skills = profile.core?.mainSkills || [];
      const userName = profile.core?.name || 'Unknown User';
      const photoUrl = profile.core?.photoUrl;

      skills.forEach(skillName => {
        const skillKey = skillName.toLowerCase().trim();
        
        if (!skillMap.has(skillKey)) {
          skillMap.set(skillKey, {
            name: skillName,
            users: [],
            category: this.categorizeSkill(skillName)
          });
        }

        const skill = skillMap.get(skillKey);
        // Avoid duplicate users
        if (!skill.users.some((u: any) => u.userId === userId)) {
          skill.users.push({
            userId,
            name: userName,
            photoUrl
          });
        }
      });
    });

    return skillMap;
  }

  /**
   * Calculate connections between skills based on co-occurrence
   */
  private static calculateSkillConnections(profiles: ProfileListItem[]): Map<string, Map<string, number>> {
    const connections = new Map();

    profiles.forEach(({ profile, id }) => {
      const skills = profile.core?.mainSkills || [];
      
      // For each pair of skills in this profile, increment their connection strength
      for (let i = 0; i < skills.length; i++) {
        for (let j = i + 1; j < skills.length; j++) {
          const skill1 = skills[i].toLowerCase().trim();
          const skill2 = skills[j].toLowerCase().trim();
          
          if (skill1 !== skill2) {
            // Ensure consistent ordering
            const [skillA, skillB] = skill1 < skill2 ? [skill1, skill2] : [skill2, skill1];
            
            if (!connections.has(skillA)) {
              connections.set(skillA, new Map());
            }
            
            const skillAConnections = connections.get(skillA);
            const currentStrength = skillAConnections.get(skillB) || 0;
            skillAConnections.set(skillB, currentStrength + 1);
          }
        }
      }
    });

    return connections;
  }

  /**
   * Create skill nodes for visualization
   */
  private static createSkillNodes(
    skillAggregation: Map<string, any>,
    profiles: ProfileListItem[]
  ): SkillMapNode[] {
    const nodes: SkillMapNode[] = [];
    const maxUsers = Math.max(...Array.from(skillAggregation.values()).map(s => s.users.length));

    skillAggregation.forEach((skill, skillKey) => {
      const userCount = skill.users.length;
      
      nodes.push({
        id: skillKey,
        skillName: skill.name,
        category: skill.category,
        users: skill.users,
        position: { x: 0, y: 0 }, // Will be calculated by layout algorithm
        connections: [], // Will be populated by edges
        size: Math.max(24, Math.min(80, 24 + (userCount / maxUsers) * 56)), // 24-80px range
        popularity: userCount / maxUsers
      });
    });

    return nodes;
  }

  /**
   * Create edges between connected skills
   */
  private static createSkillEdges(connections: Map<string, Map<string, number>>): SkillMapEdge[] {
    const edges: SkillMapEdge[] = [];
    let maxStrength = 0;

    // Find maximum connection strength for normalization
    connections.forEach(skillConnections => {
      skillConnections.forEach(strength => {
        maxStrength = Math.max(maxStrength, strength);
      });
    });

    // Create edges
    connections.forEach((skillConnections, sourceSkill) => {
      skillConnections.forEach((strength, targetSkill) => {
        if (strength >= 2) { // Only show connections with at least 2 co-occurrences
          edges.push({
            source: sourceSkill,
            target: targetSkill,
            strength: strength / maxStrength, // Normalized 0-1
            userCount: strength
          });
        }
      });
    });

    return edges;
  }

  /**
   * Calculate statistics for the skills map
   */
  private static calculateStats(nodes: SkillMapNode[], edges: SkillMapEdge[]) {
    const totalUsers = new Set();
    nodes.forEach(node => {
      node.users.forEach(user => totalUsers.add(user.userId));
    });

    const skillCounts = nodes.map(n => n.users.length);
    const mostPopularNode = nodes.reduce((max, node) => 
      node.users.length > max.users.length ? node : max
    );

    const rareSkills = nodes
      .filter(node => node.users.length === 1)
      .map(node => node.skillName)
      .slice(0, 5); // Top 5 rare skills

    const totalSkillsAcrossUsers = nodes.reduce((total, node) => total + node.users.length, 0);
    const averageSkillsPerPerson = totalSkillsAcrossUsers / totalUsers.size;

    return {
      totalSkills: nodes.length,
      totalConnections: edges.length,
      mostPopularSkill: mostPopularNode?.skillName || '',
      rareSkills,
      averageSkillsPerPerson: Math.round(averageSkillsPerPerson * 10) / 10
    };
  }

  /**
   * Categorize skill based on keywords and patterns
   */
  private static categorizeSkill(skillName: string): SkillCategory {
    const skill = skillName.toLowerCase();
    
    // Technical skills patterns
    const technicalPatterns = [
      'javascript', 'typescript', 'react', 'vue', 'angular', 'node', 'python', 'java', 'c++', 'c#',
      'html', 'css', 'sql', 'mongodb', 'postgresql', 'mysql', 'docker', 'kubernetes', 'aws', 'azure',
      'git', 'jenkins', 'terraform', 'linux', 'windows', 'macos', 'api', 'rest', 'graphql',
      'microservices', 'devops', 'ci/cd', 'testing', 'unit testing', 'integration testing'
    ];

    // Leadership skills patterns
    const leadershipPatterns = [
      'leadership', 'management', 'team lead', 'project management', 'scrum master', 'agile',
      'mentoring', 'coaching', 'strategic planning', 'vision', 'decision making', 'delegation',
      'conflict resolution', 'team building', 'stakeholder management'
    ];

    // Creative skills patterns
    const creativePatterns = [
      'design', 'ui/ux', 'graphic design', 'web design', 'user experience', 'user interface',
      'photoshop', 'illustrator', 'figma', 'sketch', 'creative writing', 'content creation',
      'video editing', 'photography', 'branding', 'marketing design'
    ];

    // Business skills patterns
    const businessPatterns = [
      'business analysis', 'market research', 'financial analysis', 'budgeting', 'forecasting',
      'sales', 'marketing', 'customer success', 'account management', 'negotiation',
      'business development', 'strategy', 'operations', 'product management', 'analytics'
    ];

    // Communication skills patterns
    const communicationPatterns = [
      'communication', 'presentation', 'public speaking', 'writing', 'documentation',
      'training', 'facilitation', 'customer service', 'client relations', 'interpersonal',
      'collaboration', 'cross-functional', 'stakeholder communication'
    ];

    // Check patterns and return appropriate category
    if (technicalPatterns.some(pattern => skill.includes(pattern))) {
      return DEFAULT_SKILL_CATEGORIES.find(c => c.id === 'technical')!;
    }
    if (leadershipPatterns.some(pattern => skill.includes(pattern))) {
      return DEFAULT_SKILL_CATEGORIES.find(c => c.id === 'leadership')!;
    }
    if (creativePatterns.some(pattern => skill.includes(pattern))) {
      return DEFAULT_SKILL_CATEGORIES.find(c => c.id === 'creative')!;
    }
    if (businessPatterns.some(pattern => skill.includes(pattern))) {
      return DEFAULT_SKILL_CATEGORIES.find(c => c.id === 'business')!;
    }
    if (communicationPatterns.some(pattern => skill.includes(pattern))) {
      return DEFAULT_SKILL_CATEGORIES.find(c => c.id === 'communication')!;
    }

    // Default to 'other' category
    return DEFAULT_SKILL_CATEGORIES.find(c => c.id === 'other')!;
  }
}