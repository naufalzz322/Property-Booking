import { AlertCircle, CheckCircle2, UserCheck, XCircle, Check, X, Wallet } from "lucide-react";
import { BOOKING_STATUS_LABELS } from "@/lib/filterOptions";

// Status configuration with design tokens - labels come from centralized config
const statusConfig: Record<string, {
  label: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  icon: typeof AlertCircle;
}> = {
  PENDING: {
    label: BOOKING_STATUS_LABELS.PENDING,
    bgColor: "bg-amber-100",
    textColor: "text-amber-800",
    borderColor: "border-amber-200",
    icon: AlertCircle,
  },
  CONFIRMED: {
    label: BOOKING_STATUS_LABELS.CONFIRMED,
    bgColor: "bg-blue-100",
    textColor: "text-blue-800",
    borderColor: "border-blue-200",
    icon: CheckCircle2,
  },
  WAITING_PAYMENT: {
    label: BOOKING_STATUS_LABELS.WAITING_PAYMENT,
    bgColor: "bg-orange-100",
    textColor: "text-orange-800",
    borderColor: "border-orange-200",
    icon: Wallet,
  },
  PAID: {
    label: BOOKING_STATUS_LABELS.PAID,
    bgColor: "bg-violet-100",
    textColor: "text-violet-800",
    borderColor: "border-violet-200",
    icon: CheckCircle2,
  },
  CHECKED_IN: {
    label: BOOKING_STATUS_LABELS.CHECKED_IN,
    bgColor: "bg-emerald-100",
    textColor: "text-emerald-800",
    borderColor: "border-emerald-200",
    icon: UserCheck,
  },
  CHECKOUT: {
    label: BOOKING_STATUS_LABELS.CHECKOUT,
    bgColor: "bg-slate-100",
    textColor: "text-slate-600",
    borderColor: "border-slate-300",
    icon: Check,
  },
  REJECTED: {
    label: BOOKING_STATUS_LABELS.REJECTED,
    bgColor: "bg-red-50",
    textColor: "text-red-700",
    borderColor: "border-red-200",
    icon: XCircle,
  },
  CANCELLED: {
    label: BOOKING_STATUS_LABELS.CANCELLED,
    bgColor: "bg-gray-100",
    textColor: "text-gray-500",
    borderColor: "border-gray-300",
    icon: X,
  },
};

interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md";
  showIcon?: boolean;
}

export function StatusBadge({
  status,
  size = "md",
  showIcon = true,
}: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.PENDING;
  const Icon = config.icon;

  const sizeClasses = size === "sm"
    ? "px-2 py-0.5 text-xs gap-1"
    : "px-2.5 py-1 text-xs gap-1.5";

  return (
    <span
      className={`
        inline-flex items-center rounded-full font-medium border
        ${sizeClasses}
        ${config.bgColor} ${config.textColor} ${config.borderColor}
      `}
    >
      {showIcon && <Icon className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />}
      {config.label}
    </span>
  );
}

// Compact status dot for table view
interface StatusDotProps {
  status: string;
}

export function StatusDot({ status }: StatusDotProps) {
  const config = statusConfig[status] || statusConfig.PENDING;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 ${config.textColor}`}>
      <Icon className="w-4 h-4" />
      <span className="text-sm font-medium">{config.label}</span>
    </span>
  );
}

// Status tab for filtering
interface StatusTabProps {
  status: string;
  count: number;
  isActive?: boolean;
  onClick?: () => void;
}

export function StatusTab({
  status,
  count,
  isActive = false,
  onClick,
}: StatusTabProps) {
  const config = statusConfig[status] || statusConfig.PENDING;
  const Icon = config.icon;

  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium
        transition-all duration-150
        ${isActive
          ? `${config.bgColor} ${config.textColor} border ${config.borderColor}`
          : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50"
        }
      `}
    >
      <Icon className="w-4 h-4" />
      <span>{config.label}</span>
      {count > 0 && (
        <span
          className={`
            px-1.5 py-0.5 rounded-full text-xs min-w-[20px] text-center
            ${isActive ? "bg-white/50" : "bg-slate-100 text-slate-500"}
          `}
        >
          {count}
        </span>
      )}
    </button>
  );
}
