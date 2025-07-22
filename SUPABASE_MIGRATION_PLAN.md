# Supabase Migration Plan: Live Multi-User Daily OPS Dashboard

## 🎯 Objective
Transform the current JSON-based SQCDIP dashboard into a live, multi-user Supabase-powered system with real-time updates and date-based filtering.

## 🔄 User Experience Goals
- **Live Updates**: Changes appear across all users within 30 seconds
- **Date Navigation**: Switch days and see correct action items/notes instantly
- **Real-time Editing**: Edit notes/items and see changes immediately on all devices
- **Multi-user Sync**: Multiple team members can collaborate simultaneously

---

## Phase 1: Supabase Setup & Configuration

### 1.1 Project Setup
```bash
# Create Supabase project at supabase.com
# Note down:
# - Project URL: https://your-project.supabase.co
# - Anon Key: eyJ...
# - Service Role Key: eyJ... (for admin operations)
```

### 1.2 Environment Variables
Add to `.env.local` and Vercel settings:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_SUPABASE_SERVICE_KEY=your_service_key_here
```

### 1.3 Dependencies
```bash
npm install @supabase/supabase-js
npm install @tanstack/react-query  # For caching and syncing
```

---

## Phase 2: Database Schema Design

### 2.1 Core Tables
Execute in Supabase SQL Editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Meeting Notes Table
CREATE TABLE meeting_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pillar TEXT NOT NULL CHECK (pillar IN ('safety', 'quality', 'cost', 'delivery', 'inventory', 'production')),
  note_date DATE NOT NULL,
  key_points TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT DEFAULT 'system',
  
  -- Indexes for performance
  CONSTRAINT meeting_notes_pillar_date_key UNIQUE (pillar, note_date, id)
);

-- Action Items Table
CREATE TABLE action_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pillar TEXT NOT NULL CHECK (pillar IN ('safety', 'quality', 'cost', 'delivery', 'inventory', 'production')),
  item_date DATE NOT NULL,
  description TEXT NOT NULL,
  assignee TEXT,
  priority TEXT DEFAULT 'Medium' CHECK (priority IN ('High', 'Medium', 'Low')),
  status TEXT DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Completed')),
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT DEFAULT 'system',
  
  -- Indexes for performance
  CONSTRAINT action_items_pillar_date_key UNIQUE (pillar, item_date, id)
);

-- Indexes for date-based queries
CREATE INDEX idx_meeting_notes_pillar_date ON meeting_notes (pillar, note_date);
CREATE INDEX idx_action_items_pillar_date ON action_items (pillar, item_date);
CREATE INDEX idx_meeting_notes_updated_at ON meeting_notes (updated_at DESC);
CREATE INDEX idx_action_items_updated_at ON action_items (updated_at DESC);
```

### 2.2 Row Level Security (RLS)
```sql
-- Enable RLS
ALTER TABLE meeting_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_items ENABLE ROW LEVEL SECURITY;

-- Policies for public read/write (adjust based on your auth needs)
CREATE POLICY "Public can read meeting_notes" ON meeting_notes
  FOR SELECT USING (true);

CREATE POLICY "Public can insert meeting_notes" ON meeting_notes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can update meeting_notes" ON meeting_notes
  FOR UPDATE USING (true);

CREATE POLICY "Public can delete meeting_notes" ON meeting_notes
  FOR DELETE USING (true);

-- Same policies for action_items
CREATE POLICY "Public can read action_items" ON action_items
  FOR SELECT USING (true);

CREATE POLICY "Public can insert action_items" ON action_items
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can update action_items" ON action_items
  FOR UPDATE USING (true);

CREATE POLICY "Public can delete action_items" ON action_items
  FOR DELETE USING (true);
```

### 2.3 Real-time Setup
```sql
-- Enable real-time for tables
ALTER PUBLICATION supabase_realtime ADD TABLE meeting_notes;
ALTER PUBLICATION supabase_realtime ADD TABLE action_items;
```

---

## Phase 3: Data Migration

### 3.1 Migration Script
Create `scripts/migrate-to-supabase.js`:

```javascript
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_KEY
);

async function migrateData() {
  // Read existing JSON files
  const meetingNotesData = JSON.parse(
    fs.readFileSync('public/data/meetingNotes.json', 'utf8')
  );
  const actionItemsData = JSON.parse(
    fs.readFileSync('public/data/actionItems.json', 'utf8')
  );

  // Transform and insert meeting notes
  for (const note of meetingNotesData.meetingNotes) {
    await supabase.from('meeting_notes').insert({
      pillar: note.pillar,
      note_date: note.createdDate,
      key_points: note.keyPoints,
      created_at: note.createdDate + 'T09:00:00Z'
    });
  }

  // Transform and insert action items
  for (const item of actionItemsData.actionItems) {
    await supabase.from('action_items').insert({
      pillar: item.pillar,
      item_date: item.createdDate,
      description: item.description,
      assignee: item.assignee,
      priority: item.priority,
      status: item.status,
      due_date: item.dueDate,
      created_at: item.createdDate + 'T09:00:00Z'
    });
  }
}
```

---

## Phase 4: Code Architecture Changes

### 4.1 Supabase Client Setup
Create `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

export type Database = {
  public: {
    Tables: {
      meeting_notes: {
        Row: {
          id: string;
          pillar: string;
          note_date: string;
          key_points: string;
          created_at: string;
          updated_at: string;
          created_by: string;
        };
        Insert: Omit<Database['public']['Tables']['meeting_notes']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['meeting_notes']['Insert']>;
      };
      action_items: {
        Row: {
          id: string;
          pillar: string;
          item_date: string;
          description: string;
          assignee: string | null;
          priority: string;
          status: string;
          due_date: string | null;
          created_at: string;
          updated_at: string;
          created_by: string;
        };
        Insert: Omit<Database['public']['Tables']['action_items']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['action_items']['Insert']>;
      };
    };
  };
};
```

### 4.2 Real-time Data Hooks
Replace `src/hooks/usePillarData.ts`:

```typescript
import { useEffect, useState, useCallback } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/supabase';

type MeetingNote = Database['public']['Tables']['meeting_notes']['Row'];
type ActionItem = Database['public']['Tables']['action_items']['Row'];

export const usePillarData = (pillar: string, selectedDate: string) => {
  const queryClient = useQueryClient();
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);

  // Query for meeting notes
  const { data: meetingNotes = [], isLoading: notesLoading } = useQuery({
    queryKey: ['meeting-notes', pillar, selectedDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meeting_notes')
        .select('*')
        .eq('pillar', pillar)
        .eq('note_date', selectedDate)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000, // Poll every 30 seconds as backup
  });

  // Query for action items
  const { data: actionItems = [], isLoading: itemsLoading } = useQuery({
    queryKey: ['action-items', pillar, selectedDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('action_items')
        .select('*')
        .eq('pillar', pillar)
        .eq('item_date', selectedDate)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
  });

  // Real-time subscriptions
  useEffect(() => {
    const channel = supabase
      .channel(`pillar-${pillar}-${selectedDate}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'meeting_notes',
          filter: `pillar=eq.${pillar}`
        },
        (payload) => {
          console.log('Real-time meeting note update:', payload);
          // Only invalidate if the change affects our current date
          const changedDate = payload.new?.note_date || payload.old?.note_date;
          if (changedDate === selectedDate) {
            queryClient.invalidateQueries(['meeting-notes', pillar, selectedDate]);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'action_items',
          filter: `pillar=eq.${pillar}`
        },
        (payload) => {
          console.log('Real-time action item update:', payload);
          const changedDate = payload.new?.item_date || payload.old?.item_date;
          if (changedDate === selectedDate) {
            queryClient.invalidateQueries(['action-items', pillar, selectedDate]);
          }
        }
      )
      .subscribe((status) => {
        console.log('Real-time subscription status:', status);
        setIsRealtimeConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [pillar, selectedDate, queryClient]);

  // Mutations
  const createNoteMutation = useMutation({
    mutationFn: async (noteData: { key_points: string }) => {
      const { data, error } = await supabase
        .from('meeting_notes')
        .insert({
          pillar,
          note_date: selectedDate,
          key_points: noteData.key_points,
          created_by: 'user'
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['meeting-notes', pillar, selectedDate]);
    }
  });

  const updateNoteMutation = useMutation({
    mutationFn: async ({ id, key_points }: { id: string; key_points: string }) => {
      const { data, error } = await supabase
        .from('meeting_notes')
        .update({ 
          key_points,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['meeting-notes', pillar, selectedDate]);
    }
  });

  const createItemMutation = useMutation({
    mutationFn: async (itemData: {
      description: string;
      assignee?: string;
      priority?: string;
      status?: string;
      due_date?: string;
    }) => {
      const { data, error } = await supabase
        .from('action_items')
        .insert({
          pillar,
          item_date: selectedDate,
          ...itemData,
          created_by: 'user'
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['action-items', pillar, selectedDate]);
    }
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; [key: string]: any }) => {
      const { data, error } = await supabase
        .from('action_items')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['action-items', pillar, selectedDate]);
    }
  });

  return {
    meetingNotes,
    actionItems,
    isLoading: notesLoading || itemsLoading,
    isRealtimeConnected,
    createNote: createNoteMutation.mutate,
    updateNote: updateNoteMutation.mutate,
    createItem: createItemMutation.mutate,
    updateItem: updateItemMutation.mutate,
    refetch: useCallback(() => {
      queryClient.invalidateQueries(['meeting-notes', pillar, selectedDate]);
      queryClient.invalidateQueries(['action-items', pillar, selectedDate]);
    }, [pillar, selectedDate, queryClient])
  };
};
```

### 4.3 React Query Setup
Update `src/main.tsx`:

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // 30 seconds
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <DateProvider>
        <Router>
          {/* Your existing app */}
        </Router>
      </DateProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

---

## Phase 5: UI Enhancements

### 5.1 Real-time Status Indicator
Add to your navbar component:

```typescript
const RealtimeStatus = ({ isConnected }: { isConnected: boolean }) => {
  return (
    <div className="flex items-center gap-2">
      <div 
        className={`w-2 h-2 rounded-full ${
          isConnected ? 'bg-green-500' : 'bg-red-500'
        }`}
      />
      <span className="text-xs text-gray-600">
        {isConnected ? 'Live' : 'Offline'}
      </span>
    </div>
  );
};
```

### 5.2 Loading States
Update your components to show loading states:

```typescript
const { meetingNotes, actionItems, isLoading, isRealtimeConnected } = usePillarData(pillar, selectedDate);

if (isLoading) {
  return <div className="animate-pulse">Loading...</div>;
}
```

### 5.3 Optimistic Updates
For better UX, show changes immediately while syncing in background:

```typescript
const handleUpdateNote = (id: string, keyPoints: string) => {
  // Optimistic update
  queryClient.setQueryData(['meeting-notes', pillar, selectedDate], (old: MeetingNote[]) =>
    old?.map(note => 
      note.id === id 
        ? { ...note, key_points: keyPoints, updated_at: new Date().toISOString() }
        : note
    ) || []
  );
  
  // Then sync with server
  updateNote({ id, key_points: keyPoints });
};
```

---

## Phase 6: Testing Strategy

### 6.1 Unit Tests
```typescript
// Test Supabase queries
import { renderHook, waitFor } from '@testing-library/react';
import { usePillarData } from '@/hooks/usePillarData';

test('should load meeting notes for pillar and date', async () => {
  const { result } = renderHook(() => 
    usePillarData('safety', '2025-07-22')
  );
  
  await waitFor(() => {
    expect(result.current.meetingNotes).toHaveLength(2);
  });
});
```

### 6.2 Integration Tests
```typescript
// Test real-time updates
test('should update data when another user makes changes', async () => {
  // Simulate external database change
  // Verify component reflects the change
});
```

### 6.3 Load Testing
- Test with multiple concurrent users
- Verify real-time updates work under load
- Check database performance with indexes

---

## Phase 7: Vercel Deployment & Optimization

### 7.1 Vercel-Specific Environment Setup
```bash
# Add to Vercel dashboard (Settings > Environment Variables)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_SUPABASE_SERVICE_KEY=your_service_key_here  # Only for migration scripts

# Vercel automatically detects Vite projects
# Build Command: npm run build (auto-detected)
# Output Directory: dist (auto-detected)
# Install Command: npm install (auto-detected)
```

### 7.2 Vercel Performance Optimization
Create `vercel.json` for advanced configuration:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "functions": {
    "app/api/health.js": {
      "maxDuration": 10
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "s-maxage=0, stale-while-revalidate" }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### 7.3 Edge-Optimized Supabase Client
Update `src/lib/supabase.ts` for Vercel Edge:

```typescript
import { createClient } from '@supabase/supabase-js';

// Vercel Edge-optimized configuration
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      storageKey: 'ops-dashboard-auth',
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    },
    // Optimize for Vercel's global edge network
    global: {
      headers: { 'x-client-info': 'vercel-ops-dashboard' },
    },
  }
);
```

### 7.4 Vercel Analytics Integration
```bash
npm install @vercel/analytics
```

Add to `src/main.tsx`:
```typescript
import { Analytics } from '@vercel/analytics/react';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <DateProvider>
        <Router>
          {/* Your app */}
        </Router>
      </DateProvider>
      <Analytics />
    </QueryClientProvider>
  );
}
```

### 7.5 Serverless Function Cleanup
Since Supabase handles all backend logic:

```bash
# Remove these files (no longer needed)
rm -rf api/
rm -rf pages/api/ # If exists from Next.js migration
```

### 7.6 Build Optimization
Update `vite.config.ts` for Vercel:

```typescript
export default defineConfig({
  plugins: [react()],
  build: {
    // Vercel-optimized build settings
    target: 'es2015',
    minify: 'esbuild',
    sourcemap: false, // Disable in production for smaller bundles
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js'],
          charts: ['recharts'],
        }
      }
    }
  },
  server: {
    host: "::",
    port: 8080,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

### 7.7 Performance Monitoring
- Enable Vercel Web Analytics for performance metrics
- Monitor Supabase dashboard for database performance
- Set up Vercel deployment notifications

---

## Phase 8: Rollout Plan

### 8.1 Gradual Migration
1. **Week 1**: Set up Supabase, migrate data, test locally
2. **Week 2**: Deploy to staging, test real-time features
3. **Week 3**: Production deployment with JSON fallback
4. **Week 4**: Remove JSON fallback, full Supabase mode

### 8.2 Rollback Plan
- Keep JSON files as backup during initial rollout
- Document rollback procedures
- Monitor error rates and performance

---

## 🎯 Success Metrics

### Real-time Performance
- ✅ Changes appear within 30 seconds across all users
- ✅ Real-time connection uptime > 99%
- ✅ Database query response time < 100ms
- ✅ Zero data loss during concurrent edits

### User Experience
- ✅ Smooth date navigation with instant data loading
- ✅ Optimistic updates for immediate feedback
- ✅ Clear loading and connection status indicators
- ✅ Multi-user collaboration without conflicts

### Technical Reliability
- ✅ Automatic failover and reconnection
- ✅ Proper error handling and user feedback
- ✅ Data consistency across all clients
- ✅ Scalable architecture for team growth

---

## 🚀 Next Steps

1. **Create Supabase project and run Phase 1 setup**
2. **Execute database schema from Phase 2**
3. **Implement Supabase client and hooks from Phase 4**
4. **Test real-time functionality locally**
5. **Deploy to staging environment**
6. **Production rollout with monitoring**

This plan transforms your dashboard into a truly collaborative, real-time system while maintaining all existing functionality and improving the user experience significantly.