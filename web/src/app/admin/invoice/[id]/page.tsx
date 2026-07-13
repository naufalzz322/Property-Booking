"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Eye,
  Clock,
  DollarSign,
  UserCircle,
  Home,
  Receipt,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm-dialog-context";
import { cn } from "@/lib/utils";

interface InvoiceDetail {
  id: string;
  invoiceNumber: string;
  period: string;
  rentAmount: number;
  electricAmount: number;
  waterAmount: number;
  otherAmount: number;
  totalAmount: number;
  dueDate: string;
  status: string;
  paidAt: string | null;
  paymentMethod: string | null;
  paymentProofUrl: string | null;
  notes: string | null;
  createdAt: string;
  unit: {
    id: string;
    unitNumber: string;
    pricePerMonth: number | null;
    property: {
      id: string;
      name: string;
    };
  };
  tenant: {
    id: string;
    name: string;
    email: string;
    phone: string;
    contractStart: string;
    contractEnd: string | null;
  };
}

// Status config - WCAG AA compliant (4.5:1 contrast)
const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  UNPAID: { label: "Belum Bayar", color: "text-amber-800", bgColor: "bg-amber-100" }, // Fixed: was amber-700
  PAID: { label: "Lunas", color: "text-emerald-800", bgColor: "bg-emerald-100" }, // Fixed: was green-700
  OVERDUE: { label: "Overdue", color: "text-red-800", bgColor: "bg-red-100" }, // Fixed: was red-700
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatPeriod(period: string): string {
  const [year, month] = period.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return format(date, "MMMM yyyy", { locale: id });
}

export default function AdminInvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { success, error: showError } = useToast();
  const invoiceId = params.id as string;

  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const { confirm } = useConfirm();

  useEffect(() => {
    fetchInvoice();
  }, [invoiceId]);

  const fetchInvoice = async () => {
    try {
      const res = await fetch(`/api/admin/invoices/${invoiceId}`);
      if (res.ok) {
        const data = await res.json();
        setInvoice(data.invoice);
      } else {
        showError("Gagal memuat tagihan");
        router.push("/admin/invoice");
      }
    } catch {
      showError("Terjadi kesalahan");
      router.push("/admin/invoice");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!invoice) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/invoices/${invoiceId}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (res.ok) {
        success("Pembayaran berhasil dikonfirmasi!");
        fetchInvoice();
      } else {
        const data = await res.json();
        showError(data.error || "Gagal mengkonfirmasi pembayaran");
      }
    } catch {
      showError("Terjadi kesalahan saat mengkonfirmasi");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectPayment = async () => {
    if (!invoice) return;

    const confirmed = await confirm({
      title: "Tolak Pembayaran?",
      description: `Pembayaran dari ${invoice.tenant.name} akan ditolak.`,
      icon: "danger",
      confirmText: "Ya, Tolak",
      destructive: true,
      requireReason: true,
      reasonPlaceholder: "Masukkan alasan penolakan...",
      reasonDefaultValue: "Bukti pembayaran tidak sesuai atau tidak jelas. Mohon upload ulang dengan bukti yang jelas.",
      onConfirm: async (reason) => {
        setActionLoading(true);
        try {
          const res = await fetch(`/api/admin/invoices/${invoiceId}/reject`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reason }),
          });

          if (res.ok) {
            success("Pembayaran ditolak");
            fetchInvoice();
          } else {
            const data = await res.json();
            showError(data.error || "Gagal menolak pembayaran");
          }
        } catch {
          showError("Terjadi kesalahan saat menolak");
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!invoice) {
    return null;
  }

  const status = statusConfig[invoice.status] || statusConfig.UNPAID;
  const hasPaymentProof = invoice.status === "PAID" || invoice.paymentProofUrl;
  const canConfirm = invoice.paymentProofUrl && (invoice.status === "UNPAID" || invoice.status === "OVERDUE");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/invoice"
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">
            Detail Tagihan - {invoice.invoiceNumber}
          </h1>
          <p className="text-slate-500">{formatPeriod(invoice.period)}</p>
        </div>
        <Badge className={cn("text-sm px-3 py-1", status.bgColor, status.color)}>
          {status.label}
        </Badge>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Invoice Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="w-5 h-5" />
                Rincian Tagihan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-slate-500">Sewa</span>
                  <span className="font-medium">{formatCurrency(invoice.rentAmount)}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-slate-500">Listrik</span>
                  <span className="font-medium">{formatCurrency(invoice.electricAmount)}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-slate-500">Air</span>
                  <span className="font-medium">{formatCurrency(invoice.waterAmount)}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-slate-500">Lainnya</span>
                  <span className="font-medium">{formatCurrency(invoice.otherAmount)}</span>
                </div>
              </div>
              <div className="flex justify-between pt-4 border-t-2">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-xl font-bold text-amber-800">
                  {formatCurrency(invoice.totalAmount)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Tenant Info - Only show full info if payment confirmed */}
          {invoice.status === "PAID" || invoice.status === "CHECKED_IN" ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCircle className="w-5 h-5" />
                  Info Tenant
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-500">Nama</p>
                    <p className="font-medium">{invoice.tenant.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Email</p>
                    <p className="font-medium">{invoice.tenant.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">No. HP</p>
                    <p className="font-medium">{invoice.tenant.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Kontrak</p>
                    <p className="font-medium">
                      {format(new Date(invoice.tenant.contractStart), "dd MMM yyyy", { locale: id })}
                      {" - "}
                      {invoice.tenant.contractEnd
                        ? format(new Date(invoice.tenant.contractEnd), "dd MMM yyyy", { locale: id })
                        : "-"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="py-6">
                <div className="text-center">
                  <p className="text-amber-800 font-medium">Menunggu Pembayaran</p>
                  <p className="text-sm text-amber-600 mt-1">
                    Info kontrak akan muncul setelah pembayaran dikonfirmasi
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Info Pembayaran
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">Jatuh Tempo</p>
                  <p className="font-medium">
                    {format(new Date(invoice.dueDate), "dd MMMM yyyy", { locale: id })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Status</p>
                  <Badge className={cn(status.bgColor, status.color)}>{status.label}</Badge>
                </div>
                {invoice.paidAt && (
                  <div>
                    <p className="text-sm text-slate-500">Tanggal Bayar</p>
                    <p className="font-medium text-emerald-800">
                      {format(new Date(invoice.paidAt), "dd MMMM yyyy HH:mm", { locale: id })}
                    </p>
                  </div>
                )}
                {invoice.paymentMethod && (
                  <div>
                    <p className="text-sm text-slate-500">Metode</p>
                    <p className="font-medium">{invoice.paymentMethod}</p>
                  </div>
                )}
              </div>

              {/* Payment Proof */}
              {invoice.paymentProofUrl && (
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm text-slate-500">Bukti Pembayaran</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowImageModal(true)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Lihat
                    </Button>
                  </div>
                  <div
                    className="relative aspect-video bg-slate-100 rounded-lg overflow-hidden cursor-pointer"
                    onClick={() => setShowImageModal(true)}
                  >
                    <Image
                      src={invoice.paymentProofUrl}
                      alt="Bukti pembayaran"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              )}

              {/* Notes */}
              {invoice.notes && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-slate-500 mb-1">Catatan Tenant</p>
                  <p className="text-sm text-slate-700">{invoice.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Actions */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="text-base">Aksi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {canConfirm ? (
                <>
                  <Button
                    onClick={handleConfirmPayment}
                    disabled={actionLoading}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {actionLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    )}
                    Konfirmasi Pembayaran
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleRejectPayment}
                    disabled={actionLoading}
                    className="w-full text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Tolak Pembayaran
                  </Button>
                </>
              ) : invoice.status === "PAID" ? (
                <div className="text-center py-4">
                  <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
                  <p className="mt-2 font-medium text-emerald-800">Sudah Dibayar</p>
                  <p className="text-sm text-slate-500 mt-1">
                    {invoice.paidAt &&
                      `Pada ${format(new Date(invoice.paidAt), "dd MMM yyyy", { locale: id })}`}
                  </p>
                </div>
              ) : (
                <div className="text-center py-4">
                  <Clock className="w-12 h-12 text-slate-400 mx-auto" />
                  <p className="mt-2 text-slate-600">Menunggu Pembayaran</p>
                  <p className="text-sm text-slate-400 mt-1">
                    Tenant belum mengupload bukti bayar
                  </p>
                </div>
              )}

              <div className="pt-4 border-t space-y-2">
                <Link
                  href={`/admin/tenant/${invoice.tenant.id}`}
                  className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
                >
                  <UserCircle className="w-4 h-4" />
                  Lihat Profile Tenant
                </Link>
                <Link
                  href={`/admin/unit/${invoice.unit.id}`}
                  className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
                >
                  <Home className="w-4 h-4" />
                  Lihat Detail Unit
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Image Modal */}
      <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Bukti Pembayaran</DialogTitle>
            <DialogDescription>{invoice.invoiceNumber}</DialogDescription>
          </DialogHeader>
          <div className="relative aspect-video bg-slate-100 rounded-lg overflow-hidden">
            {invoice.paymentProofUrl && (
              <Image
                src={invoice.paymentProofUrl}
                alt="Bukti pembayaran"
                fill
                className="object-contain"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
