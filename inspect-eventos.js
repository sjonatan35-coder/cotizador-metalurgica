const fs = require('fs')
const c = fs.readFileSync('src/app/calculadora/page.tsx', 'utf8')
const lines = c.split('\n')
lines.forEach((l, i) => {
  if (
    l.includes('registrarEvento') ||
    l.includes('sesion_id') ||
    l.includes('duracion') ||
    l.includes('Date.now') ||
    l.includes('timestamp')
  ) {
    console.log((i + 1) + ': ' + l.trim())
  }
})