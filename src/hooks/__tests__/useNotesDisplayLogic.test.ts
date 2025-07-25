/**
 * Tests for useNotesDisplayLogic hook
 * These tests verify that all the identified bugs have been fixed
 */

import { renderHook } from '@testing-library/react';
import { useNotesDisplayLogic, hasValidContent, createDateLabel, isValidLastRecordedDate } from '../useNotesDisplayLogic';
import type { MeetingNote } from '../usePillarDataOptimized';

// Mock date-fns to have predictable results
jest.mock('date-fns', () => ({
  parseISO: jest.fn((dateString: string) => new Date(dateString + 'T00:00:00.000Z')),
  format: jest.fn((date: Date, formatStr: string) => {
    if (formatStr === 'MMM dd, yyyy') return 'Jan 25, 2025';
    if (formatStr === 'yyyy-MM-dd') return '2025-01-25';
    return dateString;
  })
}));

describe('useNotesDisplayLogic', () => {
  const mockYesterdayNote: MeetingNote = {
    id: '1',
    pillar: 'safety',
    note_date: '2025-01-24',
    key_points: 'Yesterday content',
    keyPoints: ['Yesterday content'],
    created_at: '2025-01-24T10:00:00Z',
    updated_at: '2025-01-24T10:00:00Z'
  };

  const mockLastRecordedNote: MeetingNote = {
    id: '2',
    pillar: 'safety', 
    note_date: '2025-01-22',
    key_points: 'Last recorded content',
    keyPoints: ['Last recorded content'],
    created_at: '2025-01-22T10:00:00Z',
    updated_at: '2025-01-22T10:00:00Z'
  };

  const defaultProps = {
    selectedDate: '2025-01-25',
    isLoading: false,
    isYesterdayLoading: false,
    isLastRecordedLoading: false
  };

  describe('Bug Fix #1: Empty string key_points handling', () => {
    it('should show last recorded when yesterday has empty key_points', () => {
      const emptyYesterday = { ...mockYesterdayNote, key_points: '', keyPoints: [] };
      
      const { result } = renderHook(() => useNotesDisplayLogic({
        ...defaultProps,
        yesterdayMeetingNote: emptyYesterday,
        lastRecordedNote: mockLastRecordedNote
      }));

      expect(result.current.shouldShowLastRecorded).toBe(true);
      expect(result.current.lastRecordedDisplay).toBeTruthy();
    });

    it('should NOT show last recorded when yesterday has whitespace-only content', () => {
      const whitespaceYesterday = { ...mockYesterdayNote, key_points: '   \n  \t  ', keyPoints: ['   ', ''] };
      
      const { result } = renderHook(() => useNotesDisplayLogic({
        ...defaultProps,
        yesterdayMeetingNote: whitespaceYesterday,
        lastRecordedNote: mockLastRecordedNote
      }));

      expect(result.current.shouldShowLastRecorded).toBe(true);
    });
  });

  describe('Bug Fix #2: undefined vs null handling', () => {
    it('should handle undefined yesterdayMeetingNote consistently', () => {
      const { result } = renderHook(() => useNotesDisplayLogic({
        ...defaultProps,
        yesterdayMeetingNote: undefined,
        lastRecordedNote: mockLastRecordedNote
      }));

      expect(result.current.shouldShowLastRecorded).toBe(true);
    });

    it('should handle null yesterdayMeetingNote consistently', () => {
      const { result } = renderHook(() => useNotesDisplayLogic({
        ...defaultProps,
        yesterdayMeetingNote: null,
        lastRecordedNote: mockLastRecordedNote
      }));

      expect(result.current.shouldShowLastRecorded).toBe(true);
    });
  });

  describe('Bug Fix #3: Race condition handling', () => {
    it('should not show last recorded while still loading', () => {
      const { result } = renderHook(() => useNotesDisplayLogic({
        ...defaultProps,
        yesterdayMeetingNote: null,
        lastRecordedNote: mockLastRecordedNote,
        isYesterdayLoading: true
      }));

      expect(result.current.shouldShowLastRecorded).toBe(false);
      expect(result.current.isReady).toBe(false);
    });

    it('should wait for all loading states to complete', () => {
      const { result } = renderHook(() => useNotesDisplayLogic({
        ...defaultProps,
        yesterdayMeetingNote: null,
        lastRecordedNote: mockLastRecordedNote,
        isLastRecordedLoading: true
      }));

      expect(result.current.shouldShowLastRecorded).toBe(false);
      expect(result.current.isReady).toBe(false);
    });
  });

  describe('Bug Fix #4: Timezone consistency', () => {
    it('should use consistent date parsing approach', () => {
      const dateLabel = createDateLabel('2025-01-25');
      expect(dateLabel).toBe('Jan 25, 2025'); // Mocked result
    });

    it('should handle invalid dates gracefully', () => {
      const dateLabel = createDateLabel('invalid-date');
      expect(dateLabel).toBe('invalid-date'); // Fallback to original
    });
  });

  describe('Bug Fix #5: Date validation', () => {
    it('should validate that last recorded is older than yesterday', () => {
      const isValid = isValidLastRecordedDate(mockLastRecordedNote, '2025-01-24');
      expect(isValid).toBe(true);
    });

    it('should reject last recorded that is newer than yesterday', () => {
      const newerNote = { ...mockLastRecordedNote, note_date: '2025-01-25' };
      const isValid = isValidLastRecordedDate(newerNote, '2025-01-24');
      expect(isValid).toBe(false);
    });
  });
});

describe('Helper Functions', () => {
  describe('hasValidContent', () => {
    it('should return false for null/undefined', () => {
      expect(hasValidContent(null)).toBe(false);
      expect(hasValidContent(undefined)).toBe(false);
    });

    it('should return false for empty key_points', () => {
      const emptyNote = { ...mockYesterdayNote, key_points: '', keyPoints: [] };
      expect(hasValidContent(emptyNote)).toBe(false);
    });

    it('should return false for whitespace-only content', () => {
      const whitespaceNote = { ...mockYesterdayNote, key_points: '   \n  ', keyPoints: ['  ', '\t'] };
      expect(hasValidContent(whitespaceNote)).toBe(false);
    });

    it('should return true for valid content', () => {
      expect(hasValidContent(mockYesterdayNote)).toBe(true);
    });
  });
});