/// <reference types="vite/client" />

interface RuntimeConfig {
  VITE_SUPABASE_URL: string
  VITE_SUPABASE_ANON_KEY: string
}

interface Window {
  __RUNTIME_CONFIG__?: RuntimeConfig
}
