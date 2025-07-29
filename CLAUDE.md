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
1. Use the existing component patterns and color system
2. Follow the established file naming conventions (PascalCase for components)
3. Maintain the pillar-based architecture when adding new features
4. Keep mock data structure in sync when adding new data types

## Database Migration Scripts

### Response Storage Migration System

The application includes a comprehensive migration system to transition from JSONB-based response storage to a normalized relational structure for better performance and analytics capabilities.

**Migration Scripts:**
- `migrate-response-storage.js` - Migrates response data from JSONB to normalized format
- `rollback-response-storage.js` - Rolls back migration by reconstructing JSONB from normalized data
- `clear-and-reset-all-pillar-questions.js` - Resets pillar question configuration
- `clear-and-migrate-notes-actionitems.js` - Migrates notes and action items

**NPM Scripts for Migration:**
```bash
# Run migration with validation
npm run migrate:storage

# Dry-run to preview changes without making them
npm run migrate:storage:dry-run

# Run migration with post-migration validation
npm run migrate:storage:validate

# Rollback the migration
npm run rollback:storage

# Dry-run rollback to preview rollback changes
npm run rollback:storage:dry-run
```

**Migration Process:**
1. **Setup**: Ensure `SUPABASE_SERVICE_KEY` is in `.env.local` (see API settings in Supabase dashboard)
2. **Schema Creation**: Execute `database/pillar_response_values_schema.sql` in Supabase SQL editor
3. **Functions**: Execute `database/pillar_response_migration_functions.sql` in Supabase SQL editor
4. **Test Run**: `npm run migrate:storage:dry-run` to preview changes
5. **Migrate**: `npm run migrate:storage:validate` to migrate with validation
6. **Verify**: Check migration statistics and validate data integrity

**Migration Features:**
- **Batch Processing**: Processes data in configurable batches (default: 100 responses)
- **Error Handling**: Continues processing on individual failures with detailed error reporting
- **Progress Tracking**: Real-time progress updates with ETA calculations
- **Validation**: Built-in data integrity validation comparing original vs migrated data
- **Rollback Safety**: Complete rollback capability to original JSONB format
- **Pillar Filtering**: Migrate specific pillars only using `--pillar=safety` option

**Troubleshooting Migration Issues:**
- If deletions fail due to RLS policies, you may need to add `SUPABASE_SERVICE_KEY` to `.env.local`
- Migration functions require service-level permissions for database operations
- Use `--dry-run` flag to test migrations without making changes
- Check migration statistics with `get_migration_stats()` function in SQL editor
- The scripts will provide detailed error messages and recovery suggestions
- Always backup your data before running migrations

⚠️ **Warning**: Migration scripts perform destructive operations. Always backup your database first.

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.