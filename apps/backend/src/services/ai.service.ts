import { Response } from "express";
import { openaiClient, AI_MODEL } from "../clients/openai.client";
import { prisma } from "../lib/prisma";
import { AppError } from "../middlewares/error.middleware";
import { aiRequestsTotal, aiRequestDuration } from "../clients/prometheus.client";

const SYSTEM_PROMPT = `Tu es SmartProject AI, un assistant expert en gestion de projets, organisation et productivité.
Tu réponds toujours en français sauf demande contraire.
Tes réponses pour les endpoints structurés sont TOUJOURS en JSON valide.
Tu es précis, pragmatique et orienté résultats.`;

// ─── Generate Project Plan ────────────────────────────────────────────────────
export async function generateProjectPlan(
  projectId: string,
  userId: string
): Promise<object> {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      OR: [{ ownerId: userId }, { members: { some: { userId } } }],
    },
    include: { tasks: true, members: { include: { user: { select: { name: true } } } } },
  });

  if (!project) throw new AppError(404, "Project not found");

  const end = aiRequestDuration.startTimer({ type: "generate-plan" });

  try {
    const completion = await openaiClient.chat.completions.create({
      model: AI_MODEL,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Génère un plan de projet complet et structuré pour ce projet :
Nom: ${project.name}
Description: ${project.description || "Non spécifiée"}
Dates: ${project.startDate?.toISOString().split("T")[0] || "?"} → ${project.endDate?.toISOString().split("T")[0] || "?"}
Membres: ${project.members.map(m => m.user.name).join(", ")}
Tâches existantes: ${project.tasks.length}

Retourne un JSON avec : { "phases": [...], "milestones": [...], "risks": [...], "recommendations": [...], "estimatedDuration": "..." }`,
        },
      ],
    });

    aiRequestsTotal.inc({ type: "generate-plan", model: AI_MODEL, status: "success" });
    return JSON.parse(completion.choices[0].message.content || "{}");
  } catch (err) {
    aiRequestsTotal.inc({ type: "generate-plan", model: AI_MODEL, status: "error" });
    throw err;
  } finally {
    end();
  }
}

// ─── Summarize Activity ───────────────────────────────────────────────────────
export async function summarizeActivity(
  projectId: string,
  userId: string,
  days: number = 7
): Promise<object> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const activities = await prisma.activityLog.findMany({
    where: {
      projectId,
      project: { OR: [{ ownerId: userId }, { members: { some: { userId } } }] },
      createdAt: { gte: since },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { user: { select: { name: true } } },
  });

  if (!activities.length) {
    return { summary: "Aucune activité sur cette période.", highlights: [], count: 0 };
  }

  const end = aiRequestDuration.startTimer({ type: "summarize" });

  try {
    const completion = await openaiClient.chat.completions.create({
      model: AI_MODEL,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Résume les activités suivantes des ${days} derniers jours en JSON :
${JSON.stringify(activities.map(a => ({ action: a.action, user: a.user.name, date: a.createdAt, meta: a.metadata })))}

Retourne: { "summary": "...", "highlights": ["..."], "concerns": ["..."], "count": ${activities.length} }`,
        },
      ],
    });

    aiRequestsTotal.inc({ type: "summarize", model: AI_MODEL, status: "success" });
    return JSON.parse(completion.choices[0].message.content || "{}");
  } finally {
    end();
  }
}

// ─── Identify Risks ───────────────────────────────────────────────────────────
export async function identifyRisks(projectId: string, userId: string): Promise<object> {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      OR: [{ ownerId: userId }, { members: { some: { userId } } }],
    },
    include: {
      tasks: { select: { title: true, status: true, priority: true, dueDate: true } },
    },
  });

  if (!project) throw new AppError(404, "Project not found");

  const overdueTasks = project.tasks.filter(
    t => t.dueDate && t.dueDate < new Date() && t.status !== "DONE"
  );

  const end = aiRequestDuration.startTimer({ type: "risks" });

  try {
    const completion = await openaiClient.chat.completions.create({
      model: AI_MODEL,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Analyse les risques de ce projet :
Nom: ${project.name}
Statut: ${project.status}
Date de fin: ${project.endDate?.toISOString().split("T")[0] || "Non définie"}
Tâches totales: ${project.tasks.length}
Tâches en retard: ${overdueTasks.length}
Tâches urgentes: ${project.tasks.filter(t => t.priority === "URGENT" && t.status !== "DONE").length}

Retourne: { "riskLevel": "LOW|MEDIUM|HIGH|CRITICAL", "risks": [{ "title": "...", "severity": "...", "probability": "...", "mitigation": "..." }], "overallAssessment": "..." }`,
        },
      ],
    });

    aiRequestsTotal.inc({ type: "risks", model: AI_MODEL, status: "success" });
    return JSON.parse(completion.choices[0].message.content || "{}");
  } finally {
    end();
  }
}

// ─── Generate Tasks ───────────────────────────────────────────────────────────
export async function generateTasks(
  projectId: string,
  userId: string,
  context: string
): Promise<object> {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      OR: [{ ownerId: userId }, { members: { some: { userId } } }],
    },
  });

  if (!project) throw new AppError(404, "Project not found");

  const end = aiRequestDuration.startTimer({ type: "generate-tasks" });

  try {
    const completion = await openaiClient.chat.completions.create({
      model: AI_MODEL,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Génère des tâches pour ce projet :
Projet: ${project.name}
Description: ${project.description || ""}
Contexte supplémentaire: ${context}

Retourne: { "tasks": [{ "title": "...", "description": "...", "priority": "LOW|MEDIUM|HIGH|URGENT", "estimatedHours": 0, "tags": [] }] }
Génère entre 5 et 15 tâches pertinentes et actionnables.`,
        },
      ],
    });

    aiRequestsTotal.inc({ type: "generate-tasks", model: AI_MODEL, status: "success" });
    return JSON.parse(completion.choices[0].message.content || "{}");
  } finally {
    end();
  }
}

// ─── AI Chat (Streaming SSE) ──────────────────────────────────────────────────
export async function streamChat(
  userId: string,
  chatId: string | null,
  message: string,
  projectId: string | null,
  res: Response
): Promise<void> {
  // Verify project access if projectId provided
  if (projectId) {
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [{ ownerId: userId }, { members: { some: { userId } } }],
      },
    });
    if (!project) throw new AppError(403, "Access denied to project");
  }

  // Load or create chat
  let chat = chatId
    ? await prisma.aIChat.findFirst({ where: { id: chatId, userId } })
    : null;

  if (!chat) {
    chat = await prisma.aIChat.create({
      data: {
        userId,
        projectId: projectId || undefined,
        title: message.substring(0, 50),
      },
    });
  }

  // Load conversation history
  const history = await prisma.aIMessage.findMany({
    where: { chatId: chat.id },
    orderBy: { createdAt: "asc" },
    take: 20,
  });

  // Save user message
  await prisma.aIMessage.create({
    data: { chatId: chat.id, role: "user", content: message },
  });

  // Build messages
  const messages: any[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history.map(m => ({ role: m.role, content: m.content })),
    { role: "user", content: message },
  ];

  // SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  res.write(`data: ${JSON.stringify({ type: "chat_id", chatId: chat.id })}\n\n`);

  const end = aiRequestDuration.startTimer({ type: "chat" });
  let fullResponse = "";

  try {
    const stream = await openaiClient.chat.completions.create({
      model: AI_MODEL,
      messages,
      stream: true,
    });

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content || "";
      if (delta) {
        fullResponse += delta;
        res.write(`data: ${JSON.stringify({ type: "delta", content: delta })}\n\n`);
      }
    }

    // Save assistant message
    await prisma.aIMessage.create({
      data: {
        chatId: chat.id,
        role: "assistant",
        content: fullResponse,
        metadata: { model: AI_MODEL },
      },
    });

    aiRequestsTotal.inc({ type: "chat", model: AI_MODEL, status: "success" });
    res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
  } catch (err) {
    aiRequestsTotal.inc({ type: "chat", model: AI_MODEL, status: "error" });
    res.write(`data: ${JSON.stringify({ type: "error", message: "AI error" })}\n\n`);
  } finally {
    end();
    res.end();
  }
}
