/**
 * Anotações com formatação. Texto puro continua valendo (notas antigas); a nota
 * formatada é HTML sanitizado com o prefixo RICH_MARK. Sem DOM: roda igual no
 * servidor e no navegador.
 */

export const RICH_MARK = "<!--rich-->";

export type ResolveLink = (url: string) => { id: string; title: string } | null;

type Opts = {
  autolink?: boolean;
  resolve?: ResolveLink | undefined;
  /** false = descarta cores/tamanhos/alinhamento (usado ao colar de outro site). */
  keepStyles?: boolean;
};

const INK = "#202b42";
const DROP_CONTENT = new Set([
  "script", "style", "iframe", "object", "embed", "noscript", "template",
  "svg", "math", "textarea", "title", "head",
]);
const KEEP = new Set([
  "b", "strong", "i", "em", "u", "s", "strike", "del", "a", "br", "p", "div",
  "span", "ul", "ol", "li", "font",
]);
const SIZES = new Set(["x-small", "small", "large", "x-large", "xx-large", "xxx-large"]);
const FONT_SIZE_BY_LEVEL: Record<string, string> = {
  "1": "x-small", "2": "small", "3": "medium", "4": "large", "5": "x-large",
  "6": "xx-large", "7": "xxx-large",
};

export function isRich(notes: string) {
  return notes.startsWith(RICH_MARK);
}

const ENT: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ",
};
export function decodeEntities(s: string) {
  return s.replace(/&(?:#(\d+)|#x([\da-f]+)|([a-z]+));/gi, (m, d, h, n) => {
    if (d || h) {
      const cp = d ? parseInt(d, 10) : parseInt(h, 16);
      return cp > 0 && cp < 0x110000 ? String.fromCodePoint(cp) : "";
    }
    return ENT[String(n).toLowerCase()] ?? m;
  });
}

export function escapeText(s: string) {
  return s
    .replace(/&(?!(?:[a-zA-Z]+|#\d+|#x[\da-fA-F]+);)/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function escapeAttr(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function cleanColor(v: string): string | null {
  const c = v.trim().toLowerCase();
  if (/^#(?:[\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})$/.test(c)) return c;
  if (/^rgba?\(\s*[\d.]+%?\s*(?:,\s*[\d.]+%?\s*){2,3}\)$/.test(c)) return c;
  if (/^[a-z]{3,20}$/.test(c) && c !== "inherit" && c !== "initial") return c;
  return null;
}

function isInk(c: string) {
  return c === INK || c === "rgb(32, 43, 66)" || c === "rgb(32,43,66)";
}

function cleanStyle(style: string, extra: string[] = []): string {
  const out: string[] = [...extra];
  for (const part of style.split(";")) {
    const i = part.indexOf(":");
    if (i < 0) continue;
    const prop = part.slice(0, i).trim().toLowerCase();
    const val = part.slice(i + 1).trim();
    if (prop === "color") {
      const c = cleanColor(val);
      if (c && !isInk(c)) out.push(`color:${c}`);
    } else if (prop === "background-color") {
      const c = cleanColor(val);
      if (c && c !== "transparent" && c !== "white" && c !== "#fff" && c !== "#ffffff")
        out.push(`background-color:${c}`);
    } else if (prop === "font-size") {
      const k = val.toLowerCase().replace("-webkit-", "");
      if (SIZES.has(k)) out.push(`font-size:${k}`);
    } else if (prop === "text-align") {
      const k = val.toLowerCase();
      if (["center", "right", "justify"].includes(k)) out.push(`text-align:${k}`);
    } else if (prop === "font-weight") {
      if (/^(bold|[6-9]00)$/i.test(val)) out.push("font-weight:bold");
    } else if (prop === "font-style") {
      if (/^italic$/i.test(val)) out.push("font-style:italic");
    } else if (prop === "text-decoration" || prop === "text-decoration-line") {
      const lower = val.toLowerCase();
      const d = [
        lower.includes("underline") ? "underline" : "",
        lower.includes("line-through") ? "line-through" : "",
      ].filter(Boolean);
      if (d.length) out.push(`text-decoration:${d.join(" ")}`);
    }
  }
  return out.join(";");
}

function parseAttrs(src: string) {
  const attrs: Record<string, string> = {};
  const re = /([a-zA-Z_:][\w:.-]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src))) {
    const name = m[1]!.toLowerCase();
    if (!(name in attrs)) attrs[name] = decodeEntities(m[2] ?? m[3] ?? m[4] ?? "");
  }
  return attrs;
}

function safeHref(raw: string): string | null {
  const v = raw.trim();
  if (!v || v.length > 2000 || !/^https?:\/\//i.test(v)) return null;
  try {
    const u = new URL(v);
    return u.hostname.includes(".") ? u.href : null;
  } catch {
    return null;
  }
}

const URL_RE = /(?:https?:\/\/|www\.)[^\s<>"']+/gi;
const TRAIL_RE = /[.,;:!?)\]]+$/;

function openAnchor(href: string, id?: string) {
  const lk = id && /^[0-9a-f-]{36}$/i.test(id) ? ` data-lk="${id.toLowerCase()}"` : "";
  return `<a href="${escapeAttr(href)}"${lk} target="_blank" rel="noopener noreferrer">`;
}

function anchor(href: string, label: string, id?: string) {
  return openAnchor(href, id) + label + "</a>";
}

function textWithLinks(raw: string, opts: Opts): string {
  if (!opts.autolink) return escapeText(raw);
  let out = "";
  let last = 0;
  URL_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = URL_RE.exec(raw))) {
    const full = m[0];
    const url = full.replace(TRAIL_RE, "");
    const href = safeHref(/^www\./i.test(url) ? "https://" + url : url);
    if (!href) continue;
    out += escapeText(raw.slice(last, m.index));
    const hit = opts.resolve?.(href) ?? null;
    out += hit ? anchor(href, escapeText(hit.title), hit.id) : anchor(href, escapeText(url));
    last = m.index + url.length;
    URL_RE.lastIndex = last;
  }
  return out + escapeText(raw.slice(last));
}

const TOKEN =
  /<!--[\s\S]*?-->|<\/([a-zA-Z][a-zA-Z0-9]*)\s*>|<([a-zA-Z][a-zA-Z0-9]*)((?:"[^"]*"|'[^']*'|[^'">])*)>|<|[^<]+/g;

type Open = { name: string; emit: boolean };

export function sanitizeHtml(html: string, opts: Opts = {}): string {
  const keepStyles = opts.keepStyles !== false;
  const stack: Open[] = [];
  let out = "";
  let inAnchor = 0;
  TOKEN.lastIndex = 0;
  let m: RegExpExecArray | null;

  const pop = () => {
    const e = stack.pop()!;
    if (e.emit) out += `</${e.name}>`;
    if (e.name === "a" && e.emit) inAnchor--;
  };
  const canon = (n: string) =>
    n === "font" ? "span" : n === "strike" || n === "del" ? "s" : n === "strong" ? "b" : n === "em" ? "i" : n;

  while ((m = TOKEN.exec(html))) {
    const tok = m[0];
    if (tok.startsWith("<!--")) continue;
    if (m[1]) {
      const name = canon(m[1].toLowerCase());
      let at = -1;
      for (let i = stack.length - 1; i >= 0; i--) if (stack[i]!.name === name) { at = i; break; }
      if (at < 0) continue;
      while (stack.length > at) pop();
      continue;
    }
    if (m[2]) {
      const raw = m[2].toLowerCase();
      if (DROP_CONTENT.has(raw)) {
        const end = new RegExp(`</${raw}\\s*>`, "gi");
        end.lastIndex = TOKEN.lastIndex;
        const hit = end.exec(html);
        TOKEN.lastIndex = hit ? hit.index + hit[0].length : html.length;
        continue;
      }
      if (!KEEP.has(raw)) continue;
      if (raw === "br") {
        out += "<br>";
        continue;
      }
      const attrs = parseAttrs(m[3] ?? "");
      const name = canon(raw);
      if (name === "a") {
        const href = safeHref(attrs["href"] ?? "");
        if (!href || inAnchor) {
          stack.push({ name: "a", emit: false });
          continue;
        }
        inAnchor++;
        stack.push({ name: "a", emit: true });
        out += openAnchor(href, attrs["data-lk"]);
        continue;
      }
      let style = "";
      if (keepStyles) {
        const extra: string[] = [];
        if (raw === "font") {
          const c = attrs["color"] ? cleanColor(attrs["color"]) : null;
          if (c && !isInk(c)) extra.push(`color:${c}`);
          const k = FONT_SIZE_BY_LEVEL[attrs["size"] ?? ""];
          if (k && k !== "medium") extra.push(`font-size:${k}`);
        }
        style = cleanStyle(attrs["style"] ?? "", extra);
      }
      if (name === "span" && !style) {
        stack.push({ name: "span", emit: false });
        continue;
      }
      stack.push({ name, emit: true });
      out += style ? `<${name} style="${escapeAttr(style)}">` : `<${name}>`;
      continue;
    }
    if (tok === "<") {
      out += "&lt;";
      continue;
    }
    out += inAnchor ? escapeText(tok) : textWithLinks(tok, opts);
  }
  while (stack.length) pop();
  return out;
}

export function notesToText(notes: string): string {
  if (!isRich(notes)) return notes;
  const body = notes.slice(RICH_MARK.length);
  return decodeEntities(
    body
      .replace(/<\/(?:p|div|li)>|<br\s*\/?>/gi, "\n")
      .replace(/<[^>]*>/g, ""),
  ).trim();
}

export function notesToHtml(notes: string, opts: Opts = {}): string {
  if (isRich(notes)) return sanitizeHtml(notes.slice(RICH_MARK.length), opts);
  if (!notes) return "";
  return sanitizeHtml(escapeAll(notes).replace(/\r?\n/g, "<br>"), {
    ...opts,
    autolink: opts.autolink ?? true,
  });
}

function escapeAll(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Sanitiza o HTML do editor e devolve o valor a gravar ("" se não houver conteúdo). */
export function packNotes(html: string, opts: Opts = {}): string {
  const clean = sanitizeHtml(html, opts);
  const hasContent = /<a[ >]|<li[ >]/.test(clean) || notesToText(RICH_MARK + clean).length > 0;
  return hasContent ? RICH_MARK + clean : "";
}

/** Usado no servidor: nota formatada é re-sanitizada; texto puro passa direto. */
export function sanitizeNotes(notes: string): string {
  return isRich(notes) ? packNotes(notes.slice(RICH_MARK.length)) : notes;
}

/** Ao salvar: transforma URLs soltas em links (reconhecendo os do acervo). */
export function finalizeNotes(notes: string, resolve?: ResolveLink): string {
  if (!notes) return "";
  return packNotes(notesToHtml(notes, { autolink: true, resolve }), {
    autolink: true,
    resolve,
  });
}
