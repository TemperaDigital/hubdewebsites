import type {
  News, QuickLink, ResourceItem, Kudo, EventItem, Person, Anniversary, Kpi,
} from './types'

// ===== DADOS FICTÍCIOS (fase visual). Serão substituídos pelo Supabase. =====

export const currentUser = { firstName: 'Alexandre', fullName: 'Alexandre Guerra' }

export const heroNews: News = {
  id: 'n1', slug: 'mensagem-do-diretor',
  title: 'Mensagem da Direção: nossos rumos para o próximo ciclo',
  summary: 'Não estaríamos onde estamos hoje sem cada um de vocês. Obrigado por tornarem isto possível.',
  category: 'Direção', isHero: true, publishedAt: '2026-09-01',
}

export const news: News[] = [
  { id: 'n2', slug: 'nova-politica-teletrabalho', title: 'Atualização da política de teletrabalho chega em novembro', category: 'RH', publishedAt: '2026-09-04', coverUrl: '' },
  { id: 'n3', slug: 'desafio-30-dias', title: 'Desafio dos 30 dias de caminhada começa semana que vem', category: 'Bem-estar', publishedAt: '2026-09-03', coverUrl: '' },
  { id: 'n4', slug: '5-ferramentas-reunioes', title: '5 ferramentas para tornar suas reuniões mais produtivas', category: 'Produtividade', publishedAt: '2026-09-02', coverUrl: '' },
]

export const quickLinks: QuickLink[] = [
  { id: 'q1', label: 'Férias', url: '#', icon: 'palmtree', color: '#2E7D5B' },
  { id: 'q2', label: 'Ponto', url: '#', icon: 'clock', color: '#2FA6A0' },
  { id: 'q3', label: 'Benefícios', url: '#', icon: 'heart-pulse', color: '#E5484D' },
  { id: 'q4', label: 'Helpdesk', url: '#', icon: 'life-buoy', color: '#F5B301' },
  { id: 'q5', label: 'Relatórios', url: '#', icon: 'bar-chart-3', color: '#2d4675' },
  { id: 'q6', label: 'Projetos', url: '#', icon: 'kanban', color: '#7C5CFC' },
  { id: 'q7', label: 'Diretório', url: '#', icon: 'users', color: '#1B2A4A' },
]

export const resources: ResourceItem[] = [
  { id: 'r1', title: 'Aplicações internas', category: 'Aplicações', url: '#' },
  { id: 'r2', title: 'Manual do Colaborador', category: 'Manuais', url: '#' },
  { id: 'r3', title: 'Modelos de documentos', category: 'Modelos', url: '#' },
  { id: 'r4', title: 'Formulários de RH', category: 'Formulários', url: '#' },
  { id: 'r5', title: 'Políticas e normas', category: 'Políticas', url: '#' },
  { id: 'r6', title: 'Termos e NDAs', category: 'Jurídico', url: '#' },
]
export const resourceCategories = ['Aplicações', 'Manuais', 'Modelos', 'Formulários', 'Políticas', 'Jurídico']

export const kudos: Kudo[] = [
  { id: 'k1', from: 'Mariana Alves', to: 'Rafael Souza', message: 'Um agradecimento enorme ao Rafael pela dedicação no fechamento do mês — resolveu tudo com calma e precisão.', createdAt: '2026-09-05', reactions: 12 },
  { id: 'k2', from: 'João Pedro', to: 'Equipe de TI', message: 'Obrigado à equipe de TI pela migração sem downtime. Trabalho impecável!', createdAt: '2026-09-04', reactions: 8 },
]

export const events: EventItem[] = [
  { id: 'e1', title: 'Integração de novos servidores', startAt: '2026-09-10', time: '09:00 – 10:00', category: 'RH' },
  { id: 'e2', title: 'Town Hall trimestral', startAt: '2026-09-18', time: '15:00 – 16:00', category: 'Direção' },
  { id: 'e3', title: 'Treinamento: LGPD na prática', startAt: '2026-09-24', time: '14:00 – 16:00', category: 'Treinamento' },
]

export const people: Person[] = [
  { ref: '1', fullName: 'Bruno Hack', jobTitle: 'Analista de Projetos', department: 'Projetos', businessPhone: '(83) 3000-0001', email: 'bruno@org.gov.br' },
  { ref: '2', fullName: 'Daniela Costa', jobTitle: 'Consultora de Vendas', department: 'Comercial', businessPhone: '(83) 3000-0002', email: 'daniela@org.gov.br' },
  { ref: '3', fullName: 'Kléber Wright', jobTitle: 'Designer', department: 'Comunicação', businessPhone: '(83) 3000-0003', email: 'kleber@org.gov.br' },
  { ref: '4', fullName: 'Sônia Prado', jobTitle: 'Coordenadora de RH', department: 'RH', businessPhone: '(83) 3000-0004', email: 'sonia@org.gov.br' },
]

export const anniversaries: Anniversary[] = [
  { ref: 'a1', fullName: 'André Clark', jobTitle: 'Diretor Executivo', years: 2, date: '01/09' },
  { ref: 'a2', fullName: 'Luís Ponce', jobTitle: 'Sucesso do Cliente', years: 1, date: '03/09' },
  { ref: 'a3', fullName: 'Ubiratan Paté', jobTitle: 'Arquiteto de Sistemas', years: 4, date: '28/09' },
  { ref: 'a4', fullName: 'Iara Pereira', jobTitle: 'Diretora de Produto', years: 8, date: '30/09' },
]

export const kpis: Kpi[] = [
  { id: 'kp1', label: 'Processos concluídos', displayValue: '1.812', period: 'neste trimestre', trend: 'up', colorToken: '#1B2A4A' },
  { id: 'kp2', label: 'Satisfação interna', displayValue: '92%', period: 'neste trimestre', trend: 'up', colorToken: '#2E7D5B' },
  { id: 'kp3', label: 'Chamados abertos', displayValue: '27', period: 'esta semana', trend: 'down', colorToken: '#2FA6A0' },
  { id: 'kp4', label: 'Prazo médio', displayValue: '4,5d', period: 'neste trimestre', trend: 'flat', colorToken: '#2d4675' },
  { id: 'kp5', label: 'Treinamentos', displayValue: '318', period: 'concluídos no ano', trend: 'up', colorToken: '#7C5CFC' },
]
