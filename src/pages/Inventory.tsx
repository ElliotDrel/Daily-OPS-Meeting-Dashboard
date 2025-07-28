import { PillarLayout } from "@/components/pillar/PillarLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, BarChart3, Users, Workflow } from "lucide-react";
import { dashboardData } from "@/data/mockData";
import { ActionItemsAndNotesSection } from "@/components/dashboard/ActionItemsAndNotesSection";
import { usePillarData } from "@/hooks/usePillarData";
import { useDate } from "@/contexts/DateContext";
import { PillarGraphsPane } from "@/components/pillar/PillarGraphsPane";


const inventoryMetrics = [
  { label: "Process Efficiency", value: "85%", icon: Settings, color: "bg-status-good" },
  { label: "Resource Utilization", value: "72%", icon: BarChart3, color: "bg-status-caution" },
  { label: "Cross-Dept Collaboration", value: "91%", icon: Users, color: "bg-status-good" },
  { label: "Workflow Optimization", value: "68%", icon: Workflow, color: "bg-chart-blue" }
];

// Mock inventory data since it's not available in mockData
const inventoryData = {
  lineChart: [
    { month: 'Aug', value: 78, target: 85 },
    { month: 'Sep', value: 82, target: 85 },
    { month: 'Oct', value: 79, target: 85 },
    { month: 'Nov', value: 85, target: 85 },
    { month: 'Dec', value: 88, target: 85 }
  ],
  donutData: [
    { name: 'Raw Materials', value: 35, color: '#ef4444' },
    { name: 'Work in Process', value: 25, color: '#f97316' },
    { name: 'Finished Goods', value: 30, color: '#22c55e' },
    { name: 'Supplies', value: 10, color: '#3b82f6' }
  ]
};


export const Inventory = () => {
  const { selectedDate } = useDate();
  const { 
    meetingNote, 
    actionItems, 
    yesterdayMeetingNote, 
    yesterdayActionItems, 
    lastRecordedNote,
    upsertNote, 
    createItem, 
    updateItem, 
    deleteNote,
    isLoading,
    isYesterdayLoading,
    isLastRecordedLoading
  } = usePillarData('inventory', selectedDate.toISOString().slice(0, 10));

  if (isLoading) {
    return (
      <PillarLayout
        letter="I"
        pillarName="Inventory"
        pillarColor="inventory"
      pillar="inventory"
        squares={dashboardData.pillars.inventory.squares}
        actionItems={actionItems || []}
      >
        <div className="flex justify-center items-center h-64">
          <p>Loading inventory data...</p>
        </div>
      </PillarLayout>
    );
  }

  const graphsPane = (
    <PillarGraphsPane
      pillarName="Inventory"
      pillarColor="inventory"
      pillar="inventory"
      lineChartData={inventoryData.lineChart}
      pieChartData={inventoryData.donutData}
      metrics={inventoryMetrics}
      lineChartTitle="Inventory Levels - 5 Month Trend"
      pieChartTitle="Inventory Composition"
      formatValue={(value) => `${value.toFixed(1)}%`}
    />
  );

  return (
    <PillarLayout
      letter="I"
      pillarName="Inventory"
      pillarColor="inventory"
      pillar="inventory"
      squares={dashboardData.pillars.inventory.squares}
      actionItems={actionItems || []}
      graphsPane={graphsPane}
    >
      <div className="space-y-6">

        {/* Action Items and Notes Section */}
        <ActionItemsAndNotesSection 
          meetingNote={meetingNote}
          actionItems={actionItems}
          yesterdayMeetingNote={yesterdayMeetingNote}
          yesterdayActionItems={yesterdayActionItems}
          lastRecordedNote={lastRecordedNote}
          onUpsertNote={upsertNote}
          onDeleteNote={deleteNote}
          onAddActionItem={createItem}
          onUpdateActionItem={updateItem}
          pillar="inventory"
          actionItemsTitle="Internal Process Action Items"
          notesTitle="Internal Process Meeting Notes"
          isLoading={isLoading}
          selectedDate={selectedDate.toISOString().slice(0, 10)}
          isYesterdayLoading={isYesterdayLoading}
          isLastRecordedLoading={isLastRecordedLoading}
        />
      </div>
    </PillarLayout>
  );
};