import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { LineChartData } from '@/data/mockData';

interface TrendLineChartProps {
  data: LineChartData[];
  title: string;
  color: string;
  formatValue?: (value: number) => string;
}

export const TrendLineChart = ({ data, title, color, formatValue = (v) => v.toString() }: TrendLineChartProps) => {
  return (
    <div className="w-full h-48">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="month" 
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
            tickFormatter={formatValue}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
            }}
            formatter={(value: number, name: string) => [
              formatValue(value), 
              name === 'value' ? 'Actual' : 'Target'
            ]}
          />
          <Line 
            type="monotone" 
            dataKey="target" 
            stroke="#9ca3af" 
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            name="target"
          />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke={color} 
            strokeWidth={3}
            dot={{ fill: color, strokeWidth: 2, r: 5 }}
            activeDot={{ r: 7, fill: color }}
            name="value"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};