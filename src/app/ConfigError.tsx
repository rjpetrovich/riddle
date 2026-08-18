export function ConfigError() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3 px-6 text-center">
      <div className="text-4xl">⚠️</div>
      <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
        Falta configurar Supabase
      </h1>
      <p className="max-w-sm text-sm text-slate-500 dark:text-slate-400">
        No están definidas <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">VITE_SUPABASE_URL</code>{' '}
        y/o{' '}
        <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">VITE_SUPABASE_ANON_KEY</code>.
        Si esto corre en Vercel, revisá Project Settings → Environment Variables, agregalas ahí y
        volvé a desplegar (Redeploy).
      </p>
    </div>
  )
}
