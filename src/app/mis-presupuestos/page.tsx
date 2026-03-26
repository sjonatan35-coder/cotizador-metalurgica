'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Presupuesto = {
  id: string
  numero_presupuesto: string
  created_at: string
  total: number
  estado: string
  items: { descripcion: string }[]
  cliente_nombre: string
  validez_dias: number
}

export default function MisPresupuestosPage() {
  const router = useRouter()
  const supabase = createClient()

  const [presupuestos, setPresupuestos] = useState<Presupuesto[]>([])
  const [tokens, setTokens] = useState(0)
  const [cargando, setCargando] = useState(true)

  const WA_NUMBER = '5491159396358'

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: profile } = await supabase
        .from('profiles')
        .select('tokens')
        .eq('id', user.id)
        .single()
      if (profile) setTokens(profile.tokens ?? 0)

      const { data } = await supabase
        .from('presupuestos')
        .select('id, numero_presupuesto, created_at, total, estado, items, cliente_nombre, validez_dias')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      setPresupuestos(data ?? [])
      setCargando(false)
    }
    init()
  }, [])

  function handleWhatsApp(p: Presupuesto) {
    const itemsTexto = p.items
      ?.filter(i => i.descripcion?.trim())
      .map(i => `• ${i.descripcion}`)
      .join('\n') ?? ''
    const msg = encodeURIComponent(
      `Hola! Les comparto mi presupuesto ${p.numero_presupuesto}\n\n` +
      `${itemsTexto}\n\n` +
      `Total: $${p.total.toLocaleString('es-AR')}\n` +
      `Válido por ${p.validez_dias} día${p.validez_dias !== 1 ? 's' : ''}.\n\n` +
      `Por favor confirmen disponibilidad y precio. Gracias!`
    )
    window.open(`https://wa.me/${WA_NUMBER}?text=${msg}`, '_blank')
  }

  function handleNuevo() {
    router.push('/presupuestos/nuevo')
  }

  const totalCotizado = presupuestos.reduce((acc, p) => acc + p.total, 0)
  const esteMes = presupuestos.filter(p => {
    const fecha = new Date(p.created_at)
    const ahora = new Date()
    return fecha.getMonth() === ahora.getMonth() && fecha.getFullYear() === ahora.getFullYear()
  }).length

  const colorEstado = (estado: string) => {
    if (estado === 'enviado') return { bg: 'rgba(45,212,191,0.12)', border: 'rgba(45,212,191,0.3)', color: '#2DD4BF', label: 'Enviado' }
    if (estado === 'borrador') return { bg: 'rgba(250,199,117,0.12)', border: 'rgba(250,199,117,0.3)', color: '#FAC775', label: 'Borrador' }
    return { bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.1)', color: 'rgba(247,250,255,0.5)', label: estado }
  }

  if (cargando) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0B1F3A' }}>
      <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#2DD4BF', borderTopColor: 'transparent' }} />
    </div>
  )

  return (
    <main className="min-h-screen pb-24" style={{ background: '#0B1F3A', fontFamily: "'DM Sans', sans-serif" }}>

      {/* HEADER */}
      <div style={{ background: '#0B1F3A', padding: '40px 16px 12px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '0.5px solid rgba(45,212,191,0.2)' }}>
        <button onClick={() => router.push('/mi-panel')}
          style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(247,250,255,0.7)" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        </button>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#F7FAFF' }}>Mis presupuestos</p>
          <p style={{ margin: 0, fontSize: 11, color: 'rgba(247,250,255,0.4)' }}>{presupuestos.length} guardados</p>
        </div>
        <button onClick={handleNuevo}
          style={{ background: 'rgba(30,106,200,0.2)', border: '0.5px solid rgba(30,106,200,0.4)', borderRadius: 10, padding: '6px 12px', cursor: 'pointer' }}>
          <span style={{ fontSize: 12, color: '#1E6AC8', fontWeight: 600 }}>+ Nuevo</span>
        </button>
      </div>

      <div style={{ padding: '16px', maxWidth: 480, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* STATS */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div style={{ background: 'rgba(11,31,58,0.8)', border: '0.5px solid rgba(30,106,200,0.3)', borderRadius: 12, padding: 14 }}>
            <p style={{ margin: 0, fontSize: 11, color: 'rgba(247,250,255,0.4)', textTransform: 'uppercase', letterSpacing: 1 }}>Total cotizado</p>
            <p style={{ margin: '4px 0 0', fontSize: 18, fontWeight: 700, color: '#F7FAFF' }}>${totalCotizado.toLocaleString('es-AR')}</p>
          </div>
          <div style={{ background: 'rgba(11,31,58,0.8)', border: '0.5px solid rgba(45,212,191,0.3)', borderRadius: 12, padding: 14 }}>
            <p style={{ margin: 0, fontSize: 11, color: 'rgba(247,250,255,0.4)', textTransform: 'uppercase', letterSpacing: 1 }}>Este mes</p>
            <p style={{ margin: '4px 0 0', fontSize: 20, fontWeight: 700, color: '#2DD4BF' }}>{esteMes}</p>
          </div>
        </div>

        {/* LISTA */}
        {presupuestos.length === 0 ? (
          <div style={{ background: 'rgba(11,31,58,0.8)', border: '0.5px solid rgba(74,123,181,0.25)', borderRadius: 14, padding: 32, textAlign: 'center' }}>
            <p style={{ margin: '0 0 8px', fontSize: 14, color: 'rgba(247,250,255,0.5)' }}>No tenés presupuestos guardados</p>
            <button onClick={handleNuevo}
              style={{ background: '#1E6AC8', border: 'none', borderRadius: 10, padding: '10px 20px', cursor: 'pointer' }}>
              <span style={{ fontSize: 13, color: '#F7FAFF', fontWeight: 600 }}>Crear el primero</span>
            </button>
          </div>
        ) : (
          presupuestos.map(p => {
            const estado = colorEstado(p.estado)
            return (
              <div key={p.id} style={{ background: 'rgba(11,31,58,0.8)', border: '0.5px solid rgba(74,123,181,0.25)', borderRadius: 14, padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#F7FAFF' }}>{p.numero_presupuesto}</p>
                    <p style={{ margin: '2px 0 0', fontSize: 11, color: 'rgba(247,250,255,0.4)' }}>
                      {new Date(p.created_at).toLocaleDateString('es-AR')} · {p.items?.length ?? 0} ítem{(p.items?.length ?? 0) !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: '#2DD4BF' }}>${p.total.toLocaleString('es-AR')}</span>
                    <span style={{ background: estado.bg, border: `0.5px solid ${estado.border}`, borderRadius: 20, padding: '2px 8px', fontSize: 10, color: estado.color }}>
                      {estado.label}
                    </span>
                  </div>
                </div>

                {p.items?.[0]?.descripcion && (
                  <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '8px 10px', marginBottom: 10 }}>
                    <p style={{ margin: 0, fontSize: 12, color: 'rgba(247,250,255,0.6)' }}>
                      {p.items[0].descripcion}
                      {p.items.length > 1 && <span style={{ color: 'rgba(247,250,255,0.3)' }}> +{p.items.length - 1} más</span>}
                    </p>
                  </div>
                )}

                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => handleWhatsApp(p)}
                    style={{ flex: 1, background: 'rgba(37,211,102,0.1)', border: '0.5px solid rgba(37,211,102,0.3)', borderRadius: 8, padding: 8, cursor: 'pointer' }}>
                    <span style={{ fontSize: 11, color: '#25D366', fontWeight: 600 }}>WhatsApp</span>
                  </button>
                  <button onClick={() => router.push(`/presupuestos/nuevo?clone=${p.id}`)}
                    style={{ flex: 1, background: 'rgba(30,106,200,0.1)', border: '0.5px solid rgba(30,106,200,0.3)', borderRadius: 8, padding: 8, cursor: 'pointer' }}>
                    <span style={{ fontSize: 11, color: '#1E6AC8', fontWeight: 600 }}>Duplicar</span>
                  </button>
                </div>
              </div>
            )
          })
        )}

        {/* BANNER TOKENS */}
        <div style={{ background: 'rgba(30,106,200,0.08)', border: '0.5px solid rgba(30,106,200,0.25)', borderRadius: 12, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1E6AC8" strokeWidth="2" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <p style={{ margin: 0, fontSize: 11, color: 'rgba(247,250,255,0.5)' }}>
            Cada presupuesto generado usa <strong style={{ color: '#1E6AC8' }}>1 token</strong>. Te quedan <strong style={{ color: '#2DD4BF' }}>{tokens} tokens</strong>.
          </p>
        </div>

      </div>

      {/* NAV BAR */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(11,31,58,0.97)', borderTop: '0.5px solid rgba(45,212,191,0.2)', padding: '10px 0', display: 'flex', justifyContent: 'space-around' }}>
        <button onClick={() => router.push('/mi-panel')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(247,250,255,0.4)" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
          <span style={{ fontSize: 10, color: 'rgba(247,250,255,0.4)' }}>Mi panel</span>
        </button>
        <button onClick={() => router.push('/calculadora')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(247,250,255,0.4)" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/></svg>
          <span style={{ fontSize: 10, color: 'rgba(247,250,255,0.4)' }}>Calculadora</span>
        </button>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2DD4BF" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg>
          <span style={{ fontSize: 10, color: '#2DD4BF', fontWeight: 600 }}>Presupuestos</span>
        </div>
        <button onClick={() => router.push('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(247,250,255,0.4)" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
          <span style={{ fontSize: 10, color: 'rgba(247,250,255,0.4)' }}>Perfil</span>
        </button>
      </div>

    </main>
  )
}