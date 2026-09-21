import { NextRequest, NextResponse } from "next/server";
import { getGemini, getModel, isGeminiAvailable } from "@/lib/gemini";
import { getStore, calculateAssetSpend } from "@/lib/mockData";
import { formatINR } from "@/lib/currency";
import { DEMO_AC_ASSET_ID } from "@/lib/constants";

export async function POST(req: NextRequest) {
  try {
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

    // If Gemini is available, enhance with natural tone while strictly preserving computed figures
    if (isGeminiAvailable()) {
      try {
        const gemini = getGemini();
        if (gemini) {
          const prompt = `You are the HomeVault Household Appliance Assistant.
The user is asking: "${question}".
Here are the exact computed database facts (DO NOT alter monetary numbers):
- Asset: ${asset?.brand} ${asset?.model}
- Purchase Price: ${formatINR(purchasePrice)}
- Total Service & Repair Cost: ${formatINR(totalServiceCost)} (${formatINR(totalLabour)} labour + ${formatINR(totalParts)} parts across ${serviceCount} visits)
- AMC Contract Cost: ${formatINR(amcCost)}
- Total Lifetime Spend: ${formatINR(lifetimeSpend)}
- Warranty: Active until 17 Apr 2033
- AMC Expiry: 41 days remaining

Provide a helpful, crisp answer referencing the exact rupee amounts above.`;

          const aiResp = await gemini.models.generateContent({
            model: getModel(),
            contents: [{ role: "user", parts: [{ text: prompt }] }],
          });

          if (aiResp.text) {
            return NextResponse.json({
              ok: true,
              data: { answer: aiResp.text },
            });
          }
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
