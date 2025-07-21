import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { DonutData } from '@/data/mockData';

interface PieChartProps {
  data: DonutData[];
  title: string;
  showLegend?: boolean;
  innerRadius?: number;
  outerRadius?: number;
  height?: string;
}

export const PieChartComponent = ({ 
  data, 
  title, 
  showLegend = true, 
  innerRadius = 0, 
  outerRadius = 80,
  height = "h-64"
}: PieChartProps) => {
  return (
    <div className={`w-full ${height}`}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={2}
            dataKey="value"
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
            formatter={(value: number, name: string) => [
              value.toString(), 
              name
            ]}
          />
          {showLegend && (
            <Legend 
              verticalAlign="bottom" 
              height={36}
              wrapperStyle={{
                fontSize: '12px',
                paddingTop: '10px'
              }}
            />
          )}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};