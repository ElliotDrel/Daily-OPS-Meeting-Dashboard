import { PillarLayout } from "@/components/pillar/PillarLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingDown, Package, Clock } from "lucide-react";
import { dashboardData, costData } from "@/data/mockData";
import { TrendLineChart } from "@/components/charts/TrendLineChart";
import { PieChartComponent } from "@/components/charts/PieChart";
import { ActionItemsAndNotesSection } from "@/components/dashboard/ActionItemsAndNotesSection";
import { usePillarData } from "@/hooks/usePillarData";
import { useDate } from "@/contexts/DateContext";
import { PillarGraphsPane } from "@/components/pillar/PillarGraphsPane";


const costMetrics = [
  { label: "Scrap Cost", value: "$12.5K", icon: DollarSign, color: "bg-status-issue" },
  { label: "Yield %", value: "94.2%", icon: TrendingDown, color: "bg-status-good" },
  { label: "Excess Inventory", value: "$45K", icon: Package, color: "bg-status-caution" },
  { label: "Overtime Hours", value: "156", icon: Clock, color: "bg-status-caution" }
];

const actionItems = [
  { id: "1", text: "Cost Variances", status: "caution", count: 3 },
  { id: "2", text: "Budget Reviews", status: "good", count: 1 },
  { id: "3", text: "Yield Issues", status: "issue", count: 2 }
];

const lowYieldEvents = [
  { 
    id: "1", 
    event: "Low yield in molding process", 
    rootCause: "Material temperature variation",
    fix: "Implement better temperature control system"
  },
  { 
    id: "2", 
    event: "High scrap rate in cutting operation", 
    rootCause: "Worn cutting tools",
    fix: "Replace cutting tools and implement preventive maintenance schedule"
  },
  { 
    id: "3", 
    event: "Excess inventory buildup", 
    rootCause: "Inaccurate demand forecasting",
    fix: "Improve demand planning process and supplier coordination"
  }
];

export const Cost = () => {
  const { selectedDate } = useDate();
  const { 
    meetingNote, 
    actionItems, 
    yesterdayMeetingNote, 
    yesterdayActionItems, 
    lastRecordedNote,
    lastRecordedActionItems,
    upsertNote, 
    createItem, 
    updateItem, 
    deleteNote,
    isLoading,
    isYesterdayLoading,
    isLastRecordedLoading,
    isLastRecordedActionItemsLoading
  } = usePillarData('cost', selectedDate.toISOString().slice(0, 10));

  if (isLoading) {
    return (
      <PillarLayout
        letter="C"
        pillarName="Cost"
        pillarColor="cost"
      
        squares={dashboardData.pillars.cost.squares}
        actionItems={actionItems}
      >
        <div className="flex justify-center items-center h-64">
          <p>Loading cost data...</p>
        </div>
      </PillarLayout>
    );
  }

  const graphsPane = (
    <PillarGraphsPane
      pillarName="Cost"
      pillarColor="cost"
      
      lineChartData={costData.lineChart}
      pieChartData={costData.donutData}
      metrics={costMetrics}
      lineChartTitle="Cost Variance - 5 Month Trend"
      pieChartTitle="Cost Analysis Overview"
      formatValue={(value) => `$${(value / 1000).toFixed(0)}K`}
    />
  );

  return (
    <PillarLayout
      letter="C"
      pillarName="Cost"
      pillarColor="cost"
      
      squares={dashboardData.pillars.cost.squares}
      actionItems={actionItems}
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
          lastRecordedActionItems={lastRecordedActionItems}
          onUpsertNote={upsertNote}
          onDeleteNote={deleteNote}
          onAddActionItem={createItem}
          onUpdateActionItem={updateItem}
          
          isLoading={isLoading}
          selectedDate={selectedDate.toISOString().slice(0, 10)}
          isYesterdayLoading={isYesterdayLoading}
          isLastRecordedLoading={isLastRecordedLoading}
          isLastRecordedActionItemsLoading={isLastRecordedActionItemsLoading}
        />

        {/* Bottom Row - Low Yield Events Table */}
        <Card className="p-6 shadow-lg hidden">
          <h3 className="text-lg font-semibold text-cost">Low Yield Events & Actions</h3>
          <div className="space-y-4">
            {lowYieldEvents.map((event) => (
              <div key={event.id} className="border rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Event</h4>
                    <p className="mt-1">{event.event}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Root Cause</h4>
                    <p className="mt-1">{event.rootCause}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Planned Fix</h4>
                    <p className="mt-1">{event.fix}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </PillarLayout>
  );
};