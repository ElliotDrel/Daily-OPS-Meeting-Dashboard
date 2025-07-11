import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendLineChart } from "@/components/charts/TrendLineChart";
import { SimpleBarChart } from "@/components/dashboard/SimpleBarChart";
import { DonutChart } from "@/components/charts/DonutChart";
import { CalendarGraphs } from "@/components/dashboard/CalendarGraphs";

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

        {/* Main Layout with Calendar Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column - Calendar Graphs (25%) */}
          <div className="lg:col-span-1">
            <CalendarGraphs />
          </div>

          {/* Right Column - Charts Content (75%) */}
          <div className="lg:col-span-3 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

            {/* Pie Chart - Full Width */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-lg">
              <CardHeader>
                <CardTitle className="text-foreground">Department Workload Distribution</CardTitle>
                <p className="text-sm text-muted-foreground">Percentage of total production capacity by department</p>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex justify-center">
                  <DonutChart
                    data={pieChartData}
                    title="Department Distribution"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-card/30 backdrop-blur-sm border-border/50">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-primary">92.4%</div>
                  <p className="text-sm text-muted-foreground">Overall Efficiency</p>
                </CardContent>
              </Card>
              
              <Card className="bg-card/30 backdrop-blur-sm border-border/50">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-chart-2">$4.7M</div>
                  <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                </CardContent>
              </Card>
              
              <Card className="bg-card/30 backdrop-blur-sm border-border/50">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-chart-3">1,247</div>
                  <p className="text-sm text-muted-foreground">Units Produced</p>
                </CardContent>
              </Card>
              
              <Card className="bg-card/30 backdrop-blur-sm border-border/50">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-chart-4">98.2%</div>
                  <p className="text-sm text-muted-foreground">Quality Score</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};