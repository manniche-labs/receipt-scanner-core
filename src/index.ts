/**
 * @file index.ts
 * @description Public API entry point for receipt-scanner-core.
 */

// Types
export type {
  Receipt,
  ReceiptParseResult,
  ReceiptLineItem,
  TaxBreakdown,
  MerchantInfo,
  PaymentInfo,
  Currency,
  Locale,
  StoreChain,
  StoreCountry,
  TransactionCategory,
  PaymentMethod,
  GermanTaxGroup,
  DanishTaxRate,
} from "./types.js";

// Normalization utilities
export {
  parseEuropeanNumber,
  formatCurrency,
  normalizeDate,
  detectStoreChain,
  detectCountry,
  inferCategory,
  calcTaxFromGross,
  GERMAN_TAX_RATES,
  DANISH_MOMS_RATE,
} from "./normalize.js";

// Vision AI prompts
export {
  RECEIPT_SYSTEM_PROMPT,
  RECEIPT_USER_PROMPT,
  buildLocaleHint,
  buildReceiptPromptMessages,
  buildGeminiParts,
} from "./prompt.js";

// Parser
export { parseReceiptResponse } from "./parse.js";
