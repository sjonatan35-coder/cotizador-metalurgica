'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/useToast'
import Toast from '@/components/ui/Toast'
import { Check, X, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react'

type Producto = {
  id: string
  nombre: string
  tipo: string
  activo: boolean
}

type Precio = {
  id?: string
  producto_id: string
  precio_unidad: number | null
  precio_mayorista: number | null
  precio_vip: number | null
  precio_interno: number | null
  precio_tonelada: number | null
  margen_minimo: number | null
  activo_vip: boolean
  notas: string | null
}

type Historial = {
  id: string
  created_at: string
  precio_unidad: number | null
  precio_mayorista: number | null
  campo_modificado: string | null
  modificado_por: string | null
}

const DOLAR_KEY = 'metalurgica_dolar_bna'

export default function AdminPreciosPage() {
  const router = useRouter()
  const supabase = createClient()
  const { toasts, toast, removeToast } = useToast()

  const [productos, setProductos] = useState<Producto[]>([])
  const [precios, setPrecios] = useState<Record<string, Precio>>({})
  const [historial, setHistorial] = useState<Historial[]>([])
  const [productoSeleccionado, setProductoSeleccionado] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [dolarBNA, setDolarBNA] = useState<{ valor: number; fecha: string } | null>(null)
  const [editandoDolar, setEditandoDolar] = useState(false)
  const [nuevoDolar, setNuevoDolar] = useState('')

  useEffect(() => {
    cargarDatos()
    const stored = localStorage.getItem(DOLAR_KEY)
    if (stored) setDolarBNA(JSON.parse(stored))
  }, [])

  async function cargarDatos() {
    const { data: prods } = await supabase
      .from('productos').select('id, nombre, tipo, activo').eq('activo', true).order('nombre')
    if (prods) setProductos(prods)

    const { data: precsData } = await supabase.from('precios').select('*')
    if (precsData) {
      const map: Record<string, Precio> = {}
      precsData.forEach(p => { map[p.producto_id] = p })
      setPrecios(map)
    }
  }

  async function cargarHistorial(productoId: string) {
    const { data } = await supabase
      .from('precios_historial')
      .select('*')
      .eq('producto_id', productoId)
      .order('created_at', { ascending: false })
      .limit(10)
    if (data) setHistorial(data)
  }

  function seleccionarProducto(id: string) {
    setProductoSeleccionado(id)
    cargarHistorial(id)
    if (!precios[id]) {
      setPrecios(prev => ({
        ...prev,
        [id]: {
          producto_id: id,
          precio_unidad: null, precio_mayorista: null,
          precio_vip: null, precio_interno: null,
          precio_tonelada: null, margen_minimo: null,
          activo_vip: false, notas: null,
        }
      }))
    }
  }

  function setPrecio(productoId: string, campo: keyof Precio, valor: string | number | boolean | null) {
    setPrecios(prev => ({
      ...prev,
      [productoId]: { ...prev[productoId], [campo]: valor }
    }))
  }

  async function guardarPrecio(productoId: string) {
    const p = precios[productoId]
    if (!p) return
    setGuardando(true)
    try {
      if (p.id) {
        const { error } = await supabase.from('precios').update({
          precio_unidad: p.precio_unidad,
          precio_mayorista: p.precio_mayorista,
          precio_vip: p.precio_vip,
          precio_interno: p.precio_interno,
          precio_tonelada: p.precio_tonelada,
          margen_minimo: p.margen_minimo,
          activo_vip: p.activo_vip,
          notas: p.notas,
        }).eq('id', p.id)
        if (error) throw error
      } else {
        const { data, error } = await supabase.from('precios').insert({
          producto_id: productoId,
          precio_unidad: p.precio_unidad,
          precio_mayorista: p.precio_mayorista,
          precio_vip: p.precio_vip,
          precio_interno: p.precio_interno,
          precio_tonelada: p.precio_tonelada,
          margen_minimo: p.margen_minimo,
          activo_vip: p.activo_vip,
          notas: p.notas,
        }).select().single()
        if (error) throw error
        if (data) setPrecios(prev => ({ ...prev, [productoId]: data }))
      }
      toast.success('Precio guardado ✓')
      cargarHistorial(productoId)
    } catch {
      toast.error('Error al guardar precio')
    } finally {
      setGuardando(false)
    }
  }

  function guardarDolar() {
    const val = parseFloat(nuevoDolar)
    if (isNaN(val) || val <= 0) { toast.error('Valor inválido'); return }
    const data = { valor: val, fecha: new Date().toLocaleDateString('es-AR') }
    localStorage.setItem(DOLAR_KEY, JSON.stringify(data))
    setDolarBNA(data)
    setEditandoDolar(false)
    setNuevoDolar('')
    toast.success('Dólar BNA actualizado ✓')
  }

  const productoActual = productoSeleccionado ? productos.find(p => p.id === productoSeleccionado) : null
  const precioActual = productoSeleccionado ? precios[productoSeleccionado] : null

  return (
    <div className="min-h-screen bg-[#f7faff]">
      <Toast toasts={toasts} onRemove={removeToast} />

      {/* Header — flecha ← vuelve a /admin/productos */}
      <div className="bg-[#0B1F3A] px-4 pt-4 pb-4 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => router.push('/admin/productos')} className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        </button>
        <button onClick={() => router.push('/admin/productos')} className="flex-shrink-0">
          <img src="/logo.jpg" alt="La Metalúrgica" className="h-8 w-8 rounded-lg object-cover" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-white font-medium text-base leading-tight">Precios</h1>
          <p className="text-[#4A7BB5] text-xs">Admin — La Metalúrgica</p>
        </div>
      </div>

      <div className="p-4 max-w-lg mx-auto flex flex-col gap-4 pb-10">

        {/* Alerta dólar BNA */}
        <div className={`rounded-xl p-3 border-2 flex items-start gap-3 ${dolarBNA ? 'bg-blue-50 border-blue-200' : 'bg-amber-50 border-amber-200'}`}>
          <AlertTriangle size={16} className={`mt-0.5 flex-shrink-0 ${dolarBNA ? 'text-blue-500' : 'text-amber-500'}`} />
          <div className="flex-1 min-w-0">
            <p className={`text-xs font-semibold ${dolarBNA ? 'text-blue-700' : 'text-amber-700'}`}>
              {dolarBNA ? `Dólar BNA: $${dolarBNA.valor.toLocaleString('es-AR')} — ${dolarBNA.fecha}` : 'Dólar BNA no configurado'}
            </p>
            <p className={`text-xs mt-0.5 ${dolarBNA ? 'text-blue-500' : 'text-amber-500'}`}>
              {dolarBNA ? 'Carga manual — actualizá cuando cambie' : 'Configurá el valor para calcular márgenes en USD'}
            </p>
          </div>
          <button onClick={() => setEditandoDolar(true)} className="text-xs text-[#1E6AC8] font-medium flex-shrink-0">
            {dolarBNA ? 'Editar' : 'Cargar'}
          </button>
        </div>

        {editandoDolar && (
          <div className="bg-white border-2 border-slate-200 rounded-xl p-4 flex gap-3 items-center">
            <DollarSign size={16} className="text-slate-400 flex-shrink-0" />
            <input type="number" placeholder="Ej: 1250" value={nuevoDolar}
              onChange={e => setNuevoDolar(e.target.value)}
              className="flex-1 border-2 border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-blue-400" />
            <button onClick={guardarDolar} className="bg-[#1E6AC8] text-white text-xs font-medium px-3 py-2 rounded-lg">
              <Check size={14} />
            </button>
            <button onClick={() => setEditandoDolar(false)} className="text-slate-400">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Lista de productos */}
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Seleccioná un producto</p>
          <div className="flex flex-col gap-2">
            {productos.map(prod => (
              <button key={prod.id} onClick={() => seleccionarProducto(prod.id)}
                className={`flex items-center justify-between p-3 rounded-xl border-2 text-left transition-all ${
                  productoSeleccionado === prod.id
                    ? 'bg-blue-50 border-[#1E6AC8]'
                    : 'bg-white border-slate-200'
                }`}>
                <div>
                  <p className="text-sm font-medium text-slate-800">{prod.nombre}</p>
                  <p className="text-xs text-slate-400">{prod.tipo}</p>
                </div>
                <div className="flex items-center gap-2">
                  {precios[prod.id]?.precio_unidad && (
                    <span className="text-xs text-[#1E6AC8] font-medium">
                      ${precios[prod.id].precio_unidad!.toLocaleString('es-AR')}
                    </span>
                  )}
                  <TrendingUp size={14} className={productoSeleccionado === prod.id ? 'text-[#1E6AC8]' : 'text-slate-300'} />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Panel de precios */}
        {productoActual && precioActual && (
          <div className="bg-white border-2 border-slate-200 rounded-xl p-4 flex flex-col gap-4">
            <p className="text-sm font-semibold text-slate-700">{productoActual.nombre}</p>

            <div className="grid grid-cols-2 gap-3">
              {[
                { campo: 'precio_unidad', label: 'Precio unidad' },
                { campo: 'precio_mayorista', label: 'Mayorista' },
                { campo: 'precio_vip', label: 'VIP' },
                { campo: 'precio_interno', label: 'Interno' },
              ].map(({ campo, label }) => (
                <div key={campo}>
                  <label className="text-xs text-slate-500 mb-1 block">{label}</label>
                  <input type="number" placeholder="$0"
                    value={(precioActual[campo as keyof Precio] as number | null) ?? ''}
                    onChange={e => setPrecio(productoActual.id, campo as keyof Precio, e.target.value ? parseFloat(e.target.value) : null)}
                    className="w-full border-2 border-slate-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-blue-400" />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Por tonelada</label>
                <input type="number" placeholder="$0"
                  value={precioActual.precio_tonelada ?? ''}
                  onChange={e => setPrecio(productoActual.id, 'precio_tonelada', e.target.value ? parseFloat(e.target.value) : null)}
                  className="w-full border-2 border-slate-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-blue-400" />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Margen mínimo %</label>
                <input type="number" placeholder="0"
                  value={precioActual.margen_minimo ?? ''}
                  onChange={e => setPrecio(productoActual.id, 'margen_minimo', e.target.value ? parseFloat(e.target.value) : null)}
                  className="w-full border-2 border-slate-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-blue-400" />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-500 mb-1 block">Notas internas</label>
              <textarea value={precioActual.notas ?? ''} rows={2}
                onChange={e => setPrecio(productoActual.id, 'notas', e.target.value || null)}
                className="w-full border-2 border-slate-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-blue-400 resize-none" />
            </div>

            <button onClick={() => guardarPrecio(productoActual.id)} disabled={guardando}
              className="w-full bg-[#1E6AC8] text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60">
              <Check size={16} />
              {guardando ? 'Guardando...' : 'Guardar precio'}
            </button>

            {/* Historial */}
            {historial.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Historial</p>
                <div className="flex flex-col gap-2">
                  {historial.map(h => (
                    <div key={h.id} className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-500">{new Date(h.created_at).toLocaleDateString('es-AR')}</span>
                        {h.precio_unidad && <span className="text-xs font-medium text-slate-700">${h.precio_unidad.toLocaleString('es-AR')}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}