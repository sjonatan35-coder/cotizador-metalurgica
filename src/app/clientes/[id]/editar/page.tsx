'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/useToast'
import Toast from '@/components/ui/Toast'
import { Save } from 'lucide-react'

const FUENTES = [
  { label: 'Redes pagas', color: '#1E6AC8', items: ['Instagram Ads', 'Facebook Ads', 'TikTok Ads', 'Google Ads', 'YouTube Ads'] },
  { label: 'Orgánico', color: '#0F6E56', items: ['Instagram', 'Facebook', 'Google SEO', 'Google Maps', 'TikTok orgánico'] },
  { label: 'Directo', color: '#4A7BB5', items: ['WhatsApp directo', 'Llamada', 'Visita al local', 'Referido / boca en boca'] },
  { label: 'Sistema', color: '#2DD4BF', items: ['Calculadora app', 'Presupuesto app', 'Chat IA'] },
  { label: 'Otros', color: '#888780', items: ['MercadoLibre', 'OLX', 'Email marketing', 'Otra'] },
]

const CANALES_PAGOS = ['Instagram Ads', 'Facebook Ads', 'TikTok Ads', 'Google Ads', 'YouTube Ads']

const PROYECTOS = [
  { id: 'porton', label: 'Portón' },
  { id: 'piso', label: 'Piso' },
  { id: 'techo', label: 'Techo' },
  { id: 'estructura', label: 'Estructura' },
  { id: 'zingueria', label: 'Zinguería' },
  { id: 'trailer', label: 'Trailer' },
  { id: 'estampada', label: 'Chapa Estampada' },
  { id: 'cnc', label: 'Corte CNC' },
  { id: 'otros', label: 'Otros' },
]

const MOTIVOS_PERDIDA = [
  { id: 'precio', label: 'Precio' },
  { id: 'tiempo', label: 'Tiempo / demora' },
  { id: 'compro_otro_lado', label: 'Compró en otro lado' },
  { id: 'no_contesto', label: 'No contestó' },
  { id: 'proyecto_cancelado', label: 'Proyecto cancelado' },
  { id: 'otro', label: 'Otro' },
]

export default function EditarClientePage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const supabase = createClient()
  const { toasts, toast, removeToast } = useToast()

  const [loading, setLoading] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [form, setForm] = useState({
    nombre: '', empresa: '', telefono: '', email: '', zona: '',
    tipo_cliente: 'herrero', fuente: '', campana_origen: '',
    estado_lead: 'nuevo', urgencia: 'media', lead_score: 3,
    primer_producto_interes: '', motivo_perdida: '',
    proxima_accion_texto: '', proxima_accion_fecha: '', notas: '',
  })

  useEffect(() => {
    const cargar = async () => {
      const { data, error } = await supabase.from('clientes').select('*').eq('id', id).single()
      if (error || !data) { toast.error('No se pudo cargar el cliente'); setCargando(false); return }
      setForm({
        nombre: data.nombre || '', empresa: data.empresa || '',
        telefono: data.telefono || '', email: data.email || '',
        zona: data.zona || '', tipo_cliente: data.tipo_cliente || 'herrero',
        fuente: data.fuente || '', campana_origen: data.campana_origen || '',
        estado_lead: data.estado_lead || 'nuevo', urgencia: data.urgencia || 'media',
        lead_score: data.lead_score || 3,
        primer_producto_interes: data.primer_producto_interes || '',
        motivo_perdida: data.motivo_perdida || '',
        proxima_accion_texto: data.proxima_accion_texto || '',
        proxima_accion_fecha: data.proxima_accion_fecha || '',
        notas: data.notas || '',
      })
      setCargando(false)
    }
    cargar()
  }, [id])

  const set = (field: string, value: string | number) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const esCanalPago = CANALES_PAGOS.includes(form.fuente)
  const esPerdido = form.estado_lead === 'perdido'

  const guardar = async () => {
    if (!form.nombre.trim()) { toast.error('El nombre es obligatorio'); return }
    if (!form.telefono.trim()) { toast.error('El teléfono es obligatorio'); return }
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { toast.error('No estás autenticado'); setLoading(false); return }
      const { error } = await supabase.from('clientes').update({
        updated_by: user.id,
        nombre: form.nombre.trim(), empresa: form.empresa.trim() || null,
        telefono: form.telefono.trim(), email: form.email.trim() || null,
        zona: form.zona.trim() || null, tipo_cliente: form.tipo_cliente,
        fuente: form.fuente || null,
        campana_origen: esCanalPago && form.campana_origen ? form.campana_origen.trim() : null,
        estado_lead: form.estado_lead, urgencia: form.urgencia,
        lead_score: form.lead_score,
        primer_producto_interes: form.primer_producto_interes || null,
        motivo_perdida: esPerdido && form.motivo_perdida ? form.motivo_perdida : null,
        proxima_accion_texto: form.proxima_accion_texto.trim() || null,
        proxima_accion_fecha: form.proxima_accion_fecha || null,
        notas: form.notas.trim() || null,
        updated_at: new Date().toISOString(),
      }).eq('id', id)
      if (error) throw error
      toast.success('Cliente actualizado ✓')
      setTimeout(() => router.push(`/clientes/${id}`), 800)
    } catch (err) {
      console.error(err)
      toast.error('Error al guardar. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  if (cargando) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <p className="text-slate-400 text-sm">Cargando cliente...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-white">
      <Toast toasts={toasts} onRemove={removeToast} />

      {/* Header — flecha ← vuelve al detalle del cliente */}
      <div className="bg-[#0B1F3A] px-4 pt-4 pb-4 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => router.push(`/clientes/${id}`)} className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        </button>
        <button onClick={() => router.push('/')} className="flex-shrink-0">
          <img src="/logo.jpg" alt="La Metalúrgica" className="h-8 w-8 rounded-lg object-cover" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-white font-medium text-base leading-tight">Editar cliente</h1>
          <p className="text-[#4A7BB5] text-xs">CRM — La Metalúrgica</p>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-5 max-w-lg mx-auto pb-32">

        <section className="bg-slate-50 rounded-xl p-4 border-2 border-slate-200 flex flex-col gap-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Datos de contacto</p>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Nombre *</label>
            <input type="text" value={form.nombre} onChange={e => set('nombre', e.target.value)}
              className="w-full border-2 border-slate-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-blue-400" />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Empresa / Taller</label>
            <input type="text" value={form.empresa} onChange={e => set('empresa', e.target.value)}
              className="w-full border-2 border-slate-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-blue-400" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Teléfono *</label>
              <input type="tel" value={form.telefono} onChange={e => set('telefono', e.target.value)}
                className="w-full border-2 border-slate-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-blue-400" />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Email</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                className="w-full border-2 border-slate-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-blue-400" />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Zona / Barrio</label>
            <input type="text" value={form.zona} onChange={e => set('zona', e.target.value)}
              className="w-full border-2 border-slate-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-blue-400" />
          </div>
        </section>

        <section className="bg-slate-50 rounded-xl p-4 border-2 border-slate-200 flex flex-col gap-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Perfil del lead</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Tipo de cliente</label>
              <select value={form.tipo_cliente} onChange={e => set('tipo_cliente', e.target.value)}
                className="w-full border-2 border-slate-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-blue-400">
                <option value="herrero">Herrero</option>
                <option value="particular">Particular</option>
                <option value="obra">Obra</option>
                <option value="empresa">Empresa</option>
                <option value="otro">Otro</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Estado del lead</label>
              <select value={form.estado_lead} onChange={e => set('estado_lead', e.target.value)}
                className="w-full border-2 border-slate-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-blue-400">
                <option value="nuevo">Nuevo</option>
                <option value="contactado">Contactado</option>
                <option value="interesado">Interesado</option>
                <option value="cotizado">Cotizado</option>
                <option value="cerrado">Cerrado</option>
                <option value="perdido">Perdido</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Urgencia</label>
              <select value={form.urgencia} onChange={e => set('urgencia', e.target.value)}
                className="w-full border-2 border-slate-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-blue-400">
                <option value="alta">Alta</option>
                <option value="media">Media</option>
                <option value="baja">Baja</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Score del lead</label>
              <div className="flex gap-1 mt-1">
                {[1,2,3,4,5].map(n => (
                  <button key={n} onClick={() => set('lead_score', n)}
                    className={`w-9 h-9 rounded-full text-sm font-medium border-2 transition-all ${n <= form.lead_score ? 'bg-teal-400 border-teal-500 text-teal-900' : 'bg-white border-slate-300 text-slate-400'}`}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {esPerdido && (
            <div>
              <label className="text-xs text-slate-500 mb-1 block">¿Por qué se perdió? *</label>
              <div className="flex flex-wrap gap-2">
                {MOTIVOS_PERDIDA.map(m => (
                  <button key={m.id} onClick={() => set('motivo_perdida', m.id)}
                    className={`px-3 py-1.5 rounded-full text-xs border-2 transition-all ${form.motivo_perdida === m.id ? 'bg-red-500 border-red-600 text-white' : 'bg-white border-slate-300 text-slate-600'}`}>
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="bg-slate-50 rounded-xl p-4 border-2 border-slate-200 flex flex-col gap-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">¿Cómo llegó?</p>
          {FUENTES.map(grupo => (
            <div key={grupo.label}>
              <p className="text-xs text-slate-400 mb-1.5">{grupo.label}</p>
              <div className="flex flex-wrap gap-2">
                {grupo.items.map(item => (
                  <button key={item} onClick={() => set('fuente', item)}
                    style={form.fuente === item ? { background: grupo.color, borderColor: grupo.color, color: '#fff' } : {}}
                    className={`px-3 py-1.5 rounded-full text-xs border-2 transition-all ${form.fuente === item ? '' : 'bg-white border-slate-300 text-slate-600'}`}>
                    {item}
                  </button>
                ))}
              </div>
            </div>
          ))}
          {esCanalPago && (
            <div>
              <label className="text-xs text-slate-500 mb-1 block">¿Qué anuncio vio?</label>
              <input type="text" value={form.campana_origen} onChange={e => set('campana_origen', e.target.value)}
                className="w-full border-2 border-slate-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-blue-400" />
            </div>
          )}
        </section>

        <section className="bg-slate-50 rounded-xl p-4 border-2 border-slate-200 flex flex-col gap-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Producto de interés</p>
          <div className="flex flex-wrap gap-2">
            {PROYECTOS.map(p => (
              <button key={p.id} onClick={() => set('primer_producto_interes', form.primer_producto_interes === p.id ? '' : p.id)}
                className={`px-3 py-1.5 rounded-full text-xs border-2 transition-all ${form.primer_producto_interes === p.id ? 'bg-[#1E6AC8] border-blue-600 text-white' : 'bg-white border-slate-300 text-slate-600'}`}>
                {p.label}
              </button>
            ))}
          </div>
        </section>

        <section className="bg-slate-50 rounded-xl p-4 border-2 border-slate-200 flex flex-col gap-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Próxima acción</p>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">¿Qué hay que hacer?</label>
            <input type="text" value={form.proxima_accion_texto} onChange={e => set('proxima_accion_texto', e.target.value)}
              className="w-full border-2 border-slate-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-blue-400" />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">¿Cuándo?</label>
            <input type="date" value={form.proxima_accion_fecha} onChange={e => set('proxima_accion_fecha', e.target.value)}
              className="w-full border-2 border-slate-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-blue-400" />
          </div>
        </section>

        <section className="bg-slate-50 rounded-xl p-4 border-2 border-slate-200 flex flex-col gap-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Notas</p>
          <textarea value={form.notas} onChange={e => set('notas', e.target.value)} rows={3}
            className="w-full border-2 border-slate-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-blue-400 resize-none" />
        </section>

      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t-2 border-slate-200">
        <button onClick={guardar} disabled={loading}
          className="w-full bg-[#1E6AC8] text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60 max-w-lg mx-auto">
          <Save size={18} />
          {loading ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </div>
  )
}