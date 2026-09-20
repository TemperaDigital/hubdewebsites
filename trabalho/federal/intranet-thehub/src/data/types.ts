// Tipos alinhados ao modelo de dados do PRD v3 (Seção 9).
export type Audience =
  | 'all' | 'colaboradores' | 'gestores' | 'rh' | 'editores' | 'admins'

export interface News {
  id: string
  slug: string
  title: string
  summary?: string
  category?: string
  coverUrl?: string
  isHero?: boolean
  publishedAt: string
}

export interface QuickLink {
  id: string
  label: string
  url: string
  icon: string // chave lucide
  color?: string
}

export interface ResourceItem {
  id: string
  title: string
  category: string
  url: string
}

export interface Kudo {
  id: string
  from: string
  to: string
  message: string
  createdAt: string
  reactions: number
}

export interface EventItem {
  id: string
  title: string
  startAt: string
  time?: string
  category?: string
}

export interface Person {
  ref: string
  fullName: string
  jobTitle?: string
  department?: string
  location?: string
  email?: string
  businessPhone?: string
}

export interface Anniversary {
  ref: string
  fullName: string
  jobTitle?: string
  years: number
  date: string
}

export interface Kpi {
  id: string
  label: string
  displayValue: string
  period: string
  trend: 'up' | 'down' | 'flat'
  colorToken: string
}
