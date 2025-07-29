import { Card } from "@/components/ui/card";
import { TrendLineChart } from "@/components/charts/TrendLineChart";
import { IncidentColumnChart } from "@/components/charts/IncidentColumnChart";
import { PieChartComponent } from "@/components/charts/PieChart";
import { TimePeriodSelector } from "@/components/charts/TimePeriodSelector";

interface PillarGraphsPaneProps {
  pillarName: string;
  pillarColor: string;
  lineChartData: Array<{
    month: string;
    value: number;
    target?: number;
  }>;
  pieChartData: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  metrics: Array<{
    label: string;
    value: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
  }>;
  lineChartTitle: string;
  pieChartTitle: string;
  formatValue?: (value: number) => string;
  hasRealData?: boolean;
  isLoading?: boolean;
  selectedTimePeriod?: string;
  onTimePeriodChange?: (period: string) => void;
  chartType?: 'line' | 'column';
}

export const PillarGraphsPane = ({
  pillarName,
  pillarColor,
  lineChartData,
  pieChartData,
  metrics,
  lineChartTitle,
  pieChartTitle,
  formatValue = (value) => value.toString(),
  hasRealData = false,
  isLoading = false,
  selectedTimePeriod = "5m",
  onTimePeriodChange,
  chartType = 'line'
}: PillarGraphsPaneProps) => {
  // Helper function to render chart with no data fallback
  const renderChartContent = (data: unknown[], component: React.ReactNode, fallbackMessage: string) => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-48">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      );
    }
    
    if (!hasRealData || data.length === 0) {
      return (
        <div className="flex justify-center items-center h-48">
          <p className="text-muted-foreground">{fallbackMessage}</p>
        </div>
      );
    }
    
    return component;
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="space-y-4 p-4">
        {/* Line Chart */}
        <Card className="p-4 shadow-lg">
          <div className="mb-3">
            <h3 className={`text-base font-semibold text-${pillarColor} mb-2`}>{lineChartTitle}</h3>
            {onTimePeriodChange && (
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-muted-foreground">Time Period:</span>
                <TimePeriodSelector
                  selectedPeriod={selectedTimePeriod}
                  onPeriodChange={onTimePeriodChange}
                  showLabel={false}
                />
              </div>
            )}
          </div>
          <div className="h-48">
            {renderChartContent(
              lineChartData,
              chartType === 'column' ? (
                <IncidentColumnChart 
                  data={lineChartData}
                  title={lineChartTitle}
                  formatValue={formatValue}
                />
              ) : (
                <TrendLineChart 
                  data={lineChartData}
                  title={lineChartTitle}
                  color="hsl(var(--chart-1))"
                  formatValue={formatValue}
                />
              ),
              "No data found to create graph"
            )}
          </div>
        </Card>

        {/* Pie Chart */}
        <Card className="p-4 shadow-lg">
          <h3 className={`text-base font-semibold text-${pillarColor} mb-3`}>{pieChartTitle}</h3>
          <div className="h-48">
            {renderChartContent(
              pieChartData,
              <PieChartComponent 
                data={pieChartData}
                title={pieChartTitle}
                showLegend={true}
                height="h-full"
              />,
              "No data found to create graph"
            )}
          </div>
        </Card>

        {/* Metrics */}
        <div className="space-y-2">
          {metrics.map((metric, index) => (
            <Card key={index} className="p-3 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${metric.color} shadow-sm`}>
                  <metric.icon className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-bold text-foreground">{metric.value}</p>
                  <p className="text-xs text-muted-foreground font-medium truncate">{metric.label}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};