"use client";

import { AvatarInitials } from "@/components/ui/avatar-initials";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";

interface ProfileHeroProps {
  name: string;
  unitInfo: string;
  isActive: boolean;
}

export function ProfileHero({ name, unitInfo, isActive }: ProfileHeroProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center">
      <AvatarInitials name={name} size="xl" className="mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-slate-900">{name}</h2>
      <p className="text-slate-500 mt-1">{unitInfo}</p>
      {isActive && (
        <Badge className="mt-3 bg-emerald-100 text-emerald-700 border-emerald-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          Aktif
        </Badge>
      )}
    </div>
  );
}
