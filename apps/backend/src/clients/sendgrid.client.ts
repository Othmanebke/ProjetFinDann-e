import sgMail from "@sendgrid/mail";

if (!process.env.SENDGRID_API_KEY) {
  throw new Error("SENDGRID_API_KEY is required");
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || "noreply@smartproject.ai";
export const FROM_NAME = process.env.SENDGRID_FROM_NAME || "SmartProject AI";

export { sgMail };
export default sgMail;
