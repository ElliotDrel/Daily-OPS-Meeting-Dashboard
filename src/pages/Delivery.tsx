import { PillarLayout } from "@/components/pillar/PillarLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Truck, Clock, TrendingUp } from "lucide-react";
import { dashboardData, deliveryData } from "@/data/mockData";
import { TrendLineChart } from "@/components/charts/TrendLineChart";
import { PieChartComponent } from "@/components/charts/PieChart";
import { ActionItemsAndNotesSection } from "@/components/dashboard/ActionItemsAndNotesSection";

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
  return (
    <PillarLayout
      letter="D"
      pillarName="Delivery"
      pillarColor="delivery"
      squares={dashboardData.pillars.delivery.squares}
      actionItems={actionItems}
    >
      <div className="space-y-6">
        {/* Top Row - Line Chart and Pie Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Line Chart */}
          <div className="lg:col-span-2">
            <Card className="p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-delivery">On-Time Delivery - 5 Month Trend</h3>
              <TrendLineChart 
                data={deliveryData.lineChart}
                title="Delivery Performance"
                color="#10b981"
                formatValue={(value) => `${value.toFixed(1)}%`}
              />
            </Card>
          </div>

          {/* Pie Chart */}
          <Card className="p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-delivery">Delivery Metrics Overview</h3>
            <PieChartComponent 
              data={deliveryData.donutData}
              title="Delivery Analysis"
              showLegend={true}
              height="h-48"
            />
          </Card>
        </div>

        {/* Second Row - Metrics */}
        <div className="space-y-4">
          {deliveryMetrics.map((metric, index) => (
            <Card key={index} className="p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-xl ${metric.color} shadow-lg`}>
                  <metric.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-foreground">{metric.value}</p>
                  <p className="text-sm text-muted-foreground font-medium">{metric.label}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Action Items and Notes Section */}
        <ActionItemsAndNotesSection 
          actionItems={dashboardData.pillars.delivery.actionItems}
          meetingNotes={dashboardData.pillars.delivery.meetingNotes}
          actionItemsTitle="Delivery Action Items"
          notesTitle="Delivery Meeting Notes & Discoveries"
        />

        {/* Bottom Row - Corrective Actions Table */}
        <Card className="p-6 shadow-lg">
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