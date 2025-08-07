import nodemailer from 'nodemailer';

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// Email templates
const emailTemplates = {
  verification: (name, verificationUrl) => ({
    subject: 'Verify your SmartNotes account',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Account</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
              background-color: #f8f9fa;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .email-wrapper {
              background-color: white;
              border-radius: 12px;
              padding: 40px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo-container {
              text-align: center;
              margin-bottom: 20px;
            }
            .title {
              font-size: 24px;
              font-weight: 600;
              color: #1f2937;
              margin-bottom: 20px;
            }
            .content {
              margin-bottom: 30px;
            }
            .button {
              display: inline-block;
              padding: 16px 32px;
              background: linear-gradient(135deg, #8B5A3C 0%, #6B4423 100%);
              color: white !important;
              text-decoration: none;
              border-radius: 12px;
              margin: 24px 0;
              font-weight: 600;
              font-size: 16px;
              box-shadow: 0 4px 12px rgba(139, 90, 60, 0.3);
              transition: all 0.3s ease;
            }
            .button:hover {
              background: linear-gradient(135deg, #6B4423 0%, #5A3A1E 100%);
              box-shadow: 0 6px 16px rgba(139, 90, 60, 0.4);
            }
            .button-container {
              text-align: center;
              margin: 32px 0;
            }
            .footer {
              text-align: center;
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              font-size: 14px;
              color: #6b7280;
            }
            .warning {
              background-color: #fef3c7;
              border: 1px solid #f59e0b;
              border-radius: 8px;
              padding: 16px;
              margin: 20px 0;
              font-size: 14px;
            }
            .features {
              background-color: #f8fafc;
              border-radius: 8px;
              padding: 20px;
              margin: 24px 0;
            }
            .features ul {
              margin: 0;
              padding-left: 20px;
            }
            .features li {
              margin: 8px 0;
            }
            .url-box {
              word-break: break-all;
              color: #8B5A3C;
              background-color: #f1f5f9;
              padding: 12px;
              border-radius: 6px;
              font-family: monospace;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="email-wrapper">
              <div class="header">
                <div class="logo-container">
                  <img src="https://i.postimg.cc/qBC1wDgj/Screenshot-2025-07-07-140806-1.jpg" alt="SmartNotes Logo" style="max-width: 200px; height: auto; display: block; margin: 0 auto;">
                </div>
                <h1 class="title">Welcome to SmartNotes!</h1>
              </div>
              <div class="content">
                <p>Hi ${name},</p>
                <p>Thank you for signing up for SmartNotes! We're excited to help you transform your note-taking experience with AI-powered organization and insights.</p>
                <p>To get started, please verify your email address by clicking the button below:</p>
                <div class="button-container">
                  <a href="${verificationUrl}" class="button">✉️ Verify Email Address</a>
                </div>
                <div class="warning">
                  <strong>⚠️ Important:</strong> This verification link will expire in 24 hours for security reasons.
                </div>
                <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
                <div class="url-box">${verificationUrl}</div>
                <div class="features">
                  <p><strong>Once verified, you'll be able to:</strong></p>
                  <ul>
                    <li>✨ Create and organize smart notes</li>
                    <li>🔗 Discover automatic connections between ideas</li>
                    <li>🔍 Use intelligent search to find anything instantly</li>
                    <li>📝 Get AI-powered summaries and insights</li>
                  </ul>
                </div>
              </div>
              <div class="footer">
                <p>If you didn't create an account with SmartNotes, you can safely ignore this email.</p>
                <p>© 2024 SmartNotes. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      Welcome to SmartNotes, ${name}!
      
      Thank you for creating an account with SmartNotes. To complete your registration, please verify your email address by clicking the link below:
      
      ${verificationUrl}
      
      This link will expire in 24 hours.
      
      If you didn't create an account with SmartNotes, you can safely ignore this email.
      
      © 2024 SmartNotes. All rights reserved.
    `
  }),

  passwordReset: (name, resetUrl) => ({
    subject: 'Reset your SmartNotes password',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
              background-color: #f8f9fa;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .email-wrapper {
              background-color: white;
              border-radius: 12px;
              padding: 40px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo-container {
              text-align: center;
              margin-bottom: 20px;
            }
            .title {
              font-size: 24px;
              font-weight: 600;
              color: #1f2937;
              margin-bottom: 20px;
            }
            .content {
              margin-bottom: 30px;
            }
            .button {
              display: inline-block;
              padding: 16px 32px;
              background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
              color: white !important;
              text-decoration: none;
              border-radius: 12px;
              margin: 24px 0;
              font-weight: 600;
              font-size: 16px;
              box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
              transition: all 0.3s ease;
              border: none;
              cursor: pointer;
            }
            .button:hover {
              background: linear-gradient(135deg, #b91c1c 0%, #991b1b 100%);
              box-shadow: 0 6px 16px rgba(220, 38, 38, 0.4);
              transform: translateY(-2px);
            }
            .button-container {
              text-align: center;
              margin: 32px 0;
            }
            .footer {
              text-align: center;
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              font-size: 14px;
              color: #6b7280;
            }
            .warning {
              background: #fef3c7;
              border: 1px solid #f59e0b;
              padding: 16px;
              border-radius: 8px;
              margin: 20px 0;
              font-size: 14px;
            }
            .url-box {
              word-break: break-all;
              color: #dc2626;
              background-color: #fef2f2;
              padding: 12px;
              border-radius: 6px;
              font-family: monospace;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="email-wrapper">
              <div class="header">
                <div class="logo-container">
                  <img src="https://i.postimg.cc/qBC1wDgj/Screenshot-2025-07-07-140806-1.jpg" alt="SmartNotes Logo" style="max-width: 200px; height: auto; display: block; margin: 0 auto;">
                </div>
                <h1 class="title">Password Reset Request</h1>
              </div>
              <div class="content">
                <p>Hello ${name},</p>
                <p>We received a request to reset your password for your SmartNotes account. Don't worry - this happens to the best of us!</p>
                <p>Click the button below to create a new password:</p>
                <div class="button-container">
                  <a href="${resetUrl}" class="button">🔐 Reset My Password</a>
                </div>
                <div class="warning">
                  <strong>⚠️ Security Notice:</strong> This reset link will expire in 10 minutes for your account's security.
                </div>
                <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
                <div class="url-box">${resetUrl}</div>
                <div style="margin-top: 24px; padding: 16px; background-color: #f8fafc; border-radius: 8px; border-left: 4px solid #3b82f6;">
                  <p style="margin: 0; font-size: 14px; color: #475569;">
                    <strong>🛡️ Security Tip:</strong> If you didn't request this password reset, you can safely ignore this email. Your account remains secure and no changes will be made.
                  </p>
                </div>
              </div>
              <div class="footer">
              <p>© 2024 SmartNotes. All rights reserved.</p>
              <p>This is an automated email, please do not reply.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      Password Reset Request - SmartNotes

      Hello ${name},

      We received a request to reset your password for your SmartNotes account. Don't worry - this happens to the best of us!

      Click the link below to create a new password:
      ${resetUrl}

      SECURITY NOTICE: This reset link will expire in 10 minutes for your account's security.

      SECURITY TIP: If you didn't request this password reset, you can safely ignore this email. Your account remains secure and no changes will be made.

      © 2024 SmartNotes. All rights reserved.
    `
  })
};

// Send verification email
export const sendVerificationEmail = async (email, name, token) => {
  try {
    const transporter = createTransporter();
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify-email?token=${token}`;
    const template = emailTemplates.verification(name, verificationUrl);

    const mailOptions = {
      from: `"SmartNotes" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: template.subject,
      text: template.text,
      html: template.html
    };

    const result = await transporter.sendMail(mailOptions);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    throw new Error('Failed to send verification email');
  }
};

// Send password reset email
export const sendPasswordResetEmail = async (email, name, token) => {
  try {
    const transporter = createTransporter();
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;
    const template = emailTemplates.passwordReset(name, resetUrl);

    const mailOptions = {
      from: `"SmartNotes" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: template.subject,
      text: template.text,
      html: template.html
    };

    const result = await transporter.sendMail(mailOptions);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error('Failed to send password reset email');
  }
};

// Test email configuration
export const testEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    return { success: true };
  } catch (error) {
    throw new Error('Email configuration is invalid');
  }
};
