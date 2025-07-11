import { motion } from "framer-motion";

interface DonutData {
  name: string;
  value: number;
  color: string;
}

interface SimpleDonutChartProps {
  data: DonutData[];
  title: string;
  centerText?: string;
  centerValue?: string;
}

export const SimpleDonutChart = ({ data, title, centerText, centerValue }: SimpleDonutChartProps) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const radius = 35;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  
  let cumulativePercentage = 0;

  return (
    <div className="w-full h-48 relative flex items-center justify-center">
      <div className="relative">
        {/* SVG Donut Chart */}
        <svg width="120" height="120" className="transform -rotate-90">
          {data.map((item, index) => {
            const percentage = item.value / total;
            const strokeDasharray = `${percentage * circumference} ${circumference}`;
            const strokeDashoffset = -cumulativePercentage * circumference;
            
            cumulativePercentage += percentage;
            
            return (
              <motion.circle
                key={index}
                cx="60"
                cy="60"
                r={radius}
                fill="transparent"
                stroke={item.color}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-300 hover:opacity-80"
                initial={{ strokeDasharray: `0 ${circumference}` }}
                animate={{ strokeDasharray }}
                transition={{ duration: 1, delay: index * 0.2 }}
              >
                <title>{`${item.name}: ${item.value}${typeof item.value === 'number' && item.value < 10 ? '%' : ''}`}</title>
              </motion.circle>
            );
          })}
        </svg>
        
        {/* Center content */}
        {(centerText || centerValue) && (
          <div className="absolute inset-0 flex items-center justify-center">
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
      
      {/* Legend */}
      <div className="ml-6 space-y-2">
        {data.map((item, index) => (
          <motion.div
            key={index}
            className="flex items-center space-x-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 + 0.5 }}
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs text-muted-foreground">{item.name}</span>
            <span className="text-xs font-medium">
              {item.value}{typeof item.value === 'number' && item.value < 10 ? '%' : ''}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};