import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI();

export const productScanSystemPrompt = `You are an automated inventory document, invoice, and product tag scanner.
Your goal is to extract item data from the attached file (image, PDF, receipt, invoice, or doc) to auto-fill an inventory registration form.

Extraction Guidelines:
- name: The clear product name or item title.
- sku: Product Stock Keeping Unit / SKU / item code. Leave empty string "" if not found.
- barcode: Numerical or alphanumeric barcode/EAN/UPC value if visible, else "".
- category: Logical category (e.g., "Clothing", "Electronics", "Groceries"). Infer logically if not explicitly labeled.
- cost_price: Unit purchase or cost price as a pure numeric string (e.g. "25.00"). No currency symbols ($ or €) or commas. If missing, return "0".
- sell_price_min: Minimum selling price or regular retail price as a pure numeric string. If only one selling price is listed on the document, use it for both sell_price_min and sell_price_max.
- sell_price_max: Maximum selling price or MRP as a pure numeric string. If not found or if there is no price range, use the same value as sell_price_min.
- stock: Available quantity or received units as an integer string (e.g. "10"). Default to "1" if not specified.
- low_stock_reminder: Reorder alert threshold. Default to "5" if not specified on the document.

Never return markdown code blocks, explanatory text, or conversational replies. Return strictly valid JSON conforming to the schema.`;

export const productFormSchema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING, description: "Full product title" },
    sku: { type: Type.STRING, description: "SKU or product code" },
    barcode: {
      type: Type.STRING,
      description: "Barcode number or empty string",
    },
    category: { type: Type.STRING, description: "Product category name" },
    cost_price: {
      type: Type.STRING,
      description: "Cost price as numeric string without currency symbols",
    },
    sell_price_min: {
      type: Type.STRING,
      description: "Minimum selling price numeric string",
    },
    sell_price_max: {
      type: Type.STRING,
      description: "Maximum selling price numeric string",
    },
    stock: {
      type: Type.STRING,
      description: "Initial quantity as an integer string",
    },
    low_stock_reminder: {
      type: Type.STRING,
      description: "Low stock alert threshold as integer string",
    },
  },
  required: [
    "name",
    "sku",
    "barcode",
    "category",
    "cost_price",
    "sell_price_min",
    "sell_price_max",
    "stock",
    "low_stock_reminder",
  ],
};
