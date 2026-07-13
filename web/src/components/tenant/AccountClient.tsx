"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { signOut } from "next-auth/react";
import { ProfileHero } from "./profile-hero";
import { ContractCard } from "./contract-card";
import { SettingsList } from "./settings-list";

interface Tenant {
  id: string;
  name: string;
  email: string;
  phone: string;
  contractStart: Date;
  contractEnd: Date | null;
  emergencyName: string | null;
  emergencyPhone: string | null;
  isActive: boolean;
  unit: {
    id: string;
    unitNumber: string;
    name?: string | null;
    type: string;
    pricePerMonth: number | null;
    facilities: string[];
    property: {
      name: string;
      address: string;
    };
  };
}

export function AccountClient({ tenant }: { tenant: Tenant }) {
  const { success, error: showError } = useToast();
  const [showEditPhone, setShowEditPhone] = useState(false);
  const [showEditEmergency, setShowEditEmergency] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newPhone, setNewPhone] = useState(tenant.phone);
  const [newEmergencyName, setNewEmergencyName] = useState(tenant.emergencyName || "");
  const [newEmergencyPhone, setNewEmergencyPhone] = useState(tenant.emergencyPhone || "");

  const unitInfo = `${tenant.unit.name || tenant.unit.property.name} - Unit ${tenant.unit.unitNumber}`;

  const handleUpdatePhone = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tenant/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: newPhone }),
      });

      if (res.ok) {
        success("Nomor HP berhasil diperbarui");
        setShowEditPhone(false);
      } else {
        const data = await res.json();
        showError(data.error || "Gagal memperbarui nomor HP");
      }
    } catch {
      showError("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEmergency = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tenant/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emergencyName: newEmergencyName,
          emergencyPhone: newEmergencyPhone,
        }),
      });

      if (res.ok) {
        success("Data kontak darurat berhasil diperbarui");
        setShowEditEmergency(false);
      } else {
        const data = await res.json();
        showError(data.error || "Gagal memperbarui data");
      }
    } catch {
      showError("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    signOut({ callbackUrl: "/tenant/login" });
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="max-w-lg mx-auto px-4">
          <div className="flex items-center h-16">
            <Link
              href="/tenant"
              className="p-2 -ml-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <h1 className="flex-1 text-center text-lg font-bold text-slate-900">
              Akun Saya
            </h1>
            <div className="w-10" />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Profile Hero */}
        <ProfileHero
          name={tenant.name}
          unitInfo={unitInfo}
          isActive={tenant.isActive}
        />

        {/* Contract Card */}
        <ContractCard
          contractStart={new Date(tenant.contractStart)}
          contractEnd={tenant.contractEnd ? new Date(tenant.contractEnd) : null}
        />

        {/* Settings List */}
        <SettingsList
          email={tenant.email}
          phone={tenant.phone}
          emergencyContact={
            tenant.emergencyName && tenant.emergencyPhone
              ? { name: tenant.emergencyName, phone: tenant.emergencyPhone }
              : null
          }
        />

        {/* Logout Button */}
        <Button
          variant="outline"
          className="w-full text-red-600 border-red-200 hover:bg-red-50"
          onClick={() => setShowLogoutConfirm(true)}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Keluar
        </Button>
      </main>

      {/* Edit Phone Dialog */}
      <Dialog open={showEditPhone} onOpenChange={setShowEditPhone}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Nomor HP</DialogTitle>
            <DialogDescription>
              Masukkan nomor HP baru yang dapat dihubungi.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Nomor HP</Label>
              <Input
                id="phone"
                type="tel"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="08xxxxxxxxxx"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditPhone(false)}>
              Batal
            </Button>
            <Button onClick={handleUpdatePhone} disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Emergency Contact Dialog */}
      <Dialog open={showEditEmergency} onOpenChange={setShowEditEmergency}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kontak Darurat</DialogTitle>
            <DialogDescription>
              Masukkan informasi kontak darurat yang dapat dihubungi.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="emergencyName">Nama</Label>
              <Input
                id="emergencyName"
                value={newEmergencyName}
                onChange={(e) => setNewEmergencyName(e.target.value)}
                placeholder="Nama kontak darurat"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyPhone">Nomor HP</Label>
              <Input
                id="emergencyPhone"
                type="tel"
                value={newEmergencyPhone}
                onChange={(e) => setNewEmergencyPhone(e.target.value)}
                placeholder="08xxxxxxxxxx"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditEmergency(false)}>
              Batal
            </Button>
            <Button onClick={handleUpdateEmergency} disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Logout Confirmation */}
      <Dialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Keluar?</DialogTitle>
            <DialogDescription>
              Anda yakin ingin keluar dari portal tenant?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLogoutConfirm(false)}>
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Keluar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
