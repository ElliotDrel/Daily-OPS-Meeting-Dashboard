import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { LetterGrid } from "@/components/dashboard/LetterGrid";
import { SimpleBarChart } from "@/components/dashboard/SimpleBarChart";
import { IncidentTable } from "@/components/dashboard/IncidentTable";
import { dashboardData } from "@/data/mockData";
import type { Incident } from "@/data/mockData";

type PillarLetter = 'S' | 'Q' | 'C' | 'I' | 'D' | 'P';
type PillarName = 'safety' | 'quality' | 'cost' | 'inventory' | 'delivery' | 'production';

const pillarRoutes: Record<PillarLetter, string> = {
  S: '/safety',
  Q: '/quality', 
  C: '/cost',
  I: '/inventory',
  D: '/delivery',
  P: '/people'
};

const pillarColors: Record<PillarLetter, PillarName> = {
  S: 'safety',
  Q: 'quality',
  C: 'cost', 
  I: 'inventory',
  D: 'delivery',
  P: 'production'
};

const pillarNames: Record<PillarName, string> = {
  safety: 'Safety',
  quality: 'Quality',
  cost: 'Cost',
  inventory: 'Inventory', 
  delivery: 'Delivery',
  production: 'People'
};
export const Dashboard = () => {
  const navigate = useNavigate();
  
  const handlePillarClick = (letter: PillarLetter) => {
    const route = pillarRoutes[letter];
    if (route) {
      navigate(route);
    }
  };
  
  const handleCellClick = (letter: string, day: number) => {
    console.log(`${letter} - Day ${day} clicked`);
    // Handle individual day click logic here
  };
  
  const handleIncidentClick = (incident: Incident) => {
    console.log('Incident clicked:', incident);
    // Handle incident click logic here
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-blue-50/30">
      <div className="container mx-auto px-6 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Tier 3 OPS Meeting Dashboard
            </h1>
            <p className="text-muted-foreground">
              SQCDP Performance Overview
            </p>
          </div>

          {/* Main Dashboard Content */}
          <div className="space-y-8">
            {/* Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
              {(Object.keys(dashboardData.pillars) as PillarName[]).map((pillar) => (
                <SimpleBarChart 
                  key={`chart-${pillar}`} 
                  data={dashboardData.pillars[pillar].chartData} 
                  title={`${pillarNames[pillar]} Trend`} 
                  pillar={pillar} 
                />
              ))}
            </div>

            {/* Incidents Row */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
              {(Object.keys(dashboardData.pillars) as PillarName[]).map((pillar) => (
                <IncidentTable 
                  key={`incidents-${pillar}`} 
                  incidents={dashboardData.pillars[pillar].incidents} 
                  pillar={pillar} 
                  onIncidentClick={handleIncidentClick}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};