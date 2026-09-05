import { describe, expect, it } from "vitest";
import { sniffContainer } from "./container-signature";

function bytes(...values: number[]): Uint8Array {
  return new Uint8Array(values);
}

function ascii(text: string): number[] {
  return [...text].map((char) => char.charCodeAt(0));
}

describe("sniffContainer", () => {
  it("reconhece MP4 pelo 'ftyp' no deslocamento 4 @spec:AC-001", () => {
    const data = bytes(0x00, 0x00, 0x00, 0x18, ...ascii("ftypisom"), 0, 0, 0, 0);
    expect(sniffContainer(data)).toBe("mp4");
  });

  it("reconhece Matroska pelo cabeçalho EBML sem DocType webm", () => {
    const data = new Uint8Array(600);
    data.set([0x1a, 0x45, 0xdf, 0xa3]);
    data.set(ascii("matroska"), 40);
    expect(sniffContainer(data)).toBe("mkv");
  });

  it("reconhece WebM pelo cabeçalho EBML com DocType webm", () => {
    const data = new Uint8Array(600);
    data.set([0x1a, 0x45, 0xdf, 0xa3]);
    data.set(ascii("webm"), 40);
    expect(sniffContainer(data)).toBe("webm");
  });

  it("reconhece MPEG-TS pelo sync byte 0x47 a cada 188 bytes", () => {
    const data = new Uint8Array(188 * 4);
    for (let offset = 0; offset < data.length; offset += 188) data[offset] = 0x47;
    expect(sniffContainer(data)).toBe("mpegts");
  });

  it("não confunde bytes aleatórios com MPEG-TS mesmo que o primeiro byte seja 0x47 @spec:AC-004", () => {
    const data = new Uint8Array(188 * 4);
    data[0] = 0x47;
    data[188] = 0x00;
    expect(sniffContainer(data)).toBe("desconhecido");
  });

  it("devolve 'desconhecido' para bytes sem nenhuma assinatura reconhecida @spec:AC-004", () => {
    expect(sniffContainer(bytes(1, 2, 3, 4, 5, 6, 7, 8))).toBe("desconhecido");
  });

  it("não quebra com entrada vazia ou muito curta", () => {
    expect(sniffContainer(bytes())).toBe("desconhecido");
    expect(sniffContainer(bytes(0x47))).toBe("desconhecido");
  });
});
