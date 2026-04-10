import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config({ path: new URL('../../.env', import.meta.url) });

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL,
    pass: process.env.GMAIL_PASS,
  },
});

// const sendVerificationEmail = async (name, email, token) => {
//   const link = `${process.env.CLIENT_URL}/verify?token=${token}`;

//   await transporter.sendMail({
//     from: `Zimpeer <${process.env.GMAIL}>`,
//     to: email,
//     subject: "Verify your email",
//     html: `
//       <div style="font-family: Arial, sans-serif; background-color: #f5f7fb; padding: 40px 20px;">
        
//         <div style="max-width: 500px; margin: auto; background: #ffffff; border-radius: 12px; padding: 30px; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
          
//           <h2 style="text-align: center; color: #1976d2; margin-bottom: 10px;">
//             Hello ${name}, Welcome to Zimpeer 🎉
//           </h2>
    
//           <p style="text-align: center; color: #555; font-size: 14px; margin-bottom: 25px;">
//             Please verify your email to continue
//           </p>
    
//           <div style="text-align: center; margin: 30px 0;">
//             <a href="${link}" 
//                style="
//                  background-color: #1976d2;
//                  color: white;
//                  padding: 12px 24px;
//                  text-decoration: none;
//                  border-radius: 8px;
//                  font-weight: bold;
//                  display: inline-block;
//                ">
//               Verify Email
//             </a>
//           </div>
//           <p style="font-size:12px; text-align:center;">
//             Or copy this link:<br/>
//             <a href="${link}">${link}</a>
//           </p>
    
//           <p style="font-size: 13px; color: #777; text-align: center;">
//             This link will expire in 10 minutes.
//           </p>
    
//           <hr style="margin: 25px 0; border: none; border-top: 1px solid #eee;" />
    
//           <p style="font-size: 12px; color: #999; text-align: center;">
//             If you didn’t create an account, you can safely ignore this email.
//           </p>
    
//           <p style="font-size: 12px; color: #bbb; text-align: center; margin-top: 10px;">
//             © ${new Date().getFullYear()} Zimpeer
//           </p>
    
//         </div>
    
//       </div>
//     `,
//   });
// };

// const sendResetPWEmail = async (name, email, token) => {
//   const link = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

//   await transporter.sendMail({
//     from: `Zimpeer <${process.env.GMAIL}>`,
//     to: email,
//     subject: "Reset Your Password",
//     html: `
//       <div style="font-family: Arial, sans-serif; background-color: #f5f7fb; padding: 40px 20px;">
        
//         <div style="max-width: 500px; margin: auto; background: #ffffff; border-radius: 12px; padding: 30px; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
          
//           <h2 style="text-align: center; color: #1976d2; margin-bottom: 10px;">
//             Reset your password 🔐
//           </h2>
    
//           <p style="text-align: center; color: #555; font-size: 14px; margin-bottom: 20px;">
//             Hi ${name || "there"},
//           </p>

//           <p style="text-align: center; color: #555; font-size: 14px; margin-bottom: 25px;">
//             We received a request to reset your password. Click the button below to set a new one.
//           </p>
    
//           <div style="text-align: center; margin: 30px 0;">
//             <a href="${link}" 
//                style="
//                  background-color: #1976d2;
//                  color: white;
//                  padding: 12px 24px;
//                  text-decoration: none;
//                  border-radius: 8px;
//                  font-weight: bold;
//                  display: inline-block;
//                ">
//               Reset Password
//             </a>
//           </div>

//           <p style="font-size:12px; text-align:center;">
//             Or copy and paste this link:<br/>
//             <a href="${link}">${link}</a>
//           </p>
    
//           <p style="font-size: 13px; color: #777; text-align: center;">
//             This link will expire in 10 minutes.
//           </p>
    
//           <hr style="margin: 25px 0; border: none; border-top: 1px solid #eee;" />
    
//           <p style="font-size: 12px; color: #999; text-align: center;">
//             If you didn’t request a password reset, you can safely ignore this email.
//           </p>
    
//           <p style="font-size: 12px; color: #bbb; text-align: center; margin-top: 10px;">
//             © ${new Date().getFullYear()} Zimpeer
//           </p>
    
//         </div>
    
//       </div>
//     `,
//   });
// };

const CLIENT_URL = process.env.CLIENT_URL;
const logoUrl = `${CLIENT_URL}/public/assets/logo/logo-dark.png`;

const sendVerificationEmail = async (name, email, token) => {
  const link = `${CLIENT_URL}/verify?token=${token}`;

  await transporter.sendMail({
    from: `Zimpeer <${process.env.GMAIL}>`,
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
    from: `Zimpeer <${process.env.GMAIL}>`,
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
