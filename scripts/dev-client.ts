/**
 * npm run dev:client -- <slug>
 * Levanta el menú de ese cliente en http://localhost:5173 (funciona igual en PowerShell, cmd y Git Bash).
 */
import { spawn } from 'node:child_process'
import { clienteExistente, RAIZ } from './cliente.ts'

const rutas = clienteExistente()
const extra = process.argv.slice(2).filter((a) => a.startsWith('-')) // ej. --host para verlo en tu celular
const hijo = spawn(['npx vite', ...extra].join(' '), { cwd: RAIZ, stdio: 'inherit', shell: true, env: { ...process.env, CLIENT: rutas.slug } })
hijo.on('exit', (code) => process.exit(code ?? 0))
