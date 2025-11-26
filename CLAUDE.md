# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Development Commands

```bash
pnpm dev          # Start development server (localhost:3000)
pnpm build        # Build for production
pnpm lint         # Run ESLint
```

No test framework is currently configured.

## Architecture

Next.js 16 application that embeds Power BI reports with visual creation/editing and filtering capabilities.

**Stack:** React 19 (with React Compiler), TypeScript (strict mode), Tailwind CSS v4, pnpm

### Data Flow

1. **Authentication**: API route (`src/app/api/powerbi/route.ts`) authenticates with Azure AD using MSAL client credentials flow
2. **Embedding**: `PowerBIProvider` context fetches embed config and initializes the Power BI report
3. **Interaction**: User interacts via drawers (Pages, Visuals, Filters) - each drawer is a separate component
4. **Operations**: Visual/filter changes use Power BI JavaScript API via utility functions in `src/lib/`

### Key Patterns

**Context-Based State Management** (`src/contexts/PowerBIContext.tsx`):
- Centralized state using `useReducer` for predictable updates
- `usePowerBI()` hook provides access to state and actions
- State includes: `report`, `pages`, `currentPageIndex`, `editingVisual`, drawer states

**Component Composition** (`src/components/PowerBI/`):
- `PowerBIReport` - Main orchestrator, wraps everything in Provider + ErrorBoundary
- `PowerBIContainer` - Just the embed container
- `PowerBIToolbar` - Floating action buttons
- `PowerBI*Drawer` - Each drawer is self-contained with its own logic

**Type Safety** (`src/lib/powerbi-type-guards.ts`):
- Power BI API has runtime methods not in TypeScript definitions
- Type guards for capability detection: `hasDeletePageCapability()`, `hasVisualDeleteCapability()`
- Safe casting: `asExtendedVisual()`, `asExtendedPage()`
- Runtime method detection with `typeof obj.method === "function"` before calling

**Filter System** (`src/types/powerbi-filters.ts`):
- `BasicFilter` - Works with columns only, uses "In"/"NotIn" operators
- `AdvancedFilter` - Works with columns and measures, supports conditions
- `buildFilter(config)` converts app FilterConfig to Power BI filter objects

**Form Builder** (`src/components/form-builder/`):
- Generic form system using React Hook Form + Zod validation
- Used by `VisualBuilder.tsx` and `FilterBuilder.tsx`

### Configuration

**Centralized Config** (`src/config/powerbi.config.ts`):
- `POWERBI_EMBED_CONFIG` - Embed settings (minPageIndex, tokenLifetime)
- `VISUAL_DEFAULTS` - Default visual dimensions
- `PAGE_CONFIG` - Page management settings

**Constants** (`src/constants/`):
- Re-exports from config for backward compatibility
- `COMMON_DATA_ROLES` - Data role names for visual discovery

## Environment Variables

Required in `.env.local`:
```
POWERBI_CLIENT_ID=<Azure AD app client ID>
POWERBI_CLIENT_SECRET=<Azure AD app client secret>
POWERBI_TENANT_ID=<Azure AD tenant ID>
POWERBI_AUTHORITY_URL=<Azure AD authority base URL>
POWERBI_SCOPE=<Power BI API scope>
POWERBI_WORKSPACE_ID=<Power BI workspace ID>
POWERBI_REPORT_ID=<Power BI report ID>
```

## Key Technical Notes

- Power BI library loads from CDN and creates global `window.powerbi`
- Global types extended in `src/types/powerbi.ts` for Window interface
- Report embeds in View mode with edit permissions (allows API modifications)
- Custom context menu commands "editVisual" and "deleteVisual" registered via embed extensions
- Cross-origin errors may occur with certain iframe operations - catch and handle gracefully
- Path alias: `@/*` maps to `./src/*`
