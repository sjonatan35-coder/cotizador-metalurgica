import type { CalibreBwg } from '@/types'

// ─────────────────────────────────────────────
// MATERIALES
// ─────────────────────────────────────────────
export type Material = 'LAF' | 'LAC' | 'GALVANIZADO'

export const MATERIAL_LABELS: Record<Material, string> = {
  LAF:         'LAF — Laminado en Frío',
  LAC:         'LAC — Laminado en Caliente',
  GALVANIZADO: 'Galvanizado',
}

// ─────────────────────────────────────────────
// PROYECTOS — Lo que ve el cliente
// ─────────────────────────────────────────────
export interface Proyecto {
  id:                  string
  label:               string
  descripcion:         string
  materiales:          Material[]
  calibreMin:          number
  calibreMax:          number
  calibreRecomendado:  number
  medidasEspeciales?:  { label: string; widthMm: number; lengthMm: number }[]
  nota?:               string
}
export const PROYECTOS: Proyecto[] = [
  {
    id:                 'porton',
    label:              'Portón',
    descripcion:        'Portones corredizos, batientes o seccionales',
    materiales:         ['LAF', 'LAC', 'GALVANIZADO'],
    calibreMin:         14,
    calibreMax:         18,
    calibreRecomendado: 16,
  },
  {
    id:                 'piso',
    label:              'Piso',
    descripcion:        'Pisos industriales, plataformas y entrepanos',
    materiales:         ['LAF', 'LAC', 'GALVANIZADO'],
    calibreMin:         14,
    calibreMax:         16,
    calibreRecomendado: 14,
  },
  {
    id:                 'techo',
    label:              'Techo',
    descripcion:        'Chapas para techos y cubiertas',
    materiales:         ['GALVANIZADO'],
    calibreMin:         22,
    calibreMax:         27,
    calibreRecomendado: 25,
    medidasEspeciales: [
      { label: '1000 × 3000 mm', widthMm: 1000, lengthMm: 3000 },
      { label: '1000 × 6000 mm', widthMm: 1000, lengthMm: 6000 },
    ],
    nota: 'El calibre 25 galvanizado es el más usado para techos',
  },
  {
    id:                 'estructura',
    label:              'Estructura',
    descripcion:        'Estructuras metálicas, vigas y refuerzos',
    materiales:         ['LAF', 'LAC', 'GALVANIZADO'],
    calibreMin:         10,
    calibreMax:         14,
    calibreRecomendado: 12,
  },
  {
    id:                 'zingueria',
    label:              'Zinguería',
    descripcion:        'Chapas finas para revestimientos y terminaciones',
    materiales:         ['GALVANIZADO'],
    calibreMin:         28,
    calibreMax:         34,
    calibreRecomendado: 30,
    nota:               'Venta por mayor y menor',
  },
  {
    id:                 'trailer',
    label:              'Trailer',
    descripcion:        'Pisos y laterales para trailers y acoplados',
    materiales:         ['LAF', 'LAC', 'GALVANIZADO'],
    calibreMin:         14,
    calibreMax:         18,
    calibreRecomendado: 16,
  },
  {
    id:                 'estampado',
    label:              'Estampado / CNC',
    descripcion:        'Cortes a medida con CNC según plano del cliente',
    materiales:         ['LAF', 'LAC', 'GALVANIZADO'],
    calibreMin:         7,
    calibreMax:         27,
    calibreRecomendado: 16,
    nota:               'Corte CNC propio o tercerizado según medida',
  },
  {
    id:                 'otros',
    label:              'Otros',
    descripcion:        'Cocinas, muebles, proyectos especiales y más',
    materiales:         ['LAF', 'LAC', 'GALVANIZADO'],
    calibreMin:         7,
    calibreMax:         34,
    calibreRecomendado: 16,
    nota:               'El cliente describe su proyecto y elige libremente',
  },
]

// ─────────────────────────────────────────────
// CALIBRES BWG
// ─────────────────────────────────────────────
export const CALIBRES_BWG: CalibreBwg[] = [
  { calibre: 7,  thicknessMm: 4.572, thicknessIn: 0.180 },
  { calibre: 8,  thicknessMm: 4.191, thicknessIn: 0.165 },
  { calibre: 9,  thicknessMm: 3.759, thicknessIn: 0.148 },
  { calibre: 10, thicknessMm: 3.404, thicknessIn: 0.134 },
  { calibre: 11, thicknessMm: 3.048, thicknessIn: 0.120 },
  { calibre: 12, thicknessMm: 2.769, thicknessIn: 0.109 },
  { calibre: 13, thicknessMm: 2.413, thicknessIn: 0.095 },
  { calibre: 14, thicknessMm: 2.108, thicknessIn: 0.083 },
  { calibre: 15, thicknessMm: 1.829, thicknessIn: 0.072 },
  { calibre: 16, thicknessMm: 1.651, thicknessIn: 0.065 },
  { calibre: 17, thicknessMm: 1.473, thicknessIn: 0.058 },
  { calibre: 18, thicknessMm: 1.245, thicknessIn: 0.049 },
  { calibre: 19, thicknessMm: 1.067, thicknessIn: 0.042 },
  { calibre: 20, thicknessMm: 0.889, thicknessIn: 0.035 },
  { calibre: 21, thicknessMm: 0.813, thicknessIn: 0.032 },
  { calibre: 22, thicknessMm: 0.711, thicknessIn: 0.028 },
  { calibre: 23, thicknessMm: 0.635, thicknessIn: 0.025 },
  { calibre: 24, thicknessMm: 0.559, thicknessIn: 0.022 },
  { calibre: 25, thicknessMm: 0.508, thicknessIn: 0.020 },
  { calibre: 26, thicknessMm: 0.457, thicknessIn: 0.018 },
  { calibre: 27, thicknessMm: 0.406, thicknessIn: 0.016 },
  // Desde C28: solo Galvanizado
  { calibre: 28, thicknessMm: 0.356, thicknessIn: 0.014 },
  { calibre: 29, thicknessMm: 0.330, thicknessIn: 0.013 },
  { calibre: 30, thicknessMm: 0.305, thicknessIn: 0.012 },
  { calibre: 31, thicknessMm: 0.279, thicknessIn: 0.011 },
  { calibre: 32, thicknessMm: 0.254, thicknessIn: 0.010 },
  { calibre: 33, thicknessMm: 0.229, thicknessIn: 0.009 },
  { calibre: 34, thicknessMm: 0.203, thicknessIn: 0.008 },
]

// ─────────────────────────────────────────────
// DENSIDADES (kg/m³)
// ─────────────────────────────────────────────
export const DENSIDADES: Record<Material, number> = {
  LAF:         7850,
  LAC:         7850,
  GALVANIZADO: 7800,
}

// ─────────────────────────────────────────────
// MEDIDAS ESTÁNDAR
// ─────────────────────────────────────────────
export const MEDIDAS_ESTANDAR = [
  { label: '1000 × 2000 mm',            widthMm: 1000, lengthMm: 2000 },
  { label: '1220 × 2440 mm (4×8 pies)', widthMm: 1220, lengthMm: 2440 },
  { label: '1500 × 3000 mm',            widthMm: 1500, lengthMm: 3000 },
  { label: '1000 × 3000 mm',            widthMm: 1000, lengthMm: 3000 },
  { label: '1000 × 6000 mm',            widthMm: 1000, lengthMm: 6000 },
  { label: '2000 × 4000 mm',            widthMm: 2000, lengthMm: 4000 },
  { label: 'A medida',                  widthMm: 0,    lengthMm: 0    },
] as const

// ─────────────────────────────────────────────
// FUNCIONES
// ─────────────────────────────────────────────

export function calcularPeso(
  widthMm: number,
  lengthMm: number,
  thicknessMm: number,
  material: Material
): number {
  const densidad = DENSIDADES[material]
  const peso = (widthMm / 1000) * (lengthMm / 1000) * (thicknessMm / 1000) * densidad
  return Math.round(peso * 100) / 100
}

export function getCalibresPorProyecto(
  proyectoId: string,
  soloRecomendados = false
): CalibreBwg[] {
  const proyecto = PROYECTOS.find(p => p.id === proyectoId)
  if (!proyecto) return CALIBRES_BWG
  if (soloRecomendados) {
    return CALIBRES_BWG.filter(
      c => c.calibre >= proyecto.calibreMin && c.calibre <= proyecto.calibreMax
    )
  }
  const recomendados = CALIBRES_BWG.filter(
    c => c.calibre >= proyecto.calibreMin && c.calibre <= proyecto.calibreMax
  )
  const resto = CALIBRES_BWG.filter(
    c => c.calibre < proyecto.calibreMin || c.calibre > proyecto.calibreMax
  )
  return [...recomendados, ...resto]
}

export function getCalibre(calibreNum: number): CalibreBwg | undefined {
  return CALIBRES_BWG.find(c => c.calibre === calibreNum)
}

export function getProyecto(proyectoId: string): Proyecto | undefined {
  return PROYECTOS.find(p => p.id === proyectoId)
}