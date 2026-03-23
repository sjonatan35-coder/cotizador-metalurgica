'use client'

export default function Home() {
  return (
    <main className="min-h-screen" style={{ background: '#0B1F3A' }}>
      <div className="min-h-screen flex flex-col" style={{ backgroundImage: 'url(/fabrica.jpeg)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="flex flex-col min-h-screen" style={{ background: 'rgba(11,31,58,0.32)' }}>
          <div className="flex items-center justify-between px-5 pt-12 pb-4">
            <div className="flex items-center gap-3">
              <img src="/logo.jpg" alt="Logo" className="h-9 w-9 rounded-lg object-cover" />
              <span className="text-white font-bold text-base" style={{ textShadow: '0 1px 6px rgba(0,0,0,0.9)' }}>La Metalúrgica</span>
            </div>
            <a href="/login" className="text-xs font-medium px-4 py-2 rounded-full text-white" style={{ background: '#1E6AC8' }}>Ingresar</a>
          </div>
          <div className="px-5 pb-5">
            <p className="text-xs mb-1" style={{ color: 'rgba(247,250,255,0.7)', textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>Bienvenido</p>
            <span className="text-white font-bold text-lg leading-tight" style={{ textShadow: '0 1px 6px rgba(0,0,0,0.9)' }}>La Cooperativa Metalúrgica Argentina</span>
          </div>
          <div className="px-4 grid grid-cols-2 gap-3 mb-3">
            <a href="/calculadora" className="block rounded-2xl p-4" style={{ background: 'rgba(11,31,58,0.65)', border: '1px solid rgba(45,212,191,0.4)', backdropFilter: 'blur(14px)' }}>
              <div className="flex justify-between items-start mb-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(30,106,200,0.4)' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2DD4BF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(45,212,191,0.15)', color: '#2DD4BF', border: '0.5px solid rgba(45,212,191,0.5)' }}>3 gratis</span>
              </div>
              <p className="text-white font-bold text-sm mb-0.5">Calculadora</p>
              <p className="text-xs" style={{ color: '#4A7BB5' }}>Chapas BWG</p>
            </a>
            <a href="/presupuestos" className="block rounded-2xl p-4" style={{ background: 'rgba(11,31,58,0.65)', border: '1px solid rgba(250,199,117,0.35)', backdropFilter: 'blur(14px)' }}>
              <div className="flex justify-between items-start mb-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(133,79,11,0.4)' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FAC775" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(250,199,117,0.15)', color: '#FAC775', border: '0.5px solid rgba(250,199,117,0.5)' }}>Libre</span>
              </div>
              <p className="text-white font-bold text-sm mb-0.5">Presupuestos</p>
              <p className="text-xs" style={{ color: '#4A7BB5' }}>Generador PDF</p>
            </a>
            <a href="/login" className="block rounded-2xl p-4" style={{ background: 'rgba(11,31,58,0.55)', border: '0.5px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(14px)', opacity: 0.5 }}>
              <div className="flex justify-between items-start mb-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(15,110,86,0.3)' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2DD4BF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(247,250,255,0.5)" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </div>
              <p className="text-white font-bold text-sm mb-0.5">Clientes</p>
              <p className="text-xs" style={{ color: '#4A7BB5' }}>Requiere login</p>
            </a>
            <a href="/login" className="block rounded-2xl p-4" style={{ background: 'rgba(11,31,58,0.55)', border: '0.5px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(14px)', opacity: 0.5 }}>
              <div className="flex justify-between items-start mb-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(153,60,29,0.3)' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F0997B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(247,250,255,0.5)" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </div>
              <p className="text-white font-bold text-sm mb-0.5">Stock</p>
              <p className="text-xs" style={{ color: '#4A7BB5' }}>Requiere login</p>
            </a>
          </div>
          <div className="px-4 mb-4">
            <a href="/calculadora" className="flex items-center justify-between rounded-2xl p-4" style={{ background: 'rgba(11,31,58,0.65)', border: '0.5px solid rgba(45,212,191,0.3)', backdropFilter: 'blur(14px)' }}>
              <div>
                <p className="text-xs mb-0.5" style={{ color: '#4A7BB5' }}>Acceso rápido</p>
                <p className="text-white font-bold text-sm">Nueva calculadora</p>
              </div>
              <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: '#1E6AC8' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </div>
            </a>
          </div>
          <div className="flex-1" />
          <div className="flex justify-around items-center px-4 py-3" style={{ background: 'rgba(11,31,58,0.95)', borderTop: '0.5px solid rgba(45,212,191,0.2)' }}>
            <div className="flex flex-col items-center gap-1">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2DD4BF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              <span className="text-xs font-bold" style={{ color: '#2DD4BF' }}>Inicio</span>
            </div>
            <a href="/calculadora" className="flex flex-col items-center gap-1">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(247,250,255,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
              <span className="text-xs" style={{ color: 'rgba(247,250,255,0.4)' }}>Calculadora</span>
            </a>
            <a href="/presupuestos" className="flex flex-col items-center gap-1">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(247,250,255,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              <span className="text-xs" style={{ color: 'rgba(247,250,255,0.4)' }}>Presupuestos</span>
            </a>
            <a href="/login" className="flex flex-col items-center gap-1">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(247,250,255,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>
              <span className="text-xs" style={{ color: 'rgba(247,250,255,0.4)' }}>Más</span>
            </a>
          </div>
          <div style={{ background: 'rgba(11,31,58,0.97)', borderTop: '0.5px solid rgba(45,212,191,0.1)', overflow: 'hidden' }}>
            <style>{`@keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}.ticker-track{display:flex;width:max-content;animation:ticker 28s linear infinite}`}</style>
            <div className="ticker-track" style={{ padding: '8px 0' }}>
              {['Ley 25.326 — Protección de Datos Personales','Ley 24.240 — Defensa del Consumidor','Ley 25.506 — Firma Digital','Política de Privacidad','Términos y Condiciones','© 2026 La Cooperativa Metalúrgica Argentina','Ley 25.326 — Protección de Datos Personales','Ley 24.240 — Defensa del Consumidor','Ley 25.506 — Firma Digital','Política de Privacidad','Términos y Condiciones','© 2026 La Cooperativa Metalúrgica Argentina'].map((text, i) => (
                <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0 1.5rem', fontSize: '11px', color: 'rgba(247,250,255,0.4)', whiteSpace: 'nowrap' }}>
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#2DD4BF" strokeWidth="2"><circle cx="12" cy="12" r="10"/></svg>
                  {text}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}