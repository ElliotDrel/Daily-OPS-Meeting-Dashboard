#!/usr/bin/env node

/**
 * Pillar Response Storage Migration Script
 * 
 * This script migrates pillar response data from JSONB format to normalized format.
 * It processes data in batches, provides progress reporting, and includes validation.
 * 
 * Usage:
 *   node scripts/migrate-response-storage.js [options]
 * 
 * Options:
 *   --dry-run     Run in dry-run mode (no actual changes)
 *   --batch-size  Number of responses to process per batch (default: 100)
 *   --validate    Run validation after migration
 *   --pillar      Migrate only specific pillar (safety, quality, etc.)
 *   --help        Show this help message
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY; // Need service key for admin operations

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   VITE_SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env.local');
  console.error('   See CLAUDE.md for instructions on obtaining these values.');
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
  validate: args.includes('--validate'),
  pillar: args.find(arg => arg.startsWith('--pillar='))?.split('=')[1],
  help: args.includes('--help')
};

if (options.help) {
  console.log(readFileSync(join(__dirname, '../scripts/migrate-response-storage.js'), 'utf8')
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

// Migration functions
async function checkPrerequisites() {
  console.log('🔍 Checking prerequisites...');
  
  // Check if new schema exists
  const { data: tables, error: tablesError } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')
    .eq('table_name', 'pillar_response_values');
  
  if (tablesError || !tables || tables.length === 0) {
    console.error('❌ pillar_response_values table not found.');
    console.error('   Please run the schema creation script first:');
    console.error('   Execute: database/pillar_response_values_schema.sql');
    return false;
  }
  
  // Check if migration functions exist
  const { data: functions, error: functionsError } = await supabase
    .from('information_schema.routines')
    .select('routine_name')
    .eq('routine_schema', 'public')
    .eq('routine_name', 'migrate_response_to_normalized');
  
  if (functionsError || !functions || functions.length === 0) {
    console.error('❌ Migration functions not found.');
    console.error('   Please run the migration functions script first:');
    console.error('   Execute: database/pillar_response_migration_functions.sql');
    return false;
  }
  
  console.log('✅ Prerequisites check passed');
  return true;
}

async function getMigrationStats() {
  const { data, error } = await supabase.rpc('get_migration_stats');
  
  if (error) {
    console.error('❌ Failed to get migration stats:', error);
    return null;
  }
  
  return data[0];
}

async function getResponsesForMigration() {
  let query = supabase
    .from('pillar_responses')
    .select('id, pillar, response_date, responses', { count: 'exact' });
  
  if (options.pillar) {
    query = query.eq('pillar', options.pillar);
    console.log(`🎯 Filtering by pillar: ${options.pillar}`);
  }
  
  // Only get responses that haven't been migrated yet (or need re-migration)
  const { data: unmigrated, error: unmigratedError } = await supabase
    .from('pillar_responses')
    .select('id')
    .not('id', 'in', `(SELECT DISTINCT response_id FROM pillar_response_values)`);
  
  if (unmigratedError) {
    console.error('❌ Failed to identify unmigrated responses:', unmigratedError);
    return { responses: [], count: 0 };
  }
  
  if (unmigrated && unmigrated.length > 0) {
    const unmigratedIds = unmigrated.map(r => r.id);
    query = query.in('id', unmigratedIds);
  }
  
  const { data: responses, error, count } = await query;
  
  if (error) {
    console.error('❌ Failed to fetch responses:', error);
    return { responses: [], count: 0 };
  }
  
  return { responses: responses || [], count: count || 0 };
}

async function migrateResponseBatch(responses, batchNumber, totalBatches) {
  const batchStartTime = Date.now();
  const results = {
    success: 0,
    errors: 0,
    details: []
  };
  
  console.log(`🔄 Processing batch ${batchNumber}/${totalBatches} (${responses.length} responses)`);
  
  for (const response of responses) {
    let retryCount = 0;
    let migrationSuccess = false;
    
    while (retryCount < MAX_RETRIES && !migrationSuccess) {
      try {
        if (!options.dryRun) {
          const { data: migrationResult, error } = await supabase.rpc('migrate_response_to_normalized', {
            p_response_id: response.id,
            p_jsonb_responses: response.responses
          });
          
          if (error) throw error;
          
          const result = migrationResult[0];
          if (result.error_count > 0) {
            console.warn(`⚠️  Response ${response.id} had ${result.error_count} errors:`, result.errors);
            results.details.push({
              responseId: response.id,
              pillar: response.pillar,
              errors: result.errors
            });
          }
          
          results.success += result.success_count;
          results.errors += result.error_count;
        } else {
          // Dry run - just validate the response structure
          if (!response.responses || typeof response.responses !== 'object') {
            throw new Error('Invalid response structure');
          }
          results.success += Object.keys(response.responses).length;
        }
        
        migrationSuccess = true;
        
      } catch (error) {
        retryCount++;
        console.error(`❌ Error migrating response ${response.id} (attempt ${retryCount}/${MAX_RETRIES}):`, error.message);
        
        if (retryCount >= MAX_RETRIES) {
          results.errors++;
          results.details.push({
            responseId: response.id,
            pillar: response.pillar,
            errors: [`Migration failed after ${MAX_RETRIES} attempts: ${error.message}`]
          });
        } else {
          await sleep(RETRY_DELAY * retryCount); // Exponential backoff
        }
      }
    }
  }
  
  const batchDuration = Date.now() - batchStartTime;
  console.log(`✅ Batch ${batchNumber} complete: ${results.success} values migrated, ${results.errors} errors (${formatDuration(batchDuration)})`);
  
  return results;
}

async function validateMigration(sampleSize = 50) {
  console.log(`🔍 Validating migration (sample size: ${sampleSize})...`);
  
  const { data: sampleResponses, error } = await supabase
    .from('pillar_responses')
    .select('id, responses')
    .limit(sampleSize);
  
  if (error) {
    console.error('❌ Failed to fetch sample responses for validation:', error);
    return false;
  }
  
  let validationErrors = 0;
  
  for (const response of sampleResponses) {
    try {
      const { data: validationResult, error: validationError } = await supabase
        .rpc('validate_response_migration', { p_response_id: response.id });
      
      if (validationError) {
        console.error(`❌ Validation error for response ${response.id}:`, validationError);
        validationErrors++;
        continue;
      }
      
      const result = validationResult[0];
      if (!result.is_valid) {
        console.error(`❌ Validation failed for response ${response.id}:`);
        if (result.missing_keys.length > 0) {
          console.error(`   Missing keys: ${result.missing_keys.join(', ')}`);
        }
        if (result.extra_keys.length > 0) {
          console.error(`   Extra keys: ${result.extra_keys.join(', ')}`);
        }
        if (result.validation_errors.length > 0) {
          console.error(`   Value errors: ${result.validation_errors.join('; ')}`);
        }
        validationErrors++;
      }
    } catch (error) {
      console.error(`❌ Exception during validation of response ${response.id}:`, error);
      validationErrors++;
    }
  }
  
  const validationRate = ((sampleSize - validationErrors) / sampleSize * 100).toFixed(1);
  console.log(`📊 Validation complete: ${validationRate}% passed (${validationErrors}/${sampleSize} failed)`);
  
  return validationErrors === 0;
}

// Main migration function
async function runMigration() {
  const startTime = Date.now();
  
  console.log('🚀 Starting Pillar Response Storage Migration');
  console.log(`⚙️  Configuration:`);
  console.log(`   Dry Run: ${options.dryRun ? '✅' : '❌'}`);
  console.log(`   Batch Size: ${options.batchSize}`);
  console.log(`   Validate: ${options.validate ? '✅' : '❌'}`);
  console.log(`   Pillar Filter: ${options.pillar || 'All'}`);
  console.log('');
  
  // Check prerequisites
  if (!(await checkPrerequisites())) {
    process.exit(1);
  }
  
  // Get initial stats
  const initialStats = await getMigrationStats();
  if (initialStats) {
    console.log('📊 Current Migration Status:');
    console.log(`   Total Responses: ${initialStats.total_responses}`);
    console.log(`   Migrated: ${initialStats.migrated_responses} (${initialStats.migration_percentage}%)`);
    console.log(`   Total Values: ${initialStats.total_values}`);
    console.log('');
  }
  
  // Get responses to migrate
  const { responses, count } = await getResponsesForMigration();
  
  if (count === 0) {
    console.log('✅ No responses need migration. All done!');
    return;
  }
  
  console.log(`📝 Found ${count} responses to migrate`);
  
  if (options.dryRun) {
    console.log('🔍 DRY RUN MODE - No changes will be made');
  }
  
  // Process in batches
  const totalBatches = Math.ceil(responses.length / options.batchSize);
  const migrationResults = {
    totalSuccess: 0,
    totalErrors: 0,
    batchResults: [],
    errorDetails: []
  };
  
  for (let i = 0; i < responses.length; i += options.batchSize) {
    const batch = responses.slice(i, i + options.batchSize);
    const batchNumber = Math.floor(i / options.batchSize) + 1;
    
    const batchResult = await migrateResponseBatch(batch, batchNumber, totalBatches);
    
    migrationResults.totalSuccess += batchResult.success;
    migrationResults.totalErrors += batchResult.errors;
    migrationResults.batchResults.push(batchResult);
    migrationResults.errorDetails.push(...batchResult.details);
    
    logProgress(i + batch.length, responses.length, startTime, 
      `${batchResult.success} values, ${batchResult.errors} errors`);
    
    // Small delay between batches to avoid overwhelming the database
    if (batchNumber < totalBatches) {
      await sleep(100);
    }
  }
  
  const totalDuration = Date.now() - startTime;
  
  console.log('');
  console.log('🎉 Migration Complete!');
  console.log(`📊 Results:`);
  console.log(`   Total Duration: ${formatDuration(totalDuration)}`);
  console.log(`   Responses Processed: ${responses.length}`);
  console.log(`   Values Migrated: ${migrationResults.totalSuccess}`);
  console.log(`   Errors: ${migrationResults.totalErrors}`);
  
  if (migrationResults.errorDetails.length > 0) {
    console.log('');
    console.log('⚠️  Error Summary:');
    migrationResults.errorDetails.forEach(detail => {
      console.log(`   Response ${detail.responseId} (${detail.pillar}): ${detail.errors.join('; ')}`);
    });
  }
  
  // Run validation if requested
  if (options.validate && !options.dryRun) {
    console.log('');
    const validationPassed = await validateMigration();
    if (!validationPassed) {
      console.log('⚠️  Validation found issues. Review the migration results.');
      process.exit(1);
    }
  }
  
  // Get final stats
  if (!options.dryRun) {
    console.log('');
    const finalStats = await getMigrationStats();
    if (finalStats) {
      console.log('📊 Final Migration Status:');
      console.log(`   Total Responses: ${finalStats.total_responses}`);
      console.log(`   Migrated: ${finalStats.migrated_responses} (${finalStats.migration_percentage}%)`);
      console.log(`   Total Values: ${finalStats.total_values}`);
      console.log(`   Values by Type:`, JSON.stringify(finalStats.values_by_type, null, 2));
    }
  }
  
  console.log('');
  console.log('✅ Migration script completed successfully!');
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

// Run the migration
runMigration().catch(error => {
  console.error('❌ Migration failed:', error);
  process.exit(1);
});