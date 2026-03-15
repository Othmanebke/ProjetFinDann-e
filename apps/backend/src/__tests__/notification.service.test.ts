import { sendWelcomeEmail, sendSMSDeadlineReminder, createInAppNotification } from "../services/notification.service";

// Mock SendGrid
const mockSend = jest.fn().mockResolvedValue([{ statusCode: 202 }]);
jest.mock("../clients/sendgrid.client", () => ({
  sgMail: { send: mockSend },
  FROM_EMAIL: "noreply@smartproject.ai",
  FROM_NAME: "SmartProject AI",
}));

// Mock Twilio
const mockMessagesCreate = jest.fn().mockResolvedValue({ sid: "SM123" });
jest.mock("../clients/twilio.client", () => ({
  twilioClient: { messages: { create: mockMessagesCreate } },
  TWILIO_PHONE: "+1234567890",
}));

// Mock Prisma
jest.mock("../lib/prisma", () => ({
  prisma: {
    notification: {
      create: jest.fn().mockResolvedValue({ id: "notif-1" }),
    },
    task: {
      findMany: jest.fn().mockResolvedValue([]),
    },
  },
}));

// Mock logger
jest.mock("../lib/logger", () => ({
  logger: { info: jest.fn(), error: jest.fn() },
}));

describe("NotificationService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.FRONTEND_URL = "http://localhost:3000";
  });

  describe("sendWelcomeEmail", () => {
    it("should send welcome email via SendGrid", async () => {
      await sendWelcomeEmail("user@test.com", "Alice");

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "user@test.com",
          subject: expect.stringContaining("Bienvenue"),
        })
      );
    });

    it("should not throw if SendGrid fails (graceful)", async () => {
      mockSend.mockRejectedValueOnce(new Error("SendGrid error"));

      await expect(sendWelcomeEmail("user@test.com", "Alice")).resolves.not.toThrow();
    });
  });

  describe("sendSMSDeadlineReminder", () => {
    it("should send SMS via Twilio", async () => {
      const dueDate = new Date("2026-04-01");
      await sendSMSDeadlineReminder("+33600000000", "Fix bug #123", "My Project", dueDate);

      expect(mockMessagesCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "+33600000000",
          body: expect.stringContaining("Fix bug #123"),
        })
      );
    });

    it("should not throw if Twilio fails (graceful)", async () => {
      mockMessagesCreate.mockRejectedValueOnce(new Error("Twilio error"));

      await expect(
        sendSMSDeadlineReminder("+33600000000", "Task", "Project", new Date())
      ).resolves.not.toThrow();
    });
  });

  describe("createInAppNotification", () => {
    it("should create notification in database", async () => {
      await createInAppNotification(
        "user-1",
        "task.due",
        "Tâche bientôt due",
        "Ta tâche est due demain",
        { taskId: "task-1" }
      );

      const { prisma } = require("../lib/prisma");
      expect(prisma.notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: "user-1",
            type: "task.due",
            title: "Tâche bientôt due",
          }),
        })
      );
    });
  });
});
