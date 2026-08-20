const path = require("path");

// Serve frontend files
app.use(express.static(path.join(__dirname, "../frontend")));  // change path if needed

// Fallback for SPA (optional)
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/index.html"));
});
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const db = require("./db");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
    res.json({
        message: "Inventory Management System API is running"
    });
});

// =========================
// GET all products
// =========================
app.get("/api/products", async (req, res) => {
    try {
        const [products] = await db.query(
            "SELECT * FROM products ORDER BY id ASC"
        );
        res.json(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ message: "Failed to fetch products" });
    }
});

// =========================
// GET single product by ID
// =========================
app.get("/api/products/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const [products] = await db.query(
            "SELECT * FROM products WHERE id = ?",
            [id]
        );

        if (products.length === 0) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.json(products[0]);
    } catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).json({ message: "Failed to fetch product" });
    }
});

// =========================
// CREATE new product
// =========================
app.post("/api/products", async (req, res) => {
    try {
        const { name, category, price, quantity, description } = req.body;

        if (!name || !category || price == null || quantity == null) {
            return res.status(400).json({
                message: "Name, category, price and quantity are required"
            });
        }

        const [result] = await db.query(
            `INSERT INTO products (name, category, price, quantity, description)
             VALUES (?, ?, ?, ?, ?)`,
            [name, category, price, quantity, description || null]
        );

        res.status(201).json({
            message: "Product added successfully",
            id: result.insertId
        });
    } catch (error) {
        console.error("Error adding product:", error);
        res.status(500).json({ message: "Failed to add product" });
    }
});

// =========================
// UPDATE product
// =========================
app.put("/api/products/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { name, category, price, quantity, description } = req.body;

        const [result] = await db.query(
            `UPDATE products 
             SET name = ?, category = ?, price = ?, quantity = ?, description = ?
             WHERE id = ?`,
            [name, category, price, quantity, description || null, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.json({ message: "Product updated successfully" });
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ message: "Failed to update product" });
    }
});

// =========================
// DELETE product
// =========================
app.delete("/api/products/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.query(
            "DELETE FROM products WHERE id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.json({ message: "Product deleted successfully" });
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ message: "Failed to delete product" });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});