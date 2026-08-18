import { useEffect, useState } from 'react'

type Preference = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'comomecae:theme'

function applyTheme(preference: Preference) {
  const isDark =
    preference === 'dark' ||
    (preference === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  document.documentElement.classList.toggle('dark', isDark)
}

export function useDarkMode() {
  const [preference, setPreference] = useState<Preference>(
    () => (localStorage.getItem(STORAGE_KEY) as Preference | null) ?? 'system',
  )

  useEffect(() => {
    applyTheme(preference)
    localStorage.setItem(STORAGE_KEY, preference)

    if (preference !== 'system') return
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const listener = () => applyTheme('system')
    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [preference])

  return { preference, setPreference }
}
