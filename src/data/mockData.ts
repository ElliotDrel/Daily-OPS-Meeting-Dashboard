// Type definitions only - all mock data has been removed
// Use real data collection system instead

export interface GridSquare {
  status: 'good' | 'caution' | 'issue' | 'future';
  date: string;
  value: number;
  label?: string;
}

export interface ChartData {
  day: string;
  value: number;
  target: number;
}

export interface Incident {
  id: string;
  date: string;
  description: string;
  status: 'open' | 'investigating' | 'resolved';
  severity: 'low' | 'medium' | 'high';
}

export interface LineChartData {
  month: string;
  value: number;
  target: number;
  dataType?: 'recorded' | 'missing';
}

export interface DonutData {
  name: string;
  value: number;
  color: string;
}

export interface ActionItem {
  id: string;
  description: string;
  assignee: string;
  priority: 'High' | 'Medium' | 'Low';
  dueDate: string;
  status: 'Open' | 'In Progress' | 'Completed';
  category?: string;
}

export interface MeetingNote {
  id: string;
  date: string;
  keyPoints: string[];
}

export interface SectionLead {
  pillar: string;
  name: string;
}

// Generate squares for current month (only actual days) - keeping for pillar grid display
const generateSquares = (baseGoodRate = 0.7): GridSquare[] => {
  const squares: GridSquare[] = [];
  const currentDate = new Date();
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  
  for (let i = 1; i <= daysInMonth; i++) {
    if (i <= currentDate.getDate()) {
      const rand = Math.random();
      let status: GridSquare['status'];
      
      if (rand < baseGoodRate) status = 'good';
      else if (rand < baseGoodRate + 0.2) status = 'caution';
      else status = 'issue';
      
      squares.push({
        status,
        date: `${currentDate.getMonth() + 1}/${i}`,
        value: Math.floor(Math.random() * 100),
        label: '%'
      });
    } else {
      squares.push({
        status: 'future',
        date: `${currentDate.getMonth() + 1}/${i}`,
        value: 0,
        label: ''
      });
    }
  }
  
  return squares;
};

// Generate section leads
const generateSectionLeads = (): SectionLead[] => {
  return [
    { pillar: 'safety', name: '' },
    { pillar: 'quality', name: '' },
    { pillar: 'cost', name: '' },
    { pillar: 'delivery', name: '' },
    { pillar: 'inventory', name: '' },
    { pillar: 'production', name: '' },
    { pillar: 'people', name: '' }
  ];
};

// Only keep minimal dashboard data for pillar grid squares and section leads
// All chart data now comes from real data collection system
export const dashboardData = {
  sectionLeads: generateSectionLeads(),
  pillars: {
    safety: {
      squares: generateSquares(0.8)
    },
    quality: {
      squares: generateSquares(0.75)
    },
    cost: {
      squares: generateSquares(0.7)
    },
    inventory: {
      squares: generateSquares(0.75)
    },
    delivery: {
      squares: generateSquares(0.85)
    },
    production: {
      squares: generateSquares(0.85)
    },
    people: {
      squares: generateSquares(0.82)
    }
  }
};