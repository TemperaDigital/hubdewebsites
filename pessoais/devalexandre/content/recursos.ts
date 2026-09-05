export interface Recurso {
  titulo: string;
  tipo: 'livro' | 'curso' | 'ferramenta' | 'artigo';
  link: string;
  descricao: string;
  gratuito: boolean;
}

export const recursos: Recurso[] = [
  {
    titulo: 'Visual Studio Code',
    tipo: 'ferramenta',
    link: 'https://code.visualstudio.com',
    descricao: 'Editor de código gratuito e poderoso. Meu principal ambiente de desenvolvimento, com extensões para tudo.',
    gratuito: true,
  },
  {
    titulo: 'Docker Desktop',
    tipo: 'ferramenta',
    link: 'https://www.docker.com/products/docker-desktop/',
    descricao: 'Essencial para containerização e deploy consistente. Uso diariamente no meu homelab e em projetos.',
    gratuito: true,
  },
  {
    titulo: 'Cloudflare',
    tipo: 'ferramenta',
    link: 'https://www.cloudflare.com',
    descricao: 'DNS, CDN, túneis e proteção DDoS. O plano gratuito já resolve a maioria dos cenários para projetos pessoais.',
    gratuito: true,
  },
  {
    titulo: 'The Pragmatic Programmer',
    tipo: 'livro',
    link: 'https://pragprog.com/titles/tpp20/',
    descricao: 'Clássico sobre desenvolvimento de software. Leitura obrigatória para qualquer desenvolvedor que quer evoluir na carreira.',
    gratuito: false,
  },
  {
    titulo: 'Full Stack Open',
    tipo: 'curso',
    link: 'https://fullstackopen.com/',
    descricao: 'Curso gratuito da Universidade de Helsinki. Cobre React, Node, TypeScript, GraphQL e testes. Excelente qualidade.',
    gratuito: true,
  },
  {
    titulo: 'freeCodeCamp',
    tipo: 'curso',
    link: 'https://www.freecodecamp.org/',
    descricao: 'Plataforma completa para aprender desenvolvimento web do zero. Projetos práticos e certificações gratuitas.',
    gratuito: true,
  },
  {
    titulo: 'Tania Rascia — Blog',
    tipo: 'artigo',
    link: 'https://www.taniarascia.com/',
    descricao: 'Blog técnico com tutoriais claros e bem escritos sobre JavaScript, React, Node e desenvolvimento web em geral.',
    gratuito: true,
  },
  {
    titulo: 'Obsidian',
    tipo: 'ferramenta',
    link: 'https://obsidian.md',
    descricao: 'App de notas baseado em Markdown com links bidirecionais. Uso como meu segundo cérebro digital.',
    gratuito: true,
  },
];
