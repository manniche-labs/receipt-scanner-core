# Changelog

Follows [Keep a Changelog](https://keepachangelog.com).


## [Unreleased]

### Fixed
- Dot-decimal amounts came out 100× too large: `"14.99"` and `8.42` became `1499` and `842`, because every dot was stripped as if it were part of `kr.`. The prompt tells models to return dot decimals, so almost every real response was wrong.
- Negative amounts (discounts such as `-1,00` or `1,49-`) failed to parse, so the demo's Lidl and Føtex receipts returned errors.
- Danish Netto was detected as German `netto_de`, and Danish Aldi as `aldi_sued`. Detection now uses the receipt currency.
- `parseReceiptResponse` crashed on `null`, arrays or `null` items instead of returning an error.
- Impossible dates such as `99.99.2026` were accepted.

### Added
- `npm test` with tests for the cases above.

### Changed
- README no longer claims "battle-tested", "production-tested", 30+ chains or drop-in Claude support, and notes the package is not on npm yet.

## [1.0.0] - 2026-09-02

### Added
- TypeScript schemas: Receipt, ReceiptLineItem, TaxBreakdown, MerchantInfo, PaymentInfo
- European number normalization (DE/DK comma-decimal format)
- German MwSt. group calculation (A=19%, B=7%)
- Danish Moms flat calculation (25%)
- Vision AI prompt templates (Gemini, GPT-4o)
- Store chain detection (25+ DE/DK chains)
- JSON response parser with error handling
- Mock receipt data: Lidl, Rewe, Foetex, Netto DK
- Runnable demo script (no API key required)
