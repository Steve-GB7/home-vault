# HomeVault

## Problem Statement

In modern households, managing appliance documents—such as purchase invoices, warranty cards, user manuals, and Annual Maintenance Contracts (AMCs)—is chaotic and disorganized. Paper receipts fade, physical warranty cards get lost in drawers, and appliance serial numbers are buried behind heavy machinery or mounted units.

This leads to several critical pain points:
- **Missed Warranties & Unnecessary Costs:** Homeowners frequently pay out-of-pocket for expensive repairs on appliances that are still legally covered under manufacturer warranty or an active AMC simply because they cannot locate the original bill or purchase date in time.
- **Tedious Complaint Registration:** Raising service requests requires manually tracking down and re-typing model numbers, purchase dates, dealer info, and serial numbers every single time an issue occurs.
- **Service Center Inefficiencies & Fraud:** Service businesses frequently receive low-effort or fraudulent tickets without verified malfunction evidence, resulting in wasted technician visits. Furthermore, technicians arrive on-site with zero visibility into previous repair history, replaced parts, or coverage terms.
- **Lack of Spend Intelligence:** Homeowners have no consolidated insight into the total cost of ownership (purchase price + repair visits + spare parts + AMC renewals) for their home appliances, making it difficult to decide whether to repair or replace aging equipment.

---

## Project Description

**HomeVault** is a privacy-shielded **Digital Appliance Passport and Service Intelligence Platform** that bridges households and authorized service businesses. It creates a verified, immutable digital identity for every home appliance (Air Conditioners, Refrigerators, Washing Machines, TVs, etc.), digitizing its complete lifecycle from purchase to end-of-life.

### How It Works:
1. **Instant Appliance Onboarding:** Homeowners photograph their physical warranty card or purchase invoice. HomeVault uses Google Gemini's multimodal vision to automatically parse the document and extract the brand, model, serial number, purchase date, price, and warranty duration in seconds.
2. **Interactive Appliance Passport:** Each appliance receives a unified digital passport featuring real-time countdown badges for manufacturer warranty and AMC coverage, a centralized document vault, and a full chronological timeline of all prior repairs and part replacements.
3. **Conversational AI Concierge:** Integrated Google Gemini assistant answers natural queries about warranty validity, maintenance schedules, lifetime expenditure breakdowns, and troubleshooting advice grounded in the appliance's actual passport data.
4. **Verified Complaint & Service Workflow:**
   - When an appliance malfunctions, the customer raises a ticket with **mandatory recorded video evidence** and lightweight anti-fraud duplicate guards.
   - Authorized service centers access an interactive **Service Desk** showing the complaint, video evidence playback via authenticated streaming, and privacy-shielded passport technical context (with customer pricing protected).
   - Service providers can assign technicians, log labor and replacement parts directly to the asset's permanent passport history, or reject invalid tickets using structured categorization and explanatory notes.

### What Makes It Useful:
- **Zero Document Loss:** Every bill, warranty slip, and AMC document is permanently safely stored and indexed in Supabase Storage.
- **Saves Household Money:** Automated coverage countdowns alert users before warranties and AMC contracts lapse.
- **Streamlined Service Experience:** One-click complaint generation pre-populated with verified appliance specs eliminates phone calls and miscommunication.
- **Privacy by Design:** Strict Row Level Security (RLS) protects customer purchase prices from third-party businesses while providing technicians with all the technical context needed for accurate first-time fixes.

---

## Google AI Usage

### Tools / Models Used

- **Google Gen AI SDK:** `@google/genai` (v2.23.0)
- **Primary AI Model:** `gemini-flash-lite-latest` (high-speed multimodal vision and low-latency structured reasoning)
- **Fallback Models:** `gemini-3.5-flash-lite` and `gemini-3.7-flash` (multi-model automated fallback redundancy for uninterrupted service)

---

## Tech Stack used

- **Frontend & App Framework:** Next.js 16 (App Router with Turbopack), React 19, TypeScript
- **Styling & UI Components:** Tailwind CSS v4, Lucide React Icons, Sonner Notifications, Recharts
- **Database & Backend:** Supabase (PostgreSQL with Row Level Security, Supabase Auth SSR, Supabase Storage)
- **AI & Multimodal Engine:** Google Gen AI (`@google/genai`), Google Gemini Vision & Language APIs
- **Form Management & Validation:** React Hook Form, Zod Schema Validation

---

### How Google AI Was Used

Google Gemini AI is deeply integrated into two mission-critical workflows in HomeVault:

#### 1. Multimodal Document OCR & Appliance Extraction (`/api/ocr/parse-invoice`)
- **Visual Intelligence:** Users upload an image or scan of their physical purchase invoice or manufacturer warranty card.
- **Multimodal Extraction:** The file is streamed directly into Gemini Multimodal Vision alongside a strict JSON schema prompt (`OCR_SYSTEM_INSTRUCTION`).
- **Structured Output:** Gemini analyzes the layout, stamps, dealer signatures, and fine print to extract:
  - Brand, Model, Serial Number, Appliance Category
  - Purchase Date, Purchase Price, Currency, Retailer/Dealer Name
  - Standard Warranty Period (months), Extended Warranty, and AMC inclusions
- **Confidence Scoring & Validation:** The extracted data is validated against Zod domain schemas, dramatically reducing onboarding time from several minutes to under two seconds with near-zero typing.

#### 2. Context-Aware Household Assistant (`/api/assistant`)
- **Grounded Conversational Intelligence:** Powered by Google Gemini, the HomeVault AI Assistant acts as an intelligent household digital concierge.
- **Live Passport Context Injection:** Every query is dynamically enriched with real-time aggregated metrics from the user's appliance passport:
  - Purchase details and original cost
  - Aggregated lifetime spend (total labor cost + parts replacement cost + AMC contracts)
  - Live warranty status and remaining AMC countdown days
  - Prior maintenance history and technician notes
- **Natural Interaction:** Homeowners can ask questions in natural language, such as:
  - *"How much have I spent on maintaining my AC so far?"*
  - *"When does my AMC expire, and who is the service provider?"*
  - *"What was repaired during the last service visit?"*
- **Automated Fallback Architecture:** Utilizes a resilient multi-model cascade (`generateContentWithFallback`) in `src/lib/gemini.ts` that automatically fails over across candidate Gemini models if rate limits or network issues occur.

---

### GitHub repo link of the project

[Link of the github repository](https://github.com/Steve-GB7/home-vault)

---

## Proof of Google AI Usage

Proof of Google AI integration, sample API request/response payloads, and execution verifications are included in the [/proofs](proofs/) folder:
- **Multimodal OCR Extraction Verification:** Verification tests demonstrating Gemini Vision parsing raw warranty cards into structured appliance metadata.
- **Gemini Assistant Context Test:** Script outputs demonstrating contextual Q&A with live lifetime spend aggregation (`scratch/test_chatbot.ts`, `scratch/test_gemini.ts`).
- **Gemini API Console & Logs:** Authenticated request traces utilizing `@google/genai` with model `gemini-flash-lite-latest`.

---

## Screenshots

Project screenshots are available in the [/screenshots](screenshots/) folder:

| Screen | Description |
| :--- | :--- |
| **Household Appliance Passport** | Centralized dashboard displaying all appliances, warranty status, and AMC countdowns |
| **AI Warranty Card Scanner** | Gemini multimodal OCR extracting serial number, brand, model, and dates from raw images |
| **AI Assistant Concierge** | Context-aware chat assistant calculating spend and answering warranty questions |
| **Service Desk & Complaint Intake** | Authorized business portal showing assigned tickets with video evidence |
| **Ticket Details & Video Evidence** | Authenticated video evidence player, privacy-shielded passport context, and rejection actions |

---

## Demo Video

Upload your demo video to Google Drive and paste the shareable link here(max 3 minutes). [Watch Demo](https://)

---

## Installation Steps

Follow these steps to set up and run HomeVault locally:

### 1. Prerequisites
- **Node.js:** v20.x or later installed
- **npm** or **pnpm** installed
- **Supabase Account:** A free Supabase project for PostgreSQL and storage
- **Google Gemini API Key:** An API key from [Google AI Studio](https://aistudio.google.com/)

### 2. Clone the Repository
```bash
git clone https://github.com/Steve-GB7/home-vault.git
cd home-vault
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
Create a `.env.local` file in the root directory and populate the required keys:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Google Gemini AI Configuration
GEMINI_API_KEY=your_google_gemini_api_key
GEMINI_MODEL=gemini-flash-lite-latest

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Set Up Database Schema
Apply the database migrations and seed data in your Supabase SQL editor:
1. Run migrations located in `supabase/migrations/`
2. (Optional) Run `supabase/seed.sql` to populate sample households, appliances, service records, and authorized service businesses.

### 6. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

### 7. Build for Production
To test the optimized production build and verify type safety:
```bash
npm run build
npm run start
```
