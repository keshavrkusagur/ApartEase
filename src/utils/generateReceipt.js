/**
 * generateReceipt.js
 * Generates a styled PDF payment receipt using jsPDF (loaded from CDN via dynamic import).
 * No npm install needed — jsPDF is loaded on-demand when the user clicks Download.
 *
 * Usage:
 *   import { generateReceipt } from "../utils/generateReceipt";
 *   await generateReceipt({ payment, expenses, profile });
 */

const SOCIETY_NAME = "Siri Skanda Enclave";
const TOTAL_HOUSES = 24;

const CATEGORY_LABELS = {
  water: "Water",
  electricity: "Electricity",
  security: "Security",
  cleaning: "Cleaning",
  other: "Other",
};

function formatMonthLabel(monthStr) {
  if (!monthStr) return "";
  const [year, month] = monthStr.split("-");
  return new Date(year, month - 1).toLocaleString("default", {
    month: "long",
    year: "numeric",
  });
}

function formatCurrency(amount) {
  return (
    "Rs. " +
    Number(amount).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function generateReceiptNumber(payment) {
  // Deterministic receipt number from month + resident id
  const base = (payment.resident_id || "").slice(-6).toUpperCase();
  const monthCode = (payment.month || "").replace("-", "");
  return `SSE-${monthCode}-${base}`;
}

export async function generateReceipt({ payment, expenses, profile }) {
  // Dynamically load jsPDF from CDN — only loaded once, cached by browser
  if (!window.jspdf) {
    await new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src =
        "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const W = 210; // A4 width
  const margin = 18;
  const contentW = W - margin * 2;
  let y = 0;

  // ── Helpers ──────────────────────────────────────────────────────────────

  function setFont(style = "normal", size = 10) {
    doc.setFont("helvetica", style);
    doc.setFontSize(size);
  }

  function setColor(r, g, b) {
    doc.setTextColor(r, g, b);
  }

  function setDrawColor(r, g, b) {
    doc.setDrawColor(r, g, b);
  }

  function setFillColor(r, g, b) {
    doc.setFillColor(r, g, b);
  }

  function text(str, x, yPos, opts = {}) {
    doc.text(str, x, yPos, opts);
  }

  function line(x1, y1, x2, y2, lw = 0.3) {
    doc.setLineWidth(lw);
    doc.line(x1, y1, x2, y2);
  }

  function rect(x, rx, w, h, style = "F") {
    doc.rect(x, rx, w, h, style);
  }

  // ── Header Band ───────────────────────────────────────────────────────────
  y = 0;
  setFillColor(15, 15, 26); // dark bg matching app
  rect(0, 0, W, 42);

  // Society name
  setFont("bold", 18);
  setColor(255, 255, 255);
  text(SOCIETY_NAME, margin, 17);

  // Subtitle
  setFont("normal", 9);
  setColor(160, 160, 190);
  text("Resident Maintenance Receipt", margin, 25);

  // PAID badge (top right)
  setFillColor(16, 185, 129); // green
  rect(W - margin - 28, 8, 28, 10, "F");
  setFont("bold", 8);
  setColor(255, 255, 255);
  text("PAID", W - margin - 14, 14.5, { align: "center" });

  // Receipt number (top right below badge)
  setFont("normal", 7.5);
  setColor(130, 130, 160);
  text(generateReceiptNumber(payment), W - margin, 28, { align: "right" });

  y = 50;

  // ── Receipt Title Row ─────────────────────────────────────────────────────
  setFont("bold", 13);
  setColor(30, 30, 50);
  text("Payment Receipt", margin, y);

  setFont("normal", 9);
  setColor(110, 110, 130);
  text(formatMonthLabel(payment.month), W - margin, y, { align: "right" });

  y += 3;
  setDrawColor(220, 220, 235);
  line(margin, y, W - margin, y, 0.5);
  y += 8;

  // ── Two-column info block ─────────────────────────────────────────────────
  const col1x = margin;
  const col2x = W / 2 + 4;

  function infoRow(label, value, x, rowY) {
    setFont("normal", 8);
    setColor(130, 130, 150);
    text(label, x, rowY);
    setFont("bold", 9);
    setColor(30, 30, 50);
    text(value, x, rowY + 5);
  }

  infoRow("Resident Name", profile?.full_name || "—", col1x, y);
  infoRow("Flat Number", `Flat ${profile?.flat_number || "—"}`, col2x, y);
  y += 14;

  infoRow("Payment Month", formatMonthLabel(payment.month), col1x, y);
  infoRow("Paid On", formatDate(payment.paid_at), col2x, y);
  y += 14;

  infoRow(
    "Receipt Number",
    generateReceiptNumber(payment),
    col1x,
    y
  );
  infoRow("Total Houses", `${TOTAL_HOUSES} flats`, col2x, y);
  y += 10;

  setDrawColor(220, 220, 235);
  line(margin, y, W - margin, y, 0.5);
  y += 10;

  // ── Bill Breakdown Table ──────────────────────────────────────────────────
  setFont("bold", 9);
  setColor(80, 80, 100);
  text("BILL BREAKDOWN", margin, y);
  y += 6;

  // Table header
  setFillColor(245, 245, 252);
  rect(margin, y, contentW, 8, "F");

  setFont("bold", 8.5);
  setColor(80, 80, 110);
  text("Description", margin + 3, y + 5.5);
  text("Category", margin + 75, y + 5.5);
  text("Total Amount", margin + 118, y + 5.5);
  text("Your Share", W - margin - 3, y + 5.5, { align: "right" });
  y += 8;

  // Table rows
  const rowH = 9;
  let totalPerHouse = 0;
  let totalAmount = 0;

  expenses.forEach((exp, i) => {
    const isEven = i % 2 === 0;
    if (isEven) {
      setFillColor(251, 251, 255);
      rect(margin, y, contentW, rowH, "F");
    }

    setFont("normal", 8.5);
    setColor(30, 30, 50);
    text(exp.title || "—", margin + 3, y + 6);

    setFont("normal", 8);
    setColor(110, 110, 130);
    text(CATEGORY_LABELS[exp.category] || exp.category || "—", margin + 75, y + 6);

    setFont("normal", 8.5);
    setColor(60, 60, 80);
    text(formatCurrency(exp.total_amount || 0), margin + 118, y + 6);

    setFont("bold", 8.5);
    setColor(30, 30, 50);
    text(formatCurrency(exp.per_house_amount || 0), W - margin - 3, y + 6, {
      align: "right",
    });

    totalPerHouse += exp.per_house_amount || 0;
    totalAmount += exp.total_amount || 0;

    // thin bottom border on each row
    setDrawColor(235, 235, 245);
    line(margin, y + rowH, W - margin, y + rowH, 0.2);
    y += rowH;
  });

  y += 2;

  // Subtotal row
  setDrawColor(180, 180, 210);
  line(margin, y, W - margin, y, 0.5);
  y += 2;

  setFont("normal", 8.5);
  setColor(100, 100, 120);
  text("Total (all expenses)", margin + 3, y + 6);
  text(formatCurrency(totalAmount), margin + 118, y + 6);

  setFont("bold", 8.5);
  setColor(60, 60, 80);
  text(formatCurrency(totalPerHouse), W - margin - 3, y + 6, {
    align: "right",
  });
  y += 12;

  // ── Total Paid Banner ─────────────────────────────────────────────────────
  setFillColor(15, 15, 26);
  rect(margin, y, contentW, 16, "F");

  setFont("normal", 9);
  setColor(160, 160, 190);
  text("Amount Paid", margin + 6, y + 10);

  setFont("bold", 13);
  setColor(255, 255, 255);
  text(formatCurrency(payment.amount || totalPerHouse), W - margin - 6, y + 10, {
    align: "right",
  });
  y += 24;

  // ── Payment Details ───────────────────────────────────────────────────────
  setFillColor(240, 248, 245);
  rect(margin, y, contentW, 22, "F");

  setFont("bold", 8);
  setColor(16, 120, 80);
  text("✓  Payment confirmed", margin + 6, y + 7);

  setFont("normal", 8);
  setColor(60, 100, 80);
  text(
    `This receipt confirms that maintenance for ${formatMonthLabel(payment.month)} has been received.`,
    margin + 6,
    y + 14
  );
  text(
    `Date of payment: ${formatDate(payment.paid_at)}`,
    margin + 6,
    y + 20
  );
  y += 30;

  // ── Footer ────────────────────────────────────────────────────────────────
  setDrawColor(210, 210, 225);
  line(margin, y, W - margin, y, 0.3);
  y += 5;

  setFont("normal", 7.5);
  setColor(150, 150, 170);
  text(
    `${SOCIETY_NAME}  ·  Generated by ApartEase  ·  ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`,
    W / 2,
    y,
    { align: "center" }
  );
  y += 5;
  text(
    "This is a computer-generated receipt and does not require a physical signature.",
    W / 2,
    y,
    { align: "center" }
  );

  // ── Save ──────────────────────────────────────────────────────────────────
  const filename = `Receipt_Flat${profile?.flat_number}_${payment.month}.pdf`;
  doc.save(filename);
}
