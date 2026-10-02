// Server-only SMTP delivery for account recovery messages.
// Reset links are sent from the password-reset Server Action.
import "server-only";
import nodemailer from "nodemailer";

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const password = process.env.SMTP_PASSWORD;
  const from = process.env.SMTP_FROM;

  if (!host || !user || !password || !from) {
    throw new Error("SMTP configuration is incomplete");
  }

  const port = Number(process.env.SMTP_PORT ?? 587);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("SMTP_PORT must be a valid port number");
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass: password },
  });

  await transporter.sendMail({
    from,
    to,
    subject: "Reset your clinic dashboard password",
    text: `Use this link to reset your password within 30 minutes: ${resetUrl}`,
    html: `<p>We received a request to reset your clinic dashboard password.</p><p><a href="${resetUrl}">Reset your password</a></p><p>This link expires in 30 minutes. If you did not request a reset, you can ignore this email.</p>`,
  });
}
