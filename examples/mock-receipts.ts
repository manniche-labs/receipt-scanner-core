/**
 * Mock receipt data for testing receipt-scanner-core without a real Vision AI API.
 * Based on anonymized, realistic German and Danish receipt formats.
 */

// ─────────────────────────────────────────────────────────────────────────────
// GERMAN RECEIPTS (EUR, MwSt. groups A=19%, B=7%)
// ─────────────────────────────────────────────────────────────────────────────

/** Lidl receipt — typical Munich grocery run */
export const MOCK_LIDL_JSON = JSON.stringify({
  date: "02.09.2026",
  time: "18:34",
  receiptNumber: "0041-2308",
  tillId: "KASSE 3",
  merchant: {
    chain: "lidl",
    rawName: "Lidl",
    address: "Dachauer Straße 90, 80636 München",
    taxId: "DE 811 269 002",
    country: "DE",
  },
  items: [
    { name: "Weizenbrot", price: "1,49", unitPrice: null, quantity: 1, qtyInfo: null, taxGroup: "B", isDiscount: false, isReturn: false },
    { name: "Vollmilch 3,5%", price: "0,99", unitPrice: null, quantity: 1, qtyInfo: null, taxGroup: "B", isDiscount: false, isReturn: false },
    { name: "Chicken Wings", price: "5,99", unitPrice: "2,99", quantity: 2, qtyInfo: "2 x 2,99", taxGroup: "B", isDiscount: false, isReturn: false },
    { name: "Spülmittel", price: "0,95", unitPrice: null, quantity: 1, qtyInfo: null, taxGroup: "A", isDiscount: false, isReturn: false },
    { name: "Lidl Plus Rabatt", price: "-1,00", unitPrice: null, quantity: null, qtyInfo: null, taxGroup: "B", isDiscount: true, isReturn: false },
  ],
  subtotal: "9,42",
  totalDiscount: "1,00",
  total: "8,42",
  currency: "EUR",
  taxBreakdown: [
    { label: "A", rate: 19, net: "0,80", tax: "0,15", gross: "0,95" },
    { label: "B", rate: 7, net: "6,98", tax: "0,49", gross: "7,47" },
  ],
  payment: { method: "contactless", amountTendered: null, changeGiven: null, cardLastFour: "4821" },
  category: "groceries",
  confidence: 0.97,
  uncertainFields: [],
  rawText: null,
});

/** Rewe receipt with Giro card payment */
export const MOCK_REWE_JSON = JSON.stringify({
  date: "01.09.2026",
  time: "12:15",
  receiptNumber: "7821",
  tillId: "K 07",
  merchant: {
    chain: "rewe",
    rawName: "REWE",
    address: "Sendlinger Straße 22, 80331 München",
    taxId: "DE 129 274 202",
    country: "DE",
  },
  items: [
    { name: "Bio Apfelsaft 1L", price: "2,49", unitPrice: null, quantity: 1, qtyInfo: null, taxGroup: "B", isDiscount: false, isReturn: false },
    { name: "Penne Rigate 500g", price: "1,19", unitPrice: null, quantity: 1, qtyInfo: null, taxGroup: "B", isDiscount: false, isReturn: false },
    { name: "Tomate-Mozzarella", price: "3,99", unitPrice: null, quantity: 1, qtyInfo: null, taxGroup: "B", isDiscount: false, isReturn: false },
    { name: "Flaschenreiniger", price: "2,29", unitPrice: null, quantity: 1, qtyInfo: null, taxGroup: "A", isDiscount: false, isReturn: false },
  ],
  subtotal: "9,96",
  totalDiscount: null,
  total: "9,96",
  currency: "EUR",
  taxBreakdown: [
    { label: "A", rate: 19, net: "1,92", tax: "0,37", gross: "2,29" },
    { label: "B", rate: 7, net: "7,17", tax: "0,50", gross: "7,67" },
  ],
  payment: { method: "card", amountTendered: "10,00", changeGiven: null, cardLastFour: "0037" },
  category: "groceries",
  confidence: 0.95,
  uncertainFields: [],
  rawText: null,
});

// ─────────────────────────────────────────────────────────────────────────────
// DANISH RECEIPTS (DKK, Moms 25% flat)
// ─────────────────────────────────────────────────────────────────────────────

/** Føtex receipt — typical Aalborg or Copenhagen grocery run */
export const MOCK_FOETEX_JSON = JSON.stringify({
  date: "30.08.2026",
  time: "10:22",
  receiptNumber: "20261234",
  tillId: "KASSE 2",
  merchant: {
    chain: "foetex",
    rawName: "føtex",
    address: "Nørre Uttrup Vej 1, 9400 Nørresundby",
    taxId: "DK 29 12 05 97",
    country: "DK",
  },
  items: [
    { name: "Rugbrød 750g", price: "22,95", unitPrice: null, quantity: 1, qtyInfo: null, taxGroup: null, isDiscount: false, isReturn: false },
    { name: "Letmælk 1L", price: "8,95", unitPrice: "8,95", quantity: 1, qtyInfo: null, taxGroup: null, isDiscount: false, isReturn: false },
    { name: "Oksekød hakket 400g", price: "39,95", unitPrice: null, quantity: 1, qtyInfo: null, taxGroup: null, isDiscount: false, isReturn: false },
    { name: "Klorbleer 38 stk", price: "119,95", unitPrice: null, quantity: 1, qtyInfo: null, taxGroup: null, isDiscount: false, isReturn: false },
    { name: "Club Matas rabat", price: "-15,00", unitPrice: null, quantity: null, qtyInfo: null, taxGroup: null, isDiscount: true, isReturn: false },
  ],
  subtotal: "191,80",
  totalDiscount: "15,00",
  total: "176,80",
  currency: "DKK",
  taxBreakdown: [
    { label: "MOMS 25%", rate: 25, net: "141,44", tax: "35,36", gross: "176,80" },
  ],
  payment: { method: "mobile_pay", amountTendered: null, changeGiven: null, cardLastFour: null },
  category: "groceries",
  confidence: 0.98,
  uncertainFields: [],
  rawText: null,
});

/** Netto DK receipt — cash payment */
export const MOCK_NETTO_DK_JSON = JSON.stringify({
  date: "31.08.2026",
  time: "16:45",
  receiptNumber: "0082-4419",
  tillId: "Kasse 1",
  merchant: {
    chain: "netto_dk",
    rawName: "Netto",
    address: "Vesterbro 1, 9000 Aalborg",
    taxId: "DK 21 04 19 35",
    country: "DK",
  },
  items: [
    { name: "Øl 4-pak Tuborg", price: "49,95", unitPrice: null, quantity: 1, qtyInfo: null, taxGroup: null, isDiscount: false, isReturn: false },
    { name: "Chips 200g", price: "12,95", unitPrice: null, quantity: 1, qtyInfo: null, taxGroup: null, isDiscount: false, isReturn: false },
    { name: "Cola Zero 1,5L", price: "14,95", unitPrice: "14,95", quantity: 1, qtyInfo: null, taxGroup: null, isDiscount: false, isReturn: false },
  ],
  subtotal: "77,85",
  totalDiscount: null,
  total: "77,85",
  currency: "DKK",
  taxBreakdown: [
    { label: "MOMS 25%", rate: 25, net: "62,28", tax: "15,57", gross: "77,85" },
  ],
  payment: { method: "cash", amountTendered: "100,00", changeGiven: "22,15", cardLastFour: null },
  category: "groceries",
  confidence: 0.96,
  uncertainFields: ["receiptNumber"],
  rawText: null,
});
