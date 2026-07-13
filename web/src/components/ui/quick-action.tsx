import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import Link from "next/link";
import { HTMLAttributes } from "react";

interface QuickActionProps extends HTMLAttributes<HTMLDivElement> {
  icon: LucideIcon;
  label: string;
  badge?: string | number;
  badgeVariant?: "warning" | "danger" | "success" | "info";
  href?: string;
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
}

const badgeVariants = {
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-red-100 text-red-700",
  success: "bg-emerald-100 text-emerald-700",
  info: "bg-blue-100 text-blue-700",
};

const sizeStyles = {
  sm: {
    container: "p-3",
    icon: "w-8 h-8",
    iconClass: "w-4 h-4",
    label: "text-xs",
  },
  md: {
    container: "p-4",
    icon: "w-12 h-12",
    iconClass: "w-5 h-5",
    label: "text-sm",
  },
  lg: {
    container: "p-5",
    icon: "w-14 h-14",
    iconClass: "w-6 h-6",
    label: "text-base",
  },
};

export function QuickAction({
  icon: Icon,
  label,
  badge,
  badgeVariant = "warning",
  href,
  onClick,
  size = "md",
  className,
  ...props
}: QuickActionProps) {
  const sizeStyle = sizeStyles[size];

  const content = (
    <div
      className={cn(
        "flex flex-col items-center gap-2 rounded-2xl bg-white border border-slate-200",
        "hover:shadow-md hover:border-amber-300 transition-all duration-200",
        "active:scale-[0.98] cursor-pointer select-none",
        sizeStyle.container,
        className
      )}
      onClick={onClick}
      {...props}
    >
      <div className="relative">
        <div
          className={cn(
            "rounded-xl flex items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100",
            sizeStyle.icon
          )}
        >
          <Icon className={cn("text-amber-600", sizeStyle.iconClass)} />
        </div>
        {badge !== undefined && (
          <span
            className={cn(
              "absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full text-[10px] font-bold",
              "flex items-center justify-center px-1",
              badgeVariants[badgeVariant]
            )}
          >
            {typeof badge === 'number' && badge > 99 ? "99+" : badge}
          </span>
        )}
      </div>
      <span className={cn("font-medium text-slate-700 text-center", sizeStyle.label)}>
        {label}
      </span>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
