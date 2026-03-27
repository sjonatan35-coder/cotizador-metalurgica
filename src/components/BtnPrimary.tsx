'use client'

import { useState } from 'react'

interface BtnPrimaryProps {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
  type?: 'button' | 'submit'
}

export default function BtnPrimary({
  children,
  onClick,
  disabled = false,
  loading = false,
  fullWidth = true,
  type = 'button',
}: BtnPrimaryProps) {
  const [hover, setHover] = useState(false)

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: loading || disabled ? 'rgba(255,255,255,0.5)' : hover ? '#1E6AC8' : '#FFFFFF',
        color: '#F7FAFF',
        border: 'none',
        borderRadius: 8,
        padding: '12px 20px',
        width: fullWidth ? '100%' : 'auto',
        fontSize: 15,
        fontWeight: 700,
        cursor: loading || disabled ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        transition: 'background 0.2s',
        opacity: disabled && !loading ? 0.5 : 1,
      }}
    >
      {loading ? (
        <>
          <span
            style={{
              width: 14,
              height: 14,
              border: '2px solid rgba(247,250,255,0.3)',
              borderTopColor: '#F7FAFF',
              borderRadius: '50%',
              display: 'inline-block',
              animation: 'spin 0.7s linear infinite',
            }}
          />
          Cargando...
        </>
      ) : (
        children
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </button>
  )
}