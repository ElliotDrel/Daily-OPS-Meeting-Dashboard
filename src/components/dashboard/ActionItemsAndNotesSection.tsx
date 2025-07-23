import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { MeetingNote, ActionItem } from "@/hooks/usePillarData";
import { format } from "date-fns";
import { ActionItemsSection } from "./ActionItemsSection";
import { NotesSection } from "./NotesSection";
import { YesterdayActionItemsSection } from "./YesterdayActionItemsSection";
import { YesterdayNotesSection } from "./YesterdayNotesSection";

interface ActionItemsAndNotesSectionProps {
  meetingNotes?: MeetingNote[];
  actionItems?: ActionItem[];
  yesterdayMeetingNotes?: MeetingNote[];
  yesterdayActionItems?: ActionItem[];
  onAddNote: (keyPoints: string) => Promise<void>;
  onAddActionItem: (item: Omit<ActionItem, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onUpdateActionItem: (id: string, updates: Partial<ActionItem>) => Promise<void>;
  pillar: string;
  actionItemsTitle?: string;
  notesTitle?: string;
  onUpdateActionItems?: (items: ActionItem[]) => void;
  onUpdateMeetingNotes?: (notes: MeetingNote[]) => void;
}

export const ActionItemsAndNotesSection = ({
  actionItems,
  meetingNotes,
  yesterdayActionItems,
  yesterdayMeetingNotes,
  onUpdateActionItems,
  onUpdateMeetingNotes,
  actionItemsTitle,
  notesTitle,
  onAddNote,
  onAddActionItem,
  onUpdateActionItem,
  pillar
}: ActionItemsAndNotesSectionProps) => {
  if (!meetingNotes || !actionItems) {
    return <div className="flex justify-center items-center h-32">Loading...</div>;
  }

  // Check if we have yesterday's data to show
  const hasYesterdayData = (yesterdayActionItems && yesterdayActionItems.length > 0) || 
                          (yesterdayMeetingNotes && yesterdayMeetingNotes.length > 0);

  return (
    <div className="space-y-6">
      {/* Today's Section */}
      <Card className="p-0 shadow-lg overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px]">
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
              meetingNotes={meetingNotes || []}
              title={notesTitle}
              onUpdateMeetingNotes={onUpdateMeetingNotes}
              showCard={false}
              onAddNote={onAddNote}
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
                meetingNotes={yesterdayMeetingNotes || []}
                showCard={false}
              />
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};