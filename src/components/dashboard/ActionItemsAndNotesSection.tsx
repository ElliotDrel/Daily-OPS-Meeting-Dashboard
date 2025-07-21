import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ActionItemsSection, ActionItem } from "./ActionItemsSection";
import { NotesSection, MeetingNote } from "./NotesSection";

interface ActionItemsAndNotesSectionProps {
  actionItems: ActionItem[];
  meetingNotes: MeetingNote[];
  onUpdateActionItems?: (actionItems: ActionItem[]) => void;
  onUpdateMeetingNotes?: (meetingNotes: MeetingNote[]) => void;
  actionItemsTitle?: string;
  notesTitle?: string;
}

export const ActionItemsAndNotesSection = ({
  actionItems,
  meetingNotes,
  onUpdateActionItems,
  onUpdateMeetingNotes,
  actionItemsTitle,
  notesTitle,
}: ActionItemsAndNotesSectionProps) => {
  return (
    <Card className="p-0 shadow-lg overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px]">
        {/* Left Half - Action Items */}
        <div className="border-r border-border">
          <ActionItemsSection
            actionItems={actionItems}
            title={actionItemsTitle}
            onUpdateActionItems={onUpdateActionItems}
            showCard={false}
          />
        </div>
        
        {/* Right Half - Notes */}
        <div>
          <NotesSection
            meetingNotes={meetingNotes}
            title={notesTitle}
            onUpdateMeetingNotes={onUpdateMeetingNotes}
            showCard={false}
          />
        </div>
      </div>
    </Card>
  );
};