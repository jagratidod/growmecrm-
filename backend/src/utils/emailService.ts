import nodemailer from 'nodemailer';

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
  const service = process.env.SMTP_SERVICE;
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (service === 'gmail') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user,
        pass,
      },
    });
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });
};

/**
 * Sends a branded password reset OTP email
 */
export const sendPasswordResetOtpEmail = async (
  toEmail: string,
  otp: string,
  recipientName?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return { success: false, error: 'Password reset email is not configured.' };
    }
    const transporter = createTransporter();
    const fromAddress = process.env.EMAIL_FROM || { name: 'GrowMe', address: process.env.SMTP_USER };

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset OTP - GrowMe</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1E293B;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F8FAFC; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 520px; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04);">
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #43336B 0%, #2A1D4E 100%); padding: 32px 30px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #FFFFFF; letter-spacing: 0.5px;">GrowMe</h1>
              <p style="margin: 6px 0 0; font-size: 13px; color: #E9D5FF; text-transform: uppercase; letter-spacing: 1.5px;">GrowMe CRM Security</p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 36px 32px 28px;">
              <h2 style="margin: 0 0 12px; font-size: 20px; font-weight: 600; color: #1E293B;">Password Reset Request</h2>
              <p style="margin: 0 0 20px; font-size: 14px; line-height: 22px; color: #64748B;">
                Hello${recipientName ? ` <strong>${recipientName}</strong>` : ''},<br>
                We received a request to reset your password. Use the verification code below to complete the reset:
              </p>

              <!-- OTP Box -->
              <div style="background-color: #F3F4F6; border: 1.5px dashed #6D4FA8; border-radius: 12px; padding: 22px 16px; text-align: center; margin: 24px 0;">
                <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; color: #6D4FA8; font-weight: 600; margin-bottom: 8px;">One-Time Verification Code</div>
                <div style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #43336B; font-family: 'Courier New', Courier, monospace;">${otp}</div>
              </div>

              <!-- Alert Info -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #FEF3C7; border-left: 4px solid #F59E0B; border-radius: 6px; margin: 20px 0;">
                <tr>
                  <td style="padding: 12px 14px; font-size: 13px; color: #92400E; line-height: 18px;">
                    <strong>Notice:</strong> This OTP is valid for <strong>10 minutes</strong>. Never share this code with anyone.
                  </td>
                </tr>
              </table>

              <p style="margin: 20px 0 0; font-size: 13px; line-height: 20px; color: #94A3B8;">
                If you did not request this password reset, please ignore this email or review your account security immediately.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="border-top: 1px solid #F1F5F9; padding: 20px 32px; background-color: #FAFAFA; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #94A3B8;">
                &copy; ${new Date().getFullYear()} GrowMe. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const info = await transporter.sendMail({
      from: fromAddress,
      to: toEmail,
      subject: `${otp} is your GrowMe password reset code`,
      text: `Your GrowMe password reset verification code is: ${otp}. It will expire in 10 minutes. If you did not request this, please ignore this email.`,
      html: htmlContent,
    });

    console.log(`[Email Service] Password reset OTP sent to ${toEmail}. MessageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('[Email Service Error]:', error);
    return { success: false, error: error?.message || 'Failed to send OTP email' };
  }
};
