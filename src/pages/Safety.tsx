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
import { usePillarData } from "@/hooks/usePillarData";
import { useDate } from "@/contexts/DateContext";

// Toggle this to hide/show charts and stats
const SHOW_CHARTS_AND_STATS = false;

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
    meetingNotes, 
    actionItems, 
    yesterdayMeetingNotes, 
    yesterdayActionItems, 
    createNote, 
    createItem, 
    updateItem, 
    isLoading 
  } = usePillarData('safety', selectedDate.toISOString().slice(0, 10));

  if (isLoading) {
    return (
      <PillarLayout
        letter="S"
        pillarName="Safety"
        pillarColor="safety"
        squares={dashboardData.pillars.safety.squares}
        actionItems={actionItems}
      >
        <div className="flex justify-center items-center h-64">
          <p>Loading safety data...</p>
        </div>
      </PillarLayout>
    );
  }

  return (
    <PillarLayout
      letter="S"
      pillarName="Safety"
      pillarColor="safety"
      squares={dashboardData.pillars.safety.squares}
      actionItems={actionItems}
    >
      <div className="space-y-6">
        {/* Top Row - Line Chart and Pie Chart */}
        {SHOW_CHARTS_AND_STATS && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Line Chart */}
          <div className="lg:col-span-2">
            <Card className="p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-safety">Unsafe Conditions - 5 Month Trend</h3>
              <TrendLineChart 
                data={safetyData.lineChart}
                title="Safety Incidents"
                color="hsl(var(--chart-1))"
                formatValue={(value) => value.toString()}
              />
            </Card>
          </div>

          {/* Pie Chart */}
          <Card className="p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-safety">Safety Incident Types</h3>
            <PieChartComponent 
              data={safetyData.donutData}
              title="Incident Types"
              showLegend={true}
              height="h-48"
            />
          </Card>
        </div>
        )}

        {/* Second Row - Metrics */}
        {SHOW_CHARTS_AND_STATS && (
        <div className="grid grid-cols-2 gap-2">
          {safetyMetrics.map((metric, index) => (
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
          pillar="safety"
        />

        {/* Bottom Row - Legacy Action Table */}
        <Card className="p-6 shadow-lg">
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