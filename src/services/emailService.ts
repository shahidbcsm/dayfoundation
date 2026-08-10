
// Points to Vercel/local backend API
const API_URL = import.meta.env.DEV 
  ? "/api/send-email" 
  : "https://day2-livid-xi.vercel.app/api/send-email";

// Helper to make API post requests
export const triggerBackendMail = async (to: string, subject: string, html: string, attachments?: { filename: string; content: string; encoding?: string }[]) => {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ to, subject, html, attachments })
    });
    const resData = await response.json();
    if (!response.ok) {
      throw new Error(resData.error || "Unknown server response");
    }
    console.log("✅ Email sent successfully via secure SMTP backend:", resData);
  } catch (error) {
    console.error("❌ Failed to send SMTP backend email:", error);
  }
};

export const sendDonationReceipt = async (params: {
  donorEmail: string;
  donorName: string;
  amount: number;
  txId: string;
  purpose: string;
  pdfAttachment?: string; // base64 string
}) => {
  const subject = `Donation Confirmation - Thank You, ${params.donorName}!`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #0F4C81;">BHTDAY Welfare Foundation</h2>
      <p>Dear <strong>${params.donorName}</strong>,</p>
      <p>Thank you so much for your generous support! Your contribution has been safely received. Please find your official receipt attached to this email.</p>
      <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
      <h3 style="color: #fc4e1e;">Receipt Details Summary</h3>
      <table style="width: 100%; font-size: 14px;">
        <tr><td><strong>Donor Name:</strong></td><td>${params.donorName}</td></tr>
        <tr><td><strong>Amount Paid:</strong></td><td><strong>₹${params.amount}.00</strong></td></tr>
        <tr><td><strong>Transaction ID:</strong></td><td><code style="background-color: #f7f7f7; padding: 2px 6px; border-radius: 4px;">${params.txId}</code></td></tr>
        <tr><td><strong>Purpose:</strong></td><td>${params.purpose}</td></tr>
        <tr><td><strong>Date:</strong></td><td>${new Date().toLocaleDateString("en-IN")}</td></tr>
      </table>
      <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
      <p style="font-size: 12px; color: #666;">This is an automated receipt confirmation from DAY Foundation. If you have questions, please reach out to <a href="mailto:info@dayfoundation.in">info@dayfoundation.in</a>.</p>
    </div>
  `;
  const attachments = params.pdfAttachment ? [{
    filename: `Donation_Receipt_${params.txId}.pdf`,
    content: params.pdfAttachment,
    encoding: "base64"
  }] : undefined;

  await triggerBackendMail(params.donorEmail, subject, html, attachments);
};

// --- Gemini AI Content Generator ---
const generateGeminiEmailContent = async (prompt: string, fallbackHtml: string): Promise<string> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("⚠️ VITE_GEMINI_API_KEY is not defined. Falling back to default email template.");
    return fallbackHtml;
  }
  
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `${prompt}\n\nPlease generate a clean, responsive HTML email body (inside a styled div container, max-width 600px, font-family Arial/sans-serif). Use professional styling matching the colors of DAY Foundation (Primary color: #0F4C81, Secondary: #fc4e1e). Respond ONLY with the HTML code itself, without any markdown formatting tags (like \`\`\`html or \`\`\`).`
              }
            ]
          }
        ]
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text) {
      // Clean up markdown block format if Gemini returns it
      text = text.replace(/```html/gi, "").replace(/```/g, "").trim();
      return text;
    }
  } catch (error) {
    console.error("❌ Error generating content with Gemini:", error);
  }
  return fallbackHtml;
};

export const sendStatusUpdate = async (params: {
  email: string;
  name: string;
  type: "internship" | "volunteer";
  status: "approved" | "rejected";
  tempId?: string;
  permId?: string;
  adminComment?: string;
}) => {
  const isApproved = params.status === "approved";
  const subject = `${params.type.toUpperCase()} Application Update - DAY Foundation`;
  const fallbackHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #0F4C81;">DAY Foundation - Admission Board</h2>
      <p>Dear <strong>${params.name}</strong>,</p>
      <p>Thank you for your interest in DAY Foundation's Summer Initiatives.</p>
      <div style="padding: 15px; margin: 20px 0; border-radius: 6px; background-color: ${isApproved ? "#edf7ed" : "#fdeded"}; color: ${isApproved ? "#1e4620" : "#5f2120"};">
        <strong>Status: ${params.status.toUpperCase()}</strong>
      </div>
      ${isApproved 
        ? `<p>Congratulations! Your application has been approved. Below are your assignment credentials:</p>
           <table style="width: 100%; font-size: 14px; margin-bottom: 20px;">
             ${params.tempId ? `<tr><td><strong>Temporary App ID:</strong></td><td><code>${params.tempId}</code></td></tr>` : ""}
             ${params.permId ? `<tr><td><strong>Permanent Intern ID:</strong></td><td><strong style="color: #0F4C81;">${params.permId}</strong></td></tr>` : ""}
           </table>
           <p>Our Human Resources desk will reach out with the orientation link soon.</p>`
        : `<p>Unfortunately, we are unable to proceed with your application at this time due to high competition and limited slots. We thank you for your motivation and hope you apply again in future drives.</p>`
      }
      <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
      <p style="font-size: 12px; color: #666;">Regards,<br/><strong>HR Coordinator</strong><br/>BHTDAY Welfare Foundation</p>
    </div>
  `;

  const prompt = `Write a professional email response from BHTDAY Welfare Foundation to ${params.name} regarding their ${params.type} application (Ticket/Temp ID: ${params.tempId || "N/A"}). The status is ${params.status}. The admin has reviewed their application and added the following comments: '${params.adminComment || ""}'. Ensure the email is constructive. If rejected, provide encouraging advice and suggestions for improvement. If approved, outline the next steps and mention their permanent ID ${params.permId || "N/A"} if available.`;
  const html = await generateGeminiEmailContent(prompt, fallbackHtml);
  await triggerBackendMail(params.email, subject, html);
};

export const sendSubmissionConfirmation = async (params: {
  email: string;
  name: string;
  type: "internship" | "volunteer" | "contact";
  tempId?: string;
}) => {
  const subject = `Submission Received - DAY Foundation`;
  const fallbackHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #0F4C81;">DAY Foundation</h2>
      <p>Dear <strong>${params.name}</strong>,</p>
      <p>Thank you for submitting your details. We have successfully received your <strong>${params.type}</strong> submission.</p>
      <p>Our team will review this and will update you shortly.</p>
      ${params.tempId 
        ? `<div style="padding: 12px; margin: 20px 0; border: 2px dashed #0F4C81; border-radius: 6px; background-color: #f7fbfe; text-align: center;">
             <p style="margin: 0 0 6px 0; font-size: 12px; color: #666; text-transform: uppercase;">Your Ticket / Reference Number</p>
             <code style="font-size: 16px; font-weight: bold; color: #0F4C81;">${params.tempId}</code>
           </div>
           <p style="font-size: 13px;">Save this ticket number to check your status and remarks at the <a href="https://dayfoundation-ea9df.web.app/internship-status">Status Tracking Portal</a>.</p>`
        : ""
      }
      <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
      <p style="font-size: 12px; color: #666;">Regards,<br/><strong>Administrative Desk</strong><br/>DAY Foundation</p>
    </div>
  `;

  const prompt = `Write a warm greeting and thank you email from BHTDAY Welfare Foundation to ${params.name} for submitting a ${params.type} form. Acknowledge receipt of their details and tell them our team will review this and update them shortly. Mention their ticket number ${params.tempId || "N/A"} if available, explaining that they can use it to track their status.`;
  const html = await generateGeminiEmailContent(prompt, fallbackHtml);
  await triggerBackendMail(params.email, subject, html);
};

export const sendRecordUpdate = async (params: {
  email: string;
  name: string;
  type: "internship" | "volunteer" | "contact";
  ticketNo: string;
  status?: string;
  adminComment?: string;
  permId?: string;
  originalMessage?: string;
}) => {
  const isContact = params.type === 'contact';
  
  const subject = isContact
    ? `Response to your inquiry (Ticket: ${params.ticketNo}) - DAY Foundation`
    : `Update on your ${params.type === 'volunteer' ? 'Volunteer' : 'Internship'} Application (Ticket: ${params.ticketNo}) - DAY Foundation`;

  const fallbackHtml = isContact
    ? `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #0F4C81;">DAY Foundation</h2>
        <p>Dear <strong>${params.name}</strong>,</p>
        <p>Thank you for reaching out to us. Here is our response to your inquiry (Ticket: <strong>${params.ticketNo}</strong>):</p>
        
        ${params.adminComment ? `
          <div style="padding: 15px; margin: 20px 0; border-left: 4px solid #0F4C81; background-color: #f7fbfe; border-radius: 4px;">
            <p style="margin: 0; color: #333; line-height: 1.5; font-style: italic;">"${params.adminComment}"</p>
          </div>
        ` : ""}

        <p style="font-size: 11px; color: #888; margin-top: 25px; border-top: 1px dashed #e0e0e0; padding-top: 10px;">⚠️ Note: This email is autogenerated, so please don't reply here.</p>
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #666;">Regards,<br/><strong>Administrative Desk</strong><br/>DAY Foundation</p>
      </div>
    `
    : `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #0F4C81;">DAY Foundation</h2>
        <p>Dear <strong>${params.name}</strong>,</p>
        <p>There is a new update regarding your recent submission (Ticket: <strong>${params.ticketNo}</strong>).</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
          <tr style="border-bottom: 1px solid #eee;"><td style="padding: 10px 0; color: #666;"><strong>Submission Type:</strong></td><td style="padding: 10px 0; text-transform: capitalize;">${params.type}</td></tr>
          ${params.status ? `<tr style="border-bottom: 1px solid #eee;"><td style="padding: 10px 0; color: #666;"><strong>Current Status:</strong></td><td style="padding: 10px 0;"><span style="font-weight: bold; text-transform: uppercase;">${params.status}</span></td></tr>` : ""}
          ${params.permId ? `<tr style="border-bottom: 1px solid #eee;"><td style="padding: 10px 0; color: #666;"><strong>Permanent Intern ID:</strong></td><td style="padding: 10px 0;"><strong style="color: #0F4C81;">${params.permId}</strong></td></tr>` : ""}
        </table>

        ${params.adminComment ? `
          <div style="padding: 15px; margin: 20px 0; border-left: 4px solid #0F4C81; background-color: #f7fbfe; border-radius: 4px;">
            <p style="margin: 0 0 6px 0; font-size: 11px; text-transform: uppercase; color: #0F4C81; letter-spacing: 0.05em; font-weight: bold;">💬 Admin Remarks / Comments:</p>
            <p style="margin: 0; color: #333; line-height: 1.5; font-style: italic;">"${params.adminComment}"</p>
          </div>
        ` : ""}

        <p style="font-size: 13px; margin-top: 20px;">You can view the live status of your submission at any time on our <a href="https://dayfoundation-ea9df.web.app/internship-status">Status Tracking Portal</a> using your Ticket Number.</p>
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #666;">Regards,<br/><strong>Administrative Desk</strong><br/>DAY Foundation</p>
      </div>
    `;

  let prompt: string;
  if (isContact) {
    prompt = `Write a friendly, polite, and helpful email reply from BHTDAY Welfare Foundation to ${params.name} regarding their message/inquiry (Ticket: ${params.ticketNo}).
    Here is their original inquiry message: '${params.originalMessage || ""}'.
    Here is the admin's reply notes/feedback: '${params.adminComment || ""}'.
    Based on the admin's reply notes and general information about BHTDAY Welfare Foundation (which focuses on weekly education circles for underprivileged kids, employment/Rojgar programs, health drives, community development, team organization, etc.), write a simple, short, and clear answer to their message. Keep the tone warm, helpful, and direct, without using any application, HR, selection, onboarding, or admission language. At the bottom of the email, explicitly add the notice: "This email is autogenerated, so please don't reply here."`;
  } else {
    prompt = `Write a professional email update from BHTDAY Welfare Foundation to ${params.name} regarding their ${params.type} application (Ticket: ${params.ticketNo}). The current status is ${params.status || "N/A"}. The admin has reviewed their application and added the following comments: '${params.adminComment || ""}'. Ensure the email is constructive. If rejected, provide encouraging advice and suggestions for improvement. If approved, outline the next steps and mention their permanent ID ${params.permId || "N/A"} if available.`;
  }

  const html = await generateGeminiEmailContent(prompt, fallbackHtml);
  await triggerBackendMail(params.email, subject, html);
};

export const sendAdminNotification = async (
  formType: 'volunteer_application' | 'internship_application' | 'donation' | 'contact' | 'complaint' | 'monthly_report' | 'error_alert' | 'risk_alert' | 'data_deletion' | 'status_update' | 'comment_update',
  data: any
) => {
  // Discard status and comment updates as requested
  if (formType === 'status_update' || formType === 'comment_update') {
    return;
  }

  const subject = `[ADMIN NOTIFICATION] ${formType.replace('_', ' ').toUpperCase()} - DAY Hub Alert`;
  let detailsHtml = "";
  
  if (formType === 'donation') {
    detailsHtml = `
      <h3>New Donation Received</h3>
      <p><strong>Donor Name:</strong> ${data.donorName}</p>
      <p><strong>Email:</strong> ${data.donorEmail}</p>
      <p><strong>Amount:</strong> ₹${data.amount}</p>
      <p><strong>Purpose:</strong> ${data.purpose}</p>
      <p><strong>Transaction ID:</strong> ${data.transactionId}</p>
    `;
  } else if (formType === 'contact') {
    detailsHtml = `
      <h3>New Contact Message Received</h3>
      <p><strong>Name:</strong> ${data.name}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Subject:</strong> ${data.subject}</p>
      <p><strong>Message:</strong> ${data.message}</p>
      <p><strong>Ticket ID:</strong> ${data.ticketNo}</p>
    `;
  } else if (formType === 'complaint') {
    detailsHtml = `
      <h3>New Complaint Registered</h3>
      <p><strong>Name:</strong> ${data.name}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Phone:</strong> ${data.phone || 'N/A'}</p>
      <p><strong>Complaint Type:</strong> ${data.complaintType}</p>
      <p><strong>Membership ID:</strong> ${data.membershipId}</p>
      <p><strong>Issue Detail:</strong> ${data.issue}</p>
      <p><strong>Ticket ID:</strong> ${data.ticketNo}</p>
    `;
  } else if (formType === 'volunteer_application' || formType === 'internship_application') {
    detailsHtml = `
      <h3>New Application Submitted</h3>
      <p><strong>Type:</strong> ${data.type}</p>
      <p><strong>Name:</strong> ${data.name}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Phone:</strong> ${data.phone}</p>
      <p><strong>City:</strong> ${data.city}</p>
      <p><strong>Ticket ID:</strong> ${data.ticketNo}</p>
    `;
  } else if (formType === 'monthly_report') {
    detailsHtml = `
      <h3>DAY Monthly Operational Report</h3>
      <p><strong>Report Month:</strong> ${data.month}</p>
      <p><strong>Total Ingestion Donations:</strong> ₹${data.totalDonations}</p>
      <p><strong>New Volunteers Onboarded:</strong> ${data.newVolunteers}</p>
      <p><strong>New Internships Registered:</strong> ${data.newInterns}</p>
      <p><strong>Resolved Support Tickets:</strong> ${data.resolvedTickets}</p>
    `;
  } else if (formType === 'error_alert') {
    detailsHtml = `
      <h3>⚠️ Critical Website System Error</h3>
      <p><strong>Error Message:</strong> ${data.message}</p>
      <p><strong>Component/Service:</strong> ${data.component}</p>
      <p><strong>Stack Details:</strong> <code style="font-family: monospace; font-size: 11px;">${data.stack || 'N/A'}</code></p>
      <p><strong>User IP Session:</strong> ${data.ip || '127.0.0.1'}</p>
    `;
  } else if (formType === 'risk_alert') {
    detailsHtml = `
      <h3>🚨 Security & Risk Alert</h3>
      <p><strong>Risk Description:</strong> ${data.description}</p>
      <p><strong>Severity:</strong> <span style="color: #ff3e1d; font-weight: bold;">${data.severity}</span></p>
      <p><strong>Operator Email:</strong> ${data.operatorEmail || 'Anonymous'}</p>
      <p><strong>Device Info:</strong> ${data.device}</p>
    `;
  } else if (formType === 'data_deletion') {
    detailsHtml = `
      <h3>🗑️ Data Deletion Ejection Alert</h3>
      <p><strong>Deleted Record Type:</strong> ${data.recordType}</p>
      <p><strong>Record ID:</strong> <code style="font-family: monospace;">${data.recordId}</code></p>
      <p><strong>Deleted By Operator:</strong> ${data.operatorEmail}</p>
      <p><strong>Timestamp:</strong> ${data.timestamp}</p>
    `;
  }

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #fcfcfc;">
      <h2 style="color: #0F4C81; margin-top: 0;">DAY Foundation Admin Alert Desk</h2>
      <div style="padding: 15px; border-left: 4px solid #fc4e1e; background-color: #fff8f5; border-radius: 4px; margin-bottom: 20px;">
        ${detailsHtml}
      </div>
      <p style="font-size: 11px; color: #888;">This is an administrative system alert sent to shahidbcsm@gmail.com.</p>
    </div>
  `;

  await triggerBackendMail("shahidbcsm@gmail.com", subject, html);
};

