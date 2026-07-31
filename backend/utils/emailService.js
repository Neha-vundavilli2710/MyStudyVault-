import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendPasswordResetEmail = async (email, name, resetLink) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          line-height: 1.6;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background: #f9f9f9;
          border-radius: 8px;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #1B2A4A;
        }
        .logo span {
          color: #E8A93A;
        }
        .content {
          background: white;
          padding: 30px;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        .greeting {
          font-size: 18px;
          font-weight: 600;
          color: #1B2A4A;
          margin-bottom: 15px;
        }
        .message {
          color: #666;
          margin-bottom: 20px;
          font-size: 14px;
        }
        .button-container {
          text-align: center;
          margin: 30px 0;
        }
        .reset-button {
          background: #378ADD;
          color: white;
          padding: 12px 40px;
          border-radius: 6px;
          text-decoration: none;
          font-weight: 600;
          display: inline-block;
          margin: 10px 0;
        }
        .reset-button:hover {
          background: #2a6cb3;
        }
        .warning {
          background: #fff3cd;
          border: 1px solid #ffc107;
          padding: 12px;
          border-radius: 4px;
          margin: 20px 0;
          color: #856404;
          font-size: 13px;
        }
        .footer {
          text-align: center;
          color: #999;
          font-size: 12px;
          margin-top: 20px;
        }
        .divider {
          border-top: 1px solid #eee;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">My<span>StudyVault</span></div>
        </div>

        <div class="content">
          <div class="greeting">Hello ${name},</div>

          <div class="message">
            We received a request to reset your password for your MyStudyVault account. 
            If you did not make this request, you can safely ignore this email.
          </div>

          <div class="button-container">
            <a href="${resetLink}" class="reset-button">Reset Password</a>
          </div>

          <div class="message">
            Or copy this link if the button doesn't work:
            <br><br>
            <code style="background: #f5f5f5; padding: 8px 12px; border-radius: 4px; display: block; word-break: break-all; font-size: 12px;">
              ${resetLink}
            </code>
          </div>

          <div class="warning">
            ⏱️ This link will expire in 30 minutes. If you need another reset link, please request a new password reset.
          </div>

          <div class="divider"></div>

          <div class="message" style="color: #999; font-size: 12px;">
            If you have any questions, please contact our support team. 
            <br>This is an automated email, please do not reply to this message.
          </div>
        </div>

        <div class="footer">
          <p>&copy; 2026 MyStudyVault. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Request - MyStudyVault',
      html: htmlContent,
    });
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error('Failed to send reset email');
  }
};

export default transporter;