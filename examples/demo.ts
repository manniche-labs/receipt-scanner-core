/**
 * @file demo.ts
 * @description Runnable demo that parses all mock receipts and prints a structured report.
 * No Vision AI API keys required — uses bundled mock data.
 *
 * Run with: npx tsx examples/demo.ts
 */

import { parseReceiptResponse, formatCurrency } from "../src/index.js";
import {
  MOCK_LIDL_JSON,
  MOCK_REWE_JSON,
  MOCK_FOETEX_JSON,
  MOCK_NETTO_DK_JSON,
} from "./mock-receipts.js";

const MOCKS = [
  { label: "🇩🇪 Lidl München", json: MOCK_LIDL_JSON },
  { label: "🇩🇪 Rewe München", json: MOCK_REWE_JSON },
  { label: "🇩🇰 Føtex Nørresundby", json: MOCK_FOETEX_JSON },
  { label: "🇩🇰 Netto Aalborg", json: MOCK_NETTO_DK_JSON },
];

console.log("\n╔══════════════════════════════════════════════════════════╗");
console.log("║     receipt-scanner-core — European Receipt Parser Demo ║");
console.log("╚══════════════════════════════════════════════════════════╝\n");

for (const { label, json } of MOCKS) {
  const result = parseReceiptResponse(json, label);

  console.log(`─── ${label} ${"─".repeat(Math.max(0, 48 - label.length))}`);

  if (!result.success || !result.receipt) {
    console.log(`  ❌ Parse errors: ${result.errors.join(", ")}\n`);
    continue;
  }

  const r = result.receipt;
  const total = formatCurrency(r.total, r.currency);
  const taxSummary = r.taxBreakdown
    .map((t) => `${t.label}(${t.rate}%): ${formatCurrency(t.tax, r.currency)}`)
    .join(" | ");

  console.log(`  🏪 Store:    ${r.merchant.rawName} [${r.merchant.chain}] ${r.merchant.country}`);
  console.log(`  📅 Date:     ${r.date ?? "unknown"} ${r.time ? "at " + r.time : ""}`);
  console.log(`  🛒 Items:    ${r.items.length} line items`);
  r.items.forEach((item) => {
    const qty = item.quantity ? `${item.quantity}x ` : "";
    const tax = item.taxGroup ? ` [MwSt. ${item.taxGroup}]` : "";
    const flag = item.isDiscount ? " 🏷️" : item.isReturn ? " ↩️" : "";
    console.log(`             ${flag}${qty}${item.name}: ${formatCurrency(item.price, r.currency)}${tax}`);
  });
  console.log(`  💳 Payment:  ${r.payment.method}${r.payment.cardLastFour ? " •••• " + r.payment.cardLastFour : ""}`);
  console.log(`  💰 Total:    ${total}`);
  console.log(`  🧾 Tax:      ${taxSummary || "n/a"}`);
  console.log(`  📂 Category: ${r.category}`);
  console.log(`  ✅ Confidence: ${r.confidence ? (r.confidence * 100).toFixed(0) + "%" : "n/a"}`);
  console.log();
}
