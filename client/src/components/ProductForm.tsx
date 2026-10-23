function ProductForm({ setIsOpen }) {
  return (
    <form className="flex flex-col gap-4 border p-8">
      <div className="flex justify-end">
        <span className="p-1 border-2 inline-block cursor-pointer">x</span>
      </div>
      
      <div className="flex gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="name">Product Name</label>
          <input
            type="text"
            id="name"
            name="name"
            className="w-full rounded border p-2"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="sku">SKU</label>
          <input
            type="text"
            id="sku"
            name="sku"
            className="w-full rounded border p-2"
          />
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="barcode">Barcode</label>
          <input
            type="text"
            id="barcode"
            name="barcode"
            className="w-full rounded border p-2"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="category">Category</label>
          <input
            type="text"
            id="category"
            name="category"
            className="w-full rounded border p-2"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="cost_price">Cost Price</label>
        <input
          type="number"
          id="cost_price"
          name="cost_price"
          defaultValue={0}
          className="w-full rounded border p-2"
        />
      </div>

      <div className="flex gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="sell_price_min">Minimum Selling Price</label>
          <input
            type="number"
            id="sell_price_min"
            name="sell_price_min"
            defaultValue={0}
            className="w-full rounded border p-2"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="sell_price_max">Maximum Selling Price</label>
          <input
            type="number"
            id="sell_price_max"
            name="sell_price_max"
            defaultValue={0}
            className="w-full rounded border p-2"
          />
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="stock">Stock Quantity</label>
          <input
            type="number"
            id="stock"
            name="stock"
            defaultValue={0}
            className="w-full rounded border p-2"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="low_stock_reminder">Low Stock Reminder</label>
          <input
            type="number"
            id="low_stock_reminder"
            name="low_stock_reminder"
            defaultValue={5}
            className="w-full rounded border p-2"
          />
        </div>
      </div>

      <button type="submit" className="rounded border p-2">
        Add Product
      </button>
    </form>
  );
}

export default ProductForm;
