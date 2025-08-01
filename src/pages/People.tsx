import { useState, useEffect } from "react";
import { PillarLayout } from "@/components/pillar/PillarLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, UserX, GraduationCap, Target, TrendingUp, Clock } from "lucide-react";
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


const peopleMetrics = [
  { label: "Total Employees", value: "142", icon: Users, color: "bg-status-good" },
  { label: "No Shows Today", value: "3", icon: UserX, color: "bg-status-issue" },
  { label: "In Training", value: "8", icon: GraduationCap, color: "bg-chart-blue" },
  { label: "Attendance Rate", value: "97.9%", icon: Target, color: "bg-status-good" },
  { label: "Training Progress", value: "75%", icon: TrendingUp, color: "bg-status-caution" },
  { label: "Shift Coverage", value: "98%", icon: Clock, color: "bg-status-good" }
];

const actionItems = [
  { id: "1", text: "No Show Follow-up", status: "issue", count: 3 },
  { id: "2", text: "Training Progress", status: "caution", count: 2 },
  { id: "3", text: "Team Building", status: "good", count: 4 }
];

const openProcesses = [
  { 
    id: "1", 
    process: "Attendance Improvement Program", 
    description: "Initiatives to reduce no-show rates and improve reliability",
    count: 5
  },
  { 
    id: "2", 
    process: "New Employee Onboarding", 
    description: "Streamlined training program for new hires",
    count: 8
  },
  { 
    id: "3", 
    process: "Skills Development Initiative", 
    description: "Cross-training program to improve workforce flexibility",
    count: 12
  },
  { 
    id: "4", 
    process: "Employee Engagement Survey", 
    description: "Quarterly feedback collection and action planning",
    count: 3
  }
];

export const People = () => {
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
  } = usePillarData('people', selectedDate.toISOString().slice(0, 10));

  const {
    lineData,
    pieData,
    isLoading: isChartLoading,
    isError: isChartError,
    hasRealData,
    dataStatus,
    refetch: refetchChartData
  } = useChartDataWithStrategy('people', { 
    strategyName: selectedTimePeriod
  });

  if (isLoading) {
    return (
      <PillarLayout
        letter="P"
        pillarName="People"
        pillarColor="people"
      
        squares={dashboardData.pillars.people.squares}
        actionItems={actionItems}
        onDataChange={() => {
          refetch();
          refetchChartData();
        }}
      >
        <div className="flex justify-center items-center h-64">
          <p>Loading people data...</p>
        </div>
      </PillarLayout>
    );
  }

  const graphsPane = (
    <PillarGraphsPane
      pillarName="People"
      pillarColor="people"
      lineChartData={lineData}
      pieChartData={pieData}
      metrics={peopleMetrics}
      lineChartTitle={`People Metrics - ${timePeriodConfig.label} Trend ${hasRealData ? '' : '(No Data)'}`}
      pieChartTitle={`People Analysis ${hasRealData ? '' : '(No Data)'}`}
      formatValue={(value) => `${Math.round(value)}`}
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
      pillarName="People"
      pillarColor="people"
      
      squares={dashboardData.pillars.people.squares}
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
          <h3 className="text-lg font-semibold text-people">Open People Processes</h3>
          <div className="space-y-4">
            {openProcesses.map((process) => (
              <div key={process.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h4 className="font-medium">{process.process}</h4>
                      <Badge variant="outline" className="bg-people/10 text-people border-people/30">
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