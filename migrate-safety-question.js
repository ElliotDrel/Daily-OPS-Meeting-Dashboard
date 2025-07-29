import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

// Use service key for server-side operations
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY
)

async function addSafetyIncidentDescription() {
  console.log('Adding Safety incident description question...')

  try {
    // Insert the new safety incident description question
    const { data, error } = await supabase
      .from('pillar_questions')
      .upsert({
        pillar: 'safety',
        question_id: 'safety-incident-description',
        question_text: 'Please describe the safety incident(s):',
        question_type: 'textarea',
        required: true,
        options: null,
        order_index: 2,
        conditional_depends_on: 'safety-incidents-count',
        conditional_show_when: ["1", "2 or more"]
      }, {
        onConflict: 'pillar,question_id'
      })

    if (error) {
      console.error('Error adding Safety incident description question:', error)
      return
    }

    console.log('✅ Successfully added Safety incident description question!')
    console.log('Question details:')
    console.log('  - ID: safety-incident-description')
    console.log('  - Type: textarea')
    console.log('  - Conditional: Shows when incidents = "1" or "2 or more"')
    
    // Verify the question was added
    const { data: verification, error: verifyError } = await supabase
      .from('pillar_questions')
      .select('*')
      .eq('pillar', 'safety')
      .order('order_index')

    if (verifyError) {
      console.error('Error verifying questions:', verifyError)
      return
    }

    console.log('\n📋 All Safety questions after migration:')
    verification.forEach((q, index) => {
      console.log(`  ${index + 1}. ${q.question_text}`)
      if (q.conditional_depends_on) {
        console.log(`     └─ Conditional: depends on "${q.conditional_depends_on}", shows when: ${JSON.stringify(q.conditional_show_when)}`)
      }
    })

  } catch (error) {
    console.error('Migration failed:', error)
  }
}

addSafetyIncidentDescription()