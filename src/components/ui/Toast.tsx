'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, AlertTriangle, X } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'warning'

export interface ToastData {
  id: string
  type: ToastType
  message: string
}

interface ToastProps {
  toasts: ToastData[]
  onRemove: (id: string) => void
}

const STYLES = {
  success: {
    bg: 'bg-green-50 border-green-200',
    text: 'text-green-800',
    icon: <CheckCircle size={18} className="text-green-500 shrink-0" />,
  },
  error: {
    bg: 'bg-red-50 border-red-200',
    text: 'text-red-800',
    icon: <XCircle size={18} className="text-red-500 shrink-0" />,
  },
  warning: {
    bg: 'bg-yellow-50 border-yellow-200',
    text: 'text-yellow-800',
    icon: <AlertTriangle size={18} className="text-yellow-500 shrink-0" />,
  },
}

function ToastItem({ toast, onRemove }: { toast: ToastData; onRemove: (id: string) => void }) {
  const [visible, setVisible] = useState(false)
  const style = STYLES[toast.type]

  useEffect(() => {
    const show = setTimeout(() => setVisible(true), 10)
    const hide = setTimeout(() => {
      setVisible(false)
      setTimeout(() => onRemove(toast.id), 300)
    }, 3000)
    return () => { clearTimeout(show); clearTimeout(hide) }
  }, [toast.id, onRemove])

  return (
    <div
      className={`
        flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg
        transition-all duration-300 min-w-[280px] max-w-[340px]
        ${style.bg} ${style.text}
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}
      `}
    >
      {style.icon}
      <span className="text-sm font-medium flex-1">{toast.message}</span>
      <button
        onClick={() => onRemove(toast.id)}
        className="opacity-50 hover:opacity-100 transition-opacity"
      >
        <X size={14} />
      </button>
    </div>
  )
}

export default function Toast({ toasts, onRemove }: ToastProps) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  )
}