# Proof of Google AI Usage

This directory contains verification proofs, API outputs, and execution logs demonstrating the integration of Google Gemini AI in HomeVault.

### Included Verifications:
1. **Google Gemini Multimodal OCR Extraction**:
   - Extraction of appliance metadata (brand, model, serial number, purchase date, warranty duration) from uploaded warranty card and invoice documents.
   - Endpoint: `/api/ocr/parse-invoice`
   - Verification script: `scratch/test_gemini.ts`

2. **Google Gemini Context-Aware Assistant**:
   - Conversational assistant grounded in live appliance passport records, calculating spend, warranty countdowns, and AMC status.
   - Endpoint: `/api/assistant`
   - Verification script: `scratch/test_chatbot.ts`
