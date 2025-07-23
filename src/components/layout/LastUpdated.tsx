import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

export const LastUpdated = () => {
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [timeAgo, setTimeAgo] = useState("just now");

  useEffect(() => {
    const updateTimeAgo = () => {
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - lastUpdated.getTime()) / 1000);
      
      if (diffInSeconds < 60) {
        setTimeAgo("just now");
      } else {
        const minutes = Math.floor(diffInSeconds / 60);
        setTimeAgo(`${minutes}m ago`);
      }
    };

    // Update time display every 10 seconds
    const displayInterval = setInterval(updateTimeAgo, 10000);
    
    // Auto-refresh (simulate data update) every 2 minutes maximum
    const refreshInterval = setInterval(() => {
      setLastUpdated(new Date());
    }, 120000); // 2 minutes

    // Initial call
    updateTimeAgo();

    return () => {
      clearInterval(displayInterval);
      clearInterval(refreshInterval);
    };
  }, [lastUpdated]);

  return (
    <div className="flex items-center space-x-1.5 text-xs text-navy-foreground/70 bg-navy/10 px-2 py-1 rounded-md">
      <Clock className="w-3 h-3" />
      <span>Updated {timeAgo}</span>
    </div>
  );
};