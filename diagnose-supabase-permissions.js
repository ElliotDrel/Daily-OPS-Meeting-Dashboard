import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
)

async function diagnosePermissions() {
  console.log('🔍 Diagnosing Supabase Permissions')
  console.log('='.repeat(50))
  
  try {
    // Test 1: Can we read?
    console.log('1️⃣ Testing READ permissions...')
    const { data: readData, error: readError } = await supabase
      .from('pillar_questions')
      .select('id, pillar, question_id')
      .limit(1)
    
    if (readError) {
      console.error('❌ READ failed:', readError)
      return
    }
    console.log(`✅ READ works - found ${readData?.length || 0} questions`)
    
    if (!readData || readData.length === 0) {
      console.log('✅ No questions to test deletion on')
      return
    }
    
    const testQuestion = readData[0]
    console.log(`🎯 Testing with question: ${testQuestion.pillar}/${testQuestion.question_id}`)
    
    // Test 2: Can we actually delete?
    console.log('2️⃣ Testing DELETE permissions...')
    const { data: deleteData, error: deleteError } = await supabase
      .from('pillar_questions')
      .delete()
      .eq('id', testQuestion.id)
      .select()
    
    if (deleteError) {
      console.error('❌ DELETE failed:', deleteError)
      console.log('💡 This explains why the migration script fails!')
      
      if (deleteError.code === '42501') {
        console.log('🔒 RLS Policy blocking delete - you need SUPABASE_SERVICE_KEY')
      }
      return
    }
    
    console.log('✅ DELETE reported success')
    console.log('Deleted data:', deleteData)
    
    // Test 3: Verify deletion actually worked
    console.log('3️⃣ Verifying deletion...')
    const { data: verifyData, error: verifyError } = await supabase
      .from('pillar_questions')
      .select('id')
      .eq('id', testQuestion.id)
    
    if (verifyError) {
      console.error('❌ Verification failed:', verifyError)
      return
    }
    
    if (verifyData && verifyData.length > 0) {
      console.error('❌ CRITICAL: Question still exists after "successful" deletion!')
      console.log('🐛 This is the root cause of your migration issues')
    } else {
      console.log('✅ Deletion actually worked - question is gone')
    }
    
  } catch (error) {
    console.error('💥 Unexpected error:', error)
  }
}

diagnosePermissions()