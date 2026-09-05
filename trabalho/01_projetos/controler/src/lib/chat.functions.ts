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

const ChatInput = z.object({
  message: z.string().min(1).max(2000),
});

interface ParsedTx {
  description: string;
  amount: number;
  category: string;
  type: "despesa" | "receita";
  // Optional installment / source data
  source_type?: "conta_corrente" | "cartao_credito" | "entrada";
  installment?: boolean;
  installments_total?: number;
  total_amount?: number;
  competence_date?: string; // YYYY-MM-DD
}

function addMonths(date: Date, n: number): Date {
  const d = new Date(date);
  const day = d.getDate();
  d.setMonth(d.getMonth() + n);
  // handle month overflow (e.g. 31 jan + 1 = 3 mar) -> keep last day
  if (d.getDate() < day) d.setDate(0);
  return d;
}

function toIsoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export const sendChatMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => ChatInput.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("AI gateway não configurado");

    await supabase.from("chat_messages").insert({
      user_id: userId,
      role: "user",
      content: data.message,
    });

    const [{ data: txs }, { data: goals }, { data: history }] = await Promise.all([
      supabase
        .from("transactions")
        .select("description,amount,category,type,occurred_at,installment,installments_total")
        .eq("user_id", userId)
        .order("occurred_at", { ascending: false })
        .limit(15),
      supabase
        .from("goals")
        .select("title,target_amount,current_amount,deadline")
        .eq("user_id", userId),
      supabase
        .from("chat_messages")
        .select("role,content")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

    const ordered = (history ?? []).reverse();
    const today = new Date().toISOString().slice(0, 10);

    const systemPrompt = `Você é o "Fin", agente financeiro conversacional gentil e didático em pt-BR. Tom: caloroso, breve, sem julgamento.

Suas regras:
1. SEMPRE devolva JSON válido neste formato exato:
{
  "reply": "resposta curta amigável em markdown",
  "transactions": [
    {
      "description": "...",
      "amount": <valor da PARCELA se parcelado, senão valor total>,
      "category": "uma das categorias",
      "type": "despesa" | "receita",
      "source_type": "conta_corrente" | "cartao_credito" | "entrada",
      "installment": true | false,
      "installments_total": <int, somente se installment=true>,
      "total_amount": <valor total da compra, somente se installment=true>,
      "competence_date": "YYYY-MM-DD" (data da compra, opcional, padrão hoje=${today})
    }
  ],
  "needs_clarification": "se a compra parece de valor alto (>R$300) ou de loja famosa por parcelar (Magalu, Casas Bahia, Amazon, etc) E o usuário NÃO disse se foi à vista ou parcelado, coloque aqui a pergunta. Caso contrário, string vazia."
}

2. DETECÇÃO DE PARCELAMENTO:
   - "12x", "em 12 vezes", "parcelado em N", "/12" → installment=true, installments_total=N, total_amount=valor total, amount=valor da parcela (valor_total / N).
   - Quando installment=true, source_type DEVE ser "cartao_credito".
   - Quando o usuário não especifica, MAS o gasto sugere parcelamento (TV, geladeira, notebook, móvel, valor > R$300 em loja típica), use "needs_clarification" para perguntar "foi à vista ou parcelado em quantas vezes?" e devolva transactions=[] (não registre ainda).
   - Quando claramente à vista (Uber, mercado, café, pequenos valores), installment=false.

3. Categorias permitidas: ${CATEGORIES.join(", ")}.
4. amount sempre positivo. Sinal vem do "type".
5. Se não houver transação, transactions=[].
6. Respostas curtas (máx 3 frases). Quando registrar parcelado, mencione o total e quantas parcelas.

Contexto:
Hoje: ${today}
Últimas transações: ${JSON.stringify(txs ?? [])}
Metas: ${JSON.stringify(goals ?? [])}`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...ordered.map((m) => ({ role: m.role, content: m.content })),
    ];

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`AI gateway erro: ${res.status} ${text}`);
    }

    const json = await res.json();
    const raw = json.choices?.[0]?.message?.content ?? "{}";
    let parsed: {
      reply: string;
      transactions: ParsedTx[];
      needs_clarification?: string;
    } = {
      reply: "Desculpe, tive um problema para responder.",
      transactions: [],
    };
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = { reply: raw, transactions: [] };
    }

    // Persist transactions, expanding installments into N rows w/ shared group id
    if (parsed.transactions?.length) {
      const rows: any[] = [];
      for (const t of parsed.transactions) {
        if (!t || typeof t.amount !== "number" || t.amount <= 0 || !t.description) continue;
        const category = CATEGORIES.includes(t.category) ? t.category : "outros";
        const type = t.type === "receita" ? "receita" : "despesa";
        const description = t.description.slice(0, 200);
        const competence = t.competence_date && /^\d{4}-\d{2}-\d{2}$/.test(t.competence_date)
          ? new Date(t.competence_date + "T12:00:00")
          : new Date();
        const sourceType =
          type === "receita"
            ? "entrada"
            : t.source_type === "cartao_credito"
              ? "cartao_credito"
              : t.source_type === "entrada"
                ? "entrada"
                : "conta_corrente";

        if (t.installment && t.installments_total && t.installments_total > 1) {
          const groupId = crypto.randomUUID();
          const total = Number(t.total_amount ?? t.amount * t.installments_total);
          const parcela = Number((total / t.installments_total).toFixed(2));
          for (let i = 1; i <= t.installments_total; i++) {
            const payDate = addMonths(competence, i - 1);
            rows.push({
              user_id: userId,
              description: `${description} (${i}/${t.installments_total})`,
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
              status: i === 1 ? "realizado" : "projetado",
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
            occurred_at: competence.toISOString(),
            competence_date: toIsoDate(competence),
            payment_date: toIsoDate(competence),
            installment: false,
            status: "realizado",
          });
        }
      }
      if (rows.length) await supabase.from("transactions").insert(rows);
    }

    let finalReply = parsed.reply || "";
    if (parsed.needs_clarification && parsed.needs_clarification.trim()) {
      finalReply = (finalReply ? finalReply + "\n\n" : "") + "💳 " + parsed.needs_clarification;
    }

    await supabase.from("chat_messages").insert({
      user_id: userId,
      role: "assistant",
      content: finalReply || "Ok!",
    });

    return { reply: finalReply, savedTransactions: parsed.transactions ?? [] };
  });

export const getChatHistory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data } = await supabase
      .from("chat_messages")
      .select("id,role,content,created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .limit(100);
    return data ?? [];
  });
