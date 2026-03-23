'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Plus, Upload, List, ArrowLeft, Search, Pencil, PowerOff, Power, X, Check } from 'lucide-react'

type Producto = {
  id: string
  nombre: string
  tipo: string
  subtipo: string | null
  unidad: string[]
  descripcion: string | null
  activo: boolean
}

type Tab = 'nuevo' | 'csv' | 'catalogo'

const TIPOS_BASE = ['Chapa', 'Caño', 'Fierro', 'Otro']

const SUBTIPOS: Record<string, string[]> = {
  'Chapa': ['LAF', 'LAC', 'GALVANIZADO', 'ESTAMPADO', 'CNC'],
}

const UNIDADES = ['Unidad', 'kg', 'Tonelada', 'Metro', 'Rollo']

const badgeStyle = (activo: boolean): React.CSSProperties => ({
  display: 'inline-block',
  fontSize: 11,
  padding: '2px 8px',
  borderRadius: 99,
  background: activo ? '#EAF3DE' : '#f1efe8',
  color: activo ? '#3B6D11' : '#5f5e5a',
  border: activo ? 'none' : '0.5px solid #d3d1c7',
})

const tipoBadgeStyle: React.CSSProperties = {
  display: 'inline-block',
  fontSize: 11,
  padding: '2px 8px',
  borderRadius: 99,
  background: '#E1F5EE',
  color: '#0F6E56',
}

export default function AdminProductos() {
  const supabase = createClient()
  const router = useRouter()

  const [tab, setTab] = useState<Tab>('nuevo')
  const [productos, setProductos] = useState<Producto[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [tiposDisponibles, setTiposDisponibles] = useState<string[]>(TIPOS_BASE)
  const [cargando, setCargando] = useState(false)
  const [mensaje, setMensaje] = useState<{ texto: string; tipo: 'ok' | 'error' } | null>(null)
  const [editandoId, setEditandoId] = useState<string | null>(null)

  const [form, setForm] = useState({
    nombre: '',
    tipo: 'Chapa',
    subtipo: '',
    unidades: [] as string[],
    descripcion: '',
    activo: true,
    tipoNuevo: '',
  })

  const [csvPreview, setCsvPreview] = useState<Omit<Producto, 'id'>[]>([])
  const [csvError, setCsvError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const cargarProductos = async () => {
    const { data } = await supabase
      .from('productos')
      .select('*')
      .order('nombre')
    if (data) {
      setProductos(data)
      const tiposDB = [...new Set(data.map((p: Producto) => p.tipo))]
      setTiposDisponibles(prev => [...new Set([...prev, ...tiposDB])])
    }
  }

  useEffect(() => { cargarProductos() }, [])

  const mostrarMensaje = (texto: string, tipo: 'ok' | 'error') => {
    setMensaje({ texto, tipo })
    setTimeout(() => setMensaje(null), 3500)
  }

  const guardarProducto = async () => {
    if (!form.nombre.trim()) {
      mostrarMensaje('El nombre es obligatorio', 'error')
      return
    }

    const tipoFinal = form.tipo === '__nuevo__' ? form.tipoNuevo.trim() : form.tipo

    if (!tipoFinal) {
      mostrarMensaje('Escribí el nombre del tipo nuevo', 'error')
      return
    }

    if (form.unidades.length === 0) {
      mostrarMensaje('Seleccioná al menos una unidad de venta', 'error')
      return
    }

    setCargando(true)

    const payload = {
      nombre: form.nombre.trim(),
      tipo: tipoFinal,
      subtipo: form.subtipo || null,
      unidad: form.unidades,
      descripcion: form.descripcion.trim() || null,
      activo: form.activo,
    }

    if (editandoId) {
      const { error } = await supabase
        .from('productos')
        .update(payload)
        .eq('id', editandoId)

      if (error) {
        mostrarMensaje('Error al actualizar: ' + error.message, 'error')
      } else {
        mostrarMensaje('Producto actualizado', 'ok')
        setEditandoId(null)
        resetForm()
        await cargarProductos()
      }
    } else {
      const { error } = await supabase
        .from('productos')
        .insert(payload)

      if (error) {
        mostrarMensaje('Error al guardar: ' + error.message, 'error')
      } else {
        mostrarMensaje('Producto guardado', 'ok')
        resetForm()
        await cargarProductos()
        setTab('catalogo')
      }
    }

    setCargando(false)
  }

  const resetForm = () => {
    setForm({ nombre: '', tipo: 'Chapa', subtipo: '', unidades: [], descripcion: '', activo: true, tipoNuevo: '' })
  }

  const toggleActivo = async (producto: Producto) => {
    const { error } = await supabase
      .from('productos')
      .update({ activo: !producto.activo })
      .eq('id', producto.id)

    if (!error) {
      mostrarMensaje(
        producto.activo ? 'Producto desactivado' : 'Producto activado',
        'ok'
      )
      await cargarProductos()
    }
  }

  const iniciarEdicion = (p: Producto) => {
    setEditandoId(p.id)
    setForm({
      nombre: p.nombre,
      tipo: p.tipo,
      subtipo: p.subtipo || '',
      unidades: Array.isArray(p.unidad) ? p.unidad : [p.unidad],
      descripcion: p.descripcion || '',
      activo: p.activo,
      tipoNuevo: '',
    })
    setTab('nuevo')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const procesarCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCsvError(null)
    setCsvPreview([])
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      const lines = text.split('\n').map(l => l.trim()).filter(Boolean)

      if (lines.length < 2) {
        setCsvError('El archivo está vacío o no tiene datos')
        return
      }

      const header = lines[0].toLowerCase().split(',').map(h => h.trim())
      const requiredCols = ['nombre', 'tipo', 'unidad']
      const missing = requiredCols.filter(c => !header.includes(c))

      if (missing.length > 0) {
        setCsvError(`Faltan columnas: ${missing.join(', ')}`)
        return
      }

      const rows: Omit<Producto, 'id'>[] = []

      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.trim())
        const row: Record<string, string> = {}
        header.forEach((h, idx) => { row[h] = cols[idx] || '' })
        if (!row['nombre']) continue
        rows.push({
          nombre: row['nombre'],
          tipo: row['tipo'] || 'Otro',
          subtipo: row['subtipo'] || null,
          unidad: row['unidad'] ? row['unidad'].split('|').map(u => u.trim()) : ['Unidad'],
          descripcion: row['descripcion'] || null,
          activo: row['activo'] !== 'false',
        })
      }

      if (rows.length === 0) {
        setCsvError('No se encontraron filas válidas')
        return
      }

      setCsvPreview(rows)
    }

    reader.readAsText(file)
  }

  const importarCSV = async () => {
    if (csvPreview.length === 0) return
    setCargando(true)

    const { error } = await supabase.from('productos').insert(csvPreview)

    if (error) {
      mostrarMensaje('Error al importar: ' + error.message, 'error')
    } else {
      mostrarMensaje(`${csvPreview.length} productos importados`, 'ok')
      setCsvPreview([])
      if (fileRef.current) fileRef.current.value = ''
      await cargarProductos()
      setTab('catalogo')
    }

    setCargando(false)
  }

  const productosFiltrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.tipo.toLowerCase().includes(busqueda.toLowerCase())
  )

  const s = {
    page: {
      minHeight: '100vh',
      background: '#0B1F3A',
      fontFamily: "'DM Sans', sans-serif",
    } as React.CSSProperties,
    header: {
      background: '#0B1F3A',
      borderBottom: '1px solid rgba(247,250,255,0.08)',
      padding: '12px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
    } as React.CSSProperties,
    body: {
      background: '#f7faff',
      minHeight: 'calc(100vh - 110px)',
      padding: '16px',
    } as React.CSSProperties,
    label: {
      fontSize: 12,
      color: '#4A7BB5',
      display: 'block',
      marginBottom: 4,
      fontWeight: 500,
    } as React.CSSProperties,
    input: {
      width: '100%',
      boxSizing: 'border-box' as const,
      padding: '10px 12px',
      fontSize: 14,
      border: '1px solid #d1dce8',
      borderRadius: 8,
      background: '#fff',
      color: '#0B1F3A',
      outline: 'none',
    } as React.CSSProperties,
    select: {
      width: '100%',
      boxSizing: 'border-box' as const,
      padding: '10px 12px',
      fontSize: 14,
      border: '1px solid #d1dce8',
      borderRadius: 8,
      background: '#fff',
      color: '#0B1F3A',
      outline: 'none',
    } as React.CSSProperties,
    btnPrimary: {
      width: '100%',
      padding: '13px',
      background: '#1E6AC8',
      color: '#fff',
      border: 'none',
      borderRadius: 8,
      fontSize: 15,
      fontWeight: 600,
      cursor: 'pointer',
      marginTop: 4,
    } as React.CSSProperties,
    card: {
      background: '#fff',
      borderRadius: 10,
      border: '1px solid #e2eaf3',
      padding: '14px',
      marginBottom: 10,
    } as React.CSSProperties,
  }

  return (
    <div style={s.page}>

      {mensaje && (
        <div style={{
          position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)',
          zIndex: 9999, background: mensaje.tipo === 'ok' ? '#0F6E56' : '#A32D2D',
          color: '#fff', padding: '10px 20px', borderRadius: 8, fontSize: 14,
          fontWeight: 500, boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          {mensaje.tipo === 'ok' ? <Check size={16} /> : <X size={16} />}
          {mensaje.texto}
        </div>
      )}

      <div style={s.header}>
        <button
          onClick={() => router.push('/')}
          style={{ background: 'none', border: 'none', color: '#2DD4BF', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, padding: 0 }}
        >
          <ArrowLeft size={16} /> Inicio
        </button>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ color: '#F7FAFF', fontSize: 15, fontWeight: 600 }}>Productos</div>
          <div style={{ color: '#2DD4BF', fontSize: 11 }}>Panel Admin</div>
        </div>
        <div style={{ width: 60 }} />
      </div>

      <div style={{ background: '#0B1F3A', padding: '0 16px 12px', display: 'flex', gap: 8 }}>
        {([
          { id: 'nuevo', label: 'Nuevo', icon: <Plus size={14} /> },
          { id: 'csv', label: 'Importar CSV', icon: <Upload size={14} /> },
          { id: 'catalogo', label: `Catálogo (${productos.length})`, icon: <List size={14} /> },
        ] as { id: Tab; label: string; icon: React.ReactNode }[]).map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              flex: 1,
              padding: '8px 4px',
              fontSize: 12,
              fontWeight: 500,
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              background: tab === t.id ? '#1E6AC8' : 'rgba(247,250,255,0.08)',
              color: tab === t.id ? '#fff' : 'rgba(247,250,255,0.5)',
              transition: 'all 0.15s',
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div style={s.body}>

        {tab === 'nuevo' && (
          <div>
            {editandoId && (
              <div style={{ background: '#E1F5EE', border: '1px solid #9FE1CB', borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: 13, color: '#0F6E56', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Editando producto</span>
                <button onClick={() => { resetForm(); setEditandoId(null) }} style={{ background: 'none', border: 'none', color: '#0F6E56', cursor: 'pointer', fontSize: 12 }}>Cancelar</button>
              </div>
            )}

            <div style={{ marginBottom: 14 }}>
              <label style={s.label}>Nombre del producto *</label>
              <input
                style={s.input}
                placeholder="Ej: Chapa LAF c16 — 1000x2000"
                value={form.nombre}
                onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
              />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={s.label}>Tipo</label>
              <select
                style={s.select}
                value={form.tipo}
                onChange={e => setForm(f => ({ ...f, tipo: e.target.value, subtipo: '' }))}
              >
                {tiposDisponibles.map(t => <option key={t} value={t}>{t}</option>)}
                <option value="__nuevo__">+ Tipo nuevo...</option>
              </select>
            </div>

            {SUBTIPOS[form.tipo] && (
              <div style={{ marginBottom: 14 }}>
                <label style={s.label}>Material</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {SUBTIPOS[form.tipo].map(sub => (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, subtipo: f.subtipo === sub ? '' : sub }))}
                      style={{
                        padding: '7px 16px',
                        fontSize: 13,
                        borderRadius: 99,
                        border: `1px solid ${form.subtipo === sub ? '#1E6AC8' : '#d1dce8'}`,
                        background: form.subtipo === sub ? '#1E6AC8' : '#fff',
                        color: form.subtipo === sub ? '#fff' : '#0B1F3A',
                        cursor: 'pointer',
                        fontWeight: form.subtipo === sub ? 600 : 400,
                        transition: 'all 0.15s',
                      }}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {form.tipo === '__nuevo__' && (
              <div style={{ marginBottom: 14 }}>
                <label style={s.label}>Nombre del tipo nuevo</label>
                <input
                  style={s.input}
                  placeholder="Ej: Perfil, Malla, Alambre..."
                  value={form.tipoNuevo}
                  onChange={e => setForm(f => ({ ...f, tipoNuevo: e.target.value }))}
                />
              </div>
            )}

            <div style={{ marginBottom: 14 }}>
              <label style={s.label}>Unidades de venta</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                {UNIDADES.map(u => (
                  <label key={u} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#0B1F3A', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={form.unidades.includes(u)}
                      onChange={e => {
                        if (e.target.checked) {
                          setForm(f => ({ ...f, unidades: [...f.unidades, u] }))
                        } else {
                          setForm(f => ({ ...f, unidades: f.unidades.filter(x => x !== u) }))
                        }
                      }}
                      style={{ width: 16, height: 16, accentColor: '#1E6AC8' }}
                    />
                    {u}
                  </label>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={s.label}>Descripción (opcional)</label>
              <textarea
                style={{ ...s.input, height: 72, resize: 'none', fontFamily: 'inherit' }}
                placeholder="Calibre, medidas, acabado, notas..."
                value={form.descripcion}
                onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderTop: '1px solid #e2eaf3', marginBottom: 4 }}>
              <span style={{ fontSize: 14, color: '#0B1F3A', fontWeight: 500 }}>Producto activo</span>
              <button
                onClick={() => setForm(f => ({ ...f, activo: !f.activo }))}
                style={{
                  width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
                  background: form.activo ? '#2DD4BF' : '#d3d1c7',
                  position: 'relative', transition: 'background 0.2s',
                }}
              >
                <span style={{
                  position: 'absolute', top: 3,
                  left: form.activo ? 'calc(100% - 18px)' : 3,
                  width: 18, height: 18, borderRadius: '50%', background: '#fff',
                  transition: 'left 0.2s',
                }} />
              </button>
            </div>

            <button
              style={{ ...s.btnPrimary, opacity: cargando ? 0.7 : 1 }}
              onClick={guardarProducto}
              disabled={cargando}
            >
              {cargando ? 'Guardando...' : editandoId ? 'Actualizar producto' : 'Guardar producto'}
            </button>
          </div>
        )}

        {tab === 'csv' && (
          <div>
            <div style={{ background: '#fff', border: '1px solid #e2eaf3', borderRadius: 10, padding: 14, marginBottom: 14 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#0B1F3A', margin: '0 0 8px' }}>Formato del CSV</p>
              <p style={{ fontSize: 12, color: '#4A7BB5', margin: '0 0 6px' }}>Primera fila debe tener estos encabezados:</p>
              <code style={{ display: 'block', background: '#f1f5fb', borderRadius: 6, padding: '8px 10px', fontSize: 12, color: '#1A4B8C', lineHeight: 1.6 }}>
                nombre,tipo,subtipo,unidad,descripcion,activo
              </code>
              <p style={{ fontSize: 11, color: '#4A7BB5', margin: '8px 0 0' }}>
                subtipo: LAF/LAC/GALVANIZADO/ESTAMPADO/CNC (solo para Chapa) — unidad: separá múltiples con | — Ej: Unidad|kg
              </p>
            </div>

            <div
              style={{ border: '2px dashed #4A7BB5', borderRadius: 10, padding: '24px 16px', textAlign: 'center', marginBottom: 14, cursor: 'pointer', background: '#fff' }}
              onClick={() => fileRef.current?.click()}
            >
              <Upload size={28} color="#4A7BB5" style={{ margin: '0 auto 8px' }} />
              <p style={{ fontSize: 14, color: '#1A4B8C', fontWeight: 500, margin: '0 0 4px' }}>Seleccionar archivo CSV</p>
              <p style={{ fontSize: 12, color: '#4A7BB5', margin: 0 }}>tocá para elegir</p>
              <input ref={fileRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={procesarCSV} />
            </div>

            {csvError && (
              <div style={{ background: '#FCEBEB', border: '1px solid #F09595', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#A32D2D', marginBottom: 14 }}>
                {csvError}
              </div>
            )}

            {csvPreview.length > 0 && (
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#0B1F3A', marginBottom: 10 }}>
                  Vista previa — {csvPreview.length} productos
                </p>
                {csvPreview.slice(0, 5).map((p, i) => (
                  <div key={i} style={s.card}>
                    <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 500, color: '#0B1F3A' }}>{p.nombre}</p>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <span style={tipoBadgeStyle}>{p.tipo}</span>
                      {p.subtipo && <span style={{ ...tipoBadgeStyle, background: '#E6F1FB', color: '#185FA5' }}>{p.subtipo}</span>}
                      {p.unidad.map(u => (
                        <span key={u} style={{ ...tipoBadgeStyle, background: '#FAEEDA', color: '#854F0B' }}>{u}</span>
                      ))}
                      <span style={badgeStyle(p.activo)}>{p.activo ? 'Activo' : 'Inactivo'}</span>
                    </div>
                  </div>
                ))}
                {csvPreview.length > 5 && (
                  <p style={{ fontSize: 12, color: '#4A7BB5', textAlign: 'center', marginBottom: 10 }}>
                    ...y {csvPreview.length - 5} más
                  </p>
                )}
                <button
                  style={{ ...s.btnPrimary, opacity: cargando ? 0.7 : 1 }}
                  onClick={importarCSV}
                  disabled={cargando}
                >
                  {cargando ? 'Importando...' : `Importar ${csvPreview.length} productos`}
                </button>
              </div>
            )}
          </div>
        )}

        {tab === 'catalogo' && (
          <div>
            <div style={{ position: 'relative', marginBottom: 14 }}>
              <Search size={16} color="#4A7BB5" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                style={{ ...s.input, paddingLeft: 36 }}
                placeholder="Buscar por nombre o tipo..."
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
              />
            </div>

            {productosFiltrados.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#4A7BB5' }}>
                <p style={{ fontSize: 14 }}>{busqueda ? 'Sin resultados' : 'No hay productos todavía'}</p>
                {!busqueda && (
                  <button
                    onClick={() => setTab('nuevo')}
                    style={{ marginTop: 8, fontSize: 13, color: '#1E6AC8', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Agregar el primero
                  </button>
                )}
              </div>
            )}

            {productosFiltrados.map(p => (
              <div key={p.id} style={{ ...s.card, opacity: p.activo ? 1 : 0.6 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: '0 0 5px', fontSize: 14, fontWeight: 600, color: '#0B1F3A' }}>{p.nombre}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: p.descripcion ? 6 : 0 }}>
                      <span style={tipoBadgeStyle}>{p.tipo}</span>
                      {p.subtipo && <span style={{ ...tipoBadgeStyle, background: '#E6F1FB', color: '#185FA5' }}>{p.subtipo}</span>}
                      {Array.isArray(p.unidad) && p.unidad.map(u => (
                        <span key={u} style={{ ...tipoBadgeStyle, background: '#FAEEDA', color: '#854F0B' }}>{u}</span>
                      ))}
                      <span style={badgeStyle(p.activo)}>{p.activo ? 'Activo' : 'Inactivo'}</span>
                    </div>
                    {p.descripcion && (
                      <p style={{ margin: 0, fontSize: 12, color: '#4A7BB5' }}>{p.descripcion}</p>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                    <button
                      onClick={() => iniciarEdicion(p)}
                      style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', fontSize: 12, border: '1px solid #d1dce8', borderRadius: 6, background: '#fff', color: '#1A4B8C', cursor: 'pointer' }}
                    >
                      <Pencil size={12} /> Editar
                    </button>
                    <button
                      onClick={() => toggleActivo(p)}
                      style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', fontSize: 12, border: `1px solid ${p.activo ? '#F09595' : '#9FE1CB'}`, borderRadius: 6, background: '#fff', color: p.activo ? '#A32D2D' : '#0F6E56', cursor: 'pointer' }}
                    >
                      {p.activo ? <><PowerOff size={12} /> Desactivar</> : <><Power size={12} /> Activar</>}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}