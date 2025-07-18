// Enhanced mock data with comprehensive fake information

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
  meetingType: string;
  attendees: string[];
  notes: string;
  keyPoints: string[];
  nextMeeting?: string;
}

// Generate squares for current month (only actual days)
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

// Generate 7 days of chart data
const generateChartData = (baseValue = 50, targetValue = 60): ChartData[] => {
  const data: ChartData[] = [];
  
  for (let i = 1; i <= 7; i++) {
    data.push({
      day: i.toString(),
      value: Math.max(0, baseValue + (Math.random() - 0.5) * 30),
      target: targetValue
    });
  }
  
  return data;
};

// Generate 5 months of line chart data
const generateLineChartData = (baseValue = 50, targetValue = 60): LineChartData[] => {
  const months = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan'];
  return months.map((month, index) => ({
    month,
    value: Math.max(0, baseValue + (Math.random() - 0.5) * 20 + index * 2),
    target: targetValue
  }));
};

// Generate incidents with more realistic data
const generateIncidents = (count = 5, type = 'safety'): Incident[] => {
  const descriptions = {
    safety: [
      'Near miss reported in Assembly Line 2',
      'PPE compliance audit found 3 violations',
      'Emergency shower malfunction in Building A',
      'Safety training completion deadline approaching',
      'Hazardous material spill contained in Warehouse C',
      'First aid kit inspection overdue in Production',
      'Safety walkthrough identified blocked emergency exit'
    ],
    quality: [
      'Customer complaint: Product finish below specification',
      'Supplier quality audit failed on incoming materials',
      'Batch QC-2401-15 failed final inspection',
      'Calibration due on CMM measurement equipment',
      'Non-conformance report filed for Product Line B',
      'Quality manual update required for ISO compliance',
      'Customer return: Packaging defects on Order #45789'
    ],
    cost: [
      'Material cost variance exceeded budget by 12%',
      'Overtime hours 25% above target for Production Dept',
      'Scrap rate increased to 4.2% in Machining Center',
      'Energy consumption spike detected in Building 2',
      'Vendor pricing negotiation needed for steel suppliers',
      'Inventory carrying costs exceeded quarterly budget',
      'Equipment maintenance costs higher than projected'
    ],
    delivery: [
      'Order #78923 delayed due to material shortage',
      'Transportation delay: Truck breakdown on Route 45',
      'Customer expedite request for Order #67234',
      'Production schedule conflict affecting delivery dates',
      'Supplier late delivery impacting customer commitments',
      'Logistics optimization needed for West Coast routes',
      'Inventory shortage causing production delays'
    ],
    production: [
      'Shift staffing below target: 24/28 people on shift',
      'Actual output 95% of planned due to staffing shortage',
      'No-show rate at 14% affecting line efficiency',
      'Machine downtime due to operator shortage on Line 2',
      'Overtime required to meet production targets',
      'Shift handover delays affecting start-up time',
      'Production efficiency down to 92% from staffing gaps'
    ],
    inventory: [
      'Internal process optimization review scheduled',
      'Cross-departmental communication protocol update needed',
      'Resource allocation assessment for Q2 planning',
      'Workflow efficiency analysis pending for Assembly',
      'Internal audit findings require corrective action',
      'Process standardization initiative needs approval',
      'Internal training module development behind schedule'
    ]
  };

  const statuses: Incident['status'][] = ['open', 'investigating', 'resolved'];
  const severities: Incident['severity'][] = ['low', 'medium', 'high'];

  return Array.from({ length: count }, (_, i) => ({
    id: `${type}-${i + 1}`,
    date: `${new Date().getMonth() + 1}/${Math.max(1, new Date().getDate() - i - Math.floor(Math.random() * 5))}`,
    description: descriptions[type as keyof typeof descriptions][i % descriptions[type as keyof typeof descriptions].length],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    severity: severities[Math.floor(Math.random() * severities.length)]
  }));
};

// Safety specific data
export const safetyData = {
  lineChart: generateLineChartData(42, 50),
  donutData: [
    { name: 'Human Error', value: 35, color: '#ef4444' },
    { name: 'Equipment', value: 25, color: '#f97316' },
    { name: 'Environment', value: 20, color: '#eab308' },
    { name: 'Procedures', value: 15, color: '#84cc16' },
    { name: 'Materials', value: 5, color: '#06b6d4' }
  ]
};

// Quality specific data
export const qualityData = {
  lineChart: generateLineChartData(88, 95),
  donutData: [
    { name: 'Supplier Issues', value: 30, color: '#ef4444' },
    { name: 'Process Variation', value: 25, color: '#f97316' },
    { name: 'Human Error', value: 20, color: '#eab308' },
    { name: 'Equipment', value: 15, color: '#84cc16' },
    { name: 'Material Defects', value: 10, color: '#06b6d4' }
  ]
};

// Cost specific data
export const costData = {
  lineChart: generateLineChartData(2150000, 2000000),
  donutData: [
    { name: 'Material Costs', value: 45, color: '#ef4444' },
    { name: 'Labor Costs', value: 30, color: '#f97316' },
    { name: 'Overhead', value: 15, color: '#eab308' },
    { name: 'Energy', value: 7, color: '#84cc16' },
    { name: 'Waste/Scrap', value: 3, color: '#06b6d4' }
  ]
};

// Delivery specific data
export const deliveryData = {
  lineChart: generateLineChartData(92, 95),
  donutData: [
    { name: 'On Time', value: 92.5, color: '#22c55e' },
    { name: 'Late', value: 6.2, color: '#ef4444' },
    { name: 'Early', value: 1.3, color: '#3b82f6' }
  ]
};

// Production specific data
export const productionData = {
  lineChart: generateLineChartData(1420, 1500), // Actual vs Planned Output
  donutData: [
    { name: 'Full Staffed', value: 70, color: '#22c55e' },
    { name: 'Short Staffed', value: 25, color: '#eab308' },
    { name: 'Critical Staffed', value: 5, color: '#ef4444' }
  ]
};

// Generate action items for each pillar
const generateActionItems = (pillarType: string): ActionItem[] => {
  const actionItemsData = {
    safety: [
      { description: "Complete PPE compliance audit for all departments", assignee: "Safety Team", priority: "High" as const, category: "Compliance" },
      { description: "Update emergency evacuation procedures", assignee: "John Smith", priority: "Medium" as const, category: "Emergency Prep" },
      { description: "Install additional safety signage in warehouse", assignee: "Maintenance", priority: "Low" as const, category: "Infrastructure" },
      { description: "Conduct safety training for new hires", assignee: "HR Department", priority: "High" as const, category: "Training" },
      { description: "Replace worn safety equipment in Line 3", assignee: "Operations", priority: "Medium" as const, category: "Equipment" }
    ],
    quality: [
      { description: "Implement corrective action for supplier non-conformance", assignee: "Quality Team", priority: "High" as const, category: "Supplier" },
      { description: "Calibrate measurement equipment in Lab B", assignee: "QC Lab", priority: "Medium" as const, category: "Equipment" },
      { description: "Update quality control procedures manual", assignee: "Jane Doe", priority: "Low" as const, category: "Documentation" },
      { description: "Investigate customer complaint #QC-2024-15", assignee: "Quality Manager", priority: "High" as const, category: "Customer" },
      { description: "Review and approve new supplier quality plan", assignee: "Procurement", priority: "Medium" as const, category: "Supplier" }
    ],
    cost: [
      { description: "Analyze material cost variance for Q1", assignee: "Finance Team", priority: "High" as const, category: "Analysis" },
      { description: "Negotiate better rates with steel suppliers", assignee: "Procurement", priority: "Medium" as const, category: "Procurement" },
      { description: "Implement energy saving initiatives", assignee: "Facilities", priority: "Low" as const, category: "Efficiency" },
      { description: "Review overtime authorization process", assignee: "HR Manager", priority: "Medium" as const, category: "Labor" },
      { description: "Optimize inventory levels to reduce carrying costs", assignee: "Supply Chain", priority: "High" as const, category: "Inventory" }
    ],
    delivery: [
      { description: "Resolve transportation delays with Carrier A", assignee: "Logistics Team", priority: "High" as const, category: "Transportation" },
      { description: "Update delivery schedule for expedited orders", assignee: "Planning", priority: "Medium" as const, category: "Scheduling" },
      { description: "Implement backup delivery routes", assignee: "Distribution", priority: "Low" as const, category: "Contingency" },
      { description: "Review customer delivery requirements", assignee: "Customer Service", priority: "Medium" as const, category: "Customer" },
      { description: "Optimize warehouse picking process", assignee: "Warehouse Mgr", priority: "High" as const, category: "Process" }
    ],
    production: [
      { description: "Address shift staffing shortage - recruit 4 operators", assignee: "Production Mgr", priority: "High" as const, category: "Staffing" },
      { description: "Implement backup staffing plan for high absenteeism", assignee: "Shift Supervisor", priority: "High" as const, category: "Planning" },
      { description: "Optimize production schedule to maximize output", assignee: "Planning Team", priority: "Medium" as const, category: "Efficiency" },
      { description: "Reduce no-show rate through attendance incentives", assignee: "HR Manager", priority: "Medium" as const, category: "Attendance" },
      { description: "Cross-train operators for line flexibility", assignee: "Training Lead", priority: "Low" as const, category: "Skills" }
    ],
    inventory: [
      { description: "Optimize internal workflow processes", assignee: "Process Team", priority: "High" as const, category: "Process" },
      { description: "Review resource allocation efficiency", assignee: "Operations", priority: "Medium" as const, category: "Resources" },
      { description: "Implement cross-departmental communication tools", assignee: "IT Department", priority: "Low" as const, category: "Communication" },
      { description: "Complete internal audit recommendations", assignee: "Audit Team", priority: "High" as const, category: "Compliance" },
      { description: "Standardize procedures across departments", assignee: "Quality Lead", priority: "Medium" as const, category: "Standardization" }
    ]
  };

  const statuses: ActionItem['status'][] = ['Open', 'In Progress', 'Completed'];
  const items = actionItemsData[pillarType as keyof typeof actionItemsData] || [];
  
  return items.map((item, index) => ({
    id: `${pillarType}-action-${index + 1}`,
    ...item,
    dueDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    status: statuses[Math.floor(Math.random() * statuses.length)]
  }));
};

// Generate meeting notes for each pillar
const generateMeetingNotes = (pillarType: string): MeetingNote[] => {
  const meetingNotesData = {
    safety: [
      {
        meetingType: "Daily Standup",
        attendees: ["Safety Manager", "Production Lead", "HR Rep"],
        notes: "Discussed recent near-miss incident in Assembly Line 2. Root cause analysis reveals need for better visibility around corners. Team agreed to install convex mirrors at key intersections. Also reviewed upcoming safety training schedule - 12 employees need refresher training by month end.",
        keyPoints: [
          "Install convex mirrors at Assembly Line 2 intersections",
          "Schedule refresher training for 12 employees",
          "Update incident reporting forms to include visibility factors"
        ],
        nextMeeting: "Tomorrow's daily standup at 8:00 AM"
      },
      {
        meetingType: "Weekly Review",
        attendees: ["Safety Manager", "Operations Director", "Maintenance Lead", "Union Rep"],
        notes: "Weekly safety metrics review shows improvement in PPE compliance (up to 94%). Emergency shower testing completed in Buildings A and C, but Building B still pending due to parts delay. Discussed new OSHA requirements for confined space entry procedures.",
        keyPoints: [
          "PPE compliance improved to 94% (target: 95%)",
          "Building B emergency shower parts delayed until next week",
          "New OSHA confined space procedures need implementation by March 1st"
        ],
        nextMeeting: "Weekly review next Wednesday at 2:00 PM"
      }
    ],
    quality: [
      {
        meetingType: "Daily Standup",
        attendees: ["Quality Manager", "QC Inspector", "Production Supervisor"],
        notes: "Reviewed overnight production quality metrics. First-pass yield improved to 88.2%, approaching our 90% target. Customer complaint from Order #45789 regarding packaging defects has been investigated - root cause identified as worn tooling on Line 5. Replacement scheduled for tonight's maintenance window.",
        keyPoints: [
          "First-pass yield: 88.2% (trending toward 90% target)",
          "Line 5 tooling replacement scheduled for tonight",
          "Customer complaint resolution: packaging defect source identified"
        ],
        nextMeeting: "Tomorrow's quality standup at 7:30 AM"
      }
    ],
    cost: [
      {
        meetingType: "Weekly Review",
        attendees: ["Finance Manager", "Operations Director", "Procurement Lead"],
        notes: "Q1 cost analysis reveals material costs exceeded budget by 12% due to steel price increases. Discussed renegotiation strategy with suppliers and potential design changes to reduce material usage. Overtime costs also above target - recommend additional shift to reduce dependency on overtime hours.",
        keyPoints: [
          "Material costs 12% over budget due to steel prices",
          "Negotiate with steel suppliers for better rates",
          "Consider adding third shift to reduce overtime costs"
        ],
        nextMeeting: "Cost review meeting next Friday at 10:00 AM"
      }
    ],
    delivery: [
      {
        meetingType: "Daily Standup",
        attendees: ["Logistics Manager", "Customer Service", "Warehouse Lead"],
        notes: "Current on-time delivery at 92.5%, just below our 95% target. Three expedite requests came in overnight for West Coast customers. Transportation delays with Carrier A continue - backup carrier arrangements being finalized. Inventory levels adequate for next week's schedule.",
        keyPoints: [
          "On-time delivery: 92.5% (target: 95%)",
          "Three new expedite requests for West Coast",
          "Backup carrier contracts nearly finalized"
        ],
        nextMeeting: "Tomorrow's logistics standup at 9:00 AM"
      }
    ],
    production: [
      {
        meetingType: "Daily Production Review",
        attendees: ["Production Manager", "Shift Supervisors", "Planning Team"],
        notes: "Current shift running with 24/28 planned operators due to 4 no-shows. Actual output at 1,420 units vs planned 1,500 (95% efficiency). Line 2 experiencing delays due to operator shortage. Overtime authorization approved for evening shift to catch up on targets.",
        keyPoints: [
          "86% shift staffing (24/28 operators present)",
          "Output efficiency at 95% due to staffing gaps",
          "Evening shift overtime approved to meet targets"
        ],
        nextMeeting: "Tomorrow's production standup at 6:00 AM"
      }
    ],
    inventory: [
      {
        meetingType: "Daily Standup",
        attendees: ["Process Manager", "Operations Lead", "IT Coordinator"],
        notes: "Internal process optimization showing 15% efficiency gains in Assembly. Cross-departmental communication improvements implemented last week are reducing response times. Resource allocation analysis reveals potential for better utilization in afternoon shifts.",
        keyPoints: [
          "Assembly process efficiency up 15%",
          "Communication response times improved",
          "Afternoon shift resource optimization opportunity identified"
        ],
        nextMeeting: "Tomorrow's process standup at 8:30 AM"
      }
    ]
  };

  const baseNotes = meetingNotesData[pillarType as keyof typeof meetingNotesData] || [];
  
  return baseNotes.map((note, index) => ({
    id: `${pillarType}-note-${index + 1}`,
    date: new Date(Date.now() - (index + 1) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    ...note
  }));
};

export const dashboardData = {
  pillars: {
    safety: {
      squares: generateSquares(0.8),
      chartData: generateChartData(45, 50),
      incidents: generateIncidents(7, 'safety'),
      actionItems: generateActionItems('safety'),
      meetingNotes: generateMeetingNotes('safety')
    },
    quality: {
      squares: generateSquares(0.75),
      chartData: generateChartData(85, 90),
      incidents: generateIncidents(6, 'quality'),
      actionItems: generateActionItems('quality'),
      meetingNotes: generateMeetingNotes('quality')
    },
    cost: {
      squares: generateSquares(0.7),
      chartData: generateChartData(65, 70),
      incidents: generateIncidents(5, 'cost'),
      actionItems: generateActionItems('cost'),
      meetingNotes: generateMeetingNotes('cost')
    },
    inventory: {
      squares: generateSquares(0.75),
      chartData: generateChartData(78, 85),
      incidents: generateIncidents(4, 'inventory'),
      actionItems: generateActionItems('inventory'),
      meetingNotes: generateMeetingNotes('inventory')
    },
    delivery: {
      squares: generateSquares(0.85),
      chartData: generateChartData(92, 95),
      incidents: generateIncidents(4, 'delivery'),
      actionItems: generateActionItems('delivery'),
      meetingNotes: generateMeetingNotes('delivery')
    },
    production: {
      squares: generateSquares(0.85),
      chartData: generateChartData(1420, 1500),
      incidents: generateIncidents(6, 'production'),
      actionItems: generateActionItems('production'),
      meetingNotes: generateMeetingNotes('production')
    }
  }
};