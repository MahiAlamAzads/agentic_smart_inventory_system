import { API_BASE_URL, handleApiResponse } from "./helper";

export interface ScannedProductData {
  name?: string;
  sku?: string;
  barcode?: string;
  category?: string;
  cost_price?: string;
  sell_price_min?: string;
  sell_price_max?: string;
  stock?: string;
  low_stock_reminder?: string;
}

export interface ScanAttachmentResponse {
  success: boolean;
  data?: ScannedProductData;
  error?: string;
  raw?: string;
}

export interface InventoryItem {
  id: number;
  name: string;
  sku: string;
  barcode: string | null;
  category: string | null;
  cost_price: string;
  sell_price_min: string;
  sell_price_max: string;
  stock: number;
  low_stock_reminder: number;
  total_sell: number;
  returned: number;
  created_at: string;
  updated_at: string;
}

export interface CreateInventoryPayload {
  name: string;
  sku: string;
  barcode?: string | null;
  category?: string | null;
  cost_price?: number;
  sell_price_min?: number;
  sell_price_max?: number;
  stock?: number;
  low_stock_reminder?: number;
}

// 1. Reusable update type: all fields optional
export type UpdateInventoryPayload = Partial<CreateInventoryPayload>;

/**
 * Scan an invoice, receipt, document, or product tag using Gemini multimodal AI
 */
export async function scanAttachment(
  file: File,
  prompt?: string,
): Promise<ScanAttachmentResponse> {
  const formData = new FormData();
  formData.append("attachment", file);
  if (prompt) {
    formData.append("prompt", prompt);
  }

  const response = await fetch(`${API_BASE_URL}/scan-attachment`, {
    method: "POST",
    body: formData,
  });

  return handleApiResponse<ScanAttachmentResponse>(response);
}

/**
 * Fetch all inventory items
 */
export async function getInventory(params?: {
  search?: string;
  category?: string;
  low_stock?: boolean;
}): Promise<InventoryItem[]> {
  const query = new URLSearchParams();
  if (params?.search) query.append("search", params.search);
  if (params?.category) query.append("category", params.category);
  if (params?.low_stock) query.append("low_stock", "true");

  const qs = query.toString() ? `?${query.toString()}` : "";
  const response = await fetch(`${API_BASE_URL}/inventory${qs}`);
  return handleApiResponse<InventoryItem[]>(response);
}

/**
 * Create a new inventory item
 */
export async function createInventory(
  payload: CreateInventoryPayload,
): Promise<InventoryItem> {
  const response = await fetch(`${API_BASE_URL}/inventory`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return handleApiResponse<InventoryItem>(response);
}

/**
 * Update an existing inventory item
 */
export async function updateInventoryItem(
  id: number | undefined | null,
  payload: UpdateInventoryPayload,
): Promise<InventoryItem> {
  const response = await fetch(`${API_BASE_URL}/inventory/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return handleApiResponse<InventoryItem>(response);
}
