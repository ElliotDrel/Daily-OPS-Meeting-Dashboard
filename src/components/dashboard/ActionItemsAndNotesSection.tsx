import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { MeetingNote, ActionItem } from "@/hooks/usePillarData";
import { format } from "date-fns";
import { ActionItemsSection } from "./ActionItemsSection";
import { NotesSection } from "./NotesSection";

interface ActionItemsAndNotesSectionProps {
  meetingNotes?: MeetingNote[];
  actionItems?: ActionItem[];
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
  return (
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
          />
        </div>
      </div>
    </Card>
  );
};