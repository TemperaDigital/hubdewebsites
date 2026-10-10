import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  BookMarked,
  Eraser,
  Highlighter,
  Italic,
  List,
  ListOrdered,
  Palette,
  Strikethrough,
  Type,
  Underline,
} from "lucide-react";
import { sameUrl, type Bookmark } from "@/lib/link-utils";
import {
  escapeAttr,
  escapeText,
  notesToHtml,
  packNotes,
  sanitizeHtml,
  type ResolveLink,
} from "@/lib/rich-notes";

const fold = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

const TEXT_COLORS = ["#202b42", "#c62828", "#e65100", "#9a6700", "#2e7d32", "#1565c0", "#6a1b9a", "#6b7890"];
const MARK_COLORS = ["#fff59d", "#ffcc80", "#a5d6a7", "#90caf9", "#f8bbd0", "#e1bee7", "#e0e0e0"];
const SIZES: [string, string][] = [
  ["Pequena", "2"],
  ["Normal", "3"],
  ["Grande", "5"],
  ["Enorme", "6"],
];

export function useResolveLink(links: Bookmark[]): ResolveLink {
  return useMemo(
    () => (url: string) => {
      const hit = links.find((l) => sameUrl(l.url, url));
      return hit ? { id: hit.id, title: hit.title } : null;
    },
    [links],
  );
}

function linkHtml(l: Bookmark) {
  return `<a href="${escapeAttr(l.url)}" data-lk="${l.id}">${escapeText(l.title)}</a>`;
}

type Panel = null | "size" | "color" | "mark" | "link";
type Mention = { query: string; node: Text; start: number; end: number };

type Props = {
  value: string;
  onChange: (packed: string) => void;
  links: Bookmark[];
  currentId: string | undefined;
  theme: string;
};

export function RichNotes({ value, onChange, links, currentId, theme }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const saved = useRef<Range | null>(null);
  const [panel, setPanel] = useState<Panel>(null);
  const [search, setSearch] = useState("");
  const [mention, setMention] = useState<Mention | null>(null);
  const [active, setActive] = useState(0);
  const resolve = useResolveLink(links);
  const resolveRef = useRef(resolve);
  resolveRef.current = resolve;

  const others = useMemo(() => links.filter((l) => l.id !== currentId), [links, currentId]);

  useEffect(() => {
    if (ref.current) ref.current.innerHTML = notesToHtml(value, { autolink: true, resolve });
    // só na abertura do editor
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onSel = () => {
      const sel = window.getSelection();
      if (sel && sel.rangeCount && ref.current?.contains(sel.anchorNode))
        saved.current = sel.getRangeAt(0).cloneRange();
    };
    document.addEventListener("selectionchange", onSel);
    return () => document.removeEventListener("selectionchange", onSel);
  }, []);

  const emit = () => {
    const el = ref.current;
    if (!el) return;
    if (!el.textContent && !el.querySelector("a,li")) el.innerHTML = "";
    onChange(packNotes(el.innerHTML));
  };

  const restore = () => {
    const el = ref.current;
    if (!el) return;
    el.focus();
    const sel = window.getSelection();
    if (saved.current && sel) {
      sel.removeAllRanges();
      sel.addRange(saved.current);
    }
  };

  const exec = (cmd: string, arg?: string) => {
    restore();
    document.execCommand("styleWithCSS", false, "true");
    document.execCommand(cmd, false, arg);
    emit();
  };

  const insertHtml = (html: string) => {
    restore();
    document.execCommand("insertHTML", false, html);
    emit();
  };

  const toggle = (p: Exclude<Panel, null>) => {
    setPanel((cur) => (cur === p ? null : p));
    setSearch("");
  };

  const mark = (c: string) => {
    restore();
    document.execCommand("styleWithCSS", false, "true");
    if (!document.execCommand("hiliteColor", false, c)) document.execCommand("backColor", false, c);
    emit();
  };

  const results = (q: string) => {
    const f = fold(q.trim());
    const list = f
      ? others.filter((l) =>
          fold([l.title, l.subject, l.theme, l.url, l.tags.join(" ")].join(" ")).includes(f),
        )
      : [...others].sort(
          (a, b) => Number(b.theme === theme) - Number(a.theme === theme),
        );
    return list.slice(0, 8);
  };

  const mentionResults = mention ? results(mention.query) : [];

  const pickMention = (l: Bookmark) => {
    if (!mention) return;
    const sel = window.getSelection();
    const r = document.createRange();
    r.setStart(mention.node, mention.start);
    r.setEnd(mention.node, mention.end);
    sel?.removeAllRanges();
    sel?.addRange(r);
    setMention(null);
    document.execCommand("insertHTML", false, linkHtml(l) + "&nbsp;");
    emit();
  };

  const themes = useMemo(() => {
    const map = new Map<string, number>();
    for (const l of others) map.set(l.theme, (map.get(l.theme) ?? 0) + 1);
    return Array.from(map.entries()).sort(
      (a, b) => Number(b[0] === theme) - Number(a[0] === theme) || a[0].localeCompare(b[0], "pt-BR"),
    );
  }, [others, theme]);

  const insertFamily = (t: string) => {
    const items = others
      .filter((l) => l.theme === t)
      .sort((a, b) => a.title.localeCompare(b.title, "pt-BR"));
    if (!items.length) return;
    insertHtml(
      `<div><b>${escapeText(t)}</b></div><ul>${items
        .map((l) => `<li>${linkHtml(l)}</li>`)
        .join("")}</ul><div><br></div>`,
    );
    setPanel(null);
  };

  const tryAutolink = () => {
    const sel = window.getSelection();
    const node = sel?.anchorNode;
    if (!sel || !sel.isCollapsed || !node || node.nodeType !== 3) return;
    if ((node.parentElement as HTMLElement).closest("a")) return;
    const text = (node.textContent ?? "").slice(0, sel.anchorOffset);
    const m = /(?:https?:\/\/|www\.)[^\s<>"']+$/i.exec(text);
    if (!m) return;
    const raw = m[0].replace(/[.,;:!?)\]]+$/, "");
    const stripped = m[0].length - raw.length;
    let href: string;
    try {
      const u = new URL(/^www\./i.test(raw) ? "https://" + raw : raw);
      if (!/^https?:$/.test(u.protocol) || !u.hostname.includes(".")) return;
      href = u.href;
    } catch {
      return;
    }
    const hit = resolveRef.current(href);
    const range = document.createRange();
    range.setStart(node, m.index);
    range.setEnd(node, m.index + raw.length);
    range.deleteContents();
    const a = document.createElement("a");
    a.href = href;
    if (hit) a.setAttribute("data-lk", hit.id);
    a.textContent = hit ? hit.title : raw;
    range.insertNode(a);
    const after = document.createRange();
    const tail = a.nextSibling;
    if (stripped && tail && tail.nodeType === 3) after.setStart(tail, stripped);
    else after.setStartAfter(a);
    after.collapse(true);
    sel.removeAllRanges();
    sel.addRange(after);
  };

  const detectMention = () => {
    const sel = window.getSelection();
    const node = sel?.anchorNode;
    if (!sel || !sel.isCollapsed || !node || node.nodeType !== 3) return setMention(null);
    const before = (node.textContent ?? "").slice(0, sel.anchorOffset);
    const m = /(?:^|\s)@([^\s@]{0,40})$/.exec(before);
    if (!m) return setMention(null);
    const start = before.length - m[1]!.length - 1;
    setMention({ query: m[1]!, node: node as Text, start, end: before.length });
    setActive(0);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (mention && mentionResults.length) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const n = mentionResults.length;
        setActive((i) => (i + (e.key === "ArrowDown" ? 1 : n - 1)) % n);
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        pickMention(mentionResults[Math.min(active, mentionResults.length - 1)]!);
        return;
      }
    }
    if (mention && e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      setMention(null);
      return;
    }
    if (e.key === " " || e.key === "Enter") tryAutolink();
  };

  const btn = (
    label: string,
    icon: React.ReactNode,
    onClick: () => void,
    pressed?: boolean,
  ) => (
    <button
      type="button"
      className={"rn-btn" + (pressed ? " on" : "")}
      title={label}
      aria-label={label}
      aria-pressed={pressed}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
    >
      {icon}
    </button>
  );

  return (
    <div className="rn">
      <div className="rn-bar" role="toolbar" aria-label="Formatação da anotação">
        {btn("Negrito (Ctrl+B)", <Bold size={15} />, () => exec("bold"))}
        {btn("Itálico (Ctrl+I)", <Italic size={15} />, () => exec("italic"))}
        {btn("Sublinhado (Ctrl+U)", <Underline size={15} />, () => exec("underline"))}
        {btn("Tachado", <Strikethrough size={15} />, () => exec("strikeThrough"))}
        <span className="rn-sep" />
        {btn("Tamanho da letra", <Type size={15} />, () => toggle("size"), panel === "size")}
        {btn("Cor da letra", <Palette size={15} />, () => toggle("color"), panel === "color")}
        {btn("Marca-texto", <Highlighter size={15} />, () => toggle("mark"), panel === "mark")}
        <span className="rn-sep" />
        {btn("Alinhar à esquerda", <AlignLeft size={15} />, () => exec("justifyLeft"))}
        {btn("Centralizar", <AlignCenter size={15} />, () => exec("justifyCenter"))}
        {btn("Alinhar à direita", <AlignRight size={15} />, () => exec("justifyRight"))}
        {btn("Justificar", <AlignJustify size={15} />, () => exec("justifyFull"))}
        <span className="rn-sep" />
        {btn("Lista", <List size={15} />, () => exec("insertUnorderedList"))}
        {btn("Lista numerada", <ListOrdered size={15} />, () => exec("insertOrderedList"))}
        {btn("Limpar formatação", <Eraser size={15} />, () => exec("removeFormat"))}
        <span className="rn-sep" />
        <button
          type="button"
          className={"rn-btn rn-wide" + (panel === "link" ? " on" : "")}
          title="Inserir link de um site do acervo (ou digite @)"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => toggle("link")}
        >
          <BookMarked size={15} />
          <span>Acervo</span>
        </button>
      </div>

      {panel === "size" && (
        <div className="rn-pop">
          {SIZES.map(([label, level]) => (
            <button
              key={level}
              type="button"
              className="rn-chip"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                exec("fontSize", level);
                setPanel(null);
              }}
            >
              {label}
            </button>
          ))}
        </div>
      )}
      {(panel === "color" || panel === "mark") && (
        <div className="rn-pop">
          {(panel === "color" ? TEXT_COLORS : MARK_COLORS).map((c) => (
            <button
              key={c}
              type="button"
              className="rn-swatch"
              style={{ background: c }}
              aria-label={"Cor " + c}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                if (panel === "color") exec("foreColor", c);
                else mark(c);
                setPanel(null);
              }}
            />
          ))}
          {panel === "mark" && (
            <button
              type="button"
              className="rn-chip"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                mark("transparent");
                setPanel(null);
              }}
            >
              Sem marca
            </button>
          )}
          <label className="rn-chip rn-custom">
            Outra cor
            <input
              type="color"
              aria-label="Escolher outra cor"
              onChange={(e) => (panel === "color" ? exec("foreColor", e.target.value) : mark(e.target.value))}
            />
          </label>
        </div>
      )}
      {panel === "link" && (
        <div className="rn-pop rn-link">
          <input
            autoFocus
            className="rn-search"
            placeholder="Buscar site do acervo por título, assunto ou tema..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <ul className="rn-list">
            {results(search).map((l) => (
              <li key={l.id}>
                <button
                  type="button"
                  onClick={() => {
                    insertHtml(linkHtml(l) + "&nbsp;");
                    setPanel(null);
                  }}
                >
                  <strong>{l.title}</strong>
                  <small>
                    {l.subject} › {l.theme}
                  </small>
                </button>
              </li>
            ))}
            {!results(search).length && <li className="rn-empty">Nenhum site encontrado.</li>}
          </ul>
          {themes.length > 0 && (
            <>
              <p className="rn-hint">Ou insira a família inteira de um tema, como lista de links:</p>
              <div className="rn-families">
                {themes.map(([t, n]) => (
                  <button
                    key={t}
                    type="button"
                    className={"rn-chip" + (t === theme ? " here" : "")}
                    onClick={() => insertFamily(t)}
                  >
                    {t} <small>({n})</small>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      <div
        ref={ref}
        className="rn-edit"
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        aria-label="Anotações"
        data-placeholder="O que este site tem de útil? Use #hashtags, cole endereços (viram links) ou digite @ para citar um site do acervo."
        onInput={() => {
          emit();
          detectMention();
        }}
        onKeyDown={onKeyDown}
        onBlur={() => setTimeout(() => setMention(null), 150)}
        onClick={(e) => {
          const a = (e.target as HTMLElement).closest("a");
          if (a && (e.ctrlKey || e.metaKey)) window.open(a.href, "_blank", "noopener,noreferrer");
        }}
        onPaste={(e) => {
          const cd = e.clipboardData;
          if (Array.from(cd.items).some((i) => i.type.startsWith("image/"))) return;
          const html = cd.getData("text/html");
          const text = cd.getData("text/plain");
          if (!html && !text) return;
          e.preventDefault();
          const opts = { autolink: true, resolve: resolveRef.current };
          document.execCommand(
            "insertHTML",
            false,
            html ? sanitizeHtml(html, { ...opts, keepStyles: false }) : notesToHtml(text, opts),
          );
          emit();
        }}
      />
      {mention && mentionResults.length > 0 && (
        <ul className="rn-list rn-mention" role="listbox" aria-label="Sites do acervo">
          {mentionResults.map((l, i) => (
            <li key={l.id} role="option" aria-selected={i === active}>
              <button
                type="button"
                className={i === active ? "on" : ""}
                onMouseDown={(e) => {
                  e.preventDefault();
                  pickMention(l);
                }}
              >
                <strong>{l.title}</strong>
                <small>
                  {l.subject} › {l.theme}
                </small>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
