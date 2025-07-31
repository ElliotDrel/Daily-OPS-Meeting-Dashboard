import { MeetingNote } from "@/data/mockData";

// Save meeting notes to JSON file
export const saveMeetingNotesToFile = async (updatedNotes: MeetingNote[], pillar: string): Promise<void> => {
  try {
    // Read current JSON file
    const response = await fetch('/src/data/meetingNotes.json');
    const data = await response.json();
    
    // Update the specific pillar's notes
    const updatedData = {
      ...data,
      meetingNotes: data.meetingNotes.map((note: MeetingNote) => {
        // If this note belongs to the current pillar, update it
        const updatedNote = updatedNotes.find(updated => updated.id === note.id);
        if (updatedNote && note.pillar === pillar) {
          return { ...note, ...updatedNote };
        }
        return note;
      })
    };
    
    // Add any new notes for this pillar
    const existingIds = data.meetingNotes.map((note: MeetingNote) => note.id);
    const newNotes = updatedNotes.filter(note => !existingIds.includes(note.id));
    newNotes.forEach(note => {
      updatedData.meetingNotes.push({ ...note, pillar });
    });
    
    // In a real application, this would make an API call to save the data
    // For now, we'll store in localStorage as a fallback
    localStorage.setItem('meetingNotesData', JSON.stringify(updatedData));
    
    // You could also make an API call here:
    // await fetch('/api/meeting-notes', { 
    //   method: 'POST', 
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(updatedData) 
    // });
    
  } catch (error) {
    // Fallback: save to localStorage
    localStorage.setItem(`meetingNotes_${pillar}`, JSON.stringify(updatedNotes));
  }
};

// Load meeting notes from file or localStorage fallback
export const loadMeetingNotesFromFile = async (pillar: string): Promise<MeetingNote[]> => {
  try {
    // First try to load from localStorage (our fallback storage)
    const localData = localStorage.getItem('meetingNotesData');
    if (localData) {
      const data = JSON.parse(localData);
      return data.meetingNotes
        .filter((note: MeetingNote) => note.pillar === pillar)
        .map((note: MeetingNote) => ({
          id: note.id,
          date: note.date,
          keyPoints: note.keyPoints
        }));
    }
    
    // Fallback to original file
    const response = await fetch('/src/data/meetingNotes.json');
    const data = await response.json();
    return data.meetingNotes
      .filter((note: MeetingNote) => note.pillar === pillar)
      .map((note: MeetingNote) => ({
        id: note.id,
        date: note.date,
        keyPoints: note.keyPoints
      }));
  } catch (error) {
    return [];
  }
};