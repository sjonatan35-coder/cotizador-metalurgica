const fs = require('fs')

function addImport(file) {
  let c = fs.readFileSync(file, 'utf8')
  if (c.includes("import BtnPrimary")) return c
  return c.replace("'use client'", "'use client'\nimport BtnPrimary from '@/components/BtnPrimary'")
}

// presupuestos/page.tsx
let c = addImport('src/app/presupuestos/page.tsx')
c = c.replace(
  `<button\n          onClick={() => router.push('/presupuestos/nuevo')}\n          className="bg-[#1E6AC8] text-white text-xs font-medium px-3 py-2 rounded-lg flex-shrink-0">`,
  `<BtnPrimary onClick={() => router.push('/presupuestos/nuevo')} fullWidth={false}>`
).replace(
  `<button onClick={() => router.push('/presupuestos/nuevo')}\n          className="bg-[#1E6AC8] text-white text-sm font-medium px-4 py-2.5 rounded-lg">`,
  `<BtnPrimary onClick={() => router.push('/presupuestos/nuevo')} fullWidth={false}>`
).replace(
  `<button\n          onClick={() => router.push('/presupuestos/nuevo')}\n          className="w-full bg-[#1E6AC8] text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2">`,
  `<BtnPrimary onClick={() => router.push('/presupuestos/nuevo')}>`
)
fs.writeFileSync('src/app/presupuestos/page.tsx', c)
console.log('OK presupuestos/page.tsx')

// presupuestos/nuevo/page.tsx
c = addImport('src/app/presupuestos/nuevo/page.tsx')
c = c.replace(
  `<button onClick={imprimirPDF}\n          className="w-full py-3.5 rounded-xl bg-[#1E6AC8] text-white font-semibold flex items-center justify-center gap-2">`,
  `<BtnPrimary onClick={imprimirPDF}>`
)
fs.writeFileSync('src/app/presupuestos/nuevo/page.tsx', c)
console.log('OK presupuestos/nuevo/page.tsx')

// clientes/page.tsx
c = addImport('src/app/clientes/page.tsx')
c = c.replace(
  `<button onClick={() => router.push('/clientes/nuevo')} className="bg-[#1E6AC8] text-white text-xs font-medium px-3 py-2 rounded-lg">`,
  `<BtnPrimary onClick={() => router.push('/clientes/nuevo')} fullWidth={false}>`
)
fs.writeFileSync('src/app/clientes/page.tsx', c)
console.log('OK clientes/page.tsx')

// mis-presupuestos/page.tsx
c = addImport('src/app/mis-presupuestos/page.tsx')
c = c.replace(
  `<button onClick={handleNuevo}\n          style={{ background: '#1E6AC8', border: 'none', borderRadius: 10, padding: '10px 20px', cursor: 'pointer' }}>`,
  `<BtnPrimary onClick={handleNuevo}>`
)
fs.writeFileSync('src/app/mis-presupuestos/page.tsx', c)
console.log('OK mis-presupuestos/page.tsx')

console.log('\nTodos los botones reemplazados.')