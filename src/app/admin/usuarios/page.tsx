'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Check, X, Search, Shield, ChevronDown, UserPlus, Mail } from 'lucide-react'

type Usuario = {
  id: string
  nombre: string | null
  telefono: string | null
  rol: string
  created_at: string
  invitacion_pendiente: boolean | null
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

  // Modal invitar
  const [modalInvitar, setModalInvitar] = useState(false)
  const [invEmail, setInvEmail] = useState('')
  const [invRol, setInvRol] = useState('SELLER')
  const [invitando, setInvitando] = useState(false)

  const mostrarMensaje = (texto: string, tipo: 'ok' | 'error') => {
    setMensaje({ texto, tipo })
    setTimeout(() => setMensaje(null), 3500)
  }

  const cargarUsuarios = async () => {
    setCargando(true)
    const { data, error } = await supabase
      .from('profiles')
      .select('id, nombre, telefono, rol, created_at, invitacion_pendiente')
      .order('created_at', { ascending: false })
    if (error) mostrarMensaje('Error al cargar usuarios', 'error')
    else setUsuarios(data || [])
    setCargando(false)
  }

  useEffect(() => { cargarUsuarios() }, [])

  const cambiarRol = async (usuarioId: string, nuevoRol: string) => {
    setCambiandoRolId(usuarioId)
    const { error } = await supabase
      .from('profiles')
      .update({ rol: nuevoRol })
      .eq('id', usuarioId)
    if (error) mostrarMensaje('Error: ' + error.message, 'error')
    else { mostrarMensaje('Rol actualizado', 'ok'); await cargarUsuarios() }
    setCambiandoRolId(null)
  }

  const invitarUsuario = async () => {
    if (!invEmail.trim()) { mostrarMensaje('El email es obligatorio', 'error'); return }
    setInvitando(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/admin/usuarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ email: invEmail.trim(), rol: invRol }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      mostrarMensaje(`Invitación enviada a ${invEmail}`, 'ok')
      setModalInvitar(false)
      setInvEmail('')
      setInvRol('SELLER')
      await cargarUsuarios()
    } catch (err: unknown) {
      mostrarMensaje(err instanceof Error ? err.message : 'Error al invitar', 'error')
    } finally {
      setInvitando(false)
    }
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

      {/* Toast mensaje */}
      {mensaje && (
        <div style={{ position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 9999, background: mensaje.tipo === 'ok' ? '#0F6E56' : '#A32D2D', color: '#fff', padding: '10px 20px', borderRadius: 8, fontSize: 14, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
          {mensaje.tipo === 'ok' ? <Check size={16} /> : <X size={16} />}
          {mensaje.texto}
        </div>
      )}

      {/* Modal invitar */}
      {modalInvitar && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(11,31,58,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, width: '100%', maxWidth: 360 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0B1F3A' }}>Invitar usuario</p>
                <p style={{ margin: 0, fontSize: 12, color: '#4A7BB5' }}>Recibirá un email para registrarse</p>
              </div>
              <button onClick={() => setModalInvitar(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4A7BB5' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, color: '#4A7BB5', display: 'block', marginBottom: 6 }}>Email *</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="#4A7BB5" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  placeholder="vendedor@ejemplo.com"
                  value={invEmail}
                  onChange={e => setInvEmail(e.target.value)}
                  style={{ ...s.input, paddingLeft: 36 }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, color: '#4A7BB5', display: 'block', marginBottom: 6 }}>Rol</label>
              <select value={invRol} onChange={e => setInvRol(e.target.value)}
                style={{ ...s.input, cursor: 'pointer' }}>
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button onClick={() => setModalInvitar(false)}
                style={{ padding: '12px', borderRadius: 8, border: '1px solid #d1dce8', background: '#fff', color: '#4A7BB5', fontSize: 14, cursor: 'pointer', fontWeight: 500 }}>
                Cancelar
              </button>
              <button onClick={invitarUsuario} disabled={invitando}
                style={{ padding: '12px', borderRadius: 8, border: 'none', background: invitando ? '#4A7BB5' : '#1E6AC8', color: '#fff', fontSize: 14, cursor: 'pointer', fontWeight: 600 }}>
                {invitando ? 'Enviando...' : 'Invitar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={s.header}>
        <button onClick={() => router.push('/admin/productos')} style={{ background: 'none', border: 'none', color: '#2DD4BF', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, padding: 0 }}>
          <ArrowLeft size={16} /> Productos
        </button>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ color: '#F7FAFF', fontSize: 15, fontWeight: 600 }}>Usuarios</div>
          <div style={{ color: '#2DD4BF', fontSize: 11 }}>Panel Admin</div>
        </div>
        <button onClick={() => setModalInvitar(true)}
          style={{ background: '#1E6AC8', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, padding: '6px 12px', borderRadius: 8, fontWeight: 600 }}>
          <UserPlus size={14} /> Invitar
        </button>
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
          const pendiente = u.invitacion_pendiente === true

          return (
            <div key={u.id} style={{ ...s.card, opacity: pendiente ? 0.8 : 1 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: pendiente ? '#F1EFE8' : '#E6F1FB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 600, color: pendiente ? '#888780' : '#185FA5', flexShrink: 0 }}>
                  {pendiente ? <Mail size={18} /> : inicial}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#0B1F3A' }}>
                      {u.nombre || 'Sin nombre'}
                    </p>
                    {pendiente && (
                      <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 99, background: '#FAEEDA', color: '#854F0B', fontWeight: 600 }}>
                        Pendiente
                      </span>
                    )}
                  </div>
                  {u.telefono && <p style={{ margin: '0 0 4px', fontSize: 12, color: '#4A7BB5' }}>{u.telefono}</p>}
                  <p style={{ margin: '0 0 8px', fontSize: 11, color: '#B4B2A9' }}>
                    {pendiente ? 'Invitación enviada' : `Registrado ${new Date(u.created_at).toLocaleDateString('es-AR')}`}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 99, background: rc.bg, color: rc.color, fontWeight: 600 }}>
                      {u.rol}
                    </span>
                    <div style={{ position: 'relative' }}>
                      <select value={u.rol} disabled={cambiandoRolId === u.id}
                        onChange={e => cambiarRol(u.id, e.target.value)}
                        style={{ fontSize: 12, padding: '4px 24px 4px 8px', border: '1px solid #d1dce8', borderRadius: 6, background: '#fff', color: '#0B1F3A', outline: 'none', cursor: 'pointer', appearance: 'none' }}>
                        <option value="" disabled>Cambiar rol...</option>
                        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                      <ChevronDown size={12} color="#4A7BB5" style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    </div>
                    {cambiandoRolId === u.id && <span style={{ fontSize: 11, color: '#4A7BB5' }}>Guardando...</span>}
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