export interface Video {
  titulo: string;
  plataforma: string;
  link: string;
  descricao: string;
  tipo: 'proprio' | 'indicacao';
}

export const videos: Video[] = [
  {
    titulo: 'Como comecei na área de TI sendo servidor público',
    plataforma: 'YouTube',
    link: 'https://youtube.com',
    descricao: 'Minha trajetória de transição para a área de tecnologia, desafios e aprendizados ao longo do caminho.',
    tipo: 'proprio',
  },
  {
    titulo: 'Configurando um HomeLab com ZimaOS',
    plataforma: 'YouTube',
    link: 'https://youtube.com',
    descricao: 'Passo a passo da instalação e configuração do ZimaOS no meu servidor doméstico.',
    tipo: 'proprio',
  },
  {
    titulo: 'Fireship — 100 Seconds of Code',
    plataforma: 'YouTube',
    link: 'https://www.youtube.com/@Fireship',
    descricao: 'Canal incrível que explica tecnologias complexas em 100 segundos. Conteúdo rápido e direto ao ponto.',
    tipo: 'indicacao',
  },
  {
    titulo: 'Theo — t3.gg',
    plataforma: 'YouTube',
    link: 'https://www.youtube.com/@t3dotgg',
    descricao: 'Discussões profundas sobre o ecossistema web moderno, Next.js, TypeScript e boas práticas.',
    tipo: 'indicacao',
  },
  {
    titulo: 'Traversy Media — Web Development',
    plataforma: 'YouTube',
    link: 'https://www.youtube.com/@TraversyMedia',
    descricao: 'Tutoriais completos e práticos sobre desenvolvimento web. Um dos melhores canais para aprender.',
    tipo: 'indicacao',
  },
  {
    titulo: 'Fabio Akita — Programação e Carreira',
    plataforma: 'YouTube',
    link: 'https://www.youtube.com/@Akitando',
    descricao: 'Conteúdo de alta qualidade sobre programação, carreira em TI e tecnologia no Brasil.',
    tipo: 'indicacao',
  },
];
