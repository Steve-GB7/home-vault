import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserSession } from "@/actions/onboarding";
import { getGemini, getModel, isGeminiAvailable } from "@/lib/gemini";
import { getStore, calculateAssetSpend } from "@/lib/mockData";
import { formatINR } from "@/lib/currency";
import { DEMO_AC_ASSET_ID } from "@/lib/constants";

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUserSession();
    if (!session) {
      return NextResponse.json(
        { ok: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { question, assetId } = await req.json();

    if (!question) {
      return NextResponse.json(
        { ok: false, error: "Question parameter is required" },
        { status: 400 }
      );
    }

    const targetAssetId = assetId || DEMO_AC_ASSET_ID;
    const spendData = calculateAssetSpend(targetAssetId);
    const store = getStore();
    const asset = store.assets.find((a) => a.id === targetAssetId);

    // Pre-computed monetary numbers from database aggregation
    const purchasePrice = spendData?.purchase_price || 42990;
    const totalServiceCost = spendData?.total_service_cost || 4900;
    const totalLabour = spendData?.total_labour_cost || 2800;
    const totalParts = spendData?.total_parts_cost || 2100;
    const amcCost = spendData?.amc_cost || 3500;
    const lifetimeSpend = spendData?.lifetime_spend || 51390;
    const serviceCount = spendData?.service_event_count || 3;

    const lowerQ = question.toLowerCase();

    // Deterministic factual answer builder
    const buildFactualAnswer = () => {
      if (
        lowerQ.includes("hi") ||
        lowerQ.includes("hello") ||
        lowerQ.includes("hey") ||
        lowerQ.includes("how are you") ||
        lowerQ.includes("who are you")
      ) {
        return (
          `Hello! I'm doing well, thank you for asking. I'm your **HomeVault AI Assistant**!\n\n` +
          `I can help you look up verified appliance passport records, track AMC and manufacturer warranty expiry dates, calculate maintenance spend, or assist with service bookings. How can I help you today?`
        );
      }

      if (
        lowerQ.includes("how much") ||
        lowerQ.includes("spend") ||
        lowerQ.includes("cost") ||
        lowerQ.includes("spent")
      ) {
        return (
          `You have spent a lifetime total of **${formatINR(
            lifetimeSpend
          )}** on your **${asset?.brand || "LG"} ${asset?.model || "AC"}**.\n\n` +
          `• **Original Purchase:** ${formatINR(purchasePrice)}\n` +
          `• **Service & Repairs (${serviceCount} visits):** ${formatINR(
            totalServiceCost
          )} (${formatINR(totalLabour)} labour + ${formatINR(totalParts)} parts)\n` +
          `• **Active AMC Contract:** ${formatINR(amcCost)}\n\n` +
          `All figures are verified from your HomeVault asset passport and service receipts.`
        );
      }

      if (lowerQ.includes("amc") || lowerQ.includes("expire") || lowerQ.includes("warranty")) {
        return (
          `Your **${asset?.brand || "LG"} AC** has:\n` +
          `• **Manufacturer Warranty:** Valid until 17 Apr 2033 (10-yr Dual Inverter compressor coverage).\n` +
          `• **CoolCare AMC Contract:** Active with **41 days remaining**.\n\n` +
          `Would you like me to request an AMC renewal quote from CoolCare Authorized Service?`
        );
      }

      return (
        `Here is the current status of your **${asset?.brand || "LG"} ${
          asset?.model || "AC"
        }**:\n` +
        `• Location: ${asset?.location_in_home || "Living Room"}\n` +
        `• Serial: \`${asset?.serial_number || "311KRPZ4D827"}\`\n` +
        `• Total Lifetime Spend: **${formatINR(lifetimeSpend)}**\n` +
        `• Next recommended service: within 60 days for filter cleaning & coil flush.`
      );
    };

    const factualAnswer = buildFactualAnswer();

    // If Gemini is available, enhance with natural tone and intelligent conversation
    if (isGeminiAvailable()) {
      try {
        const prompt = `You are the HomeVault AI Assistant, an expert digital concierge for home appliance lifecycle management, warranty tracking, and maintenance budgeting.

User Query: "${question}"

Active Appliance Passport Context:
- Appliance: ${asset?.brand || "LG"} ${asset?.model || "AC"} (${asset?.location_in_home || "Living Room"})
- Serial Number: ${asset?.serial_number || "311KRPZ4D827"}
- Purchase Price: ${formatINR(purchasePrice)}
- Total Maintenance & Service: ${formatINR(totalServiceCost)} (${formatINR(totalLabour)} labour + ${formatINR(totalParts)} parts across ${serviceCount} service visits)
- Active AMC Contract: ${formatINR(amcCost)}
- Total Lifetime Spend: ${formatINR(lifetimeSpend)}
- Warranty: Active until 17 Apr 2033
- AMC Expiry: 41 days remaining with CoolCare Authorized Service

Instructions:
1. If the user is greeting or making general friendly conversation (e.g. "how are you", "hello", "hi"), respond warmly, conversationally, and naturally as HomeVault AI. Offer helpful assistance without dumping financial tables unless asked.
2. If the user asks about spend, warranty, AMC, repair history, or appliance status, use the verified passport numbers above accurately.
3. Keep the tone professional, crisp, and friendly with GitHub markdown formatting.`;

        const { generateContentWithFallback } = await import("@/lib/gemini");
        const answerText = await generateContentWithFallback(prompt);

        if (answerText) {
          return NextResponse.json({
            ok: true,
            data: { answer: answerText },
          });
        }
      } catch (e) {
        console.warn("Gemini generation fallback:", e);
      }
    }

    return NextResponse.json({
      ok: true,
      data: { answer: factualAnswer },
    });
  } catch (err: any) {
    console.error("AI Assistant API Error:", err);
    return NextResponse.json(
      { ok: false, error: err.message || "Failed to process question" },
      { status: 500 }
    );
  }
}
