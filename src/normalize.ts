/**
 * @file normalize.ts
 * @description European number format normalization utilities.
 * Handles the critical difference between German/Danish number formats
 * (comma as decimal separator) and JavaScript's expected format (dot as decimal).
 *
 * Examples:
 *   DE: "14,99 €"  → 14.99
 *   DE: "1.299,00" → 1299.00
 *   DK: "129,95 kr." → 129.95
 *   DK: "1.249,00" → 1249.00
 *
 * @author Mikkel Manniche (https://mikkelmanniche.dk)
 * @organization manniche labs (https://github.com/manniche-labs)
 * @license MIT
 */

import type { Currency, StoreCountry, TransactionCategory, StoreChain } from "./types.js";

// ─────────────────────────────────────────────────────────────────────────────
// NUMBER NORMALIZATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Parses a European-format number string to a JavaScript float.
 * Handles both German (1.234,56) and Danish (1.234,56) formats.
 * Also handles plain English format (1234.56) as fallback.
 *
 * @param raw - Raw string from OCR/vision model (e.g. "14,99", "1.299,00")
 * @returns Normalized float, or null if unparseable
 */
export function parseEuropeanNumber(raw: string | null | undefined): number | null {
  if (!raw) return null;

  // Strip currency symbols and whitespace
  const cleaned = raw
    .replace(/[€$£¥kr\.DKK EUR]+/gi, "")
    .replace(/\s+/g, "")
    .trim();

  if (!cleaned) return null;

  // Pattern 1: German/Danish thousands + decimal comma: "1.299,99" → 1299.99
  if (/^\d{1,3}(\.\d{3})+(,\d{1,2})?$/.test(cleaned)) {
    return parseFloat(cleaned.replace(/\./g, "").replace(",", "."));
  }

  // Pattern 2: Simple decimal comma, no thousands sep: "14,99" → 14.99
  if (/^\d+(,\d{1,2})$/.test(cleaned)) {
    return parseFloat(cleaned.replace(",", "."));
  }

  // Pattern 3: Danish/German with thousands dot, no decimal: "1.299" → 1299
  if (/^\d{1,3}(\.\d{3})+$/.test(cleaned)) {
    return parseFloat(cleaned.replace(/\./g, ""));
  }

  // Pattern 4: Standard English decimal "14.99" — used by some German POS systems
  if (/^\d+\.\d{1,2}$/.test(cleaned)) {
    return parseFloat(cleaned);
  }

  // Pattern 5: Integer "5" or "100"
  if (/^\d+$/.test(cleaned)) {
    return parseInt(cleaned, 10);
  }

  return null;
}

/**
 * Formats a number as a localized currency string for display.
 */
export function formatCurrency(amount: number, currency: Currency): string {
  const locale = currency === "DKK" ? "da-DK" : "de-DE";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

// ─────────────────────────────────────────────────────────────────────────────
// DATE NORMALIZATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Normalizes various European date formats to ISO 8601 (YYYY-MM-DD).
 *
 * Handles:
 *   "02.09.2026" (German DD.MM.YYYY)
 *   "02/09/2026" (Danish DD/MM/YYYY)
 *   "2026-09-02" (already ISO)
 *   "02.09.26"   (German short year)
 */
export function normalizeDate(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const s = raw.trim();

  // Already ISO: YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

  // DD.MM.YYYY or DD/MM/YYYY
  const dmy = s.match(/^(\d{1,2})[./](\d{1,2})[./](\d{4})$/);
  if (dmy) {
    const [, d, m, y] = dmy;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }

  // DD.MM.YY (short year — assume 2000s)
  const dmyShort = s.match(/^(\d{1,2})[./](\d{1,2})[./](\d{2})$/);
  if (dmyShort) {
    const [, d, m, y] = dmyShort;
    return `20${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }

  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// STORE RECOGNITION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Detects the store chain from raw OCR text or store name.
 * Covers major German and Danish supermarket, drugstore, and dining chains.
 */
export function detectStoreChain(rawName: string): StoreChain {
  const n = rawName.toLowerCase();

  // German grocery/discount
  if (/\blidl\b/.test(n)) return "lidl";
  if (/\bkaufland\b/.test(n)) return "kaufland";
  if (/\brewe\b/.test(n)) return "rewe";
  if (/\bedeka\b/.test(n)) return "edeka";
  if (/\baldi\b.*s[üu]d/.test(n)) return "aldi_sued";
  if (/\baldi\b.*nord/.test(n)) return "aldi_nord";
  if (/\baldi\b/.test(n)) return "aldi_sued"; // default to Süd in Bavaria/Munich
  if (/\bpenny\b/.test(n)) return "penny";
  if (/\bnetto\b/.test(n) && !/dk/.test(n)) return "netto_de";

  // German drugstore
  if (/\bdm[-\s]drogerie|\bdm\b/.test(n)) return "dm_drogerie";
  if (/\brossmann\b/.test(n)) return "rossmann";
  if (/\bm[üu]ller\b/.test(n)) return "mueller";

  // German electronics
  if (/\bsaturn\b/.test(n)) return "saturn";
  if (/\bmediamarkt|media\s*markt\b/.test(n)) return "mediamarkt";

  // German dining / cafe
  if (/\baugustiner\b/.test(n)) return "augustiner";
  if (/\bpaulaner\b/.test(n)) return "paulaner";
  if (/\bhofbr[äa]u\b/.test(n)) return "hofbraeu";
  if (/\bb[äa]ckerei\b/.test(n)) return "backerei";

  // IKEA
  if (/\bikea\b/.test(n)) return "ikea";

  // Danish grocery
  if (/\bf[øo]tex\b/.test(n)) return "foetex";
  if (/\bbilka\b/.test(n)) return "bilka";
  if (/\brema\s*1000\b/.test(n)) return "rema_1000";
  if (/\bsalling\b/.test(n)) return "salling";
  if (/\bmeny\b/.test(n)) return "meny";
  if (/\birma\b/.test(n)) return "irma";
  if (/\bkvickly\b/.test(n)) return "kvickly";
  if (/\bnetto\b.*dk/.test(n)) return "netto_dk";
  if (/\bjysk\b/.test(n)) return "jysk";

  return "unknown";
}

/**
 * Infers country from currency or store chain.
 */
export function detectCountry(currency: Currency, chain: StoreChain): StoreCountry {
  if (currency === "DKK") return "DK";
  if (currency === "EUR") return "DE";

  const dkChains: StoreChain[] = ["foetex", "bilka", "rema_1000", "salling", "meny", "irma", "kvickly", "netto_dk", "jysk"];
  if (dkChains.includes(chain)) return "DK";

  return "DE";
}

/**
 * Infers transaction category from store chain.
 */
export function inferCategory(chain: StoreChain): TransactionCategory {
  const groceryChains: StoreChain[] = [
    "lidl", "kaufland", "rewe", "edeka", "aldi_nord", "aldi_sued",
    "penny", "netto_de", "foetex", "bilka", "rema_1000", "salling",
    "meny", "irma", "kvickly", "netto_dk", "supermarket"
  ];
  const drugstoreChains: StoreChain[] = ["dm_drogerie", "rossmann", "mueller", "pharmacy"];
  const diningChains: StoreChain[] = ["augustiner", "paulaner", "hofbraeu", "cafe", "ristorante", "restaurant"];
  const electronicsChains: StoreChain[] = ["saturn", "mediamarkt", "electronics"];
  const cafeChains: StoreChain[] = ["backerei", "cafe"];

  if (groceryChains.includes(chain)) return "groceries";
  if (drugstoreChains.includes(chain)) return "pharmacy_health";
  if (diningChains.includes(chain)) return "dining_out";
  if (cafeChains.includes(chain)) return "cafe_coffee";
  if (electronicsChains.includes(chain)) return "electronics";
  if (chain === "jysk") return "household";
  if (chain === "ikea") return "home_improvement";

  return "other";
}

// ─────────────────────────────────────────────────────────────────────────────
// TAX CALCULATION
// ─────────────────────────────────────────────────────────────────────────────

/** German MwSt. rate lookup by tax group */
export const GERMAN_TAX_RATES: Record<string, number> = {
  A: 19,
  B: 7,
  C: 0,
};

/** Danish Moms — always 25% flat */
export const DANISH_MOMS_RATE = 25;

/**
 * Calculates net (excl. VAT) and VAT amount from a gross amount and rate.
 */
export function calcTaxFromGross(
  gross: number,
  ratePercent: number
): { net: number; tax: number } {
  const multiplier = 1 + ratePercent / 100;
  const net = parseFloat((gross / multiplier).toFixed(2));
  const tax = parseFloat((gross - net).toFixed(2));
  return { net, tax };
}
