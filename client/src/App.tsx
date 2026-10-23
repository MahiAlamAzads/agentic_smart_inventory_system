import { useState } from "react";
import ProductForm from "./components/ProductForm";

export default function App() {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="min-h-screen flex flex-col max-w-7xl mx-auto">
      <nav className="p-1 border">
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="border p-2 bg-amber-200"
        >
          Add Items
        </button>
      </nav>
      <div>
        {/* modal */}
        {isOpen && (
          <div className="fixed top-1/2 -translate-y-1/2  left-1/2 -translate-x-1/2">
            <ProductForm setIsOpen={setIsOpen} />
          </div>
        )}
      </div>
    </div>
  );
}
