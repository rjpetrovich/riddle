import { useState } from 'react'
import { PageHeader } from '../../components/ui/PageHeader'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { useAuth } from '../auth/AuthProvider'
import { useDarkMode } from '../../hooks/useDarkMode'
import { SymptomsEditor } from './SymptomsEditor'
import { exportarHistorialCsv } from './exportCsv'

export function SettingsPage() {
  const { user, signOut } = useAuth()
  const { preference, setPreference } = useDarkMode()
  const [exportando, setExportando] = useState(false)

  async function handleExportar() {
    if (!user) return
    setExportando(true)
    try {
      await exportarHistorialCsv(user.id)
    } finally {
      setExportando(false)
    }
  }

  return (
    <div className="pb-24">
      <PageHeader title="Ajustes" />
      <div className="flex flex-col gap-4 px-4">
        <Card>
          <p className="text-sm text-slate-500 dark:text-slate-400">Sesión iniciada como</p>
          <p className="font-medium text-slate-900 dark:text-slate-100">{user?.email}</p>
          <Button variant="secondary" className="mt-3" onClick={signOut}>
            Cerrar sesión
          </Button>
        </Card>

        <Card>
          <h2 className="mb-2 font-medium text-slate-900 dark:text-slate-100">Apariencia</h2>
          <div className="flex gap-2">
            {(['light', 'dark', 'system'] as const).map((opcion) => (
              <button
                key={opcion}
                onClick={() => setPreference(opcion)}
                className={`flex-1 rounded-xl border px-3 py-2 text-sm ${
                  preference === opcion
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                    : 'border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-400'
                }`}
              >
                {opcion === 'light' ? 'Claro' : opcion === 'dark' ? 'Oscuro' : 'Sistema'}
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="mb-2 font-medium text-slate-900 dark:text-slate-100">
            Síntomas y sensaciones
          </h2>
          <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
            Activá, desactivá o agregá tus propias opciones para registrar cómo te sentís.
          </p>
          <SymptomsEditor />
        </Card>

        <Card>
          <h2 className="mb-1 font-medium text-slate-900 dark:text-slate-100">Exportar datos</h2>
          <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
            Descargá todo tu historial en CSV, por ejemplo para llevarlo a una consulta.
          </p>
          <Button variant="secondary" onClick={handleExportar} disabled={exportando}>
            {exportando ? 'Generando...' : 'Exportar historial (CSV)'}
          </Button>
        </Card>
      </div>
    </div>
  )
}
