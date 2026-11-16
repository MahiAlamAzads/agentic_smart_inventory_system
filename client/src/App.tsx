import { useEffect, useState } from "react";
import ProductForm from "./components/ProductForm";
import Modal from "./components/Modal";
import InventoryList from "./components/InventoryList";
import {
  messages as initialMessages,
  type Message,
} from "./components/data/chat";

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
  is_active: boolean;
  updated_at: string;
}

export default function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<Inventory[]>();
  const [chatMessages, setChatMessages] = useState<Message[]>(initialMessages);

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
    <div className="min-h-screen flex flex-col px-10">
      <nav className="border">
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
          formMode="CREATE"
          onSuccess={() => {
            setIsOpen(false);
            getProducts();
          }}
        />
      </Modal>

      <div className="flex">
        <div className="w-[80%]">
          <InventoryList items={data} />
        </div>
        <div className="w-[20%] bg-amber-200 p-4 flex flex-col gap-2">
          {chatMessages.map((msg: Message) => (
            <div
              key={msg.id}
              className={`w-fit max-w-[85%] p-2 rounded-xl ${
                msg.sender === "you"
                  ? "self-end bg-amber-400"
                  : "self-start bg-white"
              }`}
            >
              {msg.message}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
