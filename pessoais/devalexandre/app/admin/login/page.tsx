'use client'
import { supabase } from '@/lib/supabase'
import { Github } from 'lucide-react'

export default function AdminLogin() {
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: 'https://devalexandre.fguerra.ia.br/auth/callback',
      },
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold">Acesso Admin</h1>
        <button
          onClick={handleLogin}
          className="flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
        >
          <Github className="w-5 h-5" />
          Entrar com GitHub
        </button>
      </div>
    </div>
  )
}