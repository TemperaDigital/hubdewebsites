/**
 * Montagem dos argumentos do yt-dlp para o endpoint /fetch — extraído de
 * handleFetch (server.js) para ser testável sem servidor HTTP nem rede.
 */

/** Verdadeiro quando o seletor de formato une trilhas separadas (ex.: "137+140"). */
export function requiresMerge(format) {
  return format.includes("+");
}

/**
 * @param {object} options
 * @param {string[]} options.baseArgs - flags comuns (--no-playlist, --cookies etc.).
 * @param {string} options.format - seletor de formato aceito pelo yt-dlp.
 * @param {string} options.ext - extensão pedida pelo cliente ("mp4", "mkv"...).
 * @param {string} options.output - alvo de saída do yt-dlp: "-" (stdout) ou um caminho de arquivo.
 * @param {string} options.url
 * @returns {string[]} argv completo, pronto para spawn(YTDLP, argv).
 */
export function buildFetchArgs({ baseArgs, format, ext, output, url }) {
  const args = [...baseArgs, "-f", format, "-o", output];
  if (requiresMerge(format)) {
    args.push("--merge-output-format", ext === "mp4" ? "mp4" : "mkv");
  }
  args.push(url);
  return args;
}
