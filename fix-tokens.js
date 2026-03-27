const fs = require('fs')
let c = fs.readFileSync('src/app/calculadora/page.tsx', 'utf8')
let ok = 0

// 1. Agregar estado tokensDisponibles
const estadoViejo = `  const [sesionActiva,    setSesionActiva]    = useState(false)`
const estadoNuevo = `  const [sesionActiva,    setSesionActiva]    = useState(false)
  const [tokensDisponibles, setTokensDisponibles] = useState<number | null>(null)`
if (c.includes(estadoViejo)) { c = c.replace(estadoViejo, estadoNuevo); ok++; console.log('OK 1 — estado tokensDisponibles') }
else console.log('ERROR 1')

// 2. Cargar tokens en useEffect cuando hay sesión
const useEffectViejo = `      if (data.session) { setSesionActiva(true); setCargando(false) }`
const useEffectNuevo = `      if (data.session) {
        setSesionActiva(true)
        const { data: profile } = await supabase.from('profiles').select('tokens').eq('id', data.session.user.id).single()
        if (profile) setTokensDisponibles(profile.tokens ?? 0)
        setCargando(false)
      }`
if (c.includes(useEffectViejo)) { c = c.replace(useEffectViejo, useEffectNuevo); ok++; console.log('OK 2 — carga tokens en useEffect') }
else console.log('ERROR 2')

// 3. Reemplazar irAlResultado con descuento real
const fnVieja = `  function irAlResultado() {
    registrarEvento('calculadora_resultado_visto', {
      proyecto_id: proyectoSeleccionado?.id ?? null,
      material: materialSeleccionado ?? null,
      calibre: calibreSeleccionado?.calibre ?? null,
      metadata: { modo_calculo: modoCalculo, chapas: calcularChapas(), sesion: sesionActiva },
    })
    if (!sesionActiva) {
      const nuevos = usosGratis + 1
      localStorage.setItem(STORAGE_KEY, String(nuevos))
      setUsosGratis(nuevos)
      if (nuevos >= MAX_USOS_GRATIS) setBloqueado(true)
    }
    setPaso(5)
  }`
const fnNueva = `  async function irAlResultado() {
    registrarEvento('calculadora_resultado_visto', {
      proyecto_id: proyectoSeleccionado?.id ?? null,
      material: materialSeleccionado ?? null,
      calibre: calibreSeleccionado?.calibre ?? null,
      metadata: { modo_calculo: modoCalculo, chapas: calcularChapas(), sesion: sesionActiva },
    })
    if (!sesionActiva) {
      const nuevos = usosGratis + 1
      localStorage.setItem(STORAGE_KEY, String(nuevos))
      setUsosGratis(nuevos)
      if (nuevos >= MAX_USOS_GRATIS) setBloqueado(true)
    } else {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: profile } = await supabase.from('profiles').select('tokens').eq('id', user.id).single()
          const tkActual = profile?.tokens ?? 0
          if (tkActual > 0) {
            await supabase.from('profiles').update({ tokens: tkActual - 1 }).eq('id', user.id)
            setTokensDisponibles(tkActual - 1)
          } else {
            setTokensDisponibles(0)
          }
        }
      } catch (e) { console.error('Error descontando token:', e) }
    }
    setPaso(5)
  }`
if (c.includes(fnVieja)) { c = c.replace(fnVieja, fnNueva); ok++; console.log('OK 3 — irAlResultado actualizada') }
else console.log('ERROR 3')

// 4. Badge tokens en Paso 5 — buscar donde empieza el render del paso 5
const paso5Viejo = `{paso === 5 && proyectoSeleccionado && materialSeleccionado && acabadoSeleccionado && calibreSeleccionado && (`
const paso5Nuevo = `{paso === 5 && proyectoSeleccionado && materialSeleccionado && acabadoSeleccionado && calibreSeleccionado && (
        <div>
        {sesionActiva && tokensDisponibles !== null && (
          <div style={{
            background: tokensDisponibles === 0 ? 'rgba(226,75,74,0.12)' : tokensDisponibles <= 3 ? 'rgba(239,159,39,0.12)' : 'rgba(45,212,191,0.12)',
            border: \`1px solid \${tokensDisponibles === 0 ? 'rgba(226,75,74,0.3)' : tokensDisponibles <= 3 ? 'rgba(239,159,39,0.3)' : 'rgba(45,212,191,0.25)'}\`,
            borderRadius: 8, padding: '8px 12px', marginBottom: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ color: tokensDisponibles === 0 ? '#E24B4A' : tokensDisponibles <= 3 ? '#EF9F27' : '#2DD4BF', fontSize: 11, fontWeight: 600 }}>
                {tokensDisponibles === 0 ? 'Sin tokens' : 'Tokens disponibles'}
              </div>
              {tokensDisponibles <= 3 && tokensDisponibles > 0 && (
                <div style={{ color: 'rgba(247,250,255,0.4)', fontSize: 9 }}>Comprá más en tu panel</div>
              )}
              {tokensDisponibles === 0 && (
                <div style={{ color: 'rgba(247,250,255,0.4)', fontSize: 9 }}>Comprá más para seguir</div>
              )}
            </div>
            <div style={{ color: tokensDisponibles === 0 ? '#E24B4A' : tokensDisponibles <= 3 ? '#EF9F27' : '#2DD4BF', fontSize: 18, fontWeight: 700 }}>
              {tokensDisponibles}
            </div>
          </div>
        )}`

if (c.includes(paso5Viejo)) { c = c.replace(paso5Viejo, paso5Nuevo); ok++; console.log('OK 4 — badge tokens en Paso 5') }
else console.log('ERROR 4')

// 5. Cerrar el div extra que abrimos en el paso 5
// Buscar el cierre del bloque paso 5
const cierreViejo = `      </div>\n    )}\n\n      <style>`
const cierreNuevo = `      </div>\n        </div>\n    )}\n\n      <style>`
if (c.includes(cierreViejo)) { c = c.replace(cierreViejo, cierreNuevo); ok++; console.log('OK 5 — cierre div') }
else console.log('SKIP 5 — cierre no encontrado (puede estar OK)')

fs.writeFileSync('src/app/calculadora/page.tsx', c)
console.log('\n' + ok + '/5 cambios aplicados.')