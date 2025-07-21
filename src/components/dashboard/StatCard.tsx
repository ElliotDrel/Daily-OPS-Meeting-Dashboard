import React from "react";

interface StatCardProps {
  value: string;
  label: string;
  icon: React.ReactNode;
  iconBg: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ value, label, icon, iconBg, className }) => (
  <div className={`rounded-lg border text-card-foreground shadow-sm bg-card/30 backdrop-blur-sm border-border/50 hover:shadow-xl transition-all duration-300 ${className ?? ''}`}>
    <div className="p-4">
      <div className="flex items-center space-x-3">
        <div className={`p-3 rounded-xl ${iconBg} shadow-lg flex items-center justify-center`}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-sm text-muted-foreground font-medium">{label}</p>
        </div>
      </div>
    </div>
  </div>
); 