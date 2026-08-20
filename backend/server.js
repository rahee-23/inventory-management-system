const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const db = require("./db");

// Load .env from backend folder
dotenv.config({
    path: path.join(__dirname, ".env")
});

const app = express();
const PORT = process.env.PORT || 5000;

// =========================
// Middleware
// =========================

app.use(cors());
app.use(express.json());

// =========================
// Create Products Table
// =========================

async function initializeDatabase() {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS products (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                category VARCHAR(255) NOT NULL,
                price DECIMAL(10, 2) NOT NULL,
                quantity INTEGER NOT NULL DEFAULT 0,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log("Database table is ready");
    } catch (error) {
        console.error("Database initialization error:", error.message);
    }
}

// =========================
// Home Route
// =========================

app.get("/", (req, res) => {
    res.json({
        message: "Inventory Management System API is running"
    });
});

// =========================
// Test Database Connection
// =========================

app.get("/api/test-db", async (req, res) => {
    try {
        const result = await db.query("SELECT 1 AS result");

        res.json({
            message: "Database connected successfully",
            result: result.rows
        });
    } catch (error) {
        console.error("Database connection error:", error);

        res.status(500).json({
            message: "Database connection failed"
        });
    }
});

// =========================
// GET ALL PRODUCTS
// =========================

app.get("/api/products", async (req, res) => {
    try {
        const result = await db.query(
            "SELECT * FROM products ORDER BY id DESC"
        );

        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching products:", error);

        res.status(500).json({
            message: "Failed to fetch products"
        });
    }
});

// =========================
// GET ONE PRODUCT
// =========================

app.get("/api/products/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const result = await db.query(
            "SELECT * FROM products WHERE id = $1",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.json(result.rows[0]);

    } catch (error) {
        console.error("Error fetching product:", error);

        res.status(500).json({
            message: "Failed to fetch product"
        });
    }
});

// =========================
// ADD PRODUCT
// =========================

app.post("/api/products", async (req, res) => {
    try {
        const {
            name,
            category,
            price,
            quantity,
            description
        } = req.body;

        if (!name || !category || price === undefined || quantity === undefined) {
            return res.status(400).json({
                message: "Name, category, price and quantity are required"
            });
        }

        if (Number(price) < 0 || Number(quantity) < 0) {
            return res.status(400).json({
                message: "Price and quantity cannot be negative"
            });
        }

        const result = await db.query(
            `INSERT INTO products
            (name, category, price, quantity, description)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id`,
            [
                name,
                category,
                price,
                quantity,
                description || null
            ]
        );

        res.status(201).json({
            message: "Product added successfully",
            productId: result.rows[0].id
        });

    } catch (error) {
        console.error("Error adding product:", error);

        res.status(500).json({
            message: "Failed to add product"
        });
    }
});

// =========================
// UPDATE PRODUCT
// =========================

app.put("/api/products/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const {
            name,
            category,
            price,
            quantity,
            description
        } = req.body;

        if (!name || !category || price === undefined || quantity === undefined) {
            return res.status(400).json({
                message: "Name, category, price and quantity are required"
            });
        }

        if (Number(price) < 0 || Number(quantity) < 0) {
            return res.status(400).json({
                message: "Price and quantity cannot be negative"
            });
        }

        const result = await db.query(
            `UPDATE products
             SET name = $1,
                 category = $2,
                 price = $3,
                 quantity = $4,
                 description = $5
             WHERE id = $6`,
            [
                name,
                category,
                price,
                quantity,
                description || null,
                id
            ]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.json({
            message: "Product updated successfully"
        });

    } catch (error) {
        console.error("Error updating product:", error);

        res.status(500).json({
            message: "Failed to update product"
        });
    }
});

// =========================
// DELETE PRODUCT
// =========================

app.delete("/api/products/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const result = await db.query(
            "DELETE FROM products WHERE id = $1",
            [id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.json({
            message: "Product deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting product:", error);

        res.status(500).json({
            message: "Failed to delete product"
        });
    }
});

// =========================
// START SERVER
// =========================

initializeDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
});