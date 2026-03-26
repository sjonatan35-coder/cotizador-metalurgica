import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rutas que requieren solo estar logueado
const RUTAS_AUTH = ['/stock', '/dashboard', '/perfil', '/clientes']

// Rutas que requieren rol ADMIN o SUPER_ADMIN
const RUTAS_ADMIN = ['/admin', '/api/admin']

type CookieToSet = { name: string; value: string; options?: Record<string, unknown> }

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const esRutaAuth = RUTAS_AUTH.some(r => pathname.startsWith(r))
  const esRutaAdmin = RUTAS_ADMIN.some(r => pathname.startsWith(r))

  // Si no es ruta protegida, pasa directo
  if (!esRutaAuth && !esRutaAdmin) return NextResponse.next()

  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2])
          )
        },
      },
    }
  )

  // Chequear sesión
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Chequear rol para rutas admin
  if (esRutaAdmin) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const rolPermitido = profile?.role === 'ADMIN' || profile?.role === 'SUPER_ADMIN'

    if (!rolPermitido) {
      // Logueado pero sin permiso → va al inicio, no al login
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|logo.jpg|fabrica.jpeg|.*\\.png$).*)',
  ],
}