import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

async function migrate() {
  console.log('Starting migration...')

  try {
    // Read existing JSON data
    const meetingNotesData = JSON.parse(
      fs.readFileSync('src/data/meetingNotes.json', 'utf8')
    )
    const actionItemsData = JSON.parse(
      fs.readFileSync('src/data/actionItems.json', 'utf8')
    )

    // Migrate meeting notes
    console.log(`Migrating ${meetingNotesData.meetingNotes.length} meeting notes...`)
    for (const note of meetingNotesData.meetingNotes) {
      const { error } = await supabase
        .from('meeting_notes')
        .insert({
          pillar: note.pillar,
          note_date: note.createdDate,
          key_points: note.keyPoints.join('\n'),
          created_at: `${note.createdDate}T09:00:00Z`
        })
      
      if (error) {
        console.error('Error inserting note:', error)
      }
    }

    // Migrate action items
    console.log(`Migrating ${actionItemsData.actionItems.length} action items...`)
    for (const item of actionItemsData.actionItems) {
      const { error } = await supabase
        .from('action_items')
        .insert({
          pillar: item.pillar,
          item_date: item.createdDate,
          description: item.description,
          assignee: item.assignee || null,
          priority: item.priority || 'Medium',
          status: item.status || 'Open',
          due_date: item.dueDate || null,
          created_at: `${item.createdDate}T09:00:00Z`
        })
      
      if (error) {
        console.error('Error inserting item:', error)
      }
    }

    console.log('Migration completed successfully!')

  } catch (error) {
    console.error('Migration failed:', error)
  }
}

migrate()