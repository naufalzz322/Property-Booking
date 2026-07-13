"use client"

import { useState, useCallback, ReactNode } from "react"
import { ConfirmDialog } from "./confirm-dialog"

interface ConfirmDialogOptions {
  title: string
  description?: string
  icon?: "warning" | "danger" | "info"
  confirmText?: string
  cancelText?: string
  destructive?: boolean
  requireReason?: boolean
  reasonPlaceholder?: string
  reasonDefaultValue?: string
  onConfirm: (reason?: string) => void | Promise<void>
}

// Singleton state for the dialog
let dialogState: ConfirmDialogOptions | null = null
let setDialogState: ((state: ConfirmDialogOptions | null) => void) | null = null
let resolvePromise: ((value: boolean) => void) | null = null

export function ConfirmDialogProvider({ children }: { children: ReactNode }) {
  const [state, _setState] = useState<ConfirmDialogOptions | null>(null)

  // Store the setters for external use
  setDialogState = _setState

  const handleOpenChange = useCallback((open: boolean) => {
    if (!open && resolvePromise) {
      resolvePromise(false)
      resolvePromise = null
      _setState(null)
      dialogState = null
    }
  }, [])

  const handleConfirm = useCallback(async (reason?: string) => {
    try {
      if (dialogState?.onConfirm) {
        await dialogState.onConfirm(reason)
      }
      if (resolvePromise) {
        resolvePromise(true)
        resolvePromise = null
      }
    } finally {
      _setState(null)
      dialogState = null
    }
  }, [])

  return (
    <>
      {children}
      {state && (
        <ConfirmDialog
          open={!!state}
          onOpenChange={handleOpenChange}
          title={state.title}
          description={state.description}
          icon={state.icon}
          confirmText={state.confirmText}
          cancelText={state.cancelText}
          destructive={state.destructive}
          requireReason={state.requireReason}
          reasonPlaceholder={state.reasonPlaceholder}
          reasonDefaultValue={state.reasonDefaultValue}
          onConfirm={handleConfirm}
        />
      )}
    </>
  )
}

export function useConfirm() {
  const confirm = useCallback((options: ConfirmDialogOptions): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      if (!setDialogState) {
        console.error("ConfirmDialogProvider not found")
        resolve(false)
        return
      }

      dialogState = options
      resolvePromise = resolve
      setDialogState(options)
    })
  }, [])

  return { confirm }
}
