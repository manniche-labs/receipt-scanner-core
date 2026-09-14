import { test } from "node:test";
import assert from "node:assert/strict";
import { parseEuropeanNumber, normalizeDate, detectStoreChain } from "../src/normalize.js";
import { parseReceiptResponse } from "../src/parse.js";

test("parses European and English number formats", () => {
  assert.equal(parseEuropeanNumber("14,99 €"), 14.99);
  assert.equal(parseEuropeanNumber("1.299,00"), 1299);
  assert.equal(parseEuropeanNumber("129,95 kr."), 129.95);
  assert.equal(parseEuropeanNumber("14.99"), 14.99);
  assert.equal(parseEuropeanNumber("12.50"), 12.5);
  assert.equal(parseEuropeanNumber("1.299"), 1299);
  assert.equal(parseEuropeanNumber(8.42), 8.42);
});

test("parses discounts with leading or trailing minus", () => {
  assert.equal(parseEuropeanNumber("-1,49"), -1.49);
  assert.equal(parseEuropeanNumber("1,49-"), -1.49);
  assert.equal(parseEuropeanNumber(-2), -2);
});

test("rejects impossible dates", () => {
  assert.equal(normalizeDate("02.09.2026"), "2026-09-02");
  assert.equal(normalizeDate("99.99.2026"), null);
  assert.equal(normalizeDate("31.02.26"), null);
  assert.equal(normalizeDate("2026-13-01"), null);
});

test("tells Danish and German Netto/Aldi apart", () => {
  assert.equal(detectStoreChain("Netto", "DKK"), "netto_dk");
  assert.equal(detectStoreChain("Netto Marken-Discount", "EUR"), "netto_de");
  assert.equal(detectStoreChain("Aldi", "DKK"), "aldi_dk");
  assert.equal(detectStoreChain("ALDI SÜD", "EUR"), "aldi_sued");
});

test("keeps dot-decimal model output intact", () => {
  const r = parseReceiptResponse(JSON.stringify({
    currency: "EUR", total: 8.42, merchant: { rawName: "Lidl" },
    items: [{ name: "Milch", price: 1.49 }, { name: "Rabatt", price: -0.5 }],
    taxBreakdown: [{ net: 6.98, tax: 1.44, gross: 8.42 }],
  }));
  assert.equal(r.success, true);
  assert.equal(r.receipt?.total, 8.42);
  assert.deepEqual(r.receipt?.items.map((i) => i.price), [1.49, -0.5]);
});

test("returns an error instead of crashing on non-object JSON", () => {
  for (const input of ["null", "[]", "42"]) {
    const r = parseReceiptResponse(input);
    assert.equal(r.success, false);
  }
  const r = parseReceiptResponse(JSON.stringify({ total: "1,00", items: [null, { name: "x", price: "1,00" }] }));
  assert.equal(r.receipt?.items.length, 1);
});
