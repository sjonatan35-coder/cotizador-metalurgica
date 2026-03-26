'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/useToast'
import Toast from '@/components/ui/Toast'
import { Calendar, Clock } from 'lucide-react'

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
  proxima_accion_texto: string | null
  proxima_accion_fecha: string | null
  primer_producto_interes: string | null
}

const ESTADOS: EstadoLead[] = ['nuevo', 'contactado', 'interesado', 'cotizado', 'cerrado', 'perdido']

const BADGE: Record<EstadoLead, string> = {
  nuevo:      'bg-green-50 text-green-700 border-green-300',
  contactado: 'bg-blue-50 text-blue-700 border-blue-300',
  interesado: 'bg-yellow-50 text-yellow-700 border-yellow-300',
  cotizado:   'bg-purple-50 text-purple-700 border-purple-300',
  cerrado:    'bg-emerald-50 text-emerald-700 border-emerald-300',
  perdido:    'bg-red-50 text-red-700 border-red-300',
}

function getInitials(nombre: string) {
  const parts = nombre.trim().split(' ')
  if (parts.length >= 2) return parts[0][0] + parts[1][0]
  return nombre.slice(0, 2).toUpperCase()
}

export default function ClienteDetallePage() {
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  const id = params.id as string
  const { toasts, toast, removeToast } = useToast()

  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [notaNueva, setNotaNueva] = useState('')
  const [mostrarNota, setMostrarNota] = useState(false)
  const [autorNombre, setAutorNombre] = useState('Vendedor')

  useEffect(() => {
    const fetchCliente = async () => {
      const { data } = await supabase.from('clientes').select('*').eq('id', id).single()
      if (data) setCliente(data)
      setLoading(false)
    }
    const fetchAutor = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('nombre')
          .eq('id', user.id)
          .single()
        if (profile?.nombre) setAutorNombre(profile.nombre)
      }
    }
    fetchCliente()
    fetchAutor()
  }, [id])

  async function cambiarEstado(estado: EstadoLead) {
    if (!cliente) return
    setCliente({ ...cliente, estado_lead: estado })
    const { error } = await supabase.from('clientes').update({ estado_lead: estado }).eq('id', id)
    if (error) toast.error('Error al cambiar estado')
    else toast.success(`Estado: ${estado.charAt(0).toUpperCase() + estado.slice(1)} ✓`)
  }

  async function cambiarScore(score: number) {
    if (!cliente) return
    setCliente({ ...cliente, lead_score: score })
    const { error } = await supabase.from('clientes').update({ lead_score: score }).eq('id', id)
    if (error) toast.error('Error al guardar score')
    else toast.success(`Score actualizado ✓`)
  }

  async function guardarNota() {
    if (!cliente || !notaNueva.trim()) return
    setGuardando(true)
    const notaActual = cliente.notas ?? ''
    const fecha = new Date().toLocaleDateString('es-AR')
    const hora = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
    const nuevaNota = `[${fecha} ${hora} — ${autorNombre}] ${notaNueva.trim()}\n${notaActual}`
    const { error } = await supabase.from('clientes').update({ notas: nuevaNota }).eq('id', id)
    if (error) {
      toast.error('Error al guardar nota')
    } else {
      setCliente({ ...cliente, notas: nuevaNota })
      setNotaNueva('')
      setMostrarNota(false)
      toast.success('Nota guardada ✓')
    }
    setGuardando(false)
  }

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <p className="text-slate-400 text-sm">Cargando...</p>
    </div>
  )

  if (!cliente) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <p className="text-slate-400 text-sm">Cliente no encontrado</p>
    </div>
  )

  const notas = cliente.notas ? cliente.notas.split('\n').filter(n => n.trim()) : []
  const scoreLabel = cliente.lead_score === 5 ? 'Listo para cerrar' : cliente.lead_score === 4 ? 'Muy interesado' : cliente.lead_score === 3 ? 'Interesado' : cliente.lead_score === 2 ? 'Tibio' : 'Frío'

  const proximaFechaLabel = cliente.proxima_accion_fecha
    ? new Date(cliente.proxima_accion_fecha + 'T12:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })
    : null

  const proximaVencida = cliente.proxima_accion_fecha
    ? new Date(cliente.proxima_accion_fecha + 'T12:00:00') < new Date()
    : false

  return (
    <div className="min-h-screen bg-white pb-20">
      <Toast toasts={toasts} onRemove={removeToast} />

      {/* Header */}
      <div className="bg-[#0B1F3A] px-4 pt-4 pb-4 flex items-center gap-3">
        <button onClick={() => router.push('/clientes')} className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        </button>
        <button onClick={() => router.push('/')} className="flex-shrink-0">
          <img src="/logo.jpg" alt="La Metalúrgica" className="h-8 w-8 rounded-lg object-cover" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-white font-medium text-base leading-tight truncate">{cliente.nombre}</h1>
          <p className="text-[#4A7BB5] text-xs">Detalle del cliente</p>
        </div>
        <button onClick={() => router.push(`/clientes/${id}/editar`)} className="bg-[#2DD4BF]/15 border border-[#2DD4BF]/30 text-[#2DD4BF] text-xs font-medium px-3 py-1.5 rounded-lg flex-shrink-0">
          Editar
        </button>
      </div>

      {/* Info principal */}
      <div className="bg-white px-4 pt-4 pb-4 border-b-2 border-slate-200">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-base font-medium text-blue-700 flex-shrink-0">
            {getInitials(cliente.nombre)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-base font-medium text-slate-900 truncate">{cliente.nombre}</div>
            {cliente.empresa && <div className="text-sm text-slate-500 truncate">{cliente.empresa}</div>}
            {cliente.zona && <div className="text-xs text-slate-400">{cliente.zona}</div>}
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {cliente.tipo_cliente && (
            <span className="text-xs bg-blue-50 text-blue-700 border border-blue-300 rounded-full px-2.5 py-1 font-medium">{cliente.tipo_cliente}</span>
          )}
          {cliente.primer_producto_interes && (
            <span className="text-xs bg-purple-50 text-purple-700 border border-purple-300 rounded-full px-2.5 py-1 font-medium">{cliente.primer_producto_interes}</span>
          )}
          {cliente.urgencia === 'alta' && (
            <span className="text-xs bg-red-50 text-red-700 border border-red-300 rounded-full px-2.5 py-1 font-medium">Urgente</span>
          )}
        </div>
      </div>

      {/* Estado del lead */}
      <div className="bg-slate-50 px-4 py-3 border-b-2 border-slate-200">
        <div className="flex gap-2 overflow-x-auto pb-1" style={{scrollbarWidth:'none'}}>
          {ESTADOS.map(e => (
            <button key={e} onClick={() => cambiarEstado(e)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap border-2 transition-all ${
                cliente.estado_lead === e ? `${BADGE[e]} scale-105 shadow-sm` : 'bg-slate-100 text-slate-400 border-slate-300'
              }`}>
              {e.charAt(0).toUpperCase() + e.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Próxima acción */}
      {(cliente.proxima_accion_texto || cliente.proxima_accion_fecha) && (
        <div className={`mx-4 mt-4 rounded-xl p-3 border-2 flex items-start gap-3 ${proximaVencida ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
          <div className={`mt-0.5 ${proximaVencida ? 'text-red-500' : 'text-blue-500'}`}>
            {proximaVencida ? <Clock size={16} /> : <Calendar size={16} />}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-xs font-semibold mb-0.5 ${proximaVencida ? 'text-red-600' : 'text-blue-600'}`}>
              {proximaVencida ? 'Acción vencida' : 'Próxima acción'}
            </p>
            {cliente.proxima_accion_texto && (
              <p className="text-sm text-slate-700 leading-snug">{cliente.proxima_accion_texto}</p>
            )}
            {proximaFechaLabel && (
              <p className={`text-xs mt-1 font-medium ${proximaVencida ? 'text-red-500' : 'text-blue-500'}`}>{proximaFechaLabel}</p>
            )}
          </div>
          <button onClick={() => router.push(`/clientes/${id}/editar`)} className="text-xs text-slate-400 hover:text-slate-600 flex-shrink-0">
            Editar
          </button>
        </div>
      )}

      {/* Acciones */}
      <div className="px-4 py-4 bg-white border-b-2 border-slate-200 mt-4">
        <div className="grid grid-cols-3 gap-3 mb-3">
          {cliente.telefono && (
            <a href={`https://wa.me/${cliente.telefono.replace(/\D/g,'')}`} target="_blank" rel="noreferrer"
              className="flex flex-col items-center gap-2 py-3 rounded-xl border-2 border-slate-200 bg-slate-50">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>
              <span className="text-xs text-slate-500 font-medium">WhatsApp</span>
            </a>
          )}
          {cliente.telefono && (
            <a href={`tel:${cliente.telefono}`}
              className="flex flex-col items-center gap-2 py-3 rounded-xl border-2 border-slate-200 bg-slate-50">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 012 1.18 2 2 0 014 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92z"/></svg>
              <span className="text-xs text-slate-500 font-medium">Llamar</span>
            </a>
          )}
          {cliente.email && (
            <a href={`mailto:${cliente.email}`}
              className="flex flex-col items-center gap-2 py-3 rounded-xl border-2 border-slate-200 bg-slate-50">
              <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              <span className="text-xs text-slate-500 font-medium">Email</span>
            </a>
          )}
        </div>
        {/* Botón presupuesto — nuevo Semana 7 */}
        <button
          onClick={() => router.push(`/presupuestos/nuevo?cliente_id=${id}&nombre=${encodeURIComponent(cliente.nombre)}&telefono=${encodeURIComponent(cliente.telefono ?? '')}&producto=${encodeURIComponent(cliente.primer_producto_interes ?? '')}`)}
          className="w-full py-3 rounded-xl border-2 border-[#1E6AC8] bg-blue-50 text-[#1E6AC8] text-sm font-medium flex items-center justify-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          Generar presupuesto
        </button>
      </div>

      {/* Lead info */}
      <div className="px-4 py-4 border-b-2 border-slate-200">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Lead</p>
        <div className="flex items-center justify-between bg-slate-100 border-2 border-slate-300 rounded-xl px-4 py-3 mb-3">
          <div>
            <div className="text-sm font-medium text-slate-800">Score</div>
            <div className="text-xs text-slate-500 mt-0.5">{scoreLabel}</div>
          </div>
          <div className="flex gap-1.5">
            {[1,2,3,4,5].map(n => (
              <button key={n} onClick={() => cambiarScore(n)}
                className={`w-3 h-3 rounded-full transition-all ${n <= (cliente.lead_score ?? 0) ? 'bg-[#2DD4BF]' : 'bg-slate-300'}`}/>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {cliente.fuente && (
            <div className="bg-slate-100 border-2 border-slate-300 rounded-xl p-3">
              <div className="text-xs text-slate-500 font-medium mb-1">Fuente</div>
              <div className="text-sm font-medium text-slate-800">{cliente.fuente}</div>
            </div>
          )}
          {cliente.urgencia && (
            <div className="bg-slate-100 border-2 border-slate-300 rounded-xl p-3">
              <div className="text-xs text-slate-500 font-medium mb-1">Urgencia</div>
              <div className={`text-sm font-medium capitalize ${cliente.urgencia === 'alta' ? 'text-red-600' : cliente.urgencia === 'media' ? 'text-yellow-600' : 'text-green-600'}`}>
                {cliente.urgencia}
              </div>
            </div>
          )}
          {cliente.telefono && (
            <div className="bg-slate-100 border-2 border-slate-300 rounded-xl p-3">
              <div className="text-xs text-slate-500 font-medium mb-1">Teléfono</div>
              <div className="text-sm font-medium text-blue-600">{cliente.telefono}</div>
            </div>
          )}
          {cliente.email && (
            <div className="bg-slate-100 border-2 border-slate-300 rounded-xl p-3">
              <div className="text-xs text-slate-500 font-medium mb-1">Email</div>
              <div className="text-sm font-medium text-blue-600 truncate">{cliente.email}</div>
            </div>
          )}
        </div>
      </div>

      {/* Notas */}
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Notas</p>
          <button onClick={() => setMostrarNota(!mostrarNota)} className="text-xs text-[#1E6AC8] font-medium">+ Agregar</button>
        </div>
        {mostrarNota && (
          <div className="mb-3">
            <textarea value={notaNueva} onChange={e => setNotaNueva(e.target.value)} placeholder="Escribí una nota..." rows={3}
              className="w-full border-2 border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-700 outline-none resize-none bg-slate-50"/>
            <p className="text-xs text-slate-400 mt-1">Se guardará como: {autorNombre} — {new Date().toLocaleDateString('es-AR')}</p>
            <div className="flex gap-2 mt-2">
              <button onClick={() => setMostrarNota(false)} className="flex-1 py-2.5 text-sm text-slate-500 border-2 border-slate-300 rounded-xl bg-slate-50">Cancelar</button>
              <button onClick={guardarNota} disabled={guardando} className="flex-1 py-2.5 text-sm text-white bg-[#1E6AC8] rounded-xl font-medium">
                {guardando ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        )}
        {notas.length === 0 && !mostrarNota && (
          <p className="text-sm text-slate-400 text-center py-6">Sin notas todavía</p>
        )}
        <div className="flex flex-col gap-2">
          {notas.map((nota, i) => {
            const match = nota.match(/^\[(.+?)\] (.+)$/)
            const encabezado = match ? match[1] : null
            const contenido = match ? match[2] : nota
            return (
              <div key={i} className="bg-slate-100 border-2 border-slate-300 rounded-xl p-3">
                {encabezado && <p className="text-xs text-slate-400 font-medium mb-1">{encabezado}</p>}
                <p className="text-sm text-slate-700 leading-relaxed">{contenido}</p>
              </div>
            )
          })}
        </div>
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
        <button onClick={() => router.push('/clientes')} className="flex flex-col items-center gap-1 text-[#1E6AC8]">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
          <span className="text-xs">Clientes</span>
        </button>
        <button onClick={() => router.push('/')} className="flex flex-col items-center gap-1 text-slate-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
          <span className="text-xs">Mas</span>
        </button>
      </div>
    </div>
  )
}