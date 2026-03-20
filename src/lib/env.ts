// Valida que las variables de entorno críticas existan al arrancar
// Si falta alguna, el error aparece claro en la consola — no un error misterioso después

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(
      `❌ Variable de entorno faltante: ${name}\n` +
      `   Copiá .env.example a .env.local y completá el valor.`
    )
  }
  return value
}

export const env = {
  supabaseUrl:     requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  supabaseAnonKey: requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  appUrl:          process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  nodeEnv:         process.env.NODE_ENV ?? 'development',
}
