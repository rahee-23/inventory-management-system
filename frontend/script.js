//const API_URL = "http://localhost:5000/api/products";
const API_URL = "https://inventory-management-api-zf8p.onrender.com/api/products";
let products = [];


// Load Products
async function loadProducts() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error("Failed to fetch products");
        }

        products = await response.json();

        displayProducts(products);
        updateDashboard(products);

    } catch (error) {
        console.error("Error loading products:", error);

        document.getElementById("productTableBody").innerHTML = `
            <tr>
                <td colspan="7">Failed to load products. Make sure the server is running.</td>
            </tr>
        `;
    }
}

// Display Products


function displayProducts(productList) {
    const tableBody = document.getElementById("productTableBody");

    tableBody.innerHTML = "";

    if (productList.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7">No products found.</td>
            </tr>
        `;
        return;
    }

    productList.forEach((product) => {

        let status = "";
        let statusClass = "";

        if (Number(product.quantity) === 0) {
            status = "Out of Stock";
            statusClass = "out-of-stock";
        } else if (Number(product.quantity) <= 10) {
            status = "Low Stock";
            statusClass = "low-stock";
        } else {
            status = "In Stock";
            statusClass = "in-stock";
        }

        tableBody.innerHTML += `
            <tr>
                <td>${product.id}</td>
                <td>${product.name}</td>
                <td>${product.category}</td>
                <td>৳ ${Number(product.price).toFixed(2)}</td>
                <td>${product.quantity}</td>
                <td>
                    <span class="status ${statusClass}">
                        ${status}
                    </span>
                </td>
                <td>
                    <button class="edit-button" onclick="editProduct(${product.id})">
                        Edit
                    </button>

                    <button class="delete-button" onclick="deleteProduct(${product.id})">
                        Delete
                    </button>
                </td>
            </tr>
        `;
    });
}


// =========================
// Update Dashboard
// =========================

function updateDashboard(productList) {

    const totalProducts = productList.length;

    const inStock = productList.filter(
        (product) => Number(product.quantity) > 10
    ).length;

    const lowStock = productList.filter(
        (product) =>
            Number(product.quantity) > 0 &&
            Number(product.quantity) <= 10
    ).length;

    const outOfStock = productList.filter(
        (product) => Number(product.quantity) === 0
    ).length;

    document.getElementById("totalProducts").textContent = totalProducts;
    document.getElementById("inStock").textContent = inStock;
    document.getElementById("lowStock").textContent = lowStock;
    document.getElementById("outOfStock").textContent = outOfStock;
}


// =========================
// Add or Update Product
// =========================

document.getElementById("productForm").addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        const productId = document.getElementById("productId").value;

        const productData = {
            name: document.getElementById("name").value,
            category: document.getElementById("category").value,
            price: Number(document.getElementById("price").value),
            quantity: Number(document.getElementById("quantity").value),
            description: document.getElementById("description").value
        };

        try {

            let response;

            // Update existing product
            if (productId) {
                response = await fetch(`${API_URL}/${productId}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(productData)
                });
            }

            // Add new product
            else {
                response = await fetch(API_URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(productData)
                });
            }

            const result = await response.json();

            if (!response.ok) {
                alert(result.message || "Operation failed");
                return;
            }

            alert(result.message);

            cancelEdit();
            loadProducts();

        } catch (error) {
            console.error("Error saving product:", error);
            alert("Failed to connect to the server");
        }
    }
);


// =========================
// Edit Product
// =========================

async function editProduct(id) {

    try {

        const response = await fetch(`${API_URL}/${id}`);

        if (!response.ok) {
            throw new Error("Failed to fetch product");
        }

        const product = await response.json();

        document.getElementById("productId").value = product.id;
        document.getElementById("name").value = product.name;
        document.getElementById("category").value = product.category;
        document.getElementById("price").value = product.price;
        document.getElementById("quantity").value = product.quantity;
        document.getElementById("description").value =
            product.description || "";

        document.getElementById("formTitle").textContent = "Edit Product";
        document.getElementById("submitButton").textContent = "Update Product";

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    } catch (error) {

        console.error("Error loading product:", error);
        alert("Failed to load product information");
    }
}


// =========================
// Cancel Edit
// =========================

function cancelEdit() {

    document.getElementById("productForm").reset();

    document.getElementById("productId").value = "";

    document.getElementById("formTitle").textContent = "Add New Product";

    document.getElementById("submitButton").textContent = "Add Product";
}


// =========================
// Delete Product
// =========================

async function deleteProduct(id) {

    const confirmed = confirm(
        "Are you sure you want to delete this product?"
    );

    if (!confirmed) {
        return;
    }

    try {

        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        const result = await response.json();

        if (!response.ok) {
            alert(result.message || "Failed to delete product");
            return;
        }

        alert(result.message);

        loadProducts();

    } catch (error) {

        console.error("Error deleting product:", error);
        alert("Failed to connect to the server");
    }
}


// =========================
// Search Products
// =========================

document.getElementById("searchInput").addEventListener(
    "input",
    function () {

        const searchText = this.value.toLowerCase();

        const filteredProducts = products.filter((product) => {

            return (
                product.name.toLowerCase().includes(searchText) ||
                product.category.toLowerCase().includes(searchText)
            );
        });

        displayProducts(filteredProducts);
    }
);


// =========================
// Start Application
// =========================

loadProducts();