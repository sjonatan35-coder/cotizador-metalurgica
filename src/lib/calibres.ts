import type { CalibreBwg } from '@/types'

// Calibres BWG usados en la industria metalúrgica argentina
// Fuente: estándar British Wire Gauge
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
]

// Densidades por material (kg/m³)
export const DENSIDADES = {
  HIERRO_NEGRO:       7850,
  HIERRO_GALVANIZADO: 7800,
} as const

// Medidas estándar de chapas (mm)
export const MEDIDAS_ESTANDAR = [
  { label: '1000 × 2000',  widthMm: 1000, lengthMm: 2000 },
  { label: '1220 × 2440 (4×8 pies)', widthMm: 1220, lengthMm: 2440 },
  { label: '1500 × 3000',  widthMm: 1500, lengthMm: 3000 },
  { label: '2000 × 4000',  widthMm: 2000, lengthMm: 4000 },
] as const

// Función de cálculo de peso
// peso (kg) = largo(m) × ancho(m) × espesor(m) × densidad(kg/m³)
export function calcularPeso(
  widthMm: number,
  lengthMm: number,
  thicknessMm: number,
  densidad: number
): number {
  const peso = (widthMm / 1000) * (lengthMm / 1000) * (thicknessMm / 1000) * densidad
  return Math.round(peso * 100) / 100
}

// Busca un calibre por número
export function getCalibre(calibreNum: number): CalibreBwg | undefined {
  return CALIBRES_BWG.find(c => c.calibre === calibreNum)
}
