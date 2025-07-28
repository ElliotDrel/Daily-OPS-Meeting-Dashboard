# Pillar Data Collection System - Implementation Plan

## Overview
Create a popup data collection system for each pillar page with dynamic questions stored in Supabase and conditional logic for follow-up questions.

## Database Schema

### Table 1: pillar_questions
```sql
CREATE TABLE pillar_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pillar TEXT NOT NULL CHECK (pillar IN ('safety', 'quality', 'cost', 'delivery', 'inventory', 'production')),
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('boolean', 'number', 'select', 'text', 'textarea', 'multi_select')),
  question_key TEXT NOT NULL,
  options JSONB, -- for select/multi_select questions
  conditional_parent TEXT, -- references another question_key for conditional display
  conditional_value JSONB, -- value that parent must have to show this question
  is_required BOOLEAN DEFAULT true,
  display_order INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(pillar, question_key)
);

-- Table 2: pillar_responses
CREATE TABLE pillar_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pillar TEXT NOT NULL,
  date DATE NOT NULL,
  user_name TEXT NOT NULL,
  question_id UUID REFERENCES pillar_questions(id),
  answer JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(pillar, date, user_name, question_id)
);
```

## Question Specifications by Pillar

### Safety Pillar
1. **Primary Question**: "Were there any safety incidents since the last meeting?"
   - Type: `boolean`
   - Key: `has_incidents`
   - Required: true

2. **Conditional Question**: "How many incidents occurred?"
   - Type: `select`
   - Key: `incident_count`
   - Options: `["1", "2", "3", "4", "5", "6+"]`
   - Conditional: Show only if `has_incidents = true`
   - Required: true

3. **Dynamic Incident Details**: "Describe incident {number}"
   - Type: `textarea`
   - Key: `incident_detail_{index}`
   - Conditional: Show N text boxes based on `incident_count` value
   - Required: true for each incident

### Quality Pillar
1. **Primary Question**: "Has there been any major quality issues?"
   - Type: `boolean`
   - Key: `has_quality_issues`
   - Required: true

### Inventory Pillar
1. **Backlog Models**: "What models are in backlog?"
   - Type: `multi_select`
   - Key: `backlog_models`
   - Options: `["14\"", "16\"", "20\"-small", "20\"-large", "24\"", "26\"", "adult-small", "adult-large"]`
   - Required: false

### Delivery Pillar
1. **Container Expectations**: "How many containers expected today?"
   - Type: `number`
   - Key: `containers_expected`
   - Required: true

### Production Pillar
1. **Planned Output**: "What is the planned output for today?"
   - Type: `number`
   - Key: `planned_output_today`
   - Required: true

2. **Actual Output**: "What was the actual output for yesterday?"
   - Type: `number`
   - Key: `actual_output_yesterday`
   - Required: true

## Implementation Architecture

### File Structure
```
src/
├── components/
│   ├── data/
│   │   ├── DataCollectionModal.tsx      # Main modal component (similar to ActionItemsCard popup)
│   │   ├── DynamicQuestionField.tsx     # Renders different question types
│   │   ├── ConditionalQuestionGroup.tsx # Handles conditional logic
│   │   └── IncidentDetailsForm.tsx      # Special component for safety incidents
│   ├── admin/
│   │   ├── QuestionManager.tsx          # Admin interface for questions
│   │   └── QuestionForm.tsx             # Add/edit questions
├── services/
│   ├── questionService.ts               # Question CRUD operations
│   ├── responseService.ts               # Response CRUD operations
│   └── seedQuestions.ts                 # Initial question seeding
├── hooks/
│   └── usePillarDataOptimized.ts        # EXTEND existing hook to include questions
├── types/
│   └── pillarData.ts                    # TypeScript interfaces
└── lib/
    └── supabase.ts                      # Already exists
```

## Component Logic Flow

### DataCollectionModal Component
1. Receive questions from `usePillarDataOptimized` hook (already loaded)
2. Render questions in display_order using same modal pattern as ActionItemsCard
3. Handle conditional question display based on answers
4. Special handling for Safety pillar dynamic incident details
5. Form validation using Zod
6. Submit all answers to database via existing pillar data service
7. Show success/error feedback using existing toast system

### Updated usePillarDataOptimized Hook
```typescript
// Extend existing hook to return:
return {
  // Existing returns
  meetingNote,
  actionItems,
  yesterdayMeetingNote,
  // ... other existing data
  
  // New returns
  questions,           // Questions for this pillar
  dailyResponses,      // Today's responses (if any)
  isQuestionsLoading,  // Loading state for questions
  submitResponses,     // Function to submit responses
  updateResponses,     // Function to update existing responses
}
```

### Special Case: Safety Incident Details
```typescript
// When incident_count changes, dynamically generate incident detail questions
const generateIncidentQuestions = (count: number) => {
  const questions = [];
  for (let i = 1; i <= count; i++) {
    questions.push({
      key: `incident_detail_${i}`,
      text: `Describe incident ${i}:`,
      type: 'textarea',
      required: true
    });
  }
  return questions;
};
```

## Database Seeding

### Initial Questions Setup
Create a seeding script that populates the `pillar_questions` table with the specified questions for each pillar, including conditional logic setup.

## Integration Points

### Pillar Pages Integration
- Add "Collect Data" button next to the pillar title (e.g., "Production KPI Dashboard") in the same row
- Button opens DataCollectionModal similar to how action items card popup works
- Modal uses same styling and behavior patterns as existing action items modal
- Show indicator if data has already been collected for current date
- Option to edit existing responses

### Data Loading Strategy
- Extend existing `usePillarData` hook to fetch both notes AND questions in a single call
- Questions are fetched once per pillar and cached locally
- Combine questions and responses data in the same API call to reduce network requests
- Store questions in the same data structure as notes for consistency

### Data Display
- Show collected data summary on pillar pages
- Historical view of responses
- Export functionality for collected data

## Technical Considerations

### Form State Management
- Use React Hook Form for complex form handling
- Dynamic field registration for conditional questions
- Real-time validation feedback

### Performance
- Lazy load questions only when modal opens
- Cache questions using TanStack Query
- Debounced auto-save for long forms

### User Experience
- Progress indicator for multi-step forms (especially Safety)
- Auto-save drafts for partially completed forms
- Clear visual feedback for conditional question appearance

## Development Phases

### Phase 1: Core Infrastructure ✅ COMPLETED
1. ✅ Database schema creation (`database/pillar_questions_schema.sql`)
2. ✅ Extend existing `usePillarDataOptimized` hook with questions/responses data
3. ✅ Question seeding script (`src/services/seedQuestions.ts`)
4. ✅ Service layer for questions and responses (`src/services/questionService.ts`, `src/services/responseService.ts`)
5. ✅ TypeScript interfaces (`src/types/pillarData.ts`)

### Phase 2: Basic Modal & UI Integration ✅ COMPLETED
1. ✅ Add "Collect Data" button next to pillar titles (`src/components/pillar/PillarLayout.tsx`)
2. ✅ DataCollectionModal component (following ActionItemsCard popup pattern) (`src/components/data/DataCollectionModal.tsx`)
3. ✅ Simple question rendering and form submission with conditional logic
4. ✅ Update all pillar pages to include pillar prop
5. ✅ Fix React Hook rules and TypeScript linting errors

### Phase 3: Advanced Features ✅ COMPLETED
1. ✅ Conditional question logic (implemented in DataCollectionModal)
2. ✅ Dynamic incident details for Safety (generates questions based on incident count)
3. ✅ Multi-select support for Inventory (backlog models selection)

### Phase 4: Ready for Testing & Deployment 🔄 NEXT STEPS
1. 🔄 **Create Database Tables**: Run `database/pillar_questions_schema.sql` in Supabase SQL Editor
2. 🔄 **Seed Questions**: Execute seeding script to populate initial questions
3. 🔄 **Test System**: Click "Collect Data" buttons and test modal functionality
4. ✅ **Response viewing/editing capability**: Already implemented - shows "Edit Data" when responses exist

## 🎉 **IMPLEMENTATION COMPLETE!**

The **Pillar Data Collection System** is now fully implemented and ready for testing. All requested features have been built:

### ✅ **Core Features Delivered**
- **Database Schema**: Two-table design with conditional question support
- **Dynamic Questions**: Stored in Supabase, fetched and cached locally
- **Modal Integration**: Follows existing ActionItemsCard popup pattern
- **Button Placement**: Next to pillar titles as requested  
- **Data Integration**: Combined with existing notes call in usePillarData hook

### ✅ **Pillar-Specific Questions**
- **Safety**: Boolean → dropdown → dynamic incident detail forms ✅
- **Quality**: Single boolean about major quality issues ✅  
- **Inventory**: Multi-select for backlog models with specified options ✅
- **Delivery**: Number input for expected containers ✅
- **Production**: Two number inputs (planned today, actual yesterday) ✅

### ✅ **Technical Implementation**
- **React Hook Form**: Complex form handling with validation
- **Conditional Logic**: Questions show/hide based on responses
- **TypeScript**: Fully typed with proper interfaces
- **Real-time Updates**: Supabase subscriptions for live data
- **Error Handling**: Comprehensive error handling and loading states
- **Performance**: Optimized queries with caching and prefetching

This system provides a solid foundation for collecting daily operational data across all pillars while maintaining consistency with your existing codebase patterns.