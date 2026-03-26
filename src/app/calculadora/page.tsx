'use client'

import { useState, useEffect } from 'react'
import {
  DoorOpen, Layers, Home, Grid3x3,
  Scissors, Truck, Lightbulb,
  Hammer, MessageCircle, ChevronRight,
  type LucideIcon
} from 'lucide-react'
import {
  PROYECTOS, type Proyecto, type Material, type Acabado,
  MEDIDAS_ESTANDAR, getCalibresPorProyecto,
  calcularCantidadChapas, calcularChapasPorTonelada,
  calcularPesoTotal, MERMA_ESTAMPADO_M,
  ACABADO_LABELS,
} from '@/lib/calibres'
import type { CalibreBwg } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const WA_NUMBER = '5491159396358'
const STORAGE_KEY = 'metalurgica_usos_calculadora'
const MAX_USOS_GRATIS = 3

function registrarEvento(evento: string, datos: Record<string, unknown> = {}) {
  const supabase = createClient()
  let utm: { source?: string } | null = null
  try { utm = JSON.parse(localStorage.getItem('metalurgica_utm') ?? 'null') } catch {}
  supabase.from('eventos_app').insert({
    evento,
    fuente: utm?.source ?? 'directo',
    ...datos,
  }).then(() => {})
}

const ICONOS: Record<string, LucideIcon> = {
  porton: DoorOpen, piso: Layers, techo: Home, estructura: Grid3x3,
  zingueria: Scissors, trailer: Truck, estampada: Hammer,
  cnc: MessageCircle, otros: Lightbulb,
}

const MATERIAL_INFO: Record<Material, { label: string; descripcion: string }> = {
  LAF: { label: 'LAF — Laminado en Frío', descripcion: 'Superficie lisa y uniforme. Ideal para portones, pisos y estructuras.' },
  LAC: { label: 'LAC — Laminado en Caliente', descripcion: 'Mayor resistencia y grosor. Ideal para estructuras y usos industriales pesados.' },
  GALVANIZADO: { label: 'Galvanizado', descripcion: 'Protección contra la corrosión. Ideal para techos y ambientes húmedos.' },
}

const ACABADO_INFO: Record<Acabado, { label: string; descripcion: string; badge?: string }> = {
  liso: { label: 'Liso', descripcion: 'Superficie plana y uniforme. La más común para portones y estructuras.', badge: 'más elegido' },
  estampado: { label: 'Estampado', descripcion: 'Chapa con relieve de fábrica. Mayor resistencia al deslizamiento.' },
  diseño: { label: 'A diseño (CNC)', descripcion: 'Corte especial a medida con diseño personalizado.' },
}

type Paso        = 1 | 2 | 3 | 4 | 5
type Orientacion = 'vertical' | 'horizontal'
type ModoCalculo = 'superficie' | 'cantidad' | 'tonelada'

const PASOS: { label: string; n: Paso }[] = [
  { label: '1. Proyecto', n: 1 }, { label: '2. Material', n: 2 },
  { label: '3. Acabado', n: 3 }, { label: '4. Medidas', n: 4 },
  { label: '5. Resultado', n: 5 },
]

function BanderaArgentina() {
  return (
    <svg width="20" height="14" viewBox="0 0 20 14" style={{ borderRadius: 2, flexShrink: 0 }}>
      <rect width="20" height="4.67" y="0" fill="#74ACDF" />
      <rect width="20" height="4.67" y="4.67" fill="#FFFFFF" />
      <rect width="20" height="4.67" y="9.33" fill="#74ACDF" />
      <circle cx="10" cy="7" r="1.8" fill="#F6B40E" />
      <g stroke="#F6B40E" strokeWidth="0.5">
        <line x1="10" y1="4.5" x2="10" y2="3.5" />
        <line x1="10" y1="9.5" x2="10" y2="10.5" />
        <line x1="7.5" y1="7" x2="6.5" y2="7" />
        <line x1="12.5" y1="7" x2="13.5" y2="7" />
        <line x1="8.27" y1="5.27" x2="7.56" y2="4.56" />
        <line x1="11.73" y1="8.73" x2="12.44" y2="9.44" />
        <line x1="11.73" y1="5.27" x2="12.44" y2="4.56" />
        <line x1="8.27" y1="8.73" x2="7.56" y2="9.44" />
      </g>
    </svg>
  )
}

function PantallaBloqueo() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-10 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(/fabrica.jpeg)' }} />
        <div className="absolute inset-0" style={{ background: 'rgba(11,31,58,0.72)' }} />
      </div>
      <div className="relative z-10 w-full max-w-sm flex flex-col items-center gap-6 text-center">
        <img src="/logo.jpg" alt="Logo" className="w-20 h-20 rounded-2xl object-cover cursor-pointer"
          style={{ border: '2px solid rgba(74,123,181,0.4)' }}
          onClick={() => window.location.href = '/'} />
        <div className="w-full rounded-2xl px-6 py-8 flex flex-col items-center gap-5"
          style={{ background: 'rgba(11,31,58,0.75)', backdropFilter: 'blur(14px)', border: '1px solid rgba(220,38,38,0.3)' }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.35)' }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#FCA5A5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <div>
            <h2 className="font-bold text-lg mb-2" style={{ color: '#F7FAFF' }}>Límite de cálculos gratuitos</h2>
            <p style={{ color: 'rgba(247,250,255,0.6)', fontSize: 14, lineHeight: 1.6 }}>
              Usaste tus {MAX_USOS_GRATIS} cálculos gratuitos. Registrate gratis para calcular sin límites.
            </p>
          </div>
          <div className="w-full flex flex-col gap-3">
            <a href="/registro" className="w-full rounded-xl font-semibold flex items-center justify-center"
              style={{ height: 48, background: '#1E6AC8', color: '#F7FAFF', fontSize: 15, textDecoration: 'none' }}>
              Registrarse gratis — es rápido
            </a>
            <a href="/login" className="w-full rounded-xl flex items-center justify-center"
              style={{ height: 44, background: 'transparent', border: '1px solid rgba(74,123,181,0.35)', color: 'rgba(247,250,255,0.7)', fontSize: 14, textDecoration: 'none' }}>
              Ya tengo cuenta — Ingresar
            </a>
          </div>
          <p style={{ color: 'rgba(247,250,255,0.3)', fontSize: 11 }}>El registro es gratuito y sin tarjeta de crédito</p>
        </div>
      </div>
    </div>
  )
}

export default function CalculadoraPage() {
  const router = useRouter()
  const [paso, setPaso] = useState<Paso>(1)
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState<Proyecto | null>(null)
  const [materialSeleccionado, setMaterialSeleccionado] = useState<Material | null>(null)
  const [acabadoSeleccionado,  setAcabadoSeleccionado]  = useState<Acabado | null>(null)
  const [calibreSeleccionado,  setCalibreSeleccionado]  = useState<CalibreBwg | null>(null)
  const [medidaIdx,       setMedidaIdx]       = useState(0)
  const [aMedidaAncho,    setAMedidaAncho]    = useState('')
  const [aMedidaLargo,    setAMedidaLargo]    = useState('')
  const [supAncho,        setSupAncho]        = useState('')
  const [supLargo,        setSupLargo]        = useState('')
  const [orientacion,     setOrientacion]     = useState<Orientacion>('vertical')
  const [modoCalculo,     setModoCalculo]     = useState<ModoCalculo>('superficie')
  const [cantidadDirecta, setCantidadDirecta] = useState(1)
  const [toneladas,       setToneladas]       = useState('')
  const [usosGratis,      setUsosGratis]      = useState(0)
  const [bloqueado,       setBloqueado]       = useState(false)
  const [sesionActiva,    setSesionActiva]    = useState(false)
  const [cargando,        setCargando]        = useState(true)
  const [proyectoPopular, setProyectoPopular] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session) { setSesionActiva(true); setCargando(false) }
      else {
        const usos = parseInt(localStorage.getItem(STORAGE_KEY) ?? '0')
        setUsosGratis(usos)
        if (usos >= MAX_USOS_GRATIS) setBloqueado(true)
        setCargando(false)
      }
      const { data: eventos } = await supabase
        .from('eventos_app').select('proyecto_id')
        .eq('evento', 'calculadora_proyecto_elegido')
        .not('proyecto_id', 'is', null)
      if (eventos && eventos.length > 0) {
        const conteo: Record<string, number> = {}
        eventos.forEach(e => { if (e.proyecto_id) conteo[e.proyecto_id] = (conteo[e.proyecto_id] || 0) + 1 })
        const masPopular = Object.entries(conteo).sort((a, b) => b[1] - a[1])[0]?.[0]
        if (masPopular) setProyectoPopular(masPopular)
      }
    })
  }, [])

  function getMedidas() {
    if (!proyectoSeleccionado) return MEDIDAS_ESTANDAR
    if (proyectoSeleccionado.medidasEspeciales?.length)
      return proyectoSeleccionado.medidasEspeciales as { label: string; widthM: number; lengthM: number }[]
    return MEDIDAS_ESTANDAR
  }

  function esAMedida() {
    const m = getMedidas()[medidaIdx]
    return !m || (m.widthM === 0 && m.lengthM === 0)
  }

  function getChapaAncho() {
    if (esAMedida()) return parseFloat(aMedidaAncho) || 0
    return getMedidas()[medidaIdx]?.widthM ?? 0
  }

  function getChapaLargo() {
    if (esAMedida()) return parseFloat(aMedidaLargo) || 0
    const largo = getMedidas()[medidaIdx]?.lengthM ?? 0
    if (acabadoSeleccionado === 'estampado' || proyectoSeleccionado?.logica === 'estampada')
      return largo - MERMA_ESTAMPADO_M
    return largo
  }

  function calcularChapas(): number | null {
    if (!proyectoSeleccionado || !calibreSeleccionado) return null
    const chapaAncho = getChapaAncho()
    const chapaLargo = getChapaLargo()
    if (chapaAncho <= 0 || chapaLargo <= 0) return null
    if (modoCalculo === 'cantidad') return cantidadDirecta
    if (modoCalculo === 'tonelada') {
      const t = parseFloat(toneladas) || 0
      if (t <= 0 || !materialSeleccionado) return null
      return calcularChapasPorTonelada(t, chapaAncho, chapaLargo, calibreSeleccionado.thicknessMm, materialSeleccionado)
    }
    const ancho = parseFloat(supAncho) || 0
    const largo  = parseFloat(supLargo) || 0
    if (ancho <= 0 || largo <= 0) return null
    if (proyectoSeleccionado.logica === 'porton')
      return calcularCantidadChapas(ancho, largo, chapaAncho, chapaLargo, orientacion === 'vertical' ? 'normal' : 'rotada')
    return calcularCantidadChapas(ancho, largo, chapaAncho, chapaLargo)
  }

  function calcularPesoResultado(): number | null {
    const chapas = calcularChapas()
    if (!chapas || !calibreSeleccionado || !materialSeleccionado) return null
    return calcularPesoTotal(getChapaAncho(), getChapaLargo(), calibreSeleccionado.thicknessMm, materialSeleccionado, chapas)
  }

  function elegirProyecto(proyecto: Proyecto) {
    registrarEvento('calculadora_proyecto_elegido', { proyecto_id: proyecto.id })
    setProyectoSeleccionado(proyecto)
    setMaterialSeleccionado(null); setAcabadoSeleccionado(null); setCalibreSeleccionado(null)
    setMedidaIdx(0); setSupAncho(''); setSupLargo(''); setModoCalculo('superficie')
    if (proyecto.materiales.length === 1) { setMaterialSeleccionado(proyecto.materiales[0]); setPaso(3); return }
    setPaso(2)
  }

  function elegirMaterial(material: Material) {
    registrarEvento('calculadora_material_elegido', { proyecto_id: proyectoSeleccionado?.id ?? null, material })
    setMaterialSeleccionado(material); setAcabadoSeleccionado(null); setPaso(3)
  }

  function elegirAcabado(acabado: Acabado) {
    registrarEvento('calculadora_acabado_elegido', {
      proyecto_id: proyectoSeleccionado?.id ?? null,
      material: materialSeleccionado ?? null,
      metadata: { acabado },
    })
    setAcabadoSeleccionado(acabado)
    if (proyectoSeleccionado) {
      const calibres = getCalibresPorProyecto(proyectoSeleccionado.id)
      const rec = calibres.find(c => c.calibre === proyectoSeleccionado.calibreRecomendado)
      setCalibreSeleccionado(rec ?? calibres[0] ?? null)
    }
    setPaso(4)
  }

  function irAlResultado() {
    registrarEvento('calculadora_resultado_visto', {
      proyecto_id: proyectoSeleccionado?.id ?? null,
      material: materialSeleccionado ?? null,
      calibre: calibreSeleccionado?.calibre ?? null,
      metadata: { modo_calculo: modoCalculo, chapas: calcularChapas(), sesion: sesionActiva },
    })
    if (!sesionActiva) {
      const nuevos = usosGratis + 1
      localStorage.setItem(STORAGE_KEY, String(nuevos))
      setUsosGratis(nuevos)
      if (nuevos >= MAX_USOS_GRATIS) setBloqueado(true)
    }
    setPaso(5)
  }

  function handleWhatsAppClick() {
    const chapas = calcularChapas()
    const pesoKg = calcularPesoResultado()
    registrarEvento('calculadora_whatsapp_click', {
      proyecto_id: proyectoSeleccionado?.id ?? null,
      material: materialSeleccionado ?? null,
      calibre: calibreSeleccionado?.calibre ?? null,
      metadata: { chapas, peso_kg: pesoKg ? parseFloat(pesoKg.toFixed(2)) : null, modo_calculo: modoCalculo, sesion: sesionActiva },
    })
    window.open(`https://wa.me/${WA_NUMBER}?text=${generarMensajeWA()}`, '_blank')
  }

  function handlePresupuestoClick() {
    const chapas = calcularChapas()
    const pesoKg = calcularPesoResultado()
    registrarEvento('calculadora_presupuesto_click', {
      proyecto_id: proyectoSeleccionado?.id ?? null,
      material: materialSeleccionado ?? null,
      calibre: calibreSeleccionado?.calibre ?? null,
      metadata: { chapas, peso_kg: pesoKg ? parseFloat(pesoKg.toFixed(2)) : null, modo_calculo: modoCalculo, sesion: sesionActiva },
    })
    router.push(generarLinkPresupuesto())
  }

  function volverAtras() {
    if (paso === 2) { setPaso(1); setProyectoSeleccionado(null) }
    else if (paso === 3) {
      if (proyectoSeleccionado && proyectoSeleccionado.materiales.length === 1) {
        setPaso(1); setProyectoSeleccionado(null); setMaterialSeleccionado(null)
      } else { setPaso(2); setMaterialSeleccionado(null) }
      setAcabadoSeleccionado(null)
    } else if (paso === 4) { setPaso(3); setAcabadoSeleccionado(null); setCalibreSeleccionado(null) }
    else if (paso === 5) { setPaso(4) }
  }

  function generarMensajeWA(): string {
    const chapas = calcularChapas()
    const pesoKg = calcularPesoResultado()
    const medida = getMedidas()[medidaIdx]
    const medidaLabel = esAMedida() ? `${aMedidaAncho}m × ${aMedidaLargo}m (a medida)` : medida?.label ?? ''
    return encodeURIComponent([
      '🏭 *Pedido — La Cooperativa Metalúrgica Argentina*', '',
      `📋 Proyecto: ${proyectoSeleccionado?.label}`,
      `🔩 Material: ${materialSeleccionado} — ${ACABADO_LABELS[acabadoSeleccionado!]}`,
      `📐 Calibre: ${calibreSeleccionado?.calibre} BWG (${calibreSeleccionado?.thicknessMm} mm)`,
      `📏 Medida: ${medidaLabel}`,
      `🔢 Cantidad: ${chapas} chapas`,
      `⚖️ Peso total: ${pesoKg?.toFixed(2)} kg`, '',
      'Por favor confirmen disponibilidad y precio. ¡Gracias!',
    ].join('\n'))
  }

  function generarLinkPresupuesto(): string {
    const params = new URLSearchParams()
    if (proyectoSeleccionado) params.set('proyecto', proyectoSeleccionado.id)
    if (materialSeleccionado) params.set('material', materialSeleccionado)
    if (calibreSeleccionado) params.set('calibre', String(calibreSeleccionado.calibre))
    const chapas = calcularChapas()
    if (chapas) params.set('cantidad', String(chapas))
    return `/presupuestos/nuevo?${params.toString()}`
  }

  const chapasCalculadas = calcularChapas()
  const pesoCalculado    = calcularPesoResultado()
  const logica           = proyectoSeleccionado?.logica

  function MensajePreview() {
    const medida = getMedidas()[medidaIdx]
    const medidaLabel = esAMedida() ? `${aMedidaAncho}m × ${aMedidaLargo}m (a medida)` : medida?.label ?? ''
    return (
      <div className="rounded-xl p-4 mb-3" style={{ background: 'rgba(37,211,102,0.06)', border: '1px solid rgba(37,211,102,0.2)' }}>
        <p className="text-xs font-semibold mb-2" style={{ color: '#1a9e52' }}>Vista previa del mensaje que se va a enviar</p>
        <div className="rounded-lg p-3 text-xs leading-relaxed"
          style={{ background: 'white', border: '1px solid rgba(37,211,102,0.15)', color: '#374151', fontFamily: 'monospace' }}>
          <p>🏭 <strong>Pedido — La Cooperativa Metalúrgica Argentina</strong></p>
          <p className="mt-1">📋 Proyecto: {proyectoSeleccionado?.label}</p>
          <p>🔩 Material: {materialSeleccionado} — {ACABADO_LABELS[acabadoSeleccionado!]}</p>
          <p>📐 Calibre: c{calibreSeleccionado?.calibre} ({calibreSeleccionado?.thicknessMm} mm)</p>
          <p>📏 Medida: {medidaLabel}</p>
          <p>🔢 Cantidad: {chapasCalculadas} chapas</p>
          <p>⚖️ Peso total: {pesoCalculado?.toFixed(2)} kg</p>
        </div>
        <div className="flex items-center gap-2 mt-2 px-1">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1a9e52" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <p className="text-xs" style={{ color: '#1a9e52' }}>Respondemos lunes a sábado de 5 a 18hs</p>
        </div>
      </div>
    )
  }

  function PresupuestoPreview() {
    const medida = getMedidas()[medidaIdx]
    const medidaLabel = esAMedida() ? `${aMedidaAncho}m × ${aMedidaLargo}m` : medida?.label ?? ''
    return (
      <div className="rounded-xl p-4 mb-3" style={{ background: '#EFF6FF', borderWidth: '1px 1px 1px 3px', borderStyle: 'solid', borderColor: 'rgba(30,106,200,0.2) rgba(30,106,200,0.2) rgba(30,106,200,0.2) #1E6AC8' }}>
        <p className="text-xs font-semibold mb-2" style={{ color: '#185FA5' }}>El presupuesto PDF va a incluir</p>
        <div className="flex flex-col gap-1">
          {[
            ['Logo', 'La Cooperativa Metalúrgica Argentina'],
            ['Proyecto', `${proyectoSeleccionado?.label} · ${materialSeleccionado} · c${calibreSeleccionado?.calibre}`],
            ['Medida', medidaLabel],
            ['Cantidad', `${chapasCalculadas ?? 0} chapas · ${pesoCalculado?.toFixed(2) ?? '0.00'} kg`],
            ['Validez', '1 día hábil'],
            ['Número', 'Auto-generado'],
          ].map(([label, val]) => (
            <div key={label} className="flex justify-between text-xs">
              <span style={{ color: '#4B7BB5' }}>{label}</span>
              <span style={{ color: '#1E3A5F', fontWeight: 500 }}>{val}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-3 pt-2" style={{ borderTop: '1px solid rgba(30,106,200,0.15)' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#185FA5" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
          <p className="text-xs" style={{ color: '#185FA5' }}>Podés descargarlo, imprimirlo o mandarlo por WhatsApp</p>
        </div>
      </div>
    )
  }

  function BannerUsos() {
    if (sesionActiva || bloqueado) return null
    const esUltimo = usosGratis === MAX_USOS_GRATIS - 1
    const texto = esUltimo ? 'último cálculo gratuito' : `Cálculo ${usosGratis + 1} de ${MAX_USOS_GRATIS} gratuitos`
    return (
      <div className="mx-4 mb-3 px-4 py-2 rounded-xl flex items-center gap-2 text-xs"
        style={{ background: esUltimo ? 'rgba(250,199,117,0.15)' : 'rgba(30,106,200,0.08)', border: `1px solid ${esUltimo ? 'rgba(250,199,117,0.5)' : 'rgba(30,106,200,0.2)'}` }}>
        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: esUltimo ? '#FAC775' : '#1E6AC8' }} />
        <span style={{ color: esUltimo ? '#854F0B' : '#1E6AC8' }}>
          {texto} — <a href="/registro" style={{ color: esUltimo ? '#854F0B' : '#1E6AC8', fontWeight: 700 }}>Registrate</a> para uso ilimitado
        </span>
      </div>
    )
  }

  if (cargando) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#1E6AC8', borderTopColor: 'transparent' }} />
    </div>
  )

  if (bloqueado && paso !== 5) return <PantallaBloqueo />

  return (
    <main className="min-h-screen bg-gray-50">

      <div className="bg-brand-navy text-white px-4 pt-10 pb-3 flex items-center gap-3">
        <img src="/logo.jpg" alt="La Cooperativa Metalúrgica Argentina"
          className="rounded-xl object-cover flex-shrink-0 cursor-pointer"
          onClick={() => router.push('/')}
          style={{ width: 44, height: 44, border: '1.5px solid rgba(74,123,181,0.4)' }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p className="font-bold text-sm" style={{ margin: 0 }}>La Metalúrgica</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
            <BanderaArgentina />
            <p style={{ color: 'rgba(247,250,255,0.6)', fontSize: 10.5, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              La Cooperativa Metalúrgica Argentina
            </p>
          </div>
        </div>
        {!sesionActiva && (
          <div className="flex-shrink-0 text-xs px-3 py-1 rounded-full"
            style={{
              background: usosGratis >= MAX_USOS_GRATIS - 1 ? 'rgba(250,199,117,0.2)' : 'rgba(45,212,191,0.15)',
              color: usosGratis >= MAX_USOS_GRATIS - 1 ? '#FAC775' : '#2DD4BF',
              border: `0.5px solid ${usosGratis >= MAX_USOS_GRATIS - 1 ? 'rgba(250,199,117,0.5)' : 'rgba(45,212,191,0.5)'}`,
            }}>
            {usosGratis} de {MAX_USOS_GRATIS}
          </div>
        )}
      </div>

      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-1 text-xs overflow-x-auto">
        {PASOS.map((p, i) => (
          <div key={p.n} className="flex items-center gap-1">
            {i > 0 && <ChevronRight size={12} className="text-gray-300 shrink-0" />}
            <span style={{ color: paso === p.n ? '#1E6AC8' : paso > p.n ? '#9CA3AF' : '#D1D5DB', fontWeight: paso === p.n ? 700 : 400, whiteSpace: 'nowrap' }}>{p.label}</span>
          </div>
        ))}
      </div>

      <div className="px-4 pt-3"><BannerUsos /></div>

      <div className="px-4 pb-6 max-w-2xl mx-auto">

        {paso === 1 && (
          <div className="pt-4">
            <h2 className="text-xl font-bold text-gray-900 mb-1">¿Para qué es tu proyecto?</h2>
            <p className="text-gray-500 text-sm mb-5">Elegí una categoría y te ayudamos a encontrar la chapa ideal.</p>
            <div className="grid grid-cols-2 gap-3">
              {PROYECTOS.map((proyecto) => {
                const Icono = ICONOS[proyecto.id]
                if (!Icono) return null
                const esPopular = proyectoPopular === proyecto.id
                return (
                  <button key={proyecto.id} onClick={() => elegirProyecto(proyecto)}
                    className="bg-white border-2 border-gray-200 rounded-xl p-4 text-left hover:border-blue-400 transition-all relative">
                    {esPopular && (
                      <div style={{ position: 'absolute', top: -1, right: 8, background: '#2DD4BF', borderRadius: '0 0 6px 6px', padding: '2px 8px' }}>
                        <p style={{ color: '#0B1F3A', fontSize: 9, fontWeight: 700, margin: 0 }}>+ solicitado</p>
                      </div>
                    )}
                    <div className="rounded-lg p-2 w-fit mb-3 bg-blue-50"><Icono color="#1E6AC8" size={24} /></div>
                    <p className="font-bold text-sm text-gray-900">{proyecto.label}</p>
                    <p className="text-xs text-gray-500 mt-1">{proyecto.descripcion}</p>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {paso === 2 && proyectoSeleccionado && (
          <div className="pt-4">
            <button onClick={volverAtras} className="text-sm mb-4 flex items-center gap-1 text-blue-600">← Volver</button>
            <h2 className="text-xl font-bold text-gray-900 mb-1">¿De qué material lo querés?</h2>
            <p className="text-gray-500 text-sm mb-5">Proyecto: <span className="font-semibold text-gray-900">{proyectoSeleccionado.label}</span></p>
            <div className="flex flex-col gap-3">
              {proyectoSeleccionado.materiales.map((material) => (
                <button key={material} onClick={() => elegirMaterial(material)}
                  className="bg-white border-2 border-gray-200 rounded-xl p-4 text-left hover:border-blue-400 transition-all">
                  <p className="font-bold text-sm text-gray-900">{MATERIAL_INFO[material].label}</p>
                  <p className="text-sm text-gray-500 mt-1">{MATERIAL_INFO[material].descripcion}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {paso === 3 && proyectoSeleccionado && materialSeleccionado && (
          <div className="pt-4">
            <button onClick={volverAtras} className="text-sm mb-4 flex items-center gap-1 text-blue-600">← Volver</button>
            <div className="bg-blue-50 rounded-xl p-3 mb-5 flex gap-4 border border-blue-100">
              <div><p className="text-xs text-gray-400 mb-0.5">Proyecto</p><p className="font-bold text-sm text-gray-900">{proyectoSeleccionado.label}</p></div>
              <div><p className="text-xs text-gray-400 mb-0.5">Material</p><p className="font-bold text-sm text-gray-900">{MATERIAL_INFO[materialSeleccionado].label}</p></div>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">¿Qué tipo de chapa necesitás?</h2>
            <div className="flex flex-col gap-3">
              {proyectoSeleccionado.acabados.map((acabado) => (
                <button key={acabado} onClick={() => elegirAcabado(acabado)}
                  className="bg-white border-2 border-gray-200 rounded-xl p-4 text-left hover:border-blue-400 transition-all">
                  <p className="font-bold text-sm text-gray-900">{ACABADO_INFO[acabado].label}</p>
                  <p className="text-sm text-gray-500 mt-1">{ACABADO_INFO[acabado].descripcion}</p>
                  {ACABADO_INFO[acabado].badge && (
                    <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200">{ACABADO_INFO[acabado].badge}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {paso === 4 && proyectoSeleccionado && materialSeleccionado && acabadoSeleccionado && (
          <div className="pt-4">
            <button onClick={volverAtras} className="text-sm mb-4 flex items-center gap-1 text-blue-600">← Volver</button>
            <div className="bg-blue-50 rounded-xl p-3 mb-5 flex flex-wrap gap-4 border border-blue-100">
              <div><p className="text-xs text-gray-400 mb-0.5">Proyecto</p><p className="font-bold text-sm text-gray-900">{proyectoSeleccionado.label}</p></div>
              <div><p className="text-xs text-gray-400 mb-0.5">Material</p><p className="font-bold text-sm text-gray-900">{MATERIAL_INFO[materialSeleccionado].label}</p></div>
              <div><p className="text-xs text-gray-400 mb-0.5">Acabado</p><p className="font-bold text-sm text-gray-900">{ACABADO_INFO[acabadoSeleccionado].label}</p></div>
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Calibre BWG</h3>
            <p className="text-xs text-gray-400 mb-3">Rango recomendado: c{proyectoSeleccionado.calibreMin} al c{proyectoSeleccionado.calibreMax}</p>
            <div className="flex flex-wrap gap-2 mb-5">
              {getCalibresPorProyecto(proyectoSeleccionado.id).map((c) => {
                const sel   = calibreSeleccionado?.calibre === c.calibre
                const esRec = c.calibre === proyectoSeleccionado.calibreRecomendado
                return (
                  <button key={c.calibre} onClick={() => setCalibreSeleccionado(c)}
                    className="rounded-xl p-3 text-center transition-all"
                    style={{ minWidth: 64, background: sel ? '#EFF6FF' : 'white', border: `2px solid ${sel ? '#1E6AC8' : '#E5E7EB'}` }}>
                    <p className="font-bold text-sm text-gray-900">{c.calibre}</p>
                    <p className="text-xs text-gray-500">{c.thicknessMm}mm</p>
                    {esRec && <p className="text-xs mt-1 text-blue-600">⭐ rec.</p>}
                  </button>
                )
              })}
            </div>
            <h3 className="font-bold text-gray-900 mb-3">Medida de la chapa</h3>
            <div className="flex flex-col gap-2 mb-4">
              {getMedidas().map((m, idx) => (
                <button key={idx} onClick={() => setMedidaIdx(idx)}
                  className="rounded-xl p-3 text-left text-sm transition-all"
                  style={{ background: medidaIdx === idx ? '#EFF6FF' : 'white', border: `2px solid ${medidaIdx === idx ? '#1E6AC8' : '#E5E7EB'}`, color: medidaIdx === idx ? '#1E6AC8' : '#6B7280', fontWeight: medidaIdx === idx ? 600 : 400 }}>
                  {m.label}
                </button>
              ))}
            </div>
            {esAMedida() && (
              <div className="flex gap-3 mb-4">
                <div className="flex-1">
                  <label className="text-xs text-gray-500 mb-1 block">Ancho (m)</label>
                  <input type="number" min="0" step="0.01" value={aMedidaAncho} onChange={e => setAMedidaAncho(e.target.value)} placeholder="ej: 1.20"
                    className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400" />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-500 mb-1 block">Largo (m)</label>
                  <input type="number" min="0" step="0.01" value={aMedidaLargo} onChange={e => setAMedidaLargo(e.target.value)} placeholder="ej: 2.50"
                    className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400" />
                </div>
              </div>
            )}
            <h3 className="font-bold text-gray-900 mb-3">¿Cómo querés calcular?</h3>
            <div className="flex gap-2 mb-4">
              {(['superficie', 'cantidad', 'tonelada'] as ModoCalculo[]).map(m => (
                <button key={m} onClick={() => setModoCalculo(m)} className="flex-1 py-2 rounded-xl text-xs transition-all"
                  style={{ background: modoCalculo === m ? '#EFF6FF' : 'white', border: `2px solid ${modoCalculo === m ? '#1E6AC8' : '#E5E7EB'}`, color: modoCalculo === m ? '#1E6AC8' : '#6B7280', fontWeight: modoCalculo === m ? 600 : 400 }}>
                  {m === 'superficie' ? '📐 Superficie' : m === 'cantidad' ? '🔢 Cantidad' : '⚖️ Tonelada'}
                </button>
              ))}
            </div>
            {modoCalculo === 'superficie' && logica === 'porton' && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">Orientación de la chapa</p>
                <div className="flex gap-2">
                  {(['vertical', 'horizontal'] as Orientacion[]).map(o => (
                    <button key={o} onClick={() => setOrientacion(o)} className="flex-1 py-2 rounded-xl text-sm transition-all"
                      style={{ background: orientacion === o ? '#EFF6FF' : 'white', border: `2px solid ${orientacion === o ? '#1E6AC8' : '#E5E7EB'}`, color: orientacion === o ? '#1E6AC8' : '#6B7280' }}>
                      {o === 'vertical' ? '↕ Vertical' : '↔ Horizontal'}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {modoCalculo === 'superficie' && (
              <div className="flex gap-3 mb-4">
                <div className="flex-1">
                  <label className="text-xs text-gray-500 mb-1 block">{logica === 'porton' ? 'Ancho del portón (m)' : 'Ancho a cubrir (m)'}</label>
                  <input type="number" min="0" step="0.01" value={supAncho} onChange={e => setSupAncho(e.target.value)} placeholder="ej: 3.00"
                    className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400" />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-500 mb-1 block">{logica === 'porton' ? 'Alto del portón (m)' : 'Largo a cubrir (m)'}</label>
                  <input type="number" min="0" step="0.01" value={supLargo} onChange={e => setSupLargo(e.target.value)} placeholder="ej: 2.00"
                    className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400" />
                </div>
              </div>
            )}
            {modoCalculo === 'cantidad' && (
              <div className="flex items-center gap-4 mb-4">
                <button onClick={() => setCantidadDirecta(v => Math.max(1, v - 1))} className="w-12 h-12 rounded-xl text-xl font-bold bg-white border-2 border-gray-200 text-gray-900">−</button>
                <span className="text-2xl font-bold text-gray-900 min-w-[40px] text-center">{cantidadDirecta}</span>
                <button onClick={() => setCantidadDirecta(v => v + 1)} className="w-12 h-12 rounded-xl text-xl font-bold bg-white border-2 border-gray-200 text-gray-900">+</button>
                <span className="text-sm text-gray-500">chapas</span>
              </div>
            )}
            {modoCalculo === 'tonelada' && (
              <div className="mb-4">
                <label className="text-xs text-gray-500 mb-1 block">Toneladas</label>
                <input type="number" min="0" step="0.1" value={toneladas} onChange={e => setToneladas(e.target.value)} placeholder="ej: 1.5"
                  className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400" />
              </div>
            )}
            {chapasCalculadas !== null && chapasCalculadas > 0 && (
              <div className="bg-blue-50 border-2 border-blue-400 rounded-xl p-4 mb-5 text-center">
                <p className="text-sm text-blue-600 mb-1">Chapas necesarias</p>
                <p className="text-4xl font-bold text-gray-900">{chapasCalculadas}</p>
                <p className="text-xs text-gray-500 mt-1">chapas</p>
              </div>
            )}
            <button onClick={irAlResultado}
              disabled={!calibreSeleccionado || chapasCalculadas === null || chapasCalculadas <= 0}
              className="w-full rounded-xl py-4 font-bold text-base transition-all disabled:opacity-40 disabled:cursor-not-allowed text-white"
              style={{ background: '#1E6AC8' }}>
              Ver resultado →
            </button>
          </div>
        )}

        {paso === 5 && proyectoSeleccionado && materialSeleccionado && acabadoSeleccionado && calibreSeleccionado && (
          <div className="pt-4">
            <button onClick={volverAtras} className="text-sm mb-4 flex items-center gap-1 text-blue-600">← Volver</button>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Tu pedido</h2>

            <div className="bg-white rounded-2xl border-2 border-blue-400 p-5 mb-4 flex flex-col gap-3">
              <div className="flex justify-between text-sm"><span className="text-gray-400">Proyecto</span><span className="font-bold text-gray-900">{proyectoSeleccionado.label}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-400">Material</span><span className="font-bold text-gray-900">{MATERIAL_INFO[materialSeleccionado].label}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-400">Acabado</span><span className="font-bold text-gray-900">{ACABADO_INFO[acabadoSeleccionado].label}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-400">Calibre</span><span className="font-bold text-gray-900">c{calibreSeleccionado.calibre} ({calibreSeleccionado.thicknessMm} mm)</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-400">Medida</span><span className="font-bold text-gray-900">{esAMedida() ? `${aMedidaAncho}m × ${aMedidaLargo}m` : getMedidas()[medidaIdx]?.label}</span></div>
              <div className="pt-3 flex justify-between border-t border-gray-100">
                <span className="text-sm text-gray-400">Cantidad</span>
                <span className="font-bold text-lg text-blue-600">{chapasCalculadas} chapas</span>
              </div>
              <div className="flex justify-between text-sm"><span className="text-gray-400">Peso total</span><span className="font-bold text-gray-900">{pesoCalculado?.toFixed(2)} kg</span></div>
            </div>

            <MensajePreview />

            <button onClick={handleWhatsAppClick}
              className="w-full rounded-xl font-bold text-base flex flex-col items-center justify-center gap-1 mb-4 text-white"
              style={{ background: '#25D366', padding: '14px 16px' }}>
              <span>📲 Enviar pedido por WhatsApp</span>
              <span className="text-xs font-normal opacity-90">Se abre WhatsApp con el mensaje listo — solo tocás enviar</span>
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400">o si preferís un documento formal</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <PresupuestoPreview />

            <a href={generarLinkPresupuesto()}
              onClick={(e) => { e.preventDefault(); handlePresupuestoClick() }}
              className="w-full rounded-xl font-bold text-base flex flex-col items-center justify-center gap-1 mb-3 text-white"
              style={{ background: '#1E6AC8', padding: '14px 16px', textDecoration: 'none' }}>
              <span>📄 Generar presupuesto con PDF</span>
              <span className="text-xs font-normal opacity-90">Con logo · datos completos · listo para enviar</span>
            </a>

            <button onClick={() => { setPaso(1); setProyectoSeleccionado(null); setMaterialSeleccionado(null); setAcabadoSeleccionado(null); setCalibreSeleccionado(null) }}
              className="w-full py-3 text-sm font-medium rounded-xl mb-4 border-2 border-gray-200 text-gray-600 bg-white">
              Hacer otro pedido
            </button>

            <div className="px-4 py-3 rounded-2xl flex items-center gap-3 bg-white border border-gray-200">
              <img src="/logo.jpg" alt="Logo" className="rounded-xl object-cover flex-shrink-0 cursor-pointer"
                onClick={() => router.push('/')} style={{ width: 40, height: 40, border: '1.5px solid #E5E7EB' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-sm text-gray-900" style={{ margin: 0 }}>La Cooperativa Metalúrgica Argentina</p>
                  <BanderaArgentina />
                </div>
                <p className="text-xs text-gray-400 mt-0.5" style={{ margin: 0 }}>Villa Lugano, CABA · Argentina</p>
              </div>
            </div>
          </div>
        )}

      </div>

      <div className="flex justify-around items-center px-4 py-3" style={{ background: '#0B1F3A', borderTop: '0.5px solid rgba(45,212,191,0.2)' }}>
        <a href="/" className="flex flex-col items-center gap-1">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(247,250,255,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          <span className="text-xs" style={{ color: 'rgba(247,250,255,0.4)' }}>Inicio</span>
        </a>
        <div className="flex flex-col items-center gap-1">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2DD4BF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
          <span className="text-xs font-bold" style={{ color: '#2DD4BF' }}>Calculadora</span>
        </div>
        <a href="/presupuestos" className="flex flex-col items-center gap-1">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(247,250,255,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          <span className="text-xs" style={{ color: 'rgba(247,250,255,0.4)' }}>Presupuestos</span>
        </a>
        <a href="/login" className="flex flex-col items-center gap-1">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(247,250,255,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>
          <span className="text-xs" style={{ color: 'rgba(247,250,255,0.4)' }}>Más</span>
        </a>
      </div>

      <div style={{ background: '#0B1F3A', borderTop: '0.5px solid rgba(45,212,191,0.1)', overflow: 'hidden' }}>
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

    </main>
  )
}