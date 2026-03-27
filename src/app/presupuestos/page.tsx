'use client'
import BtnPrimary from '@/components/BtnPrimary'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type ItemPresupuesto = {
  descripcion: string
  cantidad: number
  precio_unitario: number
  subtotal: number
}

type Presupuesto = {
  id: string
  numero_presupuesto: string | null
  cliente_nombre: string | null
  cliente_telefono: string | null
  total: number | null
  estado: string | null
  created_at: string
  items: ItemPresupuesto[] | null
}

const ESTADO_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  borrador:  { bg: '#F1EFE8', color: '#5F5E5A', label: 'Borrador' },
  enviado:   { bg: '#E6F1FB', color: '#185FA5', label: 'Enviado' },
  aceptado:  { bg: '#E1F5EE', color: '#0F6E56', label: 'Aceptado' },
  rechazado: { bg: '#FCEBEB', color: '#A32D2D', label: 'Rechazado' },
  vencido:   { bg: '#FAEEDA', color: '#854F0B', label: 'Vencido' },
}

export default function PresupuestosPage() {
  const router = useRouter()
  const supabase = createClient()
  const [presupuestos, setPresupuestos] = useState<Presupuesto[]>([])
  const [loading, setLoading] = useState(true)
  const [logueado, setLogueado] = useState(false)

  useEffect(() => {
    const cargar = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setLogueado(true)
        const { data } = await supabase
          .from('presupuestos')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50)
        if (data) setPresupuestos(data)
      }
      setLoading(false)
    }
    cargar()
  }, [])

  const ahora = new Date()
  const presupuestosMes = presupuestos.filter(p => {
    const f = new Date(p.created_at)
    return f.getMonth() === ahora.getMonth() && f.getFullYear() === ahora.getFullYear()
  })
  const totalMes = presupuestosMes.reduce((acc, p) => acc + (p.total ?? 0), 0)

  return (
    <div className="min-h-screen bg-white pb-20">

      {/* Header */}
      <div className="bg-[#0B1F3A] px-4 pt-4 pb-4 flex items-center gap-3">
        <button onClick={() => router.push('/')} className="flex-shrink-0">
          <img src="/logo.jpg" alt="La Metalúrgica" className="h-8 w-8 rounded-lg object-cover" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-white font-medium text-base leading-tight">Presupuestos</h1>
          <p className="text-[#4A7BB5] text-xs">La Cooperativa Metalúrgica Argentina</p>
        </div>
        <button
          onClick={() => router.push('/presupuestos/nuevo')}
          className="bg-[#1E6AC8] text-white text-xs font-medium px-3 py-2 rounded-lg flex-shrink-0">
          + Nuevo
        </button>
      </div>

      <div className="px-4 pt-4 flex flex-col gap-4">

        {/* KPIs — solo si está logueado y hay datos */}
        {logueado && presupuestos.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-3">
              <p className="text-xs text-slate-500 mb-1">Este mes</p>
              <p className="text-lg font-semibold text-slate-800">{presupuestosMes.length}</p>
            </div>
            <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-3">
              <p className="text-xs text-slate-500 mb-1">Total cotizado</p>
              <p className="text-lg font-semibold text-[#1E6AC8]">
                ${totalMes.toLocaleString('es-AR')}
              </p>
            </div>
          </div>
        )}

        {/* Sin login */}
        {!loading && !logueado && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 text-center">
            <p className="text-sm font-medium text-blue-700 mb-1">Generá presupuestos gratis</p>
            <p className="text-xs text-blue-500 mb-3">Sin cuenta podés crear PDFs. Registrate para guardar el historial.</p>
            <button onClick={() => router.push('/registro')}
              className="bg-[#1E6AC8] text-white text-sm font-medium px-4 py-2 rounded-lg">
              Crear cuenta gratis
            </button>
          </div>
        )}

        {loading && (
          <p className="text-sm text-slate-400 text-center py-8">Cargando...</p>
        )}

        {!loading && logueado && presupuestos.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-400 text-sm mb-4">Todavía no hay presupuestos</p>
            <button onClick={() => router.push('/presupuestos/nuevo')}
              className="bg-[#1E6AC8] text-white text-sm font-medium px-4 py-2.5 rounded-lg">
              Crear primer presupuesto
            </button>
          </div>
        )}

        {!loading && presupuestos.map(p => {
          const est = ESTADO_STYLE[p.estado ?? 'borrador'] ?? ESTADO_STYLE.borrador
          const cantItems = p.items?.length ?? 0
          return (
            <button key={p.id}
              onClick={() => router.push(`/presupuestos/nuevo?id=${p.id}`)}
              className="w-full bg-white border-2 border-slate-200 rounded-xl p-4 text-left">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">
                    {p.cliente_nombre || 'Sin nombre'}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {p.numero_presupuesto} · {new Date(p.created_at).toLocaleDateString('es-AR')}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{ background: est.bg, color: est.color }}>
                    {est.label}
                  </span>
                  {p.total != null && (
                    <span className="text-sm font-semibold text-[#1E6AC8]">
                      ${p.total.toLocaleString('es-AR')}
                    </span>
                  )}
                </div>
              </div>
              {cantItems > 0 && (
                <p className="text-xs text-slate-400">
                  {cantItems} ítem{cantItems !== 1 ? 's' : ''}
                </p>
              )}
            </button>
          )
        })}

        {!loading && !logueado && (
          <button
            onClick={() => router.push('/presupuestos/nuevo')}
            className="w-full bg-[#1E6AC8] text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
            Crear presupuesto gratis
          </button>
        )}

      </div>

      {/* Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-slate-200 grid grid-cols-4 py-2 z-10">
        <button onClick={() => router.push('/')} className="flex flex-col items-center gap-1 text-slate-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>
          <span className="text-xs">Inicio</span>
        </button>
        <button onClick={() => router.push('/calculadora')} className="flex flex-col items-center gap-1 text-slate-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
          <span className="text-xs">Calculadora</span>
        </button>
        <button onClick={() => router.push('/presupuestos')} className="flex flex-col items-center gap-1 text-[#1E6AC8]">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          <span className="text-xs">Presupto.</span>
        </button>
        <button onClick={() => router.push('/')} className="flex flex-col items-center gap-1 text-slate-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
          <span className="text-xs">Más</span>
        </button>
      </div>
    </div>
  )
}