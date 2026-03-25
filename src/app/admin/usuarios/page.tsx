'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Check, X, Search, Shield, ChevronDown } from 'lucide-react'

type Usuario = {
  id: string
  nombre: string | null
  telefono: string | null
  rol: string
  created_at: string
}

const ROLES = ['ADMIN', 'SELLER', 'WAREHOUSE', 'DRIVER']

const rolColor: Record<string, { bg: string; color: string }> = {
  ADMIN:     { bg: '#EEEDFE', color: '#3C3489' },
  SELLER:    { bg: '#E1F5EE', color: '#0F6E56' },
  WAREHOUSE: { bg: '#FAEEDA', color: '#854F0B' },
  DRIVER:    { bg: '#E6F1FB', color: '#185FA5' },
  'sin rol': { bg: '#F1EFE8', color: '#5F5E5A' },
}

export default function AdminUsuarios() {
  const supabase = createClient()
  const router = useRouter()

  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [cargando, setCargando] = useState(true)
  const [mensaje, setMensaje] = useState<{ texto: string; tipo: 'ok' | 'error' } | null>(null)
  const [cambiandoRolId, setCambiandoRolId] = useState<string | null>(null)

  const mostrarMensaje = (texto: string, tipo: 'ok' | 'error') => {
    setMensaje({ texto, tipo })
    setTimeout(() => setMensaje(null), 3500)
  }

  const cargarUsuarios = async () => {
    setCargando(true)
    const { data, error } = await supabase
      .from('profiles')
      .select('id, nombre, telefono, rol, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      mostrarMensaje('Error al cargar usuarios', 'error')
    } else {
      setUsuarios(data || [])
    }
    setCargando(false)
  }

  useEffect(() => { cargarUsuarios() }, [])

  const cambiarRol = async (usuarioId: string, nuevoRol: string) => {
    setCambiandoRolId(usuarioId)
    const { error } = await supabase
      .from('profiles')
      .update({ rol: nuevoRol })
      .eq('id', usuarioId)

    if (error) {
      mostrarMensaje('Error: ' + error.message, 'error')
    } else {
      mostrarMensaje('Rol actualizado', 'ok')
      await cargarUsuarios()
    }
    setCambiandoRolId(null)
  }

  const usuariosFiltrados = usuarios.filter(u =>
    u.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    u.rol?.toLowerCase().includes(busqueda.toLowerCase()) ||
    u.telefono?.includes(busqueda)
  )

  const s = {
    page: { minHeight: '100vh', background: '#0B1F3A', fontFamily: "'DM Sans', sans-serif" } as React.CSSProperties,
    header: { background: '#0B1F3A', borderBottom: '1px solid rgba(247,250,255,0.08)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 } as React.CSSProperties,
    body: { background: '#f7faff', minHeight: 'calc(100vh - 56px)', padding: '16px' } as React.CSSProperties,
    input: { width: '100%', boxSizing: 'border-box' as const, padding: '10px 12px', fontSize: 14, border: '1px solid #d1dce8', borderRadius: 8, background: '#fff', color: '#0B1F3A', outline: 'none' } as React.CSSProperties,
    card: { background: '#fff', borderRadius: 10, border: '1px solid #e2eaf3', padding: '14px', marginBottom: 10 } as React.CSSProperties,
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
          <div style={{ color: '#F7FAFF', fontSize: 15, fontWeight: 600 }}>Usuarios</div>
          <div style={{ color: '#2DD4BF', fontSize: 11 }}>Panel Admin</div>
        </div>
        <div style={{ width: 70 }} />
      </div>

      <div style={s.body}>

        <div style={{ position: 'relative', marginBottom: 14 }}>
          <Search size={16} color="#4A7BB5" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            style={{ ...s.input, paddingLeft: 36 }}
            placeholder="Buscar por nombre, rol o teléfono..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
        </div>

        <div style={{ fontSize: 12, color: '#4A7BB5', marginBottom: 12 }}>
          {cargando ? 'Cargando...' : `${usuariosFiltrados.length} usuario${usuariosFiltrados.length !== 1 ? 's' : ''}`}
        </div>

        {!cargando && usuariosFiltrados.map(u => {
          const rc = rolColor[u.rol] || rolColor['sin rol']
          const inicial = u.nombre?.charAt(0).toUpperCase() || '?'

          return (
            <div key={u.id} style={s.card}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>

                <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#E6F1FB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 600, color: '#185FA5', flexShrink: 0 }}>
                  {inicial}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: '0 0 2px', fontSize: 14, fontWeight: 600, color: '#0B1F3A' }}>
                    {u.nombre || 'Sin nombre'}
                  </p>

                  {u.telefono && (
                    <p style={{ margin: '0 0 4px', fontSize: 12, color: '#4A7BB5' }}>{u.telefono}</p>
                  )}

                  <p style={{ margin: '0 0 8px', fontSize: 11, color: '#B4B2A9' }}>
                    Registrado {new Date(u.created_at).toLocaleDateString('es-AR')}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 99, background: rc.bg, color: rc.color, fontWeight: 600 }}>
                      {u.rol}
                    </span>
                    <div style={{ position: 'relative' }}>
                      <select
                        value={u.rol}
                        disabled={cambiandoRolId === u.id}
                        onChange={e => cambiarRol(u.id, e.target.value)}
                        style={{ fontSize: 12, padding: '4px 24px 4px 8px', border: '1px solid #d1dce8', borderRadius: 6, background: '#fff', color: '#0B1F3A', outline: 'none', cursor: 'pointer', appearance: 'none' }}
                      >
                        <option value="" disabled>Cambiar rol...</option>
                        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                      <ChevronDown size={12} color="#4A7BB5" style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    </div>
                    {cambiandoRolId === u.id && (
                      <span style={{ fontSize: 11, color: '#4A7BB5' }}>Guardando...</span>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )
        })}

        {!cargando && usuariosFiltrados.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#4A7BB5' }}>
            <Shield size={32} color="#d1dce8" style={{ margin: '0 auto 8px' }} />
            <p style={{ fontSize: 14 }}>{busqueda ? 'Sin resultados' : 'No hay usuarios todavía'}</p>
          </div>
        )}

      </div>
    </div>
  )
}