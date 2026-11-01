import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";
import { pool } from "./db.js";
import { asyncHandler } from "./lib/asyncHandler.js";
import { generateWithAttachment } from "./lib/ai.js";
import {
  productFormSchema,
  productScanSystemPrompt,
} from "./lib/systemPromptFOrPdfScan.js";
const upload = multer({ storage: multer.memoryStorage() });

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
      is_active,
      isActive,
    } = req.body;

    const active =
      is_active !== undefined
        ? is_active
        : isActive !== undefined
          ? isActive
          : true;

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
                low_stock_reminder,
                is_active
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
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
        active,
      ],
    );

    return res.status(201).json(result.rows[0]);
  }),
);

// Update an item
app.put(
  "/inventory/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const itemId = Number(req.params.id);
    if (!itemId || isNaN(itemId)) {
      return res.status(400).json({ error: "A valid numeric ID is required." });
    }

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
      is_active,
      isActive,
    } = req.body;

    const active =
      is_active !== undefined
        ? is_active
        : isActive !== undefined
          ? isActive
          : null;

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
                 is_active = COALESCE($10, is_active),
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $11 
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
        active,
        itemId,
      ],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    return res.status(200).json(result.rows[0]);
  }),
);

// Toggle or update item active status
app.patch(
  "/inventory/:id/status",
  asyncHandler(async (req: Request, res: Response) => {
    const itemId = Number(req.params.id);
    if (!itemId || isNaN(itemId)) {
      return res.status(400).json({ error: "A valid numeric ID is required." });
    }

    const { is_active, isActive } = req.body;
    const active =
      is_active !== undefined
        ? is_active
        : isActive !== undefined
          ? isActive
          : null;

    const result = await pool.query(
      `UPDATE items 
             SET is_active = COALESCE($1, NOT is_active),
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $2 
             RETURNING *`,
      [active, itemId],
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
    const itemId = Number(req.params.id);
    if (!itemId || isNaN(itemId)) {
      return res.status(400).json({ error: "A valid numeric ID is required." });
    }

    const result = await pool.query(
      "DELETE FROM items WHERE id = $1 RETURNING id",
      [itemId],
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
    const itemId = Number(req.params.id);
    if (!itemId || isNaN(itemId)) {
      return res.status(400).json({ error: "A valid numeric ID is required." });
    }
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
      [quantity, itemId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    return res.status(200).json(result.rows[0]);
  }),
);

app.post(
  "/scan-attachment",
  upload.single("attachment"),
  asyncHandler(async (req: Request, res: Response) => {
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        error:
          "No file uploaded. Please attach a file under the 'attachment' key.",
      });
    }

    const prompt =
      (req.body.prompt as string) ||
      "Extract product and pricing information from this document for inventory registration.";

    const result = await generateWithAttachment({
      prompt,
      buffer: file.buffer,
      mimeType: file.mimetype,
      filename: file.originalname,
      systemPrompt: productScanSystemPrompt,
      responseSchema: productFormSchema,
    });

    if (!result) {
      return res.status(502).json({
        success: false,
        error: "No response received from the extraction model.",
      });
    }

    try {
      // With responseSchema active, result is guaranteed to be a valid JSON string
      const parsedData = JSON.parse(result);

      return res.json({
        success: true,
        data: parsedData,
      });
    } catch {
      return res.status(500).json({
        success: false,
        error: "Failed to parse model response into JSON.",
        raw: result,
      });
    }
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
