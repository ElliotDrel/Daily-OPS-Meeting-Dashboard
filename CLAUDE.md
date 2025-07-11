# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with hot reloading
- `npm run build` - Build for production
- `npm run build:dev` - Build for development mode
- `npm run lint` - Run ESLint for code quality checks
- `npm run preview` - Preview production build locally

## Project Architecture

This is a React-based Operations Dashboard for SQCDP (Safety, Quality, Cost, Delivery, People) metrics tracking, built with:

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with shadcn/ui components (built on Radix UI primitives)
- **Routing**: React Router DOM
- **State Management**: React hooks and TanStack Query
- **Charts**: Recharts for data visualization
- **Animation**: Framer Motion
- **Form Handling**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Notifications**: Sonner (toast notifications)

### Key Architecture Patterns

**Page Structure**: Each SQCDP pillar has its own dedicated page (`/pages/Safety.tsx`, `/pages/Quality.tsx`, etc.) that follows the same layout pattern using `PillarLayout` component.

**Component Organization**:
- `/components/ui/` - Reusable UI components from shadcn/ui
- `/components/dashboard/` - Dashboard-specific components (charts, tables, grids)
- `/components/charts/` - Chart components for data visualization
- `/components/layout/` - Layout components (Header, navigation)
- `/components/pillar/` - Components specific to individual pillar pages

**Data Management**: Mock data is centralized in `/src/data/mockData.ts` with comprehensive interfaces for all data types (GridSquare, ChartData, Incident, ActionItem, MeetingNote).

**Routing Structure**:
- `/` - Dashboard overview with all pillars
- `/safety`, `/quality`, `/cost`, `/inventory`, `/delivery`, `/people` - Individual pillar pages
- `/graph-view` - Alternative visualization view
- Each pillar page uses the same PillarLayout with pillar-specific data

**Color System**: Status-based color coding throughout:
- `good` - Green (successful metrics)
- `caution` - Yellow (warning metrics)  
- `issue` - Red (problematic metrics)
- `future` - Gray (upcoming/planned items)

**Key Components**:
- `LetterGrid` - Main pillar visualization with status squares
- `PillarLayout` - Shared layout for all pillar pages with calendar and navigation
- Chart components use Recharts for consistent data visualization
- `ActionItemsSection` and `NotesSection` for managing operational data

### Data Flow

The dashboard uses a pillar-based architecture where each pillar (Safety, Quality, Cost, Delivery, People, Inventory) has:
- Status grid showing daily performance
- Chart data for trend analysis
- Incident tracking
- Action items management
- Meeting notes storage

All data is currently mock data generated programmatically in `/src/data/mockData.ts` but is structured to easily integrate with real APIs.

### Development Configuration

**Path Aliases**: The project uses `@/` as an alias for `./src/` directory for cleaner imports.

**Key TypeScript Interfaces**:
```typescript
interface GridSquare {
  status: 'good' | 'caution' | 'issue' | 'future';
  date: string;
  value: number;
  label?: string;
}

interface ActionItem {
  id: string;
  description: string;
  assignee: string;
  priority: 'High' | 'Medium' | 'Low';
  dueDate: string;
  status: 'Open' | 'In Progress' | 'Completed';
}
```

**Component Patterns**:
- Functional components with TypeScript interfaces
- Props destructuring with default values
- Consistent use of shadcn/ui components for UI consistency
- Framer Motion for animations and transitions

### Development Workflow

When working with this codebase:
1. Always run `npm run lint` before committing changes
2. Use the existing component patterns and color system
3. Follow the established file naming conventions (PascalCase for components)
4. Maintain the pillar-based architecture when adding new features
5. Keep mock data structure in sync when adding new data types

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.