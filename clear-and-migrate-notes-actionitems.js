import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

// Use service key for server-side operations
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
)

// Convert "Jul 22, 2025" format to "2025-07-22" ISO format
function convertToISODate(dateString) {
  const date = new Date(dateString)
  if (isNaN(date.getTime())) {
    console.error(`Invalid date format: ${dateString}`)
    throw new Error(`Invalid date format: ${dateString}`)
  }
  return date.toISOString().slice(0, 10)
}

async function clearAndMigrate() {
  console.log('Starting clear and migration...')

  try {
    // Clear existing data
    console.log('Clearing existing meeting notes...')
    const { error: notesDeleteError } = await supabase
      .from('meeting_notes')
      .delete()
      .not('id', 'is', null) // Delete all records

    if (notesDeleteError) {
      console.error('Error clearing meeting notes:', notesDeleteError)
    }

    console.log('Clearing existing action items...')
    const { error: itemsDeleteError } = await supabase
      .from('action_items')
      .delete()
      .not('id', 'is', null) // Delete all records

    if (itemsDeleteError) {
      console.error('Error clearing action items:', itemsDeleteError)
    }

    // Read existing JSON data
    const meetingNotesData = JSON.parse(
      fs.readFileSync('src/data/meetingNotes.json', 'utf8')
    )
    const actionItemsData = JSON.parse(
      fs.readFileSync('src/data/actionItems.json', 'utf8')
    )

    // Migrate meeting notes with correct date format
    console.log(`Migrating ${meetingNotesData.meetingNotes.length} meeting notes...`)
    for (const note of meetingNotesData.meetingNotes) {
      const { error } = await supabase
        .from('meeting_notes')
        .insert({
          pillar: note.pillar,
          note_date: convertToISODate(note.createdDate),
          key_points: note.keyPoints.join('\n'),
          created_at: `${convertToISODate(note.createdDate)}T09:00:00Z`
        })
      
      if (error) {
        console.error('Error inserting note:', error)
      }
    }

    // Migrate action items with correct date format
    console.log(`Migrating ${actionItemsData.actionItems.length} action items...`)
    for (const item of actionItemsData.actionItems) {
      const { error } = await supabase
        .from('action_items')
        .insert({
          pillar: item.pillar,
          item_date: convertToISODate(item.createdDate),
          description: item.description,
          assignee: item.assignee || null,
          priority: item.priority || 'Medium',
          status: item.status || 'Open',
          due_date: item.dueDate || null,
          created_at: `${convertToISODate(item.createdDate)}T09:00:00Z`
        })
      
      if (error) {
        console.error('Error inserting item:', error)
      }
    }

    console.log('Clear and migration completed successfully!')
    console.log('Date format conversion example:')
    console.log(`  "Jul 22, 2025" -> "${convertToISODate('Jul 22, 2025')}"`)

  } catch (error) {
    console.error('Clear and migration failed:', error)
  }
}

clearAndMigrate()