<div align="center">

  # 🧾 receipt-scanner-core

  **Battle-tested European receipt parsing — TypeScript schemas, Vision AI prompt templates, and smart normalization for German 🇩🇪 and Danish 🇩🇰 receipts.**

  <br />

  [![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)
  [![Project Views](https://komarev.com/ghpvc/?username=manniche-labs-receipt-scanner-core&color=2563eb&style=flat-square&label=PROJECT+VIEWS)](https://github.com/manniche-labs/receipt-scanner-core)
  [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](https://github.com/manniche-labs/receipt-scanner-core/pulls)
  [![Studio](https://img.shields.io/badge/Studio-manniche_labs-0f0f0f?style=flat-square&logo=github&logoColor=white)](https://github.com/manniche-labs)

  <br />

  <sub>Built and battle-tested by <b><a href="https://github.com/mikkelmanniche-dk">Mikkel Manniche</a></b> at <b><a href="https://github.com/manniche-labs">manniche labs</a></b> • <a href="https://mikkelmanniche.dk">mikkelmanniche.dk</a></sub>

</div>

---

## ✨ What Is This?

`receipt-scanner-core` is the parsing and normalization engine behind a production receipt-scanning application that processes **real-world German and Danish retail receipts** using Vision AI (Gemini, GPT-4o, Claude).

It provides:
- 📐 **Type-safe TypeScript schemas** for every field on a European retail receipt
- 🤖 **Production-tested Vision AI prompt templates** that produce consistent JSON from any vision model
- 🔢 **European number normalization** (`14,99 €` → `14.99`, `1.299,00` → `1299.00`)
- 🏪 **Store recognition engine** covering 30+ German & Danish retail chains
- 🧮 **German MwSt. calculation** (A=19%, B=7%) and **Danish Moms** (25% flat)
- 🧪 **Mock receipt data** for offline testing — no API key needed

---

## 🌍 Supported Ecosystems

### 🇩🇪 Germany (EUR)
| Feature | Details |
| :--- | :--- |
| **Tax Groups** | A = 19% MwSt. (standard) • B = 7% MwSt. (food, books) • C = 0% |
| **Number Format** | `1.299,99` (dot thousands, comma decimal) |
| **Date Format** | `DD.MM.YYYY` |
| **Supported Chains** | Lidl • Kaufland • Rewe • Edeka • Aldi • dm-Drogerie • Rossmann • Müller • Penny • Netto • Saturn • MediaMarkt • IKEA • Augustiner • Paulaner • Hofbräu • and more |

### 🇩🇰 Denmark (DKK)
| Feature | Details |
| :--- | :--- |
| **Tax** | 25% flat Moms (no groups — always one rate) |
| **Number Format** | `1.299,95` (same European format) |
| **Date Format** | `DD.MM.YYYY` or `DD/MM/YYYY` |
| **Supported Chains** | Føtex • Bilka • Netto • Rema 1000 • Salling • Meny • Irma • Kvickly • JYSK • Aldi DK |
| **Payment Methods** | MobilePay (very common in DK) • Dankort • Cash |

---

## 📦 Core Modules

### `src/types.ts` — Type-Safe Schemas
Complete TypeScript types for every field in a European receipt:

```typescript
import type { Receipt, ReceiptLineItem, TaxBreakdown, Currency } from "@manniche-labs/receipt-scanner-core";

const receipt: Receipt = {
  date: "2026-09-02",
  total: 8.42,
  currency: "EUR",
  merchant: {
    chain: "lidl",
    rawName: "Lidl",
    country: "DE",
    // ...
  },
  items: [
    {
      name: "Weizenbrot",
      price: 1.49,
      taxGroup: "B",   // 7% MwSt. (food)
      quantity: 1,
      isDiscount: false,
      isReturn: false,
      // ...
    }
  ],
  // ...
};
```

**Key types exported:**
- `Receipt` — The complete receipt object
- `ReceiptLineItem` — Single product line with quantity, tax group, discount flags
- `TaxBreakdown` — Per-group net/tax/gross breakdown
- `MerchantInfo` — Store chain, address, Tax ID (Steuernummer / CVR)
- `PaymentInfo` — Payment method, amount tendered, change, card last 4
- `Currency` — `"EUR" | "DKK"`
- `StoreChain` — 30+ named store chains (strongly typed)
- `TransactionCategory` — Budget categories (groceries, dining, pharmacy, etc.)

---

### `src/prompt.ts` — Vision AI Prompt Templates
Production-tested system and user prompts that work with **any Vision AI model**:

```typescript
import { buildReceiptPromptMessages, buildGeminiParts } from "@manniche-labs/receipt-scanner-core";

// ── OpenAI GPT-4o ────────────────────────────────────────────────────────────
const messages = buildReceiptPromptMessages(imageBase64, "EUR");
const result = await openai.chat.completions.create({
  model: "gpt-4o",
  messages,
  response_format: { type: "json_object" },
});

// ── Google Gemini ────────────────────────────────────────────────────────────
const parts = buildGeminiParts(imageBase64, "DKK");
const result = await model.generateContent({
  contents: [{ role: "user", parts }],
  generationConfig: { responseMimeType: "application/json" },
});

// ── Anthropic Claude ─────────────────────────────────────────────────────────
const messages = buildReceiptPromptMessages(imageBase64, "EUR");
// Use messages[0].content as system and messages[1].content as the user message
```

**What makes these prompts special:**
- Forces **dot decimal output** regardless of input format (eliminating the #1 parsing bug)
- Instructs the model to extract **all line items including discounts and returns**
- Handles **quantity/multiplier lines** (`3 x 0,99`, `2 Stk x 1,49`)
- Extracts **German tax group letters** per line item (critical for accounting)
- Asks for `uncertainFields` array — the model flags what it wasn't sure about
- Returns full OCR `rawText` for debugging

---

### `src/normalize.ts` — Normalization Engine

```typescript
import {
  parseEuropeanNumber,
  formatCurrency,
  normalizeDate,
  detectStoreChain,
  calcTaxFromGross,
} from "@manniche-labs/receipt-scanner-core";

// Number normalization
parseEuropeanNumber("14,99 €")     // → 14.99
parseEuropeanNumber("1.299,00")    // → 1299.00
parseEuropeanNumber("129,95 kr.")  // → 129.95
parseEuropeanNumber("5")           // → 5

// Currency display
formatCurrency(8.42, "EUR")        // → "8,42 €" (de-DE locale)
formatCurrency(176.80, "DKK")      // → "176,80 kr." (da-DK locale)

// Date normalization → ISO 8601
normalizeDate("02.09.2026")        // → "2026-09-02"
normalizeDate("30/08/2026")        // → "2026-08-30"
normalizeDate("02.09.26")          // → "2026-09-02"

// Store detection from OCR text
detectStoreChain("Lidl Filiale 0041")        // → "lidl"
detectStoreChain("REWE your local supermarket") // → "rewe"
detectStoreChain("føtex Nørresundby")        // → "foetex"

// Tax calculation
calcTaxFromGross(7.47, 7)    // → { net: 6.98, tax: 0.49 }   (B=7%)
calcTaxFromGross(0.95, 19)   // → { net: 0.80, tax: 0.15 }   (A=19%)
calcTaxFromGross(176.80, 25) // → { net: 141.44, tax: 35.36 } (DK Moms)
```

---

### `src/parse.ts` — JSON Response Parser
Converts raw Vision AI model output into a strongly-typed `Receipt` with full error handling:

```typescript
import { parseReceiptResponse } from "@manniche-labs/receipt-scanner-core";

const result = parseReceiptResponse(modelJsonString, "lidl-receipt.jpg");

if (result.success) {
  console.log(result.receipt.total);       // 8.42
  console.log(result.receipt.merchant.chain); // "lidl"
  console.log(result.receipt.items[0].taxGroup); // "B"
} else {
  console.error(result.errors); // ["Could not parse total amount."]
}
```

**Parser handles real-world model quirks:**
- Numbers returned as strings (`"14,99"` instead of `14.99`)
- JSON wrapped in markdown code fences (` ```json ... ``` `)
- Missing optional fields (replaced with `null`, not undefined)
- European decimal formatting not converted by the model
- Truncated or malformed JSON responses

---

## 🧪 Run Demo (No API Key Required)

```bash
git clone https://github.com/manniche-labs/receipt-scanner-core.git
cd receipt-scanner-core
npm install
npm run demo
```

Output:
```
╔══════════════════════════════════════════════════════════╗
║     receipt-scanner-core — European Receipt Parser Demo ║
╚══════════════════════════════════════════════════════════╝

─── 🇩🇪 Lidl München ──────────────────────────────────────
  🏪 Store:    Lidl [lidl] DE
  📅 Date:     2026-09-02 at 18:34
  🛒 Items:    5 line items
               Weizenbrot: 1,49 € [MwSt. B]
               Vollmilch 3,5%: 0,99 € [MwSt. B]
               2x Chicken Wings: 5,99 € [MwSt. B]
               Spülmittel: 0,95 € [MwSt. A]
             🏷️ Lidl Plus Rabatt: -1,00 €
  💳 Payment:  contactless •••• 4821
  💰 Total:    8,42 €
  🧾 Tax:      A(19%): 0,15 € | B(7%): 0,49 €
  📂 Category: groceries
  ✅ Confidence: 97%

─── 🇩🇰 Føtex Nørresundby ────────────────────────────────
  🏪 Store:    føtex [foetex] DK
  📅 Date:     2026-08-30 at 10:22
  🛒 Items:    5 line items
               Rugbrød 750g: 22,95 kr.
               Letmælk 1L: 8,95 kr.
               Oksekød hakket 400g: 39,95 kr.
               Klorbleer 38 stk: 119,95 kr.
             🏷️ Club Matas rabat: -15,00 kr.
  💳 Payment:  mobile_pay
  💰 Total:    176,80 kr.
  🧾 Tax:      MOMS 25%(25%): 35,36 kr.
  📂 Category: groceries
  ✅ Confidence: 98%
```

---

## 🤝 Contributing

Issues, feature requests, and pull requests are welcome! If this library saves you hours of debugging European decimal formats, please give it a **⭐ Star**.

---

## 👨‍💻 Maintainer

* **Engineering Studio:** [manniche labs](https://github.com/manniche-labs)
* **Lead Engineer:** [Mikkel Manniche](https://github.com/mikkelmanniche-dk)
* **Platform:** [mikkelmanniche.dk](https://mikkelmanniche.dk)

License: [MIT](LICENSE)
