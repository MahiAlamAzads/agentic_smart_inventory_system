import { useEffect, useState } from "react";
import ProductForm from "./components/ProductForm";
import Modal from "./components/Modal";
import InventoryList from "./components/InventoryList";

interface Inventory {
  barcode: string;
  category: string;
  cost_price: string;
  created_at: string;
  id: number;
  low_stock_reminder: number;
  name: string;
  returned: 0;
  sell_price_max: string;
  sell_price_min: string;
  sku: string;
  stock: number;
  total_sell: number;
  updated_at: string;
}

export default function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<Inventory[]>();

  const getProducts = async () => {
    try {
      const res = await fetch("http://localhost:5002/inventory");
      const data: Inventory[] | undefined = await res.json();
      setData(data);
    } catch (err) {
      console.error("Failed to load inventory:", err);
    }
  };

  useEffect(() => {
    getProducts();
  }, []);

  return (
    <div className="min-h-screen flex flex-col max-w-7xl mx-auto">
      <nav className="p-1 border">
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="border p-2 bg-amber-200 hover:bg-amber-300 font-medium cursor-pointer rounded"
        >
          Add Items
        </button>
      </nav>

      <Modal
        title="Add Product"
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      >
        <ProductForm
          onSuccess={() => {
            setIsOpen(false);
            getProducts();
          }}
        />
      </Modal>

      <InventoryList items={data} />
    </div>
  );
}
