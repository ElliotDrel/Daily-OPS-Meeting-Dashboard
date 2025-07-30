import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { LineChartData } from '@/data/mockData';

interface IncidentColumnChartProps {
  data: LineChartData[];
  title: string;
  formatValue?: (value: number) => string;
}

export const IncidentColumnChart = ({ 
  data, 
  title, 
  formatValue = (v) => v.toString() 
}: IncidentColumnChartProps) => {
  // Define colors for conditional formatting
  const getBarColor = (value: number) => {
    return value > 0 
      ? 'hsl(var(--status-issue))' // Red for incidents
      : 'hsl(var(--status-good))'; // Green for no incidents
  };

  return (
    <div className="w-full h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={data} 
          margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
          barCategoryGap="20%"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="month" 
            axisLine={false}
            tickLine={false}
            fontSize={12}
            fill="#6b7280"
            interval={0}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            fontSize={12}
            fill="#6b7280"
            tickFormatter={formatValue}
            width={30}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
            }}
            formatter={(value: number, name: string, props: any) => {
              const dataType = props.payload?.dataType;
              
              if (dataType === 'missing') return ['No data recorded', 'Status'];
              if (dataType === 'future') return ['Future date', 'Status'];
              
              return [`${formatValue(value)} incident${value !== 1 ? 's' : ''}`, 'Count'];
            }}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <Bar 
            dataKey="value" 
            name="Incidents"
            radius={[4, 4, 0, 0]} // Rounded top corners
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={getBarColor(entry.value)}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};