'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

function BanderaArgentina() {
  return (
    <svg width="16" height="11" viewBox="0 0 20 14" style={{ borderRadius: 2, flexShrink: 0 }}>
      <rect width="20" height="4.67" y="0" fill="#74ACDF" />
      <rect width="20" height="4.67" y="4.67" fill="#FFFFFF" />
      <rect width="20" height="4.67" y="9.33" fill="#74ACDF" />
    </svg>
  )
}

export default function MiPanelPage() {
  const router = useRouter()
  const supabase = createClient()

  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [tokens, setTokens] = useState(0)
  const [tokensUsados, setTokensUsados] = useState(0)
  const [precioDolar, setPrecioDolar] = useState(1200)
  const [updatedAt, setUpdatedAt] = useState('')
  const [presupuestos, setPresupuestos] = useState<{ numero_presupuesto: string; created_at: string; total: number; items: { descripcion: string }[] }[]>([])
  const [cargando, setCargando] = useState(true)

  const WA_NUMBER = '5491159396358'
  const PRECIO_TOKEN_USD = 3

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      setEmail(user.email ?? '')

      const { data: profile } = await supabase
        .from('profiles')
        .select('nombre, tokens')
        .eq('id', user.id)
        .single()

      if (profile) {
        setNombre(profile.nombre ?? '')
        setTokens(profile.tokens ?? 0)
      }

      const { data: config } = await supabase
        .from('configuracion')
        .select('precio_dolar, updated_at')
        .eq('id', 1)
        .single()

      if (config) {
        setPrecioDolar(config.precio_dolar)
        const fecha = new Date(config.updated_at)
        setUpdatedAt(fecha.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }))
      }

      const { data: eventos } = await supabase
        .from('eventos_app')
        .select('id')
        .eq('evento', 'calculadora_resultado_visto')
        .eq('fuente', 'directo')

      setTokensUsados(eventos?.length ?? 0)

      const { data: presups } = await supabase
        .from('presupuestos')
        .select('numero_presupuesto, created_at, total, items')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3)

      setPresupuestos(presups ?? [])
      setCargando(false)
    }
    init()
  }, [])

  function handleComprarTokens(cantidad: number) {
    const precioARS = (PRECIO_TOKEN_USD * cantidad * precioDolar).toLocaleString('es-AR')
    const msg = encodeURIComponent(
      `Hola! Quiero comprar ${cantidad} token${cantidad > 1 ? 's' : ''} para mi cuenta.\n\n` +
      `Email: ${email}\n` +
      `Cantidad: ${cantidad} tokens\n` +
      `Total: $${precioARS} ARS (${cantidad * PRECIO_TOKEN_USD} USD)\n\n` +
      `Por favor confirmen para coordinar el pago. Gracias!`
    )
    window.open(`https://wa.me/${WA_NUMBER}?text=${msg}`, '_blank')
  }

  const iniciales = nombre
    ? nombre.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : email.slice(0, 2).toUpperCase()

  const totalTokens = tokens + tokensUsados
  const porcentaje = totalTokens > 0 ? Math.round((tokens / totalTokens) * 100) : 0

  if (cargando) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0B1F3A' }}>
      <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#2DD4BF', borderTopColor: 'transparent' }} />
    </div>
  )

  return (
    <main className="min-h-screen pb-24" style={{ background: '#0B1F3A', fontFamily: "'DM Sans', sans-serif" }}>

      {/* HEADER */}
      <div style={{ background: '#0B1F3A', padding: '40px 16px 12px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '0.5px solid rgba(45,212,191,0.2)' }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: '#1A4B8C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 14, color: '#2DD4BF', flexShrink: 0 }}>
          {iniciales}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#F7FAFF' }}>Hola, {nombre || email}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
            <BanderaArgentina />
            <p style={{ margin: 0, fontSize: 11, color: 'rgba(247,250,255,0.5)' }}>La Cooperativa Metalúrgica Argentina</p>
          </div>
        </div>
        <div style={{ background: 'rgba(45,212,191,0.12)', border: '0.5px solid rgba(45,212,191,0.4)', borderRadius: 20, padding: '4px 12px' }}>
          <span style={{ fontSize: 12, color: '#2DD4BF', fontWeight: 600 }}>{tokens} tokens</span>
        </div>
      </div>

      <div style={{ padding: '16px', maxWidth: 480, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* TOKENS CARD */}
        <div style={{ background: 'rgba(11,31,58,0.8)', border: '0.5px solid rgba(30,106,200,0.4)', borderRadius: 16, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <p style={{ margin: 0, fontSize: 12, color: 'rgba(247,250,255,0.5)', textTransform: 'uppercase', letterSpacing: 1 }}>Tus tokens</p>
              <p style={{ margin: '4px 0 0', fontSize: 36, fontWeight: 700, color: '#F7FAFF', lineHeight: 1 }}>{tokens}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: 0, fontSize: 11, color: 'rgba(247,250,255,0.4)' }}>Usados este mes</p>
              <p style={{ margin: '2px 0 0', fontSize: 20, fontWeight: 600, color: 'rgba(247,250,255,0.6)' }}>{tokensUsados}</p>
            </div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 6, height: 8, marginBottom: 8, overflow: 'hidden' }}>
            <div style={{ background: '#2DD4BF', height: '100%', width: `${porcentaje}%`, borderRadius: 6, transition: 'width 0.5s' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <span style={{ fontSize: 11, color: 'rgba(247,250,255,0.4)' }}>{tokens} disponibles</span>
            <span style={{ fontSize: 11, color: 'rgba(247,250,255,0.4)' }}>{totalTokens} total</span>
          </div>

          {/* COMO GANAR MAS */}
          <div style={{ background: 'rgba(45,212,191,0.06)', border: '0.5px solid rgba(45,212,191,0.2)', borderRadius: 10, padding: 12 }}>
            <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 600, color: '#2DD4BF' }}>Ganá más tokens comprando</p>
            {[
              { label: 'Compra pequeña', tokens: 10 },
              { label: 'Compra mediana', tokens: 20 },
              { label: 'Compra por tonelada', tokens: 30 },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: 'rgba(247,250,255,0.5)' }}>{item.label}</span>
                <span style={{ fontSize: 11, color: '#2DD4BF', fontWeight: 600 }}>+{item.tokens} tokens</span>
              </div>
            ))}
          </div>
        </div>

        {/* ACCIONES RAPIDAS */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <button onClick={() => router.push('/calculadora')}
            style={{ background: 'rgba(30,106,200,0.15)', border: '0.5px solid rgba(30,106,200,0.4)', borderRadius: 14, padding: 16, cursor: 'pointer', textAlign: 'left' }}>
            <div style={{ width: 32, height: 32, background: 'rgba(30,106,200,0.2)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1E6AC8" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
            </div>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#F7FAFF' }}>Nueva calculadora</p>
            <p style={{ margin: '2px 0 0', fontSize: 11, color: 'rgba(247,250,255,0.4)' }}>Usa 1 token</p>
          </button>
          <button onClick={() => router.push('/mis-presupuestos')}
            style={{ background: 'rgba(45,212,191,0.08)', border: '0.5px solid rgba(45,212,191,0.3)', borderRadius: 14, padding: 16, cursor: 'pointer', textAlign: 'left' }}>
            <div style={{ width: 32, height: 32, background: 'rgba(45,212,191,0.12)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2DD4BF" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            </div>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#F7FAFF' }}>Mis presupuestos</p>
            <p style={{ margin: '2px 0 0', fontSize: 11, color: 'rgba(247,250,255,0.4)' }}>{presupuestos.length} guardados</p>
          </button>
        </div>

        {/* ULTIMOS PRESUPUESTOS */}
        {presupuestos.length > 0 && (
          <div style={{ background: 'rgba(11,31,58,0.8)', border: '0.5px solid rgba(74,123,181,0.25)', borderRadius: 16, padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#F7FAFF' }}>Últimos presupuestos</p>
              <button onClick={() => router.push('/mis-presupuestos')} style={{ background: 'none', border: 'none', fontSize: 11, color: '#2DD4BF', cursor: 'pointer', padding: 0 }}>Ver todos</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {presupuestos.map(p => (
                <div key={p.numero_presupuesto} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 10, background: 'rgba(255,255,255,0.04)', borderRadius: 10 }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 13, color: '#F7FAFF' }}>{p.numero_presupuesto}</p>
                    <p style={{ margin: 0, fontSize: 11, color: 'rgba(247,250,255,0.4)' }}>
                      {p.items?.[0]?.descripcion ?? '—'} · {new Date(p.created_at).toLocaleDateString('es-AR')}
                    </p>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#2DD4BF' }}>${p.total.toLocaleString('es-AR')}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* COMPRAR TOKENS */}
        <div style={{ background: 'rgba(11,31,58,0.8)', border: '0.5px solid rgba(250,199,117,0.3)', borderRadius: 16, padding: 16 }}>
          <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 600, color: '#FAC775' }}>Comprá más tokens</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
            <span style={{ fontSize: 12, color: 'rgba(250,199,117,0.7)' }}>
              USD 3 c/u = ${(PRECIO_TOKEN_USD * precioDolar).toLocaleString('es-AR')} ARS
            </span>
            <BanderaArgentina />
          </div>
          {updatedAt && (
            <p style={{ margin: '0 0 14px', fontSize: 10, color: 'rgba(247,250,255,0.3)' }}>
              Cotización actualizada: {updatedAt}
            </p>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            {[5, 10, 20].map(cantidad => (
              <button key={cantidad} onClick={() => handleComprarTokens(cantidad)}
                style={{ background: 'rgba(250,199,117,0.1)', border: '0.5px solid rgba(250,199,117,0.35)', borderRadius: 10, padding: '10px 8px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#FAC775' }}>{cantidad}</span>
                <span style={{ fontSize: 10, color: 'rgba(250,199,117,0.6)' }}>tokens</span>
                <span style={{ fontSize: 10, color: 'rgba(250,199,117,0.8)', marginTop: 2 }}>
                  ${(PRECIO_TOKEN_USD * cantidad * precioDolar).toLocaleString('es-AR')}
                </span>
              </button>
            ))}
          </div>
          <p style={{ margin: '12px 0 0', fontSize: 10, color: 'rgba(247,250,255,0.3)', textAlign: 'center' }}>
            Al tocar te abre WhatsApp para coordinar el pago
          </p>
        </div>

      </div>

      {/* NAV BAR */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(11,31,58,0.97)', borderTop: '0.5px solid rgba(45,212,191,0.2)', padding: '10px 0', display: 'flex', justifyContent: 'space-around' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2DD4BF" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
          <span style={{ fontSize: 10, color: '#2DD4BF', fontWeight: 600 }}>Mi panel</span>
        </div>
        <button onClick={() => router.push('/calculadora')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(247,250,255,0.4)" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/></svg>
          <span style={{ fontSize: 10, color: 'rgba(247,250,255,0.4)' }}>Calculadora</span>
        </button>
        <button onClick={() => router.push('/mis-presupuestos')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(247,250,255,0.4)" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg>
          <span style={{ fontSize: 10, color: 'rgba(247,250,255,0.4)' }}>Presupuestos</span>
        </button>
        <button onClick={() => router.push('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(247,250,255,0.4)" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
          <span style={{ fontSize: 10, color: 'rgba(247,250,255,0.4)' }}>Perfil</span>
        </button>
      </div>

    </main>
  )
}