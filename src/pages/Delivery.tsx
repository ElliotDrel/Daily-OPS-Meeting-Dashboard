import { useState, useEffect } from "react";
import { PillarLayout } from "@/components/pillar/PillarLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Truck, Clock, TrendingUp } from "lucide-react";
import { dashboardData, MeetingNote } from "@/data/mockData";
import { TrendLineChart } from "@/components/charts/TrendLineChart";
import { PieChartComponent } from "@/components/charts/PieChart";
import { ActionItemsAndNotesSection } from "@/components/dashboard/ActionItemsAndNotesSection";
import { saveMeetingNotesToFile, loadMeetingNotesFromFile } from "@/utils/dataUtils";
import { usePillarData } from "@/hooks/usePillarData";
import { useDate } from "@/contexts/DateContext";
import { PillarGraphsPane } from "@/components/pillar/PillarGraphsPane";
import { useChartData, useInvalidateChartData } from "@/hooks/useChartData";
import { getTimePeriodConfig } from "@/components/charts/TimePeriodSelector";


const deliveryMetrics = [
  { label: "On Time %", value: "92.5%", icon: Truck, color: "bg-status-good" },
  { label: "Late Deliveries", value: "15", icon: Clock, color: "bg-delivery" }
];

const actionItems = [
  { id: "1", text: "Late Shipments", status: "caution", count: 15 },
  { id: "2", text: "Customer Expedites", status: "issue", count: 3 },
  { id: "3", text: "On-Time Delivery", status: "good", count: 92 }
];

const correctiveActions = [
  { 
    id: "1", 
    problem: "Transportation delays affecting customer delivery", 
    action: "Negotiate backup transportation options with secondary carriers" 
  },
  { 
    id: "2", 
    problem: "Inventory shortage causing production delays", 
    action: "Implement safety stock levels and improve supplier lead time management" 
  },
  { 
    id: "3", 
    problem: "Production scheduling conflicts", 
    action: "Review and optimize production planning process for better customer commitment accuracy" 
  }
];

export const Delivery = () => {
  const { selectedDate } = useDate();
  const [selectedTimePeriod, setSelectedTimePeriod] = useState("1m");
  const timePeriodConfig = getTimePeriodConfig(selectedTimePeriod);
  
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
  } = usePillarData('delivery', selectedDate.toISOString().slice(0, 10));

  const {
    lineData,
    pieData,
    isLoading: isChartLoading,
    isError: isChartError,
    hasRealData,
    dataStatus,
    refetch: refetchChartData
  } = useChartData('delivery', { 
    months: timePeriodConfig.months,
    days: timePeriodConfig.days 
  });

  if (isLoading) {
    return (
      <PillarLayout
        letter="D"
        pillarName="Delivery"
        pillarColor="delivery"
      
        squares={dashboardData.pillars.delivery.squares}
        actionItems={actionItems}
      >
        <div className="flex justify-center items-center h-64">
          <p>Loading delivery data...</p>
        </div>
      </PillarLayout>
    );
  }

  const graphsPane = (
    <PillarGraphsPane
      pillarName="Delivery"
      pillarColor="delivery"
      lineChartData={lineData}
      pieChartData={pieData}
      metrics={deliveryMetrics}
      lineChartTitle={`On-Time Delivery - ${timePeriodConfig.label} Trend ${hasRealData ? '' : '(No Data)'}`}
      pieChartTitle={`Delivery Metrics Overview ${hasRealData ? '' : '(No Data)'}`}
      formatValue={(value) => `${value.toFixed(1)}%`}
      hasRealData={hasRealData}
      isLoading={isChartLoading}
      selectedTimePeriod={selectedTimePeriod}
      onTimePeriodChange={setSelectedTimePeriod}
      chartType="line"
    />
  );

  return (
    <PillarLayout
      letter="D"
      pillarName="Delivery"
      pillarColor="delivery"
      
      squares={dashboardData.pillars.delivery.squares}
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

        {/* Bottom Row - Corrective Actions Table */}
        <Card className="p-6 shadow-lg hidden">
          <h3 className="text-lg font-semibold text-delivery">Delivery Improvement Actions</h3>
          <div className="space-y-4">
            {correctiveActions.map((action) => (
              <div key={action.id} className="border rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Identified Problem</h4>
                    <p className="mt-1">{action.problem}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Required Action</h4>
                    <p className="mt-1">{action.action}</p>
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