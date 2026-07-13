"use client";

import { useState, useEffect } from "react";
import { Building2, CreditCard, Bell, Save, Loader2, Mail, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

type TabType = "property" | "bank" | "notifications";

interface PropertyData {
  id: string;
  name: string;
  address: string;
  description: string | null;
  phone: string | null;
  email: string | null;
  operationalHours: string | null;
}

interface PropertySettings {
  id: string;
  defaultCheckInTime: string;
  defaultCheckOutTime: string;
  minimumStayNights: number;
  maximumAdvanceBooking: number;
  depositPercentage: number;
  defaultDueDateDays: number;
  lateFeePercentage: number;
  whatsappOwner: string | null;
  emailOwner: string | null;
  notifyNewBooking: boolean;
  notifyPaymentReceived: boolean;
  notifyOverdue: boolean;
  notifyVacancyReport: boolean;
  reminderDays: string;
}

interface BankAccount {
  id: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
}

const tabs = [
  { id: "property" as const, label: "Informasi Properti", icon: Building2 },
  { id: "bank" as const, label: "Rekening Bank", icon: CreditCard },
  { id: "notifications" as const, label: "Aturan & Notifikasi", icon: Bell },
];

export default function SettingsPage() {
  const { success, error: showError } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>("property");

  // Property state
  const [property, setProperty] = useState<PropertyData | null>(null);
  const [propertyForm, setPropertyForm] = useState({
    name: "",
    address: "",
    description: "",
    phone: "",
    email: "",
    operationalHours: "",
  });
  const [savingProperty, setSavingProperty] = useState(false);

  // Bank state
  const [bankAccount, setBankAccount] = useState<BankAccount | null>(null);
  const [bankForm, setBankForm] = useState({
    bankName: "",
    accountName: "",
    accountNumber: "",
  });
  const [savingBank, setSavingBank] = useState(false);

  // Settings state
  const [settings, setSettings] = useState<PropertySettings | null>(null);
  const [settingsForm, setSettingsForm] = useState({
    defaultCheckInTime: "14:00",
    defaultCheckOutTime: "12:00",
    minimumStayNights: 1,
    maximumAdvanceBooking: 90,
    depositPercentage: 100,
    defaultDueDateDays: 7,
    lateFeePercentage: 2,
    whatsappOwner: "",
    emailOwner: "",
    notifyNewBooking: true,
    notifyPaymentReceived: true,
    notifyOverdue: true,
    notifyVacancyReport: true,
    reminderDays: "1,3,7",
  });
  const [savingSettings, setSavingSettings] = useState(false);

  // Test notification state
  const [testingNotification, setTestingNotification] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Load data
  useEffect(() => {
    fetchProperty();
    fetchBankAccount();
    fetchSettings();
  }, []);

  const fetchProperty = async () => {
    try {
      const res = await fetch("/api/admin/settings/property");
      if (res.ok) {
        const data = await res.json();
        if (data.property) {
          setProperty(data.property);
          setPropertyForm({
            name: data.property.name || "",
            address: data.property.address || "",
            description: data.property.description || "",
            phone: data.property.phone || "",
            email: data.property.email || "",
            operationalHours: data.property.operationalHours || "",
          });
        }
      }
    } catch (err) {
      console.error("Failed to fetch property:", err);
    }
  };

  const fetchBankAccount = async () => {
    try {
      const res = await fetch("/api/admin/settings/bank-account");
      if (res.ok) {
        const data = await res.json();
        if (data.bankAccount) {
          setBankAccount(data.bankAccount);
          setBankForm({
            bankName: data.bankAccount.bankName || "",
            accountName: data.bankAccount.accountName || "",
            accountNumber: data.bankAccount.accountNumber || "",
          });
        }
      }
    } catch (err) {
      console.error("Failed to fetch bank account:", err);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings/property-settings");
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          setSettings(data.settings);
          setSettingsForm({
            defaultCheckInTime: data.settings.defaultCheckInTime || "14:00",
            defaultCheckOutTime: data.settings.defaultCheckOutTime || "12:00",
            minimumStayNights: data.settings.minimumStayNights || 1,
            maximumAdvanceBooking: data.settings.maximumAdvanceBooking || 90,
            depositPercentage: data.settings.depositPercentage || 100,
            defaultDueDateDays: data.settings.defaultDueDateDays || 7,
            lateFeePercentage: data.settings.lateFeePercentage || 2,
            whatsappOwner: data.settings.whatsappOwner || "",
            emailOwner: data.settings.emailOwner || "",
            notifyNewBooking: data.settings.notifyNewBooking ?? true,
            notifyPaymentReceived: data.settings.notifyPaymentReceived ?? true,
            notifyOverdue: data.settings.notifyOverdue ?? true,
            notifyVacancyReport: data.settings.notifyVacancyReport ?? true,
            reminderDays: data.settings.reminderDays || "1,3,7",
          });
        }
      }
    } catch (err) {
      console.error("Failed to fetch settings:", err);
    }
  };

  // Save handlers
  const handleSaveProperty = async () => {
    if (!propertyForm.name || !propertyForm.address) {
      showError("Nama dan alamat wajib diisi");
      return;
    }

    setSavingProperty(true);
    try {
      const res = await fetch("/api/admin/settings/property", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(propertyForm),
      });

      if (res.ok) {
        success("Informasi properti berhasil disimpan");
        fetchProperty();
      } else {
        const data = await res.json();
        showError(data.error || "Gagal menyimpan");
      }
    } catch {
      showError("Terjadi kesalahan");
    } finally {
      setSavingProperty(false);
    }
  };

  const handleSaveBank = async () => {
    if (!bankForm.bankName || !bankForm.accountName || !bankForm.accountNumber) {
      showError("Semua field rekening wajib diisi");
      return;
    }

    setSavingBank(true);
    try {
      const res = await fetch("/api/admin/settings/bank-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bankForm),
      });

      if (res.ok) {
        success("Rekening bank berhasil disimpan");
        fetchBankAccount();
      } else {
        const data = await res.json();
        showError(data.error || "Gagal menyimpan");
      }
    } catch {
      showError("Terjadi kesalahan");
    } finally {
      setSavingBank(false);
    }
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      const res = await fetch("/api/admin/settings/property-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settingsForm),
      });

      if (res.ok) {
        success("Pengaturan berhasil disimpan");
        fetchSettings();
      } else {
        const data = await res.json();
        showError(data.error || "Gagal menyimpan");
      }
    } catch {
      showError("Terjadi kesalahan");
    } finally {
      setSavingSettings(false);
    }
  };

  const handleTestNotification = async (type: "email" | "wa") => {
    setTestingNotification(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/admin/settings/test-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });

      const data = await res.json();
      if (res.ok) {
        setTestResult({
          success: true,
          message: type === "email"
            ? "Email test berhasil dikirim!"
            : "WhatsApp test berhasil dikirim!",
        });
      } else {
        setTestResult({
          success: false,
          message: data.error || "Gagal mengirim test",
        });
      }
    } catch {
      setTestResult({
        success: false,
        message: "Terjadi kesalahan saat mengirim test",
      });
    } finally {
      setTestingNotification(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Pengaturan</h1>
        <p className="text-slate-500">Kelola pengaturan sistem</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "property" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-amber-500" />
              Informasi Properti
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Properti *</Label>
                <Input
                  id="name"
                  value={propertyForm.name}
                  onChange={(e) => setPropertyForm({ ...propertyForm, name: e.target.value })}
                  placeholder="Graha Maju"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telepon</Label>
                <Input
                  id="phone"
                  value={propertyForm.phone}
                  onChange={(e) => setPropertyForm({ ...propertyForm, phone: e.target.value })}
                  placeholder="021-1234567"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Alamat *</Label>
              <Input
                id="address"
                value={propertyForm.address}
                onChange={(e) => setPropertyForm({ ...propertyForm, address: e.target.value })}
                placeholder="Jl. Raya No. 123, Jakarta"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={propertyForm.email}
                  onChange={(e) => setPropertyForm({ ...propertyForm, email: e.target.value })}
                  placeholder="info@contoh.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hours">Jam Operasional</Label>
                <Input
                  id="hours"
                  value={propertyForm.operationalHours}
                  onChange={(e) => setPropertyForm({ ...propertyForm, operationalHours: e.target.value })}
                  placeholder="08:00 - 20:00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi</Label>
              <textarea
                id="description"
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                value={propertyForm.description}
                onChange={(e) => setPropertyForm({ ...propertyForm, description: e.target.value })}
                placeholder="Deskripsi singkat properti..."
              />
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button
                onClick={handleSaveProperty}
                disabled={savingProperty}
                className="bg-amber-500 hover:bg-amber-600"
              >
                {savingProperty && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                <Save className="w-4 h-4 mr-2" />
                Simpan Perubahan
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "bank" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-amber-500" />
              Rekening Bank
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-500">
              Informasi rekening akan ditampilkan di email tagihan untuk instruksi pembayaran.
            </p>

            <div className="space-y-2">
              <Label htmlFor="bankName">Nama Bank</Label>
              <Input
                id="bankName"
                value={bankForm.bankName}
                onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                placeholder="Bank Central Asia (BCA)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountName">Nama Pemegang Rekening</Label>
              <Input
                id="accountName"
                value={bankForm.accountName}
                onChange={(e) => setBankForm({ ...bankForm, accountName: e.target.value })}
                placeholder="PT Graha Maju"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountNumber">Nomor Rekening</Label>
              <Input
                id="accountNumber"
                value={bankForm.accountNumber}
                onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                placeholder="123-456-7890"
              />
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button
                onClick={handleSaveBank}
                disabled={savingBank}
                className="bg-amber-500 hover:bg-amber-600"
              >
                {savingBank && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                <Save className="w-4 h-4 mr-2" />
                Simpan Rekening
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "notifications" && (
        <div className="space-y-6">
          {/* Booking Rules */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-500" />
                Aturan Booking
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="checkIn">Jam Check-in</Label>
                  <Input
                    id="checkIn"
                    type="time"
                    value={settingsForm.defaultCheckInTime}
                    onChange={(e) => setSettingsForm({ ...settingsForm, defaultCheckInTime: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="checkOut">Jam Check-out</Label>
                  <Input
                    id="checkOut"
                    type="time"
                    value={settingsForm.defaultCheckOutTime}
                    onChange={(e) => setSettingsForm({ ...settingsForm, defaultCheckOutTime: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minStay">Minimum Malam</Label>
                  <Input
                    id="minStay"
                    type="number"
                    min="1"
                    value={settingsForm.minimumStayNights}
                    onChange={(e) => setSettingsForm({ ...settingsForm, minimumStayNights: parseInt(e.target.value) || 1 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxAdvance">Max Booking (hari)</Label>
                  <Input
                    id="maxAdvance"
                    type="number"
                    min="1"
                    value={settingsForm.maximumAdvanceBooking}
                    onChange={(e) => setSettingsForm({ ...settingsForm, maximumAdvanceBooking: parseInt(e.target.value) || 90 })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invoice Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Tagihan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deposit">Deposit (%)</Label>
                  <Input
                    id="deposit"
                    type="number"
                    min="0"
                    max="100"
                    value={settingsForm.depositPercentage}
                    onChange={(e) => setSettingsForm({ ...settingsForm, depositPercentage: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Jatuh Tempo Default (hari)</Label>
                  <Input
                    id="dueDate"
                    type="number"
                    min="1"
                    value={settingsForm.defaultDueDateDays}
                    onChange={(e) => setSettingsForm({ ...settingsForm, defaultDueDateDays: parseInt(e.target.value) || 7 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lateFee">Denda Keterlambatan (%/hari)</Label>
                  <Input
                    id="lateFee"
                    type="number"
                    min="0"
                    value={settingsForm.lateFeePercentage}
                    onChange={(e) => setSettingsForm({ ...settingsForm, lateFeePercentage: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Notifikasi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="whatsapp">Nomor WhatsApp Owner</Label>
                <Input
                  id="whatsapp"
                  value={settingsForm.whatsappOwner}
                  onChange={(e) => setSettingsForm({ ...settingsForm, whatsappOwner: e.target.value })}
                  placeholder="6281234567890"
                />
                <p className="text-xs text-slate-400">Nomor tanpa tanda + atau spasi</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="emailOwner">Email Owner</Label>
                <Input
                  id="emailOwner"
                  type="email"
                  value={settingsForm.emailOwner}
                  onChange={(e) => setSettingsForm({ ...settingsForm, emailOwner: e.target.value })}
                  placeholder="owner@contoh.com"
                />
                <p className="text-xs text-slate-400">Email untuk laporan vacancy report mingguan</p>
              </div>

              <div className="space-y-3 pt-4">
                <Label>Notifikasi</Label>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settingsForm.notifyNewBooking}
                      onChange={(e) => setSettingsForm({ ...settingsForm, notifyNewBooking: e.target.checked })}
                      className="w-5 h-5 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                    />
                    <div>
                      <p className="font-medium text-slate-900">Booking Baru</p>
                      <p className="text-sm text-slate-500">Terima notifikasi saat ada booking baru</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settingsForm.notifyPaymentReceived}
                      onChange={(e) => setSettingsForm({ ...settingsForm, notifyPaymentReceived: e.target.checked })}
                      className="w-5 h-5 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                    />
                    <div>
                      <p className="font-medium text-slate-900">Pembayaran Diterima</p>
                      <p className="text-sm text-slate-500">Terima notifikasi saat ada pembayaran masuk</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settingsForm.notifyOverdue}
                      onChange={(e) => setSettingsForm({ ...settingsForm, notifyOverdue: e.target.checked })}
                      className="w-5 h-5 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                    />
                    <div>
                      <p className="font-medium text-slate-900">Tagihan Overdue</p>
                      <p className="text-sm text-slate-500">Terima notifikasi saat ada tagihan overdue</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settingsForm.notifyVacancyReport}
                      onChange={(e) => setSettingsForm({ ...settingsForm, notifyVacancyReport: e.target.checked })}
                      className="w-5 h-5 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                    />
                    <div>
                      <p className="font-medium text-slate-900">Laporan Vacancy Report</p>
                      <p className="text-sm text-slate-500">Terima email laporan unit kosong & kontrak habis per minggu</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t">
                <Label htmlFor="reminderDays">Pengingat Jatuh Tempo (hari)</Label>
                <Input
                  id="reminderDays"
                  value={settingsForm.reminderDays}
                  onChange={(e) => setSettingsForm({ ...settingsForm, reminderDays: e.target.value })}
                  placeholder="1,3,7"
                />
                <p className="text-xs text-slate-400">Pisahkan dengan koma, contoh: 1,3,7</p>
              </div>

              {/* Test Notification */}
              <div className="pt-4 border-t">
                <Label className="mb-2 block">Test Notifikasi</Label>
                <p className="text-xs text-slate-500 mb-3">Kirim email test untuk memastikan konfigurasi sudah benar.</p>
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleTestNotification("email")}
                    disabled={testingNotification}
                    variant="outline"
                    className="flex-1"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Kirim Email Test
                  </Button>
                  <Button
                    onClick={() => handleTestNotification("wa")}
                    disabled={testingNotification}
                    variant="outline"
                    className="flex-1"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Kirim WA Test
                  </Button>
                </div>
                {testResult && (
                  <div className={`mt-3 p-3 rounded-lg text-sm ${testResult.success ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                    {testResult.message}
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-4 border-t">
                <Button
                  onClick={handleSaveSettings}
                  disabled={savingSettings}
                  className="bg-amber-500 hover:bg-amber-600"
                >
                  {savingSettings && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  <Save className="w-4 h-4 mr-2" />
                  Simpan Pengaturan
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
