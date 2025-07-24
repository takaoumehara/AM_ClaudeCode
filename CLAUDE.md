# Project Context for Claude Code

@docs/prd.md
@docs/architecture.md
@docs/ux.md
@docs/nicetohave.md

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## BMad Method Framework

This repository contains the BMad Method - a universal AI agent framework for structured agile development and domain-specific workflows. The framework enables AI agents to perform complex, multi-phase planning and development cycles.

## Project Structure

The main project is located in `BMAD-METHOD-main/` with the following key components:

### Core Framework (`bmad-core/`)
- **agents/**: AI agent definitions (PM, Architect, Dev, QA, etc.) with embedded YAML configurations
- **agent-teams/**: Team bundles combining multiple agents for specific use cases
- **workflows/**: YAML-defined sequences for project types (greenfield, brownfield)
- **templates/**: Markdown templates for PRDs, architecture docs, user stories
- **tasks/**: Reusable task definitions for document creation, sharding, validation
- **checklists/**: Quality assurance checklists for different agent roles
- **data/**: Knowledge base and technical preferences

### Build System (`tools/`)
- **cli.js**: Main CLI interface for build commands
- **builders/web-builder.js**: Creates web bundles from agent definitions
- **installers/**: Project installation and setup tools

### Distribution (`dist/`)
- Pre-built agent and team bundles for web UI platforms

## Common Commands

### Build and Validation
```bash
# Build all components
npm run build

# Build only agents
npm run build:agents

# Build only teams  
npm run build:teams

# Validate configurations
npm run validate

# List available agents
npm run list:agents
```

### Installation and Setup
```bash
# Install BMad Method to a project
npm run install:bmad

# Interactive installation (recommended)
npx bmad-method install
```

### Code Quality
```bash
# Format markdown files
npm run format

# Uses prettier for markdown formatting
```

### Version Management
```bash
# Patch version bump
npm run version:patch

# Minor version bump
npm run version:minor

# Major version bump
npm run version:major
```

## Development Workflow

### Two-Phase Approach

1. **Planning Phase (Web UI)**: Use pre-built bundles from `dist/teams/` with web AI platforms
   - Analyst: Market research and project briefs
   - PM: Product requirements documents (PRDs)
   - Architect: System architecture design
   - PO: Validation and epic/story alignment

2. **Development Phase (IDE)**: Use individual agents in local development
   - Document sharding via PO agent
   - SM (Scrum Master): Story creation and refinement
   - Dev: Sequential task implementation
   - QA: Code review and quality assurance

### Key Architecture Concepts

- **Agent Dependencies**: Each agent defines required templates, tasks, and data files via YAML
- **Template Processing**: Self-contained templates with embedded AI instructions
- **Context Engineering**: Stories contain complete implementation context
- **Technical Preferences**: Centralized preferences in `bmad-core/data/technical-preferences.md`

## Configuration Files

### Core Config (`bmad-core/core-config.yaml`)
- **devLoadAlwaysFiles**: Files the dev agent always loads for context
- **markdownExploder**: Enable/disable document processing features
- **prd/architecture**: Document locations and sharding configuration

### Cursor Rules (`.cursor/rules/`)
Contains agent-specific rule files (bmad-orchestrator.mdc, dev.mdc, etc.) for Cursor IDE integration.

## Key Features

- **Expansion Packs**: Domain-specific extensions beyond software development
- **Brownfield Support**: Works with existing codebases via specialized workflows
- **Multi-Environment**: Supports both web AI platforms and local IDEs
- **Quality Assurance**: Built-in checklists and validation workflows
- **Context Management**: Lean, focused agent contexts with dependency resolution