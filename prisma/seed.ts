import { PrismaClient, Role, OAuthProvider, ProjectStatus, TaskStatus, TaskPriority, SubscriptionPlan, SubscriptionStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Admin user
  const admin = await prisma.user.upsert({
    where: { email: "admin@smartproject.ai" },
    update: {},
    create: {
      email: "admin@smartproject.ai",
      name: "Admin SmartProject",
      role: Role.ADMIN,
      oauthProvider: OAuthProvider.LOCAL,
      emailVerified: true,
      subscription: {
        create: {
          plan: SubscriptionPlan.ENTERPRISE,
          status: SubscriptionStatus.ACTIVE,
        },
      },
    },
  });

  // Demo user
  const user = await prisma.user.upsert({
    where: { email: "demo@smartproject.ai" },
    update: {},
    create: {
      email: "demo@smartproject.ai",
      name: "Demo User",
      role: Role.USER,
      oauthProvider: OAuthProvider.LOCAL,
      emailVerified: true,
      subscription: {
        create: {
          plan: SubscriptionPlan.PRO,
          status: SubscriptionStatus.ACTIVE,
        },
      },
    },
  });

  // Demo project
  const project = await prisma.project.upsert({
    where: { id: "demo-project-001" },
    update: {},
    create: {
      id: "demo-project-001",
      name: "Lancement Produit Q2",
      description: "Projet de lancement du produit SmartProject AI pour le Q2 2026",
      status: ProjectStatus.ACTIVE,
      startDate: new Date("2026-03-01"),
      endDate: new Date("2026-06-30"),
      color: "#6366f1",
      ownerId: user.id,
      members: {
        create: [
          { userId: user.id, role: "OWNER" },
          { userId: admin.id, role: "ADMIN" },
        ],
      },
    },
  });

  // Tasks
  const tasks = [
    { title: "Définir l'architecture technique", status: TaskStatus.DONE, priority: TaskPriority.HIGH },
    { title: "Implémenter le service Auth", status: TaskStatus.DONE, priority: TaskPriority.HIGH },
    { title: "Développer le frontend Dashboard", status: TaskStatus.IN_PROGRESS, priority: TaskPriority.HIGH },
    { title: "Intégrer Stripe Billing", status: TaskStatus.TODO, priority: TaskPriority.MEDIUM },
    { title: "Configurer Prometheus + Grafana", status: TaskStatus.TODO, priority: TaskPriority.MEDIUM },
    { title: "Tests E2E Cypress", status: TaskStatus.BACKLOG, priority: TaskPriority.LOW },
  ];

  for (const task of tasks) {
    await prisma.task.create({
      data: {
        ...task,
        projectId: project.id,
        creatorId: user.id,
        assigneeId: user.id,
      },
    });
  }

  // Activity logs
  await prisma.activityLog.createMany({
    data: [
      { action: "project.created", userId: user.id, projectId: project.id, metadata: { projectName: project.name } },
      { action: "task.completed", userId: user.id, projectId: project.id, metadata: { taskTitle: "Définir l'architecture" } },
    ],
  });

  console.log("✅ Seed completed!");
  console.log(`   Admin: ${admin.email}`);
  console.log(`   User: ${user.email}`);
  console.log(`   Project: ${project.name}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
