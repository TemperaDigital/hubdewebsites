import { db, type Task } from "./db";

function isoDateOffset(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function isoDeadlineOffset(days: number, hour = 17, minute = 0) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

export async function seedExampleTasks(ownerUserId: string) {
  const now = new Date().toISOString();
  const base: Omit<Task, "id">[] = [
    {
      ownerUserId,
      title: "Elaborar parecer técnico do processo nº 0123",
      description:
        "Analisar documentação anexa e redigir parecer conclusivo para encaminhamento à chefia.",
      date: isoDateOffset(0),
      deadline: isoDeadlineOffset(2, 17, 0),
      type: "profissional",
      origem: "Coordenação Geral",
      nup: "00190.123456/2026-78",
      responsavel: "Equipe Jurídica",
      done: false,
      attachments: [],
      createdAt: now,
      updatedAt: now,
    },
    {
      ownerUserId,
      title: "Reunião de alinhamento do projeto Alfa",
      description:
        "Discutir cronograma, entregáveis e responsáveis para o próximo ciclo.",
      date: isoDateOffset(1),
      deadline: isoDeadlineOffset(1, 10, 30),
      type: "profissional",
      origem: "Diretoria de TI",
      nup: "00190.654321/2026-12",
      responsavel: "Gerente de Projetos",
      done: false,
      attachments: [],
      createdAt: now,
      updatedAt: now,
    },
    {
      ownerUserId,
      title: "Consulta médica de rotina",
      description: "Levar exames anteriores e cartão do convênio.",
      date: isoDateOffset(3),
      deadline: isoDeadlineOffset(3, 9, 0),
      type: "pessoal",
      done: false,
      attachments: [],
      createdAt: now,
      updatedAt: now,
    },
    {
      ownerUserId,
      title: "Comprar presente de aniversário",
      description: "Aniversário da Ana no próximo sábado — pensar em algo prático.",
      date: isoDateOffset(2),
      type: "pessoal",
      done: false,
      attachments: [],
      createdAt: now,
      updatedAt: now,
    },
    {
      ownerUserId,
      title: "Treino na academia",
      description: "Foco em pernas e abdômen. Levar garrafa de água.",
      date: isoDateOffset(0),
      deadline: isoDeadlineOffset(0, 19, 0),
      type: "pessoal",
      done: false,
      attachments: [],
      createdAt: now,
      updatedAt: now,
    },
  ];

  await db.tasks.bulkAdd(base as Task[]);
  return base.length;
}