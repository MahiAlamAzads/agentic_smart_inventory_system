import { SquarePen, Trash } from "lucide-react";
import { Switch } from "./ui/switch";


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
const InventoryList = ({ items }: { items: Inventory[] }) => {
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

        <tbody className="">
          {items?.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50">
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
              <td className="whitespace-nowrap px-4 py-3 border flex gap-1 justify-center items-center">
                <Trash />
                <SquarePen />
                <Switch />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InventoryList;
