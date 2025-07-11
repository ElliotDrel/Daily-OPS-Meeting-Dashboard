export interface Rect {
  day: number
  x: number
  y: number
  width: number
  height: number
}

/**
 * Letter S shape - 31 rectangles forming the letter S
 * Coordinates are relative to a 120x120 grid
 */
export const shapeS: Rect[] = [
  // Top horizontal line (days 1-7)
  { day: 1, x: 10, y: 10, width: 15, height: 15 },
  { day: 2, x: 25, y: 10, width: 15, height: 15 },
  { day: 3, x: 40, y: 10, width: 15, height: 15 },
  { day: 4, x: 55, y: 10, width: 15, height: 15 },
  { day: 5, x: 70, y: 10, width: 15, height: 15 },
  { day: 6, x: 85, y: 10, width: 15, height: 15 },
  { day: 7, x: 100, y: 10, width: 15, height: 15 },
  
  // Left side top section (days 8-10)
  { day: 8, x: 10, y: 25, width: 15, height: 15 },
  { day: 9, x: 10, y: 40, width: 15, height: 15 },
  { day: 10, x: 10, y: 55, width: 15, height: 15 },
  
  // Middle horizontal line (days 11-17)
  { day: 11, x: 25, y: 55, width: 15, height: 15 },
  { day: 12, x: 40, y: 55, width: 15, height: 15 },
  { day: 13, x: 55, y: 55, width: 15, height: 15 },
  { day: 14, x: 70, y: 55, width: 15, height: 15 },
  { day: 15, x: 85, y: 55, width: 15, height: 15 },
  { day: 16, x: 100, y: 55, width: 15, height: 15 },
  { day: 17, x: 100, y: 70, width: 15, height: 15 },
  
  // Right side bottom section (days 18-20)
  { day: 18, x: 100, y: 85, width: 15, height: 15 },
  { day: 19, x: 100, y: 100, width: 15, height: 15 },
  { day: 20, x: 85, y: 100, width: 15, height: 15 },
  
  // Bottom horizontal line (days 21-27)
  { day: 21, x: 70, y: 100, width: 15, height: 15 },
  { day: 22, x: 55, y: 100, width: 15, height: 15 },
  { day: 23, x: 40, y: 100, width: 15, height: 15 },
  { day: 24, x: 25, y: 100, width: 15, height: 15 },
  { day: 25, x: 10, y: 100, width: 15, height: 15 },
  
  // Additional cells to reach 31 (days 28-31)
  { day: 26, x: 25, y: 25, width: 15, height: 15 },
  { day: 27, x: 40, y: 25, width: 15, height: 15 },
  { day: 28, x: 70, y: 70, width: 15, height: 15 },
  { day: 29, x: 55, y: 70, width: 15, height: 15 },
  { day: 30, x: 40, y: 70, width: 15, height: 15 },
  { day: 31, x: 25, y: 70, width: 15, height: 15 }
]

/**
 * Letter Q shape - 31 rectangles forming the letter Q
 */
export const shapeQ: Rect[] = [
  // Top horizontal line (days 1-5)
  { day: 1, x: 25, y: 10, width: 15, height: 15 },
  { day: 2, x: 40, y: 10, width: 15, height: 15 },
  { day: 3, x: 55, y: 10, width: 15, height: 15 },
  { day: 4, x: 70, y: 10, width: 15, height: 15 },
  { day: 5, x: 85, y: 10, width: 15, height: 15 },
  
  // Left vertical line (days 6-11)
  { day: 6, x: 10, y: 25, width: 15, height: 15 },
  { day: 7, x: 10, y: 40, width: 15, height: 15 },
  { day: 8, x: 10, y: 55, width: 15, height: 15 },
  { day: 9, x: 10, y: 70, width: 15, height: 15 },
  { day: 10, x: 10, y: 85, width: 15, height: 15 },
  { day: 11, x: 25, y: 100, width: 15, height: 15 },
  
  // Bottom horizontal line (days 12-16)
  { day: 12, x: 40, y: 100, width: 15, height: 15 },
  { day: 13, x: 55, y: 100, width: 15, height: 15 },
  { day: 14, x: 70, y: 100, width: 15, height: 15 },
  { day: 15, x: 85, y: 100, width: 15, height: 15 },
  { day: 16, x: 100, y: 85, width: 15, height: 15 },
  
  // Right vertical line (days 17-21)
  { day: 17, x: 100, y: 70, width: 15, height: 15 },
  { day: 18, x: 100, y: 55, width: 15, height: 15 },
  { day: 19, x: 100, y: 40, width: 15, height: 15 },
  { day: 20, x: 100, y: 25, width: 15, height: 15 },
  { day: 21, x: 100, y: 10, width: 15, height: 15 },
  
  // Q tail (days 22-27)
  { day: 22, x: 55, y: 70, width: 15, height: 15 },
  { day: 23, x: 70, y: 85, width: 15, height: 15 },
  { day: 24, x: 85, y: 85, width: 15, height: 15 },
  { day: 25, x: 100, y: 100, width: 15, height: 15 },
  
  // Additional cells (days 26-31)
  { day: 26, x: 40, y: 40, width: 15, height: 15 },
  { day: 27, x: 70, y: 40, width: 15, height: 15 },
  { day: 28, x: 40, y: 70, width: 15, height: 15 },
  { day: 29, x: 70, y: 70, width: 15, height: 15 },
  { day: 30, x: 55, y: 40, width: 15, height: 15 },
  { day: 31, x: 55, y: 55, width: 15, height: 15 }
]

/**
 * Letter C shape - 31 rectangles forming the letter C
 */
export const shapeC: Rect[] = [
  // Top horizontal line (days 1-6)
  { day: 1, x: 25, y: 10, width: 15, height: 15 },
  { day: 2, x: 40, y: 10, width: 15, height: 15 },
  { day: 3, x: 55, y: 10, width: 15, height: 15 },
  { day: 4, x: 70, y: 10, width: 15, height: 15 },
  { day: 5, x: 85, y: 10, width: 15, height: 15 },
  { day: 6, x: 100, y: 10, width: 15, height: 15 },
  
  // Left vertical line (days 7-17)
  { day: 7, x: 10, y: 25, width: 15, height: 15 },
  { day: 8, x: 10, y: 40, width: 15, height: 15 },
  { day: 9, x: 10, y: 55, width: 15, height: 15 },
  { day: 10, x: 10, y: 70, width: 15, height: 15 },
  { day: 11, x: 10, y: 85, width: 15, height: 15 },
  { day: 12, x: 25, y: 100, width: 15, height: 15 },
  { day: 13, x: 40, y: 100, width: 15, height: 15 },
  { day: 14, x: 55, y: 100, width: 15, height: 15 },
  { day: 15, x: 70, y: 100, width: 15, height: 15 },
  { day: 16, x: 85, y: 100, width: 15, height: 15 },
  { day: 17, x: 100, y: 100, width: 15, height: 15 },
  
  // Right side openings (days 18-25)
  { day: 18, x: 100, y: 25, width: 15, height: 15 },
  { day: 19, x: 100, y: 85, width: 15, height: 15 },
  { day: 20, x: 85, y: 25, width: 15, height: 15 },
  { day: 21, x: 85, y: 85, width: 15, height: 15 },
  
  // Additional interior cells (days 22-31)
  { day: 22, x: 25, y: 25, width: 15, height: 15 },
  { day: 23, x: 40, y: 25, width: 15, height: 15 },
  { day: 24, x: 55, y: 25, width: 15, height: 15 },
  { day: 25, x: 70, y: 25, width: 15, height: 15 },
  { day: 26, x: 25, y: 40, width: 15, height: 15 },
  { day: 27, x: 25, y: 55, width: 15, height: 15 },
  { day: 28, x: 25, y: 70, width: 15, height: 15 },
  { day: 29, x: 25, y: 85, width: 15, height: 15 },
  { day: 30, x: 40, y: 55, width: 15, height: 15 },
  { day: 31, x: 55, y: 55, width: 15, height: 15 }
]

/**
 * Letter I shape - 31 rectangles forming the letter I
 */
export const shapeI: Rect[] = [
  // Top horizontal line (days 1-7)
  { day: 1, x: 10, y: 10, width: 15, height: 15 },
  { day: 2, x: 25, y: 10, width: 15, height: 15 },
  { day: 3, x: 40, y: 10, width: 15, height: 15 },
  { day: 4, x: 55, y: 10, width: 15, height: 15 },
  { day: 5, x: 70, y: 10, width: 15, height: 15 },
  { day: 6, x: 85, y: 10, width: 15, height: 15 },
  { day: 7, x: 100, y: 10, width: 15, height: 15 },
  
  // Vertical center line (days 8-22)
  { day: 8, x: 55, y: 25, width: 15, height: 15 },
  { day: 9, x: 55, y: 40, width: 15, height: 15 },
  { day: 10, x: 55, y: 55, width: 15, height: 15 },
  { day: 11, x: 55, y: 70, width: 15, height: 15 },
  { day: 12, x: 55, y: 85, width: 15, height: 15 },
  
  // Bottom horizontal line (days 13-19)
  { day: 13, x: 10, y: 100, width: 15, height: 15 },
  { day: 14, x: 25, y: 100, width: 15, height: 15 },
  { day: 15, x: 40, y: 100, width: 15, height: 15 },
  { day: 16, x: 55, y: 100, width: 15, height: 15 },
  { day: 17, x: 70, y: 100, width: 15, height: 15 },
  { day: 18, x: 85, y: 100, width: 15, height: 15 },
  { day: 19, x: 100, y: 100, width: 15, height: 15 },
  
  // Additional side support (days 20-31)
  { day: 20, x: 40, y: 25, width: 15, height: 15 },
  { day: 21, x: 70, y: 25, width: 15, height: 15 },
  { day: 22, x: 40, y: 40, width: 15, height: 15 },
  { day: 23, x: 70, y: 40, width: 15, height: 15 },
  { day: 24, x: 40, y: 55, width: 15, height: 15 },
  { day: 25, x: 70, y: 55, width: 15, height: 15 },
  { day: 26, x: 40, y: 70, width: 15, height: 15 },
  { day: 27, x: 70, y: 70, width: 15, height: 15 },
  { day: 28, x: 40, y: 85, width: 15, height: 15 },
  { day: 29, x: 70, y: 85, width: 15, height: 15 },
  { day: 30, x: 25, y: 55, width: 15, height: 15 },
  { day: 31, x: 85, y: 55, width: 15, height: 15 }
]

/**
 * Letter D shape - 31 rectangles forming the letter D
 */
export const shapeD: Rect[] = [
  // Left vertical line (days 1-7)
  { day: 1, x: 10, y: 10, width: 15, height: 15 },
  { day: 2, x: 10, y: 25, width: 15, height: 15 },
  { day: 3, x: 10, y: 40, width: 15, height: 15 },
  { day: 4, x: 10, y: 55, width: 15, height: 15 },
  { day: 5, x: 10, y: 70, width: 15, height: 15 },
  { day: 6, x: 10, y: 85, width: 15, height: 15 },
  { day: 7, x: 10, y: 100, width: 15, height: 15 },
  
  // Top horizontal line (days 8-12)
  { day: 8, x: 25, y: 10, width: 15, height: 15 },
  { day: 9, x: 40, y: 10, width: 15, height: 15 },
  { day: 10, x: 55, y: 10, width: 15, height: 15 },
  { day: 11, x: 70, y: 10, width: 15, height: 15 },
  { day: 12, x: 85, y: 10, width: 15, height: 15 },
  
  // Right curved line (days 13-19)
  { day: 13, x: 100, y: 25, width: 15, height: 15 },
  { day: 14, x: 100, y: 40, width: 15, height: 15 },
  { day: 15, x: 100, y: 55, width: 15, height: 15 },
  { day: 16, x: 100, y: 70, width: 15, height: 15 },
  { day: 17, x: 100, y: 85, width: 15, height: 15 },
  { day: 18, x: 85, y: 100, width: 15, height: 15 },
  { day: 19, x: 70, y: 100, width: 15, height: 15 },
  
  // Bottom horizontal line (days 20-24)
  { day: 20, x: 55, y: 100, width: 15, height: 15 },
  { day: 21, x: 40, y: 100, width: 15, height: 15 },
  { day: 22, x: 25, y: 100, width: 15, height: 15 },
  
  // Additional interior cells (days 23-31)
  { day: 23, x: 25, y: 25, width: 15, height: 15 },
  { day: 24, x: 40, y: 25, width: 15, height: 15 },
  { day: 25, x: 55, y: 25, width: 15, height: 15 },
  { day: 26, x: 70, y: 25, width: 15, height: 15 },
  { day: 27, x: 85, y: 25, width: 15, height: 15 },
  { day: 28, x: 85, y: 40, width: 15, height: 15 },
  { day: 29, x: 85, y: 55, width: 15, height: 15 },
  { day: 30, x: 85, y: 70, width: 15, height: 15 },
  { day: 31, x: 85, y: 85, width: 15, height: 15 }
]

/**
 * Letter P shape - 31 rectangles forming the letter P
 */
export const shapeP: Rect[] = [
  // Left vertical line (days 1-7)
  { day: 1, x: 10, y: 10, width: 15, height: 15 },
  { day: 2, x: 10, y: 25, width: 15, height: 15 },
  { day: 3, x: 10, y: 40, width: 15, height: 15 },
  { day: 4, x: 10, y: 55, width: 15, height: 15 },
  { day: 5, x: 10, y: 70, width: 15, height: 15 },
  { day: 6, x: 10, y: 85, width: 15, height: 15 },
  { day: 7, x: 10, y: 100, width: 15, height: 15 },
  
  // Top horizontal line (days 8-13)
  { day: 8, x: 25, y: 10, width: 15, height: 15 },
  { day: 9, x: 40, y: 10, width: 15, height: 15 },
  { day: 10, x: 55, y: 10, width: 15, height: 15 },
  { day: 11, x: 70, y: 10, width: 15, height: 15 },
  { day: 12, x: 85, y: 10, width: 15, height: 15 },
  { day: 13, x: 100, y: 10, width: 15, height: 15 },
  
  // Right side upper (days 14-16)
  { day: 14, x: 100, y: 25, width: 15, height: 15 },
  { day: 15, x: 100, y: 40, width: 15, height: 15 },
  { day: 16, x: 100, y: 55, width: 15, height: 15 },
  
  // Middle horizontal line (days 17-22)
  { day: 17, x: 85, y: 55, width: 15, height: 15 },
  { day: 18, x: 70, y: 55, width: 15, height: 15 },
  { day: 19, x: 55, y: 55, width: 15, height: 15 },
  { day: 20, x: 40, y: 55, width: 15, height: 15 },
  { day: 21, x: 25, y: 55, width: 15, height: 15 },
  
  // Additional interior cells (days 22-31)
  { day: 22, x: 25, y: 25, width: 15, height: 15 },
  { day: 23, x: 40, y: 25, width: 15, height: 15 },
  { day: 24, x: 55, y: 25, width: 15, height: 15 },
  { day: 25, x: 70, y: 25, width: 15, height: 15 },
  { day: 26, x: 85, y: 25, width: 15, height: 15 },
  { day: 27, x: 25, y: 40, width: 15, height: 15 },
  { day: 28, x: 40, y: 40, width: 15, height: 15 },
  { day: 29, x: 55, y: 40, width: 15, height: 15 },
  { day: 30, x: 70, y: 40, width: 15, height: 15 },
  { day: 31, x: 85, y: 40, width: 15, height: 15 }
]

export const shapes = {
  S: shapeS,
  Q: shapeQ,
  C: shapeC,
  I: shapeI,
  D: shapeD,
  P: shapeP
}