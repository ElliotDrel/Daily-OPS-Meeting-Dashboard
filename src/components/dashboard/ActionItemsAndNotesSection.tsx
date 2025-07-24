import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { MeetingNote, ActionItem } from "@/hooks/usePillarData";
import { format } from "date-fns";
import { ActionItemsSection } from "./ActionItemsSection";
import { NotesSection } from "./NotesSection";
import { YesterdayActionItemsSection } from "./YesterdayActionItemsSection";
import { YesterdayNotesSection } from "./YesterdayNotesSection";

interface ActionItemsAndNotesSectionProps {
  meetingNote?: MeetingNote | null;
  actionItems?: ActionItem[];
  yesterdayMeetingNote?: MeetingNote | null;
  yesterdayActionItems?: ActionItem[];
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
}

export const ActionItemsAndNotesSection = ({
  actionItems,
  meetingNote,
  yesterdayActionItems,
  yesterdayMeetingNote,
  onUpdateActionItems,
  actionItemsTitle,
  notesTitle,
  onUpsertNote,
  onDeleteNote,
  onAddActionItem,
  onUpdateActionItem,
  onDeleteActionItem,
  pillar,
  isLoading = false
}: ActionItemsAndNotesSectionProps) => {
  if (isLoading) {
    return <div className="flex justify-center items-center h-32">Loading...</div>;
  }

  // Check if we have yesterday's data to show
  const hasYesterdayData = (yesterdayActionItems && yesterdayActionItems.length > 0) || 
                          Boolean(yesterdayMeetingNote);

  return (
    <div className="space-y-6">
      {/* Today's Section */}
      <Card className="p-0 shadow-lg overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Left Half - Action Items */}
          <div className="border-r border-border">
            <ActionItemsSection
              actionItems={actionItems || []}
              title={actionItemsTitle}
              onUpdateActionItems={onUpdateActionItems}
              showCard={false}
            />
          </div>
          
          {/* Right Half - Notes */}
          <div>
            <NotesSection
              meetingNote={meetingNote}
              title={notesTitle}
              showCard={false}
              onUpsertNote={onUpsertNote}
              onDeleteNote={onDeleteNote}
              isLoading={isLoading}
            />
          </div>
        </div>
      </Card>

      {/* Yesterday's Section - Only show if there's data */}
      {hasYesterdayData && (
        <Card className="p-0 shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Left Half - Yesterday's Action Items */}
            <div className="border-r border-border">
              <YesterdayActionItemsSection
                actionItems={yesterdayActionItems || []}
                showCard={false}
              />
            </div>
            
            {/* Right Half - Yesterday's Notes */}
            <div>
              <YesterdayNotesSection
                meetingNote={yesterdayMeetingNote}
                showCard={false}
              />
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};