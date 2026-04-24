import nodemailer from "nodemailer";
import { env } from "../config/env";

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_SECURE,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

interface CandidateApplicationEmailInput {
  to: string;
  candidateName: string;
  positionApplied: string;
}

export class EmailService {
  static async sendCandidateApplicationConfirmation(
    input: CandidateApplicationEmailInput
  ): Promise<void> {
    await transporter.sendMail({
      from: `"${env.SMTP_FROM_NAME}" <${env.SMTP_FROM_EMAIL}>`,
      to: input.to,
      subject: "Application Received - RecruitmentIQ",
      text: `Hi ${input.candidateName},

We have received your application for the ${input.positionApplied} position.

Our team will review your profile and contact you if your qualifications match our requirements.

Thank you for applying.

RecruitmentIQ Team`,
      html: `<p>Hi ${input.candidateName},</p>
<p>We have received your application for the <strong>${input.positionApplied}</strong> position.</p>
<p>Our team will review your profile and contact you if your qualifications match our requirements.</p>
<p>Thank you for applying.</p>
<p>RecruitmentIQ Team</p>`,
    });
  }
}
