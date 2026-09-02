# Changelog

Follows [Keep a Changelog](https://keepachangelog.com).

## [1.0.0] - 2026-09-02

### Added
- TypeScript schemas: Receipt, ReceiptLineItem, TaxBreakdown, MerchantInfo, PaymentInfo
- European number normalization (DE/DK comma-decimal format)
- German MwSt. group calculation (A=19%, B=7%)
- Danish Moms flat calculation (25%)
- Vision AI prompt templates (Gemini, GPT-4o, Claude compatible)
- Store chain detection (30+ DE/DK chains)
- JSON response parser with error handling
- Mock receipt data: Lidl, Rewe, Foetex, Netto DK
- Runnable demo script (no API key required)
