import { useState, type FormEvent } from 'react'
import { useAuth } from './AuthProvider'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

export function LoginPage() {
  const { signInWithEmail } = useAuth()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setStatus('sending')
    const { error } = await signInWithEmail(email)
    if (error) {
      setErrorMsg(error)
      setStatus('error')
    } else {
      setStatus('sent')
    }
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mb-2 text-4xl">🥗</div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Cómo Me Cae</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Registrá lo que comés y cómo te sentís. Con el tiempo vas a descubrir qué te sienta bien.
          </p>
        </div>

        {status === 'sent' ? (
          <div className="rounded-xl bg-emerald-50 p-4 text-center text-sm text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300">
            Te enviamos un link de acceso a <strong>{email}</strong>. Abrilo desde este dispositivo para
            entrar.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <Input
              type="email"
              label="Email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
            {status === 'error' && (
              <p className="text-sm text-red-600 dark:text-red-400">{errorMsg}</p>
            )}
            <Button type="submit" disabled={status === 'sending'} className="mt-1 w-full">
              {status === 'sending' ? 'Enviando...' : 'Enviarme un link de acceso'}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
