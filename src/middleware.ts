import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const RUTAS_INTERNAS = ['/clientes', '/stock', '/dashboard', '/presupuestos', '/perfil']
const RUTAS_ADMIN    = ['/admin', '/api/admin']
const RUTAS_CLIENTE  = ['/mi-panel', '/mis-presupuestos']
const ROLES_INTERNOS = ['ADMIN', 'SELLER', 'WAREHOUSE', 'DRIVER', 'SUPER_ADMIN']

type CookieToSet = { name: string; value: string; options?: Record<string, unknown> }

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const esRutaInterna = RUTAS_INTERNAS.some(r => pathname.startsWith(r))
  const esRutaAdmin   = RUTAS_ADMIN.some(r => pathname.startsWith(r))
  const esRutaCliente = RUTAS_CLIENTE.some(r => pathname.startsWith(r))

  if (!esRutaInterna && !esRutaAdmin && !esRutaCliente) return NextResponse.next()

  let response = NextResponse.next({ request: { headers: request.headers } })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request: { headers: request.headers } })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2])
          )
        },
      },
    }
  )

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(loginUrl)
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('rol, tokens')
    .eq('id', user.id)
    .single()

  const rol = profile?.rol ?? 'CLIENTE'

  if (esRutaAdmin) {
    if (rol !== 'SUPER_ADMIN') return NextResponse.redirect(new URL('/', request.url))
    return response
  }

  if (esRutaInterna) {
    if (!ROLES_INTERNOS.includes(rol)) return NextResponse.redirect(new URL('/mi-panel', request.url))
    return response
  }

  if (esRutaCliente) {
    if (ROLES_INTERNOS.includes(rol)) return NextResponse.redirect(new URL('/clientes', request.url))
    return response
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|logo.jpg|fabrica.jpeg|.*\\.png$).*)',
  ],
}