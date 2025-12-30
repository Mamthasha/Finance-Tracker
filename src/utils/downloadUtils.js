// utils/downloadUtils.js
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell } from "docx";
import { saveAs } from "file-saver";

/** Download CSV file */
export function downloadCSV(transactions) {
  if (!transactions || transactions.length === 0) return;

  const headers = ["S.No", "Date", "Transaction Name", "Type", "Category", "Amount"];
  const rows = transactions.map((t, i) => {
    const d = new Date(t.date);
    const fd = d.toLocaleDateString("en-US");
    const ft = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

    return [
      i + 1,
      `${fd} ${ft}`,
      t.title,
      t.type,
      t.category,
      t.amount
    ];
  });

  let csvContent =
    "data:text/csv;charset=utf-8," +
    [headers.join(","), ...rows.map(r => r.join(","))].join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "transactions.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/** Download Word file with styling for income/expense */
export function downloadWord(transactions) {
  if (!transactions || transactions.length === 0) return;

  const rows = transactions.map((t, i) => {
    const isIncome = t.type === "income";

    const d = new Date(t.date);
    const fd = d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    const ft = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

    return new TableRow({
      children: [
        new TableCell({ children: [new Paragraph(`${i + 1}`)] }), // S.No
        new TableCell({ children: [new Paragraph(`${fd} ${ft}`)] }), // Date
        new TableCell({ children: [new Paragraph(t.title)] }), // Transaction Name
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: isIncome ? "Income" : "Expense",
                  bold: true,
                  color: isIncome ? "00AA00" : "FF0000",
                }),
              ],
            }),
          ],
          shading: { fill: isIncome ? "CCFFCC" : "FFCCCC" }, // Background
        }),
        new TableCell({ children: [new Paragraph(t.category)] }),
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: `${isIncome ? "+" : "-"}₹${t.amount.toLocaleString()}`,
                  bold: true,
                  color: isIncome ? "008000" : "FF0000",
                }),
              ],
            }),
          ],
        }),
      ],
    });
  });

  const headerRow = new TableRow({
    children: [
      new TableCell({ children: [new Paragraph("S.No")] }),
      new TableCell({ children: [new Paragraph("Date")] }),
      new TableCell({ children: [new Paragraph("Transaction Name")] }),
      new TableCell({ children: [new Paragraph("Type")] }),
      new TableCell({ children: [new Paragraph("Category")] }),
      new TableCell({ children: [new Paragraph("Amount")] }),
    ],
  });

  const table = new Table({
    rows: [headerRow, ...rows],
    width: { size: 100, type: "pct" },
  });

  const doc = new Document({
    sections: [{ children: [table] }],
  });

  Packer.toBlob(doc).then((blob) => {
    saveAs(blob, "transactions.docx");
  });
}
