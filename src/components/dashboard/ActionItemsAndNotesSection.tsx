import { Card } from "@/components/ui/card";
import type { MeetingNote, ActionItem } from "@/hooks/usePillarData";
import { ActionItemsSection } from "./ActionItemsSection";
import { NotesSection } from "./NotesSection";

interface ActionItemsAndNotesSectionProps {
  meetingNote?: MeetingNote | null;
  actionItems?: ActionItem[];
  yesterdayMeetingNote?: MeetingNote | null;
  yesterdayActionItems?: ActionItem[];
  lastRecordedNote?: MeetingNote | null;
  onUpsertNote: (keyPoints: string) => Promise<void>;
  onDeleteNote?: (id: string) => void;
  onAddActionItem: (item: Omit<ActionItem, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onUpdateActionItem: (id: string, updates: Partial<ActionItem>) => Promise<void>;
  onDeleteActionItem?: (id: string) => void;
  pillar: string;
  actionItemsTitle?: string;
  notesTitle?: string;
  onUpdateActionItems?: (items: ActionItem[]) => void;
  isLoading?: boolean;
  selectedDate?: string; // Current selected date in YYYY-MM-DD format
  // New loading state props for improved display logic
  isYesterdayLoading?: boolean;
  isLastRecordedLoading?: boolean;
}

export const ActionItemsAndNotesSection = ({
  actionItems,
  meetingNote,
  yesterdayActionItems,
  yesterdayMeetingNote,
  lastRecordedNote,
  onUpdateActionItems,
  actionItemsTitle,
  notesTitle,
  onUpsertNote,
  onDeleteNote,
  onAddActionItem,
  onUpdateActionItem,
  onDeleteActionItem,
  pillar,
  isLoading = false,
  selectedDate,
  isYesterdayLoading = false,
  isLastRecordedLoading = false
}: ActionItemsAndNotesSectionProps) => {
  if (isLoading) {
    return <div className="flex justify-center items-center h-32">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Notes Section - Top */}
      <Card className="p-0 shadow-lg overflow-hidden">
        <NotesSection
          meetingNote={meetingNote}
          yesterdayMeetingNote={yesterdayMeetingNote}
          lastRecordedNote={lastRecordedNote}
          title={notesTitle}
          showCard={false}
          onUpsertNote={onUpsertNote}
          onDeleteNote={onDeleteNote}
          isLoading={isLoading}
          selectedDate={selectedDate}
          isYesterdayLoading={isYesterdayLoading}
          isLastRecordedLoading={isLastRecordedLoading}
        />
      </Card>

      {/* Action Items Section - Bottom */}
      <Card className="p-0 shadow-lg overflow-hidden">
        <ActionItemsSection
          actionItems={actionItems || []}
          yesterdayActionItems={yesterdayActionItems || []}
          title={actionItemsTitle}
          onUpdateActionItems={onUpdateActionItems}
          showCard={false}
        />
      </Card>
    </div>
  );
};