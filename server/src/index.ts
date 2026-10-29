import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./db.js";
import { asyncHandler } from "./lib/asyncHandler.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5002;

app.use(
  cors({
    origin: "http://localhost:5001",
  }),
);
app.use(express.json());

// Health check
const healthCheck = asyncHandler(async (_req: Request, res: Response) => {
  const dbResult = await pool.query("SELECT NOW() AS db_time");

  return res.status(200).json({
    status: "OK",
    message: "Server and Database are healthy",
    timestamp: new Date().toISOString(),
    database: {
      connected: true,
      db_time: dbResult.rows[0].db_time,
    },
  });
});

app.get("/health", healthCheck);
app.get("/api/health", healthCheck);

// Get all inventory (with optional query filters: search, category, low_stock)
app.get(
  "/inventory",
  asyncHandler(async (req: Request, res: Response) => {
    const { search, category, low_stock } = req.query;

    const conditions: string[] = [];
    const values: unknown[] = [];

    if (search) {
      values.push(`%${search}%`);
      conditions.push(
        `(name ILIKE $${values.length} OR sku ILIKE $${values.length} OR barcode ILIKE $${values.length})`,
      );
    }

    if (category) {
      values.push(category);
      conditions.push(`category = $${values.length}`);
    }

    if (low_stock === "true") {
      conditions.push("stock <= low_stock_reminder");
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const result = await pool.query(
      `SELECT * FROM items ${whereClause} ORDER BY id ASC`,
      values,
    );

    return res.status(200).json(result.rows);
  }),
);

app.get(
  "/inventory/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await pool.query("SELECT * FROM items WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    return res.status(200).json(result.rows[0]);
  }),
);

/**
 * GET	/inventory/:id/stock-movements	View the item's stock-in/out history
 * GET	/stock-movements	            View stock movement history across all items
 * GET	/inventory/summary	            Get total items, total stock, and low-stock counts
 */

// Add an item
app.post(
  "/inventory",
  asyncHandler(async (req: Request, res: Response) => {
    const {
      name,
      sku,
      barcode,
      category,
      cost_price = 0,
      sell_price_min = 0,
      sell_price_max = 0,
      stock = 0,
      low_stock_reminder = 5,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO items (
                name,
                sku,
                barcode,
                category,
                cost_price,
                sell_price_min,
                sell_price_max,
                stock,
                low_stock_reminder
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [
        name,
        sku,
        barcode || null,
        category || null,
        cost_price || 0,
        sell_price_min || 0,
        sell_price_max || 0,
        stock,
        low_stock_reminder,
      ],
    );

    return res.status(201).json(result.rows[0]);
  }),
);

// Update an item
app.put(
  "/inventory/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const {
      name,
      sku,
      barcode,
      category,
      cost_price,
      sell_price_min,
      sell_price_max,
      stock,
      low_stock_reminder,
    } = req.body;

    const result = await pool.query(
      `UPDATE items 
             SET name = $1,
                 sku = $2,
                 barcode = $3,
                 category = $4,
                 cost_price = $5,
                 sell_price_min = $6,
                 sell_price_max = $7,
                 stock = $8,
                 low_stock_reminder = $9,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $10 
             RETURNING *`,
      [
        name,
        sku,
        barcode || null,
        category || null,
        cost_price || 0,
        sell_price_min || 0,
        sell_price_max || 0,
        stock || 0,
        low_stock_reminder || 5,
        id,
      ],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    return res.status(200).json(result.rows[0]);
  }),
);

// Delete an item
app.delete(
  "/inventory/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM items WHERE id = $1 RETURNING id",
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    return res.status(200).json({
      message: "Item deleted successfully",
    });
  }),
);

// Create a stock movement
app.post(
  "/inventory/:id/stock-movements",
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { quantity, stockMovementType } = req.body;

    const queries: Record<string, string> = {
      STOCK_IN: "stock + $1",
      STOCK_OUT: "stock - $1",
      SET_STOCK: "$1",
    };

    const operation = queries[stockMovementType];

    if (!operation) {
      return res.status(400).json({
        error: "Invalid stockMovementType",
      });
    }

    const result = await pool.query(
      `UPDATE items 
             SET stock = ${operation},
                 updated_at = CURRENT_TIMESTAMP 
             WHERE id = $2 
             RETURNING *`,
      [quantity, id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    return res.status(200).json(result.rows[0]);
  }),
);

// Global error handler — must be after all routes
app.use((err: Error, _req: Request, res: Response, next: NextFunction) => {
  console.error(err);

  if (res.headersSent) {
    return next(err);
  }

  return res.status(500).json({
    error: "Internal Server Error",
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
