/* api/send-email.js */
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Microsoft 365 SMTP (works with info@dayfoundation.in Outlook/Teams account)
const transporter = nodemailer.createTransport({
  host: "smtp.office365.com",
  port: 587,
  secure: false, // STARTTLS
  auth: {
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || ""
  },
  tls: {
    ciphers: "SSLv3",
    rejectUnauthorized: false
  }
});

export default async function handler(req, res) {
  // Set CORS headers manually
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { to, subject, html, text, attachments } = req.body;

  if (!to || !subject || (!html && !text)) {
    return res.status(400).json({ error: "Missing required fields: to, subject, html/text" });
  }

  try {
    const mailOptions = {
      from: `"DAY Foundation" <${process.env.SMTP_USER || ""}>`,
      to,
      subject,
      text: text || "",
      html: html || "",
      attachments: attachments || []
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Message sent: %s", info.messageId);

    return res.status(200).json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error("Error sending email:", error);
    return res.status(500).json({ error: "Failed to send email: " + error.message });
  }
}
