// PRODUCTS, CART, SEARCH AND FILTER
document.addEventListener("DOMContentLoaded", () => {

    const pageName = window.location.pathname
        .split("/")
        .pop()
        .toLowerCase();

    console.log("Current page:", pageName);
    console.log("API:", API);

    // PRODUCT FORM PAGE
    if (pageName === "productform.html") {
        loadProduct();

        const quantityElement = document.getElementById("quantity");

        if (quantityElement) {
            quantityElement.addEventListener("input", function () {

                const quantity = Number(this.value);
                let status;

                if (this.value === "" || quantity < 0) {
                    status = "";
                } else if (quantity === 0) {
                    status = "out of stock";
                }
                else if (quantity >= 5 && quantity <= 90) {
                    status = "low stock";
                }
                else {
                    status = "available";
                }

                document.getElementById("status").value = status;
            });
        }
    }

    // ADMIN PRODUCTS AND DASHBOARD
    if (
        pageName === "admin.html" ||
        pageName === "adminproducts.html"
    ) {
        get();
    }

});

// ADMIN LOGIN
async function login(e) {
    e.preventDefault();

    try {
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        const response = await fetch(`${API}/adminLogin`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const result = await response.json();

        if (!response.ok) {
            alert(result.message || "Login failed");
            return;
        }

        const token = result.data?.token;
        const admin = result.data?.admin;

        if (!token) {
            alert("Token not received from backend");
            return;
        }

        localStorage.setItem("token", token);

        if (admin) {
            localStorage.setItem("admin", JSON.stringify(admin));
        }

        alert("Login successful!");
        window.location.href = "./Admin.html";

    } catch (error) {
        console.error("Login failed:", error);
        alert("Something went wrong!");
    }
}

// ADMIN SIGNUP

async function signup(e) {

    e.preventDefault();

    try {
        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        const response = await fetch(`${API}/adminRegister`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name, email, password })
        });

        const result = await response.json();

        if (!response.ok) {
            alert(result.message || "Signup failed");
            return;
        }

        alert("Registration successful!");
        window.location.href = "./login.html";

    } catch (error) {
        console.error("Signup failed:", error);
        alert("Something went wrong!");
    }
}

// private routing
function openAdmin() {
    const token = localStorage.getItem("token");

    if (token) {
        window.location.href = "./Admin.html";
    } else {
        window.location.href = "./login.html";
    }
}
// admin logout
function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("admin");
    window.location.href = "./login.html";
}

// =====================================
// GET PRODUCT ID FROM URL
// =====================================

const params = new URLSearchParams(window.location.search);
const editId = params.get("id");

console.log("Edit ID:", editId);


// =====================================
// GET ALL PRODUCTS
// =====================================

async function getAllProducts() {

    try {

        const response = await fetch(`${API}/alldata`);

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const result = await response.json();

        console.log("API Response:", result);

        const products = Array.isArray(result)
            ? result
            : result.data || result.products;

        if (!Array.isArray(products)) {
            throw new Error("Products data is not an array");
        }

        console.log("Fetched Products:", products);

        return products;

    } catch (error) {

        console.error("Get products error:", error);
        throw error;

    }
}


// =====================================
// ADD / UPDATE PRODUCT
// =====================================

async function post(event) {
    event.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Please login first");
        window.location.href = "./login.html";
        return;
    }
    const formData = new FormData();

    const imageInput = document.getElementById("image");
    const quantity = Number(document.getElementById("quantity").value);

    if (!editId && (!imageInput || !imageInput.files[0])) {
        alert("Please select a product image");
        return;
    }

    if (!Number.isFinite(quantity) || quantity < 0) {
        alert("Please enter a valid quantity");
        return;
    }

    const image = imageInput?.files[0];

    if (image) {
        formData.append("image", image);
    }

    formData.append("product_title", document.getElementById("product_title").value);
    formData.append("category", document.getElementById("category").value);
    formData.append("price", document.getElementById("price").value);
    formData.append("original_price", document.getElementById("original_price").value);
    formData.append("brand", document.getElementById("brand").value);

    // Send quantity and automatically calculate status
    formData.append("quantity", quantity);
    let status;
    if (quantity === 0) {
        status = "out of stock";
    }
    else if (quantity <= 5) {
        status = "low stock";
    }
    else {
        status = "available";
    }

    formData.append("status", status);
    try {
        const response = await fetch(
            editId
                ? `${API}/updatedata/${editId}`
                : `${API}/postdata`,
            {
                method: editId ? "PUT" : "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
            }
        );

        const responseText = await response.text();

        console.log("Response Status:", response.status);
        console.log("Backend Response:", responseText);

        let result;

        try {
            result = JSON.parse(responseText);
        } catch {
            throw new Error(
                `Backend returned HTML instead of JSON. Status: ${response.status}. Check Render Logs.`
            );
        }

        if (!response.ok) {
            throw new Error(result.message || "Product update failed");
        }

        alert(
            editId
                ? "Product updated successfully!"
                : "Product added successfully!"
        );

        window.location.href = "AdminProducts.html";

    } catch (error) {
        console.error("Product submit error:", error);
        alert(error.message);
    }
}
document.getElementById("quantity").addEventListener("input", function () {
    const quantity = Number(this.value);
    let status;

    if (this.value === "" || quantity < 0) {
        status = "";
    } else if (quantity === 0) {
        status = "out of stock";
    } else if (quantity >= 5 && quantity <= 90) {
        status = "low stock";
    } else {
        status = "available";
    }

    document.getElementById("status").value = status;
});
// =====================================
// LOAD PRODUCT FOR EDIT
// =====================================

async function loadProduct() {
    if (!editId) return;

    try {
        const products = await getAllProducts();

        const product = products.find(
            item => String(item._id) === String(editId)
        );

        if (!product) {
            alert("Product not found");
            return;
        }

        document.getElementById("product_title").value = product.product_title ?? "";
        document.getElementById("category").value = product.category ?? "";
        document.getElementById("price").value = product.price ?? "";
        document.getElementById("original_price").value = product.original_price ?? "";
        document.getElementById("brand").value = product.brand ?? "";
        document.getElementById("quantity").value = product.quantity ?? product.Quantity ?? 0;
        document.getElementById("status").value = product.status ?? "";

        const imageInput = document.getElementById("image");
        const imageName = document.getElementById("imageName");
        const currentImage = document.getElementById("currentImage");

        imageName.textContent = product.image || "";

        if (product.image) {
            const filename = product.image.split(/[\\/]/).pop();

            currentImage.src = `${API}/files/${encodeURIComponent(filename)}`;
            currentImage.style.display = "block";
        }

        imageInput.addEventListener("change", function () {
            imageName.textContent = this.files[0]?.name || "";

            if (this.files[0]) {
                currentImage.src = URL.createObjectURL(this.files[0]);
                currentImage.style.display = "block";
            }
        });

    } catch (error) {
        console.error("Load Product Error:", error);
    }
}


// =====================================
// ADMIN PRODUCT LIST
// =====================================


// ADMIN PRODUCT LIST
async function get() {

    const productList = document.getElementById("adminProductList");
    const template = document.getElementById("adminProductTemplate");

    const availableCount = document.getElementById("availableCount");
    const outOfStockCount = document.getElementById("outOfStockCount");
    const lowStockCount = document.getElementById("lowStockCount");

    if (!productList || !template) {
        console.error("Product list or template not found");
        return;
    }

    try {

        const products = await getAllProducts();

        console.log("Fetched Products:", products);

        productList.innerHTML = "";

        // PRODUCT COUNT
        const productCount = document.getElementById("productCount");

        if (productCount) {
            productCount.textContent = products.length;
        }

        // CATEGORY COUNT
        const categoryCount = document.getElementById("categoryCount");

        const categories = [...new Set(
            products.map(item =>
                item.category?.trim().toLowerCase()
            ).filter(Boolean)
        )];

        if (categoryCount) {
            categoryCount.textContent = categories.length;
        }

        // STOCK COUNTS
        const available = products.filter(item =>
            Number(item.quantity ?? item.Quantity ?? 0) > 5
        ).length;

        const lowStock = products.filter(item => {
            const q = Number(item.quantity ?? item.Quantity ?? 0);
            return q >= 5 && q <= 90;
        }).length;

        const outOfStock = products.filter(item =>
            Number(item.quantity ?? item.Quantity ?? 0) === 0
        ).length;

        if (availableCount) {
            availableCount.textContent = available;
        }

        if (lowStockCount) {
            lowStockCount.textContent = lowStock;
        }

        if (outOfStockCount) {
            outOfStockCount.textContent = outOfStock;
        }

        // DISPLAY PRODUCTS
        products.forEach(item => {

            const product = template.content.cloneNode(true);

            const img = product.querySelector(".admin-product-img");

            if (img && item.image) {

                const filename = item.image.split(/[\\/]/).pop();

                img.src = item.image.startsWith("http")
                    ? item.image
                    : `${API}/files/${encodeURIComponent(filename)}`;

                img.alt = item.product_title || "Product";
            }

            product.querySelector(".admin-product-name").textContent =
                item.product_title || "";

            product.querySelector(".admin-product-category").textContent =
                item.category || "";

            product.querySelector(".admin-product-price").textContent =
                formatPrice(item.price);

            const quantity = Number(item.quantity ?? item.Quantity ?? 0);

            product.querySelector(".admin-product-quantity").textContent =
                quantity;

           product.querySelector(".admin-product-status").textContent =
    quantity === 0
        ? "out of stock"
        : quantity >= 5 && quantity <= 90
            ? "low stock"
            : "available";

            // EDIT
            product.querySelector(".edit-product").addEventListener("click", () => {
                editProduct(item._id);
            });

            // DELETE
            product.querySelector(".delete-product").addEventListener("click", () => {
                deleted(item._id);
            });

            productList.appendChild(product);
        });

        if (products.length === 0) {
            productList.textContent = "No products found.";
        }

    } catch (error) {

        console.error("Admin products error:", error);

        productList.textContent = "Unable to load products.";
    }
}


// =====================================
// EDIT PRODUCT
// =====================================

function editProduct(id) {

    window.location.href = `productForm.html?id=${id}`;

}


// =====================================
// DELETE PRODUCT
// =====================================

async function deleted(id) {

    const confirmDelete = confirm(
        "Are you sure you want to delete this product?"
    );

    if (!confirmDelete) return;

    try {
        const token = localStorage.getItem("token");

        const response = await fetch(`${API}/deletedata/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const result = await response.json();

        if (!response.ok) {
            alert(result.message || "Failed to delete");
            return;
        }

        alert("Product deleted successfully!");

        get();

    } catch (error) {
        console.error("Delete failed:", error);
    }
}


// =====================================
// DOM CONTENT LOADED
// =====================================

document.addEventListener("DOMContentLoaded", () => {

    const pageName = window.location.pathname
        .split("/")
        .pop()
        .toLowerCase();

    console.log("Current page:", pageName);
    console.log("API:", API);

    // PRODUCT FORM PAGE
    if (pageName === "productform.html") {

        loadProduct();

        const statusInput = document.getElementById("status");

        const quantityElement = document.getElementById("quantity");

        if (quantityElement) {

            quantityElement.addEventListener("input", function () {

                const quantity = Number(this.value);
                let status;

                if (this.value === "" || quantity < 0) {
                    status = "";
                } else if (quantity === 0) {
                    status = "out of stock";
                } else if (quantity <= 5) {
                    status = "low stock";
                } else {
                    status = "available";
                }

                document.getElementById("status").value = status;

            });

        }
    }

    // ADMIN PRODUCTS AND DASHBOARD PAGE
    if (
        pageName === "admin.html" ||
        pageName === "adminproducts.html"
    ) {
        get();
    }

});
/*contact form */
const contactForm = document.getElementById("contactForm");

if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const data = {
            name: document.getElementById("name").value,
            email: document.getElementById("email").value,
            message: document.getElementById("message").value
        };

        try {
            const response = await fetch(`${API}/contact`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });
            const result = await response.json();

            if (response.ok) {
                alert("Feedback submitted successfully!");
                contactForm.reset();
            } else {
                alert(result.message || "Submission failed");
            }

        } catch (error) {
            console.error("Contact form error:", error);
            alert("Something went wrong!");
        }
    });
}
// filter option
document.querySelectorAll(".show-more").forEach(button => {
    button.addEventListener("click", () => {
        const list = document.getElementById(button.dataset.target);

        list.classList.toggle("show-all");

        button.textContent = list.classList.contains("show-all")
            ? "Show Less"
            : "Show More";
    });
});



// =====================================
// PRODUCT DETAILS PAGE
// =====================================

async function loadProductDetails() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    try {
        const response = await fetch(`${API}/alldata`);

        if (!response.ok) {
            throw new Error("Failed to fetch products");
        }

        const result = await response.json();
        const products = result.data || result;

        const product = products.find(
            item => String(item._id) === String(id)
        );


        if (!product) {
            document.getElementById("productDetails").innerHTML =
                "<h2>Product not found</h2>";
            return;
        }

        console.log("Selected Product:", product);

        // Image
        const imageName = product.image.split(/[\\/]/).pop();

        document.getElementById("detailImage").src =
            `${API}/files/${encodeURIComponent(imageName)}`;

        // Product details
        document.getElementById("detailTitle").textContent =
            product.product_title || "No title";

        document.getElementById("detailCategory").textContent =
            (product.category || "N/A");

        // Price
        document.getElementById("detailPrice").textContent =
            formatPrice(product.price);

        // Original Price
        document.getElementById("detailOriginalPrice").textContent =
            formatPrice(product.original_price);

        // Quantity
        document.getElementById("detailQuantity").textContent =
            "Quantity: " + (product.quantity ?? "N/A");

        // Buttons
        document.getElementById("detailCart").onclick = async () => {
            await addProductToCart(product);
            await updateDetailsCartCount();
        };

        document.getElementById("detailBuy").onclick = async () => {
            const added = await addProductToCart(product);

            if (added) {
                window.location.href = "Cart.html";
            }
        }; get

    } catch (error) {
        console.error("Product details error:", error);
    }
}
// =====================================
// ADD PRODUCT TO CART
// =====================================

async function addProductToCart(item) {

    try {

        const response = await fetch(`${API}/cart`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                image: item.image,
                category: item.category,
                product_title: item.product_title,
                price: item.price,
                original_price: item.original_price,
                brand: item.brand

            })
        });

        if (!response.ok) {
            throw new Error("Unable to add product to cart");
        }

        alert("Product added to cart!");

        return true;

    } catch (error) {

        console.error("Add to Cart Error:", error);

        alert(error.message);

        return false;
    }
}
function formatPrice(value) {
    if (value === undefined || value === null || value === "") {
        return "Price not available";
    }

    const number = Number(
        String(value).replace(/[₹,\s]/g, "")
    );

    if (Number.isNaN(number)) {
        return "Price not available";
    }

    return "₹" + number.toLocaleString("en-IN");
}
// CHECKOUT
async function checkout() {

    try {

        const products = await getCartProducts();

        if (products.length === 0) {
            alert("Your cart is empty!");
            return;
        }

        const total = products.reduce((sum, item) => {
            return sum + formatPrice(item.price);
        }, 0);

        const confirmCheckout = confirm(
            `Total Items: ${products.length}\n` +
            `Total Amount: ₹${total.toLocaleString("en-IN")}\n\n` +
            "Do you want to continue?"
        );

        if (!confirmCheckout) return;

        // Connect your order/payment API here.
        alert("Your cart is ready for checkout!");

    } catch (error) {

        console.error("Checkout error:", error);
        alert("Unable to proceed with checkout.");

    }
}

// CHECKOUT BUTTON EVENT
const checkoutButton = document.getElementById("checkoutBtn");

checkoutButton?.addEventListener("click", checkout);
// UPDATE CART SUMMARY
function updateCartSummary(products) {

    const totalItems = document.getElementById("totalItems");
    const totalPrice = document.getElementById("totalPrice");

    let total = 0;

    products.forEach(item => {

        const price = Number(
            String(item.price || 0).replace(/[₹,\s]/g, "")
        );

        total += Number.isFinite(price) ? price : 0;

    });

    if (totalItems) {
        totalItems.textContent = products.length;
    }

    if (totalPrice) {
        totalPrice.textContent =
            `₹${total.toLocaleString("en-IN")}`;
    }

}