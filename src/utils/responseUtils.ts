// Response persistence utilities for data collection system
// Following existing dataUtils pattern with localStorage as the storage mechanism

import { PillarResponse, StoredResponse } from '@/types/dataCollection';

const STORAGE_KEY = 'pillarResponses';
const USER_ID = 'default-user'; // For now using a default user ID

// Generate unique ID for responses
const generateId = (): string => {
  return `response-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Get all stored responses from localStorage
const getStoredResponses = (): StoredResponse => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error loading stored responses:', error);
    return {};
  }
};

// Save all responses to localStorage
const saveStoredResponses = (data: StoredResponse): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving responses:', error);
    throw new Error('Failed to save response data');
  }
};

// Save a response for a specific pillar and date
export const saveResponse = async (
  pillar: string,
  responseDate: string,
  responses: Record<string, string | number | boolean | string[]>
): Promise<PillarResponse> => {
  try {
    const now = new Date().toISOString();
    const storedData = getStoredResponses();
    
    // Initialize pillar data if it doesn't exist
    if (!storedData[pillar]) {
      storedData[pillar] = {};
    }
    
    // Check if response already exists for this date
    const existingResponse = storedData[pillar][responseDate];
    
    const response: PillarResponse = {
      id: existingResponse?.id || generateId(),
      userId: USER_ID,
      pillar,
      responseDate,
      responses,
      createdAt: existingResponse?.createdAt || now,
      updatedAt: now
    };
    
    // Save the response
    storedData[pillar][responseDate] = response;
    saveStoredResponses(storedData);
    
    console.log(`Response saved for ${pillar} on ${responseDate}:`, response);
    return response;
  } catch (error) {
    console.error('Error saving response:', error);
    throw new Error('Failed to save response');
  }
};

// Get a response for a specific pillar and date
export const getResponse = async (
  pillar: string,
  responseDate: string
): Promise<PillarResponse | null> => {
  try {
    const storedData = getStoredResponses();
    const response = storedData[pillar]?.[responseDate];
    
    if (response) {
      console.log(`Response loaded for ${pillar} on ${responseDate}:`, response);
      return response;
    }
    
    return null;
  } catch (error) {
    console.error('Error loading response:', error);
    return null;
  }
};

// Update an existing response
export const updateResponse = async (
  pillar: string,
  responseDate: string,
  responses: Record<string, string | number | boolean | string[]>
): Promise<PillarResponse> => {
  try {
    const storedData = getStoredResponses();
    const existingResponse = storedData[pillar]?.[responseDate];
    
    if (!existingResponse) {
      throw new Error('Response not found for update');
    }
    
    const updatedResponse: PillarResponse = {
      ...existingResponse,
      responses,
      updatedAt: new Date().toISOString()
    };
    
    storedData[pillar][responseDate] = updatedResponse;
    saveStoredResponses(storedData);
    
    console.log(`Response updated for ${pillar} on ${responseDate}:`, updatedResponse);
    return updatedResponse;
  } catch (error) {
    console.error('Error updating response:', error);
    throw new Error('Failed to update response');
  }
};

// Delete a response
export const deleteResponse = async (
  pillar: string,
  responseDate: string
): Promise<void> => {
  try {
    const storedData = getStoredResponses();
    
    if (storedData[pillar]?.[responseDate]) {
      delete storedData[pillar][responseDate];
      
      // Clean up empty pillar objects
      if (Object.keys(storedData[pillar]).length === 0) {
        delete storedData[pillar];
      }
      
      saveStoredResponses(storedData);
      console.log(`Response deleted for ${pillar} on ${responseDate}`);
    }
  } catch (error) {
    console.error('Error deleting response:', error);
    throw new Error('Failed to delete response');
  }
};

// Check if a response exists for a specific pillar and date
export const hasResponse = async (
  pillar: string,
  responseDate: string
): Promise<boolean> => {
  try {
    const storedData = getStoredResponses();
    return !!storedData[pillar]?.[responseDate];
  } catch (error) {
    console.error('Error checking response existence:', error);
    return false;
  }
};

// Get all responses for a specific pillar (for future analytics)
export const getResponsesForPillar = async (
  pillar: string
): Promise<PillarResponse[]> => {
  try {
    const storedData = getStoredResponses();
    const pillarData = storedData[pillar] || {};
    
    return Object.values(pillarData).sort(
      (a, b) => new Date(b.responseDate).getTime() - new Date(a.responseDate).getTime()
    );
  } catch (error) {
    console.error('Error loading pillar responses:', error);
    return [];
  }
};

// Get all responses across all pillars (for future admin interface)
export const getAllResponses = async (): Promise<PillarResponse[]> => {
  try {
    const storedData = getStoredResponses();
    const allResponses: PillarResponse[] = [];
    
    Object.values(storedData).forEach(pillarData => {
      allResponses.push(...Object.values(pillarData));
    });
    
    return allResponses.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  } catch (error) {
    console.error('Error loading all responses:', error);
    return [];
  }
};

// Format response data for form initialization
export const formatResponseForForm = (response: PillarResponse | null): Record<string, string | number | boolean | string[]> => {
  if (!response) {
    return {};
  }
  
  return response.responses || {};
};

// Validate response data structure
export const validateResponseData = (responses: Record<string, string | number | boolean | string[]>): boolean => {
  try {
    // Basic validation - ensure it's an object
    if (!responses || typeof responses !== 'object') {
      return false;
    }
    
    // Additional validation can be added here
    return true;
  } catch (error) {
    console.error('Error validating response data:', error);
    return false;
  }
};

// Clear all stored data (for development/testing)
export const clearAllResponses = async (): Promise<void> => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('All response data cleared');
  } catch (error) {
    console.error('Error clearing response data:', error);
    throw new Error('Failed to clear response data');
  }
};