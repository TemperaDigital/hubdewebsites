'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { StickyNote, Plus, Pencil, Trash2, X, Check } from 'lucide-react'

interface Nota {
  id: string
  title: string
  content: string
  created_at: string
  updated_at: string
}

export default function NotasPage() {
  const [notas, setNotas] = useState<Nota[]>([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [form, setForm] = useState({ title: '', content: '' })
  const [loading, setLoading] = useState(true)
  const [selectedNota, setSelectedNota] = useState<Nota | null>(null)

  useEffect(() => {
    fetchNotas()
    checkAdmin()
  }, [])

  async function fetchNotas() {
    const { data } = await supabase
      .from('notas')
      .select('*')
      .order('created_at', { ascending: false })
    setNotas(data ?? [])
    setLoading(false)
  }

  async function checkAdmin() {
    const { data: { user } } = await supabase.auth.getUser()
    setIsAdmin(user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL || user?.email === 'alexandre.guerra51@icloud.com')
  }

  async function handleSave() {
    if (!form.title.trim() || !form.content.trim()) return

    if (editingId) {
      await supabase.from('notas').update({
        title: form.title,
        content: form.content,
      }).eq('id', editingId)
    } else {
      await supabase.from('notas').insert({
        title: form.title,
        content: form.content,
      })
    }

    setEditingId(null)
    setIsCreating(false)
    setForm({ title: '', content: '' })
    fetchNotas()
  }

  async function handleDelete(id: string) {
    if (!confirm('Apagar esta nota?')) return
    await supabase.from('notas').delete().eq('id', id)
    fetchNotas()
  }

  function startEdit(nota: Nota) {
    setEditingId(nota.id)
    setIsCreating(false)
    setSelectedNota(null)
    setForm({ title: nota.title, content: nota.content })
  }

  function startCreate() {
    setIsCreating(true)
    setEditingId(null)
    setSelectedNota(null)
    setForm({ title: '', content: '' })
  }

  function cancelEdit() {
    setEditingId(null)
    setIsCreating(false)
    setForm({ title: '', content: '' })
  }

  if (loading) {
    return (
      <div className="max-w-[800px] mx-auto px-4 py-12">
        <p className="text-muted-foreground">Carregando notas...</p>
      </div>
    )
  }

  return (
    <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-12">
      {/* Cabeçalho */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground mb-2 flex items-center gap-2">
            <StickyNote className="w-7 h-7 text-primary" />
            Notas
          </h1>
          <p className="text-muted-foreground">
            Pensamentos curtos, reflexões e anotações rápidas.
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={startCreate}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Nova nota
          </button>
        )}
      </div>

      {/* Formulário de criação/edição */}
      {(isCreating || editingId) && (
        <div className="mb-6 p-5 rounded-lg bg-card border border-border">
          <input
            type="text"
            placeholder="Título da nota"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            className="w-full bg-transparent text-foreground font-medium text-lg mb-3 outline-none border-b border-border pb-2 placeholder:text-muted-foreground"
          />
          <textarea
            placeholder="Conteúdo da nota (suporta Markdown)"
            value={form.content}
            onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
            rows={6}
            className="w-full bg-transparent text-foreground text-sm outline-none resize-none placeholder:text-muted-foreground"
          />
          <div className="flex gap-2 mt-4 justify-end">
            <button
              onClick={cancelEdit}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-muted text-foreground text-sm hover:bg-muted/80 transition-colors"
            >
              <X className="w-4 h-4" /> Cancelar
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm hover:opacity-90 transition-opacity"
            >
              <Check className="w-4 h-4" /> Salvar
            </button>
          </div>
        </div>
      )}

      {/* Nota expandida */}
      {selectedNota && !editingId && (
        <div className="mb-6 p-5 rounded-lg bg-card border border-primary/30">
          <div className="flex items-start justify-between mb-3">
            <h2 className="font-display text-xl font-bold text-foreground">{selectedNota.title}</h2>
            <button onClick={() => setSelectedNota(null)}>
              <X className="w-5 h-5 text-muted-foreground hover:text-foreground" />
            </button>
          </div>
          <p className="text-foreground/80 text-sm whitespace-pre-wrap leading-relaxed">
            {selectedNota.content}
          </p>
          <p className="text-xs text-muted-foreground mt-4">
            {new Date(selectedNota.created_at).toLocaleDateString('pt-BR', {
              day: '2-digit', month: 'long', year: 'numeric'
            })}
          </p>
          </div>
      )}

      {/* Lista de notas */}
      <div className="space-y-3">
        {notas.map(nota => (
          <div
            key={nota.id}
            className="p-5 rounded-lg bg-card hover:bg-muted/50 transition-all duration-200 group"
            style={{ boxShadow: 'var(--shadow-sm)' }}
          >
            <div className="flex items-start justify-between gap-4">
              <button
                className="text-left flex-1"
                onClick={() => setSelectedNota(selectedNota?.id === nota.id ? null : nota)}
              >
                <h3 className="font-medium text-foreground group-hover:text-primary transition-colors mb-1">
                  {nota.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {nota.content}
                </p>
                <span className="text-xs text-muted-foreground mt-2 block">
                  {new Date(nota.created_at).toLocaleDateString('pt-BR', {
                    day: '2-digit', month: 'long', year: 'numeric'
                  })}
                </span>
              </button>
              {isAdmin && (
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => startEdit(nota)}
                    className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    title="Editar"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(nota.id)}
                    className="p-1.5 rounded-md hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
                    title="Apagar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {notas.length === 0 && (
          <p className="text-muted-foreground text-center py-12">
            Nenhuma nota ainda.
          </p>
        )}
      </div>
    {/* Comentários */}
      <GiscusComments />
      
    </div>
  )
}