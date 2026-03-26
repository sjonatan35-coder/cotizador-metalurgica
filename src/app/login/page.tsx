'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [hover, setHover] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    setError('')

    const supabase = createClient()

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError('Email o contraseña incorrectos')
      setLoading(false)
      return
    }

    const userId = data.user?.id
    if (!userId) {
      window.location.replace('/mi-panel')
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('rol')
      .eq('id', userId)
      .single()

    const rol = profile?.rol

    if (rol === 'CLIENTE') {
      window.location.replace('/mi-panel')
    } else if (rol === 'ADMIN' || rol === 'SELLER') {
      window.location.replace('/clientes')
    } else if (rol === 'WAREHOUSE') {
      window.location.replace('/stock')
    } else if (rol === 'DRIVER') {
      window.location.replace('/pedidos')
    } else if (rol === 'SUPER_ADMIN') {
      window.location.replace('/admin')
    } else {
      window.location.replace('/mi-panel')
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundImage: 'url(/fabrica.jpeg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          minHeight: '100vh',
          background: 'rgba(11,31,58,0.85)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          style={{
            background: '#0B1F3A',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <img
            src="/logo.jpg"
            alt="Logo"
            style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover' }}
          />
          <div>
            <div style={{ color: '#F7FAFF', fontSize: 15, fontWeight: 700 }}>La Metalúrgica</div>
            <div style={{ color: '#4A7BB5', fontSize: 11 }}>Cooperativa Argentina</div>
          </div>
        </div>

        {/* Contenido */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px 16px',
          }}
        >
          <div
            style={{
              background: 'rgba(11,31,58,0.75)',
              backdropFilter: 'blur(14px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 16,
              padding: '28px 24px',
              width: '100%',
              maxWidth: 380,
            }}
          >
            {/* Badge */}
            <div
              style={{
                background: 'rgba(45,212,191,0.15)',
                color: '#2DD4BF',
                borderRadius: 4,
                fontSize: 11,
                padding: '3px 8px',
                display: 'inline-block',
                marginBottom: 14,
              }}
            >
              Redirect inteligente por rol
            </div>

            <h1 style={{ color: '#F7FAFF', fontSize: 22, fontWeight: 700, margin: '0 0 4px' }}>
              Ingresar
            </h1>
            <p style={{ color: '#4A7BB5', fontSize: 13, margin: '0 0 24px' }}>
              Accedé a tu cuenta
            </p>

            {/* Error */}
            {error && (
              <div
                style={{
                  background: 'rgba(226,75,74,0.12)',
                  border: '1px solid rgba(226,75,74,0.3)',
                  borderRadius: 8,
                  padding: '10px 12px',
                  marginBottom: 16,
                  color: '#E24B4A',
                  fontSize: 13,
                }}
              >
                {error}
              </div>
            )}

            {/* Email */}
            <label style={{ color: 'rgba(247,250,255,0.5)', fontSize: 12, display: 'block', marginBottom: 6 }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              placeholder="usuario@email.com"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 8,
                padding: '10px 12px',
                color: '#F7FAFF',
                fontSize: 14,
                width: '100%',
                boxSizing: 'border-box' as const,
                marginBottom: 14,
                opacity: loading ? 0.5 : 1,
              }}
            />

            {/* Contraseña */}
            <label style={{ color: 'rgba(247,250,255,0.5)', fontSize: 12, display: 'block', marginBottom: 6 }}>
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              placeholder="••••••••"
              onKeyDown={(e) => e.key === 'Enter' && !loading && handleLogin()}
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 8,
                padding: '10px 12px',
                color: '#F7FAFF',
                fontSize: 14,
                width: '100%',
                boxSizing: 'border-box' as const,
                marginBottom: 20,
                opacity: loading ? 0.5 : 1,
              }}
            />

            {/* Banner roles */}
            <div
              style={{
                background: 'rgba(45,212,191,0.10)',
                border: '1px solid rgba(45,212,191,0.22)',
                borderRadius: 8,
                padding: '10px 12px',
                marginBottom: 20,
                opacity: loading ? 0.4 : 1,
              }}
            >
              <div style={{ color: '#2DD4BF', fontSize: 11, lineHeight: 1.7 }}>
                <span style={{ fontWeight: 700 }}>CLIENTE</span> → /mi-panel<br />
                <span style={{ fontWeight: 700 }}>ADMIN / SELLER</span> → /clientes<br />
                <span style={{ fontWeight: 700 }}>WAREHOUSE</span> → /stock<br />
                <span style={{ fontWeight: 700 }}>DRIVER</span> → /pedidos
              </div>
            </div>

            {/* Botón */}
            <button
              onClick={handleLogin}
              disabled={loading}
              onMouseEnter={() => setHover(true)}
              onMouseLeave={() => setHover(false)}
              style={{
                background: loading ? 'rgba(255,255,255,0.85)' : hover ? '#2DD4BF' : '#FFFFFF',
                color: hover && !loading ? '#0B1F3A' : '#F7FAFF',
                border: 'none',
                borderRadius: 8,
                padding: '12px',
                width: '100%',
                fontSize: 15,
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.85 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'background 0.2s, color 0.2s',
              }}
            >
              {loading ? (
                <>
                  <span
                    style={{
                      width: 14,
                      height: 14,
                      border: '2px solid rgba(11,31,58,0.2)',
                      borderTopColor: '#0B1F3A',
                      borderRadius: '50%',
                      display: 'inline-block',
                      animation: 'spin 0.7s linear infinite',
                    }}
                  />
                  Ingresando...
                </>
              ) : (
                'Ingresar'
              )}
            </button>

            {/* Link registro */}
            <p
              style={{
                textAlign: 'center',
                marginTop: 18,
                fontSize: 13,
                color: 'rgba(247,250,255,0.5)',
                opacity: loading ? 0.3 : 1,
              }}
            >
              ¿No tenés cuenta?{' '}
              <a href="/registro" style={{ color: '#2DD4BF', textDecoration: 'none', fontWeight: 600 }}>
                Registrate
              </a>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: rgba(247,250,255,0.25); }
        input:focus { outline: none; border-color: rgba(30,106,200,0.6) !important; }
      `}</style>
    </div>
  )
} 