import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import * as XLSX from "xlsx"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function exportToExcel(data: any[], summary: any, filename: string = "Processed_Invoices.xlsx") {
  // Create a new workbook
  const wb = XLSX.utils.book_new();

  // Create a worksheet for the items
  const wsItems = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, wsItems, "Line Items");

  // Create a worksheet for the summary if we have it
  if (summary) {
    const summaryData = [
      { Metric: "Total Items", Value: summary.totalItems },
      { Metric: "Matched", Value: summary.matched },
      { Metric: "Unmatched", Value: summary.unmatched },
      { Metric: "Threshold", Value: summary.threshold },
      { Metric: "GST Rate", Value: summary.gstRate },
      { Metric: "Total Invoice Amount", Value: summary.totalInvoiceAmount },
      { Metric: "Total System Before GST", Value: summary.totalSystemBeforeGST },
      { Metric: "Total System With GST", Value: summary.totalSystemWithGST },
      { Metric: "Total Difference", Value: summary.totalDifference },
    ];
    const wsSummary = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");
  }

  // Trigger download
  XLSX.writeFile(wb, filename);
}

export function downloadBase64Excel(base64: string, filename: string = "Processed_Invoices.xlsx") {
  const link = document.createElement('a');
  link.href = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${base64}`;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function parseSummaryFromExcel(base64: string): any[][] | null {
  try {
    const workbook = XLSX.read(base64, { type: 'base64' });
    const summarySheet = workbook.Sheets['Summary'];
    if (!summarySheet) return null;
    // Return array of arrays, keeping empty cells
    return XLSX.utils.sheet_to_json(summarySheet, { header: 1, defval: "" });
  } catch (error) {
    console.error("Error parsing Excel summary:", error);
    return null;
  }
}
