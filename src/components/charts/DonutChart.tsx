import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { DonutData } from '@/data/mockData';

interface DonutChartProps {
  data: DonutData[];
  title: string;
  centerText?: string;
  centerValue?: string;
}

export const DonutChart = ({ data, title, centerText, centerValue }: DonutChartProps) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  const renderCustomLabel = (entry: any) => {
    const percent = ((entry.value / total) * 100).toFixed(1);
    return `${percent}%`;
  };

  return (
    <div className="w-full h-48 relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius={70}
            innerRadius={35}
            fill="#8884d8"
            dataKey="value"
            fontSize={10}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
            }}
            formatter={(value: number) => [`${value}${typeof value === 'number' && value < 10 ? '%' : ''}`, 'Count']}
          />
        </PieChart>
      </ResponsiveContainer>
      
      {/* Center text */}
      {(centerText || centerValue) && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            {centerValue && (
              <div className="text-2xl font-bold text-foreground">{centerValue}</div>
            )}
            {centerText && (
              <div className="text-sm text-muted-foreground">{centerText}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};