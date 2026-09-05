import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readdirSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { buildFetchArgs, requiresMerge } from "./fetch-args.js";
import { sniffContainer, readHeadSync } from "./container-signature.js";

test("requiresMerge detecta seletor de formato com trilhas separadas", () => {
  assert.equal(requiresMerge("137+140"), true);
  assert.equal(requiresMerge("18"), false);
  assert.equal(requiresMerge("best"), false);
});

test("buildFetchArgs não adiciona --merge-output-format fora do caminho de merge", () => {
  const args = buildFetchArgs({
    baseArgs: ["--no-playlist", "--no-progress"],
    format: "18",
    ext: "mp4",
    output: "-",
    url: "https://example.com/v",
  });
  assert.deepEqual(args, [
    "--no-playlist",
    "--no-progress",
    "-f",
    "18",
    "-o",
    "-",
    "https://example.com/v",
  ]);
});

test("buildFetchArgs pede merge para mp4 quando o formato tem '+' e a extensão é mp4", () => {
  const args = buildFetchArgs({
    baseArgs: [],
    format: "137+140",
    ext: "mp4",
    output: "/tmp/saida.tmp",
    url: "https://example.com/v",
  });
  assert.deepEqual(args, [
    "-f",
    "137+140",
    "-o",
    "/tmp/saida.tmp",
    "--merge-output-format",
    "mp4",
    "https://example.com/v",
  ]);
});

test("buildFetchArgs pede merge para mkv quando a extensão não é mp4", () => {
  const args = buildFetchArgs({
    baseArgs: [],
    format: "137+140",
    ext: "webm",
    output: "-",
    url: "https://example.com/v",
  });
  assert.ok(args.includes("--merge-output-format"));
  assert.equal(args[args.indexOf("--merge-output-format") + 1], "mkv");
});

test("buildFetchArgs preserva a ordem: baseArgs, -f, -o, [--merge-output-format], url", () => {
  const args = buildFetchArgs({
    baseArgs: ["--no-playlist"],
    format: "137+140",
    ext: "mp4",
    output: "-",
    url: "https://example.com/v",
  });
  assert.equal(args[args.length - 1], "https://example.com/v");
});

/**
 * Teste de regressão sob demanda: prova, com um download real do YouTube,
 * que o merge vídeo+áudio agora entrega um MP4 de verdade (não MPEG-TS
 * disfarçado) — é a reprodução do defeito medido em
 * .spec/features/corrigir-merge-video-audio/spec.md ("Evidência medida").
 *
 * Só faz sentido dentro do container extractor (precisa do yt-dlp e do
 * ffmpeg reais da imagem) e só roda quando TEST_VIDEO_URL está definida —
 * por isso fica de fora da suíte padrão (vitest/onp-spec não cobrem
 * extractor/**, ver onpspec.config.json). Exemplo de uso:
 *
 *   docker compose exec extractor env \
 *     TEST_VIDEO_URL='https://www.youtube.com/watch?v=XXXXXXXXXXX' \
 *     TEST_FORMAT='137+140' \
 *     TEST_EXPECTED_HEIGHT='1080' \
 *     node --test fetch-args.test.js
 *
 * Ligado a @spec:AC-001 (container real bate com o prometido), @spec:AC-002
 * (faixas de vídeo e áudio presentes, duração > 0) e @spec:AC-003 (altura
 * entregue bate com a pedida, quando TEST_EXPECTED_HEIGHT é informada). Fora
 * do escopo do `vitest` do onp-spec-driven (testGlobs não cobrem
 * extractor/**) — por isso não some da suíte automática, mas também não
 * conta como prova pro `onp-spec audit`; a prova formal dessas ACs nesta
 * rodada veio da execução manual deste teste (ver relatório da feature).
 */
const videoUrl = process.env.TEST_VIDEO_URL;
const format = process.env.TEST_FORMAT || "137+140"; // 1080p (h264) + áudio (m4a)
const expectedHeight = process.env.TEST_EXPECTED_HEIGHT
  ? Number(process.env.TEST_EXPECTED_HEIGHT)
  : null;
const ytdlp = process.env.YTDLP_PATH || "yt-dlp";
const ffprobe = process.env.FFPROBE_PATH || "ffprobe";

test(
  "regressão: merge real do yt-dlp entrega MP4 de verdade, com vídeo+áudio e na altura pedida " +
    "@spec:AC-001 @spec:AC-002 @spec:AC-003",
  { skip: !videoUrl && "defina TEST_VIDEO_URL para rodar este teste sob demanda" },
  () => {
    const dir = mkdtempSync(path.join(tmpdir(), "fetch-args-it-"));
    // Sem extensão de propósito: com merge, o yt-dlp decide a extensão final
    // sozinho (--merge-output-format) e só ACRESCENTA a extensão quando o
    // nome dado não termina numa extensão de mídia reconhecida — "saida.tmp"
    // viraria "saida.tmp.mp4", não "saida.mp4". Por isso o arquivo final é
    // descoberto com readdirSync, igual a handleFetchMerged em server.js.
    const output = path.join(dir, "saida");
    try {
      const args = buildFetchArgs({
        baseArgs: ["--no-playlist", "--no-progress"],
        format,
        ext: "mp4",
        output,
        url: videoUrl,
      });
      const result = spawnSync(ytdlp, args, { encoding: "utf8", maxBuffer: 1024 * 1024 * 16 });
      assert.equal(result.status, 0, `yt-dlp falhou: ${result.stderr}`);

      const produced = readdirSync(dir);
      assert.equal(produced.length, 1, `esperava 1 arquivo em ${dir}, achei ${produced.length}`);
      const outputFile = path.join(dir, produced[0]);

      const stat = statSync(outputFile);
      assert.ok(stat.size > 0, "arquivo de saída ficou vazio");

      // AC-001: o container real bate com o prometido.
      const container = sniffContainer(readHeadSync(outputFile, 4096));
      assert.equal(
        container,
        "mp4",
        `container entregue foi '${container}', esperava 'mp4' (o bug original trocava para mpegts em silêncio, código de saída 0)`,
      );

      // AC-002 / AC-003: faixas de vídeo e áudio presentes, duração > 0, e
      // altura bate com a pedida (quando informada).
      const probeResult = spawnSync(
        ffprobe,
        ["-v", "quiet", "-print_format", "json", "-show_format", "-show_streams", outputFile],
        { encoding: "utf8", maxBuffer: 1024 * 1024 * 16 },
      );
      assert.equal(probeResult.status, 0, `ffprobe falhou: ${probeResult.stderr}`);
      const probe = JSON.parse(probeResult.stdout);
      const videoStream = probe.streams.find((s) => s.codec_type === "video");
      const audioStream = probe.streams.find((s) => s.codec_type === "audio");
      assert.ok(videoStream, "esperava uma faixa de vídeo no arquivo entregue");
      assert.ok(audioStream, "esperava uma faixa de áudio no arquivo entregue");
      assert.ok(Number(probe.format.duration) > 0, "duração inválida no arquivo entregue");
      if (expectedHeight) {
        assert.equal(
          videoStream.height,
          expectedHeight,
          `altura entregue (${videoStream.height}) diferente da pedida (${expectedHeight})`,
        );
      }
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  },
);
