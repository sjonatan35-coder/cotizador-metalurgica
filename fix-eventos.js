const fs = require('fs')
let c = fs.readFileSync('src/app/calculadora/page.tsx', 'utf8')
let ok = 0

// 1. Agregar sesion_id y timestamp_inicio como constantes del módulo
const constVieja = `const WA_NUMBER = '5491159396358'`
const constNueva = `const WA_NUMBER = '5491159396358'
const SESION_ID = typeof crypto !== 'undefined' ? crypto.randomUUID() : Math.random().toString(36).slice(2)`
if (c.includes(constVieja)) { c = c.replace(constVieja, constNueva); ok++; console.log('OK 1 — sesion_id') }
else console.log('ERROR 1')

// 2. Mejorar función registrarEvento para incluir sesion_id y timestamp
const fnVieja = `function registrarEvento(evento: string, datos: Record<string, unknown> = {}) {
  const supabase = createClient()
  let utm: { source?: string } | null = null
  try { utm = JSON.parse(localStorage.getItem('metalurgica_utm') ?? 'null') } catch {}
  supabase.from('eventos_app').insert({
    evento,
    fuente: utm?.source ?? 'directo',
    ...datos,
  }).then(() => {})
}`
const fnNueva = `function registrarEvento(evento: string, datos: Record<string, unknown> = {}) {
  const supabase = createClient()
  let utm: { source?: string } | null = null
  try { utm = JSON.parse(localStorage.getItem('metalurgica_utm') ?? 'null') } catch {}
  supabase.from('eventos_app').insert({
    evento,
    fuente: utm?.source ?? 'directo',
    sesion_id: SESION_ID,
    timestamp_cliente: new Date().toISOString(),
    ...datos,
  }).then(() => {})
}`
if (c.includes(fnVieja)) { c = c.replace(fnVieja, fnNueva); ok++; console.log('OK 2 — registrarEvento mejorado') }
else console.log('ERROR 2')

// 3. Agregar estado tiempoInicioPaso
const estadoViejo = `  const [tokensDisponibles, setTokensDisponibles] = useState<number | null>(null)`
const estadoNuevo = `  const [tokensDisponibles, setTokensDisponibles] = useState<number | null>(null)
  const [tiempoInicioPaso, setTiempoInicioPaso] = useState<number>(Date.now())`
if (c.includes(estadoViejo)) { c = c.replace(estadoViejo, estadoNuevo); ok++; console.log('OK 3 — estado tiempoInicioPaso') }
else console.log('ERROR 3')

// 4. Mejorar evento proyecto_elegido con duracion y sesion
const ev1Viejo = `registrarEvento('calculadora_proyecto_elegido', { proyecto_id: proyecto.id })`
const ev1Nuevo = `const duracion1 = Math.round((Date.now() - tiempoInicioPaso) / 1000)
    registrarEvento('calculadora_proyecto_elegido', {
      proyecto_id: proyecto.id,
      duracion_paso_seg: duracion1,
    })
    setTiempoInicioPaso(Date.now())`
if (c.includes(ev1Viejo)) { c = c.replace(ev1Viejo, ev1Nuevo); ok++; console.log('OK 4 — evento 1 mejorado') }
else console.log('ERROR 4')

// 5. Mejorar evento material_elegido
const ev2Viejo = `registrarEvento('calculadora_material_elegido', { proyecto_id: proyectoSeleccionado?.id ?? null, material })`
const ev2Nuevo = `const duracion2 = Math.round((Date.now() - tiempoInicioPaso) / 1000)
    registrarEvento('calculadora_material_elegido', {
      proyecto_id: proyectoSeleccionado?.id ?? null,
      material,
      duracion_paso_seg: duracion2,
    })
    setTiempoInicioPaso(Date.now())`
if (c.includes(ev2Viejo)) { c = c.replace(ev2Viejo, ev2Nuevo); ok++; console.log('OK 5 — evento 2 mejorado') }
else console.log('ERROR 5')

// 6. Agregar Evento 7 — cambio de modo de cálculo
const modoViejo = `  function setModoCalculoConEvento(modo: ModoCalculo) {
    setModoCalculo(modo)
  }`
// Si no existe la función, la creamos despues de setModoCalculo
const setModoViejo = `  const [modoCalculo,     setModoCalculo]     = useState<ModoCalculo>('superficie')`
const setModoNuevo = `  const [modoCalculo,     setModoCalculo]     = useState<ModoCalculo>('superficie')
  const cambiarModoCalculo = (modo: ModoCalculo) => {
    registrarEvento('calculadora_modo_calculo', {
      proyecto_id: proyectoSeleccionado?.id ?? null,
      material: materialSeleccionado ?? null,
      modo_anterior: modoCalculo,
      modo_nuevo: modo,
    })
    setModoCalculo(modo)
  }`
if (c.includes(setModoViejo) && !c.includes('cambiarModoCalculo')) {
  c = c.replace(setModoViejo, setModoNuevo); ok++; console.log('OK 6 — evento 7 modo_calculo')
} else console.log('SKIP 6 — ya existe o no encontrado')

// 7. Agregar Evento 6 — retroceso desde paso avanzado en volverAtras
const volverViejo = `  function volverAtras() {`
const volverNuevo = `  function volverAtras() {
    if (paso >= 4) {
      const duracion = Math.round((Date.now() - tiempoInicioPaso) / 1000)
      registrarEvento('calculadora_abandono', {
        proyecto_id: proyectoSeleccionado?.id ?? null,
        material: materialSeleccionado ?? null,
        paso_abandono: paso,
        duracion_paso_seg: duracion,
        metadata: { calibre: calibreSeleccionado?.calibre ?? null, modo_calculo: modoCalculo }
      })
    }`
if (c.includes(volverViejo)) { c = c.replace(volverViejo, volverNuevo); ok++; console.log('OK 7 — evento 6 abandono') }
else console.log('ERROR 7')

fs.writeFileSync('src/app/calculadora/page.tsx', c)
console.log('\n' + ok + '/7 cambios aplicados.')