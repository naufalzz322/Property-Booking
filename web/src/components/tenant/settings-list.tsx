"use client";

import Link from "next/link";
import { Phone, Mail, Shield, ChevronRight, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SettingsListProps {
  email: string;
  phone: string;
  emergencyContact?: {
    name: string;
    phone: string;
  } | null;
  ownerPhone?: string;
}

export function SettingsList({
  email,
  phone,
  emergencyContact,
  ownerPhone,
}: SettingsListProps) {
  const items = [
    {
      icon: Mail,
      label: "Email",
      value: email,
      href: undefined,
      action: undefined,
    },
    {
      icon: Phone,
      label: "No. HP",
      value: phone,
      href: undefined,
      action: { label: "Edit", onClick: undefined },
    },
    {
      icon: Shield,
      label: "Kontak Darurat",
      value: emergencyContact
        ? `${emergencyContact.name} - ${emergencyContact.phone}`
        : "Belum diisi",
      href: undefined,
      action: emergencyContact
        ? { label: "Edit", onClick: undefined }
        : { label: "Tambah", onClick: undefined },
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100">
        <h3 className="font-semibold text-slate-900">Informasi Akun</h3>
      </div>
      <div className="divide-y divide-slate-100">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between px-5 py-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
                <item.icon className="w-5 h-5 text-slate-500" />
              </div>
              <div>
                <p className="text-sm text-slate-500">{item.label}</p>
                <p className="font-medium text-slate-900">{item.value}</p>
              </div>
            </div>
            {item.action && (
              <button className="text-sm text-amber-600 hover:text-amber-700 font-medium">
                {item.action.label}
              </button>
            )}
          </div>
        ))}

        {/* Contact Owner */}
        {ownerPhone && (
          <div className="px-5 py-4">
            <a
              href={`https://wa.me/${ownerPhone.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between hover:bg-slate-50 -mx-5 px-5 py-3 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Hubungi Owner</p>
                  <p className="font-medium text-emerald-600">WhatsApp</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
