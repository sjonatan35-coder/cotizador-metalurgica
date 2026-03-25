 
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type EstadoLead = 'nuevo' | 'contactado' | 'interesado' | 'cotizado' | 'cerrado' | 'perdido'

type Cliente = {
  id: string
  nombre: string
  empresa: string | null
  telefono: string | null
  email: string | null
  notas: string | null
  estado_lead: EstadoLead | null
  tipo_cliente: string | null
  zona: string | null
  fuente: string | null
  urgencia: string | null
  lead_score: number | null
  creditos: number | null
  created_at: string
}

const ESTADOS: { valor: EstadoLead | 'todos'; label: string }[] = [
  { valor: 'todos', label: 'Todos' },
  { valor: 'nuevo', label: 'Nuevo' },
  { valor: 'contactado', label: 'Contactado' },
  { valor: 'interesado', label: 'Interesado' },
  { valor: 'cotizado', label: 'Cotizado' },
  { valor: 'cerrado', label: 'Cerrado' },
  { valor: 'perdido', label: 'Perdido' },
]

const BADGE: Record<EstadoLead, string> = {
  nuevo:      'bg-green-50 text-green-700 border border-green-200',
  contactado: 'bg-blue-50 text-blue-700 border border-blue-200',
  interesado: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  cotizado:   'bg-purple-50 text-purple-700 border border-purple-200',
  cerrado:    'bg-emerald-50 text-emerald-700 border border-emerald-200',
  perdido:    'bg-red-50 text-red-700 border border-red-200',
}

const AVATAR_COLOR: Record<string, string> = {
  A: 'bg-blue-100 text-blue-700',
  B: 'bg-purple-100 text-purple-700',
  C: 'bg-teal-100 text-teal-700',
  D: 'bg-orange-100 text-orange-700',
  E: 'bg-pink-100 text-pink-700',
}

function getAvatarColor(nombre: string) {
  const idx = nombre.charCodeAt(0) % 5
  return Object.values(AVATAR_COLOR)[idx]
}

function getInitials(nombre: string) {
  const parts = nombre.trim().split(' ')
  if (parts.length >= 2) return parts[0][0] + parts[1][0]
  return nombre.slice(0, 2).toUpperCase()
}

export default function ClientesPage() {
  const router = useRouter()
  const supabase = createClient()

  const [clientes, setClientes] = useState<Cliente[]>([])
  const [filtro, setFiltro] = useState<EstadoLead | 'todos'>('todos')
  const [busqueda, setBusqueda] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchClientes = async () => {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data) setClientes(data)
      setLoading(false)
    }
    fetchClientes()
  }, [])

  const filtrados = clientes.filter(c => {
    const matchEstado = filtro === 'todos' || c.estado_lead === filtro
    const matchBusqueda =
      c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      (c.empresa ?? '').toLowerCase().includes(busqueda.toLowerCase()) ||
      (c.telefono ?? '').includes(busqueda)
    return matchEstado && matchBusqueda
  })

  const total = clientes.length
  const activos = clientes.filter(c => c.estado_lead && !['cerrado', 'perdido'].includes(c.estado_lead)).length
  const cerrados = clientes.filter(c => c.estado_lead === 'cerrado').length

  return (
    <div className="min-h-screen bg-white">

      {/* Header */}
      <div className="bg-[#0B1F3A] px-4 pt-4 pb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <img src="/logo.jpg" alt="La Metalúrgica" className="h-9 w-9 rounded-lg object-cover" />
            <div>
              <h1 className="text-white font-medium text-base leading-tight">Clientes</h1>
              <p className="text-[#4A7BB5] text-xs">La Metalúrgica</p>
            </div>
          </div>
          <button
            onClick={() => router.push('/clientes/nuevo')}
            className="bg-[#1E6AC8] text-white text-xs font-medium px-3 py-2 rounded-lg"
          >
            + Nuevo
          </button>
        </div>

        {/* Búsqueda */}
        <input
          type="text"
          placeholder="Buscar por nombre, empresa o teléfono..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/40 outline-none"
        />

        {/* Filtros */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
          {ESTADOS.map(e => (
            <button
              key={e.valor}
              onClick={() => setFiltro(e.valor)}
              className={`rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap border transition-all ${
                filtro === e.valor
                  ? 'bg-[#2DD4BF] text-[#0B1F3A] border-[#2DD4BF]'
                  : 'bg-white/5 text-[#4A7BB5] border-white/10'
              }`}
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3 px-4 py-3 bg-white border-b border-slate-100">
        <div className="text-center">
          <div className="text-xl font-medium text-slate-800">{total}</div>
          <div className="text-xs text-slate-400">Total</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-medium text-[#2DD4BF]">{activos}</div>
          <div className="text-xs text-slate-400">Activos</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-medium text-emerald-600">{cerrados}</div>
          <div className="text-xs text-slate-400">Cerrados</div>
        </div>
      </div>

      {/* Lista */}
      <div className="px-4 py-3 flex flex-col gap-3 pb-24">
        {loading && (
          <div className="text-center text-slate-400 text-sm py-12">Cargando clientes...</div>
        )}

        {!loading && filtrados.length === 0 && (
          <div className="text-center text-slate-400 text-sm py-12">
            {busqueda || filtro !== 'todos' ? 'Sin resultados' : 'Todavía no hay clientes'}
          </div>
        )}

        {filtrados.map(c => (
          <div
            key={c.id}
            onClick={() => router.push(`/clientes/${c.id}`)}
            className="bg-white border border-slate-100 rounded-xl p-3 shadow-sm active:scale-[0.99] transition-transform cursor-pointer"
          >
            {/* Top */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2 flex-1">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 ${getAvatarColor(c.nombre)}`}>
                  {getInitials(c.nombre)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-800 truncate">{c.nombre}</div>
                  <div className="text-xs text-slate-400 truncate">
                    {c.empresa ?? 'Sin empresa'}{c.zona ? ` — ${c.zona}` : ''}
                  </div>
                </div>
              </div>
              {c.estado_lead && (
                <span className={`text-xs font-medium px-2 py-1 rounded-full ml-2 whitespace-nowrap ${BADGE[c.estado_lead]}`}>
                  {c.estado_lead.charAt(0).toUpperCase() + c.estado_lead.slice(1)}
                </span>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50">
              <div className="flex items-center gap-2">
                {c.tipo_cliente && (
                  <span className="text-xs text-slate-400 bg-slate-50 rounded px-2 py-0.5">
                    {c.tipo_cliente}
                  </span>
                )}
                {c.fuente && (
                  <span className="text-xs text-slate-400">{c.fuente}</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(n => (
                  <div
                    key={n}
                    className={`w-2 h-2 rounded-full ${n <= (c.lead_score ?? 0) ? 'bg-[#2DD4BF]' : 'bg-slate-100'}`}
                  />
                ))}
                {c.urgencia === 'alta' && (
                  <span className="text-xs text-red-500 font-medium ml-1">Urgente</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navbar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 grid grid-cols-4 py-2 z-10">
        <button onClick={() => router.push('/')} className="flex flex-col items-center gap-1 text-slate-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>
          <span className="text-xs">Inicio</span>
        </button>
        <button onClick={() => router.push('/calculadora')} className="flex flex-col items-center gap-1 text-slate-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
          <span className="text-xs">Calculadora</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-[#1E6AC8]">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
          <span className="text-xs">Clientes</span>
        </button>
        <button onClick={() => router.push('/')} className="flex flex-col items-center gap-1 text-slate-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
          <span className="text-xs">Más</span>
        </button>
      </div>

    </div>
  )
}