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

        if (img) {
            img.src = `${API}/files/${item.image || ""}`;
            img.alt = item.product_title || "Product";

            img.onerror = () => {
                console.error("Image not found:", img.src);
            };
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



// ADD PRODUCT
async function post() {

    const formData = new FormData();

    formData.append(
        "product_title",
        document.getElementById("product_title").value
    );

    formData.append(
        "category",
        document.getElementById("category").value
    );

    formData.append(
        "brand",
        document.getElementById("brand").value
    );

    formData.append(
        "price",
        document.getElementById("price").value
    );

    formData.append(
        "original_price",
        document.getElementById("original_price").value
    );

    const image = document.getElementById("image").files[0];

    if (!image) {
        alert("Please select an image");
        return;
    }

    formData.append("image", image);

    try {
        const response = await fetch(`${API}/postdata`, {
            method: "POST",
            body: formData
        });

        const result = await response.json();

        if (!response.ok) {
            alert(result.message || "Post failed");
            return;
        }

        alert("Product added successfully!");
        window.location.href = "AdminProducts.html";

    } catch (error) {
        console.error("Post failed:", error);
    }
}




// =====================================
// GET ALL PRODUCTS
// =====================================

async function getAllProducts() {
    try {
        console.log("API URL:", `${API}/alldata`);

        const response = await fetch(`${API}/alldata`);

        console.log("Response status:", response.status);

        const result = await response.json();

        console.log("Backend response:", result);

        if (!response.ok) {
            throw new Error(result.message || "API request failed");
        }

        const products = Array.isArray(result)
            ? result
            : result.data;

        if (!Array.isArray(products)) {
            throw new Error("Backend response does not contain a product array");
        }

        return products;

    } catch (error) {
        console.error("Get products error:", error);
        throw error;
    }
}

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

            product.querySelector(".edit-product").addEventListener("click", () => {
                editProduct(item._id);
            });

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


document.addEventListener("DOMContentLoaded", () => {

    const pageName = window.location.pathname
        .split("/")
        .pop()
        .toLowerCase();

    console.log("Current page:", pageName);
    console.log("API:", API);

    if (pageName === "admin.html" ||  pageName === "adminproducts.html") {
        console.log("Calling get function...");
        get();
    } else {
        console.log("Admin products page condition not matched");
    }
});


// =====================================
// UPDATE PRODUCT
// =====================================

async function update(id) {

    const formData = new FormData();

    formData.append(
        "product_title",
        document.getElementById("product_title").value
    );

    formData.append(
        "category",
        document.getElementById("category").value
    );

    formData.append(
        "brand",
        document.getElementById("brand").value
    );

    formData.append(
        "price",
        document.getElementById("price").value
    );

    formData.append(
        "original_price",
        document.getElementById("original_price").value
    );

    const image = document.getElementById("image").files[0];

    if (image) {
        formData.append("product_img", image);
    }

    try {
        const response = await fetch(`${API}/updatedata/${id}`, {
            method: "PUT",
            body: formData
        });

        const result = await response.json();

        if (!response.ok) {
            alert(result.message || "Update failed");
            return;
        }

        alert("Product updated successfully!");

        window.location.href = "AdminProducts.html";

    } catch (error) {
        console.error("Update failed:", error);
    }
}


// =====================================
// DELETE PRODUCT
// =====================================

async function deleted(id) {

    const confirmDelete = confirm("Are you sure you want to delete this product?");

    if (!confirmDelete) {
        return;
    }

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
// EDIT PRODUCT
// =====================================

function editProduct(id) {

    window.location.href = `productForm.html?id=${id}`;

}


// =====================================
// LOAD PRODUCT FOR UPDATE
// =====================================

const productId = new URLSearchParams(
    window.location.search
).get("id");


async function loadProduct() {

    if (!productId) {
        return;
    }

    try {
        const products = await getAllProducts();

        const product = products.find(
            item => item._id === productId
        );

        if (!product) {
            alert("Product not found");
            return;
        }

        // FILL PRODUCT DETAILS
        document.getElementById("product_title").value =
            product.product_title || "";

        document.getElementById("category").value =
            product.category || "";

        document.getElementById("brand").value =
            product.brand || "";

        document.getElementById("price").value =
            product.price || "";

        document.getElementById("original_price").value =
            product.original_price || "";

        // CURRENT IMAGE
        if (product.image) {

            const img = document.getElementById("currentImage");

            if (img) {
                img.src = `${API}/files/${product.image}`;
                img.style.display = "block";
            }
        }

        // CHANGE FORM TITLE
        const formTitle = document.getElementById("formTitle");
        const submitBtn = document.getElementById("submitBtn");

        if (formTitle) {
            formTitle.textContent = "Update Product";
        }

        if (submitBtn) {
            submitBtn.textContent = "Update";
        }

    } catch (error) {
        console.error("Load product failed:", error);
    }
}


// =====================================
// FORM SUBMIT
// =====================================

function handleSubmit(e) {

    e.preventDefault();

    if (productId) {
        update(productId);
    } else {
        post();
    }
}


// =====================================
// PRODUCT FORM PAGE
// =====================================

document.addEventListener("DOMContentLoaded", () => {

    const pageName = window.location.pathname
        .split("/")
        .pop()
        .toLowerCase();

    if (pageName === "productform.html") {
        loadProduct();
    }
});
