import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, Users, HardHat, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { dashboardData, safetyData } from "@/data/mockData";
import { SimpleLineChart } from "@/components/charts/SimpleLineChart";
import { SimpleDonutChart } from "@/components/charts/SimpleDonutChart";
import { ActionItemsSection } from "@/components/dashboard/ActionItemsSection";
import { NotesSection } from "@/components/dashboard/NotesSection";

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
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="space-y-6"
        >
          {/* Header with large S and Safety title */}
          <div className="flex items-center space-x-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <div className="flex items-center space-x-4">
              <div className="text-6xl font-bold text-safety">S</div>
              <h1 className="text-3xl font-bold">Safety</h1>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-6">
        {/* Top Row - Line Chart */}
        <Card className="p-6 shadow-lg">
          <h3 className="text-lg font-semibold mb-4 text-safety">Unsafe Conditions - 5 Month Trend</h3>
          <SimpleLineChart 
            data={safetyData.lineChart}
            title="Safety Incidents"
            color="#2dd4bf"
            formatValue={(value) => value.toString()}
          />
        </Card>

        {/* Second Row - Charts and Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Doughnut Chart */}
          <Card className="p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-safety">Safety Issues Root Causes</h3>
            <SimpleDonutChart 
              data={safetyData.donutData}
              title="Root Causes"
              centerValue="42"
              centerText="Total Issues"
            />
          </Card>

          {/* Metric Tiles */}
          <div className="grid grid-cols-2 gap-4">
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
        </div>

        {/* Action Items Section */}
        <ActionItemsSection 
          actionItems={dashboardData.pillars.safety.actionItems}
          title="Safety Action Items"
        />

        {/* Meeting Notes Section */}
        <NotesSection 
          meetingNotes={dashboardData.pillars.safety.meetingNotes}
          title="Safety Meeting Notes & Discoveries"
        />

        {/* Bottom Row - Legacy Action Table */}
        <Card className="p-6 shadow-lg">
          <h3 className="text-lg font-semibold mb-4 text-safety">Safety Corrective Actions</h3>
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
        </motion.div>
      </div>
    </div>
  );
};