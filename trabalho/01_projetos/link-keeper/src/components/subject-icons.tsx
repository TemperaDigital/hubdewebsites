import {
  BookOpen, Briefcase, Brain, Camera, Car, Code, Coffee, Cpu, Database, Dumbbell, Film,
  Folder, Gamepad2, Globe, GraduationCap, Headphones, Heart, House, Landmark, Leaf,
  Lightbulb, Monitor, Music, Newspaper, Palette, Plane, Podcast, Rocket, Scale, Shield,
  ShoppingCart, Smartphone, Star, Stethoscope, Terminal, Utensils, Video, Wallet, Wrench,
  type LucideIcon,
} from "lucide-react";

export const ICON_LIBRARY: Record<string, { label: string; Icon: LucideIcon }> = {
  monitor: { label: "Tecnologia", Icon: Monitor },
  code: { label: "Código", Icon: Code },
  terminal: { label: "Terminal", Icon: Terminal },
  cpu: { label: "Hardware", Icon: Cpu },
  database: { label: "Dados", Icon: Database },
  smartphone: { label: "Celular", Icon: Smartphone },
  shield: { label: "Segurança", Icon: Shield },
  rocket: { label: "Projetos", Icon: Rocket },
  "book-open": { label: "Estudos", Icon: BookOpen },
  "graduation-cap": { label: "Cursos", Icon: GraduationCap },
  brain: { label: "Ideias", Icon: Brain },
  lightbulb: { label: "Inspiração", Icon: Lightbulb },
  newspaper: { label: "Notícias", Icon: Newspaper },
  briefcase: { label: "Trabalho", Icon: Briefcase },
  landmark: { label: "Governo", Icon: Landmark },
  scale: { label: "Leis", Icon: Scale },
  wallet: { label: "Finanças", Icon: Wallet },
  "shopping-cart": { label: "Compras", Icon: ShoppingCart },
  palette: { label: "Arte", Icon: Palette },
  camera: { label: "Fotos", Icon: Camera },
  video: { label: "Vídeos", Icon: Video },
  film: { label: "Filmes", Icon: Film },
  music: { label: "Música", Icon: Music },
  headphones: { label: "Áudio", Icon: Headphones },
  podcast: { label: "Podcasts", Icon: Podcast },
  "gamepad-2": { label: "Jogos", Icon: Gamepad2 },
  heart: { label: "Vida pessoal", Icon: Heart },
  house: { label: "Casa", Icon: House },
  utensils: { label: "Comida", Icon: Utensils },
  coffee: { label: "Café", Icon: Coffee },
  dumbbell: { label: "Esporte", Icon: Dumbbell },
  stethoscope: { label: "Saúde", Icon: Stethoscope },
  leaf: { label: "Natureza", Icon: Leaf },
  plane: { label: "Viagens", Icon: Plane },
  car: { label: "Carros", Icon: Car },
  wrench: { label: "Ferramentas", Icon: Wrench },
  star: { label: "Favoritos", Icon: Star },
  globe: { label: "Web", Icon: Globe },
  folder: { label: "Pasta", Icon: Folder },
};

const DEFAULT_KEYS: Record<string, string> = {
  Tecnologia: "monitor",
  Estudos: "book-open",
  Inspiração: "palette",
  Trabalho: "briefcase",
  Vídeos: "video",
};

/** Ícone do assunto: escolhido na biblioteca ("lucide:chave"), imagem enviada (data URL) ou padrão. */
export function SubjectIcon({
  name,
  custom,
  size = 18,
  className,
}: {
  name: string;
  custom?: string | null | undefined;
  size?: number;
  className?: string | undefined;
}) {
  if (custom?.startsWith("data:image/"))
    return (
      <img
        src={custom}
        alt=""
        width={size}
        height={size}
        className={"subject-img " + (className ?? "")}
        style={{ width: size, height: size }}
      />
    );
  const key = custom?.startsWith("lucide:") ? custom.slice(7) : DEFAULT_KEYS[name];
  const Icon = (key && ICON_LIBRARY[key]?.Icon) || Folder;
  return <Icon size={size} className={className} />;
}
