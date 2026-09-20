'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { adminEmails } from '@/lib/constants'
import { ShieldCheck, LogOut } from 'lucide-react'

export function AdminBadge() {
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setEmail(user?.email ?? null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const isAdmin = !!email && (adminEmails as readonly string[]).includes(email)
  if (!isAdmin) return null

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.reload()
  }

  return (
    <div className="flex items-center gap-1.5 pl-2 pr-1 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-700 dark:text-emerald-400">
      <span className="relative flex h-2 w-2 shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
      </span>
      <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
      <span className="max-w-[140px] truncate text-xs font-medium" title={email ?? undefined}>
        {email}
      </span>
      <button
        onClick={handleLogout}
        className="p-1 rounded-full hover:bg-emerald-500/20 transition-colors"
        aria-label="Sair da conta de administrador"
        title="Sair"
      >
        <LogOut className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
