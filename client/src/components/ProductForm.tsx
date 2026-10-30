import { useState, type ChangeEvent, type FormEvent } from "react";
import ScanButtons from "./ScanButtons";
import {
  scanAttachment,
  createInventory,
  type ScannedProductData,
} from "../apiHandler/api";
import { CheckCircle2, AlertCircle, Sparkles } from "lucide-react";

const initialValues = {
  name: "",
  sku: "",
  barcode: "",
  category: "",
  cost_price: "",
  sell_price_min: "",
  sell_price_max: "",
  stock: "",
  low_stock_reminder: "",
};

interface ProductFormProps {
  onSuccess?: () => void;
}

function ProductForm({ onSuccess }: ProductFormProps) {
  const [formData, setFormData] = useState(initialValues);
  const [scannedData, setScannedData] = useState<ScannedProductData | null>(
    null,
  );
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleScan = async (file: File) => {
    setIsScanning(true);
    setScanStatus(null);
    setSubmitError(null);

    try {
      const response = await scanAttachment(file);

      if (response.success && response.data) {
        const data = response.data;
        setScannedData(data);

        setFormData((prev) => ({
          ...prev,
          name: data.name ?? prev.name,
          sku: data.sku ?? prev.sku,
          barcode: data.barcode ?? prev.barcode,
          category: data.category ?? prev.category,
          cost_price:
            data.cost_price !== undefined
              ? String(data.cost_price)
              : prev.cost_price,
          sell_price_min:
            data.sell_price_min !== undefined
              ? String(data.sell_price_min)
              : prev.sell_price_min,
          sell_price_max:
            data.sell_price_max !== undefined
              ? String(data.sell_price_max)
              : prev.sell_price_max,
          stock: data.stock !== undefined ? String(data.stock) : prev.stock,
          low_stock_reminder:
            data.low_stock_reminder !== undefined
              ? String(data.low_stock_reminder)
              : prev.low_stock_reminder,
        }));

        setScanStatus({
          type: "success",
          message: `Successfully extracted product details from "${file.name}".`,
        });
      } else {
        setScanStatus({
          type: "error",
          message:
            response.error ||
            "Failed to extract product data from the document.",
        });
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while scanning.";
      setScanStatus({
        type: "error",
        message: msg,
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const payload = {
        name: formData.name.trim(),
        sku: formData.sku.trim(),
        barcode: formData.barcode.trim() || null,
        category: formData.category.trim() || null,
        cost_price: Number(formData.cost_price) || 0,
        sell_price_min: Number(formData.sell_price_min) || 0,
        sell_price_max: Number(formData.sell_price_max) || 0,
        stock: Number(formData.stock) || 0,
        low_stock_reminder: Number(formData.low_stock_reminder) || 5,
      };

      await createInventory(payload);
      setFormData(initialValues);
      setScannedData(null);
      setScanStatus(null);

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to create product.";
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 rounded-lg border bg-neutral-50 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-700">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span>AI Document / Tag Scanner</span>
          </div>
          {scannedData && (
            <span className="text-xs text-green-700 font-medium flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> Auto-filled by scan
            </span>
          )}
        </div>

        <ScanButtons onFileSelect={handleScan} isScanning={isScanning} />

        {scanStatus && (
          <div
            className={`flex items-start gap-2 rounded-md p-2.5 text-xs ${
              scanStatus.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {scanStatus.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600 mt-0.5" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
            )}
            <span>{scanStatus.message}</span>
          </div>
        )}
      </div>

      {submitError && (
        <div className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex gap-4">
          <div className="flex flex-1 flex-col gap-1">
            <label htmlFor="name" className="text-sm font-medium">
              Product Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className="w-full rounded border p-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Wireless Mouse"
            />
          </div>

          <div className="flex flex-1 flex-col gap-1">
            <label htmlFor="sku" className="text-sm font-medium">
              SKU *
            </label>
            <input
              type="text"
              id="sku"
              name="sku"
              className="w-full rounded border p-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
              value={formData.sku}
              onChange={handleChange}
              required
              placeholder="e.g. WM-1002"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex flex-1 flex-col gap-1">
            <label htmlFor="barcode" className="text-sm font-medium">
              Barcode
            </label>
            <input
              type="text"
              id="barcode"
              name="barcode"
              value={formData.barcode}
              onChange={handleChange}
              className="w-full rounded border p-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
              placeholder="e.g. 793573189240"
            />
          </div>

          <div className="flex flex-1 flex-col gap-1">
            <label htmlFor="category" className="text-sm font-medium">
              Category
            </label>
            <input
              type="text"
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full rounded border p-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
              placeholder="e.g. Electronics"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex flex-1 flex-col gap-1">
            <label htmlFor="cost_price" className="text-sm font-medium">
              Cost Price ($)
            </label>
            <input
              type="number"
              id="cost_price"
              name="cost_price"
              min={0}
              step="0.01"
              className="w-full rounded border p-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
              value={formData.cost_price}
              onChange={handleChange}
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex flex-1 flex-col gap-1">
            <label htmlFor="sell_price_min" className="text-sm font-medium">
              Minimum Selling Price ($)
            </label>
            <input
              type="number"
              id="sell_price_min"
              name="sell_price_min"
              min={0}
              step="0.01"
              className="w-full rounded border p-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
              value={formData.sell_price_min}
              onChange={handleChange}
              placeholder="0.00"
            />
          </div>

          <div className="flex flex-1 flex-col gap-1">
            <label htmlFor="sell_price_max" className="text-sm font-medium">
              Maximum Selling Price ($)
            </label>
            <input
              type="number"
              id="sell_price_max"
              name="sell_price_max"
              min={0}
              step="0.01"
              className="w-full rounded border p-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
              value={formData.sell_price_max}
              onChange={handleChange}
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex flex-1 flex-col gap-1">
            <label htmlFor="stock" className="text-sm font-medium">
              Stock Quantity
            </label>
            <input
              type="number"
              id="stock"
              name="stock"
              min={0}
              className="w-full rounded border p-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
              value={formData.stock}
              onChange={handleChange}
              placeholder="0"
            />
          </div>

          <div className="flex flex-1 flex-col gap-1">
            <label htmlFor="low_stock_reminder" className="text-sm font-medium">
              Low Stock Reminder
            </label>
            <input
              type="number"
              id="low_stock_reminder"
              name="low_stock_reminder"
              min={0}
              className="w-full rounded border p-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
              value={formData.low_stock_reminder}
              onChange={handleChange}
              placeholder="5"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded border border-black bg-black py-2.5 px-4 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-50"
        >
          {isSubmitting ? "Adding Product..." : "Add Product"}
        </button>
      </form>
    </div>
  );
}

export default ProductForm;
