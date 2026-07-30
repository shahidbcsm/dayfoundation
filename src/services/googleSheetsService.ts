
export interface CandidateSheetDetails {
  type: "volunteer" | "internship";
  ticketNo: string;
  permanentInternshipId?: string;
  permanentVolunteerId?: string;
  name: string;
  email: string;
  phone: string;
  phoneWhatsapp?: string;
  city: string;
  age?: string | number;
  dob?: string;
  fatherName?: string;
  motherName?: string;
  aadharNumber?: string;
  preferredMode?: string; // volunteer mode
  internshipMode?: string; // internship mode
  college?: string;
  course?: string;
  year?: string;
  department?: string;
  motivation?: string;
  status: "pending" | "approved" | "rejected" | "hold";
  adminComment?: string;
}

export interface DonationSheetDetails {
  donorName: string;
  donorEmail: string;
  donorPhone: string;
  amount: number;
  purpose: string;
  transactionId: string;
  status: "success" | "pending";
  city?: string;
  internName?: string;
  internId?: string;
  donorType?: string;
  billingAddress?: string;
  message?: string;
  isAnonymous?: boolean;
}

/**
 * Sends candidate application details to the Google Sheets Apps Script Web App.
 */
export const syncWithGoogleSheets = async (details: CandidateSheetDetails): Promise<boolean> => {
  const webAppUrl = import.meta.env.VITE_GOOGLE_SHEETS_WEB_APP_URL;
  if (!webAppUrl) {
    console.warn("⚠️ VITE_GOOGLE_SHEETS_WEB_APP_URL is not set. Google Sheets syncing is skipped.");
    return false;
  }

  try {
    const payload = {
      action: "candidate",
      timestamp: new Date().toISOString(),
      type: details.type,
      ticketNo: details.ticketNo,
      permanentId: details.permanentInternshipId || "",
      name: details.name,
      email: details.email,
      phone: details.phone,
      whatsapp: details.phoneWhatsapp || details.phone || "",
      city: details.city,
      age: details.age || "",
      dob: details.dob || "",
      fatherName: details.fatherName || "",
      motherName: details.motherName || "",
      aadharNumber: details.aadharNumber || "",
      mode: details.internshipMode || details.preferredMode || "",
      collegeDetails: details.college ? `${details.college} (Course: ${details.course || ""}, Year: ${details.year || ""})` : "",
      courseDept: details.department || details.course || "",
      motivation: details.motivation || "",
      status: details.status,
      adminComment: details.adminComment || ""
    };

    console.log(`📤 Syncing candidate [${details.name}] status [${details.status}] with Google Sheets...`);

    await fetch(webAppUrl, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    return true;
  } catch (err) {
    console.error("❌ Failed to sync candidate with Google Sheets:", err);
    return false;
  }
};

/**
 * Sends donation ledger records to the Google Sheets Apps Script Web App.
 */
export const syncDonationWithSheets = async (details: DonationSheetDetails): Promise<boolean> => {
  const webAppUrl = import.meta.env.VITE_GOOGLE_SHEETS_WEB_APP_URL;
  if (!webAppUrl) {
    console.warn("⚠️ VITE_GOOGLE_SHEETS_WEB_APP_URL is not set. Google Sheets donation syncing is skipped.");
    return false;
  }

  try {
    const payload = {
      action: "donation",
      timestamp: new Date().toISOString(),
      donorName: details.isAnonymous ? "Anonymous" : details.donorName,
      donorEmail: details.isAnonymous ? "N/A" : details.donorEmail,
      donorPhone: details.isAnonymous ? "N/A" : details.donorPhone,
      amount: details.amount,
      purpose: details.purpose,
      transactionId: details.transactionId,
      city: details.city || "",
      internName: details.internName || "",
      internId: details.internId || "",
      donorType: details.donorType || "",
      billingAddress: details.billingAddress || "",
      message: details.message || "",
      status: details.status
    };

    console.log(`📤 Syncing donation of ₹${details.amount} with Google Sheets...`);

    await fetch(webAppUrl, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    return true;
  } catch (err) {
    console.error("❌ Failed to sync donation with Google Sheets:", err);
    return false;
  }
};

/*
========================================================================
GOOGLE APPS SCRIPT CODE (Paste this inside your Google Sheet Apps Script)
========================================================================

1. Open a new Google Sheet.
2. Go to "Extensions" > "Apps Script".
3. Delete any default code and paste the code below:

```javascript
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet();
    
    // Check Action
    if (data.action === "donation") {
      var donationSheet = getOrCreateDonationsSheet(sheet);
      donationSheet.appendRow([
        new Date().toLocaleString(),
        data.donorName || "",
        data.donorEmail || "",
        data.donorPhone || "",
        data.amount || "",
        data.purpose || "",
        data.transactionId || "",
        data.city || "",
        data.internName || "",
        data.internId || "",
        data.donorType || "",
        data.billingAddress || "",
        data.message || "",
        data.status || ""
      ]);
      
      return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Otherwise it's candidate action (Volunteer / Internship)
    var pendingSheet = getOrCreateSheet(sheet, "Pending");
    var approvedSheet = getOrCreateSheet(sheet, "Approved");
    var rejectedSheet = getOrCreateSheet(sheet, "Rejected");
    
    // Clear any existing record of this candidate from all sheets to prevent duplicates
    removeCandidateRow(pendingSheet, data.ticketNo, data.email);
    removeCandidateRow(approvedSheet, data.ticketNo, data.email);
    removeCandidateRow(rejectedSheet, data.ticketNo, data.email);
    
    // Determine target sheet based on status
    var targetSheet;
    var status = (data.status || "pending").toLowerCase();
    if (status === "approved") {
      targetSheet = approvedSheet;
    } else if (status === "rejected") {
      targetSheet = rejectedSheet;
    } else {
      targetSheet = pendingSheet; // Pending / Hold
    }
    
    // Append the candidate row
    targetSheet.appendRow([
      new Date().toLocaleString(),
      data.type || "",
      data.ticketNo || "",
      data.permanentId || "",
      data.name || "",
      data.email || "",
      data.phone || "",
      data.whatsapp || "",
      data.city || "",
      data.age || "",
      data.dob || "",
      data.fatherName || "",
      data.motherName || "",
      data.aadharNumber || "",
      data.mode || "",
      data.collegeDetails || "",
      data.courseDept || "",
      data.motivation || "",
      data.status || "",
      data.adminComment || ""
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getOrCreateDonationsSheet(spreadsheet) {
  var sheet = spreadsheet.getSheetByName("Donations");
  if (!sheet) {
    sheet = spreadsheet.insertSheet("Donations");
    sheet.appendRow([
      "Timestamp",
      "Donor Name",
      "Email",
      "Phone",
      "Amount",
      "Purpose",
      "Transaction ID",
      "City",
      "Intern Name",
      "Intern ID",
      "Donor Type",
      "Billing Address",
      "Message",
      "Status"
    ]);
    // Format headers with brand color
    sheet.getRange("A1:N1").setFontWeight("bold").setBackground("#FC4E1E").setFontColor("#FFFFFF");
  }
  return sheet;
}

function getOrCreateSheet(spreadsheet, name) {
  var sheet = spreadsheet.getSheetByName(name);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(name);
    // Add Headers
    sheet.appendRow([
      "Timestamp",
      "Type",
      "Ticket Number",
      "Permanent ID",
      "Name",
      "Email",
      "Phone",
      "WhatsApp",
      "City",
      "Age",
      "DOB",
      "Father Name",
      "Mother Name",
      "Aadhar Number",
      "Preferred/Internship Mode",
      "College/Details",
      "Course/Dept",
      "Motivation",
      "Status",
      "Admin Comments"
    ]);
    // Format headers with brand color
    sheet.getRange("A1:T1").setFontWeight("bold").setBackground("#0F4C81").setFontColor("#FFFFFF");
  }
  return sheet;
}

function removeCandidateRow(sheet, ticketNo, email) {
  var data = sheet.getDataRange().getValues();
  // Loop backwards to safely delete matching rows
  for (var i = data.length - 1; i >= 1; i--) {
    var rowTicket = data[i][2]; // Column C (Ticket Number)
    var rowEmail = data[i][5];  // Column F (Email - shifted because of Permanent ID column)
    
    if ((ticketNo && rowTicket === ticketNo) || (email && rowEmail === email)) {
      sheet.deleteRow(i + 1);
    }
  }
}
```

4. Click the "Save" icon (Floppy disk).
5. Click "Deploy" > "New deployment".
6. Select type "Web app".
7. Description: "DAY Foundation Google Sheets Web App Proxy"
8. Execute as: "Me"
9. Who has access: "Anyone" (crucial so that the website can POST to it).
10. Click "Deploy", authorize permissions, copy the "Web app URL", and add it to your .env file as VITE_GOOGLE_SHEETS_WEB_APP_URL.
*/
