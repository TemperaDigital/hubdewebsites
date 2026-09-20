import type { ReactNode, ButtonHTMLAttributes } from 'react'
import { cn, initials } from '@/lib/utils'

/** Card básico no estilo shadcn (a ser substituído por shadcn/ui real quando desejado). */
export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn('rounded-xl border border-hub-border bg-hub-card shadow-card', className)}>
      {children}
    </div>
  )
}

export function CardBody({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('p-4 sm:p-5', className)}>{children}</div>
}

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'accent' | 'ghost' | 'outline'
}
export function Button({ variant = 'primary', className, children, ...props }: BtnProps) {
  const variants: Record<string, string> = {
    primary: 'bg-hub-primary text-white hover:bg-hub-primary-700',
    accent: 'bg-hub-accent text-hub-primary hover:brightness-95',
    ghost: 'text-hub-primary hover:bg-slate-100',
    outline: 'border border-hub-border bg-white text-hub-primary hover:bg-slate-50',
  }
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hub-accent focus-visible:ring-offset-2',
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export function Badge({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600', className)}>
      {children}
    </span>
  )
}

export function Avatar({ name, className }: { name: string; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-hub-primary text-xs font-semibold text-white',
        className,
      )}
      aria-hidden
    >
      {initials(name)}
    </span>
  )
}
