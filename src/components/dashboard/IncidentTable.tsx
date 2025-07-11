import { Badge } from "@/components/ui/badge";

interface Incident {
  id: string;
  date: string;
  description: string;
  status: 'open' | 'investigating' | 'resolved';
  severity: 'low' | 'medium' | 'high';
}

interface IncidentTableProps {
  incidents: Incident[];
  pillar: string;
  onIncidentClick?: (incident: Incident) => void;
}

const getStatusColor = (status: Incident['status']) => {
  switch (status) {
    case 'open': return 'bg-status-issue';
    case 'investigating': return 'bg-status-caution';
    case 'resolved': return 'bg-status-good';
    default: return 'bg-status-future';
  }
};

export const IncidentTable = ({ incidents, pillar, onIncidentClick }: IncidentTableProps) => {
  return (
    <div className="bg-card rounded-lg p-4 shadow-sm border">
      <h4 className="text-sm font-medium text-muted-foreground mb-3">Recent Incidents</h4>
      
      <div className="space-y-2">
        {incidents.slice(0, 5).map((incident) => (
          <div
            key={incident.id}
            className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
            onClick={() => onIncidentClick?.(incident)}
          >
            <div className={`w-2 h-2 rounded-full ${getStatusColor(incident.status)}`} />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{incident.date}</span>
                <Badge 
                  variant="outline" 
                  className="text-xs"
                >
                  {incident.status}
                </Badge>
              </div>
              <p className="text-sm truncate mt-1">{incident.description}</p>
            </div>
          </div>
        ))}
        
        {incidents.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No recent incidents
          </p>
        )}
      </div>
    </div>
  );
};