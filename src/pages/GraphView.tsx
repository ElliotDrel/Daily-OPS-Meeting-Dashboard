import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendLineChart } from "@/components/charts/TrendLineChart";
import { SimpleBarChart } from "@/components/dashboard/SimpleBarChart";
import { PieChartComponent } from "@/components/charts/PieChart";
import { StatCard } from "@/components/dashboard/StatCard";
import { CheckCircle, BarChart3, DollarSign, Activity } from "lucide-react";
import { useChartData } from "@/hooks/useChartData";
import { TimePeriodSelector, getTimePeriodConfig } from "@/components/charts/TimePeriodSelector";

export const GraphView = () => {
  const [selectedTimePeriod, setSelectedTimePeriod] = useState("5m");
  const timePeriodConfig = getTimePeriodConfig(selectedTimePeriod);

  // Get real chart data for different pillars
  const {
    lineData: safetyLineData,
    pieData: safetyPieData,
    isLoading: safetyLoading,
    hasRealData: safetyHasData
  } = useChartData('safety', { 
    months: timePeriodConfig.months,
    days: timePeriodConfig.days 
  });

  const {
    lineData: qualityLineData,
    pieData: qualityPieData,
    isLoading: qualityLoading,
    hasRealData: qualityHasData
  } = useChartData('quality', { 
    months: timePeriodConfig.months,
    days: timePeriodConfig.days 
  });

  // Helper function to render chart with no data fallback
  const renderChart = (data: any[], hasData: boolean, isLoading: boolean, fallbackMessage: string) => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-48">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      );
    }
    
    if (!hasData || data.length === 0) {
      return (
        <div className="flex justify-center items-center h-48">
          <p className="text-muted-foreground">{fallbackMessage}</p>
        </div>
      );
    }
    
    return data;
  };

  return (
    <div className="min-h-screen bg-gradient-main p-6">
      <div className="container mx-auto space-y-6">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Graph View</h1>
              <p className="text-muted-foreground">Visual analytics and chart dashboard (Real Data)</p>
            </div>
            <TimePeriodSelector
              selectedPeriod={selectedTimePeriod}
              onPeriodChange={setSelectedTimePeriod}
            />
          </div>
        </div>

        {/* Charts Content */}
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {/* Safety Line Chart */}
              <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-foreground">Safety Incidents - 5 Month Trend</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {safetyHasData ? 'Real data from safety responses' : 'No data available'}
                  </p>
                </CardHeader>
                <CardContent>
                  {renderChart(safetyLineData, safetyHasData, safetyLoading, "No safety data found to create graph") === safetyLineData ? (
                    <TrendLineChart
                      data={safetyLineData}
                      title="Safety Incidents"
                      color="hsl(var(--chart-1))"
                      formatValue={(value) => value.toString()}
                    />
                  ) : renderChart(safetyLineData, safetyHasData, safetyLoading, "No safety data found to create graph")}
                </CardContent>
              </Card>

              {/* Quality Line Chart */}
              <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-foreground">Quality Performance - 5 Month Trend</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {qualityHasData ? 'Real data from quality responses' : 'No data available'}
                  </p>
                </CardHeader>
                <CardContent>
                  {renderChart(qualityLineData, qualityHasData, qualityLoading, "No quality data found to create graph") === qualityLineData ? (
                    <TrendLineChart
                      data={qualityLineData}
                      title="Quality Performance"
                      color="hsl(var(--chart-2))"
                      formatValue={(value) => `${value}%`}
                    />
                  ) : renderChart(qualityLineData, qualityHasData, qualityLoading, "No quality data found to create graph")}
                </CardContent>
              </Card>
            </div>

            {/* Pie Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {/* Safety Pie Chart */}
              <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-foreground">Safety Incident Types</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {safetyHasData ? 'Distribution from real data' : 'No data available'}
                  </p>
                </CardHeader>
                <CardContent>
                  {renderChart(safetyPieData, safetyHasData, safetyLoading, "No safety data found to create graph") === safetyPieData ? (
                    <PieChartComponent
                      data={safetyPieData}
                      title="Safety Incident Types"
                      showLegend={true}
                    />
                  ) : renderChart(safetyPieData, safetyHasData, safetyLoading, "No safety data found to create graph")}
                </CardContent>
              </Card>

              {/* Quality Pie Chart */}
              <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-foreground">Quality Issue Types</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {qualityHasData ? 'Distribution from real data' : 'No data available'}
                  </p>
                </CardHeader>
                <CardContent>
                  {renderChart(qualityPieData, qualityHasData, qualityLoading, "No quality data found to create graph") === qualityPieData ? (
                    <PieChartComponent
                      data={qualityPieData}
                      title="Quality Issue Types"
                      showLegend={true}
                    />
                  ) : renderChart(qualityPieData, qualityHasData, qualityLoading, "No quality data found to create graph")}
                </CardContent>
              </Card>
            </div>

            {/* Data Status Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard
                value={safetyHasData ? "Active" : "No Data"}
                label="Safety Data Status"
                icon={<Activity className="w-5 h-5 text-white" />}
                iconBg={safetyHasData ? "bg-status-good" : "bg-status-issue"}
              />
              <StatCard
                value={qualityHasData ? "Active" : "No Data"}
                label="Quality Data Status"
                icon={<CheckCircle className="w-5 h-5 text-white" />}
                iconBg={qualityHasData ? "bg-status-good" : "bg-status-issue"}
              />
              <StatCard
                value="0"
                label="Cost Data Points"
                icon={<DollarSign className="w-5 h-5 text-white" />}
                iconBg="bg-status-issue"
              />
              <StatCard
                value="0"
                label="Production Data Points"
                icon={<BarChart3 className="w-5 h-5 text-white" />}
                iconBg="bg-status-issue"
              />
            </div>
        </div>
      </div>
    </div>
  );
};