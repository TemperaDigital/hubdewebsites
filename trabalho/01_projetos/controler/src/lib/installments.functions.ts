import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const getInstallments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("transactions")
      .select(
        "id,description,amount,category,type,occurred_at,competence_date,payment_date,installment,installment_number,installments_total,installment_amount,total_amount,purchase_group_id,status",
      )
      .eq("user_id", userId)
      .eq("installment", true)
      .order("payment_date", { ascending: true })
      .limit(2000);
    if (error) throw new Error(error.message);

    const today = new Date().toISOString().slice(0, 10);

    // Group by purchase_group_id
    const groupsMap = new Map<string, any>();
    for (const r of data ?? []) {
      const g = r.purchase_group_id;
      if (!g) continue;
      if (!groupsMap.has(g)) {
        groupsMap.set(g, {
          group_id: g,
          description: (r.description ?? "").replace(/\s*\(\d+\/\d+\)\s*$/, ""),
          category: r.category,
          installments_total: r.installments_total ?? 0,
          installment_amount: Number(r.installment_amount ?? r.amount ?? 0),
          total_amount: Number(r.total_amount ?? 0),
          paid_count: 0,
          remaining_amount: 0,
          next_payment_date: null as string | null,
          last_payment_date: null as string | null,
          items: [] as any[],
        });
      }
      const grp = groupsMap.get(g);
      grp.items.push(r);
      const pay = r.payment_date as string | null;
      if (r.status === "realizado" || (pay && pay <= today)) {
        grp.paid_count += 1;
      } else {
        grp.remaining_amount += Number(r.amount ?? 0);
        if (pay && (!grp.next_payment_date || pay < grp.next_payment_date)) {
          grp.next_payment_date = pay;
        }
      }
      if (pay && (!grp.last_payment_date || pay > grp.last_payment_date)) {
        grp.last_payment_date = pay;
      }
    }

    const groups = Array.from(groupsMap.values()).sort((a, b) =>
      (a.next_payment_date ?? "9999") < (b.next_payment_date ?? "9999") ? -1 : 1,
    );

    // Monthly future commitments (next 12 months)
    const monthly: Record<string, number> = {};
    let totalCommitted = 0;
    for (const r of data ?? []) {
      const pay = r.payment_date as string | null;
      if (!pay || pay <= today) continue;
      if (r.type !== "despesa") continue;
      const key = pay.slice(0, 7);
      monthly[key] = (monthly[key] ?? 0) + Number(r.amount ?? 0);
      totalCommitted += Number(r.amount ?? 0);
    }
    const monthlyArr = Object.entries(monthly)
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .slice(0, 12)
      .map(([month, amount]) => ({ month, amount }));

    return { groups, monthly: monthlyArr, totalCommitted };
  });

const DeleteInput = z.object({
  groupId: z.string().uuid(),
  scope: z.enum(["one", "future", "all"]),
  installmentNumber: z.number().int().min(1).optional(),
});

export const deleteInstallment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => DeleteInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    let query = supabase
      .from("transactions")
      .delete()
      .eq("user_id", userId)
      .eq("purchase_group_id", data.groupId);

    if (data.scope === "one") {
      if (!data.installmentNumber) throw new Error("installmentNumber obrigatório");
      query = query.eq("installment_number", data.installmentNumber);
    } else if (data.scope === "future") {
      if (!data.installmentNumber) throw new Error("installmentNumber obrigatório");
      query = query.gte("installment_number", data.installmentNumber);
    }
    const { error } = await query;
    if (error) throw new Error(error.message);
    return { ok: true };
  });
