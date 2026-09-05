export type ContainerKind = "mp4" | "mkv" | "webm" | "mpegts" | "desconhecido";

/**
 * Identifica o container real de um arquivo de mídia pelos bytes de
 * assinatura ("magic bytes"), ignorando extensão de nome e Content-Type
 * declarados — é a régua usada pelos critérios AC-001 e AC-004 da feature
 * corrigir-merge-video-audio para provar que o arquivo entregue é do
 * formato que ele anuncia ser.
 */
export function sniffContainer(bytes: Uint8Array): ContainerKind {
  if (isMp4(bytes)) return "mp4";
  if (isEbml(bytes)) return isWebm(bytes) ? "webm" : "mkv";
  if (isMpegTs(bytes)) return "mpegts";
  return "desconhecido";
}

/** Caixa "ftyp" no deslocamento 4, marca de todo arquivo ISO-BMFF (MP4). */
function isMp4(bytes: Uint8Array): boolean {
  if (bytes.length < 8) return false;
  return (
    bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70 // "ftyp"
  );
}

/** Cabeçalho EBML (0x1A45DFA3), comum a Matroska e WebM. */
function isEbml(bytes: Uint8Array): boolean {
  return (
    bytes.length >= 4 &&
    bytes[0] === 0x1a &&
    bytes[1] === 0x45 &&
    bytes[2] === 0xdf &&
    bytes[3] === 0xa3
  );
}

/** O DocType "webm" aparece em texto plano perto do início do cabeçalho EBML. */
function isWebm(bytes: Uint8Array): boolean {
  const head = bytes.subarray(0, Math.min(bytes.length, 512));
  let text = "";
  for (const byte of head) text += String.fromCharCode(byte);
  return text.includes("webm");
}

/** Sync byte 0x47 a cada 188 bytes — pacote de transporte MPEG-TS. */
function isMpegTs(bytes: Uint8Array): boolean {
  const packetSize = 188;
  const packetsToCheck = 3;
  if (bytes.length < packetSize * packetsToCheck) return false;
  for (let offset = 0; offset < packetSize * packetsToCheck; offset += packetSize) {
    if (bytes[offset] !== 0x47) return false;
  }
  return true;
}
