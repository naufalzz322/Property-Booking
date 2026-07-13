"use client"

import { createContext, useContext, useState, useCallback, ReactNode } from "react"
import { X, CircleCheckIcon, OctagonXIcon, TriangleAlertIcon, InfoIcon, Loader2Icon } from "lucide-react"

type ToastType = "success" | "error" | "warning" | "info" | "loading"

interface Toast {
  id: string
  type: ToastType
  title: string
  description?: string
}

interface ToastContextType {
  toasts: Toast[]
  toast: (type: ToastType, title: string, description?: string) => string
  success: (title: string, description?: string) => string
  error: (title: string, description?: string) => string
  warning: (title: string, description?: string) => string
  info: (title: string, description?: string) => string
  loading: (title: string, description?: string) => string
  dismiss: (id: string) => void
  dismissAll: () => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((type: ToastType, title: string, description?: string): string => {
    const id = Math.random().toString(36).slice(2, 9)
    const newToast: Toast = { id, type, title, description }

    setToasts(prev => [...prev, newToast])

    if (type !== "loading") {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id))
      }, 5000)
    }

    return id
  }, [])

  const success = useCallback((title: string, description?: string) => toast("success", title, description), [toast])
  const error = useCallback((title: string, description?: string) => toast("error", title, description), [toast])
  const warning = useCallback((title: string, description?: string) => toast("warning", title, description), [toast])
  const info = useCallback((title: string, description?: string) => toast("info", title, description), [toast])
  const loading = useCallback((title: string, description?: string) => toast("loading", title, description), [toast])

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const dismissAll = useCallback(() => {
    setToasts([])
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, toast, success, error, warning, info, loading, dismiss, dismissAll }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within ToastProvider")
  }
  return context
}

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-3">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={() => onDismiss(t.id)} />
      ))}
    </div>
  )
}

const iconMap = {
  success: { icon: CircleCheckIcon, bg: "bg-emerald-500/20", text: "text-emerald-400" },
  error: { icon: OctagonXIcon, bg: "bg-red-500/20", text: "text-red-400" },
  warning: { icon: TriangleAlertIcon, bg: "bg-amber-500/20", text: "text-amber-400" },
  info: { icon: InfoIcon, bg: "bg-blue-500/20", text: "text-blue-400" },
  loading: { icon: Loader2Icon, bg: "bg-white/20", text: "text-white" },
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const config = iconMap[toast.type]
  const Icon = config.icon

  return (
    <div className="flex items-center gap-4 min-w-[320px] max-w-[420px] bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white shadow-xl rounded-2xl p-5 animate-in slide-in-from-right-full duration-300">
      <button
        onClick={onDismiss}
        className="absolute top-3 right-3 text-slate-400 hover:text-white p-1 rounded-md transition-colors"
      >
        <X className="w-4 h-4" />
      </button>

      <div className={`w-10 h-10 rounded-full ${config.bg} flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-5 h-5 ${config.text} ${toast.type === "loading" ? "animate-spin" : ""}`} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-base font-semibold text-white text-center">{toast.title}</p>
        {toast.description && (
          <p className="text-sm text-slate-400 mt-1 text-center">{toast.description}</p>
        )}
      </div>
    </div>
  )
}
