// ─────────────────────────────────────────────
// Tipos base de MetalApp Pro
// ─────────────────────────────────────────────

// Material vive en calibres.ts — lo re-exportamos desde acá
export type { Material } from '@/lib/calibres'

export type CustomerType =
  | 'RETAIL'
  | 'WHOLESALE'
  | 'VIP'

export type UserRole =
  | 'ADMIN'
  | 'SELLER'
  | 'WAREHOUSE'
  | 'DRIVER'

// Calibre BWG
export interface CalibreBwg {
  calibre:     number
  thicknessMm: number
  thicknessIn: number
}

// Resultado de la calculadora
export interface CalculadoraResult {
  pesoKg:      number
  pesoTotal:   number
  cantidad:    number
  calibre:     number
  thicknessMm: number
  widthMm:     number
  lengthMm:    number
  material:    string
  proyecto:    string
  aMedida:     boolean
}