'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Check, X, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react'

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
  campo: string
  valor_anterior: number | null
  valor_nuevo: number | null
}

export default function AdminPrecios() {
  const supabase = createClient()
  const router = useRouter()

  const [productos, setProductos] = useState<Producto[]>([])
  const [productoId, setProductoId] = useState<string>('')
  const [precio, setPrecio] = useState<Precio | null>(null)
  const [historial, setHistorial] = useState<Historial[]>([])
  const [cargando, setCargando] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState<{ texto: string; tipo: 'ok' | 'error' } | null>(null)

  const [dolarBna, setDolarBna] = useState<number | null>(null)
  const [dolarFecha, setDolarFecha] = useState<string | null>(null)
  const [mostrarAlertaDolar, setMostrarAlertaDolar] = useState(false)
  const [nuevoDolar, setNuevoDolar] = useState('')

  const mostrarMensaje = (texto: string, tipo: 'ok' | 'error') => {
    setMensaje({ texto, tipo })
    setTimeout(() => setMensaje(null), 3500)
  }

  // Cargar dólar BNA desde localStorage
  useEffect(() => {
    const stored = localStorage.getItem('metalurgica_dolar_bna')
    if (stored) {
      const parsed = JSON.parse(stored)
      setDolarBna(parsed.valor)
      setDolarFecha(parsed.fecha)
      // Si el dato es de otro día, mostrar alerta
      const hoy = new Date().toLocaleDateString('es-AR')
      if (parsed.fecha !== hoy) setMostrarAlertaDolar(true)
    } else {
      setMostrarAlertaDolar(true)
    }
  }, [])

  // Cargar productos activos
  useEffect(() => {
    const cargar = async () => {
      const { data } = await supabase
        .from('productos')
        .select('id, nombre, tipo, activo')
        .eq('activo', true)
        .order('nombre')
      if (data) setProductos(data)
    }
    cargar()
  }, [])

  // Cargar precio cuando cambia el producto seleccionado
  useEffect(() => {
    if (!productoId) return
    cargarPrecio()
    cargarHistorial()
  }, [productoId])

  const cargarPrecio = async () => {
    setCargando(true)
    const { data } = await supabase
      .from('precios')
      .select('*')
      .eq('producto_id', productoId)
      .maybeSingle()

    if (data) {
      setPrecio(data)
    } else {
      // No existe precio para este producto → inicializar vacío
      setPrecio({
        producto_id: productoId,
        precio_unidad: null,
        precio_mayorista: null,
        precio_vip: null,
        precio_interno: null,
        precio_tonelada: null,
        margen_minimo: 20,
        activo_vip: false,
        notas: null,
      })
    }
    setCargando(false)
  }

  const cargarHistorial = async () => {
    const { data } = await supabase
      .from('precios_historial')
      .select('*')
      .eq('producto_id', productoId)
      .order('created_at', { ascending: false })
      .limit(8)
    if (data) setHistorial(data)
  }

  const guardarDolar = () => {
    const valor = parseFloat(nuevoDolar.replace(',', '.'))
    if (isNaN(valor) || valor <= 0) {
      mostrarMensaje('Ingresá un valor válido', 'error')
      return
    }
    const hoy = new Date().toLocaleDateString('es-AR')
    localStorage.setItem('metalurgica_dolar_bna', JSON.stringify({ valor, fecha: hoy }))
    setDolarBna(valor)
    setDolarFecha(hoy)
    setMostrarAlertaDolar(false)
    setNuevoDolar('')
    mostrarMensaje(`Dólar BNA actualizado a $${valor.toLocaleString('es-AR')}`, 'ok')
  }

  const calcularMargen = () => {
    if (!precio?.precio_unidad || !precio?.precio_interno) return null
    return ((precio.precio_unidad - precio.precio_interno) / precio.precio_interno * 100)
  }

  const margen = calcularMargen()
  const margenBajo = margen !== null && precio?.margen_minimo !== null && margen < (precio?.margen_minimo ?? 20)

  const guardarPrecios = async () => {
    if (!precio || !productoId) return
    setGuardando(true)

    const payload = {
      producto_id: productoId,
      precio_unidad: precio.precio_unidad,
      precio_mayorista: precio.precio_mayorista,
      precio_vip: precio.precio_vip,
      precio_interno: precio.precio_interno,
      precio_tonelada: precio.precio_tonelada,
      margen_minimo: precio.margen_minimo,
      activo_vip: precio.activo_vip,
      notas: precio.notas,
    }

    if (precio.id) {
      const { error } = await supabase
        .from('precios')
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq('id', precio.id)
      if (error) {
        mostrarMensaje('Error al guardar: ' + error.message, 'error')
      } else {
        mostrarMensaje('Precios guardados', 'ok')
        await cargarPrecio()
        await cargarHistorial()
      }
    } else {
      const { error } = await supabase
        .from('precios')
        .insert(payload)
      if (error) {
        mostrarMensaje('Error al guardar: ' + error.message, 'error')
      } else {
        mostrarMensaje('Precios guardados', 'ok')
        await cargarPrecio()
        await cargarHistorial()
      }
    }

    setGuardando(false)
  }

  const formatARS = (v: number | null) =>
    v != null ? `$${v.toLocaleString('es-AR')}` : '—'

  const s = {
    page: { minHeight: '100vh', background: '#0B1F3A', fontFamily: "'DM Sans', sans-serif" } as React.CSSProperties,
    header: { background: '#0B1F3A', borderBottom: '1px solid rgba(247,250,255,0.08)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 } as React.CSSProperties,
    body: { background: '#f7faff', minHeight: 'calc(100vh - 56px)', padding: '16px' } as React.CSSProperties,
    label: { fontSize: 12, color: '#4A7BB5', display: 'block', marginBottom: 4, fontWeight: 500 } as React.CSSProperties,
    input: { width: '100%', boxSizing: 'border-box' as const, padding: '10px 12px', fontSize: 14, border: '1px solid #d1dce8', borderRadius: 8, background: '#fff', color: '#0B1F3A', outline: 'none' } as React.CSSProperties,
    select: { width: '100%', boxSizing: 'border-box' as const, padding: '10px 12px', fontSize: 14, border: '1px solid #d1dce8', borderRadius: 8, background: '#fff', color: '#0B1F3A', outline: 'none' } as React.CSSProperties,
    card: { background: '#fff', borderRadius: 10, border: '1px solid #e2eaf3', padding: '14px', marginBottom: 12 } as React.CSSProperties,
    btnPrimary: { width: '100%', padding: '13px', background: '#1E6AC8', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer' } as React.CSSProperties,
    sectionTitle: { fontSize: 11, fontWeight: 600, color: '#4A7BB5', textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: 8, marginTop: 16 } as React.CSSProperties,
  }

  return (
    <div style={s.page}>

      {mensaje && (
        <div style={{ position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 9999, background: mensaje.tipo === 'ok' ? '#0F6E56' : '#A32D2D', color: '#fff', padding: '10px 20px', borderRadius: 8, fontSize: 14, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
          {mensaje.tipo === 'ok' ? <Check size={16} /> : <X size={16} />}
          {mensaje.texto}
        </div>
      )}

      <div style={s.header}>
        <button onClick={() => router.push('/admin/productos')} style={{ background: 'none', border: 'none', color: '#2DD4BF', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, padding: 0 }}>
          <ArrowLeft size={16} /> Productos
        </button>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ color: '#F7FAFF', fontSize: 15, fontWeight: 600 }}>Precios</div>
          <div style={{ color: '#2DD4BF', fontSize: 11 }}>Panel Admin</div>
        </div>
        <div style={{ width: 70 }} />
      </div>

      <div style={s.body}>

        {/* ALERTA DÓLAR BNA */}
        {mostrarAlertaDolar && (
          <div style={{ background: '#FFF8E1', border: '1px solid #F5C842', borderRadius: 10, padding: '12px 14px', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <AlertTriangle size={15} color="#854F0B" />
              <span style={{ fontSize: 13, fontWeight: 600, color: '#854F0B' }}>
                {dolarFecha ? `Dólar BNA desactualizado — último: ${formatARS(dolarBna)} (${dolarFecha})` : 'No hay cotización dólar BNA cargada'}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                style={{ ...s.input, flex: 1, padding: '8px 10px', fontSize: 13 }}
                placeholder="Ej: 1250"
                value={nuevoDolar}
                onChange={e => setNuevoDolar(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && guardarDolar()}
              />
              <button onClick={guardarDolar} style={{ padding: '8px 14px', background: '#1E6AC8', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                Actualizar
              </button>
              <button onClick={() => setMostrarAlertaDolar(false)} style={{ padding: '8px 10px', background: 'none', border: '1px solid #d1dce8', borderRadius: 8, fontSize: 13, color: '#4A7BB5', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                Usar mismo
              </button>
            </div>
          </div>
        )}

        {/* Dólar actual en header si ya está cargado */}
        {!mostrarAlertaDolar && dolarBna && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#E1F5EE', border: '1px solid #9FE1CB', borderRadius: 8, padding: '8px 12px', marginBottom: 14 }}>
            <span style={{ fontSize: 12, color: '#0F6E56', display: 'flex', alignItems: 'center', gap: 4 }}>
              <DollarSign size={13} /> Dólar BNA: <strong style={{ marginLeft: 2 }}>{formatARS(dolarBna)}</strong> — {dolarFecha}
            </span>
            <button onClick={() => setMostrarAlertaDolar(true)} style={{ fontSize: 11, color: '#0F6E56', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
              Cambiar
            </button>
          </div>
        )}

        {/* SELECTOR DE PRODUCTO */}
        <div style={{ marginBottom: 14 }}>
          <label style={s.label}>Seleccioná un producto</label>
          <select
            style={s.select}
            value={productoId}
            onChange={e => setProductoId(e.target.value)}
          >
            <option value="">— Elegí un producto —</option>
            {productos.map(p => (
              <option key={p.id} value={p.id}>{p.nombre} ({p.tipo})</option>
            ))}
          </select>
        </div>

        {/* FORMULARIO DE PRECIOS */}
        {productoId && !cargando && precio && (
          <>
            {/* PRECIOS PÚBLICOS */}
            <p style={s.sectionTitle}>Precios públicos</p>
            <div style={s.card}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                <div style={{ flex: 1 }}>
                  <label style={s.label}>Precio unidad (ARS)</label>
                  <input
                    style={{ ...s.input, borderColor: '#1E6AC8' }}
                    type="number"
                    placeholder="0"
                    value={precio.precio_unidad ?? ''}
                    onChange={e => setPrecio(p => p ? ({ ...p, precio_unidad: e.target.value ? parseFloat(e.target.value) : null }) : p)}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={s.label}>Precio mayorista (ARS)</label>
                  <input
                    style={{ ...s.input, borderColor: '#1E6AC8' }}
                    type="number"
                    placeholder="0"
                    value={precio.precio_mayorista ?? ''}
                    onChange={e => setPrecio(p => p ? ({ ...p, precio_mayorista: e.target.value ? parseFloat(e.target.value) : null }) : p)}
                  />
                </div>
              </div>
              <div style={{ fontSize: 11, color: '#4A7BB5' }}>Visibles para todos — con y sin login</div>
            </div>

            {/* PRECIO VIP */}
            <p style={s.sectionTitle}>Precio VIP</p>
            <div style={s.card}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 13, color: '#0B1F3A', fontWeight: 500 }}>Precio VIP activo</span>
                <button
                  onClick={() => setPrecio(p => p ? ({ ...p, activo_vip: !p.activo_vip }) : p)}
                  style={{ width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', background: precio.activo_vip ? '#2DD4BF' : '#d3d1c7', position: 'relative', transition: 'background 0.2s' }}
                >
                  <span style={{ position: 'absolute', top: 3, left: precio.activo_vip ? 'calc(100% - 18px)' : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
                </button>
              </div>
              <input
                style={{ ...s.input, opacity: precio.activo_vip ? 1 : 0.5 }}
                type="number"
                placeholder="Precio VIP (ARS)"
                disabled={!precio.activo_vip}
                value={precio.precio_vip ?? ''}
                onChange={e => setPrecio(p => p ? ({ ...p, precio_vip: e.target.value ? parseFloat(e.target.value) : null }) : p)}
              />
              <div style={{ fontSize: 11, color: '#4A7BB5', marginTop: 6 }}>
                Incluye envío gratis hasta el 2do cordón de la General Paz
              </div>
            </div>

            {/* PRECIO POR TONELADA */}
            <p style={s.sectionTitle}>Precio por tonelada</p>
            <div style={s.card}>
              <label style={s.label}>Precio tonelada (ARS)</label>
              <input
                style={s.input}
                type="number"
                placeholder="0"
                value={precio.precio_tonelada ?? ''}
                onChange={e => setPrecio(p => p ? ({ ...p, precio_tonelada: e.target.value ? parseFloat(e.target.value) : null }) : p)}
              />
              <div style={{ fontSize: 11, color: '#4A7BB5', marginTop: 6 }}>
                Incluye envío gratis hasta el 2do cordón de la General Paz
              </div>
            </div>

            {/* PRECIO INTERNO — solo ADMIN */}
            <p style={s.sectionTitle}>Precio interno (solo admin)</p>
            <div style={s.card}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                <div style={{ flex: 1 }}>
                  <label style={s.label}>Costo real (ARS)</label>
                  <input
                    style={{ ...s.input, borderColor: '#F09595' }}
                    type="number"
                    placeholder="0"
                    value={precio.precio_interno ?? ''}
                    onChange={e => setPrecio(p => p ? ({ ...p, precio_interno: e.target.value ? parseFloat(e.target.value) : null }) : p)}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={s.label}>Margen mínimo (%)</label>
                  <input
                    style={s.input}
                    type="number"
                    placeholder="20"
                    value={precio.margen_minimo ?? ''}
                    onChange={e => setPrecio(p => p ? ({ ...p, margen_minimo: e.target.value ? parseFloat(e.target.value) : null }) : p)}
                  />
                </div>
              </div>

              {/* MARGEN CALCULADO */}
              {margen !== null && (
                <div style={{ background: margenBajo ? '#FCEBEB' : '#EAF3DE', border: `1px solid ${margenBajo ? '#F09595' : '#9FE1CB'}`, borderRadius: 8, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <TrendingUp size={14} color={margenBajo ? '#A32D2D' : '#3B6D11'} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: margenBajo ? '#A32D2D' : '#3B6D11' }}>
                    Margen: {margen.toFixed(1)}%
                    {margenBajo ? ` — por debajo del mínimo (${precio.margen_minimo}%)` : ' ✓'}
                  </span>
                </div>
              )}
            </div>

            {/* NOTAS */}
            <p style={s.sectionTitle}>Notas internas</p>
            <div style={{ marginBottom: 14 }}>
              <textarea
                style={{ ...s.input, height: 72, resize: 'none', fontFamily: 'inherit' }}
                placeholder="Notas sobre precios, condiciones especiales, etc."
                value={precio.notas ?? ''}
                onChange={e => setPrecio(p => p ? ({ ...p, notas: e.target.value }) : p)}
              />
            </div>

            {/* LEYENDA */}
            <div style={{ background: '#FFF8E1', border: '1px solid #F5C842', borderRadius: 8, padding: '8px 12px', marginBottom: 14 }}>
              <p style={{ fontSize: 11, color: '#854F0B', margin: 0, fontStyle: 'italic' }}>
                ⚠ Precio orientativo. El vendedor confirma según dólar BNA al día de la cotización.
              </p>
            </div>

            {/* BOTÓN GUARDAR */}
            <button
              style={{ ...s.btnPrimary, opacity: guardando ? 0.7 : 1, marginBottom: 20 }}
              onClick={guardarPrecios}
              disabled={guardando}
            >
              {guardando ? 'Guardando...' : 'Guardar precios'}
            </button>

            {/* HISTORIAL */}
            {historial.length > 0 && (
              <>
                <p style={s.sectionTitle}>Historial de cambios</p>
                <div style={s.card}>
                  {historial.map((h, i) => (
                    <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: i < historial.length - 1 ? '1px solid #e2eaf3' : 'none' }}>
                      <div>
                        <span style={{ fontSize: 12, color: '#0B1F3A', fontWeight: 500 }}>{h.campo}</span>
                        <span style={{ fontSize: 11, color: '#4A7BB5', marginLeft: 6 }}>
                          {new Date(h.created_at).toLocaleDateString('es-AR')}
                        </span>
                      </div>
                      <span style={{ fontSize: 12, color: '#4A7BB5' }}>
                        {formatARS(h.valor_anterior)} → <strong style={{ color: '#0B1F3A' }}>{formatARS(h.valor_nuevo)}</strong>
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {productoId && cargando && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#4A7BB5' }}>
            <p style={{ fontSize: 14 }}>Cargando precios...</p>
          </div>
        )}

        {!productoId && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#4A7BB5' }}>
            <DollarSign size={32} color="#d1dce8" style={{ margin: '0 auto 8px' }} />
            <p style={{ fontSize: 14 }}>Seleccioná un producto para editar sus precios</p>
          </div>
        )}

      </div>
    </div>
  )
}