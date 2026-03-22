'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

export default function RegistroPage() {
  const router = useRouter()
  const supabase = createClient()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [company, setCompany] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingGoogle, setLoadingGoogle] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleRegistro(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, phone, company } },
    })
    if (error) {
      setError('Error al crear la cuenta. Verificá los datos.')
      setLoading(false)
      return
    }
    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id, full_name: fullName, phone, company, role: 'SELLER',
      })
      if (profileError) console.error('Error creando perfil:', profileError)
    }
    setSuccess(true)
    setLoading(false)
  }

  async function handleGoogle() {
    setLoadingGoogle(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) {
      setError('Error al conectar con Google')
      setLoadingGoogle(false)
    }
  }

  const inputStyle = { height: '48px', background: 'rgba(247,250,255,0.07)', border: '1px solid rgba(74,123,181,0.3)', color: '#F7FAFF', fontSize: '15px' }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-10 relative overflow-hidden" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(/fabrica.jpg)' }} />
          <div className="absolute inset-0" style={{ background: 'rgba(11,31,58,0.70)' }} />
        </div>
        <div className="relative z-10 w-full max-w-sm flex flex-col items-center gap-6 text-center">
          <img src="/logo.jpg" alt="Logo" className="w-20 h-20 rounded-2xl object-cover" style={{ border: '2px solid rgba(74,123,181,0.4)' }} />
          <div className="w-full rounded-2xl px-6 py-8 flex flex-col items-center gap-4" style={{ background: 'rgba(11,31,58,0.75)', backdropFilter: 'blur(14px)', border: '1px solid rgba(45,212,191,0.3)' }}>
            <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'rgba(45,212,191,0.15)', border: '1px solid rgba(45,212,191,0.4)' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2DD4BF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            </div>
            <h2 className="font-bold text-lg" style={{ color: '#F7FAFF' }}>¡Cuenta creada!</h2>
            <p style={{ color: 'rgba(247,250,255,0.6)', fontSize: '14px', lineHeight: '1.5' }}>Te enviamos un email de confirmación a <strong style={{ color: '#F7FAFF' }}>{email}</strong>. Revisá tu bandeja de entrada.</p>
            <a href="/login" className="w-full rounded-xl font-semibold flex items-center justify-center" style={{ height: '48px', background: '#1E6AC8', color: '#F7FAFF', fontSize: '15px' }}>Ir al login</a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-10 relative overflow-hidden" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(/fabrica.jpg)' }} />
        <div className="absolute inset-0" style={{ background: 'rgba(11,31,58,0.70)' }} />
      </div>
      <div className="relative z-10 w-full max-w-sm flex flex-col gap-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <img src="/logo.jpg" alt="La Cooperativa Metalúrgica Argentina" className="w-20 h-20 rounded-2xl object-cover" style={{ border: '2px solid rgba(74,123,181,0.4)' }} />
          <div>
            <h1 className="font-semibold leading-snug" style={{ color: '#F7FAFF', fontSize: '18px' }}>La Cooperativa Metalúrgica Argentina</h1>
            <p style={{ color: 'rgba(247,250,255,0.5)', fontSize: '13px', marginTop: '4px' }}>🇦🇷 Villa Lugano, CABA</p>
          </div>
        </div>
        <div className="flex flex-col gap-4 rounded-2xl px-6 py-7" style={{ background: 'rgba(11,31,58,0.75)', backdropFilter: 'blur(14px)', border: '1px solid rgba(74,123,181,0.25)' }}>
          <p className="text-center tracking-widest uppercase" style={{ color: 'rgba(247,250,255,0.5)', fontSize: '11px' }}>Creá tu cuenta gratis</p>
          <form onSubmit={handleRegistro} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label style={{ color: 'rgba(247,250,255,0.7)', fontSize: '13px' }}>Nombre completo</label>
              <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Juan García" required className="w-full rounded-xl px-4 outline-none transition-all" style={inputStyle} onFocus={e => (e.target.style.borderColor = 'rgba(30,106,200,0.6)')} onBlur={e => (e.target.style.borderColor = 'rgba(74,123,181,0.3)')} />
            </div>
            <div className="flex flex-col gap-2">
              <label style={{ color: 'rgba(247,250,255,0.7)', fontSize: '13px' }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="usuario@ejemplo.com" required className="w-full rounded-xl px-4 outline-none transition-all" style={inputStyle} onFocus={e => (e.target.style.borderColor = 'rgba(30,106,200,0.6)')} onBlur={e => (e.target.style.borderColor = 'rgba(74,123,181,0.3)')} />
            </div>
            <div className="flex flex-col gap-2">
              <label style={{ color: 'rgba(247,250,255,0.7)', fontSize: '13px' }}>Teléfono</label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+54 11 1234-5678" className="w-full rounded-xl px-4 outline-none transition-all" style={inputStyle} onFocus={e => (e.target.style.borderColor = 'rgba(30,106,200,0.6)')} onBlur={e => (e.target.style.borderColor = 'rgba(74,123,181,0.3)')} />
            </div>
            <div className="flex flex-col gap-2">
              <label style={{ color: 'rgba(247,250,255,0.7)', fontSize: '13px' }}>Empresa / Negocio</label>
              <input type="text" value={company} onChange={e => setCompany(e.target.value)} placeholder="Mi empresa S.A." className="w-full rounded-xl px-4 outline-none transition-all" style={inputStyle} onFocus={e => (e.target.style.borderColor = 'rgba(30,106,200,0.6)')} onBlur={e => (e.target.style.borderColor = 'rgba(74,123,181,0.3)')} />
            </div>
            <div className="flex flex-col gap-2">
              <label style={{ color: 'rgba(247,250,255,0.7)', fontSize: '13px' }}>Contraseña</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" required minLength={6} className="w-full rounded-xl px-4 pr-12 outline-none transition-all" style={inputStyle} onFocus={e => (e.target.style.borderColor = 'rgba(30,106,200,0.6)')} onBlur={e => (e.target.style.borderColor = 'rgba(74,123,181,0.3)')} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: 'rgba(45,212,191,0.7)' }}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            {error && (
              <div className="rounded-xl px-4 py-3 text-center" style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.3)', color: '#FCA5A5', fontSize: '13px' }}>{error}</div>
            )}
            <button type="submit" disabled={loading} className="w-full rounded-xl font-semibold flex items-center justify-center gap-2 transition-opacity" style={{ height: '48px', background: '#1E6AC8', color: '#F7FAFF', fontSize: '15px', opacity: loading ? 0.7 : 1 }}>
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: 'rgba(74,123,181,0.25)' }} />
            <span style={{ color: 'rgba(247,250,255,0.35)', fontSize: '12px' }}>o continuá con</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(74,123,181,0.25)' }} />
          </div>
          <button onClick={handleGoogle} disabled={loadingGoogle} className="w-full rounded-xl flex items-center justify-center gap-3 transition-opacity" style={{ height: '48px', background: 'rgba(247,250,255,0.07)', border: '1px solid rgba(74,123,181,0.3)', color: 'rgba(247,250,255,0.85)', fontSize: '14px', opacity: loadingGoogle ? 0.7 : 1 }}>
            {loadingGoogle ? <Loader2 size={16} className="animate-spin" /> : (
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.6 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.5 6.5 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z" />
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 19 12 24 12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.5 6.5 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
                <path fill="#4CAF50" d="M24 44c5.2 0 10-1.9 13.6-5l-6.3-5.3C29.5 35.6 26.9 36 24 36c-5.2 0-9.7-3.4-11.3-8l-6.5 5C9.6 39.5 16.3 44 24 44z" />
                <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.7l6.3 5.3C42.5 35.2 44 30 44 24c0-1.3-.1-2.6-.4-3.9z" />
              </svg>
            )}
            {loadingGoogle ? 'Conectando...' : 'Registrarse con Google'}
          </button>
        </div>
        <p className="text-center" style={{ color: 'rgba(247,250,255,0.5)', fontSize: '14px' }}>
          ¿Ya tenés cuenta?{' '}
          <a href="/login" style={{ color: '#2DD4BF', fontWeight: 500 }}>Ingresá acá</a>
        </p>
      </div>
    </div>
  )
}