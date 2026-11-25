/**
 * npm run deploy -- <slug>
 *
 * Construye el menú del cliente y lo publica en Vercel (producción):
 *   modo "demo"    → proyecto <slug>-demo   (ej. mariscos-lupita-demo.vercel.app)
 *   modo "cliente" → proyecto <slug>        (ej. mariscos-lupita.vercel.app)
 *
 * Usa la Build Output API de Vercel (deploy --prebuilt): se compila aquí y se suben los archivos listos,
 * así cada cliente es un proyecto independiente y no depende de la configuración del proyecto en Vercel.
 * Si Vercel asigna otra URL (porque el nombre ya existe), actualiza sitio.url y vuelve a publicar
 * para que la vista previa de WhatsApp y el QR apunten a la URL correcta.
 */
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { clienteExistente, guardarJson, leerJson, RAIZ, type RutasCliente } from './cliente.ts'
import { formatearErrores, validarRestaurante } from './validar-datos.ts'

const sh = (cmd: string, cwd: string, env: NodeJS.ProcessEnv = process.env) =>
  execSync(cmd, { cwd, env, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 20 * 1024 * 1024 })

/** Ejecuta y devuelve stdout+stderr juntos (Vercel CLI escribe en ambos). */
function shTodo(cmd: string, cwd: string): string {
  try {
    return execSync(`${cmd} 2>&1`, { cwd, encoding: 'utf8', shell: process.platform === 'win32' ? 'cmd.exe' : '/bin/sh', maxBuffer: 20 * 1024 * 1024 })
  } catch (e) {
    const err = e as { stdout?: string; stderr?: string; message: string }
    throw new Error(`Falló: ${cmd}\n${err.stdout ?? ''}${err.stderr ?? ''}`)
  }
}

export const nombreProyecto = (slug: string, modo: 'demo' | 'cliente') => (modo === 'demo' ? `${slug}-demo` : slug)

/** Encabezados de caché (equivalente a vercel.json) en formato Build Output API v3 */
const CONFIG_SALIDA = {
  version: 3,
  routes: [
    { src: '^/assets/(.*)$', headers: { 'cache-control': 'public, max-age=31536000, immutable' }, continue: true },
    { src: '^/images/(.*)$', headers: { 'cache-control': 'public, max-age=86400, stale-while-revalidate=604800' }, continue: true },
  ],
}

function construir(rutas: RutasCliente, dirSalida: string) {
  const static_ = path.join(dirSalida, '.vercel', 'output', 'static')
  console.log(`  • Compilando ${rutas.slug}…`)
  sh(`npx vite build --outDir "${static_}" --emptyOutDir`, RAIZ, { ...process.env, CLIENT: rutas.slug })
  fs.writeFileSync(path.join(dirSalida, '.vercel', 'output', 'config.json'), JSON.stringify(CONFIG_SALIDA, null, 2))
}

function publicar(dirSalida: string): { deployment: string; alias: string[] } {
  const salida = shTodo('npx vercel deploy --prebuilt --prod --yes', dirSalida)
  const urls = [...salida.matchAll(/https:\/\/[a-z0-9-]+\.vercel\.app/g)].map((m) => m[0])
  const deployment = urls[0]
  if (!deployment) throw new Error(`No encontré la URL del despliegue en la salida de Vercel:\n${salida}`)
  const inspect = shTodo(`npx vercel inspect ${deployment}`, dirSalida)
  const tramoAlias = inspect.split(/Aliases/i)[1] ?? ''
  const alias = [...new Set([...tramoAlias.matchAll(/https:\/\/[a-z0-9-]+\.vercel\.app/g)].map((m) => m[0]))].filter((u) => u !== deployment)
  return { deployment, alias }
}

/** La URL "bonita": la que ya está en sitio.url si Vercel la asignó; si no, <proyecto>.vercel.app; si no, la más corta. */
function elegirUrl(alias: string[], actual: string, proyecto: string): string | null {
  const limpia = actual.replace(/\/$/, '')
  if (alias.includes(limpia)) return limpia
  const exacta = `https://${proyecto}.vercel.app`
  if (alias.includes(exacta)) return exacta
  const candidatas = alias.filter((u) => !u.includes('-projects.vercel.app')).sort((a, b) => a.length - b.length)
  return candidatas[0] ?? null
}

export async function desplegar(rutas: RutasCliente): Promise<string> {
  const res = validarRestaurante(rutas)
  if (!res.ok) {
    console.error(formatearErrores(res.errores, rutas))
    process.exit(1)
  }
  const r = res.data
  const proyecto = nombreProyecto(rutas.slug, r.mode)
  const dirSalida = path.join(RAIZ, '.deploys', proyecto)
  fs.mkdirSync(dirSalida, { recursive: true })

  console.log(`\n🚀 Desplegando "${r.negocio.nombre}" (modo ${r.mode}) como proyecto Vercel "${proyecto}"`)

  // Vincula la carpeta de salida con su proyecto (lo crea si no existe)
  if (!fs.existsSync(path.join(dirSalida, '.vercel', 'project.json'))) {
    console.log('  • Vinculando proyecto en Vercel…')
    shTodo(`npx vercel link --yes --project ${proyecto}`, dirSalida)
    // `vercel link` puede bajar un .env.local con un token: no debe publicarse
    for (const f of fs.readdirSync(dirSalida)) if (f.startsWith('.env')) fs.rmSync(path.join(dirSalida, f))
  }

  construir(rutas, dirSalida)
  console.log('  • Subiendo a Vercel…')
  let { alias } = publicar(dirSalida)
  let final = elegirUrl(alias, r.sitio.url, proyecto)

  // Si la URL real es otra, corrige sitio.url (Open Graph y QR) y vuelve a publicar
  if (final && final !== r.sitio.url.replace(/\/$/, '')) {
    console.log(`  • Vercel asignó ${final} (sitio.url decía ${r.sitio.url}). Actualizando y volviendo a publicar…`)
    const json = leerJson(rutas)
    json.sitio.url = final
    guardarJson(rutas, json)
    construir(rutas, dirSalida)
    ;({ alias } = publicar(dirSalida))
    final = elegirUrl(alias, final, proyecto) ?? final
  }
  final ??= r.sitio.url

  // Verificación rápida
  let estado = 'sin verificar'
  try {
    const resp = await fetch(final, { redirect: 'follow' })
    estado = resp.ok ? 'en línea ✔' : `respondió ${resp.status}`
  } catch {
    /* sin red */
  }

  console.log(`\n✔ Publicado (${estado}):\n\n   ${final}\n`)
  if (r.mode === 'demo') console.log(`   Modo demo: franja "Lo quiero", pedidos a tu WhatsApp y noindex.\n   QR: npm run qr -- ${rutas.slug}\n`)
  return final
}

// npm run deploy -- <slug>
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    await desplegar(clienteExistente())
  } catch (e) {
    console.error(`\n✖ ${(e as Error).message}\n`)
    console.error('  ¿Iniciaste sesión en Vercel? Corre una vez: npx vercel login\n')
    process.exit(1)
  }
}
