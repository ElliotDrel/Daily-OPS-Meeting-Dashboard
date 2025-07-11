import { motion } from "framer-motion";
import { SimpleBarChart } from "@/components/dashboard/SimpleBarChart";
import { IncidentTable } from "@/components/dashboard/IncidentTable";
import { dashboardData } from "@/data/mockData";
export const Dashboard = () => {
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