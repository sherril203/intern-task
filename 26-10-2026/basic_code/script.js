
// =============================================
// PRODUCTWORLD - COMPLETE SCRIPT
// =============================================

const productParams = new URLSearchParams(window.location.search);
const editId = productParams.get("id");

let allProducts = [];
let displayedProducts = [];



document.addEventListener("DOMContentLoaded", () => {

    const categorySelect = document.getElementById("topCategory");
    const brandSelect = document.getElementById("topBrand");
    const allButton = document.getElementById("filterAll");

    function filterTopProducts() {

        const selectedCategory =
            categorySelect.value.trim().toLowerCase();

        const selectedBrand =
            brandSelect.value.trim().toLowerCase();

        const products = document.querySelectorAll(".dynamic-product");

        let visibleCount = 0;

        products.forEach(product => {

            const category =
                (product.dataset.category || "").toLowerCase();

            const brand =
                (product.dataset.brand || "").toLowerCase();

            const categoryMatch =
                !selectedCategory ||
                category.includes(selectedCategory);

            const brandMatch =
                !selectedBrand ||
                brand === selectedBrand;

            if (categoryMatch && brandMatch) {

                product.style.display = "";
                visibleCount++;

            } else {

                product.style.display = "none";

            }

        });

        const count = document.getElementById("productResultCount");

        if (count) {
            count.textContent = `${visibleCount} Products Found`;
        }
    }

    if (categorySelect) {
        categorySelect.addEventListener("change", filterTopProducts);
    }

    if (brandSelect) {
        brandSelect.addEventListener("change", filterTopProducts);
    }

    if (allButton) {

        allButton.addEventListener("click", () => {

            categorySelect.value = "";
            brandSelect.value = "";

            // Reset existing sidebar filters too
            document.querySelectorAll(
                'input[data-filter]:checked'
            ).forEach(input => {
                input.checked = false;
            });

            document.querySelectorAll(".dynamic-product").forEach(product => {
                product.style.display = "";
            });

            const count = document.getElementById("productResultCount");

            if (count) {
                count.textContent =
                    `${document.querySelectorAll(".dynamic-product").length} Products Found`;
            }

        });

    }

});


// =============================================
// DOM CONTENT LOADED - SINGLE INITIALIZATION
// =============================================

document.addEventListener("DOMContentLoaded", () => {
  updateVisibleCartCount();
    const pageName = window.location.pathname
        .split("/")
        .pop()
        .toLowerCase();

    console.log("Current page:", pageName);
    console.log("API:", API);

    // PRODUCTS PAGE
    if (pageName === "products.html") {
        loadProducts();
        initializeProductFilters();
    }

     //cart page 
     if (pageName === "cart.html") {
    loadCart();
}
// HOME AND PRODUCTS PAGE
if (
    pageName === "index.html" ||
    pageName === ""
) {
    loadProducts();
}

if (pageName === "products.html") {
    loadProducts();
    initializeProductFilters();
}
    // PRODUCT FORM PAGE
    if (pageName === "productform.html") {

        if (editId) {
            loadProduct();
        }

        const quantityElement = document.getElementById("quantity");
        const statusElement = document.getElementById("status");

        if (quantityElement && statusElement) {

            quantityElement.addEventListener("input", function () {

                const quantity = Number(this.value);

                if (this.value === "" || quantity < 0) {
                    statusElement.value = "";
                } else if (quantity === 0) {
                    statusElement.value = "out of stock";
                } else if (quantity >= 5 && quantity <= 90) {
                    statusElement.value = "low stock";
                } else {
                    statusElement.value = "available";
                }

            });
        }
    }

    // ADMIN PAGES
    if (
        pageName === "admin.html" ||
        pageName === "adminproducts.html"
    ) {
        get();
    }

    // PRODUCT DETAILS
    if (pageName === "productdetails.html") {
        loadProductDetails();
    }

    // CONTACT FORM
    const contactForm = document.getElementById("contactForm");

    if (contactForm) {

        contactForm.addEventListener("submit", async (e) => {

            e.preventDefault();

            const nameElement = document.getElementById("name");
            const emailElement = document.getElementById("email");
            const messageElement = document.getElementById("message");

            if (!nameElement || !emailElement || !messageElement) return;

            const data = {
                name: nameElement.value,
                email: emailElement.value,
                message: messageElement.value
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
                console.error("Contact error:", error);
                alert("Something went wrong!");
            }

        });
    }

    // SHOW MORE / SHOW LESS
    document.querySelectorAll(".show-more").forEach(button => {

        button.addEventListener("click", () => {

            const list = document.getElementById(button.dataset.target);

            if (!list) return;

            list.classList.toggle("show-all");

            button.textContent = list.classList.contains("show-all")
                ? "Show Less"
                : "Show More";

        });

    });

    // CHECKOUT BUTTON
    const checkoutButton = document.getElementById("checkoutBtn");

    if (checkoutButton) {
        checkoutButton.addEventListener("click", checkout);
    }

});


// =============================================
// COMMON HELPERS
// =============================================

function formatPrice(value) {

    if (value === undefined || value === null || value === "") {
        return "Price not available";
    }

    const number = Number(
        String(value).replace(/[₹,\s]/g, "")
    );

    if (!Number.isFinite(number)) {
        return "Price not available";
    }

    return "₹" + number.toLocaleString("en-IN");
}


function getNumericPrice(value) {

    const number = Number(
        String(value ?? 0).replace(/[₹,\s]/g, "")
    );

    return Number.isFinite(number) ? number : 0;
}


function getImageUrl(image) {

    if (!image) return "";

    if (image.startsWith("http")) {
        return image;
    }

    const filename = image.split(/[\\/]/).pop();

    return `${API}/files/${encodeURIComponent(filename)}`;
}


// =============================================
// GET ALL PRODUCTS
// =============================================

async function getAllProducts() {

    const response = await fetch(`${API}/alldata`);

    if (!response.ok) {
        throw new Error(`Unable to fetch products: ${response.status}`);
    }

    const result = await response.json();

    const products = Array.isArray(result)
        ? result
        : result.data || result.products;

    if (!Array.isArray(products)) {
        throw new Error("Products response is not an array");
    }

    return products;
}


// =============================================
// PRODUCTS PAGE - LOAD PRODUCTS
// =============================================

async function loadProducts() {
    const productList = document.getElementById("productList");
    const template = document.getElementById("productTemplate");

    if (!productList || !template) return;

    productList.innerHTML = "<p>Loading products...</p>";

    try {
        console.log("Step 1: Calling API");

        allProducts = await getAllProducts();

        console.log("Step 2: API response received", allProducts);

        displayedProducts = [...allProducts];

        console.log("Step 3: Displaying products");

        displayProducts(displayedProducts);

        console.log("Step 4: Products displayed");

    } catch (error) {
        console.error("Product loading error:", error);
        productList.innerHTML =
            "<p>Unable to load products. Please try again.</p>";
    }
}


// =============================================
// DISPLAY PRODUCTS
// =============================================

function displayProducts(products) {

    const productList = document.getElementById("productList");
    const template = document.getElementById("productTemplate");
    const resultCount = document.getElementById("productResultCount");

    if (!productList || !template) return;

    productList.innerHTML = "";

    if (resultCount) {
        resultCount.textContent = `Showing ${products.length} products`;
    }

    if (products.length === 0) {
        productList.innerHTML = "<p>No products found.</p>";
        return;
    }

   products.forEach(item => {

    const product = template.content.cloneNode(true);

    // GET PRODUCT ELEMENT
    const productElement = product.querySelector(".dynamic-product");

    // ADD CATEGORY AND BRAND DATA
    if (productElement) {

        productElement.dataset.category = Array.isArray(item.category)
            ? item.category.join(",")
            : item.category || "";

        productElement.dataset.brand = item.brand || "";

    }

    const image = product.querySelector(".product-image");
    const category = product.querySelector(".category");
    const title = product.querySelector(".title");
    const price = product.querySelector(".price");

    const cartButton = product.querySelector(".cart");
    const buyButton = product.querySelector(".buy");

    // IMAGE
    if (image) {
        image.src = getImageUrl(item.image);
        image.alt = item.product_title || "Product";

        image.onerror = function () {
            this.style.display = "none";
        };
    }

    // CATEGORY
    if (category) {
        category.textContent = item.category || "Uncategorized";
    }

    // TITLE
    if (title) {
        title.textContent = item.product_title || "No title";
    }

    // PRICE
    if (price) {
        price.textContent = formatPrice(item.price);
    }

    // ADD TO CART
   if (cartButton) {

    cartButton.addEventListener("click", async () => {

        const added = await addProductToCart(item);

        if (added) {
            await updateVisibleCartCount();
        }

    });

}

    // BUY NOW
    if (buyButton) {
        buyButton.addEventListener("click", async () => {
            const added = await addProductToCart(item);

            if (added) {
                window.location.href = "./Cart.html";
            }
        });
    }

    productList.appendChild(product);

});

}


// =============================================
// SEARCH AND FILTER INITIALIZATION
// =============================================

function initializeProductFilters() {

    const searchInput = document.getElementById("searchInput");
    const searchButton = document.getElementById("searchBtn");

    const filters = document.querySelectorAll("[data-filter]");

    if (searchButton && searchInput) {

        searchButton.addEventListener("click", applyProductFilters);

        searchInput.addEventListener("input", applyProductFilters);

        searchInput.addEventListener("keydown", event => {

            if (event.key === "Enter") {
                applyProductFilters();
            }

        });

    }

    filters.forEach(filter => {

        filter.addEventListener("change", applyProductFilters);

    });

}


// =============================================
// APPLY SEARCH AND FILTERS
// =============================================

function applyProductFilters() {

    const searchInput = document.getElementById("searchInput");

    const searchValue = searchInput
        ? searchInput.value.trim().toLowerCase()
        : "";

    const selectedCategories = Array.from(
        document.querySelectorAll('[data-filter="category"]:checked')
    ).map(input => input.value.trim().toLowerCase());

    const selectedBrands = Array.from(
        document.querySelectorAll('[data-filter="brand"]:checked')
    ).map(input => input.value.trim().toLowerCase());

    const selectedPrices = Array.from(
        document.querySelectorAll('[data-filter="price"]:checked')
    ).map(input => input.value);

    displayedProducts = allProducts.filter(item => {

        const title = (item.product_title || "").toLowerCase();
        const category = (item.category || "").toLowerCase();
        const brand = (item.brand || "").toLowerCase();

        // SEARCH
        const matchesSearch =
            title.includes(searchValue) ||
            category.includes(searchValue) ||
            brand.includes(searchValue);

        // CATEGORY
        const matchesCategory =
            selectedCategories.length === 0 ||
            selectedCategories.includes(category);

        // BRAND
        const matchesBrand =
            selectedBrands.length === 0 ||
            selectedBrands.includes(brand);

        // PRICE
        const price = getNumericPrice(item.price);

        const matchesPrice =
            selectedPrices.length === 0 ||
            selectedPrices.some(range => {

                if (range === "0-999") {
                    return price >= 0 && price < 1000;
                }

                if (range === "1000-3000") {
                    return price >= 1000 && price <= 3000;
                }

                if (range === "3000-5000") {
                    return price > 3000 && price <= 5000;
                }

                if (range === "5000-7000") {
                    return price > 5000 && price <= 7000;
                }

                if (range === "7000+") {
                    return price > 7000;
                }

                return false;

            });

        return (
            matchesSearch &&
            matchesCategory &&
            matchesBrand &&
            matchesPrice
        );

    });

    displayProducts(displayedProducts);

}


// =============================================
// CART COUNT DISPLAY
// =============================================

// =============================================
// UPDATE CART COUNT
// =============================================

async function updateVisibleCartCount() {

    const cartCount = document.getElementById("cartCount");

    if (!cartCount) return;

    try {

        const products = await getCartProducts();

        cartCount.textContent = products.length;

    } catch (error) {

        console.error("Cart count error:", error);

    }
}

// =============================================
// ADD PRODUCT TO CART
// =============================================

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

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Unable to add product to cart");
        }

        alert("Product added to cart!");

        return true;

    } catch (error) {

        console.error("Add to Cart Error:", error);

        alert(error.message);

        return false;

    }

}


// =============================================
// ADMIN LOGIN
// =============================================

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


// =============================================
// ADMIN SIGNUP
// =============================================

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


// =============================================
// ADMIN NAVIGATION AND LOGOUT
// =============================================

function openAdmin() {

    const token = localStorage.getItem("token");

    window.location.href = token
        ? "./Admin.html"
        : "./login.html";

}


function logout() {

    localStorage.removeItem("token");
    localStorage.removeItem("admin");

    window.location.href = "./login.html";

}


// =============================================
// ADD / UPDATE PRODUCT
// =============================================

async function post(event) {

    event.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {

        alert("Please login first");

        window.location.href = "./login.html";

        return;
    }

    const imageInput = document.getElementById("image");
    const quantityInput = document.getElementById("quantity");

    if (!quantityInput || !imageInput) {
        alert("Required product form fields are missing");
        return;
    }

    const quantity = Number(quantityInput.value);

    if (!editId && !imageInput.files[0]) {
        alert("Please select a product image");
        return;
    }

    if (!Number.isFinite(quantity) || quantity < 0) {
        alert("Please enter a valid quantity");
        return;
    }

    const formData = new FormData();

    if (imageInput.files[0]) {
        formData.append("image", imageInput.files[0]);
    }

    const fields = [
        "product_title",
        "category",
        "price",
        "original_price",
        "brand"
    ];

    for (const field of fields) {

        const element = document.getElementById(field);

        if (!element) {
            alert(`Missing form field: ${field}`);
            return;
        }

        formData.append(field, element.value);
    }

    let status;

    if (quantity === 0) {
        status = "out of stock";
    } else if (quantity >= 5 && quantity <= 90) {
        status = "low stock";
    } else {
        status = "available";
    }

    formData.append("quantity", quantity);
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

        const resultText = await response.text();

        let result;

        try {
            result = JSON.parse(resultText);
        } catch {
            throw new Error(
                `Backend returned invalid JSON. Status: ${response.status}`
            );
        }

        if (!response.ok) {
            throw new Error(result.message || "Product save failed");
        }

        alert(
            editId
                ? "Product updated successfully!"
                : "Product added successfully!"
        );

        window.location.href = "./AdminProducts.html";

    } catch (error) {

        console.error("Product submit error:", error);

        alert(error.message);

    }

}


// =============================================
// LOAD PRODUCT FOR EDIT
// =============================================


async function loadProducts() {

    const productList = document.getElementById("productList");
    const template = document.getElementById("productTemplate");

    if (!productList || !template) return;

    productList.innerHTML = "<p>Loading products...</p>";

    try {

        allProducts = await getAllProducts();

        const pageName = window.location.pathname
            .split("/")
            .pop()
            .toLowerCase();

        if (pageName === "index.html" || pageName === "") {

            // Home page - display only 4 products
            displayedProducts = allProducts.slice(0, 4);

        } else {

            // Products page - display all products
            displayedProducts = [...allProducts];

        }

        displayProducts(displayedProducts);

    } catch (error) {

        console.error("Product loading error:", error);

        productList.innerHTML =
            "<p>Unable to load products. Please try again.</p>";

    }
}



// =============================================
// ADMIN PRODUCT LIST
// =============================================

async function get() {

    const productList = document.getElementById("adminProductList");
    const template = document.getElementById("adminProductTemplate");

    if (!productList || !template) {
        console.error("Admin product list or template not found");
        return;
    }

    try {

        const products = await getAllProducts();

        productList.innerHTML = "";

        const productCount = document.getElementById("productCount");
        const categoryCount = document.getElementById("categoryCount");

        const availableCount = document.getElementById("availableCount");
        const lowStockCount = document.getElementById("lowStockCount");
        const outOfStockCount = document.getElementById("outOfStockCount");

        if (productCount) {
            productCount.textContent = products.length;
        }

        const categories = [
            ...new Set(
                products.map(item =>
                    item.category?.trim().toLowerCase()
                ).filter(Boolean)
            )
        ];

        if (categoryCount) {
            categoryCount.textContent = categories.length;
        }

        const available = products.filter(item => {
            const q = Number(item.quantity ?? item.Quantity ?? 0);
            return q > 0 && !(q >= 5 && q <= 90);
        }).length;

        const lowStock = products.filter(item => {
            const q = Number(item.quantity ?? item.Quantity ?? 0);
            return q >= 5 && q <= 90;
        }).length;

        const outOfStock = products.filter(item =>
            Number(item.quantity ?? item.Quantity ?? 0) === 0
        ).length;

        if (availableCount) availableCount.textContent = available;
        if (lowStockCount) lowStockCount.textContent = lowStock;
        if (outOfStockCount) outOfStockCount.textContent = outOfStock;

        if (products.length === 0) {
            productList.textContent = "No products found.";
            return;
        }

        products.forEach(item => {

            const product = template.content.cloneNode(true);

            const img = product.querySelector(".admin-product-img");
            const name = product.querySelector(".admin-product-name");
            const category = product.querySelector(".admin-product-category");
            const price = product.querySelector(".admin-product-price");
            const quantityElement = product.querySelector(".admin-product-quantity");
            const statusElement = product.querySelector(".admin-product-status");

            if (img && item.image) {
                img.src = getImageUrl(item.image);
                img.alt = item.product_title || "Product";
            }

            if (name) name.textContent = item.product_title || "";
            if (category) category.textContent = item.category || "";
            if (price) price.textContent = formatPrice(item.price);

            const quantity = Number(item.quantity ?? item.Quantity ?? 0);

            if (quantityElement) {
                quantityElement.textContent = quantity;
            }

            if (statusElement) {
                statusElement.textContent =
                    quantity === 0
                        ? "out of stock"
                        : quantity >= 5 && quantity <= 90
                            ? "low stock"
                            : "available";
            }

            const editButton = product.querySelector(".edit-product");
            const deleteButton = product.querySelector(".delete-product");

            if (editButton) {
                editButton.addEventListener("click", () => {
                    editProduct(item._id);
                });
            }

            if (deleteButton) {
                deleteButton.addEventListener("click", () => {
                    deleted(item._id);
                });
            }

            productList.appendChild(product);

        });

    } catch (error) {

        console.error("Admin products error:", error);

        productList.textContent = "Unable to load products.";

    }

}


// =============================================
// EDIT PRODUCT
// =============================================

function editProduct(id) {
    window.location.href = `productForm.html?id=${id}`;
}


// =============================================
// DELETE PRODUCT
// =============================================

async function deleted(id) {

    if (!confirm("Are you sure you want to delete this product?")) {
        return;
    }

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

        alert("Unable to delete product");

    }

}


// =============================================
// PRODUCT DETAILS PAGE
// =============================================

async function loadProductDetails() {

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    try {

        const products = await getAllProducts();

        const product = products.find(
            item => String(item._id) === String(id)
        );

        if (!product) {

            const details = document.getElementById("productDetails");

            if (details) {
                details.innerHTML = "<h2>Product not found</h2>";
            }

            return;
        }

        const image = document.getElementById("detailImage");
        const title = document.getElementById("detailTitle");
        const category = document.getElementById("detailCategory");
        const price = document.getElementById("detailPrice");
        const originalPrice = document.getElementById("detailOriginalPrice");
        const quantity = document.getElementById("detailQuantity");

        if (image) image.src = getImageUrl(product.image);
        if (title) title.textContent = product.product_title || "No title";
        if (category) category.textContent = product.category || "N/A";
        if (price) price.textContent = formatPrice(product.price);

        if (originalPrice) {
            originalPrice.textContent = formatPrice(product.original_price);
        }

        if (quantity) {
            quantity.textContent =
                "Quantity: " + (product.quantity ?? product.Quantity ?? "N/A");
        }

        const cartButton = document.getElementById("detailCart");
        const buyButton = document.getElementById("detailBuy");

        if (cartButton) {
            cartButton.onclick = async () => {
                const added = await addProductToCart(product);
                if (added) updateVisibleCartCount();
            };
        }

        if (buyButton) {
            buyButton.onclick = async () => {
                const added = await addProductToCart(product);

                if (added) {
                    window.location.href = "./Cart.html";
                }
            };
        }

    } catch (error) {

        console.error("Product details error:", error);

    }

}


// =============================================
// CHECKOUT
// =============================================

async function checkout() {

    if (typeof getCartProducts !== "function") {

        alert("Cart loading function is not connected yet.");

        return;
    }

    try {

        const products = await getCartProducts();

        if (!Array.isArray(products) || products.length === 0) {
            alert("Your cart is empty!");
            return;
        }

        const total = products.reduce((sum, item) => {

            const price = getNumericPrice(item.price);

            return sum + price;

        }, 0);

        const confirmCheckout = confirm(
            `Total Items: ${products.length}\n` +
            `Total Amount: ₹${total.toLocaleString("en-IN")}\n\n` +
            "Do you want to continue?"
        );

        if (!confirmCheckout) return;

        alert("Your cart is ready for checkout!");

    } catch (error) {

        console.error("Checkout error:", error);

        alert("Unable to proceed with checkout.");

    }

}


// =============================================
// UPDATE CART SUMMARY
// =============================================

function updateCartSummary(products) {

    const totalItems = document.getElementById("totalItems");
    const totalPrice = document.getElementById("totalPrice");

    const total = products.reduce((sum, item) => {

        return sum + getNumericPrice(item.price);

    }, 0);

    if (totalItems) {
        totalItems.textContent = products.length;
    }

    if (totalPrice) {
        totalPrice.textContent =
            `₹${total.toLocaleString("en-IN")}`;
    }

}
// cart page 

// =============================================
// FETCH CART PRODUCTS
// =============================================

async function getCartProducts() {
    const response = await fetch(`${API}/cart`);

    if (!response.ok) {
        throw new Error("Unable to fetch cart products");
    }

    const result = await response.json();

    return Array.isArray(result)
        ? result
        : result.data || [];
}


// =============================================
// LOAD AND DISPLAY CART
// =============================================

async function loadCart() {

    const productList = document.getElementById("productList");
    const template = document.getElementById("cartTemplate");

    if (!productList || !template) return;

    productList.innerHTML = "<p>Loading cart...</p>";

    try {

        const products = await getCartProducts();

        productList.innerHTML = "";

        // Update checkout summary
        updateCartSummary(products);

        // Update navbar cart count
        const cartCount = document.getElementById("cartCount");

        if (cartCount) {
            cartCount.textContent = products.length;
        }

        if (products.length === 0) {
            productList.innerHTML = "<p>Your cart is empty!</p>";
            return;
        }

        products.forEach(item => {

            const product = template.content.cloneNode(true);

            const image = product.querySelector("img");
            const category = product.querySelector(".category");
            const title = product.querySelector(".title");
            const price = product.querySelector(".price");

            const removeButton = product.querySelector(".cart");
            const buyButton = product.querySelector(".buy");

            if (image) {
                image.src = getImageUrl(item.image);
                image.alt = item.product_title || "Product";

                image.onerror = function () {
                    this.style.display = "none";
                };
            }

            if (category) {
                category.textContent = item.category || "";
            }

            if (title) {
                title.textContent = item.product_title || "";
            }

            if (price) {
                price.textContent = formatPrice(item.price);
            }

            // REMOVE CART
            if (removeButton) {
                removeButton.addEventListener("click", () => {
                    removeCartProduct(item._id);
                });
            }

            // BUY NOW
            if (buyButton) {
                buyButton.addEventListener("click", checkout);
            }

            productList.appendChild(product);

        });

    } catch (error) {

        console.error("Cart loading error:", error);

        productList.innerHTML =
            "<p>Unable to load cart products.</p>";

    }
}


// =============================================
// REMOVE CART PRODUCT
// =============================================

async function removeCartProduct(id) {

    if (!confirm("Remove this product from cart?")) {
        return;
    }

    try {

        const response = await fetch(`${API}/cart/${id}`, {
            method: "DELETE"
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Unable to remove product");
        }

        alert("Product removed from cart!");

        // Refresh cart after removal
        await loadCart();

    } catch (error) {

        console.error("Remove cart error:", error);

        alert(error.message);

    }
}
