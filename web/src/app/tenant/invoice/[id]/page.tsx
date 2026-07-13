"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  ArrowLeft,
  Upload,
  CheckCircle,
  Camera,
  X,
  Loader2,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { InvoiceStatusHeader } from "@/components/tenant/invoice-status-header";
import { PaymentBreakdown } from "@/components/tenant/payment-breakdown";
import { DueDateCountdown } from "@/components/tenant/due-date-countdown";

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
  unit: {
    unitNumber: string;
    property: {
      name: string;
    };
  };
  tenant: {
    name: string;
    email: string;
    phone: string;
  };
}

interface PropertyContact {
  propertyName: string;
  phone: string | null;
  email: string | null;
  address: string | null;
}

export default function TenantInvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { success, error: showError } = useToast();
  const invoiceId = params.id as string;

  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("TRANSFER");
  const [uploadNotes, setUploadNotes] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [propertyContact, setPropertyContact] = useState<PropertyContact | null>(null);

  useEffect(() => {
    fetchInvoice();
    fetchPropertyContact();
  }, [invoiceId]);

  const fetchPropertyContact = async () => {
    try {
      const res = await fetch("/api/property/contact");
      if (res.ok) {
        const data = await res.json();
        setPropertyContact(data);
      }
    } catch {
      // Silently fail
    }
  };

  const fetchInvoice = async () => {
    try {
      const res = await fetch(`/api/tenant/invoices/${invoiceId}`);
      if (res.ok) {
        const data = await res.json();
        setInvoice(data.invoice);
      } else {
        showError("Gagal memuat tagihan");
        router.push("/tenant/invoice");
      }
    } catch {
      showError("Terjadi kesalahan");
      router.push("/tenant/invoice");
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
      showError("Format file harus JPG atau PNG");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showError("Ukuran file maksimal 5MB");
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUploadProof = async () => {
    if (!selectedFile || !invoice) return;

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("invoiceId", invoice.id);
      formData.append("paymentMethod", paymentMethod);
      formData.append("notes", uploadNotes);

      const res = await fetch("/api/tenant/upload-proof", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        success("Bukti pembayaran berhasil diupload!");
        setShowUploadForm(false);
        setSelectedFile(null);
        setPreviewUrl(null);
        setUploadNotes("");
        fetchInvoice();
      } else {
        const data = await res.json();
        showError(data.error || "Gagal upload bukti pembayaran");
      }
    } catch {
      showError("Terjadi kesalahan saat upload");
    } finally {
      setUploading(false);
    }
  };

  const cancelUpload = () => {
    setShowUploadForm(false);
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setUploadNotes("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!invoice) {
    return null;
  }

  const isPaid = invoice.status === "PAID";
  const canUpload = invoice.status === "UNPAID" || invoice.status === "OVERDUE";

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="max-w-lg mx-auto px-4">
          <div className="flex items-center h-16">
            <Link
              href="/tenant/invoice"
              className="p-2 -ml-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <h1 className="flex-1 text-center text-lg font-bold text-slate-900">
              Detail Tagihan
            </h1>
            <div className="w-10" />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Status Header */}
        <InvoiceStatusHeader
          status={invoice.status}
          period={invoice.period}
          totalAmount={invoice.totalAmount}
          dueDate={new Date(invoice.dueDate)}
          paidAt={invoice.paidAt ? new Date(invoice.paidAt) : null}
        />

        {/* Due Date Countdown */}
        {!isPaid && <DueDateCountdown dueDate={new Date(invoice.dueDate)} status={invoice.status} />}

        {/* Payment Breakdown */}
        <PaymentBreakdown
          rentAmount={invoice.rentAmount}
          electricAmount={invoice.electricAmount}
          waterAmount={invoice.waterAmount}
          otherAmount={invoice.otherAmount}
          totalAmount={invoice.totalAmount}
        />

        {/* Payment Proof */}
        {invoice.paymentProofUrl && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900">Bukti Pembayaran</h3>
            </div>
            <div className="p-5">
              <div className="relative aspect-video bg-slate-100 rounded-xl overflow-hidden">
                <Image
                  src={invoice.paymentProofUrl}
                  alt="Bukti pembayaran"
                  fill
                  className="object-contain"
                />
              </div>
              {invoice.paymentMethod && (
                <p className="mt-3 text-sm text-slate-500">
                  Metode: <span className="font-medium">{invoice.paymentMethod}</span>
                </p>
              )}
            </div>
          </div>
        )}

        {/* Upload Form */}
        {showUploadForm && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">Upload Bukti Bayar</h3>
              <button
                onClick={cancelUpload}
                className="p-1 hover:bg-slate-100 rounded"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {/* File Upload */}
              <div>
                <Label>Bukti Transfer</Label>
                <div className="mt-2">
                  {previewUrl ? (
                    <div className="relative">
                      <div className="relative aspect-video bg-slate-100 rounded-xl overflow-hidden">
                        <Image
                          src={previewUrl}
                          alt="Preview"
                          fill
                          className="object-contain"
                        />
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setSelectedFile(null);
                          setPreviewUrl(null);
                        }}
                        className="mt-2"
                      >
                        Ganti Foto
                      </Button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-slate-50 hover:border-amber-400 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Camera className="w-10 h-10 text-slate-400" />
                        <p className="mt-2 text-sm text-slate-500">
                          Tap untuk upload foto
                        </p>
                        <p className="text-xs text-slate-400">JPG, PNG maks 5MB</p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/jpeg,image/png,image/jpg"
                        onChange={handleFileSelect}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <Label>Metode Pembayaran</Label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {["TRANSFER", "CASH", "QRIS", "LAINNYA"].map((method) => (
                    <button
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      className={cn(
                        "py-2.5 px-3 text-sm rounded-xl border transition-all duration-200",
                        paymentMethod === method
                          ? "bg-amber-500 text-white border-amber-500"
                          : "bg-white text-slate-700 border-slate-300 hover:border-amber-400"
                      )}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor="notes">Catatan (opsional)</Label>
                <Textarea
                  id="notes"
                  value={uploadNotes}
                  onChange={(e) => setUploadNotes(e.target.value)}
                  placeholder="Tambahkan catatan jika diperlukan"
                  rows={2}
                  className="mt-2"
                />
              </div>

              {/* Submit */}
              <Button
                onClick={handleUploadProof}
                disabled={!selectedFile || uploading}
                className="w-full"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Mengupload...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Kirim Bukti Bayar
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Pay Button */}
        {canUpload && !showUploadForm && (
          <Button
            onClick={() => setShowUploadForm(true)}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
            size="lg"
          >
            <Upload className="w-5 h-5 mr-2" />
            Bayar Sekarang
          </Button>
        )}

        {/* Already Paid Message */}
        {isPaid && (
          <div className="flex items-center justify-center gap-2 p-4 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Pembayaran telah dikonfirmasi</span>
          </div>
        )}

        {/* Notes */}
        {invoice.notes && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-900 mb-2">Catatan</h3>
            <p className="text-sm text-slate-600">{invoice.notes}</p>
          </div>
        )}

        {/* Property Contact Info */}
        {propertyContact && (propertyContact.phone || propertyContact.email) && (
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-900 mb-3">Hubungi Kami</h3>
            <div className="space-y-2">
              {propertyContact.phone && (
                <a
                  href={`tel:${propertyContact.phone}`}
                  className="flex items-center gap-3 text-sm text-slate-600 hover:text-amber-600"
                >
                  <Phone className="w-4 h-4 text-slate-400" />
                  {propertyContact.phone}
                </a>
              )}
              {propertyContact.email && (
                <a
                  href={`mailto:${propertyContact.email}`}
                  className="flex items-center gap-3 text-sm text-slate-600 hover:text-amber-600"
                >
                  <Mail className="w-4 h-4 text-slate-400" />
                  {propertyContact.email}
                </a>
              )}
              {propertyContact.address && (
                <div className="flex items-start gap-3 text-sm text-slate-600">
                  <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                  {propertyContact.address}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
