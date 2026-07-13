import { cn } from "@/lib/utils";
import { LucideIcon, AlertTriangle, AlertCircle, CheckCircle, Info, X } from "lucide-react";
import { HTMLAttributes } from "react";

type AlertType = "info" | "warning" | "danger" | "success";

interface AlertBannerProps extends HTMLAttributes<HTMLDivElement> {
  type: AlertType;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  onDismiss?: () => void;
}

const alertConfig: Record<
  AlertType,
  { bg: string; border: string; icon: LucideIcon; iconColor: string; textColor: string }
> = {
  danger: {
    bg: "bg-red-50",
    border: "border-red-200",
    icon: AlertTriangle,
    iconColor: "text-red-600",
    textColor: "text-red-800",
  },
  warning: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    icon: AlertCircle,
    iconColor: "text-amber-600",
    textColor: "text-amber-800",
  },
  success: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    icon: CheckCircle,
    iconColor: "text-emerald-600",
    textColor: "text-emerald-800",
  },
  info: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: Info,
    iconColor: "text-blue-600",
    textColor: "text-blue-800",
  },
};

export function AlertBanner({
  type,
  title,
  description,
  action,
  onDismiss,
  className,
  ...props
}: AlertBannerProps) {
  const config = alertConfig[type];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "rounded-xl border p-4",
        config.bg,
        config.border,
        className
      )}
      {...props}
    >
      <div className="flex items-start gap-3">
        <Icon className={cn("w-5 h-5 flex-shrink-0 mt-0.5", config.iconColor)} />
        <div className="flex-1 min-w-0">
          <p className={cn("font-semibold", config.textColor)}>{title}</p>
          {description && (
            <p className={cn("text-sm mt-1 opacity-80", config.textColor)}>
              {description}
            </p>
          )}
          {action && (
            <button
              onClick={action.onClick}
              className={cn(
                "mt-2 text-sm font-medium underline hover:no-underline",
                config.textColor
              )}
            >
              {action.label}
            </button>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className={cn("flex-shrink-0 p-1 rounded hover:bg-black/5 transition-colors", config.textColor)}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
