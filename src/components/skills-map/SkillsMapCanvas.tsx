'use client';

import { useEffect, useRef, useState } from 'react';
import { SkillMapData, SkillMapNode } from '@/lib/skills-map/types';

interface SkillsMapCanvasProps {
  data: SkillMapData;
  layoutType: 'force-directed' | 'circular' | 'cluster';
  selectedSkill: string | null;
  onSkillSelect: (skillId: string | null) => void;
  onSkillHover: (skillId: string | null) => void;
}

export const SkillsMapCanvas: React.FC<SkillsMapCanvasProps> = ({
  data,
  layoutType,
  selectedSkill,
  onSkillSelect,
  onSkillHover
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{
    skill: SkillMapNode;
    x: number;
    y: number;
  } | null>(null);

  // Simple layout calculation for now (will be enhanced with D3.js later)
  const layoutNodes = (nodes: SkillMapNode[], containerWidth: number, containerHeight: number) => {
    const centerX = containerWidth / 2;
    const centerY = containerHeight / 2;
    const radius = Math.min(containerWidth, containerHeight) * 0.3;

    switch (layoutType) {
      case 'circular':
        return nodes.map((node, index) => {
          const angle = (index / nodes.length) * 2 * Math.PI;
          return {
            ...node,
            position: {
              x: centerX + Math.cos(angle) * radius,
              y: centerY + Math.sin(angle) * radius
            }
          };
        });

      case 'cluster':
        // Group by category
        const categories = [...new Set(nodes.map(n => n.category.id))];
        const nodesWithLayout: SkillMapNode[] = [];
        
        categories.forEach((categoryId, categoryIndex) => {
          const categoryNodes = nodes.filter(n => n.category.id === categoryId);
          const categoryAngle = (categoryIndex / categories.length) * 2 * Math.PI;
          const categoryX = centerX + Math.cos(categoryAngle) * radius * 0.7;
          const categoryY = centerY + Math.sin(categoryAngle) * radius * 0.7;
          
          categoryNodes.forEach((node, nodeIndex) => {
            const nodeAngle = (nodeIndex / categoryNodes.length) * 2 * Math.PI;
            const nodeRadius = 60;
            nodesWithLayout.push({
              ...node,
              position: {
                x: categoryX + Math.cos(nodeAngle) * nodeRadius,
                y: categoryY + Math.sin(nodeAngle) * nodeRadius
              }
            });
          });
        });
        
        return nodesWithLayout;

      default: // force-directed (simplified)
        return nodes.map((node, index) => {
          // Simple grid-like distribution for now
          const cols = Math.ceil(Math.sqrt(nodes.length));
          const row = Math.floor(index / cols);
          const col = index % cols;
          const spacing = 120;
          
          return {
            ...node,
            position: {
              x: centerX - (cols * spacing) / 2 + col * spacing,
              y: centerY - (Math.ceil(nodes.length / cols) * spacing) / 2 + row * spacing
            }
          };
        });
    }
  };

  const handleNodeClick = (node: SkillMapNode) => {
    onSkillSelect(selectedSkill === node.id ? null : node.id);
  };

  const handleNodeHover = (node: SkillMapNode, event: React.MouseEvent) => {
    setHoveredSkill(node.id);
    onSkillHover(node.id);
    
    setTooltip({
      skill: node,
      x: event.clientX,
      y: event.clientY
    });
  };

  const handleNodeLeave = () => {
    setHoveredSkill(null);
    onSkillHover(null);
    setTooltip(null);
  };

  const containerWidth = 800;
  const containerHeight = 600;
  const nodesWithLayout = layoutNodes(data.nodes, containerWidth, containerHeight);

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      {/* Canvas Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Skills Network</h3>
          <p className="text-sm text-gray-600">
            {layoutType === 'force-directed' && 'Connected skills network view'}
            {layoutType === 'circular' && 'Circular arrangement of skills'}
            {layoutType === 'cluster' && 'Skills grouped by categories'}
          </p>
        </div>
        <div className="text-sm text-gray-500">
          {data.nodes.length} skills • {data.edges.length} connections
        </div>
      </div>

      {/* Canvas */}
      <div ref={containerRef} className="relative" style={{ height: '70vh' }}>
        <svg 
          width="100%" 
          height="100%" 
          viewBox={`0 0 ${containerWidth} ${containerHeight}`}
          className="w-full h-full"
        >
          {/* Edges/Connections */}
          {data.edges.map((edge, index) => {
            const sourceNode = nodesWithLayout.find(n => n.id === edge.source);
            const targetNode = nodesWithLayout.find(n => n.id === edge.target);
            
            if (!sourceNode || !targetNode) return null;

            const isHighlighted = selectedSkill === edge.source || selectedSkill === edge.target;
            
            return (
              <line
                key={index}
                x1={sourceNode.position.x}
                y1={sourceNode.position.y}
                x2={targetNode.position.x}
                y2={targetNode.position.y}
                stroke={isHighlighted ? '#3B82F6' : '#D1D5DB'}
                strokeWidth={isHighlighted ? 2 : Math.max(1, edge.strength * 3)}
                opacity={isHighlighted ? 0.8 : 0.4}
                className="transition-all duration-200"
              />
            );
          })}

          {/* Nodes */}
          {nodesWithLayout.map((node) => {
            const isSelected = selectedSkill === node.id;
            const isHovered = hoveredSkill === node.id;
            const isConnected = selectedSkill && data.edges.some(e => 
              (e.source === selectedSkill && e.target === node.id) ||
              (e.target === selectedSkill && e.source === node.id)
            );

            const nodeSize = isSelected || isHovered ? node.size * 1.2 : node.size;
            const opacity = selectedSkill && !isSelected && !isConnected ? 0.3 : 1;

            return (
              <g key={node.id}>
                {/* Node Circle */}
                <circle
                  cx={node.position.x}
                  cy={node.position.y}
                  r={nodeSize / 2}
                  fill={node.category.color}
                  stroke={isSelected ? '#1D4ED8' : 'white'}
                  strokeWidth={isSelected ? 3 : 2}
                  opacity={opacity}
                  className="cursor-pointer transition-all duration-200"
                  onMouseEnter={(e) => handleNodeHover(node, e as any)}
                  onMouseLeave={handleNodeLeave}
                  onClick={() => handleNodeClick(node)}
                />
                
                {/* Node Label */}
                <text
                  x={node.position.x}
                  y={node.position.y + nodeSize / 2 + 16}
                  textAnchor="middle"
                  className="text-xs font-medium fill-gray-700 pointer-events-none"
                  opacity={opacity}
                >
                  {node.skillName.length > 12 
                    ? `${node.skillName.slice(0, 12)}...` 
                    : node.skillName
                  }
                </text>
                
                {/* User Count Badge */}
                <circle
                  cx={node.position.x + nodeSize / 3}
                  cy={node.position.y - nodeSize / 3}
                  r="8"
                  fill="#EF4444"
                  opacity={opacity}
                />
                <text
                  x={node.position.x + nodeSize / 3}
                  y={node.position.y - nodeSize / 3 + 3}
                  textAnchor="middle"
                  className="text-xs font-bold fill-white pointer-events-none"
                  opacity={opacity}
                >
                  {node.users.length}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Tooltip */}
        {tooltip && (
          <div
            className="absolute z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm pointer-events-none"
            style={{
              left: Math.min(tooltip.x - 100, window.innerWidth - 300),
              top: tooltip.y - 100
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: tooltip.skill.category.color }}
              />
              <div className="font-semibold text-gray-900">
                {tooltip.skill.skillName}
              </div>
            </div>
            <div className="text-sm text-gray-600 mb-3">
              {tooltip.skill.category.name} • {tooltip.skill.users.length} people
            </div>
            
            {/* User Avatars */}
            <div className="flex flex-wrap gap-1">
              {tooltip.skill.users.slice(0, 8).map((user, index) => (
                <div
                  key={user.userId}
                  className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600"
                  title={user.name}
                >
                  {user.photoUrl ? (
                    <img 
                      src={user.photoUrl} 
                      alt={user.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    user.name.split(' ').map(n => n[0]).join('').slice(0, 2)
                  )}
                </div>
              ))}
              {tooltip.skill.users.length > 8 && (
                <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs font-medium text-gray-600">
                  +{tooltip.skill.users.length - 8}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};