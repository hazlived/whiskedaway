const { Resend } = require('resend');
const nodemailer = require('nodemailer');

let resendClient = null;
let testAccountTransporter = null;

const getResendClient = () => {
  if (!resendClient && process.env.RESEND_API_KEY) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
};

// Send Email Core
const sendEmail = async ({ to, subject, text, html }) => {
  const from = process.env.RESEND_FROM || process.env.SMTP_FROM || 'WhiskedAway <onboarding@resend.dev>';

  // 1. Try Resend API if RESEND_API_KEY is configured
    const resend = getResendClient();
    if (resend) {
      try {
        const response = await resend.emails.send({
          from,
          to: Array.isArray(to) ? to : [to],
          subject,
          text,
          html
        });
        const resendId = response.data?.id || response.id || 'sent';
        console.log(`\n[RESEND API EMAIL DISPATCHED] ID: ${resendId} | To: ${to} | Subject: ${subject}\n`);
        return { success: true, id: resendId, provider: 'resend' };
      } catch (err) {
        console.error('[RESEND API ERROR]', err.message);
      }
    }

  // 2. Nodemailer Ethereal test account fallback for dev
  try {
    if (!testAccountTransporter) {
      const testAccount = await nodemailer.createTestAccount();
      testAccountTransporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: { user: testAccount.user, pass: testAccount.pass }
      });
    }

    const info = await testAccountTransporter.sendMail({ from, to, subject, text, html });
    const previewUrl = nodemailer.getTestMessageUrl(info);

    console.log('\n=================== [EMAIL DISPATCHED via ETHEREAL] ===================');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    if (previewUrl) {
      console.log(`Live Email Preview URL: ${previewUrl}`);
    }
    console.log('=======================================================================\n');

    return { success: true, messageId: info.messageId, previewUrl, provider: 'ethereal' };
  } catch (err) {
    console.log('\n------------------- [EMAIL DEV CONSOLE LOG] -------------------');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Text Body:\n${text}`);
    console.log('----------------------------------------------------------------\n');
    return { success: true, provider: 'console' };
  }
};

// Brand HTML Template for OTP Code
const getOTPCodeHTML = (title, messageIntro, code, expiryText) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Plus Jakarta Sans', Arial, sans-serif; background-color: #FAF8F5; color: #111111; margin: 0; padding: 20px; }
        .email-container { max-width: 500px; margin: 0 auto; background: #FFFFFF; border: 3px solid #111111; border-radius: 16px; padding: 28px; box-shadow: 6px 6px 0px #111111; text-align: center; }
        .brand-title { font-size: 24px; font-weight: 800; color: #111111; margin-bottom: 20px; border-bottom: 2px solid #111111; padding-bottom: 12px; }
        .brand-title span { color: #F25C05; }
        .otp-box { background-color: #FFF0E6; border: 2.5px solid #111111; border-radius: 12px; padding: 18px 24px; font-size: 36px; font-weight: 800; letter-spacing: 10px; color: #F25C05; margin: 24px 0; box-shadow: 3px 3px 0px #111111; display: inline-block; }
        .expiry-text { font-size: 13px; color: #666666; font-weight: 600; }
        .footer-note { font-size: 12px; color: #888888; border-top: 1px solid #E8E2D6; padding-top: 16px; margin-top: 24px; }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="brand-title">whisked<span>away</span></div>
        <h2 style="font-size: 20px; font-weight: 700; margin-top: 0;">${title}</h2>
        <p style="font-size: 15px; color: #333333; margin-bottom: 10px;">${messageIntro}</p>

        <div class="otp-box">${code}</div>

        <p class="expiry-text">This one-time passcode expires in ${expiryText}.</p>
        <div class="footer-note">
          WhiskedAway - Turn pantry ingredients into delicious meals.<br>
          If you did not request this code, please safely ignore this email.
        </div>
      </div>
    </body>
    </html>
  `;
};

// 1. Email Verification 6-Digit Code
const sendVerificationCode = async (email, code) => {
  const html = getOTPCodeHTML(
    'Verify Your Email Address',
    'Enter the 6-digit passcode below on the verification page to complete your registration:',
    code,
    '30 minutes'
  );

  console.log(`\n>>> [VERIFICATION CODE FOR ${email}]: ${code} <<<\n`);

  return sendEmail({
    to: email,
    subject: `Your WhiskedAway Verification Code: ${code}`,
    text: `Your WhiskedAway email verification passcode is: ${code}\n\nThis code expires in 30 minutes.`,
    html
  });
};

// 2. Password Reset 6-Digit Code
const sendPasswordResetCode = async (email, code) => {
  const html = getOTPCodeHTML(
    'Reset Your Password',
    'Enter the 6-digit passcode below to unlock the password reset page:',
    code,
    '15 minutes'
  );

  console.log(`\n>>> [PASSWORD RESET CODE FOR ${email}]: ${code} <<<\n`);

  return sendEmail({
    to: email,
    subject: `Your WhiskedAway Password Reset Code: ${code}`,
    text: `Your WhiskedAway password reset passcode is: ${code}\n\nThis code expires in 15 minutes.`,
    html
  });
};

// 3. Email Change 6-Digit Code
const sendEmailChangeCode = async (newEmail, code) => {
  const html = getOTPCodeHTML(
    'Confirm Your New Email Address',
    'Enter the 6-digit passcode below to confirm your new email address:',
    code,
    '30 minutes'
  );

  console.log(`\n>>> [EMAIL CHANGE CODE FOR ${newEmail}]: ${code} <<<\n`);

  return sendEmail({
    to: newEmail,
    subject: `Your WhiskedAway Email Change Code: ${code}`,
    text: `Your WhiskedAway email change passcode is: ${code}\n\nThis code expires in 30 minutes.`,
    html
  });
};

module.exports = {
  sendEmail,
  sendVerificationCode,
  sendPasswordResetCode,
  sendEmailChangeCode
};
