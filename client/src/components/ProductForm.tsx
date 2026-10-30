import { Scan, ScanBox } from "lucide-react";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { ScanButtons } from "./ScanButtons";

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

function ProductForm() {
  const [formData, setFormData] = useState(initialValues);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(formData);
    const payload = {
      ...formData,
      cost_price: Number(formData.cost_price) || 0,
      sell_price_min: Number(formData.sell_price_min) || 0,
      sell_price_max: Number(formData.sell_price_max) || 0,
      stock: Number(formData.stock) || 0,
      low_stock_reminder: Number(formData.low_stock_reminder) || 5,
    };
    const res = await fetch("http://localhost:5002/inventory", {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // Tell the server you are sending JSON data
      },
      body: JSON.stringify(payload), // Convert the JavaScript object into a JSON string
    });
    const data = await res.json();
    console.log(data);
  };

  return (
    <div className="flex flex-col gap-4">
      <ScanButtons />
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex gap-4">
          <div className="flex flex-1 flex-col gap-1">
            <label htmlFor="name">Product Name</label>
            <input
              type="text"
              id="name"
              name="name"
              className="w-full rounded border p-2"
              required
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className="flex flex-1 flex-col gap-1">
            <label htmlFor="sku">SKU</label>
            <input
              type="text"
              id="sku"
              name="sku"
              className="w-full rounded border p-2"
              value={formData.sku}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex flex-1 flex-col gap-1">
            <label htmlFor="barcode">Barcode</label>
            <input
              type="text"
              id="barcode"
              name="barcode"
              value={formData.barcode}
              onChange={handleChange}
              className="w-full rounded border p-2"
            />
          </div>

          <div className="flex flex-1 flex-col gap-1">
            <label htmlFor="category">Category</label>
            <input
              type="text"
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full rounded border p-2"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex flex-1 flex-col gap-1">
            <label htmlFor="cost_price">Cost Price</label>
            <input
              type="number"
              id="cost_price"
              name="cost_price"
              min={0}
              step="0.01"
              className="w-full rounded border p-2"
              value={formData.cost_price}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex flex-1 flex-col gap-1">
            <label htmlFor="sell_price_min">Minimum Selling Price</label>
            <input
              type="number"
              id="sell_price_min"
              name="sell_price_min"
              min={0}
              step="0.01"
              className="w-full rounded border p-2"
              value={formData.sell_price_min}
              onChange={handleChange}
            />
          </div>

          <div className="flex flex-1 flex-col gap-1">
            <label htmlFor="sell_price_max">Maximum Selling Price</label>
            <input
              type="number"
              id="sell_price_max"
              name="sell_price_max"
              min={0}
              step="0.01"
              className="w-full rounded border p-2"
              value={formData.sell_price_max}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex flex-1 flex-col gap-1">
            <label htmlFor="stock">Stock Quantity</label>
            <input
              type="number"
              id="stock"
              name="stock"
              min={0}
              className="w-full rounded border p-2"
              value={formData.stock}
              onChange={handleChange}
            />
          </div>

          <div className="flex flex-1 flex-col gap-1">
            <label htmlFor="low_stock_reminder">Low Stock Reminder</label>
            <input
              type="number"
              id="low_stock_reminder"
              name="low_stock_reminder"
              min={0}
              className="w-full rounded border p-2"
              value={formData.low_stock_reminder}
              onChange={handleChange}
            />
          </div>
        </div>

        <button type="submit" className="rounded border p-2">
          Add Product
        </button>
      </form>
    </div>
  );
}

export default ProductForm;
