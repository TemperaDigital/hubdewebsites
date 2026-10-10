export type Bookmark = {
  id: string;
  url: string;
  title: string;
  subject: string;
  theme: string;
  tags: string[];
  notes: string;
  /** null = ainda não buscada; "" = buscada e sem imagem. */
  image: string | null;
  createdAt: string;
  updatedAt: string;
};

export function normalizeUrl(value: string) {
  const raw = value.trim();
  const url = new URL(/^[a-z][a-z\d+.-]*:/i.test(raw) ? raw : `https://${raw}`);
  if (
    !["http:", "https:"].includes(url.protocol) ||
    !url.hostname.includes(".") ||
    url.username ||
    url.password
  )
    throw new Error("Informe um endereço web válido.");
  return url.href;
}

/** Compara endereços ignorando #âncora, barra final, www e maiúsculas no host. */
export function sameUrl(a: string, b: string) {
  const key = (value: string) => {
    try {
      const u = new URL(value);
      return `${u.hostname.replace(/^www\./, "").toLowerCase()}${u.pathname.replace(/\/+$/, "")}${u.search}`;
    } catch {
      return value;
    }
  };
  return key(a) === key(b);
}

const VIDEO_PLATFORMS: [RegExp, string][] = [
  [/(^|\.)(youtube\.com|youtu\.be|youtube-nocookie\.com)$/, "YouTube"],
  [/(^|\.)vimeo\.com$/, "Vimeo"],
  [/(^|\.)(dailymotion\.com|dai\.ly)$/, "Dailymotion"],
  [/(^|\.)twitch\.tv$/, "Twitch"],
  [/(^|\.)tiktok\.com$/, "TikTok"],
  [/(^|\.)rumble\.com$/, "Rumble"],
  [/(^|\.)odysee\.com$/, "Odysee"],
];

/** Nome da plataforma quando o endereço é de um site de vídeos, senão null. */
export function videoPlatform(urlText: string): string | null {
  try {
    const host = new URL(urlText).hostname.toLowerCase();
    return VIDEO_PLATFORMS.find(([test]) => test.test(host))?.[1] ?? null;
  } catch {
    return null;
  }
}

export function suggest(urlText: string, extraText = "") {
  const url = new URL(urlText),
    host = url.hostname.replace(/^www\./, "");
  const platform = videoPlatform(urlText);
  let path = url.pathname;
  try {
    path = decodeURIComponent(path);
  } catch {}
  const text = (host + " " + path + " " + extraText).toLowerCase();
  const groups = [
    {
      test: /github|cloudflare|nvidia|openai|tecnologia|programa|software|linux|microsoft|developer/,
      subject: "Tecnologia",
      theme: "Ferramentas e referências",
    },
    {
      test: /coursera|udemy|wikipedia|edu\.|estudo|curso|learn|aula|school/,
      subject: "Estudos",
      theme: "Aprendizado",
    },
    {
      test: /pinterest|behance|dribbble|design|figma|canva|arte/,
      subject: "Inspiração",
      theme: "Ideias e referências",
    },
    {
      test: /receita|culinaria|cooking|food|allrecipes/,
      subject: "Vida pessoal",
      theme: "Culinária",
    },
    {
      test: /viagem|travel|booking|tripadvisor/,
      subject: "Vida pessoal",
      theme: "Viagens",
    },
    {
      test: /noticia|news|g1\.|bbc\.|reuters|folha/,
      subject: "Leituras",
      theme: "Notícias",
    },
    {
      test: /youtube|vimeo|spotify|netflix|music/,
      subject: "Entretenimento",
      theme: "Vídeos e música",
    },
    {
      test: /gov\.br|servico|portal|office|notion|trello/,
      subject: "Trabalho",
      theme: "Serviços e ferramentas",
    },
  ];
  const group = platform
    ? { subject: "Vídeos", theme: platform }
    : groups.find((g) => g.test.test(text));
  const tail = path
    .split("/")
    .filter(Boolean)
    .pop()
    ?.replace(/[-_]/g, " ")
    .replace(/\.[a-z]+$/i, "");
  return {
    title:
      tail && tail.length > 4 && tail.length < 90
        ? `${tail.charAt(0).toUpperCase()}${tail.slice(1)} · ${host}`
        : host,
    subject: group?.subject ?? "Outros",
    theme: group?.theme ?? "Para organizar",
  };
}

/** Extrai hashtags de um texto: "anotar #dev #react" -> ["dev","react"] */
export function extractTags(text: string): string[] {
  const matches = text.match(/#([\p{L}\p{N}_-]+)/gu) ?? [];
  return Array.from(new Set(matches.map((m) => m.slice(1).toLowerCase())));
}
