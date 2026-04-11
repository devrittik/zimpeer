import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config({ path: new URL('../../.env', import.meta.url) });

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const CLIENT_URL = process.env.CLIENT_URL;
const logoUrl = `${CLIENT_URL}/public/assets/logo/logo-dark.png`;

const sendVerificationEmail = async (name, email, token) => {
  const link = `${CLIENT_URL}/verify?token=${token}`;

  await transporter.sendMail({
    from: `Zimpeer <${process.env.SMTP_EMAIL}>`,
    to: email,
    subject: "Verify your email",
    html: `
      <div style="margin:0;padding:0;background:#0b1220;font-family:Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td align="center" style="padding:28px 12px;">
              <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="background:#071028;border-radius:12px;overflow:hidden;">
                <tr>
                  <td style="padding:28px 32px 18px;text-align:center;background:#071028;">
                    <img src="${logoUrl}" alt="Zimpeer" width="160" style="display:block;margin:0 auto 14px auto;max-width:90%;height:auto;">
                    <h1 style="margin:0;color:#fff;font-size:20px;font-weight:700;">Welcome to Zimpeer, ${name}</h1>
                    <p style="margin:12px 0 0;color:#a9b4cc;font-size:14px;">Please verify your email to activate your account</p>
                  </td>
                </tr>

                <tr>
                  <td style="padding:28px 36px 36px;background:#071028;text-align:center;">
                    <a href="${link}" style="display:inline-block;padding:12px 22px;border-radius:10px;color:#fff;text-decoration:none;font-weight:700;
                      background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%);box-shadow:0 6px 18px rgba(99,102,241,0.18);">
                      Verify Email
                    </a>

                    <p style="margin:18px 0 0;color:#9fb0d4;font-size:13px;word-break:break-all;">
                      Or copy this link:<br>
                      <a href="${link}" style="color:#cfe0ff;text-decoration:underline;">${link}</a>
                    </p>

                    <p style="margin:18px 0 0;color:#7f95b3;font-size:12px;">
                      This link will expire in 10 minutes.
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="padding:16px 24px 24px;background:#061022;text-align:center;color:#6f859e;font-size:12px;">
                    © ${new Date().getFullYear()} Zimpeer — If you didn't sign up, ignore this email.
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </div>
    `,
  });
};

const sendResetPWEmail = async (name, email, token) => {
  const link = `${CLIENT_URL}/reset-password?token=${token}`;

  await transporter.sendMail({
    from: `Zimpeer <${process.env.SMTP_EMAIL}>`,
    to: email,
    subject: "Reset your Zimpeer password",
    html: `
      <div style="margin:0;padding:0;background:#0b1220;font-family:Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td align="center" style="padding:28px 12px;">
              <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="background:#071028;border-radius:12px;overflow:hidden;">
                <tr>
                  <td style="padding:28px 32px 18px;text-align:center;background:#071028;">
                    <img src="${logoUrl}" alt="Zimpeer" width="160" style="display:block;margin:0 auto 14px auto;max-width:90%;height:auto;">
                    <h1 style="margin:0;color:#fff;font-size:20px;font-weight:700;">Reset your password</h1>
                    <p style="margin:12px 0 0;color:#a9b4cc;font-size:14px;">Hi ${name || 'there'}, use the button below to set a new password</p>
                  </td>
                </tr>

                <tr>
                  <td style="padding:28px 36px 36px;background:#071028;text-align:center;">
                    <a href="${link}" style="display:inline-block;padding:12px 22px;border-radius:10px;color:#fff;text-decoration:none;font-weight:700;
                      background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%);box-shadow:0 6px 18px rgba(99,102,241,0.18);">
                      Reset Password
                    </a>

                    <p style="margin:18px 0 0;color:#9fb0d4;font-size:13px;word-break:break-all;">
                      Or copy this link:<br>
                      <a href="${link}" style="color:#cfe0ff;text-decoration:underline;">${link}</a>
                    </p>

                    <p style="margin:18px 0 0;color:#7f95b3;font-size:12px;">
                      This link will expire in 10 minutes.
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="padding:16px 24px 24px;background:#061022;text-align:center;color:#6f859e;font-size:12px;">
                    © ${new Date().getFullYear()} Zimpeer — If you didn't request this, ignore this email.
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </div>
    `,
  });
};

export {sendVerificationEmail, sendResetPWEmail};
