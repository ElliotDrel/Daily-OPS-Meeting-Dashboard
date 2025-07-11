import { motion } from "framer-motion";

interface LineChartData {
  month: string;
  value: number;
  target: number;
}

interface SimpleLineChartProps {
  data: LineChartData[];
  title: string;
  color: string;
  formatValue?: (value: number) => string;
}

export const SimpleLineChart = ({ data, title, color, formatValue = (v) => v.toString() }: SimpleLineChartProps) => {
  const maxValue = Math.max(...data.map(d => Math.max(d.value, d.target))) * 1.1;
  const minValue = Math.min(...data.map(d => Math.min(d.value, d.target))) * 0.9;
  const range = maxValue - minValue;

  const getY = (value: number) => {
    return 100 - ((value - minValue) / range) * 100;
  };

  const points = data.map((item, index) => ({
    x: (index / (data.length - 1)) * 100,
    y: getY(item.value),
    targetY: getY(item.target),
    ...item
  }));

  const pathData = points.map((point, index) => 
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ');

  const targetPathData = points.map((point, index) => 
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.targetY}`
  ).join(' ');

  return (
    <div className="w-full h-48 relative">
      <svg width="100%" height="100%" viewBox="0 0 100 100" className="overflow-visible">
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map(y => (
          <line
            key={y}
            x1="0"
            y1={y}
            x2="100"
            y2={y}
            stroke="#e5e7eb"
            strokeWidth="0.2"
          />
        ))}
        
        {/* Target line (dashed) */}
        <motion.path
          d={targetPathData}
          fill="none"
          stroke="#9ca3af"
          strokeWidth="0.5"
          strokeDasharray="2 2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, delay: 0.5 }}
        />
        
        {/* Actual value line */}
        <motion.path
          d={pathData}
          fill="none"
          stroke={color}
          strokeWidth="0.8"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5 }}
        />
        
        {/* Data points */}
        {points.map((point, index) => (
          <motion.g key={index}>
            <motion.circle
              cx={point.x}
              cy={point.y}
              r="1"
              fill={color}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 + 1 }}
            />
            {/* Tooltip on hover */}
            <circle
              cx={point.x}
              cy={point.y}
              r="3"
              fill="transparent"
              className="cursor-pointer"
            >
              <title>{`${point.month}: ${formatValue(point.value)} (Target: ${formatValue(point.target)})`}</title>
            </circle>
          </motion.g>
        ))}
      </svg>
      
      {/* X-axis labels */}
      <div className="flex justify-between mt-2 px-2">
        {data.map((item, index) => (
          <span key={index} className="text-xs text-muted-foreground">
            {item.month}
          </span>
        ))}
      </div>
    </div>
  );
};