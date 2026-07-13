"use client";

import { useState } from "react";
import { Download, Loader2, FileSpreadsheet } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/toast";

interface ExportButtonProps {
  type?: "invoices" | "tenants";
  period?: string;
}

export function ExportButton({ type = "invoices", period }: ExportButtonProps) {
  const { success, error: showError } = useToast();
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ type, format: "csv" });
      if (period) params.append("period", period);

      const response = await fetch(`/api/admin/export?${params.toString()}`);

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `export-${type}-${new Date().toISOString().split("T")[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        success("Export berhasil!");
      } else {
        const data = await response.json();
        showError(data.error || "Export gagal");
      }
    } catch (error) {
      console.error("Export error:", error);
      showError("Terjadi kesalahan saat export");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex items-center justify-center gap-2 rounded-md bg-amber-500 hover:bg-amber-600 text-white font-medium shadow-sm shadow-amber-500/20 h-9 px-4 transition-colors">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
        Export
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleExport} className="cursor-pointer">
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          Export CSV
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled className="cursor-not-allowed">
          <span className="text-xs text-slate-400">PDF export coming soon</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
