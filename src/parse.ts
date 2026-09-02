/**
 * @file parse.ts
 * @description Parses and validates raw Vision AI JSON output into a typed Receipt object.
 * Handles common model output quirks (number strings, missing fields, wrong decimal format).
 *
 * @author Mikkel Manniche (https://mikkelmanniche.dk)
 * @organization manniche labs (https://github.com/mannichen-labs)
 * @license MIT
 */

import type { Receipt, ReceiptParseResult, ReceiptLineItem } from "./types.js";
import {
  parseEuropeanNumber,
  normalizeDate,
  detectStoreChain,
  detectCountry,
  inferCategory,
} from "./normalize.js";

/**
 * Parses raw JSON string from a Vision AI model into a fully typed Receipt.
 * Robust to common model quirks:
 *   - Numbers returned as strings ("14,99")
 *   - Missing optional fields (replaced with null)
 *   - European decimal formatting not converted by the model
 *   - Truncated or malformed JSON (returns parse error)
 */
export function parseReceiptResponse(
  rawJson: string,
  imageSource?: string
): ReceiptParseResult {
  const parsedAt = new Date().toISOString();

  let raw: Record<string, unknown>;

  try {
    // Strip markdown fences if model wrapped in ```json ... ```
    const cleaned = rawJson
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();
    raw = JSON.parse(cleaned);
  } catch {
    return {
      success: false,
      receipt: null,
      errors: ["Failed to parse JSON response from Vision AI model."],
      imageSource: imageSource ?? null,
      parsedAt,
    };
  }

  const errors: string[] = [];

  // ── Merchant ──────────────────────────────────────────────────────────────
  const merchantRaw = (raw.merchant as Record<string, unknown>) ?? {};
  const rawName = String(merchantRaw.rawName ?? merchantRaw.store ?? "Unknown");
  const chain = detectStoreChain(rawName);

  // ── Currency & Country ────────────────────────────────────────────────────
  const currency = (raw.currency as string ?? "EUR") === "DKK" ? "DKK" as const : "EUR" as const;
  const country = detectCountry(currency, chain);

  // ── Total ─────────────────────────────────────────────────────────────────
  const total = parseEuropeanNumber(String(raw.total ?? "0"));
  if (total === null) {
    errors.push("Could not parse total amount.");
  }

  // ── Date ──────────────────────────────────────────────────────────────────
  const date = normalizeDate(raw.date as string ?? null);

  // ── Items ─────────────────────────────────────────────────────────────────
  const rawItems = Array.isArray(raw.items) ? raw.items : [];
  const items: ReceiptLineItem[] = rawItems.map((item: Record<string, unknown>, i: number) => {
    const price = parseEuropeanNumber(String(item.price ?? "0"));
    if (price === null) errors.push(`Item[${i}] "${item.name}": could not parse price.`);
    return {
      name: String(item.name ?? `Item ${i + 1}`),
      price: price ?? 0,
      unitPrice: parseEuropeanNumber(String(item.unitPrice ?? "")) ?? null,
      quantity: item.quantity != null ? Number(item.quantity) : null,
      qtyInfo: item.qtyInfo ? String(item.qtyInfo) : null,
      taxGroup: item.taxGroup ? String(item.taxGroup) : null,
      isDiscount: Boolean(item.isDiscount),
      isReturn: Boolean(item.isReturn),
    };
  });

  // ── Category ──────────────────────────────────────────────────────────────
  const category = (raw.category as string) ?? inferCategory(chain);

  // ── Payment ───────────────────────────────────────────────────────────────
  const paymentRaw = (raw.payment as Record<string, unknown>) ?? {};
  const payment = {
    method: (paymentRaw.method as string ?? "unknown") as Receipt["payment"]["method"],
    amountTendered: parseEuropeanNumber(String(paymentRaw.amountTendered ?? "")) ?? null,
    changeGiven: parseEuropeanNumber(String(paymentRaw.changeGiven ?? "")) ?? null,
    cardLastFour: paymentRaw.cardLastFour ? String(paymentRaw.cardLastFour) : null,
  };

  const receipt: Receipt = {
    date,
    time: raw.time ? String(raw.time) : null,
    receiptNumber: raw.receiptNumber ? String(raw.receiptNumber) : null,
    tillId: raw.tillId ? String(raw.tillId) : null,
    merchant: {
      chain,
      rawName,
      address: merchantRaw.address ? String(merchantRaw.address) : null,
      taxId: merchantRaw.taxId ? String(merchantRaw.taxId) : null,
      country,
    },
    items,
    subtotal: parseEuropeanNumber(String(raw.subtotal ?? "")) ?? null,
    totalDiscount: parseEuropeanNumber(String(raw.totalDiscount ?? "")) ?? null,
    total: total ?? 0,
    currency,
    taxBreakdown: Array.isArray(raw.taxBreakdown)
      ? raw.taxBreakdown.map((t: Record<string, unknown>) => ({
          label: String(t.label ?? ""),
          rate: Number(t.rate ?? 0),
          net: parseEuropeanNumber(String(t.net ?? "0")) ?? 0,
          tax: parseEuropeanNumber(String(t.tax ?? "0")) ?? 0,
          gross: parseEuropeanNumber(String(t.gross ?? "0")) ?? 0,
        }))
      : [],
    payment,
    category: category as Receipt["category"],
    confidence: raw.confidence != null ? Number(raw.confidence) : null,
    uncertainFields: Array.isArray(raw.uncertainFields)
      ? raw.uncertainFields.map(String)
      : [],
    rawText: raw.rawText ? String(raw.rawText) : null,
  };

  return {
    success: errors.length === 0,
    receipt,
    errors,
    imageSource: imageSource ?? null,
    parsedAt,
  };
}
