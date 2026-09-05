import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getChatHistory, sendChatMessage } from "@/lib/chat.functions";
import { importStatement } from "@/lib/statements.functions";
import { Paperclip, Send, Sparkles } from "lucide-react";

async function extractFileText(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  if (name.endsWith(".csv") || file.type.startsWith("text/")) {
    return await file.text();
  }
  if (name.endsWith(".pdf") || file.type === "application/pdf") {
    const pdfjs: any = await import("pdfjs-dist");
    // Use bundled worker via Vite ?url import
    const workerUrl = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
    pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
    const buf = await file.arrayBuffer();
    const doc = await pdfjs.getDocument({ data: buf }).promise;
    let out = "";
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      out += content.items.map((it: any) => it.str).join(" ") + "\n";
    }
    return out;
  }
  throw new Error("Formato não suportado. Envie PDF ou CSV.");
}

export const Route = createFileRoute("/_app/chat")({
  component: ChatPage,
});

const QUICK = [
  "Registrar um gasto",
  "Como estão minhas metas?",
  "Resumo do mês",
  "Dica para economizar",
];

function ChatPage() {
  const qc = useQueryClient();
  const fetchHistory = useServerFn(getChatHistory);
  const sendMsg = useServerFn(sendChatMessage);
  const importStmt = useServerFn(importStatement);
  const [input, setInput] = useState("");
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: messages = [] } = useQuery({
    queryKey: ["chat-history"],
    queryFn: () => fetchHistory(),
  });

  const mutation = useMutation({
    mutationFn: (message: string) => sendMsg({ data: { message } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["chat-history"] }),
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      setUploadStatus(`Lendo ${file.name}...`);
      const text = await extractFileText(file);
      setUploadStatus(`Analisando transações com IA...`);
      return importStmt({ data: { text, source: file.name } });
    },
    onSuccess: (r) => {
      setUploadStatus(`✓ ${r.inserted} transações importadas`);
      qc.invalidateQueries({ queryKey: ["chat-history"] });
      setTimeout(() => setUploadStatus(null), 4000);
    },
    onError: (e: any) => {
      setUploadStatus(`Erro: ${e.message ?? "falha ao importar"}`);
      setTimeout(() => setUploadStatus(null), 5000);
    },
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, mutation.isPending, uploadMutation.isPending]);

  function submit(text: string) {
    const t = text.trim();
    if (!t || mutation.isPending) return;
    setInput("");
    mutation.mutate(t);
  }

  function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    uploadMutation.mutate(f);
  }


  const empty = messages.length === 0 && !mutation.isPending;

  return (
    <div className="mx-auto flex h-screen max-w-2xl flex-col px-4">
      <header className="flex items-center gap-3 py-5">
        <div className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground font-display text-xl">
          f
        </div>
        <div>
          <div className="font-display text-xl leading-none">Fin</div>
          <div className="text-xs text-muted-foreground">Seu agente financeiro</div>
        </div>
        <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs text-secondary-foreground">
          <Sparkles className="h-3 w-3" /> online
        </span>
      </header>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto pb-4">
        {empty && (
          <div className="rounded-3xl border border-border bg-surface p-6 text-sm shadow-soft">
            <p className="font-display text-2xl">Oi! Eu sou o Fin 👋</p>
            <p className="mt-2 text-muted-foreground">
              Me conta algo como <em>"gastei 25 no Uber"</em> ou <em>"recebi 1500 de
              freela"</em>. Eu registro, classifico e te ajudo a manter o controle.
            </p>
          </div>
        )}
        {messages.map((m) => (
          <Bubble key={m.id} who={m.role as "user" | "assistant"} text={m.content} />
        ))}
        {mutation.isPending && <Bubble who="assistant" text="..." pending />}
        {uploadMutation.isPending && (
          <Bubble who="assistant" text={uploadStatus ?? "Processando arquivo..."} pending />
        )}
      </div>

      <div className="space-y-2 pb-24">
        {uploadStatus && !uploadMutation.isPending && (
          <div className="rounded-full bg-secondary px-3 py-1.5 text-center text-xs text-secondary-foreground">
            {uploadStatus}
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          {QUICK.map((q) => (
            <button
              key={q}
              onClick={() => submit(q)}
              disabled={mutation.isPending}
              className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-foreground hover:bg-secondary disabled:opacity-50"
            >
              {q}
            </button>
          ))}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadMutation.isPending}
            className="inline-flex items-center gap-1 rounded-full border border-dashed border-primary/40 bg-primary/5 px-3 py-1.5 text-xs text-primary hover:bg-primary/10 disabled:opacity-50"
          >
            <Paperclip className="h-3 w-3" /> Importar extrato (PDF/CSV)
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.csv,application/pdf,text/csv"
          onChange={onPickFile}
          className="hidden"
        />
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit(input);
          }}
          className="flex items-end gap-2 rounded-2xl border border-border bg-surface p-2 shadow-soft"
        >
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadMutation.isPending}
            className="grid h-10 w-10 place-items-center rounded-xl text-muted-foreground hover:bg-secondary disabled:opacity-50"
            title="Anexar extrato (PDF ou CSV)"
          >
            <Paperclip className="h-4 w-4" />
          </button>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit(input);
              }
            }}
            rows={1}
            placeholder="Conte ao Fin sobre seus gastos..."
            className="max-h-32 flex-1 resize-none bg-transparent px-3 py-2 text-sm outline-none"
          />
          <button
            type="submit"
            disabled={mutation.isPending || !input.trim()}
            className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

function Bubble({
  who,
  text,
  pending,
}: {
  who: "user" | "assistant";
  text: string;
  pending?: boolean;
}) {
  return (
    <div className={who === "user" ? "flex justify-end" : "flex justify-start"}>
      <div
        className={
          "max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm shadow-soft " +
          (who === "user"
            ? "bg-primary text-primary-foreground rounded-br-sm"
            : "bg-surface text-foreground rounded-bl-sm border border-border")
        }
      >
        {pending ? (
          <span className="inline-flex gap-1">
            <Dot /> <Dot d={0.15} /> <Dot d={0.3} />
          </span>
        ) : (
          text
        )}
      </div>
    </div>
  );
}

function Dot({ d = 0 }: { d?: number }) {
  return (
    <span
      className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-current"
      style={{ animationDelay: `${d}s` }}
    />
  );
}
