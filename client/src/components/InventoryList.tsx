import { SquarePen, Trash } from "lucide-react";
import { Switch } from "./ui/switch";
import { useEffect, useState } from "react";
import Modal from "./Modal";
import ProductForm from "./ProductForm";

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
  is_active?: boolean;
  updated_at: string;
}

const InventoryList = ({ items }: { items: Inventory[] | undefined }) => {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selectedItem = items?.find((item) => item.id === selectedId);
  const [data, setData] = useState(items);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (items) {
      setData(items);
    }
  }, [items]);

  const openUpdateModal = () => {
    setIsOpen((prev) => !prev);
  };

  const handleToggleActive = async (id: number, currentStatus: boolean) => {
    try {
      const response = await fetch(`http://localhost:5002/inventory/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !currentStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      setData((currentData) =>
        currentData?.map((item) =>
          item.id === id ? { ...item, is_active: !currentStatus } : item
        )
      );
    } catch (error) {
      console.error("Error toggling active status:", error);
    }
  };

  const handleDelete = async (id: number) => {
    const url = `http://localhost:5002/inventory/${id}`;

    try {
      const response = await fetch(url, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Failed to delete resource: ${response.status}`);
      }
      setData((currentData) => currentData?.filter((item) => item.id !== id));
      console.log("Resource deleted successfully");
    } catch (error) {
      console.error("Error during DELETE request:", error);
    }
  };

  return (
    <div className="overflow-x-auto p-4">
      <table className="min-w-full overflow-hidden rounded-lg bg-white text-left text-sm shadow-sm border">
        <thead className="bg-gray-100 text-sm uppercase text-gray-900">
          <tr>
            <th scope="col" className="px-4 py-3 border">
              ID
            </th>
            <th scope="col" className="px-4 py-3 border">
              Product
            </th>
            <th scope="col" className="px-4 py-3 border">
              SKU
            </th>
            <th scope="col" className="px-4 py-3 border">
              Barcode
            </th>
            <th scope="col" className="px-4 py-3 border">
              Category
            </th>
            <th scope="col" className="px-4 py-3 border">
              Stock
            </th>
            <th scope="col" className="px-4 py-3 border">
              Cost price
            </th>
            <th scope="col" className="px-4 py-3 border">
              Selling price
            </th>
            <th scope="col" className="px-4 py-3 border">
              Low-stock reminder
            </th>
            <th scope="col" className="px-4 py-3 border">
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {data?.map((item) => (
            <tr
              key={item.id}
              className={`hover:bg-gray-50 ${item.is_active === false ? "opacity-60 bg-gray-50/50" : ""}`}
            >
              <td className="whitespace-nowrap px-4 py-3 font-medium border">
                #{item.id}
              </td>

              <td className="whitespace-nowrap px-4 py-3 font-semibold border">
                {item.name}
              </td>

              <td className="whitespace-nowrap px-4 py-3 border">{item.sku}</td>

              <td className="whitespace-nowrap px-4 py-3 border">
                {item.barcode || "N/A"}
              </td>

              <td className="whitespace-nowrap px-4 py-3 border">
                {item.category || "Uncategorized"}
              </td>

              <td className="whitespace-nowrap px-4 py-3 border">
                {item.stock}
              </td>

              <td className="whitespace-nowrap px-4 py-3 border">
                ${Number(item.cost_price).toFixed(2)}
              </td>

              <td className="whitespace-nowrap px-4 py-3 border">
                ${Number(item.sell_price_min).toFixed(2)} - $
                {Number(item.sell_price_max).toFixed(2)}
              </td>

              <td className="whitespace-nowrap px-4 py-3 border">
                {item.low_stock_reminder}
              </td>
              <td className="whitespace-nowrap px-4 py-3 border flex gap-2 justify-center items-center">
                <Trash
                  className="h-4 w-4 cursor-pointer text-red-500 hover:text-red-700"
                  onClick={() => handleDelete(item.id)}
                />
                <SquarePen
                  className="h-4 w-4 cursor-pointer text-blue-500 hover:text-blue-700"
                  onClick={() => {
                    setSelectedId(item.id);
                    openUpdateModal();
                  }}
                />
                <Switch
                  checked={item.is_active ?? true}
                  onCheckedChange={() =>
                    handleToggleActive(item.id, item.is_active ?? true)
                  }
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal
        title="Update Product"
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          setSelectedId(null);
        }}
      >
        <ProductForm
          initialData={selectedItem}
          id={selectedId}
          formMode="UPDATE"
          onSuccess={() => {
            setIsOpen(false);
            setSelectedId(null);
          }}
        />
      </Modal>
    </div>
  );
};

export default InventoryList;
