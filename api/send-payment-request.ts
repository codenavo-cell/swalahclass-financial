import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

let cachedTestAccount: any = null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    const {
      studentEmail,
      studentName,
      studentRoll,
      amountDue,
      currencySymbol = '₹',
      deadline,
      className,
      institutionName,
      teacherName,
      campaignTitle = 'Class Contribution',
    } = req.body || {};

    const targetRecipient = process.env.TO_EMAIL || studentEmail || 'IRSHAD NIRS <irshadmnkd@gmail.com>';

    if (!targetRecipient || typeof targetRecipient !== 'string' || !targetRecipient.trim()) {
      return res.status(400).json({
        success: false,
        error: 'The selected student does not have a registered email address.',
      });
    }

    let rawHost = (process.env.SMTP_HOST || '').trim();
    let smtpHost = 'smtp.gmail.com';
    if (rawHost && !/^\d+$/.test(rawHost) && rawHost.includes('.')) {
      smtpHost = rawHost;
    }
    const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
    const smtpUser = process.env.SMTP_USER || 'codenavo@gmail.com';
    const smtpPass = process.env.SMTP_PASS || '301thwalha1';
    const institution = institutionName || 'Noorul Huda Islamic Academy';
    const cleanInstName = institution.toLowerCase().replace(/[^a-z0-9]/g, '');
    const fromEmail =
      process.env.FROM_EMAIL ||
      `"Class ${className || 'Swalah'} Finance" <${smtpUser || 'noreply@' + cleanInstName + '.edu'}>`;

    let transporter: any = null;

    if (smtpHost && smtpUser && smtpPass) {
      try {
        const testTransporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: smtpPort === 465,
          connectionTimeout: 4000,
          greetingTimeout: 4000,
          socketTimeout: 4000,
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        });
        await testTransporter.verify();
        transporter = testTransporter;
      } catch (authErr: any) {
        console.warn('SMTP verify error:', authErr.message);
      }
    }

    if (!transporter) {
      if (!cachedTestAccount) {
        cachedTestAccount = await Promise.race([
          nodemailer.createTestAccount(),
          new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000)),
        ]).catch(() => null);
      }

      if (cachedTestAccount) {
        transporter = nodemailer.createTransport({
          host: cachedTestAccount.smtp.host,
          port: cachedTestAccount.smtp.port,
          secure: cachedTestAccount.smtp.secure,
          auth: {
            user: cachedTestAccount.user,
            pass: cachedTestAccount.pass,
          },
        });
      } else {
        transporter = nodemailer.createTransport({
          jsonTransport: true,
        });
      }
    }

    const formattedAmount = `${currencySymbol}${Number(amountDue).toLocaleString()}`;
    const emailSubject = `Payment Reminder: ${campaignTitle} - Class ${className || 'Swalah'} (${formattedAmount})`;

    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${emailSubject}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b;">
        <div style="max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
          <div style="background: linear-gradient(135deg, #1e3a8a, #312e81); padding: 28px 24px; color: #ffffff; text-align: center;">
            <h1 style="margin: 0; font-size: 20px; font-weight: 800;">${institution}</h1>
            <p style="margin: 6px 0 0; font-size: 13px; color: #bfdbfe;">Class ${className || 'Swalah'} Financial Hub</p>
          </div>
          <div style="padding: 28px 24px;">
            <h2 style="font-size: 16px; font-weight: 700; color: #0f172a; margin: 0 0 12px;">Assalamu Alaikum, ${studentName || 'Student'}${studentRoll ? ` (Roll #${studentRoll})` : ''}</h2>
            <p style="font-size: 13.5px; color: #475569; line-height: 1.5; margin: 0 0 20px;">
              This is an official payment reminder regarding the pending class contribution:
            </p>
            <div style="background: #f1f5f9; border-radius: 12px; padding: 20px; margin: 20px 0; border: 1px solid #cbd5e1;">
              <p style="margin: 0; font-size: 11px; text-transform: uppercase; font-weight: 700; color: #64748b;">Amount Due</p>
              <p style="margin: 4px 0 12px; font-size: 24px; font-weight: 900; color: #1e3a8a;">${formattedAmount}</p>
              <p style="margin: 0; font-size: 13px; color: #334155;"><strong>Purpose:</strong> ${campaignTitle}</p>
              <p style="margin: 4px 0 0; font-size: 13px; color: #b45309; font-weight: 700;"><strong>Due Date:</strong> ${deadline || '30 September 2026'}</p>
            </div>
            <p style="font-size: 13px; color: #64748b; margin: 20px 0 0; line-height: 1.5;">
              Please submit via Cash or UPI to the Class Finance Admin.<br/>
              <strong>Teacher:</strong> ${teacherName || 'Irshad Al Hudawi'}
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const sendResult = await transporter.sendMail({
      from: fromEmail,
      to: targetRecipient.trim(),
      subject: emailSubject,
      text: `Payment Reminder: ${campaignTitle}\nAmount Due: ${formattedAmount}\nDeadline: ${deadline}\nClass: ${className}\nInstitution: ${institution}`,
      html: htmlBody,
    });

    const previewUrl = nodemailer.getTestMessageUrl(sendResult);

    return res.status(200).json({
      success: true,
      message: 'Payment request email sent successfully',
      messageId: sendResult.messageId,
      previewUrl: previewUrl || undefined,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to send payment request email.',
    });
  }
}
