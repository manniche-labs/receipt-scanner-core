/**
 * @file types.ts
 * @description Core TypeScript schemas and type definitions for European receipt parsing.
 * Supports Danish (DKK, 25% VAT) and German (EUR, 7%/19% VAT) receipt formats.
 *
 * @author Mikkel Manniche (https://mikkelmanniche.dk)
 * @organization manniche labs (https://github.com/manniche-labs)
 * @license MIT
 */

// ─────────────────────────────────────────────────────────────────────────────
// CURRENCY & LOCALE
// ─────────────────────────────────────────────────────────────────────────────

export type Currency = "EUR" | "DKK";

export type Locale = "de-DE" | "da-DK";

// ─────────────────────────────────────────────────────────────────────────────
// TAX / MOMS
// ─────────────────────────────────────────────────────────────────────────────

/** German MwSt. tax group identifiers as printed on receipts */
export type GermanTaxGroup =
  | "A" // 19% MwSt. — standard rate (most goods)
  | "B" // 7% MwSt. — reduced rate (food, books, newspapers)
  | "C" // 0% / exempt
  | string;

/** Danish Moms: flat 25% on all goods (no reduced rate for food) */
export type DanishTaxRate = 25;

export interface TaxBreakdown {
  /** Label as printed on receipt (e.g. "A", "B", "MOMS 25%") */
  label: string;
  /** Rate as a percentage number (e.g. 19, 7, 25) */
  rate: number;
  /** Net amount (excl. tax) */
  net: number;
  /** Tax amount only */
  tax: number;
  /** Gross amount (net + tax) */
  gross: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// LINE ITEMS
// ─────────────────────────────────────────────────────────────────────────────

export interface ReceiptLineItem {
  /** Product or service name as printed on receipt */
  name: string;
  /** Line total (gross) in the receipt currency */
  price: number;
  /** Unit price (if printed separately), null if not available */
  unitPrice: number | null;
  /** Quantity purchased, null if not applicable */
  quantity: number | null;
  /** Raw quantity string as printed (e.g. "3 x 0,99", "2 Stk") */
  qtyInfo: string | null;
  /** German MwSt. group (A=19%, B=7%) or null for DK receipts */
  taxGroup: GermanTaxGroup | null;
  /** Whether this line item is a discount/reduction */
  isDiscount: boolean;
  /** Whether this item was returned/refunded */
  isReturn: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// PAYMENT
// ─────────────────────────────────────────────────────────────────────────────

export type PaymentMethod =
  | "cash"
  | "card"
  | "contactless"
  | "mobile_pay"   // Danish MobilePay
  | "google_pay"
  | "apple_pay"
  | "giro_pay"     // German GiroPay
  | "paypal"
  | "voucher"
  | "unknown";

export interface PaymentInfo {
  method: PaymentMethod;
  /** Amount tendered (e.g. cash given) */
  amountTendered: number | null;
  /** Change returned */
  changeGiven: number | null;
  /** Last 4 digits of card, if visible */
  cardLastFour: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// STORE / MERCHANT
// ─────────────────────────────────────────────────────────────────────────────

export type StoreCountry = "DE" | "DK" | "AT" | "CH" | "unknown";

export type StoreChain =
  // German chains
  | "lidl"
  | "kaufland"
  | "rewe"
  | "edeka"
  | "aldi_nord"
  | "aldi_sued"
  | "dm_drogerie"
  | "rossmann"
  | "mueller"
  | "penny"
  | "netto_de"
  | "real"
  | "saturn"
  | "mediamarkt"
  | "ikea"
  // German dining
  | "augustiner"
  | "paulaner"
  | "hofbraeu"
  | "backerei"
  | "cafe"
  | "ristorante"
  // Danish chains
  | "netto_dk"
  | "foetex"
  | "bilka"
  | "rema_1000"
  | "aldi_dk"
  | "salling"
  | "meny"
  | "irma"
  | "kvickly"
  | "bauhaus_dk"
  | "jysk"
  // Generic
  | "supermarket"
  | "pharmacy"
  | "restaurant"
  | "gas_station"
  | "electronics"
  | "clothing"
  | "unknown";

export interface MerchantInfo {
  /** Detected store chain identifier */
  chain: StoreChain;
  /** Store name exactly as printed */
  rawName: string;
  /** Store branch/address if available */
  address: string | null;
  /** Tax ID (Steuernummer / CVR) if printed */
  taxId: string | null;
  country: StoreCountry;
}

// ─────────────────────────────────────────────────────────────────────────────
// TRANSACTION CATEGORY (for budgeting/accounting)
// ─────────────────────────────────────────────────────────────────────────────

export type TransactionCategory =
  | "groceries"
  | "dining_out"
  | "cafe_coffee"
  | "alcohol_drinks"
  | "household"
  | "pharmacy_health"
  | "electronics"
  | "clothing_fashion"
  | "transport_fuel"
  | "home_improvement"
  | "personal_care"
  | "entertainment"
  | "office_supplies"
  | "other";

// ─────────────────────────────────────────────────────────────────────────────
// MAIN RECEIPT SCHEMA
// ─────────────────────────────────────────────────────────────────────────────

export interface Receipt {
  // ── Identity ──────────────────────────────────────────────────────────────
  /** ISO 8601 date: YYYY-MM-DD. null if not visible on receipt */
  date: string | null;
  /** Time as HH:MM (24h). null if not visible */
  time: string | null;
  /** Receipt / transaction number if printed */
  receiptNumber: string | null;
  /** Cashier number or till ID if printed */
  tillId: string | null;

  // ── Merchant ──────────────────────────────────────────────────────────────
  merchant: MerchantInfo;

  // ── Line Items ────────────────────────────────────────────────────────────
  items: ReceiptLineItem[];

  // ── Totals ────────────────────────────────────────────────────────────────
  /** Subtotal before discounts */
  subtotal: number | null;
  /** Total discounts/promotions applied */
  totalDiscount: number | null;
  /** Final amount due / charged */
  total: number;
  /** Currency code */
  currency: Currency;
  /** Tax breakdown by group */
  taxBreakdown: TaxBreakdown[];

  // ── Payment ───────────────────────────────────────────────────────────────
  payment: PaymentInfo;

  // ── Classification ────────────────────────────────────────────────────────
  category: TransactionCategory;

  // ── Confidence ────────────────────────────────────────────────────────────
  /** Vision model confidence 0.0–1.0. null if not provided by model */
  confidence: number | null;
  /** Any fields the model was uncertain about */
  uncertainFields: string[];
  /** Raw OCR text extracted before parsing, if available */
  rawText: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// PARSING RESULT WRAPPER
// ─────────────────────────────────────────────────────────────────────────────

export interface ReceiptParseResult {
  success: boolean;
  receipt: Receipt | null;
  /** Parsing errors or warnings */
  errors: string[];
  /** Source image URL or identifier */
  imageSource: string | null;
  /** ISO 8601 timestamp of when parsing occurred */
  parsedAt: string;
}
