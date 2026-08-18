import { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { fetchAlimentosCatalogo } from './mealsApi'

export function useFoodAutocomplete(search: string) {
  const { user } = useAuth()
  const [sugerencias, setSugerencias] = useState<{ id: string; nombre: string }[]>([])

  useEffect(() => {
    if (!user) return
    const timeout = setTimeout(() => {
      fetchAlimentosCatalogo(user.id, search).then(setSugerencias).catch(() => setSugerencias([]))
    }, 200)
    return () => clearTimeout(timeout)
  }, [user, search])

  return sugerencias
}
