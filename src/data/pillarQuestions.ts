// Data collection question configuration for all pillars
// This file defines the questions that will be presented to users during data collection

export interface PillarQuestion {
  id: string;
  pillar: string;
  text: string;
  type: 'text' | 'number' | 'select' | 'boolean' | 'textarea' | 'multiselect';
  required: boolean;
  options?: string[];
  order: number;
  conditional?: {
    dependsOn: string;
    showWhen: string | number | boolean | string[];
  };
}

// Static configuration matching user guide requirements
export const PILLAR_QUESTIONS: Record<string, PillarQuestion[]> = {
  delivery: [
    {
      id: 'containers-expected',
      pillar: 'delivery',
      text: 'How many containers are expected today?',
      type: 'number',
      required: true,
      order: 1
    }
  ],
  
  inventory: [
    {
      id: 'models-in-backlog',
      pillar: 'inventory',
      text: 'What models are currently in backlog?',
      type: 'multiselect',
      required: true,
      options: [
        '14 inch',
        '16 inch',
        '20 inch small',
        '20 inch large',
        '24 inch',
        '26 inch',
        'adult small',
        'adult large'
      ],
      order: 1
    },
    // Conditional quantity questions for each model
    {
      id: 'quantity-14-inch',
      pillar: 'inventory',
      text: 'How many 14 inch units are in backlog?',
      type: 'number',
      required: true,
      order: 2,
      conditional: {
        dependsOn: 'models-in-backlog',
        showWhen: '14 inch'
      }
    },
    {
      id: 'quantity-16-inch',
      pillar: 'inventory',
      text: 'How many 16 inch units are in backlog?',
      type: 'number',
      required: true,
      order: 3,
      conditional: {
        dependsOn: 'models-in-backlog',
        showWhen: '16 inch'
      }
    },
    {
      id: 'quantity-20-inch-small',
      pillar: 'inventory',
      text: 'How many 20 inch small units are in backlog?',
      type: 'number',
      required: true,
      order: 4,
      conditional: {
        dependsOn: 'models-in-backlog',
        showWhen: '20 inch small'
      }
    },
    {
      id: 'quantity-20-inch-large',
      pillar: 'inventory',
      text: 'How many 20 inch large units are in backlog?',
      type: 'number',
      required: true,
      order: 5,
      conditional: {
        dependsOn: 'models-in-backlog',
        showWhen: '20 inch large'
      }
    },
    {
      id: 'quantity-24-inch',
      pillar: 'inventory',
      text: 'How many 24 inch units are in backlog?',
      type: 'number',
      required: true,
      order: 6,
      conditional: {
        dependsOn: 'models-in-backlog',
        showWhen: '24 inch'
      }
    },
    {
      id: 'quantity-26-inch',
      pillar: 'inventory',
      text: 'How many 26 inch units are in backlog?',
      type: 'number',
      required: true,
      order: 7,
      conditional: {
        dependsOn: 'models-in-backlog',
        showWhen: '26 inch'
      }
    },
    {
      id: 'quantity-adult-small',
      pillar: 'inventory',
      text: 'How many adult small units are in backlog?',
      type: 'number',
      required: true,
      order: 8,
      conditional: {
        dependsOn: 'models-in-backlog',
        showWhen: 'adult small'
      }
    },
    {
      id: 'quantity-adult-large',
      pillar: 'inventory',
      text: 'How many adult large units are in backlog?',
      type: 'number',
      required: true,
      order: 9,
      conditional: {
        dependsOn: 'models-in-backlog',
        showWhen: 'adult large'
      }
    }
  ],
  
  production: [
    {
      id: 'planned-output',
      pillar: 'production',
      text: 'What is the planned output for today?',
      type: 'number',
      required: true,
      order: 1
    },
    {
      id: 'actual-output-yesterday',
      pillar: 'production',
      text: 'What was the actual output yesterday?',
      type: 'number',
      required: true,
      order: 2
    }
  ],
  
  quality: [
    {
      id: 'quality-issues-yesterday',
      pillar: 'quality',
      text: 'Were there any major quality issues yesterday?',
      type: 'select',
      required: true,
      options: ['Yes', 'No'],
      order: 1
    },
    {
      id: 'quality-issue-types',
      pillar: 'quality',
      text: 'What type of quality issues occurred?',
      type: 'multiselect',
      required: true,
      options: [
        'Customer complaints',
        'Defective products',
        'Supplier issues',
        'Process failures',
        'Testing failures',
        'Specification deviations',
        'Equipment malfunctions'
      ],
      order: 2,
      conditional: {
        dependsOn: 'quality-issues-yesterday',
        showWhen: 'Yes'
      }
    },
    // Detail questions for each issue type
    {
      id: 'customer-complaints-details',
      pillar: 'quality',
      text: 'Customer complaints, describe the details:',
      type: 'textarea',
      required: true,
      order: 3,
      conditional: {
        dependsOn: 'quality-issue-types',
        showWhen: 'Customer complaints'
      }
    },
    {
      id: 'defective-products-details',
      pillar: 'quality',
      text: 'Defective products, describe the details:',
      type: 'textarea',
      required: true,
      order: 4,
      conditional: {
        dependsOn: 'quality-issue-types',
        showWhen: 'Defective products'
      }
    },
    {
      id: 'supplier-issues-details',
      pillar: 'quality',
      text: 'Supplier issues, describe the details:',
      type: 'textarea',
      required: true,
      order: 5,
      conditional: {
        dependsOn: 'quality-issue-types',
        showWhen: 'Supplier issues'
      }
    },
    {
      id: 'process-failures-details',
      pillar: 'quality',
      text: 'Process failures, describe the details:',
      type: 'textarea',
      required: true,
      order: 6,
      conditional: {
        dependsOn: 'quality-issue-types',
        showWhen: 'Process failures'
      }
    },
    {
      id: 'testing-failures-details',
      pillar: 'quality',
      text: 'Testing failures, describe the details:',
      type: 'textarea',
      required: true,
      order: 7,
      conditional: {
        dependsOn: 'quality-issue-types',
        showWhen: 'Testing failures'
      }
    },
    {
      id: 'specification-deviations-details',
      pillar: 'quality',
      text: 'Specification deviations, describe the details:',
      type: 'textarea',
      required: true,
      order: 8,
      conditional: {
        dependsOn: 'quality-issue-types',
        showWhen: 'Specification deviations'
      }
    },
    {
      id: 'equipment-malfunctions-details',
      pillar: 'quality',
      text: 'Equipment malfunctions, describe the details:',
      type: 'textarea',
      required: true,
      order: 9,
      conditional: {
        dependsOn: 'quality-issue-types',
        showWhen: 'Equipment malfunctions'
      }
    }
  ],
  
  safety: [
    {
      id: 'safety-incidents-count',
      pillar: 'safety',
      text: 'How many safety incidents occurred yesterday?',
      type: 'select',
      required: true,
      options: ['0', '1', '2 or more'],
      order: 1
    },
    {
      id: 'safety-incident-description',
      pillar: 'safety',
      text: 'Please describe the safety incident(s):',
      type: 'textarea',
      required: true,
      order: 2,
      conditional: {
        dependsOn: 'safety-incidents-count',
        showWhen: ['1', '2 or more']
      }
    }
  ],

  // Cost pillar - add a basic question for now
  cost: [
    {
      id: 'cost-variances',
      pillar: 'cost',
      text: 'Were there any significant cost variances yesterday?',
      type: 'select',
      required: true,
      options: ['Yes', 'No'],
      order: 1
    }
  ]
};

// Helper function to get questions for a specific pillar
export const getQuestionsForPillar = (pillar: string): PillarQuestion[] => {
  return PILLAR_QUESTIONS[pillar] || [];
};

// Helper function to get visible questions based on current form data and conditional logic
export const getVisibleQuestions = (pillar: string, formData: Record<string, string | number | boolean | string[]>): PillarQuestion[] => {
  const allQuestions = getQuestionsForPillar(pillar);
  
  return allQuestions.filter(question => {
    // Always show questions without conditions
    if (!question.conditional) {
      return true;
    }
    
    const { dependsOn, showWhen } = question.conditional;
    const dependentValue = formData[dependsOn];
    
    // For multiselect dependencies (user selected multiple values)
    if (Array.isArray(dependentValue)) {
      // If showWhen is an array, check if any selected value matches any trigger value
      if (Array.isArray(showWhen)) {
        return dependentValue.some(val => showWhen.includes(val));
      }
      // If showWhen is a single value, check if it's in the selected values
      return dependentValue.includes(showWhen);
    }
    
    // For single value dependencies (user selected one value)
    // If showWhen is an array (multiple trigger values), check if user's value is in it
    if (Array.isArray(showWhen)) {
      return showWhen.includes(dependentValue);
    }
    
    // For single value to single value match
    return dependentValue === showWhen;
  });
};