// PRODUCTS, CART, SEARCH AND FILTER
document.addEventListener("DOMContentLoaded", () => {

    const pageName = window.location.pathname
        .split("/")
        .pop()
        .toLowerCase();

    const productList = document.getElementById("productList");
    const productTemplate = document.getElementById("productTemplate");
    const cartTemplate = document.getElementById("cartTemplate");
    const cartCountElement = document.getElementById("cartCount");

    const searchInput = document.getElementById("searchInput");
    const searchButton = document.getElementById("searchBtn");

    const filters = document.querySelectorAll("input[data-filter]");

    const isProductsPage = pageName === "products.html";
    const isCartPage = pageName === "cart.html";


    // PRICE FORMAT
    function formatPrice(value) {
        const price = Number(String(value || "0").replace(/,/g, ""));
        return Number.isFinite(price) ? price : 0;
    }


    // SEARCH AND FILTER
    function applySearchAndFilters() {

        const searchText = (searchInput?.value || "")
            .trim()
            .toLowerCase();

        const categories = Array.from(
            document.querySelectorAll(
                'input[data-filter="category"]:checked'
            )
        ).map(input => input.value.trim().toLowerCase());

        const brands = Array.from(
            document.querySelectorAll(
                'input[data-filter="brand"]:checked'
            )
        ).map(input => input.value.trim().toLowerCase());

        const prices = Array.from(
            document.querySelectorAll(
                'input[data-filter="price"]:checked'
            )
        ).map(input => input.value);

        document.querySelectorAll(".dynamic-product").forEach(card => {

            const title = card.querySelector(".title")
                ?.textContent.toLowerCase() || "";

            const category = (card.dataset.category || "")
                .trim().toLowerCase();

            const brand = (card.dataset.brand || "")
                .trim().toLowerCase();

            const price = Number(card.dataset.price || 0);

            const searchMatch =
                !searchText ||
                title.includes(searchText) ||
                category.includes(searchText) ||
                brand.includes(searchText);

            const categoryMatch =
                categories.length === 0 ||
                categories.includes(category);

            const brandMatch =
                brands.length === 0 ||
                brands.includes(brand);

            const priceMatch =
                prices.length === 0 ||
                prices.some(range => {

                    if (range === "7000+") {
                        return price >= 7000;
                    }

                    const [min, max] = range.split("-").map(Number);

                    return price >= min && price <= max;
                });

            card.style.display =
                searchMatch && categoryMatch && brandMatch && priceMatch
                    ? ""
                    : "none";
        });
    }


    // SEARCH EVENTS
    searchButton?.addEventListener("click", applySearchAndFilters);
    searchInput?.addEventListener("input", applySearchAndFilters);

    searchInput?.addEventListener("keydown", event => {
        if (event.key === "Enter") {
            applySearchAndFilters();
        }
    });

    filters.forEach(filter => {
        filter.addEventListener("change", applySearchAndFilters);
    });

    window.filterProducts = applySearchAndFilters;


    // FILL PRODUCT DETAILS
    function fillProductCard(card, item) {

        const price = formatPrice(item.price);
        const oldPrice = formatPrice(item.original_price);

const img = card.querySelector("img");

if (img && item.image) {
    // Get only the filename
    const filename = item.image.split(/[\\/]/).pop();

    console.log("Product:", item.product_title);
    console.log("DB Image:", filename);

    img.src = `${API}/files/${encodeURIComponent(filename)}`;
    img.alt = item.product_title || "Product";

    img.onerror = () => {
        console.error("Image loading failed!");
        console.error("Product:", item.product_title);
        console.error("Database filename:", item.image);
        console.error("Requested URL:", img.src);
    };
    console.log("API:", API);
console.log("Product:", item);
console.log("Image filename:", item.image);
console.log("Final image URL:", `${API}/files/${item.image}`);
}

        const category = card.querySelector(".category");

        if (category) {
            category.textContent = item.category || "";
        }

        const title = card.querySelector(".title");

        if (title) {
            title.textContent = item.product_title || "";
        }

        const priceText = card.querySelector(".price");

        if (priceText) {
            priceText.textContent =
                `MRP: ₹${price.toLocaleString("en-IN")}`;

            if (oldPrice > price) {
                const oldPriceText = document.createElement("span");

                oldPriceText.style.textDecoration = "line-through";
                oldPriceText.style.marginLeft = "5px";

                oldPriceText.textContent =
                    ` ₹${oldPrice.toLocaleString("en-IN")}`;

                priceText.appendChild(oldPriceText);
            }
        }

        return price;
    }


    // GET CART PRODUCTS
    async function getCartProducts() {

        const response = await fetch(`${API}/cart`);

        if (!response.ok) {
            throw new Error(`Cart fetch failed: ${response.status}`);
        }

        const result = await response.json();
        const products = result.data || result;

        if (!Array.isArray(products)) {
            throw new Error("Invalid cart data");
        }

        return products;
    }


    // CART COUNT
    async function cartCount() {

        if (!cartCountElement) return;

        try {
            const products = await getCartProducts();

            cartCountElement.textContent = products.length;

        } catch (error) {
            console.error("Cart count error:", error);
        }
    }


    // FETCH PRODUCTS
    async function fetchProducts() {

        if (!productList || !productTemplate) {
            console.error("Product list or template not found");
            return;
        }

        try {
            const response = await fetch(`${API}/alldata`);

            if (!response.ok) {
                throw new Error(`Product fetch failed: ${response.status}`);
            }

            const result = await response.json();
            const products = result.data || result;

            if (!Array.isArray(products)) {
                throw new Error("Invalid product data");
            }

            displayProducts(products);

        } catch (error) {
            console.error("Products error:", error);

            productList.textContent =
                "Unable to load products. Please try again.";
        }
    }


    // DISPLAY PRODUCTS

    function displayProducts(products) {

        if (!productList || !productTemplate) {
            console.error("Product list or template not found");
            return;
        }

        console.log("Template:", productTemplate);
        console.log("Template type:", productTemplate.tagName);

        const templateContent = productTemplate.content;

        if (!templateContent || !templateContent.firstElementChild) {
            console.error("Product template content is missing");
            return;
        }

        productList.innerHTML = "";

        products.forEach(item => {

            const card = templateContent.firstElementChild.cloneNode(true);

            card.classList.add("dynamic-product");

            card.dataset.category = (item.category || "").trim();
            card.dataset.brand = (item.brand || "").trim();
            card.dataset.price = formatPrice(item.price);

            fillProductCard(card, item);

            const cartButton = card.querySelector(".cart");

            if (cartButton) {
                cartButton.onclick = () => addToCart(item);
            }

            const buyButton = card.querySelector(".buy");

            if (buyButton) {
                buyButton.onclick = () => buyNow(item);
            }

            productList.appendChild(card);
        });

        applySearchAndFilters();
    }



    // ADD TO CART
    async function addToCart(item) {

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
                const message = await response.text();

                throw new Error(
                    `Add to cart failed: ${response.status} ${message}`
                );
            }

            await cartCount();

            alert("Product added to cart!");

            return true;

        } catch (error) {
            console.error("Add to Cart error:", error);
            alert("Unable to add product to cart.");

            return false;
        }
    }


    // BUY NOW
    async function buyNow(item) {

        const added = await addToCart(item);

        if (added) {
            window.location.href = "./Cart.html";
        }
    }


    // FETCH CART
    async function fetchCart() {

        if (!productList || !cartTemplate) {
            console.error("Cart list or template not found");
            return;
        }

        try {
            const products = await getCartProducts();

            displayCart(products);

        } catch (error) {
            console.error("Cart error:", error);

            productList.textContent =
                "Unable to load your cart. Please try again.";
        }
    }


    // DISPLAY CART
    function displayCart(products) {

        if (!productList || !cartTemplate) return;

        productList.innerHTML = "";

        if (products.length === 0) {
            productList.textContent = "Your cart is empty.";
            return;
        }

        products.forEach(item => {

            const card = cartTemplate.content
                .firstElementChild.cloneNode(true);

            card.hidden = false;

            fillProductCard(card, item);

            const removeButton = card.querySelector(".cart");

            if (removeButton) {
                removeButton.textContent = "Remove Cart";
                removeButton.style.backgroundColor = "red";

                removeButton.addEventListener("click", () => {
                    removeFromCart(item._id);
                });
            }

            const buyButton = card.querySelector(".buy");

            if (buyButton) {
                buyButton.textContent = "Buy Now";
                buyButton.style.backgroundColor = "blue";
                buyButton.hidden = false;
            }

            productList.appendChild(card);
        });
    }


    // REMOVE FROM CART
    async function removeFromCart(id) {

        try {
            const response = await fetch(
                `${API}/cart/${encodeURIComponent(id)}`,
                {
                    method: "DELETE"
                }
            );

            if (!response.ok) {
                throw new Error(`Remove failed: ${response.status}`);
            }

            await fetchCart();
            await cartCount();

        } catch (error) {
            console.error("Remove cart error:", error);
        }
    }


    // LOAD CORRECT PAGE
    if (isProductsPage) {
        fetchProducts();
    }

    if (isCartPage) {
        fetchCart();
    }

    cartCount();

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

        if (token) {
            localStorage.setItem("token", token);

            if (admin) {
                localStorage.setItem("admin", JSON.stringify(admin));
            }

            alert("Login successful!");
            window.location.href = "./admin.html";
        }

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
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "API request failed");
        }

        const products = Array.isArray(result)
            ? result
            : result.data;

        if (!Array.isArray(products)) {
            throw new Error("Invalid product data");
        }

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

    const formData = new FormData();

    const imageInput = document.getElementById("image");

    if (!imageInput) {
        console.error("Image input not found");
        return;
    }

    const image = imageInput.files[0];

    if (image) {
        formData.append("image", image);
    }

    formData.append("product_title", document.getElementById("product_title").value);
    formData.append("category", document.getElementById("category").value);
    formData.append("price", document.getElementById("price").value);
    formData.append("original_price", document.getElementById("original_price").value);
    formData.append("brand", document.getElementById("brand").value);

    try {
        const response = await fetch(
            editId
                ? `${API}/updatedata/${editId}`
                : `${API}/postdata`,
            {
                method: editId ? "PUT" : "POST",
                body: formData
            }
        );

        // Read response safely
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

        console.log("Selected Product:", product);

        if (!product) {
            alert("Product not found");
            return;
        }

        document.getElementById("product_title").value = product.product_title ?? "";
        document.getElementById("category").value = product.category ?? "";
        document.getElementById("price").value = product.price ?? "";
        document.getElementById("original_price").value = product.original_price ?? "";
        document.getElementById("brand").value = product.brand ?? "";

        document.getElementById("imageName").textContent =
            product.image || "";
        document.getElementById("image").addEventListener("change", function () {
            document.getElementById("imageName").textContent =
                this.files[0]?.name || "";
        });
        if (currentImage && product.image) {
            currentImage.src = `${API}/files/${product.image}`;
            currentImage.style.display = "block";
        }

    } catch (error) {
        console.error("Load Product Error:", error);
    }
}


// =====================================
// ADMIN PRODUCT LIST
// =====================================

async function get() {

    const productList = document.getElementById("adminProductList");
    const template = document.getElementById("adminProductTemplate");

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
console.table(
    products.map(item => ({
        name: item.product_title,
        image: item.image
    }))
);
        // DISPLAY PRODUCTS
        products.forEach(item => {

            const product = template.content.cloneNode(true);

            product.querySelector(".admin-product-img").src =
                `${API}/files/${item.image}`;

            product.querySelector(".admin-product-name").textContent =
                item.product_title || "";

            product.querySelector(".admin-product-category").textContent =
                item.category || "";

            product.querySelector(".admin-product-price").textContent =
                `₹${item.price}`;

            // EDIT BUTTON
            product.querySelector(".edit-product").addEventListener("click", () => {
                editProduct(item._id);
            });

            // DELETE BUTTON
            product.querySelector(".delete-product").addEventListener("click", () => {
                deleted(item._id);
            });

            productList.appendChild(product);
        });

        if (products.length === 0) {
            productList.textContent = "No products found.";
        }

    } catch (error) {
        console.error("Data failed:", error);
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

        const response = await fetch(`${API}/deletedata/${id}`, {
            method: "DELETE"
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
    }

    // ADMIN PRODUCTS PAGE
    if (
        pageName === "admin.html" ||
        pageName === "adminproducts.html"
    ) {
        get();
    }

});
