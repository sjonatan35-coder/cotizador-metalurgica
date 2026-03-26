'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, Loader2, FileText, Calculator, MessageCircle } from 'lucide-react'

export default function LoginPage() {
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingReset, setLoadingReset] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resetSent, setResetSent] = useState(false)
  const [showReset, setShowReset] = useState(false)
  const [resetEmail, setResetEmail] = useState('')

  // Captación UTM silenciosa
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const source = params.get('utm_source')
    const medium = params.get('utm_medium')
    const campaign = params.get('utm_campaign')
    if (source) {
      localStorage.setItem('metalurgica_utm', JSON.stringify({
        source, medium, campaign, capturedAt: new Date().toISOString()
      }))
    }
  }, [])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      if (error.message.includes('Invalid login')) {
        setError('Email o contraseña incorrectos. ¿No tenés cuenta?')
      } else {
        setError('Ocurrió un error. Intentá de nuevo.')
      }
      setLoading(false)
      return
    }
    const params = new URLSearchParams(window.location.search)
    const redirectTo = params.get('redirectTo') || '/clientes'
    window.location.replace(redirectTo)
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setLoadingReset(true)
    setError(null)
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/auth/callback`,
    })
    if (error) { setError('Error al enviar el email. Verificá la dirección.'); setLoadingReset(false); return }
    setResetSent(true)
    setLoadingReset(false)
  }

  const inputStyle = {
    height: '48px',
    background: 'rgba(247,250,255,0.07)',
    border: '1px solid rgba(74,123,181,0.3)',
    color: '#F7FAFF',
    fontSize: '15px'
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-10 relative overflow-hidden" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(/fabrica.jpeg)' }} />
        <div className="absolute inset-0" style={{ background: 'rgba(11,31,58,0.70)' }} />
      </div>

      <div className="relative z-10 w-full max-w-sm flex flex-col gap-6">

        {/* Logo + nombre */}
        <div className="flex flex-col items-center gap-3 text-center">
          <img
            src="/logo.jpg"
            alt="La Cooperativa Metalúrgica Argentina"
            className="w-20 h-20 rounded-2xl object-cover cursor-pointer"
            style={{ border: '2px solid rgba(74,123,181,0.4)' }}
            onClick={() => window.location.href = '/'}
          />
          <div>
            <h1 className="font-semibold leading-snug" style={{ color: '#F7FAFF', fontSize: '18px' }}>
              La Cooperativa Metalúrgica Argentina
            </h1>
            <p style={{ color: 'rgba(247,250,255,0.5)', fontSize: '13px', marginTop: '4px' }}>🇦🇷 Villa Lugano, CABA</p>
          </div>
        </div>

        {/* Beneficios */}
        <div className="flex justify-between gap-2">
          {[
            { icon: <FileText size={16} />, text: 'Guardá presupuestos' },
            { icon: <Calculator size={16} />, text: 'Historial de cálculos' },
            { icon: <MessageCircle size={16} />, text: 'Pedidos por WhatsApp' },
          ].map((b, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 rounded-xl py-3 px-2 text-center"
              style={{ background: 'rgba(30,106,200,0.15)', border: '1px solid rgba(30,106,200,0.2)' }}>
              <span style={{ color: '#2DD4BF' }}>{b.icon}</span>
              <span style={{ color: 'rgba(247,250,255,0.7)', fontSize: '11px', lineHeight: '1.3' }}>{b.text}</span>
            </div>
          ))}
        </div>

        {/* Card principal */}
        <div className="flex flex-col gap-5 rounded-2xl px-6 py-7"
          style={{ background: 'rgba(11,31,58,0.75)', backdropFilter: 'blur(14px)', border: '1px solid rgba(74,123,181,0.25)' }}>

          {!showReset ? (
            <>
              <p className="text-center tracking-widest uppercase" style={{ color: 'rgba(247,250,255,0.5)', fontSize: '11px' }}>
                Guardá tus presupuestos gratis
              </p>

              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label style={{ color: 'rgba(247,250,255,0.7)', fontSize: '13px' }}>Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="usuario@ejemplo.com" required
                    className="w-full rounded-xl px-4 outline-none transition-all"
                    style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = 'rgba(30,106,200,0.6)')}
                    onBlur={e => (e.target.style.borderColor = 'rgba(74,123,181,0.3)')} />
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label style={{ color: 'rgba(247,250,255,0.7)', fontSize: '13px' }}>Contraseña</label>
                    <button type="button" onClick={() => { setShowReset(true); setResetEmail(email) }}
                      style={{ color: '#2DD4BF', fontSize: '12px' }}>
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Tu contraseña" required
                      className="w-full rounded-xl px-4 pr-12 outline-none transition-all"
                      style={inputStyle}
                      onFocus={e => (e.target.style.borderColor = 'rgba(30,106,200,0.6)')}
                      onBlur={e => (e.target.style.borderColor = 'rgba(74,123,181,0.3)')} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2"
                      style={{ color: 'rgba(45,212,191,0.7)' }}>
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="rounded-xl px-4 py-3 text-center"
                    style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.3)', color: '#FCA5A5', fontSize: '13px' }}>
                    {error}
                    {error.includes('No tenés cuenta') && (
                      <a href="/registro" style={{ color: '#2DD4BF', marginLeft: '4px', fontWeight: 500 }}>
                        Registrate gratis
                      </a>
                    )}
                  </div>
                )}

                <button type="submit" disabled={loading}
                  className="w-full rounded-xl font-semibold flex items-center justify-center gap-2"
                  style={{ height: '48px', background: '#1E6AC8', color: '#F7FAFF', fontSize: '15px', opacity: loading ? 0.7 : 1 }}>
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  {loading ? 'Ingresando...' : 'Ingresar'}
                </button>
              </form>
            </>
          ) : (
            <>
              <button onClick={() => { setShowReset(false); setResetSent(false); setError(null) }}
                className="flex items-center gap-2 text-sm"
                style={{ color: 'rgba(247,250,255,0.5)' }}>
                ← Volver al login
              </button>

              {!resetSent ? (
                <>
                  <p className="text-center" style={{ color: 'rgba(247,250,255,0.7)', fontSize: '14px' }}>
                    Te mandamos un link para restablecer tu contraseña
                  </p>
                  <form onSubmit={handleReset} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <label style={{ color: 'rgba(247,250,255,0.7)', fontSize: '13px' }}>Email</label>
                      <input type="email" value={resetEmail} onChange={e => setResetEmail(e.target.value)}
                        placeholder="usuario@ejemplo.com" required
                        className="w-full rounded-xl px-4 outline-none"
                        style={inputStyle} />
                    </div>
                    {error && (
                      <div className="rounded-xl px-4 py-3 text-center"
                        style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.3)', color: '#FCA5A5', fontSize: '13px' }}>
                        {error}
                      </div>
                    )}
                    <button type="submit" disabled={loadingReset}
                      className="w-full rounded-xl font-semibold flex items-center justify-center gap-2"
                      style={{ height: '48px', background: '#1E6AC8', color: '#F7FAFF', fontSize: '15px', opacity: loadingReset ? 0.7 : 1 }}>
                      {loadingReset && <Loader2 size={16} className="animate-spin" />}
                      {loadingReset ? 'Enviando...' : 'Enviar link'}
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex flex-col items-center gap-4 py-4 text-center">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(45,212,191,0.15)', border: '1px solid rgba(45,212,191,0.4)' }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2DD4BF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <p style={{ color: '#F7FAFF', fontSize: '15px', fontWeight: 600 }}>¡Email enviado!</p>
                  <p style={{ color: 'rgba(247,250,255,0.6)', fontSize: '13px', lineHeight: '1.5' }}>
                    Revisá tu bandeja de entrada en <strong style={{ color: '#F7FAFF' }}>{resetEmail}</strong>
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        <p className="text-center" style={{ color: 'rgba(247,250,255,0.5)', fontSize: '14px' }}>
          ¿No tenés cuenta?{' '}
          <a href="/registro" style={{ color: '#2DD4BF', fontWeight: 500 }}>Registrate gratis</a>
        </p>

      </div>
    </div>
  )
}