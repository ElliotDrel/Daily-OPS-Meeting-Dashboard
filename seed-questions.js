// Simple seeding script to populate pillar questions
// Run this after creating the database tables: node seed-questions.js

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables from .env
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

// Use service role key for seeding to bypass RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const SEED_QUESTIONS = [
  // Safety Pillar Questions  
  {
    pillar: 'safety',
    question_text: 'How many safety incidents occurred yesterday?',
    question_type: 'select',
    question_key: 'incident_count',
    options: JSON.stringify(['0', '1', '2', '3', '4', '5', '6+']),
    conditional_parent: null,
    conditional_value: null,
    is_required: true,
    display_order: 1,
    is_active: true
  },

  // Quality Pillar Questions
  {
    pillar: 'quality',
    question_text: 'Were there any major quality issues yesterday?',
    question_type: 'select',
    question_key: 'has_quality_issues',
    options: JSON.stringify(['No', 'Yes']),
    conditional_parent: null,
    conditional_value: null,
    is_required: true,
    display_order: 1,
    is_active: true
  },
  {
    pillar: 'quality',
    question_text: 'What type of quality issues occurred?',
    question_type: 'multi_select',
    question_key: 'quality_issue_types',
    options: JSON.stringify(['Customer complaints', 'Defective products', 'Supplier issues', 'Process failures', 'Testing failures', 'Specification deviations', 'Equipment malfunctions']),
    conditional_parent: 'has_quality_issues',
    conditional_value: JSON.stringify('Yes'),
    is_required: true,
    display_order: 2,
    is_active: true
  },

  // Quality Issue Detail Questions (dynamic based on selected issue types)
  {
    pillar: 'quality',
    question_text: 'Customer complaints - Describe the details:',
    question_type: 'textarea',
    question_key: 'customer_complaints_details',
    options: null,
    conditional_parent: 'quality_issue_types',
    conditional_value: JSON.stringify('Customer complaints'),
    is_required: false,
    display_order: 3,
    is_active: true
  },
  {
    pillar: 'quality',
    question_text: 'Defective products - Describe the details:',
    question_type: 'textarea',
    question_key: 'defective_products_details',
    options: null,
    conditional_parent: 'quality_issue_types',
    conditional_value: JSON.stringify('Defective products'),
    is_required: false,
    display_order: 4,
    is_active: true
  },
  {
    pillar: 'quality',
    question_text: 'Supplier issues - Describe the details:',
    question_type: 'textarea',
    question_key: 'supplier_issues_details',
    options: null,
    conditional_parent: 'quality_issue_types',
    conditional_value: JSON.stringify('Supplier issues'),
    is_required: false,
    display_order: 5,
    is_active: true
  },
  {
    pillar: 'quality',
    question_text: 'Process failures - Describe the details:',
    question_type: 'textarea',
    question_key: 'process_failures_details',
    options: null,
    conditional_parent: 'quality_issue_types',
    conditional_value: JSON.stringify('Process failures'),
    is_required: false,
    display_order: 6,
    is_active: true
  },
  {
    pillar: 'quality',
    question_text: 'Testing failures - Describe the details:',
    question_type: 'textarea',
    question_key: 'testing_failures_details',
    options: null,
    conditional_parent: 'quality_issue_types',
    conditional_value: JSON.stringify('Testing failures'),
    is_required: false,
    display_order: 7,
    is_active: true
  },
  {
    pillar: 'quality',
    question_text: 'Specification deviations - Describe the details:',
    question_type: 'textarea',
    question_key: 'specification_deviations_details',
    options: null,
    conditional_parent: 'quality_issue_types',
    conditional_value: JSON.stringify('Specification deviations'),
    is_required: false,
    display_order: 8,
    is_active: true
  },
  {
    pillar: 'quality',
    question_text: 'Equipment malfunctions - Describe the details:',
    question_type: 'textarea',
    question_key: 'equipment_malfunctions_details',
    options: null,
    conditional_parent: 'quality_issue_types',
    conditional_value: JSON.stringify('Equipment malfunctions'),
    is_required: false,
    display_order: 9,
    is_active: true
  },

  // Inventory Pillar Questions
  {
    pillar: 'inventory',
    question_text: 'What models are currently in backlog?',
    question_type: 'multi_select',
    question_key: 'backlog_models',
    options: JSON.stringify(['14"', '16"', '20"-small', '20"-large', '24"', '26"', 'adult-small', 'adult-large']),
    conditional_parent: null,
    conditional_value: null,
    is_required: false,
    display_order: 1,
    is_active: true
  },

  // Inventory Model Quantity Questions (dynamic based on selected models)
  {
    pillar: 'inventory',
    question_text: 'How many 14" units are in backlog?',
    question_type: 'number',
    question_key: 'backlog_14_quantity',
    options: null,
    conditional_parent: 'backlog_models',
    conditional_value: JSON.stringify('14"'),
    is_required: true,
    display_order: 2,
    is_active: true
  },
  {
    pillar: 'inventory',
    question_text: 'How many 16" units are in backlog?',
    question_type: 'number',
    question_key: 'backlog_16_quantity',
    options: null,
    conditional_parent: 'backlog_models',
    conditional_value: JSON.stringify('16"'),
    is_required: true,
    display_order: 3,
    is_active: true
  },
  {
    pillar: 'inventory',
    question_text: 'How many 20"-small units are in backlog?',
    question_type: 'number',
    question_key: 'backlog_20_small_quantity',
    options: null,
    conditional_parent: 'backlog_models',
    conditional_value: JSON.stringify('20"-small'),
    is_required: true,
    display_order: 4,
    is_active: true
  },
  {
    pillar: 'inventory',
    question_text: 'How many 20"-large units are in backlog?',
    question_type: 'number',
    question_key: 'backlog_20_large_quantity',
    options: null,
    conditional_parent: 'backlog_models',
    conditional_value: JSON.stringify('20"-large'),
    is_required: true,
    display_order: 5,
    is_active: true
  },
  {
    pillar: 'inventory',
    question_text: 'How many 24" units are in backlog?',
    question_type: 'number',
    question_key: 'backlog_24_quantity',
    options: null,
    conditional_parent: 'backlog_models',
    conditional_value: JSON.stringify('24"'),
    is_required: true,
    display_order: 6,
    is_active: true
  },
  {
    pillar: 'inventory',
    question_text: 'How many 26" units are in backlog?',
    question_type: 'number',
    question_key: 'backlog_26_quantity',
    options: null,
    conditional_parent: 'backlog_models',
    conditional_value: JSON.stringify('26"'),
    is_required: true,
    display_order: 7,
    is_active: true
  },
  {
    pillar: 'inventory',
    question_text: 'How many adult-small units are in backlog?',
    question_type: 'number',
    question_key: 'backlog_adult_small_quantity',
    options: null,
    conditional_parent: 'backlog_models',
    conditional_value: JSON.stringify('adult-small'),
    is_required: true,
    display_order: 8,
    is_active: true
  },
  {
    pillar: 'inventory',
    question_text: 'How many adult-large units are in backlog?',
    question_type: 'number',
    question_key: 'backlog_adult_large_quantity',
    options: null,
    conditional_parent: 'backlog_models',
    conditional_value: JSON.stringify('adult-large'),
    is_required: true,
    display_order: 9,
    is_active: true
  },

  // Delivery Pillar Questions
  {
    pillar: 'delivery',
    question_text: 'How many containers are expected today?',
    question_type: 'number',
    question_key: 'containers_expected',
    options: null,
    conditional_parent: null,
    conditional_value: null,
    is_required: true,
    display_order: 1,
    is_active: true
  },

  // Production Pillar Questions
  {
    pillar: 'production',
    question_text: 'What is the planned output for today?',
    question_type: 'number',
    question_key: 'planned_output_today',
    options: null,
    conditional_parent: null,
    conditional_value: null,
    is_required: true,
    display_order: 1,
    is_active: true
  },
  {
    pillar: 'production',
    question_text: 'What was the actual output yesterday?',
    question_type: 'number',
    question_key: 'actual_output_yesterday',
    options: null,
    conditional_parent: null,
    conditional_value: null,
    is_required: true,
    display_order: 2,
    is_active: true
  }
];

async function seedQuestions() {
  try {
    console.log('🌱 Starting question seeding...');

    // Check if questions already exist
    const { data: existingQuestions, error: checkError } = await supabase
      .from('pillar_questions')
      .select('pillar, question_key');

    if (checkError) {
      throw new Error(`Error checking existing questions: ${checkError.message}`);
    }

    // Create a Set of existing question keys for quick lookup
    const existingKeys = new Set(
      existingQuestions?.map(q => `${q.pillar}:${q.question_key}`) || []
    );

    // Filter out questions that already exist
    const questionsToInsert = SEED_QUESTIONS.filter(q => 
      !existingKeys.has(`${q.pillar}:${q.question_key}`)
    );

    if (questionsToInsert.length === 0) {
      console.log('✅ All questions already exist in database');
      return;
    }

    console.log(`📝 Inserting ${questionsToInsert.length} new questions...`);

    // Insert new questions
    const { error: insertError } = await supabase
      .from('pillar_questions')
      .insert(questionsToInsert);

    if (insertError) {
      throw new Error(`Error inserting questions: ${insertError.message}`);
    }

    console.log('✅ Questions seeded successfully!');
    
    // Log summary by pillar
    const summary = SEED_QUESTIONS.reduce((acc, q) => {
      acc[q.pillar] = (acc[q.pillar] || 0) + 1;
      return acc;
    }, {});

    console.log('📊 Questions by pillar:', summary);

  } catch (error) {
    console.error('❌ Error seeding questions:', error);
    throw error;
  }
}

// Run the seeding
seedQuestions()
  .then(() => {
    console.log('🎉 Seeding complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  });