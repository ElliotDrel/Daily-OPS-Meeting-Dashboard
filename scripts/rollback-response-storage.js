#!/usr/bin/env node

/**
 * Pillar Response Storage Rollback Script
 * 
 * This script rolls back the pillar response migration by reconstructing JSONB data
 * from the normalized format and optionally cleaning up the normalized tables.
 * 
 * Usage:
 *   node scripts/rollback-response-storage.js [options]
 * 
 * Options:
 *   --dry-run     Run in dry-run mode (no actual changes)
 *   --batch-size  Number of responses to process per batch (default: 100)
 *   --cleanup     Remove normalized data after rollback
 *   --pillar      Rollback only specific pillar (safety, quality, etc.)
 *   --force       Skip confirmation prompts
 *   --help        Show this help message
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createInterface } from 'readline';

// Load environment variables
config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   VITE_SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Configuration
const DEFAULT_BATCH_SIZE = 100;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // ms

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  dryRun: args.includes('--dry-run'),
  batchSize: parseInt(args.find(arg => arg.startsWith('--batch-size='))?.split('=')[1]) || DEFAULT_BATCH_SIZE,
  cleanup: args.includes('--cleanup'),
  pillar: args.find(arg => arg.startsWith('--pillar='))?.split('=')[1],
  force: args.includes('--force'),
  help: args.includes('--help')
};

if (options.help) {
  console.log(readFileSync(join(__dirname, '../scripts/rollback-response-storage.js'), 'utf8')
    .split('\n')
    .slice(3, 18)
    .map(line => line.replace(/^ \* ?/, ''))
    .join('\n'));
  process.exit(0);
}

// Utility functions
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const formatDuration = (ms) => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
};

const logProgress = (current, total, startTime, extraInfo = '') => {
  const elapsed = Date.now() - startTime;
  const rate = current / (elapsed / 1000);
  const eta = total > current ? (total - current) / rate * 1000 : 0;
  const percentage = Math.round((current / total) * 100);
  
  console.log(
    `📊 Progress: ${current}/${total} (${percentage}%) | ` +
    `Rate: ${rate.toFixed(1)}/s | ` +
    `Elapsed: ${formatDuration(elapsed)} | ` +
    `ETA: ${formatDuration(eta)}` +
    (extraInfo ? ` | ${extraInfo}` : '')
  );
};

const askConfirmation = (question) => {
  return new Promise((resolve) => {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    rl.question(`${question} (y/N): `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase().startsWith('y'));
    });
  });
};

// Rollback functions
async function checkRollbackPrerequisites() {
  console.log('🔍 Checking rollback prerequisites...');
  
  // Check if normalized table exists
  const { data: normalizedTable, error: tableError } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')
    .eq('table_name', 'pillar_response_values');
  
  if (tableError || !normalizedTable || normalizedTable.length === 0) {
    console.error('❌ pillar_response_values table not found.');
    console.error('   Nothing to rollback.');
    return false;
  }
  
  // Check if sync function exists
  const { data: functions, error: functionsError } = await supabase
    .from('information_schema.routines')
    .select('routine_name')
    .eq('routine_schema', 'public')
    .eq('routine_name', 'sync_normalized_to_jsonb');
  
  if (functionsError || !functions || functions.length === 0) {
    console.error('❌ Sync function not found.');
    console.error('   Please ensure migration functions are installed.');
    return false;
  }
  
  // Check if there's normalized data to rollback
  const { count, error: countError } = await supabase
    .from('pillar_response_values')
    .select('*', { count: 'exact', head: true });
  
  if (countError) {
    console.error('❌ Failed to count normalized data:', countError);
    return false;
  }
  
  if (count === 0) {
    console.log('ℹ️  No normalized data found. Nothing to rollback.');
    return false;
  }
  
  console.log(`✅ Found ${count} normalized values to rollback`);
  return true;
}

async function getRollbackStats() {
  const { data: stats, error } = await supabase.rpc('get_migration_stats');
  
  if (error) {
    console.warn('⚠️  Could not get migration stats:', error);
    return null;
  }
  
  return stats[0];
}

async function getResponsesForRollback() {
  let query = supabase
    .from('pillar_responses')
    .select('id, pillar, response_date', { count: 'exact' })
    .in('id', `(SELECT DISTINCT response_id FROM pillar_response_values)`);
  
  if (options.pillar) {
    query = query.eq('pillar', options.pillar);
    console.log(`🎯 Filtering by pillar: ${options.pillar}`);
  }
  
  const { data: responses, error, count } = await query;
  
  if (error) {
    console.error('❌ Failed to fetch responses for rollback:', error);
    return { responses: [], count: 0 };
  }
  
  return { responses: responses || [], count: count || 0 };
}

async function rollbackResponseBatch(responses, batchNumber, totalBatches) {
  const batchStartTime = Date.now();
  const results = {
    success: 0,
    errors: 0,
    details: []
  };
  
  console.log(`🔄 Processing rollback batch ${batchNumber}/${totalBatches} (${responses.length} responses)`);
  
  for (const response of responses) {
    let retryCount = 0;
    let rollbackSuccess = false;
    
    while (retryCount < MAX_RETRIES && !rollbackSuccess) {
      try {
        if (!options.dryRun) {
          // Get reconstructed JSONB from normalized data
          const { data: reconstructedData, error: syncError } = await supabase
            .rpc('sync_normalized_to_jsonb', { p_response_id: response.id });
          
          if (syncError) throw syncError;
          
          // Update the original responses table
          const { error: updateError } = await supabase
            .from('pillar_responses')
            .update({ 
              responses: reconstructedData,
              updated_at: new Date().toISOString()
            })
            .eq('id', response.id);
          
          if (updateError) throw updateError;
          
          results.success++;
        } else {
          // Dry run - just validate we can reconstruct
          const { data: reconstructedData, error: syncError } = await supabase
            .rpc('sync_normalized_to_jsonb', { p_response_id: response.id });
          
          if (syncError) throw syncError;
          
          results.success++;
        }
        
        rollbackSuccess = true;
        
      } catch (error) {
        retryCount++;
        console.error(`❌ Error rolling back response ${response.id} (attempt ${retryCount}/${MAX_RETRIES}):`, error.message);
        
        if (retryCount >= MAX_RETRIES) {
          results.errors++;
          results.details.push({
            responseId: response.id,
            pillar: response.pillar,
            error: `Rollback failed after ${MAX_RETRIES} attempts: ${error.message}`
          });
        } else {
          await sleep(RETRY_DELAY * retryCount);
        }
      }
    }
  }
  
  const batchDuration = Date.now() - batchStartTime;
  console.log(`✅ Rollback batch ${batchNumber} complete: ${results.success} success, ${results.errors} errors (${formatDuration(batchDuration)})`);
  
  return results;
}

async function validateRollback(sampleSize = 50) {
  console.log(`🔍 Validating rollback (sample size: ${sampleSize})...`);
  
  const { data: sampleResponses, error } = await supabase
    .from('pillar_responses')
    .select('id, responses')
    .in('id', `(SELECT DISTINCT response_id FROM pillar_response_values)`)
    .limit(sampleSize);
  
  if (error) {
    console.error('❌ Failed to fetch sample responses for validation:', error);
    return false;
  }
  
  let validationErrors = 0;
  
  for (const response of sampleResponses) {
    try {
      // Reconstruct from normalized data
      const { data: reconstructed, error: reconstructError } = await supabase
        .rpc('sync_normalized_to_jsonb', { p_response_id: response.id });
      
      if (reconstructError) {
        console.error(`❌ Failed to reconstruct response ${response.id}:`, reconstructError);
        validationErrors++;
        continue;
      }
      
      // Compare with current JSONB data
      const originalKeys = Object.keys(response.responses || {}).sort();
      const reconstructedKeys = Object.keys(reconstructed || {}).sort();
      
      if (JSON.stringify(originalKeys) !== JSON.stringify(reconstructedKeys)) {
        console.error(`❌ Key mismatch for response ${response.id}:`);
        console.error(`   Original keys: ${originalKeys.join(', ')}`);
        console.error(`   Reconstructed keys: ${reconstructedKeys.join(', ')}`);
        validationErrors++;
        continue;
      }
      
      // Check values (with some tolerance for type differences)
      let valuesMismatch = false;
      for (const key of originalKeys) {
        const originalValue = response.responses[key];
        const reconstructedValue = reconstructed[key];
        
        if (JSON.stringify(originalValue) !== JSON.stringify(reconstructedValue)) {
          console.error(`❌ Value mismatch for response ${response.id}, key ${key}:`);
          console.error(`   Original: ${JSON.stringify(originalValue)}`);
          console.error(`   Reconstructed: ${JSON.stringify(reconstructedValue)}`);
          valuesMismatch = true;
        }
      }
      
      if (valuesMismatch) {
        validationErrors++;
      }
      
    } catch (error) {
      console.error(`❌ Exception during rollback validation of response ${response.id}:`, error);
      validationErrors++;
    }
  }
  
  const validationRate = ((sampleSize - validationErrors) / sampleSize * 100).toFixed(1);
  console.log(`📊 Rollback validation complete: ${validationRate}% passed (${validationErrors}/${sampleSize} failed)`);
  
  return validationErrors === 0;
}

async function cleanupNormalizedData() {
  console.log('🧹 Cleaning up normalized data...');
  
  if (!options.force) {
    const confirmed = await askConfirmation('⚠️  This will permanently delete all normalized data. Are you sure?');
    if (!confirmed) {
      console.log('❌ Cleanup cancelled by user');
      return false;
    }
  }
  
  try {
    const { error } = await supabase
      .from('pillar_response_values')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records
    
    if (error) throw error;
    
    console.log('✅ Normalized data cleanup complete');
    return true;
  } catch (error) {
    console.error('❌ Failed to cleanup normalized data:', error);
    return false;
  }
}

// Main rollback function
async function runRollback() {
  const startTime = Date.now();
  
  console.log('🔄 Starting Pillar Response Storage Rollback');
  console.log(`⚙️  Configuration:`);
  console.log(`   Dry Run: ${options.dryRun ? '✅' : '❌'}`);
  console.log(`   Batch Size: ${options.batchSize}`);
  console.log(`   Cleanup: ${options.cleanup ? '✅' : '❌'}`);
  console.log(`   Pillar Filter: ${options.pillar || 'All'}`);
  console.log(`   Force: ${options.force ? '✅' : '❌'}`);
  console.log('');
  
  // Check prerequisites
  if (!(await checkRollbackPrerequisites())) {
    process.exit(1);
  }
  
  // Get current stats
  const initialStats = await getRollbackStats();
  if (initialStats) {
    console.log('📊 Current Migration Status:');
    console.log(`   Total Responses: ${initialStats.total_responses}`);
    console.log(`   Migrated: ${initialStats.migrated_responses} (${initialStats.migration_percentage}%)`);
    console.log(`   Total Normalized Values: ${initialStats.total_values}`);
    console.log('');
  }
  
  // Warning and confirmation
  if (!options.dryRun && !options.force) {
    console.log('⚠️  WARNING: This will overwrite JSONB data in pillar_responses with reconstructed data');
    console.log('⚠️  Make sure you have a database backup before proceeding!');
    console.log('');
    
    const confirmed = await askConfirmation('Do you want to continue with the rollback?');
    if (!confirmed) {
      console.log('❌ Rollback cancelled by user');
      process.exit(0);
    }
  }
  
  // Get responses to rollback
  const { responses, count } = await getResponsesForRollback();
  
  if (count === 0) {
    console.log('ℹ️  No migrated responses found. Nothing to rollback.');
    return;
  }
  
  console.log(`📝 Found ${count} responses to rollback`);
  
  if (options.dryRun) {
    console.log('🔍 DRY RUN MODE - No changes will be made');
  }
  
  // Process rollback in batches
  const totalBatches = Math.ceil(responses.length / options.batchSize);
  const rollbackResults = {
    totalSuccess: 0,
    totalErrors: 0,
    batchResults: [],
    errorDetails: []
  };
  
  for (let i = 0; i < responses.length; i += options.batchSize) {
    const batch = responses.slice(i, i + options.batchSize);
    const batchNumber = Math.floor(i / options.batchSize) + 1;
    
    const batchResult = await rollbackResponseBatch(batch, batchNumber, totalBatches);
    
    rollbackResults.totalSuccess += batchResult.success;
    rollbackResults.totalErrors += batchResult.errors;
    rollbackResults.batchResults.push(batchResult);
    rollbackResults.errorDetails.push(...batchResult.details);
    
    logProgress(i + batch.length, responses.length, startTime, 
      `${batchResult.success} success, ${batchResult.errors} errors`);
    
    // Small delay between batches
    if (batchNumber < totalBatches) {
      await sleep(100);
    }
  }
  
  const totalDuration = Date.now() - startTime;
  
  console.log('');
  console.log('🎉 Rollback Complete!');
  console.log(`📊 Results:`);
  console.log(`   Total Duration: ${formatDuration(totalDuration)}`);
  console.log(`   Responses Processed: ${responses.length}`);
  console.log(`   Successful Rollbacks: ${rollbackResults.totalSuccess}`);
  console.log(`   Errors: ${rollbackResults.totalErrors}`);
  
  if (rollbackResults.errorDetails.length > 0) {
    console.log('');
    console.log('⚠️  Error Summary:');
    rollbackResults.errorDetails.forEach(detail => {
      console.log(`   Response ${detail.responseId} (${detail.pillar}): ${detail.error}`);
    });
  }
  
  // Validate rollback
  if (!options.dryRun) {
    console.log('');
    const validationPassed = await validateRollback();
    if (!validationPassed) {
      console.log('⚠️  Rollback validation found issues. Please review the results.');
      process.exit(1);
    }
  }
  
  // Cleanup normalized data if requested
  if (options.cleanup && !options.dryRun && rollbackResults.totalErrors === 0) {
    console.log('');
    const cleanupSuccess = await cleanupNormalizedData();
    if (!cleanupSuccess) {
      console.log('⚠️  Cleanup failed, but rollback was successful. You may need to clean up manually.');
    }
  }
  
  console.log('');
  console.log('✅ Rollback script completed successfully!');
  
  if (options.cleanup && options.dryRun) {
    console.log('ℹ️  Note: Cleanup was not performed in dry-run mode');
  }
}

// Error handling and script execution
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Run the rollback
runRollback().catch(error => {
  console.error('❌ Rollback failed:', error);
  process.exit(1);
});