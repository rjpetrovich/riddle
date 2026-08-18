import { BrowserRouter } from 'react-router-dom'
import { AppProviders } from './providers'
import { AppRouter } from './router'
import { ConfigError } from './ConfigError'
import { isSupabaseConfigured } from '../lib/supabaseClient'

function App() {
  if (!isSupabaseConfigured) {
    return <ConfigError />
  }

  return (
    <AppProviders>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </AppProviders>
  )
}

export default App
