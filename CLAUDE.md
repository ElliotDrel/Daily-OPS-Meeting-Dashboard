# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm install` - Install dependencies
- `npm run dev` - Start development server with hot reloading
- `npm run build` - Build for production
- `npm run lint` - Run ESLint for code quality checks
- `npm run tests` - Run tests

### Stopping Development Server or Port Issues

If you need to stop a process running on a specific port (e.g., port 8080):

1. **Find the process using the port:**
   ```bash
   netstat -ano | findstr :8080
   ```

2. **Kill the process (Windows):**
   ```bash
   taskkill //PID [PID_NUMBER] //F
   ```
   
   **Note:** Use double forward slashes (`//`) when running in Git Bash to avoid path interpretation issues.

3. **Alternative:** Use Ctrl+C in the terminal where the dev server is running to stop it gracefully.

## Deployment

This application is hosted on **Vercel** with automatic deployments from the main branch. 

**Vercel Configuration**:
- Build Command: `npm run build`
- Output Directory: `dist` (Vite default)
- Node Version: 18.x or higher
- Automatic deployments on push to main branch
- Preview deployments for pull requests

**Vercel-Specific Considerations**:
- SPA routing handled by Vercel's automatic SPA detection
- Environment variables can be set in Vercel dashboard
- Build cache optimization enabled by default
- Edge network deployment for global performance

## Project Architecture

This is a React-based Operations Dashboard for SQCDIP (Safety, Quality, Cost, Delivery, Inventory, Production) metrics tracking, built with:

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

**Page Structure**: Each SQCDIP pillar has its own dedicated page (`/pages/Safety.tsx`, `/pages/Quality.tsx`, etc.) that follows the same layout pattern using `PillarLayout` component.

**Component Organization**:
- `/components/ui/` - Reusable UI components from shadcn/ui
- `/components/dashboard/` - Dashboard-specific components (charts, tables, grids)
- `/components/charts/` - Chart components for data visualization
- `/components/layout/` - Layout components (Header, navigation)
- `/components/pillar/` - Components specific to individual pillar pages

**Data Management**: Mock data is centralized in `/src/data/mockData.ts` with comprehensive interfaces for all data types (GridSquare, ChartData, Incident, ActionItem, MeetingNote).

**Routing Structure**:
- `/` - Dashboard overview with all pillars
- `/safety`, `/quality`, `/cost`, `/inventory`, `/delivery`, `/production` - Individual pillar pages
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

The dashboard uses a pillar-based architecture where each pillar (Safety, Quality, Cost, Delivery, Inventory, Production) has:
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
1. **ALWAYS run the complete verification command sequence** whenever you need to run any development commands: `npm install; npm run build; npm run lint; npm audit; npm run typecheck; npm run analyze; npm run dev`
2. **IMPORTANT**: Always stop the dev server (Ctrl+C) after you get what you need from it - never leave dev servers running
3. Use the existing component patterns and color system
4. Follow the established file naming conventions (PascalCase for components)
5. Maintain the pillar-based architecture when adding new features
6. Keep mock data structure in sync when adding new data types

**Critical Development Command Policy**: 
- Run `npm install; npm run build; npm run lint; npm audit; npm run typecheck; npm run analyze; npm run dev` as a single command sequence
- This ensures dependencies are installed, project builds, linting passes, security audit runs, types are checked, bundle is analyzed, and dev server starts
- **Remember to stop the dev server** after verifying functionality
- Never consider a task complete until this full verification sequence passes successfully

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.