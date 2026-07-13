"use client";

import { cn } from "@/lib/utils";

interface MiniSparklineProps {
  data: number[];
  color?: "amber" | "emerald" | "red" | "blue" | "slate";
  width?: number;
  height?: number;
  className?: string;
}

const colorMap = {
  amber: "#F59E0B",
  emerald: "#10B981",
  red: "#EF4444",
  blue: "#3B82F6",
  slate: "#64748B",
};

const bgColorMap = {
  amber: "bg-amber-500",
  emerald: "bg-emerald-500",
  red: "bg-red-500",
  blue: "bg-blue-500",
  slate: "bg-slate-500",
};

export function MiniSparkline({
  data,
  color = "amber",
  width = 80,
  height = 24,
  className,
}: MiniSparklineProps) {
  if (!data || data.length < 2) {
    return null;
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  // Calculate points for SVG path
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  });

  // Create gradient fill path
  const pathD = `M${points.join(" L")}`;
  const fillD = `${pathD} L${width},${height} L0,${height} Z`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn("overflow-visible", className)}
    >
      {/* Gradient fill */}
      <defs>
        <linearGradient id={`sparkline-gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={colorMap[color]} stopOpacity="0.3" />
          <stop offset="100%" stopColor={colorMap[color]} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Fill area */}
      <path d={fillD} fill={`url(#sparkline-gradient-${color})`} />

      {/* Line */}
      <path
        d={pathD}
        fill="none"
        stroke={colorMap[color]}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* End dot */}
      <circle
        cx={width}
        cy={Number(points[points.length - 1].split(",")[1])}
        r="3"
        fill={colorMap[color]}
        className={bgColorMap[color]}
      />
    </svg>
  );
}
