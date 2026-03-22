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
// CONVERSIÓN DE UNIDADES → siempre a metros
// ─────────────────────────────────────────────
export type Unidad = 'mm' | 'cm' | 'm' | 'pulgadas'

export function convertirAMetros(valor: number, unidad: Unidad): number {
  switch (unidad) {
    case 'mm':       return Math.round((valor / 1000)  * 10000) / 10000
    case 'cm':       return Math.round((valor / 100)   * 10000) / 10000
    case 'm':        return Math.round(valor            * 10000) / 10000
    case 'pulgadas': return Math.round((valor * 0.0254) * 10000) / 10000
  }
}

export function formatearMetros(metros: number): string {
  return `${metros.toFixed(2)} m`
}

// ─────────────────────────────────────────────
// MERMA DE ESTAMPADO
// Las chapas estampadas pierden 2cm (0.02m) de largo
// No pierden nada de ancho
// ─────────────────────────────────────────────
export const MERMA_ESTAMPADO_M = 0.02

// ─────────────────────────────────────────────
// PROYECTOS
// ─────────────────────────────────────────────
export type LogicaCalculo =
  | 'superficie'
  | 'porton'
  | 'cantidad'
  | 'estampada'
  | 'whatsapp'
  | 'libre'

export interface Proyecto {
  id:                  string
  label:               string
  descripcion:         string
  materiales:          Material[]
  calibreMin:          number
  calibreMax:          number
  calibreRecomendado:  number
  logica:              LogicaCalculo
  medidasEspeciales?:  { label: string; widthM: number; lengthM: number }[]
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
    logica:             'porton',
  },
  {
    id:                 'piso',
    label:              'Piso',
    descripcion:        'Pisos industriales, plataformas y entrepanos',
    materiales:         ['LAF', 'LAC', 'GALVANIZADO'],
    calibreMin:         14,
    calibreMax:         16,
    calibreRecomendado: 14,
    logica:             'superficie',
  },
  {
    id:                 'techo',
    label:              'Techo',
    descripcion:        'Chapas para techos y cubiertas',
    materiales:         ['GALVANIZADO'],
    calibreMin:         22,
    calibreMax:         27,
    calibreRecomendado: 25,
    logica:             'superficie',
    medidasEspeciales: [
      { label: '1000 × 3000 mm', widthM: 1.00, lengthM: 3.00 },
      { label: '1000 × 6000 mm', widthM: 1.00, lengthM: 6.00 },
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
    logica:             'superficie',
  },
  {
    id:                 'zingueria',
    label:              'Zinguería',
    descripcion:        'Chapas finas para revestimientos y terminaciones',
    materiales:         ['GALVANIZADO'],
    calibreMin:         28,
    calibreMax:         34,
    calibreRecomendado: 30,
    logica:             'cantidad',
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
    logica:             'superficie',
  },
  {
    id:                 'estampada',
    label:              'Chapa Estampada',
    descripcion:        'Chapa con relieve de fábrica — LAF, LAC o Galvanizado',
    materiales:         ['LAF', 'LAC', 'GALVANIZADO'],
    calibreMin:         14,
    calibreMax:         22,
    calibreRecomendado: 18,
    logica:             'estampada',
    medidasEspeciales: [
      { label: '1000 × 2000 mm (queda 1000×1980)', widthM: 1.00, lengthM: 1.98 },
      { label: '1220 × 2440 mm (queda 1220×2420)', widthM: 1.22, lengthM: 2.42 },
      { label: '1500 × 3000 mm (queda 1500×2980)', widthM: 1.50, lengthM: 2.98 },
    ],
    nota: 'Las chapas estampadas pierden 2cm de largo por el proceso de estampado',
  },
  {
    id:                 'cnc',
    label:              'Corte CNC',
    descripcion:        'Diseños y cortes especiales a medida del cliente',
    materiales:         ['LAF', 'LAC', 'GALVANIZADO'],
    calibreMin:         7,
    calibreMax:         27,
    calibreRecomendado: 16,
    logica:             'whatsapp',
    nota:               'Servicio especial — te contactamos para coordinar tu diseño',
  },
  {
    id:                 'otros',
    label:              'Otros',
    descripcion:        'Armá tu pedido a medida — chapas, calibres y materiales a elección',
    materiales:         ['LAF', 'LAC', 'GALVANIZADO'],
    calibreMin:         7,
    calibreMax:         34,
    calibreRecomendado: 16,
    logica:             'libre',
    nota:               'Elegí material, calibre y medida libremente',
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
// MEDIDAS ESTÁNDAR (en metros)
// ─────────────────────────────────────────────
export const MEDIDAS_ESTANDAR = [
  { label: '1000 × 2000 mm',            widthM: 1.00, lengthM: 2.00 },
  { label: '1220 × 2440 mm (4×8 pies)', widthM: 1.22, lengthM: 2.44 },
  { label: '1500 × 3000 mm',            widthM: 1.50, lengthM: 3.00 },
  { label: '1000 × 3000 mm',            widthM: 1.00, lengthM: 3.00 },
  { label: '1000 × 6000 mm',            widthM: 1.00, lengthM: 6.00 },
  { label: '2000 × 4000 mm',            widthM: 2.00, lengthM: 4.00 },
  { label: 'A medida',                  widthM: 0,    lengthM: 0    },
] as const

// ─────────────────────────────────────────────
// FUNCIONES
// ─────────────────────────────────────────────

export function calcularPeso(
  widthM: number,
  lengthM: number,
  thicknessMm: number,
  material: Material
): number {
  const densidad = DENSIDADES[material]
  const peso = widthM * lengthM * (thicknessMm / 1000) * densidad
  return Math.round(peso * 100) / 100
}

export function calcularCantidadChapas(
  superficieAnchoM: number,
  superficieLargoM: number,
  chapaAnchoM: number,
  chapaLargoM: number,
  orientacion: 'normal' | 'rotada' = 'normal'
): number {
  const cAncho = orientacion === 'normal' ? chapaAnchoM : chapaLargoM
  const cLargo = orientacion === 'normal' ? chapaLargoM : chapaAnchoM
  const porAncho = Math.ceil(superficieAnchoM / cAncho)
  const porLargo = Math.ceil(superficieLargoM / cLargo)
  return porAncho * porLargo
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