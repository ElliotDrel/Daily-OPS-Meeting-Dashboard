// Daily Transcript Service - Supabase integration for transcript storage
// Following the same patterns as dataCollectionService.ts

import { supabase } from '@/lib/supabase';
import { DailyTranscript, CreateTranscriptData, UpdateTranscriptData } from '@/types/transcript';
import { cleanTranscriptData } from '@/utils/transcriptUtils';

export class TranscriptService {

  /**
   * Get a transcript by date
   * Returns null if no transcript exists for the given date
   */
  static async getTranscriptByDate(date: string): Promise<DailyTranscript | null> {
    try {
      const { data, error } = await supabase
        .from('daily_transcripts')
        .select('*')
        .eq('date', date)
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      
      return data || null;
    } catch (error) {
      console.error('Error fetching transcript:', error);
      throw new Error(`Failed to load transcript for ${date}`);
    }
  }

  /**
   * Create or update a transcript for a specific date
   * Uses upsert to handle both create and update scenarios
   * Automatically removes computer-generated transcript script text before saving
   * 
   * Note: We remove the disclaimer because it interferes with AI note processing
   * and can confuse AI systems that analyze the transcript content.
   */
  static async upsertTranscript(
    date: string,
    data: CreateTranscriptData | UpdateTranscriptData
  ): Promise<DailyTranscript> {
    try {
      // Clean the data by removing script text before saving
      const cleanedData = cleanTranscriptData(data);
      
      const { data: result, error } = await supabase
        .from('daily_transcripts')
        .upsert({
          date,
          ...cleanedData,
        }, {
          onConflict: 'date'
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    } catch (error) {
      console.error('Error saving transcript:', error);
      throw new Error(`Failed to save transcript for ${date}`);
    }
  }

  /**
   * Get all dates that have transcripts within a date range
   * Used for calendar status indicators
   */
  static async getTranscriptDates(
    startDate: string,
    endDate: string
  ): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('daily_transcripts')
        .select('date')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true });

      if (error) throw error;
      return (data || []).map(item => item.date);
    } catch (error) {
      console.error('Error fetching transcript dates:', error);
      throw new Error(`Failed to load transcript dates for range ${startDate} to ${endDate}`);
    }
  }

  /**
   * Check if a transcript exists for a specific date
   * Returns boolean indicating existence
   */
  static async hasTranscript(date: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('daily_transcripts')
        .select('id')
        .eq('date', date)
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    } catch (error) {
      console.error('Error checking transcript existence:', error);
      return false;
    }
  }

  /**
   * Delete a transcript for a specific date
   * Used for cleanup operations
   */
  static async deleteTranscript(date: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('daily_transcripts')
        .delete()
        .eq('date', date);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting transcript:', error);
      throw new Error(`Failed to delete transcript for ${date}`);
    }
  }

  /**
   * Get multiple transcripts for a date range
   * Used for bulk operations or analytics
   */
  static async getTranscriptsInRange(
    startDate: string,
    endDate: string
  ): Promise<DailyTranscript[]> {
    try {
      const { data, error } = await supabase
        .from('daily_transcripts')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching transcripts in range:', error);
      throw new Error(`Failed to load transcripts for range ${startDate} to ${endDate}`);
    }
  }
}