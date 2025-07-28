import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { FileText, Calendar } from "lucide-react";
import type { MeetingNote } from "@/hooks/usePillarData";
import { format } from "date-fns";
import { useDelayedTooltip } from "@/hooks/useDelayedTooltip";

// Helper function to strip bullets from text
const stripBullets = (text: string): string => {
  return text.replace(/^[•·\-*]\s*/, '').trim();
};

interface YesterdayNotesSectionProps {
  meetingNote?: MeetingNote | null;
  title?: string;
  showCard?: boolean;
}

const NotesCard = ({ meetingNote }: { meetingNote: MeetingNote }) => {
  const tooltip = useDelayedTooltip(5000);

  return (
    <Tooltip open={tooltip.isOpen} onOpenChange={(open) => !open && tooltip.handleClose()}>
      <TooltipTrigger asChild>
        <div 
          className="border border-muted/50 rounded-lg p-4 bg-background/50 hover:bg-muted/30 transition-colors cursor-help"
          onMouseEnter={tooltip.handleMouseEnter}
          onMouseLeave={tooltip.handleMouseLeave}
          onClick={tooltip.handleClick}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Meeting Notes</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {format(new Date(meetingNote.note_date), 'MMM dd, yyyy')}
            </span>
          </div>
          
          <div className="space-y-2">
            {meetingNote.keyPoints && meetingNote.keyPoints.length > 0 ? (
              <ul className="space-y-1 list-none">
                {meetingNote.keyPoints.map((point, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-sm text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground flex-1">{stripBullets(point)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground italic">No key points recorded</p>
            )}
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs bg-black/95 text-white border-black shadow-2xl">
        <p>These notes can only be edited on the day they were created</p>
      </TooltipContent>
    </Tooltip>
  );
};

export const YesterdayNotesSection = ({ 
  meetingNote, 
  title = "Yesterday's Meeting Notes", 
  showCard = true 
}: YesterdayNotesSectionProps) => {
  if (!meetingNote) {
    return (
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Calendar className="w-5 h-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-muted-foreground">{title}</h3>
        </div>
        <div className="text-center py-8 text-muted-foreground">
          <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No notes from yesterday</p>
        </div>
      </div>
    );
  }

  const content = (
    <>
      <div className="flex items-center space-x-2 mb-4">
        <Calendar className="w-5 h-5 text-muted-foreground" />
        <h3 className="text-lg font-semibold text-muted-foreground">{title}</h3>
      </div>

      <div className="space-y-4 opacity-75">
        <NotesCard meetingNote={meetingNote} />
      </div>
    </>
  );

  if (showCard) {
    return (
      <Card className="p-6 shadow-lg border-muted/50 bg-muted/20">
        {content}
      </Card>
    );
  }

  return <div className="p-6 bg-muted/20 rounded-lg border border-muted/50">{content}</div>;
};