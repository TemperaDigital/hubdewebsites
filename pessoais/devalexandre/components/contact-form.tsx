'use client';

import { useState } from 'react';
import { Send, Loader2, CheckCircle, AlertCircle, User, Mail, MessageSquare } from 'lucide-react';

export function ContactForm() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e?.preventDefault?.();
    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res?.json?.();

      if (res?.ok && data?.success) {
        setStatus('success');
        setFormData({ name: '', email: '', message: '' });
      } else {
        setStatus('error');
        setErrorMsg(data?.message ?? 'Erro ao enviar. Tente novamente.');
      }
    } catch {
      setStatus('error');
      setErrorMsg('Erro de conexão. Tente novamente.');
    }
  };

  if (status === 'success') {
    return (
      <div className="p-8 rounded-lg bg-card text-center" style={{ boxShadow: 'var(--shadow-sm)' }}>
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
        <h3 className="font-display text-xl font-bold text-foreground mb-2">Mensagem enviada!</h3>
        <p className="text-muted-foreground text-sm mb-4">Obrigado pelo contato. Respondo assim que possível.</p>
        <button
          onClick={() => setStatus('idle')}
          className="px-4 py-2 rounded-lg bg-muted text-foreground text-sm font-medium hover:bg-muted/80 transition-colors"
        >
          Enviar outra mensagem
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1.5">Nome</label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            id="name"
            type="text"
            required
            value={formData?.name ?? ''}
            onChange={(e: any) => setFormData({ ...(formData ?? {}), name: e?.target?.value ?? '' })}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
            placeholder="Seu nome"
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">Email</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            id="email"
            type="email"
            required
            value={formData?.email ?? ''}
            onChange={(e: any) => setFormData({ ...(formData ?? {}), email: e?.target?.value ?? '' })}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
            placeholder="seu@email.com"
          />
        </div>
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-foreground mb-1.5">Mensagem</label>
        <div className="relative">
          <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <textarea
            id="message"
            required
            rows={5}
            value={formData?.message ?? ''}
            onChange={(e: any) => setFormData({ ...(formData ?? {}), message: e?.target?.value ?? '' })}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm resize-none"
            placeholder="Sua mensagem..."
          />
        </div>
      </div>

      {status === 'error' && (
        <div className="flex items-center gap-2 text-sm text-red-500">
          <AlertCircle className="w-4 h-4" /> {errorMsg}
        </div>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === 'loading' ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</>
        ) : (
          <><Send className="w-4 h-4" /> Enviar mensagem</>
        )}
      </button>

      <p className="text-xs text-muted-foreground text-center">
        Sua mensagem será armazenada de forma segura e respondida por email.
      </p>
    </form>
  );
}
