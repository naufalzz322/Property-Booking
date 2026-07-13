"use client";

import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface OccupancyData {
  total: number;
  occupied: number;
  booked: number;
  available: number;
  maintenance: number;
  rate: number;
}

const COLORS = {
  occupied: "#3b82f6",
  booked: "#f59e0b",
  available: "#22c55e",
  maintenance: "#a855f7",
};

const LABELS: Record<string, string> = {
  occupied: "Terisi",
  booked: "Dipesan",
  available: "Kosong",
  maintenance: "Maintenance",
};

interface OccupancyChartProps {
  className?: string;
}

export function OccupancyChart({ className }: OccupancyChartProps) {
  const [data, setData] = useState<OccupancyData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/admin/analytics?period=6");
      if (res.ok) {
        const result = await res.json();
        setData(result.occupancy);
      }
    } catch (error) {
      console.error("Failed to fetch occupancy data:", error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = data
    ? [
        { name: "Terisi", value: data.occupied, color: COLORS.occupied },
        { name: "Dipesan", value: data.booked, color: COLORS.booked },
        { name: "Kosong", value: data.available, color: COLORS.available },
        { name: "Maintenance", value: data.maintenance, color: COLORS.maintenance },
      ].filter((d) => d.value > 0)
    : [];

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Okupansi</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Okupansi Unit</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Main Stats */}
        <div className="text-center mb-4">
          <div className="text-4xl font-bold text-slate-900">{data?.rate || 0}%</div>
          <p className="text-sm text-slate-500">Tingkat Okupansi</p>
        </div>

        {/* Pie Chart */}
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: any, name: any) => [`${value} unit`, LABELS[name] || name]}
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          {[
            { key: "occupied", label: "Terisi", color: COLORS.occupied },
            { key: "booked", label: "Dipesan", color: COLORS.booked },
            { key: "available", label: "Kosong", color: COLORS.available },
            { key: "maintenance", label: "Maintenance", color: COLORS.maintenance },
          ].map((item) => (
            <div key={item.key} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-slate-600">{item.label}</span>
              <span className="text-sm font-medium text-slate-900 ml-auto">
                {data?.[item.key as keyof OccupancyData] || 0}
              </span>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="mt-4 pt-4 border-t text-center">
          <p className="text-sm text-slate-500">
            Total <span className="font-semibold text-slate-900">{data?.total || 0}</span> unit
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
