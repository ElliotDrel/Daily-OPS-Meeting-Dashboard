import { Card } from "@/components/ui/card";
import { TrendLineChart } from "@/components/charts/TrendLineChart";
import { PieChartComponent } from "@/components/charts/PieChart";

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
}

export const PillarGraphsPane = ({
  pillarName,
  pillarColor,
  lineChartData,
  pieChartData,
  metrics,
  lineChartTitle,
  pieChartTitle,
  formatValue = (value) => value.toString()
}: PillarGraphsPaneProps) => {
  return (
    <div className="h-full overflow-y-auto">
      <div className="space-y-4 p-4">
        {/* Line Chart */}
        <Card className="p-4 shadow-lg">
          <h3 className={`text-base font-semibold text-${pillarColor} mb-3`}>{lineChartTitle}</h3>
          <div className="h-48">
            <TrendLineChart 
              data={lineChartData}
              title={lineChartTitle}
              color="hsl(var(--chart-1))"
              formatValue={formatValue}
            />
          </div>
        </Card>

        {/* Pie Chart */}
        <Card className="p-4 shadow-lg">
          <h3 className={`text-base font-semibold text-${pillarColor} mb-3`}>{pieChartTitle}</h3>
          <div className="h-48">
            <PieChartComponent 
              data={pieChartData}
              title={pieChartTitle}
              showLegend={true}
              height="h-full"
            />
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