import { PillarLayout } from "@/components/pillar/PillarLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Target, AlertTriangle, Activity, TrendingUp, Clock } from "lucide-react";
import { dashboardData, productionData } from "@/data/mockData";
import { TrendLineChart } from "@/components/charts/TrendLineChart";
import { PieChartComponent } from "@/components/charts/PieChart";
import { ActionItemsSection } from "@/components/dashboard/ActionItemsSection";
import { NotesSection } from "@/components/dashboard/NotesSection";

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
  return (
    <PillarLayout
      letter="P"
      pillarName="Production"
      pillarColor="production"
      squares={dashboardData.pillars.production.squares}
      actionItems={actionItems}
    >
      <div className="space-y-6">
        {/* Top Row - Line Chart */}
        <Card className="p-6 shadow-lg">
          <h3 className="text-lg font-semibold mb-4 text-production">Production Output vs Target - 5 Month Trend</h3>
          <TrendLineChart 
            data={productionData.lineChart}
            title="Output Units"
            color="#4b6cb7"
            formatValue={(value) => `${Math.round(value)} units`}
          />
        </Card>

        {/* Second Row - Charts and Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pie Chart */}
          <Card className="p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-production">Production Analysis</h3>
            <PieChartComponent 
              data={productionData.donutData}
              title="Production Breakdown"
              showLegend={true}
            />
          </Card>

          {/* Metric Tiles */}
          <div className="grid grid-cols-2 gap-4">
            {productionMetrics.map((metric, index) => (
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
        </div>

        {/* Action Items Section */}
        <ActionItemsSection 
          actionItems={dashboardData.pillars.production.actionItems}
          title="Production Action Items"
        />

        {/* Meeting Notes Section */}
        <NotesSection 
          meetingNotes={dashboardData.pillars.production.meetingNotes}
          title="Production Meeting Notes & Updates"
        />

        {/* Bottom Row - Open Processes */}
        <Card className="p-6 shadow-lg">
          <h3 className="text-lg font-semibold mb-4 text-production">Open Production Processes</h3>
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