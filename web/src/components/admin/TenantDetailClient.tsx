"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format, differenceInDays, addMonths, addDays } from "date-fns";
import { id } from "date-fns/locale";
import {
  ArrowLeft,
  MessageCircle,
  Mail,
  Key,
  LogOut,
  Building2,
  Calendar,
  CreditCard,
  Phone,
  User,
  Edit2,
  CheckCircle,
  Clock,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm-dialog-context";
import { cn } from "@/lib/utils";
import { SegmentedControl } from "@/components/admin/ui/SegmentedControl";

interface TenantDetail {
  id: string;
  name: string;
  email: string;
  phone: string;
  contractStart: Date;
  contractEnd: Date | null;
  isActive: boolean;
  emergencyName: string | null;
  emergencyPhone: string | null;
  createdAt: Date;
  unit: {
    id: string;
    unitNumber: string;
    slug: string;
    name?: string | null;
    pricePerMonth: number | null;
    pricePerNight: number | null;
    type: string;
    property: { name: string };
  };
  booking: {
    id: string;
    bookingNumber: string;
    status: string;
  };
  invoices: {
    id: string;
    invoiceNumber: string;
    period: string;
    totalAmount: number;
    status: string;
    dueDate: Date;
    paidAt: Date | null;
  }[];
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

const invoiceStatusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  UNPAID: { label: "Pending", color: "text-amber-800", bgColor: "bg-amber-100" },
  PAID: { label: "Lunas", color: "text-emerald-800", bgColor: "bg-emerald-100" },
  OVERDUE: { label: "Overdue", color: "text-red-800", bgColor: "bg-red-100" },
};

export function TenantDetailClient({ tenant }: { tenant: TenantDetail }) {
  const router = useRouter();
  const { success, error: showError } = useToast();
  const [activeTab, setActiveTab] = useState<"overview" | "invoices" | "edit">("overview");
  const [loading, setLoading] = useState(false);
  const [editData, setEditData] = useState({
    name: tenant.name,
    email: tenant.email,
    phone: tenant.phone,
    emergencyName: tenant.emergencyName || "",
    emergencyPhone: tenant.emergencyPhone || "",
  });
  const { confirm } = useConfirm();

  // Calculate contract progress
  const contractStart = new Date(tenant.contractStart);
  const contractEnd = tenant.contractEnd ? new Date(tenant.contractEnd) : null;
  const today = new Date();
  let progress = 100;
  let daysRemaining: number | null = null;

  if (contractEnd) {
    const totalDays = differenceInDays(contractEnd, contractStart);
    const elapsedDays = differenceInDays(today, contractStart);
    progress = Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100));
    daysRemaining = differenceInDays(contractEnd, today);
  }

  // Invoice stats
  const paidInvoices = tenant.invoices.filter((inv) => inv.status === "PAID").length;
  const pendingInvoices = tenant.invoices.filter((inv) => inv.status === "UNPAID").length;
  const overdueInvoices = tenant.invoices.filter((inv) => inv.status === "OVERDUE").length;

  const handleResetPassword = async () => {
    const confirmed = await confirm({
      title: "Reset Password?",
      description: `Password tenant ${tenant.name} akan direset dan password baru akan dikirim via email.`,
      icon: "warning",
      confirmText: "Ya, Reset",
      onConfirm: async () => {
        setLoading(true);
        try {
          const res = await fetch(`/api/admin/tenants/${tenant.id}/reset-password`, {
            method: "POST",
          });

          if (res.ok) {
            success("Password berhasil direset. Email baru dikirim ke tenant.");
          } else {
            const data = await res.json();
            showError(data.error || "Gagal reset password");
          }
        } catch {
          showError("Terjadi kesalahan");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleCheckout = async () => {
    const confirmed = await confirm({
      title: "Check-out Tenant?",
      description: `${tenant.name} akan dinonaktifkan. Tindakan ini tidak dapat dibatalkan.`,
      icon: "danger",
      confirmText: "Ya, Check-out",
      destructive: true,
      onConfirm: async () => {
        setLoading(true);
        try {
          const res = await fetch(`/api/admin/tenants/${tenant.id}/checkout`, {
            method: "POST",
          });

          if (res.ok) {
            success("Tenant berhasil di-checkout");
            router.refresh();
          } else {
            const data = await res.json();
            showError(data.error || "Gagal checkout");
          }
        } catch {
          showError("Terjadi kesalahan");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleSaveEdit = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/tenants/${tenant.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editData.name,
          phone: editData.phone,
          emergencyName: editData.emergencyName || null,
          emergencyPhone: editData.emergencyPhone || null,
        }),
      });

      if (res.ok) {
        success("Data tenant berhasil disimpan");
        router.refresh();
        setActiveTab("overview");
      } else {
        const data = await res.json();
        showError(data.error || "Gagal menyimpan");
      }
    } catch {
      showError("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { value: "overview", label: "Overview" },
    { value: "invoices", label: `Tagihan (${tenant.invoices.length})` },
    { value: "edit", label: "Edit" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/tenant" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center text-lg font-bold">
              {tenant.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{tenant.name}</h1>
              <p className="text-slate-500">
                {tenant.unit.name || tenant.unit.property.name} - Unit {tenant.unit.unitNumber}
              </p>
            </div>
          </div>
        </div>
        <Badge className={cn(
          "text-sm px-3 py-1",
          tenant.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
        )}>
          {tenant.isActive ? "Aktif" : "Nonaktif"}
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Contract Card */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Calendar className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Kontrak</p>
                {contractEnd ? (
                  <p className="font-semibold text-slate-900">
                    {daysRemaining !== null && daysRemaining > 0
                      ? `${daysRemaining} hari lagi`
                      : daysRemaining !== null && daysRemaining < 0
                      ? `${Math.abs(daysRemaining)} hari lalu`
                      : "Berakhir"}
                  </p>
                ) : (
                  <p className="font-semibold text-slate-400">Tanpa batas</p>
                )}
              </div>
            </div>
            {contractEnd && (
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    progress >= 90 ? "bg-red-500" : progress >= 75 ? "bg-amber-500" : "bg-emerald-500"
                  )}
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
            <div className="flex justify-between mt-2 text-xs text-slate-400">
              <span>{format(contractStart, "dd MMM yyyy", { locale: id })}</span>
              <span>{contractEnd ? format(contractEnd, "dd MMM yyyy", { locale: id }) : "∞"}</span>
            </div>
          </CardContent>
        </Card>

        {/* Invoices Card */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <CreditCard className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-500">Tagihan</p>
                <div className="flex gap-3 mt-1">
                  <span className="text-sm">
                    <span className="font-semibold text-emerald-600">{paidInvoices}</span> lunas
                  </span>
                  <span className="text-sm">
                    <span className="font-semibold text-amber-600">{pendingInvoices}</span> pending
                  </span>
                  {overdueInvoices > 0 && (
                    <span className="text-sm">
                      <span className="font-semibold text-red-600">{overdueInvoices}</span> overdue
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Card */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Phone className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Kontak</p>
                <p className="font-semibold text-slate-900">{tenant.phone}</p>
                <p className="text-sm text-slate-500">{tenant.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="border-b border-slate-200 px-4">
          <SegmentedControl
            options={tabs}
            value={activeTab}
            onChange={(tab) => setActiveTab(tab as typeof activeTab)}
          />
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Unit Info */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Info Unit</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <p className="text-sm text-slate-500 mb-1">Properti</p>
                    <p className="font-medium text-slate-900">{tenant.unit.name || tenant.unit.property.name}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <p className="text-sm text-slate-500 mb-1">Unit</p>
                    <p className="font-medium text-slate-900">Unit {tenant.unit.unitNumber}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <p className="text-sm text-slate-500 mb-1">Tipe</p>
                    <p className="font-medium text-slate-900">{tenant.unit.type.replace(/_/g, " ")}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <p className="text-sm text-slate-500 mb-1">Harga</p>
                    <p className="font-medium text-slate-900">
                      {tenant.unit.pricePerMonth
                        ? formatCurrency(tenant.unit.pricePerMonth) + "/bulan"
                        : tenant.unit.pricePerNight
                        ? formatCurrency(tenant.unit.pricePerNight) + "/malam"
                        : "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Booking Info */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Info Booking</h3>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <Link
                    href={`/admin/booking/${tenant.booking.id}`}
                    className="flex items-center justify-between hover:bg-slate-100 p-2 -m-2 rounded-lg transition-colors"
                  >
                    <div>
                      <p className="font-medium text-slate-900">{tenant.booking.bookingNumber}</p>
                      <p className="text-sm text-slate-500">Lihat detail booking</p>
                    </div>
                    <span className="text-amber-600">→</span>
                  </Link>
                </div>
              </div>

              {/* Emergency Contact */}
              {tenant.emergencyName && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Kontak Darurat</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <p className="text-sm text-slate-500 mb-1">Nama</p>
                      <p className="font-medium text-slate-900">{tenant.emergencyName}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <p className="text-sm text-slate-500 mb-1">No. HP</p>
                      <p className="font-medium text-slate-900">{tenant.emergencyPhone}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Invoices Tab */}
          {activeTab === "invoices" && (
            <div className="space-y-4">
              {tenant.invoices.length > 0 ? (
                tenant.invoices.map((invoice) => {
                  const status = invoiceStatusConfig[invoice.status] || invoiceStatusConfig.UNPAID;
                  return (
                    <Link
                      key={invoice.id}
                      href={`/admin/invoice/${invoice.id}`}
                      className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center",
                          invoice.status === "PAID"
                            ? "bg-emerald-100"
                            : invoice.status === "OVERDUE"
                            ? "bg-red-100"
                            : "bg-amber-100"
                        )}>
                          {invoice.status === "PAID" ? (
                            <CheckCircle className="w-5 h-5 text-emerald-600" />
                          ) : invoice.status === "OVERDUE" ? (
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                          ) : (
                            <Clock className="w-5 h-5 text-amber-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{invoice.invoiceNumber}</p>
                          <p className="text-sm text-slate-500">
                            {invoice.period} • Jatuh tempo {format(new Date(invoice.dueDate), "dd MMM", { locale: id })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-slate-900">{formatCurrency(invoice.totalAmount)}</p>
                        <Badge className={cn("text-xs", status.bgColor, status.color)}>
                          {status.label}
                        </Badge>
                      </div>
                    </Link>
                  );
                })
              ) : (
                <div className="text-center py-12">
                  <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">Belum ada tagihan</p>
                </div>
              )}
            </div>
          )}

          {/* Edit Tab */}
          {activeTab === "edit" && (
            <div className="max-w-lg space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Lengkap</Label>
                  <Input
                    id="name"
                    value={editData.name}
                    onChange={(e) => setEditData((prev) => ({ ...prev, name: e.target.value }))}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">No. HP</Label>
                  <Input
                    id="phone"
                    value={editData.phone}
                    onChange={(e) => setEditData((prev) => ({ ...prev, phone: e.target.value }))}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={editData.email}
                    disabled
                    className="h-11 bg-slate-50"
                  />
                  <p className="text-xs text-slate-400">Email tidak dapat diubah</p>
                </div>
              </div>

              <div className="border-t pt-6">
                <h4 className="font-medium text-slate-900 mb-4">Kontak Darurat</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="emergencyName">Nama</Label>
                    <Input
                      id="emergencyName"
                      value={editData.emergencyName}
                      onChange={(e) => setEditData((prev) => ({ ...prev, emergencyName: e.target.value }))}
                      placeholder="Nama kontak darurat"
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergencyPhone">No. HP</Label>
                    <Input
                      id="emergencyPhone"
                      value={editData.emergencyPhone}
                      onChange={(e) => setEditData((prev) => ({ ...prev, emergencyPhone: e.target.value }))}
                      placeholder="08xxxxxxxxxx"
                      className="h-11"
                    />
                  </div>
                </div>
              </div>

              <Button
                onClick={handleSaveEdit}
                disabled={loading}
                className="w-full bg-amber-500 hover:bg-amber-600"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Simpan Perubahan
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <a
          href={`https://wa.me/${tenant.phone.replace(/\D/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          Hubungi WA
        </a>

        <a
          href={`mailto:${tenant.email}`}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors"
        >
          <Mail className="w-5 h-5" />
          Kirim Email
        </a>

        <Button
          variant="outline"
          onClick={handleResetPassword}
          disabled={loading}
          className="flex items-center justify-center gap-2"
        >
          <Key className="w-5 h-5" />
          Reset Password
        </Button>

        {tenant.isActive && (
          <Button
            variant="outline"
            onClick={handleCheckout}
            disabled={loading}
            className="flex items-center justify-center gap-2 border-red-500 text-red-600 hover:bg-red-50"
          >
            <LogOut className="w-5 h-5" />
            Check-out
          </Button>
        )}
      </div>
    </div>
  );
}
