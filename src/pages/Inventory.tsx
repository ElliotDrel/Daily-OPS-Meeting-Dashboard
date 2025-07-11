import { PillarLayout } from "@/components/pillar/PillarLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, BarChart3, Users, Workflow } from "lucide-react";
import { dashboardData } from "@/data/mockData";
import { ActionItemsSection } from "@/components/dashboard/ActionItemsSection";
import { NotesSection } from "@/components/dashboard/NotesSection";

const inventoryMetrics = [
  { label: "Process Efficiency", value: "85%", icon: Settings, color: "bg-status-good" },
  { label: "Resource Utilization", value: "72%", icon: BarChart3, color: "bg-status-caution" },
  { label: "Cross-Dept Collaboration", value: "91%", icon: Users, color: "bg-status-good" },
  { label: "Workflow Optimization", value: "68%", icon: Workflow, color: "bg-chart-blue" }
];

const actionItems = [
  { id: "1", text: "Process Review", status: "good", count: 3 },
  { id: "2", text: "Resource Allocation", status: "caution", count: 4 },
  { id: "3", text: "Workflow Issues", status: "issue", count: 2 }
];

export const Inventory = () => {
  return (
    <PillarLayout
      letter="I"
      pillarName="Inventory"
      pillarColor="inventory"
      squares={dashboardData.pillars.inventory.squares}
      actionItems={actionItems}
    >
      <div className="space-y-6">
        {/* Metric Tiles */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {inventoryMetrics.map((metric, index) => (
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

        {/* Action Items Section */}
        <ActionItemsSection 
          actionItems={dashboardData.pillars.inventory.actionItems}
          title="Internal Process Action Items"
        />

        {/* Meeting Notes Section */}
        <NotesSection 
          meetingNotes={dashboardData.pillars.inventory.meetingNotes}
          title="Internal Process Meeting Notes"
        />
      </div>
    </PillarLayout>
  );
};