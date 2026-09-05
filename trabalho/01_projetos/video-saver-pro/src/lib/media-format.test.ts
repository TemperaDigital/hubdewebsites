import { describe, expect, it } from "vitest";
import {
  detectPlatform,
  formatBytes,
  formatDuration,
  isSupportedUrl,
  sanitizeFilename,
} from "./media-format";

describe("detectPlatform", () => {
  it("reconhece YouTube em suas variações de domínio", () => {
    expect(detectPlatform("https://www.youtube.com/watch?v=abc")).toBe("YouTube");
    expect(detectPlatform("https://youtu.be/abc")).toBe("YouTube");
  });

  it("retorna o hostname quando a plataforma não é conhecida", () => {
    expect(detectPlatform("https://exemplo.com.br/video")).toBe("exemplo.com.br");
  });
});

describe("isSupportedUrl", () => {
  it("aceita apenas http/https com hostname válido", () => {
    expect(isSupportedUrl("https://youtube.com/watch?v=1")).toBe(true);
    expect(isSupportedUrl("ftp://youtube.com/watch?v=1")).toBe(false);
    expect(isSupportedUrl("não é url")).toBe(false);
  });
});

describe("sanitizeFilename", () => {
  it("remove caracteres inválidos e limita o tamanho", () => {
    expect(sanitizeFilename('vídeo: "teste" <especial>')).toBe("vídeo teste especial");
  });

  it("usa um nome padrão quando o resultado fica vazio", () => {
    expect(sanitizeFilename("///???")).toBe("video");
  });
});

describe("formatBytes", () => {
  it("formata em KB/MB/GB com vírgula decimal", () => {
    expect(formatBytes(500)).toBe("500 B");
    expect(formatBytes(1024 * 1024 * 2.5)).toBe("2,5 MB");
  });
});

describe("formatDuration", () => {
  it("formata segundos em mm:ss ou h:mm:ss", () => {
    expect(formatDuration(65)).toBe("1:05");
    expect(formatDuration(3665)).toBe("1:01:05");
  });
});
