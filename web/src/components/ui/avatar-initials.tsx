import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface AvatarInitialsProps extends HTMLAttributes<HTMLDivElement> {
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizes = {
  sm: "w-8 h-8 text-sm",
  md: "w-12 h-12 text-lg",
  lg: "w-16 h-16 text-2xl",
  xl: "w-24 h-24 text-4xl",
};

const colors = [
  "bg-amber-100 text-amber-700",
  "bg-blue-100 text-blue-700",
  "bg-emerald-100 text-emerald-700",
  "bg-purple-100 text-purple-700",
  "bg-rose-100 text-rose-700",
  "bg-cyan-100 text-cyan-700",
  "bg-indigo-100 text-indigo-700",
  "bg-teal-100 text-teal-700",
];

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getColor(name: string): string {
  const index = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  return colors[index];
}

export function AvatarInitials({
  name,
  size = "md",
  className,
  ...props
}: AvatarInitialsProps) {
  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-bold",
        sizes[size],
        getColor(name),
        className
      )}
      {...props}
    >
      {getInitials(name)}
    </div>
  );
}
