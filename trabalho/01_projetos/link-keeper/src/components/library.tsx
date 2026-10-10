import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
  Bookmark as BookmarkIcon,
  Search,
  Plus,
  Link2,
  LibraryBig,
  Folder,
  CalendarDays,
  ExternalLink,
  Pencil,
  Trash2,
  StickyNote,
  X,
  LoaderCircle,
  Check,
  Globe,
  ChevronDown,
  Hash,
  Play,
  ImagePlus,
  Settings2,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RichNotes, useResolveLink } from "@/components/rich-notes";
import { finalizeNotes, notesToHtml, notesToText } from "@/lib/rich-notes";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  analyzeLink,
  createLink,
  deleteLink,
  enrichLinks,
  listLinks,
  listSubjects,
  saveSubject,
  updateLink,
} from "@/lib/links.functions";
import { ICON_LIBRARY, SubjectIcon } from "@/components/subject-icons";
import {
  normalizeUrl,
  sameUrl,
  suggest,
  extractTags,
  videoPlatform,
  type Bookmark,
} from "@/lib/link-utils";

const standard = [
  "Tecnologia",
  "Estudos",
  "Trabalho",
  "Inspiração",
  "Leituras",
  "Vida pessoal",
  "Entretenimento",
  "Vídeos",
  "Outros",
];
const color = (s: string) =>
  ({
    Tecnologia: "blue",
    Estudos: "purple",
    Trabalho: "amber",
    Inspiração: "pink",
    Leituras: "teal",
    "Vida pessoal": "green",
    Entretenimento: "purple",
    Vídeos: "pink",
  })[s] ?? "gray";
function Chips({
  options,
  value,
  onPick,
}: {
  options: string[];
  value: string;
  onPick: (v: string) => void;
}) {
  const shown = options.slice(0, 14);
  if (!shown.length) return null;
  return (
    <div className="chips">
      {shown.map((o) => (
        <button
          key={o}
          type="button"
          className={o === value ? "chip on" : "chip"}
          onClick={() => onPick(o)}
        >
          {o}
        </button>
      ))}
    </div>
  );
}
const folded = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
const date = (s: string) =>
  new Date(s).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "America/Fortaleza",
  });
const emptyDraft: Bookmark = {
  id: "",
  url: "",
  title: "",
  subject: "Outros",
  theme: "Para organizar",
  tags: [],
  notes: "",
  image: null,
  createdAt: "",
  updatedAt: "",
};

/** Reduz a imagem escolhida para no máximo 800 px e devolve um data URL JPEG (~50-150 KB). */
async function imageToDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Escolha um arquivo de imagem.");
  const bitmap = await createImageBitmap(file).catch(() => {
    throw new Error("Não consegui ler essa imagem.");
  });
  const scale = Math.min(1, 800 / bitmap.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Não consegui processar a imagem.");
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  for (const q of [0.82, 0.7, 0.55]) {
    const url = canvas.toDataURL("image/jpeg", q);
    if (url.length <= 250_000) return url;
  }
  throw new Error("Imagem grande demais, escolha outra.");
}

/** Recorta o centro da imagem em quadrado de 64 px e devolve um data URL PNG. */
async function imageToIconUrl(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Escolha um arquivo de imagem.");
  const bitmap = await createImageBitmap(file).catch(() => {
    throw new Error("Não consegui ler essa imagem.");
  });
  const side = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 64;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Não consegui processar a imagem.");
  ctx.drawImage(
    bitmap,
    (bitmap.width - side) / 2,
    (bitmap.height - side) / 2,
    side,
    side,
    0,
    0,
    64,
    64,
  );
  return canvas.toDataURL("image/png");
}

function CardThumb({
  link,
  onPickFile,
}: {
  link: Bookmark;
  onPickFile: (file: File) => void;
}) {
  const [failed, setFailed] = useState(false);
  const host = new URL(link.url).hostname.replace(/^www\./, "");
  const isVideo = videoPlatform(link.url) !== null;
  const showImage = !!link.image && !failed;
  const play = isVideo && (
    <span className="thumb-play">
      <Play size={18} fill="currentColor" />
    </span>
  );
  if (showImage)
    return (
      <a
        className="card-thumb has-image"
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        tabIndex={-1}
        aria-hidden="true"
      >
        <img
          src={link.image ?? ""}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
        />
        {play}
      </a>
    );
  return (
    <div className={"card-thumb no-image " + color(link.subject)}>
      <span className="thumb-initial">{host.charAt(0).toUpperCase()}</span>
      {play}
      <label className="thumb-add">
        <ImagePlus size={14} />
        Adicionar capa
        <small>(ou Ctrl+V)</small>
        <input
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            if (f) onPickFile(f);
          }}
        />
      </label>
    </div>
  );
}

export default function Library({ initialAdd }: { initialAdd?: string | undefined }) {
  const queryClient = useQueryClient();
  const fetchLinks = useServerFn(listLinks);
  const analyzeFn = useServerFn(analyzeLink);
  const createFn = useServerFn(createLink);
  const updateFn = useServerFn(updateLink);
  const deleteFn = useServerFn(deleteLink);
  const enrichFn = useServerFn(enrichLinks);
  const subjectsFn = useServerFn(listSubjects);
  const saveSubjectFn = useServerFn(saveSubject);

  const [url, setUrl] = useState(""),
    [query, setQuery] = useState(""),
    [subject, setSubject] = useState("Todos"),
    [theme, setTheme] = useState("Todos"),
    [month, setMonth] = useState(""),
    [sort, setSort] = useState("newest");
  const [draft, setDraft] = useState<Bookmark | null>(null),
    [toDelete, setToDelete] = useState<Bookmark | null>(null),
    [iconFor, setIconFor] = useState<string | null>(null),
    [formError, setFormError] = useState(""),
    [message, setMessage] = useState("");

  const {
    data: links = [],
    isPending: loading,
    error: loadError,
    refetch,
  } = useQuery({ queryKey: ["links"], queryFn: () => fetchLinks() });

  const { data: subjectMeta = [] } = useQuery({
    queryKey: ["subjects"],
    queryFn: () => subjectsFn(),
  });
  const iconOf = (name: string) => subjectMeta.find((m) => m.name === name)?.icon ?? null;
  const saveSubjectMutation = useMutation({
    mutationFn: saveSubjectFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      setIconFor(null);
      flash("Ícone do assunto atualizado.");
    },
  });

  const enrichRounds = useRef(0);
  useEffect(() => {
    if (loading || enrichRounds.current >= 20) return;
    if (!links.some((l) => l.image === null)) return;
    enrichRounds.current += 1;
    enrichFn()
      .then((r) => {
        if (r.checked > 0) queryClient.invalidateQueries({ queryKey: ["links"] });
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [links, loading]);

  const resolveLink = useResolveLink(links);
  const hoveredId = useRef<string | null>(null);
  const pasteHandler = useRef<(file: File) => void>(() => {});
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const item = Array.from(e.clipboardData?.items ?? []).find((i) =>
        i.type.startsWith("image/"),
      );
      const file = item?.getAsFile();
      if (!file) return;
      e.preventDefault();
      pasteHandler.current(file);
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, []);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["links"] });
  const flash = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 5000);
  };

  const createMutation = useMutation({
    mutationFn: createFn,
    onSuccess: () => {
      invalidate();
      setUrl("");
      flash("Link salvo e classificado. Ajuste o assunto ou adicione anotações quando quiser.");
    },
  });
  const updateMutation = useMutation({
    mutationFn: updateFn,
    onSuccess: () => {
      invalidate();
      setDraft(null);
      flash("Link salvo.");
    },
  });
  const deleteMutation = useMutation({
    mutationFn: deleteFn,
    onSuccess: () => {
      invalidate();
      setToDelete(null);
      flash("Link excluído.");
    },
  });
  const [analyzing, setAnalyzing] = useState(false);
  const busy =
    analyzing ||
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  const subjects = Array.from(
    new Set([...standard, ...links.map((l) => l.subject)]),
  );
  const sidebarSubjects = useMemo(() => {
    const counts = new Map<string, number>();
    for (const l of links) counts.set(l.subject, (counts.get(l.subject) ?? 0) + 1);
    for (const m of subjectMeta) if (!counts.has(m.name)) counts.set(m.name, 0);
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "pt-BR"))
      .map(([name]) => name);
  }, [links, subjectMeta]);
  const themeOptions = useMemo(() => {
    const same = links.filter((l) => l.subject === draft?.subject).map((l) => l.theme);
    const all = links.map((l) => l.theme);
    return Array.from(new Set(same.length ? same : all));
  }, [links, draft?.subject]);
  const themes = Array.from(
    new Set(
      links
        .filter((l) => subject === "Todos" || l.subject === subject)
        .map((l) => l.theme),
    ),
  ).sort((a, b) => a.localeCompare(b, "pt-BR"));

  const filtered = useMemo(
    () =>
      links
        .filter((l) => {
          const q = folded(query);
          return (
            (subject === "Todos" || l.subject === subject) &&
            (theme === "Todos" || l.theme === theme) &&
            (!month || l.createdAt.slice(0, 7) === month) &&
            folded(
              [l.title, l.url, l.subject, l.theme, notesToText(l.notes), l.tags.join(" ")].join(
                " ",
              ),
            ).includes(q)
          );
        })
        .sort((a, b) =>
          sort === "title"
            ? a.title.localeCompare(b.title, "pt-BR")
            : sort === "oldest"
              ? a.createdAt.localeCompare(b.createdAt)
              : b.createdAt.localeCompare(a.createdAt),
        ),
    [links, query, subject, theme, month, sort],
  );

  async function saveFromUrl(raw: string) {
    const valid = normalizeUrl(raw);
    const duplicate = links.find((l) => sameUrl(l.url, valid));
    if (duplicate) {
      setUrl("");
      flash(`Este link já está na sua biblioteca: “${duplicate.title}”.`);
      return;
    }
    setAnalyzing(true);
    try {
      const found = await analyzeFn({ data: { url: valid } }).catch(() => ({
        ...suggest(valid),
        tags: [] as string[],
      }));
      await createMutation.mutateAsync({
        data: {
          url: valid,
          title: found.title,
          subject: found.subject,
          theme: found.theme,
          tags: found.tags,
          notes: "",
          image: "image" in found ? found.image : "",
        },
      });
    } finally {
      setAnalyzing(false);
    }
  }

  async function quickAdd(e: FormEvent) {
    e.preventDefault();
    setFormError("");
    try {
      await saveFromUrl(url);
    } catch (err) {
      setFormError((err as Error).message);
    }
  }

  const addedFromLink = useRef(false);
  useEffect(() => {
    if (!initialAdd || loading || addedFromLink.current) return;
    addedFromLink.current = true;
    saveFromUrl(initialAdd)
      .catch((err) => setFormError((err as Error).message))
      .finally(() => {
        window.history.replaceState(null, "", "/");
        if (window.name === "linkoteka") setTimeout(() => window.close(), 2200);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialAdd, loading]);

  const bookmarkletRef = (el: HTMLAnchorElement | null) => {
    if (!el) return;
    const code = `(function(){window.open('${window.location.origin}/?add='+encodeURIComponent(location.href),'linkoteka','width=560,height=420')})()`;
    el.setAttribute("href", "javascript:" + encodeURIComponent(code));
  };

  async function saveDraft(e: FormEvent) {
    e.preventDefault();
    if (!draft) return;
    setFormError("");
    try {
      const valid = normalizeUrl(draft.url);
      const payload = {
        url: valid,
        title: draft.title,
        subject: draft.subject,
        theme: draft.theme,
        tags: draft.tags,
        notes: finalizeNotes(draft.notes, resolveLink),
        image: draft.image,
      };
      if (draft.id) {
        await updateMutation.mutateAsync({ data: { id: draft.id, ...payload } });
      } else {
        await createMutation.mutateAsync({ data: payload });
        setDraft(null);
        flash("Link salvo.");
      }
    } catch (err) {
      setFormError((err as Error).message);
    }
  }

  async function setCover(l: Bookmark, file: File) {
    setFormError("");
    try {
      const image = await imageToDataUrl(file);
      await updateMutation.mutateAsync({
        data: {
          id: l.id,
          url: l.url,
          title: l.title,
          subject: l.subject,
          theme: l.theme,
          tags: l.tags,
          notes: l.notes,
          image,
        },
      });
      flash("Capa atualizada.");
    } catch (err) {
      setFormError((err as Error).message);
    }
  }

  async function pickDraftCover(file: File) {
    setFormError("");
    try {
      const image = await imageToDataUrl(file);
      setDraft((d) => (d ? { ...d, image } : d));
    } catch (err) {
      setFormError((err as Error).message);
    }
  }

  pasteHandler.current = (file) => {
    if (iconFor !== null || toDelete) return;
    if (draft) return void pickDraftCover(file);
    const target = links.find((l) => l.id === hoveredId.current);
    if (target) void setCover(target, file);
    else flash("Passe o mouse sobre um card antes de colar a imagem (Ctrl+V).");
  };

  async function remove() {
    if (!toDelete) return;
    setFormError("");
    try {
      await deleteMutation.mutateAsync({ data: { id: toDelete.id } });
    } catch (err) {
      setFormError((err as Error).message);
    }
  }

  function reset() {
    setQuery("");
    setSubject("Todos");
    setTheme("Todos");
    setMonth("");
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <a className="brand" href="/">
          <span className="brandmark">
            <BookmarkIcon size={22} fill="currentColor" />
          </span>
          linkoteka<span className="branddot">.</span>
        </a>
        <div className="side-label">SUA BIBLIOTECA</div>
        <button
          className={subject === "Todos" ? "nav-item active" : "nav-item"}
          onClick={() => {
            setSubject("Todos");
            setTheme("Todos");
          }}
        >
          <LibraryBig size={19} />
          <span>Todos os links</span>
          <b>{links.length}</b>
        </button>
        <div className="side-label category-heading">
          ASSUNTOS<span>{new Set(links.map((l) => l.subject)).size}</span>
        </div>
        <nav aria-label="Filtrar por assunto">
          {sidebarSubjects.map((s) => (
            <div key={s} className="nav-row">
              <button
                className={subject === s ? "nav-item active" : "nav-item"}
                onClick={() => {
                  setSubject(s);
                  setTheme("Todos");
                }}
              >
                <SubjectIcon name={s} custom={iconOf(s)} size={18} className={"icon-" + color(s)} />
                <span>{s}</span>
                <small>{links.filter((l) => l.subject === s).length}</small>
              </button>
              <button
                type="button"
                className="nav-edit"
                aria-label={"Personalizar ícone de " + s}
                title="Personalizar ícone"
                onClick={() => {
                  setFormError("");
                  setIconFor(s);
                }}
              >
                <Settings2 size={14} />
              </button>
            </div>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <span className="avatar">EU</span>
          <div>
            <strong>Biblioteca pessoal</strong>
            <small>Seu espaço de referências</small>
          </div>
        </div>
      </aside>
      <main className="workspace">
        <header className="topbar">
          <div>
            <LibraryBig size={17} />
            <span>Minha biblioteca</span>
            <span className="slash">/</span>
            <strong>{subject === "Todos" ? "Todos os links" : subject}</strong>
          </div>
          <span className="private">
            <BookmarkIcon size={14} />
            Espaço pessoal
          </span>
        </header>
        <div className="content">
          <div className="heading">
            <div>
              <p className="eyebrow">GUARDAR PARA REENCONTRAR</p>
              <h1>
                {subject === "Todos" ? "Minha biblioteca" : subject}
                <span>
                  {subject === "Todos"
                    ? links.length
                    : links.filter((l) => l.subject === subject).length}
                </span>
              </h1>
              <p className="intro">
                Os links que importam, com o contexto que você precisa.
              </p>
            </div>
            <Button
              className="secondary add-detail"
              variant="outline"
              onClick={() => {
                setFormError("");
                setDraft({ ...emptyDraft });
              }}
            >
              <Plus />
              Novo link
            </Button>
          </div>
          <section className="capture" aria-labelledby="capture-title">
            <div className="capture-icon">
              <Link2 size={23} />
            </div>
            <div className="capture-body">
              <h2 id="capture-title">Encontrou algo interessante?</h2>
              <form onSubmit={quickAdd} className="capture-form">
                <Input
                  aria-label="Endereço web para salvar"
                  placeholder="Cole o endereço aqui. Ex.: https://..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                  maxLength={4000}
                />
                <Button className="primary" disabled={busy || loading}>
                  {busy ? <LoaderCircle className="spin" /> : <Plus />}
                  {analyzing ? "Analisando a página…" : "Salvar link"}
                </Button>
              </form>
              <p>
                A página é lida e o título, assunto, tema e hashtags são
                definidos automaticamente. Você pode editar depois.
              </p>
              <p className="bookmarklet">
                Salvar direto de qualquer site: arraste{" "}
                <a
                  ref={bookmarkletRef}
                  onClick={(e) => e.preventDefault()}
                  draggable
                >
                  + Linkoteka
                </a>{" "}
                para a barra de favoritos e clique nele na página que quiser
                guardar.
              </p>
            </div>
          </section>
          {loadError && (
            <div className="error" role="alert">
              {(loadError as Error).message}
              <button onClick={() => void refetch()}>
                Tentar carregar novamente
              </button>
            </div>
          )}
          {formError && !draft && !toDelete && (
            <div className="error" role="alert">
              {formError}
            </div>
          )}
          <section className="collection">
            <div className="searchrow">
              <div className="searchbox">
                <Search size={19} />
                <Input
                  aria-label="Buscar na biblioteca"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar por título, endereço, tema, hashtag ou anotação..."
                />
                {query && (
                  <button aria-label="Limpar busca" onClick={() => setQuery("")}>
                    <X size={16} />
                  </button>
                )}
              </div>
              <label className="sort">
                <span>Ordenar</span>
                <select
                  aria-label="Ordenar links"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  <option value="newest">Mais recentes</option>
                  <option value="oldest">Mais antigos</option>
                  <option value="title">Título: A–Z</option>
                </select>
                <ChevronDown size={15} />
              </label>
            </div>
            <div className="filterrow">
              <div className="filterselect">
                <Folder size={15} />
                <select
                  aria-label="Filtrar por assunto"
                  value={subject}
                  onChange={(e) => {
                    setSubject(e.target.value);
                    setTheme("Todos");
                  }}
                >
                  <option value="Todos">Todos os assuntos</option>
                  {sidebarSubjects.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="filterselect">
                <BookmarkIcon size={15} />
                <select
                  aria-label="Filtrar por tema"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                >
                  <option value="Todos">Todos os temas</option>
                  {themes.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
              <label className="filterselect datefilter">
                <CalendarDays size={15} />
                <span>Data</span>
                <input
                  type="month"
                  aria-label="Filtrar pelo mês de cadastro"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                />
              </label>
              {(query || subject !== "Todos" || theme !== "Todos" || month) && (
                <button className="clear" onClick={reset}>
                  Limpar filtros
                </button>
              )}
              <span className="resultcount">
                {filtered.length} {filtered.length === 1 ? "link" : "links"}
              </span>
            </div>
            {loading ? (
              <div className="empty">
                <LoaderCircle size={28} className="spin" />
                <h2>Carregando sua biblioteca…</h2>
              </div>
            ) : filtered.length ? (
              <div className="cards">
                {filtered.map((l) => (
                  <article
                    className={"card accent-" + color(l.subject)}
                    key={l.id}
                    onMouseEnter={() => (hoveredId.current = l.id)}
                    onMouseLeave={() => {
                      if (hoveredId.current === l.id) hoveredId.current = null;
                    }}
                    onDragOver={(e) => {
                      if (Array.from(e.dataTransfer.types).includes("Files")) e.preventDefault();
                    }}
                    onDrop={(e) => {
                      const f = Array.from(e.dataTransfer.files).find((x) =>
                        x.type.startsWith("image/"),
                      );
                      if (!f) return;
                      e.preventDefault();
                      void setCover(l, f);
                    }}
                  >
                    <CardThumb link={l} onPickFile={(f) => setCover(l, f)} />
                    <div className="card-top">
                      <div className={"site-symbol " + color(l.subject)}>
                        <Globe size={22} />
                      </div>
                      <span className={"badge " + color(l.subject)}>
                        <SubjectIcon name={l.subject} custom={iconOf(l.subject)} size={13} />
                        {l.subject}
                      </span>
                      <div className="card-actions">
                        <button
                          aria-label={"Editar " + l.title}
                          title="Editar link e anotações"
                          onClick={() => {
                            setFormError("");
                            setDraft({ ...l });
                          }}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          aria-label={"Excluir " + l.title}
                          title="Excluir link"
                          onClick={() => {
                            setFormError("");
                            setToDelete(l);
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <h2>
                      <a href={l.url} target="_blank" rel="noopener noreferrer">
                        {l.title}
                      </a>
                    </h2>
                    <a
                      className="domain"
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {new URL(l.url).hostname.replace(/^www\./, "")}
                      <ExternalLink size={12} />
                    </a>
                    <div className="theme-tag">
                      <span>#</span>
                      {l.theme}
                    </div>
                    {l.tags.length > 0 && (
                      <div className="theme-tag" style={{ marginTop: -8 }}>
                        <Hash size={12} />
                        {l.tags.map((t) => `#${t}`).join(" ")}
                      </div>
                    )}
                    {l.notes ? (
                      <div className="note-box">
                        <StickyNote size={15} />
                        <div
                          className="note-rich"
                          dangerouslySetInnerHTML={{ __html: notesToHtml(l.notes) }}
                        />
                        <button
                          className="note-edit"
                          onClick={() => {
                            setFormError("");
                            setDraft({ ...l });
                          }}
                          aria-label={"Editar anotações de " + l.title}
                          title="Editar anotações"
                        >
                          <Pencil size={13} />
                        </button>
                      </div>
                    ) : (
                      <button
                        className="note blank"
                        onClick={() => {
                          setFormError("");
                          setDraft({ ...l });
                        }}
                        aria-label={"Editar anotações de " + l.title}
                      >
                        <StickyNote size={15} />
                        <span>Adicionar uma anotação...</span>
                        <Plus size={14} />
                      </button>
                    )}
                    <footer>
                      <span>
                        <CalendarDays size={13} />
                        {date(l.createdAt)}
                      </span>
                      <a href={l.url} target="_blank" rel="noopener noreferrer">
                        Abrir site
                        <ExternalLink size={14} />
                      </a>
                    </footer>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty">
                <span className="empty-icon">
                  <BookmarkIcon size={30} />
                </span>
                <h2>
                  {links.length
                    ? "Nenhum link encontrado"
                    : "Seu próximo favorito começa aqui"}
                </h2>
                <p>
                  {links.length
                    ? "Experimente outro termo ou limpe os filtros."
                    : "Cole um endereço acima para criar seu primeiro cartão. Adicione anotações para lembrar por que vale a pena voltar."}
                </p>
                {links.length > 0 && (
                  <Button
                    variant="outline"
                    className="secondary"
                    onClick={reset}
                  >
                    Limpar filtros
                  </Button>
                )}
              </div>
            )}
          </section>
          <div className="footnote">
            <StickyNote size={14} />
            Uma boa anotação transforma um link em uma referência.
          </div>
        </div>
      </main>
      {message && (
        <div className="toast" role="status">
          <Check size={18} />
          {message}
        </div>
      )}
      <Dialog
        open={!!draft}
        onOpenChange={(open) => {
          if (!open && !busy) setDraft(null);
        }}
      >
        <DialogContent className="editor">
          <DialogTitle>{draft?.id ? "Editar link" : "Novo link"}</DialogTitle>
          <DialogDescription>
            Organize o endereço e guarde o que você quer lembrar.
          </DialogDescription>
          {draft && (
            <form onSubmit={saveDraft} className="editor-form">
              <label>
                Endereço web
                <Input
                  autoFocus
                  required
                  maxLength={4000}
                  value={draft.url}
                  placeholder="https://..."
                  onChange={(e) => setDraft({ ...draft, url: e.target.value })}
                  onBlur={async () => {
                    if (draft.id || draft.title || !draft.url) return;
                    try {
                      const valid = normalizeUrl(draft.url);
                      const found = await analyzeFn({ data: { url: valid } }).catch(
                        () => ({ ...suggest(valid), tags: [] as string[] }),
                      );
                      setDraft((d) =>
                        d && !d.title
                          ? {
                              ...d,
                              url: valid,
                              title: found.title,
                              subject: found.subject,
                              theme: found.theme,
                              tags: Array.from(new Set([...d.tags, ...found.tags])),
                            }
                          : d,
                      );
                    } catch {}
                  }}
                />
              </label>
              <label>
                Título
                <Input
                  required
                  maxLength={200}
                  value={draft.title}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                />
              </label>
              <div className="two-fields">
                <div className="field-group">
                  <label>
                    Assunto
                    <Input
                      required
                      maxLength={200}
                      placeholder="Escolha abaixo ou digite um novo"
                      value={draft.subject}
                      onChange={(e) =>
                        setDraft({ ...draft, subject: e.target.value })
                      }
                    />
                  </label>
                  <Chips
                    options={subjects}
                    value={draft.subject}
                    onPick={(v) => setDraft({ ...draft, subject: v })}
                  />
                </div>
                <div className="field-group">
                  <label>
                    Tema
                    <Input
                      required
                      maxLength={200}
                      placeholder="Escolha abaixo ou digite um novo"
                      value={draft.theme}
                      onChange={(e) =>
                        setDraft({ ...draft, theme: e.target.value })
                      }
                    />
                  </label>
                  <Chips
                    options={themeOptions}
                    value={draft.theme}
                    onPick={(v) => setDraft({ ...draft, theme: v })}
                  />
                </div>
              </div>
              <p className="editor-date">
                Digitou algo novo? O assunto ou tema é criado ao salvar.
              </p>
              <div className="cover-field">
                <span>
                  Capa do card <small>— envie um arquivo ou cole um print com Ctrl+V</small>
                </span>
                <div className="cover-row">
                  {draft.image && <img className="cover-preview" src={draft.image} alt="" />}
                  <div className="cover-buttons">
                    <label className="chip">
                      <ImagePlus size={13} /> Enviar imagem
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          e.target.value = "";
                          if (f) pickDraftCover(f);
                        }}
                      />
                    </label>
                    {draft.id && (
                      <button
                        type="button"
                        className="chip"
                        onClick={() => setDraft({ ...draft, image: null })}
                      >
                        Usar a imagem do site
                      </button>
                    )}
                    {!!draft.image && (
                      <button
                        type="button"
                        className="chip"
                        onClick={() => setDraft({ ...draft, image: "" })}
                      >
                        Sem capa
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <label>
                Hashtags (separadas por vírgula)
                <Input
                  maxLength={400}
                  placeholder="Ex.: referência, dev, ler-depois"
                  value={draft.tags.join(", ")}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      tags: e.target.value
                        .split(",")
                        .map((t) => t.trim().replace(/^#/, "").toLowerCase())
                        .filter(Boolean),
                    })
                  }
                />
              </label>
              <div className="rn-field">
                <span className="rn-title">Anotações</span>
                <RichNotes
                  key={draft.id ?? "novo"}
                  value={draft.notes}
                  links={links}
                  currentId={draft.id}
                  theme={draft.theme}
                  onChange={(notes) =>
                    setDraft((d) =>
                      d
                        ? {
                            ...d,
                            notes,
                            tags: Array.from(
                              new Set([...d.tags, ...extractTags(notesToText(notes))]),
                            ),
                          }
                        : d,
                    )
                  }
                />
              </div>
              {draft.createdAt && (
                <p className="editor-date">
                  Salvo em {date(draft.createdAt)} · atualizado em{" "}
                  {date(draft.updatedAt)}
                </p>
              )}
              {formError && (
                <p className="error" role="alert">
                  {formError}
                </p>
              )}
              <div className="editor-buttons">
                <Button
                  type="button"
                  variant="outline"
                  className="secondary"
                  disabled={busy}
                  onClick={() => setDraft(null)}
                >
                  Cancelar
                </Button>
                <Button className="primary" disabled={busy}>
                  {busy ? <LoaderCircle className="spin" /> : <Check />}
                  Salvar alterações
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
      <Dialog
        open={iconFor !== null}
        onOpenChange={(open) => {
          if (!open && !saveSubjectMutation.isPending) setIconFor(null);
        }}
      >
        <DialogContent className="editor icon-dialog">
          <DialogTitle>Ícone de “{iconFor}”</DialogTitle>
          <DialogDescription>
            Escolha um ícone da biblioteca ou envie uma imagem sua para personalizar este assunto.
          </DialogDescription>
          {iconFor !== null && (
            <>
              <div className="icon-grid">
                {Object.entries(ICON_LIBRARY).map(([key, { label, Icon }]) => (
                  <button
                    key={key}
                    type="button"
                    title={label}
                    aria-label={label}
                    className={iconOf(iconFor) === "lucide:" + key ? "icon-pick on" : "icon-pick"}
                    disabled={saveSubjectMutation.isPending}
                    onClick={() =>
                      saveSubjectMutation.mutate({ data: { name: iconFor, icon: "lucide:" + key } })
                    }
                  >
                    <Icon size={20} />
                  </button>
                ))}
              </div>
              {formError && (
                <p className="error" role="alert">
                  {formError}
                </p>
              )}
              <div className="editor-buttons icon-buttons">
                <label className="chip">
                  <ImagePlus size={13} /> Enviar imagem
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      e.target.value = "";
                      if (!f) return;
                      setFormError("");
                      imageToIconUrl(f)
                        .then((icon) =>
                          saveSubjectMutation.mutate({ data: { name: iconFor, icon } }),
                        )
                        .catch((err) => setFormError((err as Error).message));
                    }}
                  />
                </label>
                <button
                  type="button"
                  className="chip"
                  disabled={saveSubjectMutation.isPending}
                  onClick={() => saveSubjectMutation.mutate({ data: { name: iconFor, icon: null } })}
                >
                  Voltar ao padrão
                </button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      <Dialog
        open={!!toDelete}
        onOpenChange={(open) => {
          if (!open && !busy) setToDelete(null);
        }}
      >
        <DialogContent className="editor delete-dialog">
          <DialogTitle>Excluir este link?</DialogTitle>
          <DialogDescription>
            O cartão “{toDelete?.title}” e suas anotações serão removidos da sua
            biblioteca. Essa ação não pode ser desfeita.
          </DialogDescription>
          {formError && (
            <p className="error" role="alert">
              {formError}
            </p>
          )}
          <div className="editor-buttons">
            <Button
              variant="outline"
              className="secondary"
              disabled={busy}
              onClick={() => setToDelete(null)}
            >
              Cancelar
            </Button>
            <Button className="danger" disabled={busy} onClick={() => void remove()}>
              {busy ? <LoaderCircle className="spin" /> : <Trash2 />}
              Excluir link
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
