#!/usr/bin/env node

/**
 * Migration Setup Test Script
 * 
 * This script tests that all prerequisites for the response storage migration are in place.
 * Run this before attempting the actual migration to catch configuration issues early.
 * 
 * Usage:
 *   node scripts/test-migration-setup.js
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🧪 Testing Migration Setup\n');

// Test results tracking
const tests = [];
let totalTests = 0;
let passedTests = 0;

function test(name, testFn) {
  totalTests++;
  console.log(`🔍 Testing: ${name}`);
  
  try {
    const result = testFn();
    if (result === true || (result && result.success)) {
      console.log(`✅ PASS: ${name}`);
      passedTests++;
      tests.push({ name, status: 'PASS', details: result.details || '' });
    } else {
      console.log(`❌ FAIL: ${name} - ${result.error || 'Unknown error'}`);
      tests.push({ name, status: 'FAIL', details: result.error || 'Unknown error' });
    }
  } catch (error) {
    console.log(`❌ FAIL: ${name} - ${error.message}`);
    tests.push({ name, status: 'FAIL', details: error.message });
  }
  console.log('');
}

async function asyncTest(name, testFn) {
  totalTests++;
  console.log(`🔍 Testing: ${name}`);
  
  try {
    const result = await testFn();
    if (result === true || (result && result.success)) {
      console.log(`✅ PASS: ${name}`);
      passedTests++;
      tests.push({ name, status: 'PASS', details: result.details || '' });
    } else {
      console.log(`❌ FAIL: ${name} - ${result.error || 'Unknown error'}`);
      tests.push({ name, status: 'FAIL', details: result.error || 'Unknown error' });
    }
  } catch (error) {
    console.log(`❌ FAIL: ${name} - ${error.message}`);
    tests.push({ name, status: 'FAIL', details: error.message });
  }
  console.log('');
}

// Test 1: Environment Variables
test('Environment Variables', () => {
  if (!supabaseUrl) {
    return { success: false, error: 'VITE_SUPABASE_URL not found in .env.local' };
  }
  if (!supabaseServiceKey) {
    return { success: false, error: 'SUPABASE_SERVICE_KEY not found in .env.local' };
  }
  if (!supabaseAnonKey) {
    return { success: false, error: 'VITE_SUPABASE_ANON_KEY not found in .env.local' };
  }
  return { success: true, details: 'All required environment variables present' };
});

// Test 2: Supabase Connection (Service Key)
await asyncTest('Supabase Service Connection', async () => {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    const { data, error } = await supabase.from('pillar_responses').select('count', { count: 'exact', head: true });
    if (error) {
      return { success: false, error: `Service connection failed: ${error.message}` };
    }
    return { success: true, details: `Connected successfully, found ${data || 0} responses` };
  } catch (error) {
    return { success: false, error: `Connection exception: ${error.message}` };
  }
});

// Test 3: Supabase Connection (Anon Key)
await asyncTest('Supabase Anon Connection', async () => {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  try {
    const { data, error } = await supabase.from('pillar_questions').select('count', { count: 'exact', head: true });
    if (error) {
      return { success: false, error: `Anon connection failed: ${error.message}` };
    }
    return { success: true, details: `Connected successfully, found ${data || 0} questions` };
  } catch (error) {
    return { success: false, error: `Connection exception: ${error.message}` };
  }
});

// Test 4: Required Tables Exist
await asyncTest('Required Tables', async () => {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  const requiredTables = ['pillar_responses', 'pillar_questions', 'pillar_response_values'];
  const missingTables = [];
  
  for (const tableName of requiredTables) {
    try {
      const { error } = await supabase.from(tableName).select('*', { count: 'exact', head: true });
      if (error && error.code === '42P01') { // Table does not exist
        missingTables.push(tableName);
      }
    } catch (error) {
      if (error.message.includes('does not exist')) {
        missingTables.push(tableName);
      }
    }
  }
  
  if (missingTables.length > 0) {
    return { 
      success: false, 
      error: `Missing tables: ${missingTables.join(', ')}. Run schema creation scripts.` 
    };
  }
  
  return { success: true, details: 'All required tables exist' };
});

// Test 5: Migration Functions Exist
await asyncTest('Migration Functions', async () => {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  const requiredFunctions = [
    'migrate_response_to_normalized',
    'sync_normalized_to_jsonb',
    'validate_response_migration',
    'get_migration_stats'
  ];
  
  const missingFunctions = [];
  
  for (const functionName of requiredFunctions) {
    try {
      // Try to call the function with minimal parameters to see if it exists
      const { error } = await supabase.rpc(functionName, 
        functionName === 'get_migration_stats' ? {} : 
        functionName === 'migrate_response_to_normalized' ? { p_response_id: '00000000-0000-0000-0000-000000000000', p_jsonb_responses: {} } :
        functionName === 'sync_normalized_to_jsonb' ? { p_response_id: '00000000-0000-0000-0000-000000000000' } :
        { p_response_id: '00000000-0000-0000-0000-000000000000' }
      );
      
      // Function exists if we don't get a "function does not exist" error
      if (error && (error.code === '42883' || error.message.includes('does not exist'))) {
        missingFunctions.push(functionName);
      }
    } catch (error) {
      if (error.message.includes('does not exist')) {
        missingFunctions.push(functionName);
      }
    }
  }
  
  if (missingFunctions.length > 0) {
    return { 
      success: false, 
      error: `Missing functions: ${missingFunctions.join(', ')}. Run migration functions script.` 
    };
  }
  
  return { success: true, details: 'All migration functions exist' };
});

// Test 6: Sample Data Structure
await asyncTest('Sample Data Structure', async () => {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    const { data, error } = await supabase
      .from('pillar_responses')
      .select('id, pillar, responses')
      .limit(1);
    
    if (error) {
      return { success: false, error: `Failed to fetch sample data: ${error.message}` };
    }
    
    if (!data || data.length === 0) {
      return { success: true, details: 'No existing data to migrate (empty database)' };
    }
    
    const sampleResponse = data[0];
    
    if (!sampleResponse.responses || typeof sampleResponse.responses !== 'object') {
      return { 
        success: false, 
        error: 'Sample response does not have valid JSONB structure' 
      };
    }
    
    return { 
      success: true, 
      details: `Sample data valid. Found response for ${sampleResponse.pillar} with ${Object.keys(sampleResponse.responses).length} values` 
    };
  } catch (error) {
    return { success: false, error: `Data structure test failed: ${error.message}` };
  }
});

// Test 7: Migration Statistics
await asyncTest('Migration Statistics', async () => {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    const { data, error } = await supabase.rpc('get_migration_stats');
    
    if (error) {
      return { success: false, error: `Stats function failed: ${error.message}` };
    }
    
    const stats = data[0];
    return { 
      success: true, 
      details: `Total responses: ${stats.total_responses}, Migrated: ${stats. migrated_responses} (${stats.migration_percentage}%)` 
    };
  } catch (error) {
    return { success: false, error: `Statistics test failed: ${error.message}` };
  }
});

// Test 8: Permissions Test
await asyncTest('Database Permissions', async () => {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    // Test INSERT permission on pillar_response_values
    const testId = '00000000-0000-0000-0000-000000000001';
    
    // Try to insert a test record (this will likely fail due to foreign key, but that's fine)
    const { error: insertError } = await supabase
      .from('pillar_response_values')
      .insert({
        response_id: testId,
        question_id: 'test-question',
        question_type: 'text',
        value_text: 'test'
      });
    
    // Check if the error is about permissions or foreign key
    if (insertError && insertError.code === '42501') {
      return { success: false, error: 'Insufficient permissions for INSERT operations' };
    }
    
    // If we got here, permissions are OK (even if foreign key failed)
    return { success: true, details: 'Database permissions appear sufficient' };
  } catch (error) {
    return { success: false, error: `Permissions test failed: ${error.message}` };
  }
});

// Print Summary
console.log('📊 Test Summary');
console.log(`Total Tests: ${totalTests}`);
console.log(`Passed: ${passedTests}`);
console.log(`Failed: ${totalTests - passedTests}`);
console.log(`Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);
console.log('');

if (passedTests === totalTests) {
  console.log('🎉 All tests passed! Your setup is ready for migration.');
  console.log('');
  console.log('Next steps:');
  console.log('1. Run: npm run migrate:storage:dry-run');
  console.log('2. Review the dry-run output');
  console.log('3. Run: npm run migrate:storage:validate');
} else {
  console.log('⚠️  Some tests failed. Please fix the issues before running migration.');
  console.log('');
  console.log('Failed tests:');
  tests
    .filter(test => test.status === 'FAIL')
    .forEach(test => {
      console.log(`❌ ${test.name}: ${test.details}`);
    });
}

process.exit(passedTests === totalTests ? 0 : 1);