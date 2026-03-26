'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/useToast'
import Toast from '@/components/ui/Toast'

type Item = {
  proyecto: string
  material: string
  calibre: string
  descripcion: string
  cantidad: number
  precio_unitario: number
  subtotal: number
}

const ITEM_VACIO: Item = {
  proyecto: '', material: '', calibre: '', descripcion: '',
  cantidad: 1, precio_unitario: 0, subtotal: 0
}

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

const MATERIALES = ['LAF', 'LAC', 'Galvanizado']

const CALIBRES = [
  'c14','c15','c16','c17','c18','c19','c20',
  'c22','c24','c25','c26','c27','c28','c30','c32','c34'
]

function generarNumero() {
  const n = Math.floor(Math.random() * 9000) + 1000
  return `PRES-${n}`
}

function buildDescripcion(proyecto: string, material: string, calibre: string): string {
  const label = PROYECTOS.find(p => p.id === proyecto)?.label ?? proyecto
  const parts = [label]
  if (material) parts.push(material)
  if (calibre) parts.push(calibre)
  return parts.join(' — ')
}

function NuevoPresupuestoContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const { toasts, toast, removeToast } = useToast()

  const [logueado, setLogueado] = useState(false)
  const [tenantId, setTenantId] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [mostrarPDF, setMostrarPDF] = useState(false)
  const [logoBase64, setLogoBase64] = useState<string | null>(null)

  const [numero] = useState(generarNumero())
  const [clienteNombre, setClienteNombre] = useState('')
  const [clienteTelefono, setClienteTelefono] = useState('')
  const [validezDias, setValidezDias] = useState(7)
  const [notas, setNotas] = useState('')
  const [items, setItems] = useState<Item[]>([{ ...ITEM_VACIO }])

  const clienteId = searchParams.get('cliente_id')

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setLogueado(true)
        const { data: profile } = await supabase
          .from('profiles').select('tenant_id').eq('id', user.id).single()
        if (profile?.tenant_id) setTenantId(profile.tenant_id)
      }
      const nombre = searchParams.get('nombre')
      const telefono = searchParams.get('telefono')
      const producto = searchParams.get('producto')
      if (nombre) setClienteNombre(decodeURIComponent(nombre))
      if (telefono) setClienteTelefono(decodeURIComponent(telefono))
      if (producto) {
        const prod = decodeURIComponent(producto)
        setItems([{ ...ITEM_VACIO, proyecto: prod, descripcion: buildDescripcion(prod, '', '') }])
      }
      try {
        const res = await fetch('/logo.jpg')
        const blob = await res.blob()
        const reader = new FileReader()
        reader.onloadend = () => setLogoBase64(reader.result as string)
        reader.readAsDataURL(blob)
      } catch {}
    }
    init()
  }, [])

  function updateItem(index: number, changes: Partial<Item>) {
    setItems(prev => {
      const nuevos = [...prev]
      const current = { ...nuevos[index], ...changes }
      // Recalcular descripción si cambia proyecto, material o calibre
      if (changes.proyecto !== undefined || changes.material !== undefined || changes.calibre !== undefined) {
        current.descripcion = buildDescripcion(current.proyecto, current.material, current.calibre)
      }
      // Recalcular subtotal si cambia cantidad o precio
      if (changes.cantidad !== undefined || changes.precio_unitario !== undefined) {
        current.subtotal = current.cantidad * current.precio_unitario
      }
      nuevos[index] = current
      return nuevos
    })
  }

  function agregarItem() {
    setItems(prev => [...prev, { ...ITEM_VACIO }])
  }

  function eliminarItem(index: number) {
    if (items.length === 1) return
    setItems(prev => prev.filter((_, i) => i !== index))
  }

  const total = items.reduce((acc, i) => acc + i.subtotal, 0)

  async function guardar(estado: 'borrador' | 'enviado') {
    if (!clienteNombre.trim()) { toast.error('El nombre del cliente es obligatorio'); return }
    if (items.every(i => !i.descripcion.trim())) { toast.error('Agregá al menos un ítem'); return }
    setGuardando(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const itemsLimpios = items
        .filter(i => i.descripcion.trim())
        .map(i => ({
          descripcion: i.descripcion,
          cantidad: i.cantidad,
          precio_unitario: i.precio_unitario,
          subtotal: i.subtotal,
        }))
      const payload: Record<string, unknown> = {
        numero_presupuesto: numero,
        cliente_nombre: clienteNombre.trim(),
        cliente_telefono: clienteTelefono.trim() || null,
        cliente_id: clienteId || null,
        items: itemsLimpios,
        total,
        estado,
        validez_dias: validezDias,
        notas: notas.trim() || null,
        user_id: user?.id || null,
        created_by: user?.id || null,
      }
      if (tenantId) payload.tenant_id = tenantId
      const { error } = await supabase.from('presupuestos').insert(payload)
      if (error) throw error
      toast.success(estado === 'enviado' ? 'Presupuesto enviado ✓' : 'Borrador guardado ✓')
      setTimeout(() => router.push('/presupuestos'), 800)
    } catch {
      toast.error('Error al guardar. Intentá de nuevo.')
    } finally {
      setGuardando(false)
    }
  }

  function compartirWhatsApp() {
    const tel = clienteTelefono.replace(/\D/g, '')
    const itemsTexto = items
      .filter(i => i.descripcion.trim())
      .map(i => `• ${i.descripcion} x${i.cantidad} = $${i.subtotal.toLocaleString('es-AR')}`)
      .join('\n')
    const msg = encodeURIComponent(
      `🏭 *Presupuesto ${numero} — La Cooperativa Metalúrgica Argentina*\n\n` +
      `Cliente: ${clienteNombre}\n\n` +
      `${itemsTexto}\n\n` +
      `*Total: $${total.toLocaleString('es-AR')}*\n\n` +
      `Válido por ${validezDias} días.\n` +
      `${notas ? '\n' + notas : ''}`
    )
    const url = tel
      ? `https://wa.me/54${tel}?text=${msg}`
      : `https://wa.me/5491159396358?text=${msg}`
    window.open(url, '_blank')
  }

  function imprimirPDF() {
    setMostrarPDF(true)
    setTimeout(() => {
      window.print()
      setTimeout(() => setMostrarPDF(false), 500)
    }, 400)
  }

  const fechaHoy = new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })
  const fechaVence = new Date(Date.now() + validezDias * 86400000).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="min-h-screen bg-white pb-32">
      <Toast toasts={toasts} onRemove={removeToast} />

      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #pdf-content, #pdf-content * { visibility: visible !important; }
          #pdf-content { position: fixed !important; left: 0 !important; top: 0 !important; width: 100% !important; background: white !important; }
        }
      `}</style>

      {/* Header */}
      <div className="bg-[#0B1F3A] px-4 pt-4 pb-4 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => router.push('/presupuestos')} className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        </button>
        <button onClick={() => router.push('/')} className="flex-shrink-0">
          <img src="/logo.jpg" alt="La Metalúrgica" className="h-8 w-8 rounded-lg object-cover" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-white font-medium text-base leading-tight">Nuevo presupuesto</h1>
          <p className="text-[#4A7BB5] text-xs">{numero}</p>
        </div>
      </div>

      <div className="px-4 pt-4 flex flex-col gap-4 max-w-lg mx-auto">

        {/* Cliente */}
        <section className="bg-slate-50 border-2 border-slate-200 rounded-xl p-4 flex flex-col gap-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Cliente</p>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Nombre *</label>
            <input type="text" value={clienteNombre} onChange={e => setClienteNombre(e.target.value)}
              placeholder="Ej: Juan Rodríguez"
              className="w-full border-2 border-slate-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-blue-400" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Teléfono</label>
              <input type="tel" value={clienteTelefono} onChange={e => setClienteTelefono(e.target.value)}
                placeholder="11 5555-0000"
                className="w-full border-2 border-slate-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-blue-400" />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Válido por</label>
              <select value={validezDias} onChange={e => setValidezDias(Number(e.target.value))}
                className="w-full border-2 border-slate-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-blue-400">
                <option value={3}>3 días</option>
                <option value={7}>7 días</option>
                <option value={15}>15 días</option>
                <option value={30}>30 días</option>
              </select>
            </div>
          </div>
        </section>

        {/* Ítems */}
        <section className="bg-slate-50 border-2 border-slate-200 rounded-xl p-4 flex flex-col gap-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Ítems</p>

          {items.map((item, i) => (
            <div key={i} className="bg-white border-2 border-slate-200 rounded-xl p-3 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-slate-500">Ítem {i + 1}</p>
                {items.length > 1 && (
                  <button onClick={() => eliminarItem(i)} className="text-xs text-red-400">Eliminar</button>
                )}
              </div>

              {/* Chips de proyecto */}
              <div className="flex flex-wrap gap-1.5">
                {PROYECTOS.map(p => (
                  <button key={p.id} onClick={() => updateItem(i, { proyecto: p.id })}
                    className={`px-2.5 py-1 rounded-full text-xs border-2 transition-all ${
                      item.proyecto === p.id
                        ? 'bg-[#1E6AC8] border-[#1E6AC8] text-white'
                        : 'bg-white border-slate-300 text-slate-600'
                    }`}>
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Material + Calibre — solo si hay proyecto */}
              {item.proyecto && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Material</label>
                    <select value={item.material} onChange={e => updateItem(i, { material: e.target.value })}
                      className="w-full border-2 border-slate-300 rounded-lg px-2 py-2 text-sm bg-white focus:outline-none focus:border-blue-400">
                      <option value="">-- elegir --</option>
                      {MATERIALES.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Calibre BWG</label>
                    <select value={item.calibre} onChange={e => updateItem(i, { calibre: e.target.value })}
                      className="w-full border-2 border-slate-300 rounded-lg px-2 py-2 text-sm bg-white focus:outline-none focus:border-blue-400">
                      <option value="">-- elegir --</option>
                      {CALIBRES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              )}

              {/* Descripción editable */}
              <input type="text" value={item.descripcion}
                onChange={e => setItems(prev => {
                  const n = [...prev]
                  n[i] = { ...n[i], descripcion: e.target.value }
                  return n
                })}
                placeholder="Descripción del ítem..."
                className="w-full border-2 border-slate-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-blue-400" />

              {/* Cantidad, precio, subtotal */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Cantidad</label>
                  <input type="number" min={1} value={item.cantidad}
                    onChange={e => updateItem(i, { cantidad: Number(e.target.value) })}
                    className="w-full border-2 border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Precio unit.</label>
                  <input type="number" min={0} value={item.precio_unitario || ''}
                    onChange={e => updateItem(i, { precio_unitario: Number(e.target.value) })}
                    placeholder="$0"
                    className="w-full border-2 border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Subtotal</label>
                  <div className="border-2 border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 text-[#1E6AC8] font-medium">
                    ${item.subtotal.toLocaleString('es-AR')}
                  </div>
                </div>
              </div>
            </div>
          ))}

          <button onClick={agregarItem}
            className="w-full py-2.5 border-2 border-dashed border-slate-300 rounded-xl text-sm text-slate-400 hover:border-blue-400 hover:text-blue-400 transition-colors">
            + Agregar ítem
          </button>
        </section>

        {/* Total */}
        <div className="bg-[#0B1F3A] rounded-xl px-4 py-3 flex items-center justify-between">
          <span className="text-[#4A7BB5] text-sm">Total estimado</span>
          <span className="text-[#2DD4BF] text-xl font-semibold">${total.toLocaleString('es-AR')}</span>
        </div>

        {/* Notas */}
        <section className="bg-slate-50 border-2 border-slate-200 rounded-xl p-4">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">Notas</label>
          <textarea value={notas} onChange={e => setNotas(e.target.value)} rows={2}
            placeholder="Observaciones para el cliente..."
            className="w-full border-2 border-slate-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-blue-400 resize-none" />
        </section>

        {/* Acciones */}
        <div className="flex flex-col gap-3 pb-8">
          <button onClick={imprimirPDF}
            className="w-full py-3.5 rounded-xl bg-[#1E6AC8] text-white font-semibold flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            Generar PDF
          </button>
          <button onClick={compartirWhatsApp}
            className="w-full py-3.5 rounded-xl bg-[#25D366] text-white font-semibold flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Enviar por WhatsApp
          </button>
          {logueado && (
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => guardar('borrador')} disabled={guardando}
                className="py-3 rounded-xl border-2 border-slate-300 text-slate-600 text-sm font-medium disabled:opacity-60">
                Guardar borrador
              </button>
              <button onClick={() => guardar('enviado')} disabled={guardando}
                className="py-3 rounded-xl border-2 border-[#1E6AC8] text-[#1E6AC8] text-sm font-medium disabled:opacity-60">
                {guardando ? 'Guardando...' : 'Marcar enviado'}
              </button>
            </div>
          )}
          {!logueado && (
            <p className="text-xs text-slate-400 text-center">
              <button onClick={() => router.push('/registro')} className="text-[#1E6AC8] font-medium">Registrate</button> para guardar el historial
            </p>
          )}
        </div>
      </div>

      {/* PDF para imprimir */}
      {mostrarPDF && (
        <div id="pdf-content" style={{ position: 'fixed', top: 0, left: 0, width: '100%', background: '#fff', padding: 32, zIndex: 9999, fontFamily: 'Arial, sans-serif' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, paddingBottom: 16, borderBottom: '2px solid #0B1F3A' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {logoBase64
                ? <img src={logoBase64} alt="Logo" style={{ width: 52, height: 52, borderRadius: 8, objectFit: 'cover' }} />
                : <div style={{ width: 52, height: 52, background: '#0B1F3A', borderRadius: 8 }} />
              }
              <div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#0B1F3A' }}>La Cooperativa Metalúrgica Argentina</p>
                <p style={{ margin: 0, fontSize: 11, color: '#4A7BB5' }}>Villa Lugano, CABA · WhatsApp: 11 5939-6358</p>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0B1F3A' }}>{numero}</p>
              <p style={{ margin: 0, fontSize: 11, color: '#666' }}>{fechaHoy}</p>
              <p style={{ margin: 0, fontSize: 11, color: '#666' }}>Vence: {fechaVence}</p>
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <p style={{ margin: '0 0 4px', fontSize: 11, color: '#666', textTransform: 'uppercase', letterSpacing: 1 }}>Para</p>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#0B1F3A' }}>{clienteNombre}</p>
            {clienteTelefono && <p style={{ margin: 0, fontSize: 12, color: '#4A7BB5' }}>{clienteTelefono}</p>}
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20, fontSize: 12 }}>
            <thead>
              <tr style={{ background: '#0B1F3A' }}>
                <th style={{ padding: '8px 12px', textAlign: 'left', color: '#F7FAFF', fontWeight: 600 }}>Producto / Descripción</th>
                <th style={{ padding: '8px 12px', textAlign: 'center', color: '#F7FAFF', fontWeight: 600, width: 60 }}>Cant.</th>
                <th style={{ padding: '8px 12px', textAlign: 'right', color: '#F7FAFF', fontWeight: 600, width: 100 }}>P. Unit.</th>
                <th style={{ padding: '8px 12px', textAlign: 'right', color: '#F7FAFF', fontWeight: 600, width: 110 }}>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {items.filter(i => i.descripcion.trim()).map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #e2eaf3', background: idx % 2 === 0 ? '#fff' : '#f7faff' }}>
                  <td style={{ padding: '8px 12px', color: '#0B1F3A' }}>{item.descripcion}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'center', color: '#0B1F3A' }}>{item.cantidad}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'right', color: '#0B1F3A' }}>${item.precio_unitario.toLocaleString('es-AR')}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600, color: '#0B1F3A' }}>${item.subtotal.toLocaleString('es-AR')}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
            <div style={{ background: '#0B1F3A', borderRadius: 8, padding: '12px 20px', textAlign: 'right' }}>
              <p style={{ margin: 0, fontSize: 12, color: '#4A7BB5' }}>Total</p>
              <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#2DD4BF' }}>${total.toLocaleString('es-AR')}</p>
            </div>
          </div>

          {notas && (
            <div style={{ background: '#f7faff', border: '1px solid #e2eaf3', borderRadius: 8, padding: '10px 14px', marginBottom: 16 }}>
              <p style={{ margin: '0 0 4px', fontSize: 10, color: '#666', textTransform: 'uppercase', letterSpacing: 1 }}>Observaciones</p>
              <p style={{ margin: 0, fontSize: 12, color: '#0B1F3A' }}>{notas}</p>
            </div>
          )}

          <div style={{ borderTop: '1px solid #e2eaf3', paddingTop: 12, fontSize: 10, color: '#999', textAlign: 'center' }}>
            Precios en pesos argentinos · Sujeto a disponibilidad de stock · Válido por {validezDias} días desde la fecha de emisión
          </div>
        </div>
      )}
    </div>
  )
}

export default function NuevoPresupuestoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-slate-400 text-sm">Cargando...</p>
      </div>
    }>
      <NuevoPresupuestoContent />
    </Suspense>
  )
}