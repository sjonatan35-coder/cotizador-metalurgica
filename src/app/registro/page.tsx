'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, Loader2, FileText, Calculator, MessageCircle } from 'lucide-react'

export default function RegistroPage() {
  const supabase = createClient()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [countdown, setCountdown] = useState(5)

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

  // Countdown redirect después del éxito
  useEffect(() => {
    if (!success) return
    if (countdown <= 0) { window.location.href = '/login'; return }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [success, countdown])

  async function handleRegistro(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Leer UTM capturado
    const utmRaw = localStorage.getItem('metalurgica_utm')
    const utm = utmRaw ? JSON.parse(utmRaw) : null

    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName, phone } },
    })
    if (error) {
      if (error.message.includes('already registered')) {
        setError('Este email ya tiene una cuenta. ¿Querés ingresar?')
      } else {
        setError('Error al crear la cuenta. Verificá los datos.')
      }
      setLoading(false)
      return
    }
    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        nombre: fullName,
        telefono: phone,
        rol: 'SELLER',
        fuente: utm?.source ?? 'directo',
        campana_origen: utm?.campaign ?? null,
      })
      if (profileError) console.error('Error creando perfil:', profileError)
    }
    setSuccess(true)
    setLoading(false)
  }

  const inputStyle = {
    height: '48px',
    background: 'rgba(247,250,255,0.07)',
    border: '1px solid rgba(74,123,181,0.3)',
    color: '#F7FAFF',
    fontSize: '15px'
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-10 relative overflow-hidden"
        style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(/fabrica.jpeg)' }} />
          <div className="absolute inset-0" style={{ background: 'rgba(11,31,58,0.70)' }} />
        </div>
        <div className="relative z-10 w-full max-w-sm flex flex-col items-center gap-6 text-center">
          <img src="/logo.jpg" alt="Logo"
            className="w-20 h-20 rounded-2xl object-cover cursor-pointer"
            style={{ border: '2px solid rgba(74,123,181,0.4)' }}
            onClick={() => window.location.href = '/'} />
          <div className="w-full rounded-2xl px-6 py-8 flex flex-col items-center gap-4"
            style={{ background: 'rgba(11,31,58,0.75)', backdropFilter: 'blur(14px)', border: '1px solid rgba(45,212,191,0.3)' }}>
            <div className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(45,212,191,0.15)', border: '1px solid rgba(45,212,191,0.4)' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2DD4BF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 className="font-bold text-lg" style={{ color: '#F7FAFF' }}>¡Bienvenido a La Metalúrgica!</h2>
            <p style={{ color: 'rgba(247,250,255,0.6)', fontSize: '14px', lineHeight: '1.5' }}>
              Te enviamos un email de confirmación a{' '}
              <strong style={{ color: '#F7FAFF' }}>{email}</strong>.
              Revisá tu bandeja de entrada.
            </p>
            <div className="w-full rounded-xl flex items-center justify-center gap-2"
              style={{ height: '48px', background: 'rgba(30,106,200,0.2)', border: '1px solid rgba(30,106,200,0.3)' }}>
              <span style={{ color: 'rgba(247,250,255,0.6)', fontSize: '14px' }}>
                Redirigiendo al login en
              </span>
              <span style={{ color: '#2DD4BF', fontSize: '18px', fontWeight: 700, minWidth: '20px' }}>
                {countdown}
              </span>
            </div>
            <a href="/login" className="w-full rounded-xl font-semibold flex items-center justify-center"
              style={{ height: '44px', background: '#1E6AC8', color: '#F7FAFF', fontSize: '15px', textDecoration: 'none' }}>
              Ir al login ahora
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-10 relative overflow-hidden"
      style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(/fabrica.jpeg)' }} />
        <div className="absolute inset-0" style={{ background: 'rgba(11,31,58,0.70)' }} />
      </div>

      <div className="relative z-10 w-full max-w-sm flex flex-col gap-6">

        {/* Logo + nombre */}
        <div className="flex flex-col items-center gap-3 text-center">
          <img src="/logo.jpg" alt="La Cooperativa Metalúrgica Argentina"
            className="w-20 h-20 rounded-2xl object-cover cursor-pointer"
            style={{ border: '2px solid rgba(74,123,181,0.4)' }}
            onClick={() => window.location.href = '/'} />
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
            { icon: <Calculator size={16} />, text: 'Cálculos ilimitados' },
            { icon: <MessageCircle size={16} />, text: 'Pedidos por WhatsApp' },
          ].map((b, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 rounded-xl py-3 px-2 text-center"
              style={{ background: 'rgba(30,106,200,0.15)', border: '1px solid rgba(30,106,200,0.2)' }}>
              <span style={{ color: '#2DD4BF' }}>{b.icon}</span>
              <span style={{ color: 'rgba(247,250,255,0.7)', fontSize: '11px', lineHeight: '1.3' }}>{b.text}</span>
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="flex flex-col gap-4 rounded-2xl px-6 py-7"
          style={{ background: 'rgba(11,31,58,0.75)', backdropFilter: 'blur(14px)', border: '1px solid rgba(74,123,181,0.25)' }}>

          <p className="text-center tracking-widest uppercase"
            style={{ color: 'rgba(247,250,255,0.5)', fontSize: '11px' }}>
            Registrate en 30 segundos
          </p>

          <form onSubmit={handleRegistro} className="flex flex-col gap-4">

            <div className="flex flex-col gap-2">
              <label style={{ color: 'rgba(247,250,255,0.7)', fontSize: '13px' }}>Nombre completo</label>
              <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                placeholder="Juan García" required
                className="w-full rounded-xl px-4 outline-none transition-all"
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = 'rgba(30,106,200,0.6)')}
                onBlur={e => (e.target.style.borderColor = 'rgba(74,123,181,0.3)')} />
            </div>

            <div className="flex flex-col gap-2">
              <label style={{ color: 'rgba(247,250,255,0.7)', fontSize: '13px' }}>
                Teléfono
                <span style={{ color: 'rgba(247,250,255,0.35)', fontSize: '11px', marginLeft: '6px' }}>
                  (te contactamos por WhatsApp)
                </span>
              </label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                placeholder="+54 11 1234-5678" required
                className="w-full rounded-xl px-4 outline-none transition-all"
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = 'rgba(30,106,200,0.6)')}
                onBlur={e => (e.target.style.borderColor = 'rgba(74,123,181,0.3)')} />
            </div>

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
              <label style={{ color: 'rgba(247,250,255,0.7)', fontSize: '13px' }}>Contraseña</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres" required minLength={6}
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
                {error.includes('ya tiene una cuenta') && (
                  <a href="/login" style={{ color: '#2DD4BF', marginLeft: '4px', fontWeight: 500 }}>
                    Ingresá acá
                  </a>
                )}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full rounded-xl font-semibold flex items-center justify-center gap-2 transition-opacity"
              style={{ height: '48px', background: '#1E6AC8', color: '#F7FAFF', fontSize: '15px', opacity: loading ? 0.7 : 1 }}>
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? 'Creando cuenta...' : 'Crear cuenta gratis'}
            </button>

            <p className="text-center" style={{ color: 'rgba(247,250,255,0.3)', fontSize: '11px' }}>
              Sin tarjeta de crédito · Gratis para siempre
            </p>

          </form>
        </div>

        <p className="text-center" style={{ color: 'rgba(247,250,255,0.5)', fontSize: '14px' }}>
          ¿Ya tenés cuenta?{' '}
          <a href="/login" style={{ color: '#2DD4BF', fontWeight: 500 }}>Ingresá acá</a>
        </p>

      </div>
    </div>
  )
}