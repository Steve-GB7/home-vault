import { z } from "zod";

export const OcrResultSchema = z.object({
  brand: z.string().nullable(),
  model: z.string().nullable(),
  serial_number: z.string().nullable(),
  category: z
    .enum([
      "air_conditioner",
      "refrigerator",
      "washing_machine",
      "television",
      "ro_water_purifier",
      "microwave",
      "geyser",
      "dishwasher",
      "other",
    ])
    .nullable(),
  purchase_date: z.string().nullable(),
  purchase_price: z.number().nullable(),
  currency: z.string().nullable(),
  seller_name: z.string().nullable(),
  warranty_months: z.number().nullable(),
  extended_warranty_months: z.number().nullable(),
  amc_included: z.boolean().default(false),
  line_items: z
    .array(
      z.object({
        description: z.string(),
        qty: z.number(),
        amount: z.number(),
      })
    )
    .default([]),
  confidence: z.record(z.string(), z.number()).default({}),
});

export type OcrResult = z.infer<typeof OcrResultSchema>;

export const OCR_SYSTEM_INSTRUCTION = `You are an appliance invoice parser. Extract the following fields from the provided invoice image or PDF.

Rules:
- Return null rather than guessing any field
- Never invent a serial number
- Dates must be ISO-8601 format (yyyy-mm-dd)
- Amounts must be numeric without currency symbols
- For category, use one of: air_conditioner, refrigerator, washing_machine, television, ro_water_purifier, microwave, geyser, dishwasher, other
- Include a confidence score (0.0 to 1.0) for each field you extract

Return a JSON object with these fields:
{
  "brand": string | null,
  "model": string | null,
  "serial_number": string | null,
  "category": string | null,
  "purchase_date": string | null,
  "purchase_price": number | null,
  "currency": string | null,
  "seller_name": string | null,
  "warranty_months": number | null,
  "extended_warranty_months": number | null,
  "amc_included": boolean,
  "line_items": [{"description": string, "qty": number, "amount": number}],
  "confidence": {"field_name": 0.0-1.0}
}`;
