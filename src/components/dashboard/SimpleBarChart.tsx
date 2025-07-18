import { motion } from "framer-motion";

interface ChartData {
  day: string;
  value: number;
  target: number;
}

interface SimpleBarChartProps {
  data: ChartData[];
  title: string;
  pillar: string;
}

export const SimpleBarChart = ({ data, title, pillar }: SimpleBarChartProps) => {
  // Helper function to calculate bar height safely
  const calculateBarHeight = (value: number) => {
    return Math.max(2, Math.min(value, 100)); // 2% min for visibility, 100% max
  };

  return (
    <div className="bg-card/50 backdrop-blur-sm border-border/50 rounded-xl p-6 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-lg font-semibold text-foreground">{title}</h4>
        <div className="text-sm text-muted-foreground">Target: 90%</div>
      </div>
      
      <div className="h-32 relative mb-4">
        {/* Grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none z-0">
          {[100, 75, 50, 25, 0].map((value) => (
            <div key={value} className="border-t border-border/30 w-full" />
          ))}
        </div>
        
        {/* Y-axis labels */}
        <div className="absolute -left-8 h-full flex flex-col justify-between text-xs text-muted-foreground z-0">
          {[100, 75, 50, 25, 0].map((value) => (
            <span key={value}>{value}%</span>
          ))}
        </div>
        
        {/* Bars container */}
        <div className="h-full flex items-end justify-between gap-1 relative z-10">
          {data.map((item, index) => {
            const barHeight = calculateBarHeight(item.value);
            const targetHeight = calculateBarHeight(item.target);
            const isOverTarget = item.value > item.target;
            
            return (
              <div key={index} className="flex-1 relative flex flex-col justify-end min-w-[40px] h-full">
                {/* Target line */}
                <div 
                  className="absolute w-full border-t-2 border-amber-400 z-20 opacity-70"
                  style={{ bottom: `${targetHeight}%` }}
                />
                
                {/* Value label above bar */}
                <motion.div 
                  className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-foreground bg-background/80 px-1 rounded z-30"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 + 0.6 }}
                >
                  {item.value}%
                </motion.div>
                
                {/* Bar */}
                <motion.div
                  className={`w-full rounded-t-lg shadow-lg border-t-2 relative z-10 ${
                    isOverTarget 
                      ? 'bg-gradient-to-t from-red-500/80 to-red-400/60 border-red-400 shadow-red-500/20' 
                      : 'bg-gradient-to-t from-blue-500/80 to-blue-400/60 border-blue-400 shadow-blue-500/20'
                  }`}
                  style={{ height: `${barHeight}%` }}
                  initial={{ height: 0 }}
                  animate={{ height: `${barHeight}%` }}
                  transition={{ duration: 0.8, delay: index * 0.1, ease: "easeOut" }}
                  whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                  title={`${item.day}: ${item.value}% (Target: ${item.target}%)`}
                />
                
                {/* Day label */}
                <div className="text-sm font-medium text-center text-foreground mt-2 absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-full">
                  {item.day}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Trend line */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-20">
          <motion.polyline
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            strokeDasharray="4 4"
            points={data.map((item, index) => {
              const barHeight = calculateBarHeight(item.value);
              const x = ((index + 0.5) / data.length) * 100;
              const y = 100 - barHeight;
              return `${x}%,${y}%`;
            }).join(' ')}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, delay: 0.8 }}
          />
        </svg>
      </div>
      
      {/* Legend */}
      <div className="flex justify-center space-x-6 text-xs">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-blue-400 rounded"></div>
          <span className="text-muted-foreground">At/Below Target</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-gradient-to-r from-red-500 to-red-400 rounded"></div>
          <span className="text-muted-foreground">Above Target</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-1 bg-amber-400 rounded"></div>
          <span className="text-muted-foreground">Target Line</span>
        </div>
      </div>
    </div>
  );
};