export interface DayRect {
  day: number
  x: number
  y: number
  width: number
  height: number
}

/**
 * Get the number of days in the current month
 */
export function getCurrentMonthDays(): number {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
}

/**
 * Bubble letter path definitions - these define the curvy outlines of each letter
 */
const bubbleLetterPaths = {
  S: {
    // S shape as a curvy path - top curve, middle curve, bottom curve
    segments: [
      // Top horizontal curve
      { start: { x: 20, y: 15 }, control1: { x: 60, y: 5 }, control2: { x: 80, y: 15 }, end: { x: 100, y: 25 } },
      // Left side down
      { start: { x: 100, y: 25 }, control1: { x: 110, y: 35 }, control2: { x: 105, y: 45 }, end: { x: 90, y: 50 } },
      // Middle horizontal curve (right to left)
      { start: { x: 90, y: 50 }, control1: { x: 60, y: 45 }, control2: { x: 40, y: 55 }, end: { x: 30, y: 65 } },
      // Right side down
      { start: { x: 30, y: 65 }, control1: { x: 15, y: 75 }, control2: { x: 20, y: 85 }, end: { x: 35, y: 95 } },
      // Bottom horizontal curve
      { start: { x: 35, y: 95 }, control1: { x: 60, y: 105 }, control2: { x: 80, y: 95 }, end: { x: 100, y: 85 } }
    ]
  },
  Q: {
    // Q shape - circular with tail
    segments: [
      // Top arc
      { start: { x: 30, y: 20 }, control1: { x: 15, y: 10 }, control2: { x: 85, y: 10 }, end: { x: 90, y: 30 } },
      // Right arc  
      { start: { x: 90, y: 30 }, control1: { x: 105, y: 40 }, control2: { x: 105, y: 70 }, end: { x: 90, y: 85 } },
      // Bottom arc
      { start: { x: 90, y: 85 }, control1: { x: 85, y: 100 }, control2: { x: 35, y: 100 }, end: { x: 30, y: 85 } },
      // Left arc
      { start: { x: 30, y: 85 }, control1: { x: 15, y: 70 }, control2: { x: 15, y: 40 }, end: { x: 30, y: 20 } },
      // Q tail
      { start: { x: 75, y: 75 }, control1: { x: 85, y: 85 }, control2: { x: 95, y: 90 }, end: { x: 105, y: 100 } }
    ]
  },
  C: {
    // C shape - open circle
    segments: [
      // Top arc
      { start: { x: 95, y: 25 }, control1: { x: 85, y: 10 }, control2: { x: 35, y: 10 }, end: { x: 25, y: 30 } },
      // Left side
      { start: { x: 25, y: 30 }, control1: { x: 10, y: 40 }, control2: { x: 10, y: 70 }, end: { x: 25, y: 85 } },
      // Bottom arc
      { start: { x: 25, y: 85 }, control1: { x: 35, y: 100 }, control2: { x: 85, y: 100 }, end: { x: 95, y: 85 } },
      // Right opening (short segments for opening effect)
      { start: { x: 95, y: 25 }, control1: { x: 100, y: 30 }, control2: { x: 100, y: 35 }, end: { x: 95, y: 40 } },
      { start: { x: 95, y: 75 }, control1: { x: 100, y: 80 }, control2: { x: 100, y: 85 }, end: { x: 95, y: 85 } }
    ]
  },
  I: {
    // I shape - straight with serifs
    segments: [
      // Top horizontal
      { start: { x: 20, y: 15 }, control1: { x: 40, y: 12 }, control2: { x: 80, y: 12 }, end: { x: 100, y: 15 } },
      // Left side of top serif
      { start: { x: 20, y: 15 }, control1: { x: 25, y: 20 }, control2: { x: 35, y: 25 }, end: { x: 45, y: 30 } },
      // Center vertical (main stroke)
      { start: { x: 45, y: 30 }, control1: { x: 50, y: 45 }, control2: { x: 70, y: 75 }, end: { x: 75, y: 90 } },
      // Right side of bottom serif
      { start: { x: 75, y: 90 }, control1: { x: 85, y: 95 }, control2: { x: 95, y: 98 }, end: { x: 100, y: 100 } },
      // Bottom horizontal
      { start: { x: 100, y: 100 }, control1: { x: 80, y: 103 }, control2: { x: 40, y: 103 }, end: { x: 20, y: 100 } }
    ]
  },
  D: {
    // D shape - rounded rectangle
    segments: [
      // Left vertical
      { start: { x: 15, y: 15 }, control1: { x: 12, y: 30 }, control2: { x: 12, y: 80 }, end: { x: 15, y: 95 } },
      // Bottom horizontal
      { start: { x: 15, y: 95 }, control1: { x: 30, y: 100 }, control2: { x: 70, y: 100 }, end: { x: 85, y: 95 } },
      // Right curve
      { start: { x: 85, y: 95 }, control1: { x: 105, y: 85 }, control2: { x: 105, y: 25 }, end: { x: 85, y: 15 } },
      // Top horizontal
      { start: { x: 85, y: 15 }, control1: { x: 70, y: 10 }, control2: { x: 30, y: 10 }, end: { x: 15, y: 15 } },
      // Interior curve (for more bubble effect)
      { start: { x: 25, y: 25 }, control1: { x: 40, y: 20 }, control2: { x: 80, y: 30 }, end: { x: 85, y: 55 } }
    ]
  },
  P: {
    // P shape - vertical with top bubble
    segments: [
      // Left vertical
      { start: { x: 15, y: 15 }, control1: { x: 12, y: 40 }, control2: { x: 12, y: 80 }, end: { x: 15, y: 100 } },
      // Top horizontal
      { start: { x: 15, y: 15 }, control1: { x: 35, y: 10 }, control2: { x: 70, y: 10 }, end: { x: 90, y: 20 } },
      // Top right curve
      { start: { x: 90, y: 20 }, control1: { x: 105, y: 30 }, control2: { x: 105, y: 45 }, end: { x: 90, y: 55 } },
      // Middle horizontal
      { start: { x: 90, y: 55 }, control1: { x: 70, y: 60 }, control2: { x: 35, y: 60 }, end: { x: 15, y: 55 } },
      // Interior bubble effect
      { start: { x: 25, y: 25 }, control1: { x: 50, y: 20 }, control2: { x: 75, y: 30 }, end: { x: 80, y: 45 } }
    ]
  }
};

/**
 * Calculate a point along a cubic bezier curve
 */
function cubicBezierPoint(t: number, start: {x: number, y: number}, control1: {x: number, y: number}, control2: {x: number, y: number}, end: {x: number, y: number}) {
  const u = 1 - t;
  const tt = t * t;
  const uu = u * u;
  const uuu = uu * u;
  const ttt = tt * t;

  const x = uuu * start.x + 3 * uu * t * control1.x + 3 * u * tt * control2.x + ttt * end.x;
  const y = uuu * start.y + 3 * uu * t * control1.y + 3 * u * tt * control2.y + ttt * end.y;

  return { x, y };
}

/**
 * Generate points along all segments of a letter path
 */
function generatePathPoints(letterPath: typeof bubbleLetterPaths.S, totalPoints: number): {x: number, y: number}[] {
  const points: {x: number, y: number}[] = [];
  const pointsPerSegment = Math.ceil(totalPoints / letterPath.segments.length);
  
  let pointCount = 0;
  
  for (let segmentIndex = 0; segmentIndex < letterPath.segments.length && pointCount < totalPoints; segmentIndex++) {
    const segment = letterPath.segments[segmentIndex];
    const remainingPoints = totalPoints - pointCount;
    const currentSegmentPoints = Math.min(pointsPerSegment, remainingPoints);
    
    for (let i = 0; i < currentSegmentPoints; i++) {
      const t = i / Math.max(1, currentSegmentPoints - 1);
      const point = cubicBezierPoint(t, segment.start, segment.control1, segment.control2, segment.end);
      points.push(point);
      pointCount++;
    }
  }
  
  return points;
}

/**
 * Generate dynamic bubble letter shapes based on the number of days in the current month
 */
export function generateBubbleShapes(daysInMonth?: number): { [key: string]: DayRect[] } {
  const days = daysInMonth || getCurrentMonthDays();
  
  const shapes: { [key: string]: DayRect[] } = {};
  
  Object.entries(bubbleLetterPaths).forEach(([letter, letterPath]) => {
    const points = generatePathPoints(letterPath, days);
    
    shapes[letter] = points.map((point, index) => ({
      day: index + 1,
      x: Math.round(point.x - 8), // Center the rectangle on the point
      y: Math.round(point.y - 8),
      width: 16,
      height: 16
    }));
  });
  
  return shapes;
}

// Export the main shapes object that will be used by components
export const shapes = generateBubbleShapes();

// Legacy exports for backward compatibility  
export const shapeS = shapes.S;
export const shapeQ = shapes.Q;
export const shapeC = shapes.C;
export const shapeI = shapes.I;
export const shapeD = shapes.D;
export const shapeP = shapes.P;

// Rename the interface for clarity
export type Rect = DayRect;