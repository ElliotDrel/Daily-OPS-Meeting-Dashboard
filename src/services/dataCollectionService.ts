// Data Collection Service - Supabase integration for pillar questions and responses
// Following the same patterns as usePillarData.ts

import { supabase } from '@/lib/supabase';
import { PillarQuestion, PillarResponse } from '@/types/dataCollection';

// Supabase interfaces matching the database schema
export interface SupabasePillarQuestion {
  id: string;
  pillar: string;
  question_id: string;
  question_text: string;
  question_type: 'text' | 'number' | 'select' | 'boolean' | 'textarea' | 'multiselect';
  required: boolean;
  options: string[] | null;
  order_index: number;
  conditional_depends_on: string | null;
  conditional_show_when: string | number | boolean | string[] | null;
  created_at: string;
  updated_at: string;
}

export interface SupabasePillarResponse {
  id: string;
  user_id: string;
  pillar: string;
  response_date: string;
  responses: Record<string, string | number | boolean | string[]>;
  created_at: string;
  updated_at: string;
}

// Transform Supabase question to app format
const transformQuestion = (dbQuestion: SupabasePillarQuestion): PillarQuestion => {
  return {
    id: dbQuestion.question_id,
    pillar: dbQuestion.pillar,
    text: dbQuestion.question_text,
    type: dbQuestion.question_type,
    required: dbQuestion.required,
    options: dbQuestion.options || undefined,
    order: dbQuestion.order_index,
    conditional: dbQuestion.conditional_depends_on ? {
      dependsOn: dbQuestion.conditional_depends_on,
      showWhen: dbQuestion.conditional_show_when!
    } : undefined
  };
};

// Transform Supabase response to app format
const transformResponse = (dbResponse: SupabasePillarResponse): PillarResponse => {
  return {
    id: dbResponse.id,
    userId: dbResponse.user_id,
    pillar: dbResponse.pillar,
    responseDate: dbResponse.response_date,
    responses: dbResponse.responses,
    createdAt: dbResponse.created_at,
    updatedAt: dbResponse.updated_at
  };
};

// Get questions for a specific pillar
export const getQuestionsForPillar = async (pillar: string): Promise<PillarQuestion[]> => {
  try {
    const { data, error } = await supabase
      .from('pillar_questions')
      .select('*')
      .eq('pillar', pillar)
      .order('order_index', { ascending: true });

    if (error) {
      console.error('Error fetching questions from database:', error);
      throw new Error(`Failed to load questions for ${pillar}: ${error.message}`);
    }

    // Return empty array if no questions found (this is valid - some pillars may not have questions configured yet)
    return (data || []).map(transformQuestion);
  } catch (error) {
    console.error('Error in getQuestionsForPillar:', error);
    throw error; // Re-throw to let the UI handle the error state
  }
};

// Get visible questions based on form data and conditional logic
export const getVisibleQuestions = (
  questions: PillarQuestion[], 
  formData: Record<string, string | number | boolean | string[]>
): PillarQuestion[] => {
  return questions.filter(question => {
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
      return dependentValue.includes(showWhen as string);
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

// Save a response for a specific pillar and date
export const saveResponse = async (
  pillar: string,
  responseDate: string,
  responses: Record<string, string | number | boolean | string[]>,
  userId: string = 'default-user'
): Promise<PillarResponse> => {
  try {
    // Check if response already exists
    const { data: existingResponse } = await supabase
      .from('pillar_responses')
      .select('id')
      .eq('user_id', userId)
      .eq('pillar', pillar)
      .eq('response_date', responseDate)
      .limit(1)
      .maybeSingle();

    if (existingResponse) {
      // Update existing response
      const { data, error } = await supabase
        .from('pillar_responses')
        .update({
          responses,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingResponse.id)
        .select()
        .single();

      if (error) throw error;
      return transformResponse(data);
    } else {
      // Create new response
      const { data, error } = await supabase
        .from('pillar_responses')
        .insert({
          user_id: userId,
          pillar,
          response_date: responseDate,
          responses
        })
        .select()
        .single();

      if (error) throw error;
      return transformResponse(data);
    }
  } catch (error) {
    console.error('Error saving response:', error);
    throw new Error('Failed to save response');
  }
};

// Get a response for a specific pillar and date
export const getResponse = async (
  pillar: string,
  responseDate: string,
  userId: string = 'default-user'
): Promise<PillarResponse | null> => {
  try {
    const { data, error } = await supabase
      .from('pillar_responses')
      .select('*')
      .eq('user_id', userId)
      .eq('pillar', pillar)
      .eq('response_date', responseDate)
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    
    return data ? transformResponse(data) : null;
  } catch (error) {
    console.error('Error getting response:', error);
    throw new Error('Failed to load response');
  }
};

// Check if a response exists for a specific pillar and date
export const hasResponse = async (
  pillar: string,
  responseDate: string,
  userId: string = 'default-user'
): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('pillar_responses')
      .select('id')
      .eq('user_id', userId)
      .eq('pillar', pillar)
      .eq('response_date', responseDate)
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  } catch (error) {
    console.error('Error checking response existence:', error);
    return false;
  }
};

// Delete a response
export const deleteResponse = async (
  pillar: string,
  responseDate: string,
  userId: string = 'default-user'
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('pillar_responses')
      .delete()
      .eq('user_id', userId)
      .eq('pillar', pillar)
      .eq('response_date', responseDate);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting response:', error);
    throw new Error('Failed to delete response');
  }
};

// Get all responses for a specific pillar (for analytics)
export const getResponsesForPillar = async (
  pillar: string,
  userId: string = 'default-user'
): Promise<PillarResponse[]> => {
  try {
    const { data, error } = await supabase
      .from('pillar_responses')
      .select('*')
      .eq('user_id', userId)
      .eq('pillar', pillar)
      .order('response_date', { ascending: false });

    if (error) throw error;
    
    return (data || []).map(transformResponse);
  } catch (error) {
    console.error('Error getting pillar responses:', error);
    throw new Error('Failed to load pillar responses');
  }
};

// Format response data for form initialization
export const formatResponseForForm = (response: PillarResponse | null): Record<string, string | number | boolean | string[]> => {
  if (!response) {
    return {};
  }
  
  return response.responses || {};
};