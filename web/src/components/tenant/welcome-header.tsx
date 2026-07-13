"use client";

import { AvatarInitials } from "@/components/ui/avatar-initials";
import { NotificationPanel } from "./notification-panel";

interface WelcomeHeaderProps {
  name: string;
  unitInfo: string;
}

export function WelcomeHeader({ name, unitInfo }: WelcomeHeaderProps) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Selamat Pagi";
    if (hour < 18) return "Selamat Siang";
    return "Selamat Malam";
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <AvatarInitials name={name} size="lg" />
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {getGreeting()}, {name.split(" ")[0]}
          </h1>
          <p className="text-sm text-slate-500">{unitInfo}</p>
        </div>
      </div>
      <NotificationPanel />
    </div>
  );
}
