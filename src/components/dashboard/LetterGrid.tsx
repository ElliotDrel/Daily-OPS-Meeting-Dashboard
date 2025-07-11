import React, { useState } from "react";
import { motion } from "framer-motion";
import { Rect, shapes } from "@/data/letterShapes";
import { statusColors, statusHoverColors, Status } from "@/data/colorMap";
interface GridSquare {
  status: 'good' | 'caution' | 'issue' | 'future';
  date: string;
  value: number;
  label?: string;
}
interface LetterGridProps {
  letter: 'S' | 'Q' | 'C' | 'I' | 'D' | 'P';
  squares: GridSquare[];
  pillarColor: string;
  onClick?: () => void;
  onCellClick?: (day: number) => void;
}
const pillarNames = {
  S: 'Safety',
  Q: 'Quality',
  C: 'Cost',
  I: 'Inventory',
  D: 'Delivery',
  P: 'Production'
};
export const LetterGrid: React.FC<LetterGridProps> = ({
  letter,
  squares,
  pillarColor,
  onClick,
  onCellClick
}) => {
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  const rects = shapes[letter];
  const statusByDay: Record<number, Status> = {};

  // Map squares data to day status
  squares.forEach((square, index) => {
    if (index < 31) {
      statusByDay[index + 1] = square.status;
    }
  });
  const size = 140; // SVG container size

  return <motion.div className={`bg-gradient-to-br from-${pillarColor} to-${pillarColor}-secondary rounded-xl p-6 shadow-xl border cursor-pointer group hover:shadow-2xl transition-all duration-300`} onClick={onClick} whileHover={{
    scale: 1.02,
    y: -4
  }} whileTap={{
    scale: 0.98
  }} initial={{
    opacity: 0,
    y: 20
  }} animate={{
    opacity: 1,
    y: 0
  }} transition={{
    duration: 0.3
  }}>
      <div className="text-center mb-4">
        <h3 className="text-2xl font-bold mb-1 text-blue-500">
          {pillarNames[letter]}
        </h3>
        <div className="flex justify-center">
          <svg width={size} height={size} viewBox="0 0 120 120" role="img" aria-label={`${pillarNames[letter]} monthly performance grid`} className="border border-white/20 rounded-lg bg-white/10">
            {rects.map(rect => {
            const status = statusByDay[rect.day] || 'future';
            const isHovered = hoveredDay === rect.day;
            const fillColor = isHovered ? statusHoverColors[status] : statusColors[status];
            return <g key={rect.day}>
                  <rect x={rect.x} y={rect.y} width={rect.width} height={rect.height} fill={fillColor} stroke="rgba(255,255,255,0.3)" strokeWidth={0.5} tabIndex={0} aria-label={`${pillarNames[letter]} day ${rect.day} ${status}`} className="cursor-pointer transition-all duration-200" onMouseEnter={() => setHoveredDay(rect.day)} onMouseLeave={() => setHoveredDay(null)} onClick={e => {
                e.stopPropagation();
                onCellClick?.(rect.day);
              }} onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  e.stopPropagation();
                  onCellClick?.(rect.day);
                }
              }} />
                  <text x={rect.x + rect.width / 2} y={rect.y + rect.height / 2} textAnchor="middle" dominantBaseline="central" fontSize={8} fill="white" fontWeight="600" className="pointer-events-none select-none">
                    {rect.day}
                  </text>
                </g>;
          })}
          </svg>
        </div>
      </div>
    </motion.div>;
};