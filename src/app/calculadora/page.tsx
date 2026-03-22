'use client'

import { useState } from 'react'
import {
  DoorOpen, Layers, Home, Grid3x3,
  Scissors, Truck, Lightbulb,
  Hammer, MessageCircle, ChevronRight,
  type LucideIcon
} from 'lucide-react'
import { PROYECTOS, type Proyecto, type Material } from '@/lib/calibres'

// ─── Íconos por proyecto ───────────────────────
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

// ─── Info de materiales para el cliente ────────
const MATERIAL_INFO: Record<Material, { label: string; descripcion: string }> = {
  LAF: {
    label:      'LAF — Laminado en Frío',
    descripcion:'Superficie lisa y uniforme. Ideal para portones, pisos y estructuras donde se necesita buena terminación.',
  },
  LAC: {
    label:      'LAC — Laminado en Caliente',
    descripcion:'Mayor resistencia y grosor. Ideal para estructuras, trailers y usos industriales pesados.',
  },
  GALVANIZADO: {
    label:      'Galvanizado',
    descripcion:'Protección contra la corrosión. Ideal para techos, exteriores y ambientes húmedos.',
  },
}

// ─── Número de teléfono de WhatsApp ────────────
const WA_NUMBER = '5491159396358'

export default function CalculadoraPage() {
  const [paso, setPaso] = useState<1 | 2>(1)
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState<Proyecto | null>(null)
  const [materialSeleccionado, setMaterialSeleccionado] = useState<Material | null>(null)

  // Elige proyecto
  function elegirProyecto(proyecto: Proyecto) {
    setProyectoSeleccionado(proyecto)
    setMaterialSeleccionado(null)

    // CNC va directo a WhatsApp
    if (proyecto.logica === 'whatsapp') {
      const msg = encodeURIComponent('Hola! Quiero consultar sobre el servicio de Corte CNC.')
      window.open(`https://wa.me/${WA_NUMBER}?text=${msg}`, '_blank')
      return
    }

    // 1 solo material → se saltea el Paso 2
    if (proyecto.materiales.length === 1) {
      setMaterialSeleccionado(proyecto.materiales[0])
      setPaso(2)
      return
    }

    // Más de 1 material → muestra el Paso 2
    setPaso(2)
  }

  // Volver al paso anterior (no siempre al inicio)
  function volverAtras() {
    if (paso === 2 && materialSeleccionado) {
      // Tenía material elegido → volver a elegir material
      // (pero solo si el proyecto tiene más de 1 material, si no volver al paso 1)
      if (proyectoSeleccionado && proyectoSeleccionado.materiales.length > 1) {
        setMaterialSeleccionado(null)
      } else {
        setPaso(1)
        setProyectoSeleccionado(null)
        setMaterialSeleccionado(null)
      }
    } else {
      // Estaba eligiendo material → volver al Paso 1
      setPaso(1)
      setProyectoSeleccionado(null)
      setMaterialSeleccionado(null)
    }
  }

  return (
    <main className="min-h-screen bg-brand-light">

      {/* Header */}
      <div className="bg-brand-navy text-white p-6">
        <h1 className="text-2xl font-bold">🏭 La Metalúrgica</h1>
        <p className="text-sm text-blue-300 mt-1">Cooperativa Argentina — Calculadora de chapas</p>
      </div>

      {/* Barra de progreso */}
      <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-2 text-sm">
        <span className={paso === 1 ? 'font-bold text-brand-accent' : 'text-gray-400'}>
          1. Proyecto
        </span>
        <ChevronRight size={14} className="text-gray-300" />
        <span className={paso === 2 && !materialSeleccionado ? 'font-bold text-brand-accent' : paso > 1 ? 'text-gray-400' : 'text-gray-300'}>
          2. Material
        </span>
        <ChevronRight size={14} className="text-gray-300" />
        <span className="text-gray-300">3. Medidas</span>
        <ChevronRight size={14} className="text-gray-300" />
        <span className="text-gray-300">4. Resultado</span>
      </div>

      <div className="p-6 max-w-2xl mx-auto">

        {/* ── PASO 1 — Selección de proyecto ── */}
        {paso === 1 && (
          <div>
            <h2 className="text-xl font-bold text-brand-navy mb-2">
              ¿Para qué es tu proyecto?
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              Elegí una categoría y te ayudamos a encontrar la chapa ideal.
            </p>
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

        {/* ── PASO 2 — Selección de material ── */}
        {paso === 2 && proyectoSeleccionado && !materialSeleccionado && (
          <div>
            <button
              onClick={volverAtras}
              className="text-brand-accent text-sm mb-4 flex items-center gap-1"
            >
              ← Volver
            </button>

            <h2 className="text-xl font-bold text-brand-navy mb-2">
              ¿De qué material lo querés?
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              Proyecto: <span className="font-medium text-brand-navy">{proyectoSeleccionado.label}</span>
            </p>

            <div className="flex flex-col gap-3">
              {proyectoSeleccionado.materiales.map((material) => {
                const info = MATERIAL_INFO[material]
                return (
                  <button
                    key={material}
                    onClick={() => setMaterialSeleccionado(material)}
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

        {/* ── PASO 2 completado — material seleccionado ── */}
        {paso === 2 && proyectoSeleccionado && materialSeleccionado && (
          <div>
            <button
              onClick={volverAtras}
              className="text-brand-accent text-sm mb-4 flex items-center gap-1"
            >
              ← Volver
            </button>
            <div className="bg-white rounded-xl p-5 border-2 border-brand-accent">
              <p className="text-sm text-gray-400">Proyecto</p>
              <p className="font-bold text-brand-navy">{proyectoSeleccionado.label}</p>
              <p className="text-sm text-gray-400 mt-2">Material</p>
              <p className="font-bold text-brand-navy">{MATERIAL_INFO[materialSeleccionado].label}</p>
            </div>
            <p className="text-center text-gray-400 text-sm mt-6">
              Próximo paso: selección de medidas...
            </p>
          </div>
        )}

      </div>
    </main>
  )
}