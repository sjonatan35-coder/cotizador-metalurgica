'use client'

import { useState } from 'react'
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
  calcularPeso, calcularPesoTotal, MERMA_ESTAMPADO_M,
  ACABADO_LABELS,
} from '@/lib/calibres'
import type { CalibreBwg } from '@/types'

const ICONOS: Record<string, LucideIcon> = {
  porton:     DoorOpen,
  piso:       Layers,
  techo:      Home,
  estructura: Grid3x3,
  zingueria:  Scissors,
  trailer:    Truck,
  estampada:  Hammer,
  cnc:        MessageCircle,
  otros:      Lightbulb,
}

const MATERIAL_INFO: Record<Material, { label: string; descripcion: string }> = {
  LAF: {
    label:      'LAF — Laminado en Frío',
    descripcion:'Superficie lisa y uniforme. Ideal para portones, pisos y estructuras.',
  },
  LAC: {
    label:      'LAC — Laminado en Caliente',
    descripcion:'Mayor resistencia y grosor. Ideal para estructuras y usos industriales pesados.',
  },
  GALVANIZADO: {
    label:      'Galvanizado',
    descripcion:'Protección contra la corrosión. Ideal para techos y ambientes húmedos.',
  },
}

const ACABADO_INFO: Record<Acabado, { label: string; descripcion: string; badge?: string }> = {
  liso: {
    label:      'Liso',
    descripcion:'Superficie plana y uniforme. La más común para portones y estructuras.',
    badge:      'más elegido',
  },
  estampado: {
    label:      'Estampado',
    descripcion:'Chapa con relieve de fábrica. Mayor resistencia al deslizamiento y mejor terminación estética.',
  },
  diseño: {
    label:      'A diseño (CNC)',
    descripcion:'Corte especial a medida con diseño personalizado. Completá el pedido y te contactamos.',
  },
}

type Paso = 1 | 2 | 3 | 4 | 5
type Orientacion = 'vertical' | 'horizontal'
type ModoCalculo = 'superficie' | 'cantidad' | 'tonelada'

const WA_NUMBER = '5491159396358'

export default function CalculadoraPage() {
  const [paso, setPaso] = useState<Paso>(1)
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState<Proyecto | null>(null)
  const [materialSeleccionado, setMaterialSeleccionado] = useState<Material | null>(null)
  const [acabadoSeleccionado,  setAcabadoSeleccionado]  = useState<Acabado | null>(null)
  const [calibreSeleccionado,  setCalibreSeleccionado]  = useState<CalibreBwg | null>(null)

  const [medidaIdx,    setMedidaIdx]    = useState(0)
  const [aMedidaAncho, setAMedidaAncho] = useState('')
  const [aMedidaLargo, setAMedidaLargo] = useState('')

  const [supAncho,    setSupAncho]    = useState('')
  const [supLargo,    setSupLargo]    = useState('')
  const [orientacion, setOrientacion] = useState<Orientacion>('vertical')

  const [modoCalculo,     setModoCalculo]     = useState<ModoCalculo>('superficie')
  const [cantidadDirecta, setCantidadDirecta] = useState(1)
  const [toneladas,       setToneladas]       = useState('')

  function getMedidas() {
    if (!proyectoSeleccionado) return MEDIDAS_ESTANDAR
    if (proyectoSeleccionado.medidasEspeciales?.length) {
      return proyectoSeleccionado.medidasEspeciales as { label: string; widthM: number; lengthM: number }[]
    }
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
    if (acabadoSeleccionado === 'estampado' || proyectoSeleccionado?.logica === 'estampada') {
      return largo - MERMA_ESTAMPADO_M
    }
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

    if (proyectoSeleccionado.logica === 'porton') {
      return calcularCantidadChapas(ancho, largo, chapaAncho, chapaLargo,
        orientacion === 'vertical' ? 'normal' : 'rotada')
    }

    return calcularCantidadChapas(ancho, largo, chapaAncho, chapaLargo)
  }

  function calcularPesoResultado(): number | null {
    const chapas = calcularChapas()
    if (!chapas || !calibreSeleccionado || !materialSeleccionado) return null
    return calcularPesoTotal(getChapaAncho(), getChapaLargo(), calibreSeleccionado.thicknessMm, materialSeleccionado, chapas)
  }

  function elegirProyecto(proyecto: Proyecto) {
    setProyectoSeleccionado(proyecto)
    setMaterialSeleccionado(null)
    setAcabadoSeleccionado(null)
    setCalibreSeleccionado(null)
    setMedidaIdx(0)
    setSupAncho(''); setSupLargo('')
    setModoCalculo('superficie')
    if (proyecto.materiales.length === 1) {
      setMaterialSeleccionado(proyecto.materiales[0])
      setPaso(3)
      return
    }
    setPaso(2)
  }

  function elegirMaterial(material: Material) {
    setMaterialSeleccionado(material)
    setAcabadoSeleccionado(null)
    setPaso(3)
  }

  function elegirAcabado(acabado: Acabado) {
    setAcabadoSeleccionado(acabado)
    if (proyectoSeleccionado) {
      const calibres = getCalibresPorProyecto(proyectoSeleccionado.id)
      const rec = calibres.find(c => c.calibre === proyectoSeleccionado.calibreRecomendado)
      setCalibreSeleccionado(rec ?? calibres[0] ?? null)
    }
    setPaso(4)
  }

  function volverAtras() {
    if (paso === 2) {
      setPaso(1); setProyectoSeleccionado(null)
    } else if (paso === 3) {
      if (proyectoSeleccionado && proyectoSeleccionado.materiales.length === 1) {
        setPaso(1); setProyectoSeleccionado(null); setMaterialSeleccionado(null)
      } else {
        setPaso(2); setMaterialSeleccionado(null)
      }
      setAcabadoSeleccionado(null)
    } else if (paso === 4) {
      setPaso(3); setAcabadoSeleccionado(null); setCalibreSeleccionado(null)
    } else if (paso === 5) {
      setPaso(4)
    }
  }

  function generarMensajeWA(): string {
    const chapas = calcularChapas()
    const pesoKg = calcularPesoResultado()
    const medida = getMedidas()[medidaIdx]
    const medidaLabel = esAMedida()
      ? `${aMedidaAncho}m × ${aMedidaLargo}m (a medida)`
      : medida?.label ?? ''
    const lines = [
      '🏭 *Pedido — La Cooperativa Metalúrgica Argentina*',
      '',
      `📦 Proyecto: ${proyectoSeleccionado?.label}`,
      `🔩 Material: ${materialSeleccionado} — ${ACABADO_LABELS[acabadoSeleccionado!]}`,
      `📐 Calibre: ${calibreSeleccionado?.calibre} BWG (${calibreSeleccionado?.thicknessMm} mm)`,
      `📏 Medida: ${medidaLabel}`,
      `🔢 Cantidad: ${chapas} chapas`,
      `⚖️ Peso total: ${pesoKg?.toFixed(2)} kg`,
      '',
      'Por favor confirmen disponibilidad y precio. ¡Gracias!',
    ]
    return encodeURIComponent(lines.join('\n'))
  }

  const chapasCalculadas = calcularChapas()
  const pesoCalculado    = calcularPesoResultado()
  const logica           = proyectoSeleccionado?.logica

  function clsPaso(p: number) {
    if (paso === p) return 'font-bold text-brand-accent'
    if (paso > p)   return 'text-gray-400'
    return 'text-gray-300'
  }

  return (
    <main className="min-h-screen bg-brand-light">

      {/* Header con logo real */}
      <div className="bg-brand-navy text-white p-4 flex items-center gap-3">
        <img
          src="/logo.jpg"
          alt="La Cooperativa Metalúrgica Argentina"
          className="h-10 w-10 rounded-lg object-cover"
        />
        <div>
          <h1 className="text-base font-bold leading-tight">La Metalúrgica</h1>
          <p className="text-xs text-blue-300">Cooperativa Argentina — Calculadora de chapas</p>
        </div>
      </div>

      {/* Barra de progreso */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-1 text-xs overflow-x-auto">
        <span className={clsPaso(1)}>1. Proyecto</span>
        <ChevronRight size={12} className="text-gray-300 shrink-0" />
        <span className={clsPaso(2)}>2. Material</span>
        <ChevronRight size={12} className="text-gray-300 shrink-0" />
        <span className={clsPaso(3)}>3. Acabado</span>
        <ChevronRight size={12} className="text-gray-300 shrink-0" />
        <span className={clsPaso(4)}>4. Medidas</span>
        <ChevronRight size={12} className="text-gray-300 shrink-0" />
        <span className={clsPaso(5)}>5. Resultado</span>
      </div>

      <div className="p-6 max-w-2xl mx-auto">

        {/* PASO 1 — Proyecto */}
        {paso === 1 && (
          <div>
            <h2 className="text-xl font-bold text-brand-navy mb-2">¿Para qué es tu proyecto?</h2>
            <p className="text-gray-500 text-sm mb-6">Elegí una categoría y te ayudamos a encontrar la chapa ideal.</p>
            <div className="grid grid-cols-2 gap-3">
              {PROYECTOS.map((proyecto) => {
                const Icono = ICONOS[proyecto.id]
                if (!Icono) return null
                return (
                  <button
                    key={proyecto.id}
                    onClick={() => elegirProyecto(proyecto)}
                    className="bg-white border-2 border-gray-200 rounded-xl p-4 text-left hover:border-brand-accent hover:shadow-md transition-all"
                  >
                    <div className="bg-brand-light rounded-lg p-2 w-fit">
                      <Icono className="text-brand-accent" size={28} />
                    </div>
                    <p className="font-bold text-brand-navy mt-3">{proyecto.label}</p>
                    <p className="text-xs text-gray-500 mt-1">{proyecto.descripcion}</p>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* PASO 2 — Material */}
        {paso === 2 && proyectoSeleccionado && (
          <div>
            <button onClick={volverAtras} className="text-brand-accent text-sm mb-4 flex items-center gap-1">← Volver</button>
            <h2 className="text-xl font-bold text-brand-navy mb-2">¿De qué material lo querés?</h2>
            <p className="text-gray-500 text-sm mb-6">Proyecto: <span className="font-medium text-brand-navy">{proyectoSeleccionado.label}</span></p>
            <div className="flex flex-col gap-3">
              {proyectoSeleccionado.materiales.map((material) => {
                const info = MATERIAL_INFO[material]
                return (
                  <button
                    key={material}
                    onClick={() => elegirMaterial(material)}
                    className="bg-white border-2 border-gray-200 rounded-xl p-4 text-left hover:border-brand-accent hover:shadow-md transition-all"
                  >
                    <p className="font-bold text-brand-navy">{info.label}</p>
                    <p className="text-sm text-gray-500 mt-1">{info.descripcion}</p>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* PASO 3 — Acabado */}
        {paso === 3 && proyectoSeleccionado && materialSeleccionado && (
          <div>
            <button onClick={volverAtras} className="text-brand-accent text-sm mb-4 flex items-center gap-1">← Volver</button>
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 mb-6 flex gap-4 text-sm">
              <div><p className="text-gray-400 text-xs">Proyecto</p><p className="font-bold text-brand-navy">{proyectoSeleccionado.label}</p></div>
              <div><p className="text-gray-400 text-xs">Material</p><p className="font-bold text-brand-navy">{MATERIAL_INFO[materialSeleccionado].label}</p></div>
            </div>
            <h2 className="text-xl font-bold text-brand-navy mb-2">¿Qué tipo de chapa necesitás?</h2>
            <p className="text-gray-500 text-sm mb-6">Elegí el acabado para tu proyecto.</p>
            <div className="flex flex-col gap-3">
              {proyectoSeleccionado.acabados.map((acabado) => {
                const info = ACABADO_INFO[acabado]
                return (
                  <button
                    key={acabado}
                    onClick={() => elegirAcabado(acabado)}
                    className="bg-white border-2 border-gray-200 rounded-xl p-4 text-left hover:border-brand-accent hover:shadow-md transition-all"
                  >
                    <p className="font-bold text-brand-navy">{info.label}</p>
                    <p className="text-sm text-gray-500 mt-1">{info.descripcion}</p>
                    {info.badge && (
                      <span className="inline-block mt-2 text-xs bg-blue-50 text-brand-accent px-2 py-0.5 rounded-full">
                        {info.badge}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* PASO 4 — Calibre + Medidas */}
        {paso === 4 && proyectoSeleccionado && materialSeleccionado && acabadoSeleccionado && (
          <div>
            <button onClick={volverAtras} className="text-brand-accent text-sm mb-4 flex items-center gap-1">← Volver</button>
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 mb-6 flex flex-wrap gap-4 text-sm">
              <div><p className="text-gray-400 text-xs">Proyecto</p><p className="font-bold text-brand-navy">{proyectoSeleccionado.label}</p></div>
              <div><p className="text-gray-400 text-xs">Material</p><p className="font-bold text-brand-navy">{MATERIAL_INFO[materialSeleccionado].label}</p></div>
              <div><p className="text-gray-400 text-xs">Acabado</p><p className="font-bold text-brand-navy">{ACABADO_INFO[acabadoSeleccionado].label}</p></div>
            </div>
            <h3 className="font-bold text-brand-navy mb-1">Calibre BWG</h3>
            <p className="text-xs text-gray-400 mb-3">Rango recomendado para {proyectoSeleccionado.label.toLowerCase()}: c{proyectoSeleccionado.calibreMin} al c{proyectoSeleccionado.calibreMax}</p>
            <div className="flex flex-wrap gap-2 mb-6">
              {getCalibresPorProyecto(proyectoSeleccionado.id).map((c) => {
                const esRec = c.calibre === proyectoSeleccionado.calibreRecomendado
                const sel   = calibreSeleccionado?.calibre === c.calibre
                return (
                  <button
                    key={c.calibre}
                    onClick={() => setCalibreSeleccionado(c)}
                    className={`rounded-xl p-3 text-center border-2 transition-all min-w-[60px]
                      ${sel ? 'border-brand-accent bg-blue-50' : 'border-gray-200 bg-white hover:border-brand-accent/50'}`}
                  >
                    <p className="font-bold text-brand-navy text-sm">{c.calibre}</p>
                    <p className="text-xs text-gray-500">{c.thicknessMm}mm</p>
                    {esRec && <p className="text-xs text-brand-accent mt-1">★ rec.</p>}
                  </button>
                )
              })}
            </div>
            <h3 className="font-bold text-brand-navy mb-3">Medida de la chapa</h3>
            <div className="flex flex-col gap-2 mb-4">
              {getMedidas().map((m, idx) => (
                <button
                  key={idx}
                  onClick={() => setMedidaIdx(idx)}
                  className={`rounded-xl p-3 text-left border-2 transition-all text-sm
                    ${medidaIdx === idx ? 'border-brand-accent bg-blue-50 font-medium text-brand-navy' : 'border-gray-200 bg-white text-gray-600'}`}
                >
                  {m.label}
                </button>
              ))}
            </div>
            {esAMedida() && (
              <div className="flex gap-3 mb-4">
                <div className="flex-1">
                  <label className="text-xs text-gray-500 mb-1 block">Ancho (m)</label>
                  <input type="number" min="0" step="0.01" value={aMedidaAncho} onChange={e => setAMedidaAncho(e.target.value)} placeholder="ej: 1.20"
                    className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-brand-accent outline-none" />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-500 mb-1 block">Largo (m)</label>
                  <input type="number" min="0" step="0.01" value={aMedidaLargo} onChange={e => setAMedidaLargo(e.target.value)} placeholder="ej: 2.50"
                    className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-brand-accent outline-none" />
                </div>
              </div>
            )}
            <h3 className="font-bold text-brand-navy mb-3">¿Cómo querés calcular?</h3>
            <div className="flex gap-2 mb-4">
              {(['superficie', 'cantidad', 'tonelada'] as ModoCalculo[]).map(m => (
                <button key={m} onClick={() => setModoCalculo(m)}
                  className={`flex-1 py-2 rounded-xl border-2 text-xs transition-all
                    ${modoCalculo === m ? 'border-brand-accent bg-blue-50 font-medium text-brand-navy' : 'border-gray-200 bg-white text-gray-500'}`}>
                  {m === 'superficie' ? '📐 Superficie' : m === 'cantidad' ? '🔢 Cantidad' : '⚖️ Tonelada'}
                </button>
              ))}
            </div>
            {modoCalculo === 'superficie' && logica === 'porton' && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">Orientación de la chapa</p>
                <div className="flex gap-2">
                  {(['vertical', 'horizontal'] as Orientacion[]).map(o => (
                    <button key={o} onClick={() => setOrientacion(o)}
                      className={`flex-1 py-2 rounded-xl border-2 text-sm transition-all
                        ${orientacion === o ? 'border-brand-accent bg-blue-50 font-medium text-brand-navy' : 'border-gray-200 bg-white text-gray-500'}`}>
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
                    className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-brand-accent outline-none" />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-500 mb-1 block">{logica === 'porton' ? 'Alto del portón (m)' : 'Largo a cubrir (m)'}</label>
                  <input type="number" min="0" step="0.01" value={supLargo} onChange={e => setSupLargo(e.target.value)} placeholder="ej: 2.00"
                    className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-brand-accent outline-none" />
                </div>
              </div>
            )}
            {modoCalculo === 'cantidad' && (
              <div className="flex items-center gap-4 mb-4">
                <button onClick={() => setCantidadDirecta(v => Math.max(1, v - 1))}
                  className="w-10 h-10 rounded-xl border-2 border-gray-200 text-xl font-bold text-brand-navy bg-white">−</button>
                <span className="text-2xl font-bold text-brand-navy min-w-[40px] text-center">{cantidadDirecta}</span>
                <button onClick={() => setCantidadDirecta(v => v + 1)}
                  className="w-10 h-10 rounded-xl border-2 border-gray-200 text-xl font-bold text-brand-navy bg-white">+</button>
                <span className="text-sm text-gray-500">chapas</span>
              </div>
            )}
            {modoCalculo === 'tonelada' && (
              <div className="mb-4">
                <label className="text-xs text-gray-500 mb-1 block">Toneladas</label>
                <input type="number" min="0" step="0.1" value={toneladas} onChange={e => setToneladas(e.target.value)} placeholder="ej: 1.5"
                  className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-brand-accent outline-none" />
              </div>
            )}
            {chapasCalculadas !== null && chapasCalculadas > 0 && (
              <div className="bg-blue-50 border-2 border-brand-accent rounded-xl p-4 mb-6 text-center">
                <p className="text-sm text-brand-accent mb-1">Chapas necesarias</p>
                <p className="text-4xl font-bold text-brand-navy">{chapasCalculadas}</p>
                <p className="text-xs text-gray-500 mt-1">chapas</p>
              </div>
            )}
            <button
              onClick={() => setPaso(5)}
              disabled={!calibreSeleccionado || chapasCalculadas === null || chapasCalculadas <= 0}
              className="w-full bg-brand-accent text-white rounded-xl py-4 font-bold text-base disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Ver resultado →
            </button>
          </div>
        )}

        {/* PASO 5 — Resultado */}
        {paso === 5 && proyectoSeleccionado && materialSeleccionado && acabadoSeleccionado && calibreSeleccionado && (
          <div>
            <button onClick={volverAtras} className="text-brand-accent text-sm mb-4 flex items-center gap-1">← Volver</button>
            <h2 className="text-xl font-bold text-brand-navy mb-6">Tu pedido</h2>
            <div className="bg-white rounded-xl border-2 border-brand-accent p-5 mb-6 flex flex-col gap-3">
              <div className="flex justify-between text-sm"><span className="text-gray-400">Proyecto</span><span className="font-bold text-brand-navy">{proyectoSeleccionado.label}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-400">Material</span><span className="font-bold text-brand-navy">{MATERIAL_INFO[materialSeleccionado].label}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-400">Acabado</span><span className="font-bold text-brand-navy">{ACABADO_INFO[acabadoSeleccionado].label}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-400">Calibre</span><span className="font-bold text-brand-navy">c{calibreSeleccionado.calibre} ({calibreSeleccionado.thicknessMm} mm)</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-400">Medida</span><span className="font-bold text-brand-navy">{esAMedida() ? `${aMedidaAncho}m × ${aMedidaLargo}m` : getMedidas()[medidaIdx]?.label}</span></div>
              <div className="border-t border-gray-100 pt-3 flex justify-between text-sm"><span className="text-gray-400">Cantidad</span><span className="font-bold text-brand-navy text-lg">{chapasCalculadas} chapas</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-400">Peso total</span><span className="font-bold text-brand-navy">{pesoCalculado?.toFixed(2)} kg</span></div>
            </div>
            <button
              onClick={() => window.open(`https://wa.me/${WA_NUMBER}?text=${generarMensajeWA()}`, '_blank')}
              className="w-full bg-green-500 hover:bg-green-600 text-white rounded-xl py-4 font-bold text-base transition-all flex items-center justify-center gap-2"
            >
              📲 Enviar pedido por WhatsApp
            </button>
            <button
              onClick={() => { setPaso(1); setProyectoSeleccionado(null); setMaterialSeleccionado(null); setAcabadoSeleccionado(null); setCalibreSeleccionado(null); }}
              className="w-full mt-3 py-3 text-brand-accent text-sm font-medium"
            >
              Hacer otro pedido
            </button>
          </div>
        )}

      </div>
    </main>
  )
}