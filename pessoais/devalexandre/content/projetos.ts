export interface Projeto {
  nome: string;
  ano: number;
  descricao: string;
  stack: string[];
  links: {
    github?: string;
    demo?: string;
    artigo?: string;
  };
  destaque: boolean;
}

export const projetos: Projeto[] = [
  {
    nome: 'Estudos.dev',
    ano: 2025,
    descricao: 'Plataforma de estudos e trilhas de aprendizado em tecnologia. Reúne cursos, tutoriais e materiais curados para quem está começando ou quer se aprofundar em desenvolvimento web.',
    stack: ['Next.js', 'TypeScript', 'Tailwind CSS', 'MDX'],
    links: {
      demo: 'https://estudos.fguerra.ia.br',
    },
    destaque: true,
  },
  {
    nome: 'Tempera Digital',
    ano: 2024,
    descricao: 'Agência digital focada em criar soluções web personalizadas para pequenos negócios e profissionais liberais. Do design à implementação.',
    stack: ['Next.js', 'React', 'Node.js', 'PostgreSQL'],
    links: {
      demo: 'https://temperadigital.fguerra.ia.br',
    },
    destaque: true,
  },
  {
    nome: 'HomeLab ZimaOS',
    ano: 2025,
    descricao: 'Servidor doméstico configurado com ZimaOS, Docker e Cloudflare Tunnel. Self-hosting de aplicações, backup automatizado e monitoramento.',
    stack: ['Docker', 'ZimaOS', 'Cloudflare', 'Linux'],
    links: {
      artigo: '/blog/configurando-homelab-zimaos',
    },
    destaque: true,
  },
  {
    nome: 'Bot de Automação Telegram',
    ano: 2024,
    descricao: 'Bot para automação de tarefas rotineiras via Telegram. Integração com APIs externas, agendamento de mensagens e notificações inteligentes.',
    stack: ['Python', 'Telegram API', 'Docker'],
    links: {
      github: 'https://github.com/alexandreguerra',
    },
    destaque: false,
  },
];
