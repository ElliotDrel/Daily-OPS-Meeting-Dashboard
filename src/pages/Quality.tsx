import { PillarLayout } from "@/components/pillar/PillarLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, X, Wrench, AlertCircle, CheckCircle } from "lucide-react";
import { dashboardData, qualityData } from "@/data/mockData";
import { TrendLineChart } from "@/components/charts/TrendLineChart";
import { PieChartComponent } from "@/components/charts/PieChart";
import { ActionItemsAndNotesSection } from "@/components/dashboard/ActionItemsAndNotesSection";
import { usePillarData } from "@/hooks/usePillarData";
import { useDate } from "@/contexts/DateContext";

// Toggle this to hide/show charts and stats
const SHOW_CHARTS_AND_STATS = false;

const qualityMetrics = [
  { label: "Customer Complaints", value: "14", icon: Mail, color: "bg-status-issue" },
  { label: "Test Fails", value: "7", icon: X, color: "bg-status-caution" },
  { label: "Rework Items", value: "12", icon: Wrench, color: "bg-status-caution" },
  { label: "Non-Conformance", value: "5", icon: AlertCircle, color: "bg-status-good" },
  { label: "Quality Score", value: "94.2%", icon: CheckCircle, color: "bg-chart-blue" }
];

const actionItems = [
  { id: "1", text: "Customer Complaints", status: "issue", count: 14 },
  { id: "2", text: "Quality Audits", status: "good", count: 3 },
  { id: "3", text: "Supplier Issues", status: "caution", count: 2 }
];

const correctiveActions = [
  { 
    id: "1", 
    problem: "Product finish quality below specification on Product Line A", 
    action: "Implement additional quality checkpoints and operator training for surface finish standards",
    owner: "Quality Manager",
    dueDate: "Jan 22, 2024",
    status: "In Progress"
  },
  { 
    id: "2", 
    problem: "Customer complaint: Packaging defects affecting product appearance", 
    action: "Review packaging supplier quality standards and implement incoming inspection protocol",
    owner: "Supplier Quality",
    dueDate: "Jan 25, 2024", 
    status: "Open"
  },
  { 
    id: "3", 
    problem: "High rework rate in assembly area exceeding 5% target", 
    action: "Conduct root cause analysis and provide additional work instruction training",
    owner: "Production Manager",
    dueDate: "Jan 18, 2024",
    status: "Completed"
  },
  { 
    id: "4", 
    problem: "Calibration overdue on critical measurement equipment CMM-002", 
    action: "Schedule immediate calibration and update preventive maintenance schedule",
    owner: "Maintenance Team",
    dueDate: "Jan 15, 2024",
    status: "In Progress"
  }
];

export const Quality = () => {
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
  } = usePillarData('quality', selectedDate.toISOString().slice(0, 10));
  if (isLoading) {
    return (
      <PillarLayout
        letter="Q"
        pillarName="Quality"
        pillarColor="quality"
        squares={dashboardData.pillars.quality.squares}
        actionItems={actionItems}
      >
        <div className="flex justify-center items-center h-64">
          <p>Loading quality data...</p>
        </div>
      </PillarLayout>
    );
  }
  return (
    <PillarLayout
      letter="Q"
      pillarName="Quality"
      pillarColor="quality"
      squares={dashboardData.pillars.quality.squares}
      actionItems={actionItems}
    >
      <div className="space-y-6">
        {/* Top Row - Line Chart and Pie Chart */}
        {SHOW_CHARTS_AND_STATS && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Line Chart */}
          <div className="lg:col-span-2">
            <Card className="p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-quality">Quality Performance - 5 Month Trend</h3>
              <TrendLineChart 
                data={qualityData.lineChart}
                title="Quality Score"
                color="#3b82f6"
                formatValue={(value) => `${value}%`}
              />
            </Card>
          </div>

          {/* Pie Chart */}
          <Card className="p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-quality">Quality Metrics Distribution</h3>
            <PieChartComponent 
              data={qualityData.donutData}
              title="Quality Breakdown"
              showLegend={true}
              height="h-48"
            />
          </Card>
        </div>
        )}

        {/* Second Row - Metrics */}
        {SHOW_CHARTS_AND_STATS && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
          {qualityMetrics.map((metric, index) => (
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
          pillar="quality"
        />

        {/* Bottom Row - Corrective Actions Table */}
        <Card className="p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-quality">Quality Corrective Actions</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Problem</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Required Action</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Owner</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Due Date</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {correctiveActions.map((action) => (
                  <tr key={action.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="py-4 px-2 text-sm max-w-xs">
                      <div className="truncate" title={action.problem}>
                        {action.problem}
                      </div>
                    </td>
                    <td className="py-4 px-2 text-sm max-w-xs">
                      <div className="truncate" title={action.action}>
                        {action.action}
                      </div>
                    </td>
                    <td className="py-4 px-2 text-sm font-medium">{action.owner}</td>
                    <td className="py-4 px-2 text-sm">{action.dueDate}</td>
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