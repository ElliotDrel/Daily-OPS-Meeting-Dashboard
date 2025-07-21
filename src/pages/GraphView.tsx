import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendLineChart } from "@/components/charts/TrendLineChart";
import { SimpleBarChart } from "@/components/dashboard/SimpleBarChart";
import { PieChartComponent } from "@/components/charts/PieChart";
import { StatCard } from "@/components/dashboard/StatCard";
import { CheckCircle, BarChart3, DollarSign, Activity } from "lucide-react";

// Fake data for charts
const lineChartData = [
  { month: 'Jan', value: 4200, target: 4000 },
  { month: 'Feb', value: 3800, target: 4000 },
  { month: 'Mar', value: 4500, target: 4000 },
  { month: 'Apr', value: 4800, target: 4000 },
  { month: 'May', value: 4300, target: 4000 },
  { month: 'Jun', value: 5100, target: 4000 }
];

const barChartData = [
  { day: 'Mon', value: 85, target: 90 },
  { day: 'Tue', value: 92, target: 90 },
  { day: 'Wed', value: 78, target: 90 },
  { day: 'Thu', value: 96, target: 90 },
  { day: 'Fri', value: 88, target: 90 },
  { day: 'Sat', value: 94, target: 90 },
  { day: 'Sun', value: 82, target: 90 }
];

const pieChartData = [
  { name: 'Manufacturing', value: 45, color: '#3b82f6' },
  { name: 'Assembly', value: 25, color: '#10b981' },
  { name: 'Quality Control', value: 15, color: '#f59e0b' },
  { name: 'Packaging', value: 10, color: '#ef4444' },
  { name: 'Shipping', value: 5, color: '#8b5cf6' }
];

export const GraphView = () => {
  return (
    <div className="min-h-screen bg-gradient-main p-6">
      <div className="container mx-auto space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Graph View</h1>
          <p className="text-muted-foreground">Visual analytics and chart dashboard</p>
        </div>

        {/* Charts Content */}
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {/* Line Chart */}
              <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-foreground">Revenue Trend</CardTitle>
                  <p className="text-sm text-muted-foreground">Monthly revenue vs target (in thousands)</p>
                </CardHeader>
                <CardContent>
                  <TrendLineChart
                    data={lineChartData}
                    title="Revenue Trend"
                    color="hsl(var(--primary))"
                    formatValue={(value) => `$${value}k`}
                  />
                </CardContent>
              </Card>

              {/* Bar Chart */}
              <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-foreground">Weekly Performance</CardTitle>
                  <p className="text-sm text-muted-foreground">Daily efficiency percentage</p>
                </CardHeader>
                <CardContent>
                  <SimpleBarChart
                    data={barChartData}
                    title="Weekly Performance"
                    pillar="performance"
                  />
                </CardContent>
              </Card>
            </div>

            {/* Chart Comparison Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {/* Pie Chart */}
              <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-foreground">Department Workload (Pie)</CardTitle>
                  <p className="text-sm text-muted-foreground">Production capacity by department</p>
                </CardHeader>
                <CardContent>
                  <PieChartComponent
                    data={pieChartData}
                    title="Department Distribution"
                    showLegend={true}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard
                value="92.4%"
                label="Overall Efficiency"
                icon={<Activity className="w-5 h-5 text-white" />}
                iconBg="bg-primary"
              />
              <StatCard
                value="$4.7M"
                label="Monthly Revenue"
                icon={<DollarSign className="w-5 h-5 text-white" />}
                iconBg="bg-chart-orange"
              />
              <StatCard
                value="1,247"
                label="Units Produced"
                icon={<BarChart3 className="w-5 h-5 text-white" />}
                iconBg="bg-chart-green"
              />
              <StatCard
                value="98.2%"
                label="Quality Score"
                icon={<CheckCircle className="w-5 h-5 text-white" />}
                iconBg="bg-chart-blue"
              />
            </div>
        </div>
      </div>
    </div>
  );
};