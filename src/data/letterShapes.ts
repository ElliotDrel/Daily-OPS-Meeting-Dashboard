export interface Rect {
  day: number
  x: number
  y: number
  width: number
  height: number
}

interface ShapePoint {
  x: number
  y: number
  priority: number // 1 = core structure, 2 = important, 3 = filler
}

/**
 * Get the number of days in the current month
 */
export function getCurrentMonthDays(): number {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
}

/**
 * Base structural points for letter S
 * These define the core shape that will be preserved regardless of month length
 */
const shapeS_BasePoints: ShapePoint[] = [
  // Top horizontal line (priority 1 - core structure)
  { x: 10, y: 10, priority: 1 }, { x: 25, y: 10, priority: 1 }, { x: 40, y: 10, priority: 1 },
  { x: 55, y: 10, priority: 1 }, { x: 70, y: 10, priority: 1 }, { x: 85, y: 10, priority: 1 }, { x: 100, y: 10, priority: 1 },
  
  // Left side top section (priority 1)
  { x: 10, y: 25, priority: 1 }, { x: 10, y: 40, priority: 1 }, { x: 10, y: 55, priority: 1 },
  
  // Middle horizontal line (priority 1)
  { x: 25, y: 55, priority: 1 }, { x: 40, y: 55, priority: 1 }, { x: 55, y: 55, priority: 1 },
  { x: 70, y: 55, priority: 1 }, { x: 85, y: 55, priority: 1 }, { x: 100, y: 55, priority: 1 },
  
  // Right side transition (priority 1)
  { x: 100, y: 70, priority: 1 },
  
  // Right side bottom section (priority 1)
  { x: 100, y: 85, priority: 1 }, { x: 100, y: 100, priority: 1 },
  
  // Bottom horizontal line (priority 1)
  { x: 85, y: 100, priority: 1 }, { x: 70, y: 100, priority: 1 }, { x: 55, y: 100, priority: 1 },
  { x: 40, y: 100, priority: 1 }, { x: 25, y: 100, priority: 1 }, { x: 10, y: 100, priority: 1 },
  
  // Additional fill points (priority 2-3)
  { x: 25, y: 25, priority: 2 }, { x: 40, y: 25, priority: 2 }, { x: 70, y: 70, priority: 2 },
  { x: 55, y: 70, priority: 3 }, { x: 40, y: 70, priority: 3 }, { x: 25, y: 70, priority: 3 }
];

/**
 * Base structural points for letter Q
 */
const shapeQ_BasePoints: ShapePoint[] = [
  // Top horizontal line (priority 1)
  { x: 25, y: 10, priority: 1 }, { x: 40, y: 10, priority: 1 }, { x: 55, y: 10, priority: 1 },
  { x: 70, y: 10, priority: 1 }, { x: 85, y: 10, priority: 1 }, { x: 100, y: 10, priority: 1 },
  
  // Left vertical line (priority 1)
  { x: 10, y: 25, priority: 1 }, { x: 10, y: 40, priority: 1 }, { x: 10, y: 55, priority: 1 },
  { x: 10, y: 70, priority: 1 }, { x: 10, y: 85, priority: 1 },
  
  // Bottom horizontal line (priority 1)
  { x: 25, y: 100, priority: 1 }, { x: 40, y: 100, priority: 1 }, { x: 55, y: 100, priority: 1 },
  { x: 70, y: 100, priority: 1 }, { x: 85, y: 100, priority: 1 },
  
  // Right vertical line (priority 1)
  { x: 100, y: 85, priority: 1 }, { x: 100, y: 70, priority: 1 }, { x: 100, y: 55, priority: 1 },
  { x: 100, y: 40, priority: 1 }, { x: 100, y: 25, priority: 1 },
  
  // Q tail (priority 1)
  { x: 55, y: 70, priority: 1 }, { x: 70, y: 85, priority: 1 }, { x: 85, y: 85, priority: 1 }, { x: 100, y: 100, priority: 1 },
  
  // Additional fill points (priority 2-3)
  { x: 40, y: 40, priority: 2 }, { x: 70, y: 40, priority: 2 }, { x: 40, y: 70, priority: 3 },
  { x: 70, y: 70, priority: 3 }, { x: 55, y: 40, priority: 3 }, { x: 55, y: 55, priority: 3 }
];

/**
 * Base structural points for letter C
 */
const shapeC_BasePoints: ShapePoint[] = [
  // Top horizontal line (priority 1)
  { x: 25, y: 10, priority: 1 }, { x: 40, y: 10, priority: 1 }, { x: 55, y: 10, priority: 1 },
  { x: 70, y: 10, priority: 1 }, { x: 85, y: 10, priority: 1 }, { x: 100, y: 10, priority: 1 },
  
  // Left vertical line (priority 1)
  { x: 10, y: 25, priority: 1 }, { x: 10, y: 40, priority: 1 }, { x: 10, y: 55, priority: 1 },
  { x: 10, y: 70, priority: 1 }, { x: 10, y: 85, priority: 1 },
  
  // Bottom horizontal line (priority 1)
  { x: 25, y: 100, priority: 1 }, { x: 40, y: 100, priority: 1 }, { x: 55, y: 100, priority: 1 },
  { x: 70, y: 100, priority: 1 }, { x: 85, y: 100, priority: 1 }, { x: 100, y: 100, priority: 1 },
  
  // Right opening indicators (priority 2)
  { x: 100, y: 25, priority: 2 }, { x: 100, y: 85, priority: 2 },
  { x: 85, y: 25, priority: 2 }, { x: 85, y: 85, priority: 2 },
  
  // Additional interior fill (priority 3)
  { x: 25, y: 25, priority: 3 }, { x: 40, y: 25, priority: 3 }, { x: 55, y: 25, priority: 3 },
  { x: 70, y: 25, priority: 3 }, { x: 25, y: 40, priority: 3 }, { x: 25, y: 55, priority: 3 },
  { x: 25, y: 70, priority: 3 }, { x: 25, y: 85, priority: 3 }, { x: 40, y: 55, priority: 3 }, { x: 55, y: 55, priority: 3 }
];

/**
 * Base structural points for letter I
 */
const shapeI_BasePoints: ShapePoint[] = [
  // Top horizontal line (priority 1)
  { x: 10, y: 10, priority: 1 }, { x: 25, y: 10, priority: 1 }, { x: 40, y: 10, priority: 1 },
  { x: 55, y: 10, priority: 1 }, { x: 70, y: 10, priority: 1 }, { x: 85, y: 10, priority: 1 }, { x: 100, y: 10, priority: 1 },
  
  // Vertical center line (priority 1)
  { x: 55, y: 25, priority: 1 }, { x: 55, y: 40, priority: 1 }, { x: 55, y: 55, priority: 1 },
  { x: 55, y: 70, priority: 1 }, { x: 55, y: 85, priority: 1 },
  
  // Bottom horizontal line (priority 1)
  { x: 10, y: 100, priority: 1 }, { x: 25, y: 100, priority: 1 }, { x: 40, y: 100, priority: 1 },
  { x: 55, y: 100, priority: 1 }, { x: 70, y: 100, priority: 1 }, { x: 85, y: 100, priority: 1 }, { x: 100, y: 100, priority: 1 },
  
  // Side support (priority 2)
  { x: 40, y: 25, priority: 2 }, { x: 70, y: 25, priority: 2 }, { x: 40, y: 85, priority: 2 }, { x: 70, y: 85, priority: 2 },
  
  // Additional support (priority 3)
  { x: 40, y: 40, priority: 3 }, { x: 70, y: 40, priority: 3 }, { x: 40, y: 55, priority: 3 },
  { x: 70, y: 55, priority: 3 }, { x: 40, y: 70, priority: 3 }, { x: 70, y: 70, priority: 3 },
  { x: 25, y: 55, priority: 3 }, { x: 85, y: 55, priority: 3 }
];

/**
 * Base structural points for letter D
 */
const shapeD_BasePoints: ShapePoint[] = [
  // Left vertical line (priority 1)
  { x: 10, y: 10, priority: 1 }, { x: 10, y: 25, priority: 1 }, { x: 10, y: 40, priority: 1 },
  { x: 10, y: 55, priority: 1 }, { x: 10, y: 70, priority: 1 }, { x: 10, y: 85, priority: 1 }, { x: 10, y: 100, priority: 1 },
  
  // Top horizontal line (priority 1)
  { x: 25, y: 10, priority: 1 }, { x: 40, y: 10, priority: 1 }, { x: 55, y: 10, priority: 1 },
  { x: 70, y: 10, priority: 1 }, { x: 85, y: 10, priority: 1 },
  
  // Right curved line (priority 1)
  { x: 100, y: 25, priority: 1 }, { x: 100, y: 40, priority: 1 }, { x: 100, y: 55, priority: 1 },
  { x: 100, y: 70, priority: 1 }, { x: 100, y: 85, priority: 1 },
  
  // Bottom horizontal line (priority 1)
  { x: 85, y: 100, priority: 1 }, { x: 70, y: 100, priority: 1 }, { x: 55, y: 100, priority: 1 },
  { x: 40, y: 100, priority: 1 }, { x: 25, y: 100, priority: 1 },
  
  // Interior fill (priority 2-3)
  { x: 25, y: 25, priority: 2 }, { x: 40, y: 25, priority: 2 }, { x: 55, y: 25, priority: 2 },
  { x: 70, y: 25, priority: 2 }, { x: 85, y: 25, priority: 2 }, { x: 85, y: 40, priority: 3 },
  { x: 85, y: 55, priority: 3 }, { x: 85, y: 70, priority: 3 }, { x: 85, y: 85, priority: 3 }
];

/**
 * Base structural points for letter P
 */
const shapeP_BasePoints: ShapePoint[] = [
  // Left vertical line (priority 1)
  { x: 10, y: 10, priority: 1 }, { x: 10, y: 25, priority: 1 }, { x: 10, y: 40, priority: 1 },
  { x: 10, y: 55, priority: 1 }, { x: 10, y: 70, priority: 1 }, { x: 10, y: 85, priority: 1 }, { x: 10, y: 100, priority: 1 },
  
  // Top horizontal line (priority 1)
  { x: 25, y: 10, priority: 1 }, { x: 40, y: 10, priority: 1 }, { x: 55, y: 10, priority: 1 },
  { x: 70, y: 10, priority: 1 }, { x: 85, y: 10, priority: 1 }, { x: 100, y: 10, priority: 1 },
  
  // Right side upper (priority 1)
  { x: 100, y: 25, priority: 1 }, { x: 100, y: 40, priority: 1 }, { x: 100, y: 55, priority: 1 },
  
  // Middle horizontal line (priority 1)
  { x: 85, y: 55, priority: 1 }, { x: 70, y: 55, priority: 1 }, { x: 55, y: 55, priority: 1 },
  { x: 40, y: 55, priority: 1 }, { x: 25, y: 55, priority: 1 },
  
  // Interior fill (priority 2-3)
  { x: 25, y: 25, priority: 2 }, { x: 40, y: 25, priority: 2 }, { x: 55, y: 25, priority: 2 },
  { x: 70, y: 25, priority: 2 }, { x: 85, y: 25, priority: 2 }, { x: 25, y: 40, priority: 3 },
  { x: 40, y: 40, priority: 3 }, { x: 55, y: 40, priority: 3 }, { x: 70, y: 40, priority: 3 }, { x: 85, y: 40, priority: 3 }
];

/**
 * Generate dynamic shape based on the number of days in the current month
 */
function generateDynamicShape(basePoints: ShapePoint[], daysInMonth: number): Rect[] {
  // Sort points by priority (1 = most important, 3 = least important)
  const sortedPoints = [...basePoints].sort((a, b) => a.priority - b.priority);
  
  // Select points based on days in month
  const selectedPoints = sortedPoints.slice(0, daysInMonth);
  
  // Convert to Rect array with day numbers
  return selectedPoints.map((point, index) => ({
    day: index + 1,
    x: point.x,
    y: point.y,
    width: 15,
    height: 15
  }));
}

/**
 * Generate shapes for all letters based on current month
 */
export function generateShapes(daysInMonth?: number): { [key: string]: Rect[] } {
  const days = daysInMonth || getCurrentMonthDays();
  
  return {
    S: generateDynamicShape(shapeS_BasePoints, days),
    Q: generateDynamicShape(shapeQ_BasePoints, days),
    C: generateDynamicShape(shapeC_BasePoints, days),
    I: generateDynamicShape(shapeI_BasePoints, days),
    D: generateDynamicShape(shapeD_BasePoints, days),
    P: generateDynamicShape(shapeP_BasePoints, days)
  };
}

// Export the main shapes object that will be used by components
export const shapes = generateShapes();

// Legacy exports for backward compatibility
export const shapeS = shapes.S;
export const shapeQ = shapes.Q;
export const shapeC = shapes.C;
export const shapeI = shapes.I;
export const shapeD = shapes.D;
export const shapeP = shapes.P;