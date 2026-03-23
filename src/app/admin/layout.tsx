'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()
  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      console.log('USER:', user)
      if (!user) {
        router.replace('/login?redirectTo=/admin/productos')
        return
      }
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('rol')
        .eq('id', user.id)
        .single()
      console.log('PROFILE:', profile)
      console.log('ERROR:', error)
      if (!profile || profile.rol !== 'ADMIN') {
        router.replace('/')
        return
      }
      setLoading(false)
    }
    checkAdmin()
  }, [])
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0B1F3A',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 40,
            height: 40,
            border: '3px solid rgba(45,212,191,0.3)',
            borderTopColor: '#2DD4BF',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 12px',
          }} />
          <p style={{ color: '#F7FAFF', fontSize: 14, opacity: 0.6 }}>Verificando acceso...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }
  return <>{children}</>
}