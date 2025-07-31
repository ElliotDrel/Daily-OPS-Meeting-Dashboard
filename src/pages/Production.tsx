import { useState, useEffect } from "react";
import { PillarLayout } from "@/components/pillar/PillarLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Target, AlertTriangle, Activity, TrendingUp, Clock } from "lucide-react";
import { dashboardData, MeetingNote } from "@/data/mockData";
import { TrendLineChart } from "@/components/charts/TrendLineChart";
import { PieChartComponent } from "@/components/charts/PieChart";
import { ActionItemsAndNotesSection } from "@/components/dashboard/ActionItemsAndNotesSection";
import { saveMeetingNotesToFile, loadMeetingNotesFromFile } from "@/utils/dataUtils";
import { usePillarData } from "@/hooks/usePillarData";
import { useDate } from "@/contexts/DateContext";
import { PillarGraphsPane } from "@/components/pillar/PillarGraphsPane";
import { useChartDataWithStrategy, useInvalidateChartData } from "@/hooks/useChartData";
import { getTimePeriodConfig, mapLegacyPeriod } from "@/components/charts/TimePeriodSelector";


const productionMetrics = [
  { label: "People on Shift", value: "24/28", icon: Users, color: "bg-status-caution" },
  { label: "Planned Output", value: "1,500", icon: Target, color: "bg-chart-blue" },
  { label: "No Shows", value: "4", icon: AlertTriangle, color: "bg-status-issue" },
  { label: "Actual Output", value: "1,420", icon: Activity, color: "bg-status-good" },
  { label: "Output Efficiency", value: "95%", icon: TrendingUp, color: "bg-status-good" },
  { label: "Shift Coverage", value: "86%", icon: Clock, color: "bg-status-caution" }
];

const actionItems = [
  { id: "1", text: "Staffing Shortage", status: "issue", count: 4 },
  { id: "2", text: "Output Targets", status: "caution", count: 2 },
  { id: "3", text: "Line Efficiency", status: "good", count: 5 }
];

const openProcesses = [
  { 
    id: "1", 
    process: "Shift Scheduling Optimization", 
    description: "Implement flexible scheduling to address staffing gaps",
    count: 8
  },
  { 
    id: "2", 
    process: "Output Target Adjustment", 
    description: "Recalibrate production targets based on current capacity",
    count: 3
  },
  { 
    id: "3", 
    process: "Operator Cross-Training", 
    description: "Multi-skill training to improve line flexibility",
    count: 12
  },
  { 
    id: "4", 
    process: "Attendance Improvement Program", 
    description: "Initiatives to reduce no-show rates and improve reliability",
    count: 6
  }
];

export const Production = () => {
  const { selectedDate } = useDate();
  const [selectedTimePeriod, setSelectedTimePeriod] = useState("month");
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
    isLastRecordedActionItemsLoading,
    refetch
  } = usePillarData('production', selectedDate.toISOString().slice(0, 10));

  const {
    lineData,
    pieData,
    isLoading: isChartLoading,
    isError: isChartError,
    hasRealData,
    dataStatus,
    refetch: refetchChartData
  } = useChartDataWithStrategy('production', { 
    strategyName: selectedTimePeriod
  });

  if (isLoading) {
    return (
      <PillarLayout
        letter="P"
        pillarName="Production"
        pillarColor="production"
      
        squares={dashboardData.pillars.production.squares}
        actionItems={actionItems}
        onDataChange={() => {
          refetch();
          refetchChartData();
        }}
      >
        <div className="flex justify-center items-center h-64">
          <p>Loading production data...</p>
        </div>
      </PillarLayout>
    );
  }

  const graphsPane = (
    <PillarGraphsPane
      pillarName="Production"
      pillarColor="production"
      lineChartData={lineData}
      pieChartData={pieData}
      metrics={productionMetrics}
      lineChartTitle={`Production Output vs Target - ${timePeriodConfig.label} Trend ${hasRealData ? '' : '(No Data)'}`}
      pieChartTitle={`Production Analysis ${hasRealData ? '' : '(No Data)'}`}
      formatValue={(value) => `${Math.round(value)} units`}
      hasRealData={hasRealData}
      isLoading={isChartLoading}
      selectedTimePeriod={selectedTimePeriod}
      onTimePeriodChange={setSelectedTimePeriod}
      chartType="line"
    />
  );

  return (
    <PillarLayout
      letter="P"
      pillarName="Production"
      pillarColor="production"
      
      squares={dashboardData.pillars.production.squares}
      actionItems={actionItems}
      graphsPane={graphsPane}
      onDataChange={() => {
        refetch();
        refetchChartData();
      }}
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

        {/* Bottom Row - Open Processes */}
        <Card className="p-6 shadow-lg hidden">
          <h3 className="text-lg font-semibold text-production">Open Production Processes</h3>
          <div className="space-y-4">
            {openProcesses.map((process) => (
              <div key={process.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h4 className="font-medium">{process.process}</h4>
                      <Badge variant="outline" className="bg-production/10 text-production border-production/30">
                        {process.count} active
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">{process.description}</p>
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