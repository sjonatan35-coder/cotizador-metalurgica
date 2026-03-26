'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function ConfiguracionPage() {
  const [valorActual, setValorActual] = useState<number>(0)
  const [nuevoValor, setNuevoValor] = useState<string>('')
  const [updatedAt, setUpdatedAt] = useState<string>('')
  const [historial, setHistorial] = useState<{ valor: number; fecha: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [guardado, setGuardado] = useState(false)
  const [hover, setHover] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => { cargarDatos() }, [])

  const cargarDatos = async () => {
    const { data } = await supabase.from('configuracion').select('precio_dolar, updated_at').eq('id', 1).single()
    if (data) {
      setValorActual(data.precio_dolar)
      setNuevoValor(String(data.precio_dolar))
      const fecha = new Date(data.updated_at)
      const ahora = new Date()
      const esHoy = fecha.toDateString() === ahora.toDateString()
      const esAyer = new Date(ahora.setDate(ahora.getDate() - 1)).toDateString() === fecha.toDateString()
      const hora = fecha.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
      if (esHoy) setUpdatedAt(`hoy ${hora}`)
      else if (esAyer) setUpdatedAt(`ayer ${hora}`)
      else setUpdatedAt(`${fecha.toLocaleDateString('es-AR')} ${hora}`)
    }
  }

  const handleGuardar = async () => {
    const valor = parseFloat(nuevoValor)
    if (!valor || valor <= 0) return
    setLoading(true)
    setGuardado(false)
    const { error } = await supabase.from('configuracion').update({ precio_dolar: valor, updated_at: new Date().toISOString() }).eq('id', 1)
    if (!error) {
      const ahora = new Date()
      const hora = ahora.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
      setHistorial(prev => [{ valor, fecha: `hoy ${hora}` }, ...prev.slice(0, 2)])
      setValorActual(valor)
      setUpdatedAt(`hoy ${hora}`)
      setGuardado(true)
      setTimeout(() => setGuardado(false), 3000)
    }
    setLoading(false)
  }

  const fmt = (v: number) => '$ ' + v.toLocaleString('es-AR')

  return (
    <div style={{ minHeight: '100vh', background: '#0B1F3A', display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: '#0B1F3A', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: '#4A7BB5', cursor: 'pointer', fontSize: 13, padding: '0 8px 0 0' }}>←</button>
        <img src="/logo.jpg" alt="Logo" style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover' }} />
        <div>
          <div style={{ color: '#F7FAFF', fontSize: 15, fontWeight: 700 }}>La Metalúrgica</div>
          <div style={{ color: '#4A7BB5', fontSize: 11 }}>Panel admin</div>
        </div>
      </div>
      <div style={{ flex: 1, padding: '20px 16px 32px', maxWidth: 480, width: '100%', margin: '0 auto', boxSizing: 'border-box' as const }}>
        <div style={{ background: 'rgba(30,106,200,0.2)', color: '#4A7BB5', borderRadius: 4, fontSize: 11, padding: '3px 8px', display: 'inline-block', marginBottom: 20 }}>ADMIN - Configuración</div>
        {guardado && (<div style={{ background: 'rgba(45,212,191,0.15)', border: '1px solid rgba(45,212,191,0.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><div style={{ width: 8, height: 8, background: '#2DD4BF', borderRadius: '50%', flexShrink: 0 }} /><span style={{ color: '#2DD4BF', fontSize: 13, fontWeight: 600 }}>Precio actualizado correctamente</span></div>)}
        <div style={{ color: 'rgba(247,250,255,0.4)', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 10 }}>Precio del dólar</div>
        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <div style={{ color: '#F7FAFF', fontSize: 14, fontWeight: 700, marginBottom: 2 }}>Valor actual</div>
          <div style={{ color: '#4A7BB5', fontSize: 12, marginBottom: 14 }}>Se usa para calcular precios en ARS</div>
          <div style={{ background: 'rgba(45,212,191,0.1)', border: '1px solid rgba(45,212,191,0.2)', borderRadius: 8, padding: '12px 14px', marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div><div style={{ color: 'rgba(247,250,255,0.5)', fontSize: 11 }}>USD → ARS</div><div style={{ color: '#2DD4BF', fontSize: 22, fontWeight: 700 }}>{fmt(valorActual)}</div></div>
            <div style={{ textAlign: 'right' }}><div style={{ color: 'rgba(247,250,255,0.3)', fontSize: 10 }}>Actualizado</div><div style={{ color: 'rgba(247,250,255,0.3)', fontSize: 10 }}>{updatedAt}</div></div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input type="number" value={nuevoValor} onChange={(e) => setNuevoValor(e.target.value)} disabled={loading} onKeyDown={(e) => e.key === 'Enter' && handleGuardar()} style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '10px 12px', color: '#F7FAFF', fontSize: 15, fontWeight: 600, boxSizing: 'border-box' as const }} />
            <button onClick={handleGuardar} disabled={loading} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{ background: hover && !loading ? '#1E6AC8' : '#FFFFFF', color: '#F7FAFF', border: 'none', borderRadius: 8, padding: '10px 18px', fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' as const, transition: 'background 0.2s', opacity: loading ? 0.7 : 1 }}>{loading ? '...' : 'Guardar'}</button>
          </div>
        </div>
        <div style={{ color: 'rgba(247,250,255,0.4)', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 10 }}>Últimos cambios</div>
        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '4px 16px' }}>
          {historial.length === 0 ? (<div style={{ color: 'rgba(247,250,255,0.3)', fontSize: 12, padding: '14px 0', textAlign: 'center' }}>Los cambios aparecerán acá</div>) : (historial.map((h, i) => (<div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < historial.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}><div><div style={{ color: '#F7FAFF', fontSize: 13, fontWeight: 600 }}>{fmt(h.valor)}</div><div style={{ color: '#4A7BB5', fontSize: 10 }}>admin</div></div><div style={{ color: 'rgba(247,250,255,0.4)', fontSize: 11 }}>{h.fecha}</div></div>)))}
        </div>
      </div>
      <style>{`input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;}input[type=number]{-moz-appearance:textfield;}input:focus{outline:none;border-color:rgba(30,106,200,0.6)!important;}`}</style>
    </div>
  )
}