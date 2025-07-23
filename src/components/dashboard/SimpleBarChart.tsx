import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartData } from '@/data/mockData';

interface SimpleBarChartProps {
  data: ChartData[];
  title: string;
  pillar: string;
}

const getPillarColor = (pillar: string): string => {
  const pillarColors: Record<string, string> = {
    safety: 'hsl(180, 85%, 42%)',
    quality: 'hsl(220, 95%, 55%)',
    cost: 'hsl(145, 85%, 48%)',
    delivery: 'hsl(25, 95%, 62%)',
    production: 'hsl(210, 85%, 45%)',
    inventory: 'hsl(285, 85%, 55%)', // Purple fallback for inventory
  };
  
  return pillarColors[pillar] || 'hsl(220, 95%, 55%)'; // Default to quality blue
};

export const SimpleBarChart = ({ data, title, pillar }: SimpleBarChartProps) => {
  const pillarColor = getPillarColor(pillar);
  const targetColor = '#9ca3af'; // Gray for target bars

  return (
    <div className="w-full h-48">
      <h3 className="text-sm font-medium text-gray-700 mb-2">{title}</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="day" 
            axisLine={false}
            tickLine={false}
            fontSize={12}
            fill="#6b7280"
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            fontSize={12}
            fill="#6b7280"
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
            }}
            formatter={(value: number, name: string) => [
              value.toFixed(1), 
              name === 'value' ? 'Actual' : 'Target'
            ]}
          />
          <Bar 
            dataKey="target" 
            fill={targetColor}
            name="target"
            opacity={0.7}
            radius={[2, 2, 0, 0]}
          />
          <Bar 
            dataKey="value" 
            fill={pillarColor}
            name="value"
            radius={[2, 2, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};