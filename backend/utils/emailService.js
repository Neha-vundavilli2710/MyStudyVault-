import dotenv from 'dotenv';
dotenv.config();
import nodemailer from "nodemailer";


if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
  throw new Error("EMAIL_USER or EMAIL_PASSWORD not configured");
}

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});


// Verify connection
transporter.verify((error) => {
  if (error) {
    console.error(error);
  } else {
    console.log("✅ Email service ready");
  }
});

export const sendPasswordResetEmail = async (email, name, resetLink) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.error('❌ EMAIL_USER or EMAIL_PASSWORD not configured');
    throw new Error('Email service not configured');
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; border-radius: 8px; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; color: #1B2A4A; }
        .logo span { color: #E8A93A; }
        .content { background: white; padding: 30px; border-radius: 8px; margin-bottom: 20px; }
        .greeting { font-size: 18px; font-weight: 600; color: #1B2A4A; margin-bottom: 15px; }
        .message { color: #666; margin-bottom: 20px; font-size: 14px; }
        .reset-button { background: #378ADD; color: white; padding: 12px 40px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block; margin: 20px 0; }
        .warning { background: #fff3cd; border: 1px solid #ffc107; padding: 12px; border-radius: 4px; margin: 20px 0; color: #856404; font-size: 13px; }
        .footer { text-align: center; color: #999; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header"><div class="logo">My<span>StudyVault</span></div></div>
        <div class="content">
          <div class="greeting">Hello ${name},</div>
          <div class="message">We received a request to reset your password. Click the button below to set a new password.</div>
          <div style="text-align: center;"><a href="${resetLink}" class="reset-button">Reset Password</a></div>
          <div class="message">Or copy: <code style="background: #f5f5f5; padding: 4px;">${resetLink}</code></div>
          <div class="warning">⏱️ Link expires in 30 minutes.</div>
          <div class="footer"><p>&copy; 2026 MyStudyVault</p></div>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    
    
    await transporter.sendMail({
  from: `MyStudyVault <${process.env.EMAIL_USER}>`,
  to: email,
  subject: 'Password Reset - MyStudyVault',
  html: htmlContent,
});

    
    return true;
  } catch (error) {
  console.error("Email Error:", error.message);
  throw error;
}
};

export default transporter;