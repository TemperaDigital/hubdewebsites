import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const CATEGORIES = [
  "alimentação",
  "transporte",
  "moradia",
  "lazer",
  "saúde",
  "educação",
  "compras",
  "assinaturas",
  "investimentos",
  "renda",
  "outros",
];

const Input = z.object({
  text: z.string().min(1).max(200000),
  source: z.string().max(80).optional(),
});

interface ParsedTx {
  description: string;
  amount: number; // valor da parcela
  category: string;
  type: "despesa" | "receita";
  occurred_at?: string; // YYYY-MM-DD (data de pagamento/competência da linha)
  // installment fields
  installment?: boolean;
  installment_number?: number;
  installments_total?: number;
  total_amount?: number;
  source_type?: "conta_corrente" | "cartao_credito" | "entrada";
}

function addMonths(date: Date, n: number): Date {
  const d = new Date(date);
  const day = d.getDate();
  d.setMonth(d.getMonth() + n);
  if (d.getDate() < day) d.setDate(0);
  return d;
}

function toIsoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export const importStatement = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => Input.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("AI gateway não configurado");

    const text = data.text.slice(0, 60000);
    const isCard = /cart[ãa]o|fatura|credito|crédito/i.test((data.source ?? "") + " " + text.slice(0, 500));

    const systemPrompt = `Você é um analisador de extratos bancários e faturas de cartão (pt-BR).
Receberá o TEXTO BRUTO de um extrato/fatura (PDF ou CSV). Extraia TODAS as transações reais.

REGRAS DE PARCELAMENTO (CRÍTICO):
- Detecte o padrão "X/Y" no descritivo (ex: "AMAZON 03/10", "MAGALU PARC 5/12") → é uma parcela.
- Para cada compra parcelada IDENTIFICADA, devolva APENAS UMA entrada com:
  installment=true, installment_number=X (parcela atual visível na fatura), installments_total=Y, amount=valor da parcela, total_amount=Y*amount.
- O sistema vai expandir automaticamente as parcelas faltantes (passadas e futuras) usando o mesmo grupo. NÃO duplique as parcelas que ainda virão.
- Se houver ambiguidade (ex: "PARC 3 MAGALU" sem o total), inclua a dúvida em "pending_clarifications".

FORMATO de saída (APENAS JSON válido):
{
  "transactions": [
    {
      "description": "...",
      "amount": <número positivo>,
      "category": "...",
      "type": "despesa" | "receita",
      "occurred_at": "YYYY-MM-DD",
      "installment": true | false,
      "installment_number": <int, se installment=true>,
      "installments_total": <int, se installment=true>,
      "total_amount": <número, se installment=true>,
      "source_type": "${isCard ? "cartao_credito" : "conta_corrente"}"
    }
  ],
  "summary": "resumo curto markdown com totais e principais categorias",
  "pending_clarifications": "perguntas curtas que você queira fazer ao usuário, ou string vazia"
}

OUTRAS REGRAS:
- amount sempre positivo. Sinal por "type".
- Ignore linhas de saldo, totais, pagamentos da própria fatura, juros descritivos sem valor.
- Em faturas de cartão, source_type sempre "cartao_credito"; cada compra é "despesa"; estornos/créditos são "receita".
- Categorias permitidas: ${CATEGORIES.join(", ")}.
- description curta e limpa (sem códigos longos), mas mantenha indicador X/Y quando houver.`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Fonte: ${data.source ?? "extrato"}\n\nTEXTO:\n${text}`,
          },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      const t = await res.text();
      throw new Error(`AI gateway erro: ${res.status} ${t}`);
    }

    const json = await res.json();
    const raw = json.choices?.[0]?.message?.content ?? "{}";
    let parsed: {
      transactions: ParsedTx[];
      summary: string;
      pending_clarifications?: string;
    } = {
      transactions: [],
      summary: "Não consegui interpretar o arquivo.",
    };
    try {
      parsed = JSON.parse(raw);
    } catch {
      // keep defaults
    }

    const rows: any[] = [];
    for (const t of parsed.transactions ?? []) {
      if (!t || typeof t.amount !== "number" || t.amount <= 0 || !t.description) continue;
      const category = CATEGORIES.includes(t.category) ? t.category : "outros";
      const type = t.type === "receita" ? "receita" : "despesa";
      const description = t.description.slice(0, 200);
      const sourceType: "conta_corrente" | "cartao_credito" | "entrada" =
        type === "receita"
          ? "entrada"
          : isCard || t.source_type === "cartao_credito"
            ? "cartao_credito"
            : "conta_corrente";

      const baseDate =
        t.occurred_at && /^\d{4}-\d{2}-\d{2}$/.test(t.occurred_at)
          ? new Date(t.occurred_at + "T12:00:00")
          : new Date();

      if (
        t.installment &&
        t.installments_total &&
        t.installments_total > 1 &&
        t.installment_number &&
        t.installment_number >= 1
      ) {
        const groupId = crypto.randomUUID();
        const parcela = Number(t.amount);
        const total = Number(t.total_amount ?? parcela * t.installments_total);
        // baseDate é a data da PARCELA ATUAL; competência = compra original = base - (n-1) meses
        const competence = addMonths(baseDate, -(t.installment_number - 1));
        for (let i = 1; i <= t.installments_total; i++) {
          const payDate = addMonths(competence, i - 1);
          const isPast = payDate.getTime() <= Date.now();
          rows.push({
            user_id: userId,
            description: `${description.replace(/\s*\d+\/\d+\s*$/, "")} (${i}/${t.installments_total})`,
            amount: parcela,
            category,
            type,
            source_type: "cartao_credito",
            occurred_at: payDate.toISOString(),
            competence_date: toIsoDate(competence),
            payment_date: toIsoDate(payDate),
            installment: true,
            installment_number: i,
            installments_total: t.installments_total,
            installment_amount: parcela,
            total_amount: total,
            purchase_group_id: groupId,
            status: isPast ? "realizado" : "projetado",
          });
        }
      } else {
        rows.push({
          user_id: userId,
          description,
          amount: t.amount,
          category,
          type,
          source_type: sourceType,
          occurred_at: baseDate.toISOString(),
          competence_date: toIsoDate(baseDate),
          payment_date: toIsoDate(baseDate),
          installment: false,
          status: "realizado",
        });
      }
    }

    let inserted = 0;
    if (rows.length) {
      const { error } = await supabase.from("transactions").insert(rows);
      if (error) throw new Error(error.message);
      inserted = rows.length;
    }

    const summary = parsed.summary || `Importei ${inserted} lançamentos.`;
    const clarif = parsed.pending_clarifications?.trim()
      ? `\n\n❓ ${parsed.pending_clarifications}`
      : "";

    await supabase.from("chat_messages").insert([
      {
        user_id: userId,
        role: "user",
        content: `📎 Enviei um extrato (${data.source ?? "arquivo"}) para análise.`,
      },
      {
        user_id: userId,
        role: "assistant",
        content: `**Importação concluída** — ${inserted} lançamentos registrados (incluindo parcelas projetadas).\n\n${summary}${clarif}`,
      },
    ]);

    return { inserted, summary, pendingClarifications: parsed.pending_clarifications ?? "" };
  });
