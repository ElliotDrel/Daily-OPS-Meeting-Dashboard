import { PillarLayout } from "@/components/pillar/PillarLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, GraduationCap, Lightbulb, Heart, TrendingUp } from "lucide-react";
import { dashboardData, peopleData } from "@/data/mockData";
import { SimpleLineChart } from "@/components/charts/SimpleLineChart";
import { SimpleDonutChart } from "@/components/charts/SimpleDonutChart";
import { ActionItemsSection } from "@/components/dashboard/ActionItemsSection";
import { NotesSection } from "@/components/dashboard/NotesSection";

const peopleMetrics = [
  { label: "Attendance", value: "96%", icon: Users, color: "bg-status-good" },
  { label: "Training Completed", value: "75%", icon: GraduationCap, color: "bg-status-caution" },
  { label: "Employee Suggestions", value: "14", icon: Lightbulb, color: "bg-chart-blue" },
  { label: "Engagement Level", value: "High", icon: Heart, color: "bg-status-good" },
  { label: "Team Performance", value: "Good", icon: TrendingUp, color: "bg-status-good" }
];

const actionItems = [
  { id: "1", text: "Training Programs", status: "caution", count: 8 },
  { id: "2", text: "Performance Reviews", status: "good", count: 12 },
  { id: "3", text: "Team Building", status: "good", count: 3 }
];

const openProcesses = [
  { 
    id: "1", 
    process: "Process Improvement Initiative", 
    description: "Employee-led improvement suggestions for production efficiency",
    count: 5
  },
  { 
    id: "2", 
    process: "IT Systems Training", 
    description: "New ERP system training program rollout",
    count: 12
  },
  { 
    id: "3", 
    process: "Skills Development Program", 
    description: "Cross-training initiatives for operational flexibility",
    count: 8
  },
  { 
    id: "4", 
    process: "Employee Recognition Program", 
    description: "Monthly recognition and rewards program administration",
    count: 15
  }
];

export const People = () => {
  return (
    <PillarLayout
      letter="P"
      pillarName="People"
      pillarColor="people"
      squares={dashboardData.pillars.people.squares}
      actionItems={actionItems}
    >
      <div className="space-y-6">
        {/* Top Row - Line Chart */}
        <Card className="p-6 shadow-lg">
          <h3 className="text-lg font-semibold mb-4 text-people">Employee Engagement - 5 Month Trend</h3>
          <SimpleLineChart 
            data={peopleData.lineChart}
            title="Engagement Score"
            color="#8b5cf6"
            formatValue={(value) => `${value}%`}
          />
        </Card>

        {/* Second Row - Charts and Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Doughnut Chart */}
          <Card className="p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-people">Employee Engagement Breakdown</h3>
            <SimpleDonutChart 
              data={peopleData.donutData}
              title="Engagement Levels"
              centerValue="80%"
              centerText="Engaged"
            />
          </Card>

          {/* Metric Tiles */}
          <div className="grid grid-cols-2 gap-4">
            {peopleMetrics.map((metric, index) => (
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
          actionItems={dashboardData.pillars.people.actionItems}
          title="People Action Items"
        />

        {/* Meeting Notes Section */}
        <NotesSection 
          meetingNotes={dashboardData.pillars.people.meetingNotes}
          title="People Meeting Notes & Discoveries"
        />

        {/* Bottom Row - Open Processes */}
        <Card className="p-6 shadow-lg">
          <h3 className="text-lg font-semibold mb-4 text-people">Open People Processes</h3>
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