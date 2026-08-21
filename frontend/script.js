const API_URL = "https://inventory-management-api-zf8p.onrender.com/api/products";

let products = [];

// =========================
// Load Products
// =========================

async function loadProducts() {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Failed to fetch products");
        }

        products = await response.json();
        displayProducts(products);
    } catch (error) {
        console.error("Error loading products:", error);
    }
}

// =========================
// Display Products
// =========================

function displayProducts(productList) {
    const tableBody = document.getElementById("productTableBody");