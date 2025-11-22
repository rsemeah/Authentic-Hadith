# Authentic Hadith VS Code Extension

This is the VS Code extension implementation of Authentic Hadith Assistant.

## Features

### Phase 1: Core Experience
- **Onboarding Wizard**: Multi-step setup for new users
- **Dashboard**: Daily progress tracking and quick access
- **Notes System**: Create, edit, and export markdown notes
- **Bookmarks**: Save favorite hadiths for later review

### Phase 2: Learning & Discovery
- **Search**: Advanced hadith search with filters
- **Topics**: Browse hadiths by topic categories
- **Learning Mode**: Interactive daily learning sessions
- **Review Queue**: Spaced repetition system for retention
- **AI Assistant**: Get help understanding hadiths

## Installation

1. Install dependencies: `npm install`
2. Compile: `npm run compile`
3. Press F5 in VS Code to launch Extension Development Host

## Development

- **Entry Point**: `src/extension.ts`
- **Services**: Located in `src/services/`
- **Panels**: Located in `src/panels/`
- **Sample Data**: `src/data/sampleHadiths.ts`

## Architecture

All backend integrations are currently stubbed. Data is stored using:
- VS Code Configuration API (global settings)
- Extension GlobalState (ephemeral data)

Future integration points marked with TODO comments for:
- Supabase backend
- islam.io API
- SilentEngine AI

## Commands

All commands are prefixed with `Authentic Hadith:` in the Command Palette:
- Start Onboarding
- Open Dashboard
- Open Notes
- Export Notes to Markdown
- Open Bookmarks
- Toggle Bookmark
- Open Search
- Browse Topics
- Start Learning
- Open Review Queue
- Open AI Assistant
