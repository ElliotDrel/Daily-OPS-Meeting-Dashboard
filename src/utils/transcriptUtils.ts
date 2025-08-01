/**
 * Transcript utility functions for cleaning and processing transcript content
 */

/**
 * Remove the computer-generated transcript disclaimer script from content
 * This script appears in AI-generated transcripts and should be removed before storage
 * 
 * We remove this disclaimer because it interferes with AI note processing and analysis.
 * The disclaimer text can confuse AI systems that process the transcript content,
 * leading to inaccurate analysis and note generation.
 */
export function removeTranscriptScript(content: string): string {
  const scriptText = "This editable transcript was computer generated and might contain errors. People can also change the text after it was created.";
  
  // Remove the exact script text (case-insensitive)
  let cleanedContent = content.replace(new RegExp(scriptText, 'gi'), '');
  
  // Also remove variations with different spacing/punctuation
  const variations = [
    "This editable transcript was computer generated and might contain errors. People can also change the text after it was created.",
    "This editable transcript was computer-generated and might contain errors. People can also change the text after it was created.",
    "This editable transcript was computer generated and might contain errors. People can also change the text after it was created",
    "This editable transcript was computer-generated and might contain errors. People can also change the text after it was created"
  ];
  
  variations.forEach(variation => {
    cleanedContent = cleanedContent.replace(new RegExp(variation, 'gi'), '');
  });
  
  // Clean up any extra whitespace that might be left
  cleanedContent = cleanedContent.replace(/\n\s*\n\s*\n/g, '\n\n'); // Remove excessive line breaks
  cleanedContent = cleanedContent.trim();
  
  return cleanedContent;
}

/**
 * Check if content contains the transcript script
 */
export function containsTranscriptScript(content: string): boolean {
  const scriptText = "This editable transcript was computer generated and might contain errors. People can also change the text after it was created.";
  return new RegExp(scriptText, 'gi').test(content);
}

/**
 * Clean transcript data by removing script text
 */
export function cleanTranscriptData(data: { transcript?: string; additional_notes?: string }): { transcript?: string; additional_notes?: string } {
  const cleanedData = { ...data };
  
  if (cleanedData.transcript) {
    cleanedData.transcript = removeTranscriptScript(cleanedData.transcript);
  }
  
  if (cleanedData.additional_notes) {
    cleanedData.additional_notes = removeTranscriptScript(cleanedData.additional_notes);
  }
  
  return cleanedData;
} 