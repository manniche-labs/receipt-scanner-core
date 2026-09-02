# Changelog

All notable changes are documented here. Follows [Keep a Changelog](https://keepachangelog.com).

## [1.0.0] - 2026-09-02

### Added
- Core TypeScript schemas (Receipt, ReceiptLineItem, TaxBreakdown, MerchantInfo, PaymentInfo)
- European number normalization (DE/DK comma-decimal format)
- Vision AI prompt templates for Gemini, GPT-4o, Claude
- Store chain detection (30+ German and Danish chains)
- German MwSt. group calculation (A=19%, B=7%)
- Danish Moms flat-rate calculation (25%)
- Robust JSON response parser
- Anonymized mock receipt data for Lidl, Rewe, Foetex, Netto DK
- Runnable demo (npx tsx examples/demo.ts)
