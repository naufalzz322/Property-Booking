"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle, OctagonX, Info, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Textarea } from "@/components/ui/textarea"

type IconType = "warning" | "danger" | "info"

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  icon?: IconType
  confirmText?: string
  cancelText?: string
  onConfirm: (reason?: string) => void | Promise<void>
  loading?: boolean
  destructive?: boolean
  requireReason?: boolean
  reasonPlaceholder?: string
  reasonDefaultValue?: string
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  icon = "warning",
  confirmText = "Konfirmasi",
  cancelText = "Batal",
  onConfirm,
  loading = false,
  destructive = false,
  requireReason = false,
  reasonPlaceholder = "Masukkan alasan penolakan...",
  reasonDefaultValue = "",
}: ConfirmDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [reason, setReason] = useState(reasonDefaultValue)

  const iconMap = {
    warning: { icon: AlertTriangle, bg: "bg-amber-100", color: "text-amber-600" },
    danger: { icon: OctagonX, bg: "bg-red-100", color: "text-red-600" },
    info: { icon: Info, bg: "bg-blue-100", color: "text-blue-600" },
  }

  const { icon: Icon, bg, color } = iconMap[icon]

  const handleConfirm = async () => {
    if (requireReason && !reason.trim()) {
      return
    }
    setIsProcessing(true)
    try {
      await onConfirm(reason)
      onOpenChange(false)
      setReason(reasonDefaultValue)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCancel = () => {
    onOpenChange(false)
    setReason(reasonDefaultValue)
  }

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent className="w-[90vw] max-w-sm">
        <DialogHeader className="text-center sm:text-left">
          <div className="mx-auto sm:mx-0 mb-4">
            <div className={cn("w-12 h-12 rounded-full flex items-center justify-center", bg)}>
              <Icon className={cn("w-6 h-6", color)} />
            </div>
          </div>
          <DialogTitle className="text-lg text-center sm:text-left">{title}</DialogTitle>
          {description && (
            <DialogDescription className="text-center sm:text-left">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        {requireReason && (
          <div className="py-2">
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={reasonPlaceholder}
              className="min-h-[80px] resize-none"
              autoFocus
            />
            {!reason.trim() && (
              <p className="text-xs text-red-500 mt-1">Alasan wajib diisi</p>
            )}
          </div>
        )}
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isProcessing || loading}
            className="flex-1"
          >
            {cancelText}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isProcessing || loading || (requireReason && !reason.trim())}
            className={cn(
              "flex-1",
              destructive && "bg-red-500 hover:bg-red-600 text-white"
            )}
          >
            {isProcessing || loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : null}
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
