import { PillarLayout } from "@/components/pillar/PillarLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, BarChart3, Users, Workflow } from "lucide-react";
import { dashboardData } from "@/data/mockData";
import { ActionItemsAndNotesSection } from "@/components/dashboard/ActionItemsAndNotesSection";
import { usePillarData } from "@/hooks/usePillarDataOptimized";
import { useDate } from "@/contexts/DateContext";

// Toggle this to hide/show charts and stats
const SHOW_CHARTS_AND_STATS = false;

const inventoryMetrics = [
  { label: "Process Efficiency", value: "85%", icon: Settings, color: "bg-status-good" },
  { label: "Resource Utilization", value: "72%", icon: BarChart3, color: "bg-status-caution" },
  { label: "Cross-Dept Collaboration", value: "91%", icon: Users, color: "bg-status-good" },
  { label: "Workflow Optimization", value: "68%", icon: Workflow, color: "bg-chart-blue" }
];


export const Inventory = () => {
  const { selectedDate } = useDate();
  const { 
    meetingNotes, 
    actionItems, 
    yesterdayMeetingNotes, 
    yesterdayActionItems, 
    createNote, 
    createItem, 
    updateItem, 
    isLoading 
  } = usePillarData('inventory', selectedDate.toISOString().slice(0, 10));

  if (isLoading) {
    return (
      <PillarLayout
        letter="I"
        pillarName="Inventory"
        pillarColor="inventory"
        squares={dashboardData.pillars.inventory.squares}
        actionItems={actionItems || []}
      >
        <div className="flex justify-center items-center h-64">
          <p>Loading inventory data...</p>
        </div>
      </PillarLayout>
    );
  }

  return (
    <PillarLayout
      letter="I"
      pillarName="Inventory"
      pillarColor="inventory"
      squares={dashboardData.pillars.inventory.squares}
      actionItems={actionItems || []}
    >
      <div className="space-y-6">
        {/* Metric Tiles */}
        {SHOW_CHARTS_AND_STATS && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {inventoryMetrics.map((metric, index) => (
            <Card key={index} className="p-4 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center space-x-3">
                <div className={`p-3 rounded-xl ${metric.color} shadow-lg`}>
                  <metric.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{metric.value}</p>
                  <p className="text-sm text-muted-foreground font-medium">{metric.label}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
        )}

        {/* Action Items and Notes Section */}
        <ActionItemsAndNotesSection 
          meetingNotes={meetingNotes}
          actionItems={actionItems}
          yesterdayMeetingNotes={yesterdayMeetingNotes}
          yesterdayActionItems={yesterdayActionItems}
          onAddNote={createNote}
          onAddActionItem={createItem}
          onUpdateActionItem={updateItem}
          pillar="inventory"
          actionItemsTitle="Internal Process Action Items"
          notesTitle="Internal Process Meeting Notes"
        />
      </div>
    </PillarLayout>
  );
};