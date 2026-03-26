import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, rol } = await request.json()

    if (!email || !rol) {
      return NextResponse.json({ error: 'Email y rol son obligatorios' }, { status: 400 })
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Verificar que quien invita es ADMIN
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('rol, tenant_id')
      .eq('id', user.id)
      .single()

    if (!profile || profile.rol !== 'ADMIN') {
      return NextResponse.json({ error: 'Solo el ADMIN puede invitar usuarios' }, { status: 403 })
    }

    // Enviar invitación
    const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: {
        rol,
        tenant_id: profile.tenant_id,
        invitado_por: user.id,
      }
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Crear perfil con estado pendiente
    await supabaseAdmin
      .from('profiles')
      .upsert({
        id: data.user.id,
        tenant_id: profile.tenant_id,
        rol,
        nombre: null,
        invitacion_pendiente: true,
        invitado_por: user.id,
        created_at: new Date().toISOString(),
      })

    return NextResponse.json({ ok: true, userId: data.user.id })

  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
} 
