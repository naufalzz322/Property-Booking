"use client";

import { AuthProvider } from "@/components/providers/AuthProvider";
import { ToastProvider } from "@/components/ui/toast";
import { ConfirmDialogProvider } from "@/components/ui/confirm-dialog-context";
import "./globals.css";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ConfirmDialogProvider>
      <ToastProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </ToastProvider>
    </ConfirmDialogProvider>
  );
}
