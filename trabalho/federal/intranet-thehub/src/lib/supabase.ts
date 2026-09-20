import { createClient } from '@supabase/supabase-js'

/**
 * Cliente Supabase apontando para o Supabase self-hosted EXISTENTE "spc".
 * - Lê a config em RUNTIME (window.__RUNTIME_CONFIG__), não em build (PRD v3 - Seção 31.1).
 * - Usa o schema dedicado `intranet` (PRD v3 - Seção 4.3 e 7).
 * - Apenas ANON KEY. NUNCA service_role no frontend.
 *
 * Enquanto as variáveis não estiverem preenchidas (fase visual com mock),
 * o cliente é null e a app funciona com dados fictícios.
 */
const cfg = window.__RUNTIME_CONFIG__

export const supabase =
  cfg?.VITE_SUPABASE_URL && cfg?.VITE_SUPABASE_ANON_KEY
    ? createClient(cfg.VITE_SUPABASE_URL, cfg.VITE_SUPABASE_ANON_KEY, {
        db: { schema: 'intranet' },
        auth: { persistSession: true, autoRefreshToken: true },
      })
    : null

export const isBackendConfigured = supabase !== null
