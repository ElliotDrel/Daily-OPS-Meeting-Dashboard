import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { LetterGrid } from "@/components/dashboard/LetterGrid";
import { SimpleBarChart } from "@/components/dashboard/SimpleBarChart";
import { IncidentTable } from "@/components/dashboard/IncidentTable";
import { dashboardData } from "@/data/mockData";
const pillarRoutes = {
  S: '/safety',
  Q: '/quality',
  C: '/cost',
  I: '/inventory',
  D: '/delivery',
  P: '/production'
};
const pillarColors = {
  S: 'safety',
  Q: 'quality',
  C: 'cost',
  I: 'inventory',
  D: 'delivery',
  P: 'production'
};
export const Dashboard = () => {
  const navigate = useNavigate();
  const handlePillarClick = (letter: keyof typeof pillarRoutes) => {
    navigate(pillarRoutes[letter]);
  };
  const handleCellClick = (letter: string, day: number) => {
    console.log(`${letter} - Day ${day} clicked`);
    // Handle individual day click logic here
  };
  return <div className="min-h-screen bg-gradient-to-br from-background via-background to-blue-50/30">
      <div className="container mx-auto px-6 py-8">
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} className="space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground">Tier 3 OPS Meeting</h1>
            
          </div>

          {/* Main Dashboard Content */}
          <div className="space-y-8">
            {/* Letter Grids Row */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
              {(Object.keys(dashboardData.pillars) as Array<keyof typeof dashboardData.pillars>).map((pillar, index) => {
              const letter = pillar.charAt(0).toUpperCase() as keyof typeof pillarRoutes;
              return <LetterGrid key={pillar} letter={letter} squares={dashboardData.pillars[pillar].squares} pillarColor={pillarColors[letter]} onClick={() => handlePillarClick(letter)} onCellClick={day => handleCellClick(letter, day)} />;
            })}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
              {(Object.keys(dashboardData.pillars) as Array<keyof typeof dashboardData.pillars>).map(pillar => <SimpleBarChart key={`chart-${pillar}`} data={dashboardData.pillars[pillar].chartData} title={`${pillar.charAt(0).toUpperCase() + pillar.slice(1)} Trend`} pillar={pillar} />)}
            </div>

            {/* Incidents Row */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
              {(Object.keys(dashboardData.pillars) as Array<keyof typeof dashboardData.pillars>).map(pillar => <IncidentTable key={`incidents-${pillar}`} incidents={dashboardData.pillars[pillar].incidents} pillar={pillar} onIncidentClick={incident => {
              console.log('Incident clicked:', incident);
            }} />)}
            </div>
          </div>
        </motion.div>
      </div>
    </div>;
};