'use client'

import { useState } from 'react'
import {
  DoorOpen, Layers, Home, Grid3x3,
  Scissors, Truck, Cpu, Lightbulb,
  Hammer, MessageCircle,
  type LucideIcon
} from 'lucide-react'
import { PROYECTOS, type Proyecto } from '@/lib/calibres'

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

export default function CalculadoraPage() {
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState<Proyecto | null>(null)

  return (
    <main className="min-h-screen bg-brand-light">

      {/* Header */}
      <div className="bg-brand-navy text-white p-6">
        <h1 className="text-2xl font-bold">🏭 La Metalúrgica</h1>
        <p className="text-sm text-blue-300 mt-1">Cooperativa Argentina — Calculadora de chapas</p>
      </div>

      <div className="p-6 max-w-2xl mx-auto">

        {/* Paso 1 — Selección de proyecto */}
        {!proyectoSeleccionado && (
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
                    onClick={() => setProyectoSeleccionado(proyecto)}
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

        {/* Proyecto seleccionado */}
        {proyectoSeleccionado && (
          <div>
            <button
              onClick={() => setProyectoSeleccionado(null)}
              className="text-brand-accent text-sm mb-4 flex items-center gap-1"
            >
              ← Volver
            </button>
            <div className="bg-white rounded-xl p-5 border-2 border-brand-accent">
              <div className="bg-brand-light rounded-lg p-3 w-fit">
                {(() => {
                  const Icono = ICONOS[proyectoSeleccionado.id]
                  if (!Icono) return null
                  return <Icono className="text-brand-accent" size={32} />
                })()}
              </div>
              <h2 className="text-xl font-bold text-brand-navy mt-3">
                {proyectoSeleccionado.label}
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                {proyectoSeleccionado.descripcion}
              </p>
              {proyectoSeleccionado.nota && (
                <p className="text-brand-accent text-sm mt-3 font-medium">
                  ⭐ {proyectoSeleccionado.nota}
                </p>
              )}
              <p className="text-gray-400 text-xs mt-4">
                Materiales: {proyectoSeleccionado.materiales.join(', ')}
              </p>
              <p className="text-gray-400 text-xs">
                Calibres: C{proyectoSeleccionado.calibreMin} a C{proyectoSeleccionado.calibreMax}
              </p>
            </div>
            <p className="text-center text-gray-400 text-sm mt-6">
              Próximo paso: selección de material...
            </p>
          </div>
        )}

      </div>
    </main>
  )
}