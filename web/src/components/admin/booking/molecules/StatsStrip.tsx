import { AlertCircle, CheckCircle2, Calendar, List } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatItem {
  label: string;
  value: number;
  icon: typeof AlertCircle;
  color: string;
  highlight?: boolean;
}

interface StatsStripProps {
  stats: {
    total: number;
    pending: number;
    confirmed: number;
    todayCheckIn: number;
  };
  activeFilter?: string;
  onFilterChange?: (filter: string) => void;
}

const statConfig: Record<string, Omit<StatItem, "value">> = {
  ALL: {
    label: "Total",
    icon: List,
    color: "text-slate-600",
  },
  PENDING: {
    label: "Menunggu",
    icon: AlertCircle,
    color: "text-amber-600",
    highlight: true,
  },
  CONFIRMED: {
    label: "Dikonfirmasi",
    icon: CheckCircle2,
    color: "text-blue-600",
  },
  TODAY: {
    label: "Check-in Hari Ini",
    icon: Calendar,
    color: "text-emerald-600",
  },
};

export function StatsStrip({ stats, activeFilter, onFilterChange }: StatsStripProps) {
  const items: { key: string; stat: StatItem }[] = [
    { key: "ALL", stat: { ...statConfig.ALL, value: stats.total } },
    { key: "PENDING", stat: { ...statConfig.PENDING, value: stats.pending } },
    { key: "CONFIRMED", stat: { ...statConfig.CONFIRMED, value: stats.confirmed } },
    { key: "TODAY", stat: { ...statConfig.TODAY, value: stats.todayCheckIn } },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {items.map(({ key, stat }) => {
        const Icon = stat.icon;
        const isActive = activeFilter === key;
        const isHighlight = stat.highlight && stat.value > 0;

        return (
          <button
            key={key}
            onClick={() => onFilterChange?.(key)}
            className={cn(
              `
              inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
              transition-all duration-150 border
              `,
              isActive
                ? isHighlight
                  ? "bg-amber-50 border-amber-300 text-amber-700 shadow-sm"
                  : "bg-slate-100 border-slate-300 text-slate-900"
                : isHighlight
                  ? "bg-amber-50 border-amber-200 text-amber-600 hover:border-amber-300"
                  : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
            )}
          >
            <Icon className="w-4 h-4" />
            <span className="font-semibold">{stat.value}</span>
            <span className="hidden sm:inline">{stat.label}</span>
            {isHighlight && stat.value > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            )}
          </button>
        );
      })}
    </div>
  );
}
