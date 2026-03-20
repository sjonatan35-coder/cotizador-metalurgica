# 🏭 MetalApp Pro

**Cooperativa La Metalúrgica — Villa Lugano, CABA**

---

## Requisitos antes de empezar

- Node.js 18+ → https://nodejs.org (bajá la versión LTS)
- Cuenta en Supabase → https://supabase.com (gratis)
- Cuenta en Vercel → https://vercel.com (gratis)
- Cuenta en GitHub → https://github.com (gratis)

---

## Setup inicial — Paso a paso

### Paso 1 — Instalar dependencias

```bash
npm install
```

### Paso 2 — Configurar variables de entorno

```bash
cp .env.example .env.local
```

Abrí `.env.local` y completá:
- `NEXT_PUBLIC_SUPABASE_URL` → de Supabase: Settings → API
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` → de Supabase: Settings → API
- `SUPABASE_SERVICE_ROLE_KEY` → de Supabase: Settings → API

### Paso 3 — Levantar en desarrollo

```bash
npm run dev
```

Abrí http://localhost:3000

Si ves la pantalla con el 🏭 y "MetalApp Pro", el setup está perfecto.

---

## Estructura del proyecto

```
metalapp-pro/
├── src/
│   ├── app/                # Páginas (Next.js App Router)
│   │   ├── layout.tsx      # Layout raíz
│   │   ├── page.tsx        # Pantalla de inicio
│   │   └── globals.css     # Estilos globales
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts   # Cliente Supabase para el browser
│   │   │   └── server.ts   # Cliente Supabase para el servidor
│   │   ├── calibres.ts     # Tabla BWG + función de cálculo de peso
│   │   ├── env.ts          # Validación de variables de entorno
│   │   └── utils.ts        # Helpers
│   └── types/
│       └── index.ts        # Tipos TypeScript del proyecto
├── .env.example            # Template de variables (completar como .env.local)
├── next.config.js          # Configuración de Next.js
├── tailwind.config.ts      # Colores y fuentes de MetalApp
└── package.json            # Dependencias
```

---

## Plan de desarrollo — 8 semanas

| Semana | Módulo | Estado |
|--------|--------|--------|
| 1 | Setup: Next.js + Supabase + Vercel | 🔜 |
| 2 | Calculadora de chapas BWG | 🔜 |
| 3 | Login con Supabase Auth | 🔜 |
| 4 | CRM de clientes | 🔜 |
| 5 | Presupuestos | 🔜 |
| 6 | PDF + WhatsApp | 🔜 |
| 7 | Stock e inventario | 🔜 |
| 8 | Dashboard + deploy final | 🔜 |

---

## Errores corregidos respecto al setup original

1. `next.config.js` — Cambiado `experimental.serverComponentsExternalPackages` por `serverExternalPackages` (correcto en Next.js 14.2)
2. `package.json` — Eliminado el doble SDK de MercadoPago (`@mercadopago/sdk-js` era para browser, generaba conflictos)
3. `.gitignore` — Eliminada la línea que ignoraba `prisma/migrations/` con comentario contradictorio
4. `.env.example` — Eliminado `MAIN_TENANT_ID` (no aplica sin Prisma) y `DATABASE_URL`/`DIRECT_URL` (no aplica sin Prisma)
5. `src/lib/env.ts` — Validación explícita de variables: si falta una, el error es claro
6. Estructura de directorios — Creada correctamente (el ZIP original tenía carpetas con nombres corruptos tipo `{prisma,src/`)

---

**MetalApp Pro v1.0 — Marzo 2026 — CONFIDENCIAL**
