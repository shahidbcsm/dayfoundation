import { jsPDF } from "jspdf";
import "jspdf-autotable";

export interface ReceiptData {
  name: string;
  email: string;
  phone: string;
  city: string;
  amount: number;
  txId: string;
  purpose: string;
  date?: string;
}

const loadImageAsBase64 = async (url: string): Promise<string | null> => {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.error(`Failed to load image as base64 from ${url}:`, err);
    return null;
  }
};

export const generateReceiptBase64 = async (data: ReceiptData): Promise<string> => {
  const currentDate = data.date || new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  // Fetch images first
  const sealBase64 = await loadImageAsBase64("/seal.jpg");
  const logoBase64 = await loadImageAsBase64("/footer-logo.png");

  // Page Dimensions: 210mm x 297mm
  const marginX = 15;
  let currentY = 20;

  // 1. Organization Header
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(26);
  doc.setTextColor(26, 26, 26); // #1a1a1a
  doc.text("BHTDAY WELFARE", marginX, currentY);
  currentY += 8;
  doc.text("FOUNDATION", marginX, currentY);

  // Right-aligned Meta details
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  
  // Draw Date line
  doc.text("Date", 130, 20);
  doc.setFont("Helvetica", "bold");
  doc.text(currentDate, 155, 20);
  doc.setLineWidth(0.2);
  doc.setDrawColor(187, 187, 187); // #bbbbbb
  doc.line(155, 21, 195, 21);

  // Draw Transaction ID line
  doc.setFont("Helvetica", "normal");
  doc.text("Transaction ID", 130, 26);
  doc.setFont("Courier", "bold");
  doc.text(data.txId, 155, 26);
  doc.line(155, 27, 195, 27);

  // Horizontal Divider Line below Header
  currentY += 8;
  doc.setLineWidth(0.4);
  doc.setDrawColor(26, 26, 26); // #1a1a1a
  doc.line(marginX, currentY, 195, currentY);

  // 2. Billed To Section
  currentY += 10;
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(26, 26, 26);
  doc.text("BILLED TO", marginX, currentY);

  currentY += 6;
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);

  const drawFieldLine = (label: string, val: string, y: number) => {
    doc.setFont("Helvetica", "normal");
    doc.text(label, marginX, y);
    doc.setFont("Helvetica", "bold");
    doc.setTextColor(26, 26, 26);
    doc.text(val, marginX + 25, y);
    doc.setTextColor(80, 80, 80);
  };

  drawFieldLine("Name:", data.name, currentY);
  currentY += 6;
  drawFieldLine("Purpose:", data.purpose, currentY);
  currentY += 6;
  drawFieldLine("Phone No.:", data.phone, currentY);
  currentY += 6;
  drawFieldLine("City:", data.city, currentY);

  // Line below Billed To
  currentY += 4;
  doc.setLineWidth(0.3);
  doc.setDrawColor(26, 26, 26);
  doc.line(marginX, currentY, 195, currentY);

  // 3. Payment Details Table
  currentY += 8;
  const tableHeaders = [["Payment Type", "Account/UPI NO.", "Description", "Amount", "Payment"]];
  const tableRows = [[
    "Online Payment",
    data.txId.substring(0, 14),
    "Donation Support",
    `Rs. ${data.amount}.00`,
    `Rs. ${data.amount}.00`
  ]];

  (doc as any).autoTable({
    startY: currentY,
    head: tableHeaders,
    body: tableRows,
    margin: { left: marginX, right: marginX },
    theme: "plain",
    styles: {
      fontSize: 10,
      textColor: [26, 26, 26],
      lineColor: [26, 26, 26],
      lineWidth: 0.3,
      cellPadding: 4,
      font: "Helvetica"
    },
    headStyles: {
      fontStyle: "bold",
      fillColor: [255, 255, 255],
      lineWidth: 0.3
    },
    columnStyles: {
      1: { font: "Courier" }
    }
  });

  currentY = (doc as any).lastAutoTable.finalY + 12;

  // 4. Seal placement (absolute bounds relative to currentY)
  if (sealBase64) {
    doc.addImage(sealBase64, "JPEG", 150, currentY - 5, 26, 26);
  }

  // 5. Remittance section
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(26, 26, 26);
  doc.text("Remittance", marginX, currentY);
  
  currentY += 2;
  doc.setLineWidth(0.2);
  doc.setDrawColor(160, 160, 160);
  doc.line(marginX, currentY, marginX + 65, currentY);

  currentY += 6;
  doc.setFontSize(10);
  doc.setTextColor(50, 50, 50);

  const drawRemitLine = (text: string, y: number) => {
    doc.text(text, marginX, y);
    doc.setLineWidth(0.1);
    doc.setDrawColor(187, 187, 187);
    doc.line(marginX, y + 1.5, marginX + 65, y + 1.5);
  };

  drawRemitLine(`Customer Name: ${data.name}`, currentY);
  currentY += 6;
  drawRemitLine(`Customer ID: ${data.email}`, currentY);
  currentY += 6;
  drawRemitLine(`Transaction no.: ${data.txId}`, currentY);
  currentY += 6;
  drawRemitLine(`Date: ${currentDate}`, currentY);
  currentY += 6;
  drawRemitLine(`Amount Enclosed: Rs. ${data.amount}.00`, currentY);

  // Signature / Regards Signoff on the right
  let signoffY = currentY - 24;
  doc.setFont("Helvetica", "normal");
  doc.text("Regards,", 170, signoffY);
  
  signoffY += 12;
  doc.setFont("Helvetica", "bold");
  doc.text("Khushali Tak", 170, signoffY);
  signoffY += 4;
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Head of Finance", 170, signoffY);
  signoffY += 4;
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(8);
  doc.text("BHTDAY WELFARE FOUNDATION", 155, signoffY);

  // Line below Remittance
  currentY += 8;
  doc.setLineWidth(0.2);
  doc.setDrawColor(160, 160, 160);
  doc.line(marginX, currentY, marginX + 65, currentY);

  // 6. Footer (placed strictly at the bottom)
  const footerY = 260;
  doc.setLineWidth(0.3);
  doc.setDrawColor(26, 26, 26);
  doc.line(marginX, footerY, 195, footerY);

  // Logo in bottom-left
  if (logoBase64) {
    doc.addImage(logoBase64, "PNG", marginX, footerY + 6, 20, 8);
  }

  // Address in footer
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(26, 26, 26);
  doc.text("Address:", marginX + 30, footerY + 8);
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80);
  doc.text("Patel Nagar, Adhartal, Ankita Parisar,", marginX + 30, footerY + 12);
  doc.text("Maharajpur, Jabalpur, MP 482004", marginX + 30, footerY + 16);

  // Phone / Email in footer right
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(8);
  doc.text("Phone: 8982144416", 160, footerY + 8);
  doc.text("Phone: 9251525127", 160, footerY + 12);
  doc.text("Email: info@dayfoundation.in", 160, footerY + 16);

  const pdfOutput = doc.output("datauristring");
  return pdfOutput.substring(pdfOutput.indexOf(",") + 1);
};
