/**
 * Porta em JS puro de src/lib/container-signature.ts — mesmo algoritmo,
 * duplicado porque o extractor não tem build de TypeScript nem dependências
 * (ver comentário no topo de server.js). Qualquer mudança na régua de
 * detecção de container deve ser feita nos dois arquivos.
 */
import fs from "node:fs";

/** @typedef {"mp4"|"mkv"|"webm"|"mpegts"|"desconhecido"} ContainerKind */

/** Lê os primeiros `length` bytes de um arquivo, sem carregar o resto em memória. */
export function readHeadSync(filePath, length = 4096) {
  const fd = fs.openSync(filePath, "r");
  try {
    const buffer = Buffer.alloc(length);
    const bytesRead = fs.readSync(fd, buffer, 0, length, 0);
    return buffer.subarray(0, bytesRead);
  } finally {
    fs.closeSync(fd);
  }
}

/**
 * @param {Uint8Array|Buffer} bytes
 * @returns {ContainerKind}
 */
export function sniffContainer(bytes) {
  if (isMp4(bytes)) return "mp4";
  if (isEbml(bytes)) return isWebm(bytes) ? "webm" : "mkv";
  if (isMpegTs(bytes)) return "mpegts";
  return "desconhecido";
}

function isMp4(bytes) {
  if (bytes.length < 8) return false;
  return bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70;
}

function isEbml(bytes) {
  return (
    bytes.length >= 4 &&
    bytes[0] === 0x1a &&
    bytes[1] === 0x45 &&
    bytes[2] === 0xdf &&
    bytes[3] === 0xa3
  );
}

function isWebm(bytes) {
  const head = bytes.subarray(0, Math.min(bytes.length, 512));
  let text = "";
  for (const byte of head) text += String.fromCharCode(byte);
  return text.includes("webm");
}

function isMpegTs(bytes) {
  const packetSize = 188;
  const packetsToCheck = 3;
  if (bytes.length < packetSize * packetsToCheck) return false;
  for (let offset = 0; offset < packetSize * packetsToCheck; offset += packetSize) {
    if (bytes[offset] !== 0x47) return false;
  }
  return true;
}
