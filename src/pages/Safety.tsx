import { useState, useEffect } from "react";
import { PillarLayout } from "@/components/pillar/PillarLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, Users, HardHat } from "lucide-react";
import { dashboardData, safetyData, MeetingNote } from "@/data/mockData";
import { TrendLineChart } from "@/components/charts/TrendLineChart";
import { PieChartComponent } from "@/components/charts/PieChart";
import { ActionItemsAndNotesSection } from "@/components/dashboard/ActionItemsAndNotesSection";
import { saveMeetingNotesToFile, loadMeetingNotesFromFile } from "@/utils/dataUtils";
import { usePillarData } from "@/hooks/usePillarDataOptimized";
import { useDate } from "@/contexts/DateContext";
import { PillarGraphsPane } from "@/components/pillar/PillarGraphsPane";


const safetyMetrics = [
  { label: "No Accidents", value: "12", icon: Shield, color: "bg-status-good" },
  { label: "Near Misses", value: "3", icon: AlertTriangle, color: "bg-status-caution" },
  { label: "Safety Incidents", value: "1", icon: AlertTriangle, color: "bg-status-issue" },
  { label: "Safety Talks", value: "8", icon: Users, color: "bg-chart-blue" }
];

const actionItems = [
  { id: "1", text: "PPE Inspection", status: "good", count: 5 },
  { id: "2", text: "Training Overdue", status: "caution", count: 2 },
  { id: "3", text: "Incident Follow-up", status: "issue", count: 1 }
];

const safetyActions = [
  { 
    id: "1", 
    problem: "Chemical storage area lacks proper ventilation signage", 
    owner: "Safety Team", 
    due: "Jan 15, 2024", 
    status: "In Progress",
    priority: "High"
  },
  { 
    id: "2", 
    problem: "Emergency shower testing overdue in Building A", 
    owner: "Maintenance Dept", 
    due: "Jan 12, 2024", 
    status: "Completed",
    priority: "Medium"
  },
  { 
    id: "3", 
    problem: "PPE compliance training needed for new hires", 
    owner: "HR Department", 
    due: "Jan 18, 2024", 
    status: "Open",
    priority: "High"
  },
  { 
    id: "4", 
    problem: "Machine guard inspection due on Press Line 3", 
    owner: "Operations", 
    due: "Jan 20, 2024", 
    status: "In Progress",
    priority: "Medium"
  },
  { 
    id: "5", 
    problem: "Fire extinguisher monthly check overdue", 
    owner: "Safety Team", 
    due: "Jan 10, 2024", 
    status: "Completed",
    priority: "Low"
  }
];

export const Safety = () => {
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
  } = usePillarData('safety', selectedDate.toISOString().slice(0, 10));

  if (isLoading) {
    return (
      <PillarLayout
        letter="S"
        pillarName="Safety"
        pillarColor="safety"
        pillar="safety"
        squares={dashboardData.pillars.safety.squares}
        actionItems={actionItems}
      >
        <div className="flex justify-center items-center h-64">
          <p>Loading safety data...</p>
        </div>
      </PillarLayout>
    );
  }

  const graphsPane = (
    <PillarGraphsPane
      pillarName="Safety"
      pillarColor="safety"
      lineChartData={safetyData.lineChart}
      pieChartData={safetyData.donutData}
      metrics={safetyMetrics}
      lineChartTitle="Safety Incidents - 5 Month Trend"
      pieChartTitle="Safety Incident Types"
      formatValue={(value) => value.toString()}
    />
  );

  return (
    <PillarLayout
      letter="S"
      pillarName="Safety"
      pillarColor="safety"
      pillar="safety"
      squares={dashboardData.pillars.safety.squares}
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
          pillar="safety"
          isLoading={isLoading}
          selectedDate={selectedDate.toISOString().slice(0, 10)}
          isYesterdayLoading={isYesterdayLoading}
          isLastRecordedLoading={isLastRecordedLoading}
          isLastRecordedActionItemsLoading={isLastRecordedActionItemsLoading}
        />

        {/* Bottom Row - Legacy Action Table */}
        <Card className="p-6 shadow-lg hidden">
          <h3 className="text-lg font-semibold text-safety">Safety Corrective Actions</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Problem</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Owner</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Due Date</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Priority</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {safetyActions.map((action) => (
                  <tr key={action.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="py-4 px-2 text-sm">{action.problem}</td>
                    <td className="py-4 px-2 text-sm font-medium">{action.owner}</td>
                    <td className="py-4 px-2 text-sm">{action.due}</td>
                    <td className="py-4 px-2">
                      <Badge 
                        variant="outline"
                        className={`text-xs ${
                          action.priority === 'High' ? 'border-status-issue text-status-issue' :
                          action.priority === 'Medium' ? 'border-status-caution text-status-caution' :
                          'border-status-good text-status-good'
                        }`}
                      >
                        {action.priority}
                      </Badge>
                    </td>
                    <td className="py-4 px-2">
                      <Badge 
                        variant={action.status === 'Completed' ? 'default' : 'outline'}
                        className={`text-xs ${
                          action.status === 'Completed' ? 'bg-status-good border-status-good' : 
                          action.status === 'In Progress' ? 'border-status-caution text-status-caution' : 
                          'border-status-issue text-status-issue'
                        }`}
                      >
                        {action.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </PillarLayout>
  );
};