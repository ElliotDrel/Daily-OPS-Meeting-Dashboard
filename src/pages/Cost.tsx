import { PillarLayout } from "@/components/pillar/PillarLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingDown, Package, Clock } from "lucide-react";
import { dashboardData, costData } from "@/data/mockData";
import { SimpleLineChart } from "@/components/charts/SimpleLineChart";
import { PieChartComponent } from "@/components/charts/PieChart";
import { ActionItemsSection } from "@/components/dashboard/ActionItemsSection";
import { NotesSection } from "@/components/dashboard/NotesSection";

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
  return (
    <PillarLayout
      letter="C"
      pillarName="Cost"
      pillarColor="cost"
      squares={dashboardData.pillars.cost.squares}
      actionItems={actionItems}
    >
      <div className="space-y-6">
        {/* Top Row - Line Chart */}
        <Card className="p-6 shadow-lg">
          <h3 className="text-lg font-semibold mb-4 text-cost">Cost Variance - 5 Month Trend</h3>
          <SimpleLineChart 
            data={costData.lineChart}
            title="Cost Metrics"
            color="#f59e0b"
            formatValue={(value) => `$${(value / 1000).toFixed(0)}K`}
          />
        </Card>

        {/* Second Row - Charts and Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pie Chart */}
          <Card className="p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-cost">Cost Analysis Overview</h3>
            <PieChartComponent 
              data={costData.donutData}
              title="Cost Breakdown"
              showLegend={true}
            />
          </Card>

          {/* Metric Tiles */}
          <div className="grid grid-cols-2 gap-4">
            {costMetrics.map((metric, index) => (
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
          actionItems={dashboardData.pillars.cost.actionItems}
          title="Cost Action Items"
        />

        {/* Meeting Notes Section */}
        <NotesSection 
          meetingNotes={dashboardData.pillars.cost.meetingNotes}
          title="Cost Meeting Notes & Discoveries"
        />

        {/* Bottom Row - Low Yield Events Table */}
        <Card className="p-6 shadow-lg">
          <h3 className="text-lg font-semibold mb-4 text-cost">Low Yield Events & Actions</h3>
          <div className="space-y-4">
            {lowYieldEvents.map((event) => (
              <div key={event.id} className="border rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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