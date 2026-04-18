import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT) || 465,
  secure: Number(process.env.EMAIL_SERVER_PORT) === 465,
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

const FROM = process.env.EMAIL_FROM || "ResumeEvy <noreply@resumeevy.com>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

const baseStyle = `
  font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
  background: #0F0F1A;
  color: #E2E8F0;
  max-width: 600px;
  margin: 0 auto;
  padding: 40px 20px;
`;

const buttonStyle = `
  display: inline-block;
  background: linear-gradient(135deg, #6366F1, #818CF8);
  color: white;
  padding: 14px 32px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  font-size: 16px;
  margin: 24px 0;
`;

export async function sendVerificationEmail(
  email: string,
  name: string,
  token: string
): Promise<void> {
  const verifyUrl = `${APP_URL}/verify-email?token=${token}`;
  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: "Verify your ResumeEvy account",
    html: `
      <div style="${baseStyle}">
        <div style="text-align: center; margin-bottom: 32px;">
          <span style="font-size: 32px; font-weight: 800; background: linear-gradient(135deg, #6366F1, #818CF8); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">ResumeEvy</span>
        </div>
        <h1 style="font-size: 28px; font-weight: 700; color: white; margin-bottom: 16px;">Welcome, ${name}!</h1>
        <p style="color: #94A3B8; line-height: 1.6; margin-bottom: 24px;">
          Thank you for signing up for ResumeEvy. Please verify your email address to get started.
        </p>
        <div style="text-align: center;">
          <a href="${verifyUrl}" style="${buttonStyle}">Verify Email Address</a>
        </div>
        <p style="color: #64748B; font-size: 14px; margin-top: 32px;">
          This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.
        </p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(
  email: string,
  name: string,
  token: string
): Promise<void> {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;
  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: "Reset your ResumeEvy password",
    html: `
      <div style="${baseStyle}">
        <div style="text-align: center; margin-bottom: 32px;">
          <span style="font-size: 32px; font-weight: 800; background: linear-gradient(135deg, #6366F1, #818CF8); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">ResumeEvy</span>
        </div>
        <h1 style="font-size: 28px; font-weight: 700; color: white; margin-bottom: 16px;">Reset your password</h1>
        <p style="color: #94A3B8; line-height: 1.6;">Hi ${name}, click the button below to reset your password.</p>
        <div style="text-align: center;">
          <a href="${resetUrl}" style="${buttonStyle}">Reset Password</a>
        </div>
        <p style="color: #64748B; font-size: 14px; margin-top: 32px;">
          This link expires in 1 hour. If you didn't request a password reset, please ignore this email.
        </p>
      </div>
    `,
  });
}

export async function sendWelcomeEmail(email: string, name: string): Promise<void> {
  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: "Welcome to ResumeEvy — Let's land your dream job",
    html: `
      <div style="${baseStyle}">
        <div style="text-align: center; margin-bottom: 32px;">
          <span style="font-size: 32px; font-weight: 800; background: linear-gradient(135deg, #6366F1, #818CF8); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">ResumeEvy</span>
        </div>
        <h1 style="font-size: 28px; font-weight: 700; color: white; margin-bottom: 16px;">You're in, ${name}! 🎉</h1>
        <p style="color: #94A3B8; line-height: 1.6; margin-bottom: 16px;">
          Your ResumeEvy account is ready. Here's what you can do:
        </p>
        <ul style="color: #94A3B8; line-height: 2;">
          <li>Upload your existing resume and let AI tailor it to any job</li>
          <li>Build a new resume from scratch with 20+ beautiful templates</li>
          <li>Get your ATS score and see exactly what's missing</li>
          <li>Download as PDF or Word with perfect formatting</li>
        </ul>
        <div style="text-align: center;">
          <a href="${APP_URL}/dashboard" style="${buttonStyle}">Go to Dashboard</a>
        </div>
      </div>
    `,
  });
}

export async function sendSubscriptionConfirmEmail(
  email: string,
  name: string,
  plan: string
): Promise<void> {
  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: `ResumeEvy ${plan} plan activated!`,
    html: `
      <div style="${baseStyle}">
        <div style="text-align: center; margin-bottom: 32px;">
          <span style="font-size: 32px; font-weight: 800; background: linear-gradient(135deg, #6366F1, #818CF8); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">ResumeEvy</span>
        </div>
        <h1 style="font-size: 28px; font-weight: 700; color: white; margin-bottom: 16px;">Subscription Active!</h1>
        <p style="color: #94A3B8; line-height: 1.6;">Hi ${name}, your <strong style="color: #818CF8;">${plan}</strong> plan is now active. Enjoy unlimited access to all ResumeEvy features!</p>
        <div style="text-align: center;">
          <a href="${APP_URL}/dashboard" style="${buttonStyle}">Start Tailoring</a>
        </div>
      </div>
    `,
  });
}
