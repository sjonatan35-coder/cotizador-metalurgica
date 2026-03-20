// ─────────────────────────────────────────────
// Tipos base de MetalApp Pro
// ─────────────────────────────────────────────

export type ProductType =
  | 'CHAPA_LISA'
  | 'CHAPA_PERFORADA'
  | 'CHAPA_ESTRIADA'
  | 'FLEJE_ROLLO'

export type Material =
  | 'HIERRO_NEGRO'
  | 'HIERRO_GALVANIZADO'

export type CustomerType =
  | 'RETAIL'
  | 'WHOLESALE'
  | 'VIP'

export type UserRole =
  | 'ADMIN'
  | 'SELLER'
  | 'WAREHOUSE'
  | 'DRIVER'

// Calibres BWG con espesor en mm y pulgadas
export interface CalibreBwg {
  calibre: number
  thicknessMm: number
  thicknessIn: number
}

// Resultado de la calculadora
export interface CalculadoraResult {
  pesoKg: number
  precioArs: number
  precioUsd?: number
  calibre: number
  thicknessMm: number
  widthMm: number
  lengthMm: number
  material: Material
  tipo: ProductType
}
