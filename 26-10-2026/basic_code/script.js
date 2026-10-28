
document.addEventListener("DOMContentLoaded", () => {
    const products = document.querySelectorAll(
        ".dynamic-product"
    );

    const filters = document.querySelectorAll(
        "input[data-filter]"
    );

    function filterProducts() {
        const selectedCategories = Array.from(
            document.querySelectorAll(
                'input[data-filter="category"]:checked'
            )
        ).map(input => input.value.trim().toLowerCase());

        const selectedBrands = Array.from(
            document.querySelectorAll(
                'input[data-filter="brand"]:checked'
            )
        ).map(input => input.value.trim().toLowerCase());

        const selectedPrices = Array.from(
            document.querySelectorAll(
                'input[data-filter="price"]:checked'
            )
        ).map(input => input.value);

        document.querySelectorAll(".dynamic-product").forEach(product => {
            const category = (product.dataset.category || "")
                .trim().toLowerCase();

            const brand = (product.dataset.brand || "")
                .trim().toLowerCase();

            const price = Number(product.dataset.price || 0);

            const categoryMatch =
                selectedCategories.length === 0 ||
                selectedCategories.includes(category);

            const brandMatch =
                selectedBrands.length === 0 ||
                selectedBrands.includes(brand);

            const priceMatch =
                selectedPrices.length === 0 ||
                selectedPrices.some(range => {
                    if (range === "7000+") {
                        return price >= 7000;
                    }

                    const [min, max] = range.split("-").map(Number);
                    return price >= min && price <= max;
                });

            product.style.display =
                categoryMatch && brandMatch && priceMatch
                    ? ""
                    : "none";
        });
    }

    filters.forEach(filter => {
        filter.addEventListener("change", filterProducts);
    });

    // Run filters after products have been loaded
    filterProducts();

    // Call this function again after fetchProducts() renders new products
    window.filterProducts = filterProducts;
});

//search option

document.addEventListener("DOMContentLoaded", () => {
    const SearchInput = document.getElementById("searchInput");
    const SearchBtn = document.getElementById("searchBtn");

    function Search() {
        const SearchText = SearchInput.value.trim().toLowerCase();

        // Get dynamically displayed products each time
        const products = document.querySelectorAll(".dynamic-product");

        products.forEach(product => {
            const ProductName =
                product.querySelector(".title")?.textContent.toLowerCase() || "";

            const Category =
                product.dataset.category?.toLowerCase() || "";

            const Brand =
                product.dataset.brand?.toLowerCase() || "";

            const matches =
                ProductName.includes(SearchText) ||
                Category.includes(SearchText) ||
                Brand.includes(SearchText);

            product.style.display = matches ? "" : "none";
        });
    }

    SearchBtn?.addEventListener("click", Search);
    SearchInput?.addEventListener("input", Search);

    SearchInput?.addEventListener("keydown", event => {
        if (event.key === "Enter") {
            Search();
        }
    });
});

const productList = document.getElementById("productList");
const template = document.getElementById(
    isCartPage ? "cartTemplate" : "productTemplate"
);
async function fetchProducts() {
    try {
        const response = await fetch(`${API}/alldata`);
        const result = await response.json();

        console.log("API data:", result);

        const products = result.data || result;

        displayProducts(products);
    } catch (error) {
        console.log("Error:", error);
    }
}

function displayProducts(products) {
    productList.innerHTML = "";

    products.forEach(function (item) {
        const card = template.cloneNode(true);
        card.dataset.category = item.category || "";
        card.dataset.brand = item.brand || "";

        const price = Number(String(item.price || "0").replace(/,/g, ""));
        const oldPrice = Number(String(item.original_price || "0").replace(/,/g, ""));

        card.dataset.price = price;

        const img = card.querySelector("img");

        img.src = `${API}/files/${item.image}`;
        img.alt = item.product_title || "Product";

        img.onerror = function () {
            console.log("Image not found:", img.src);
        };

        card.querySelector(".category").textContent = item.category || "";
        card.querySelector(".title").textContent = item.product_title || "";

        const priceText = card.querySelector(".price");
        priceText.textContent = `MRP: ₹${price.toLocaleString("en-IN")}`;

        if (oldPrice > price) {
            const oldPriceText = document.createElement("span");
            oldPriceText.style.textDecoration = "line-through";
            oldPriceText.style.marginLeft = "5px";
            oldPriceText.textContent = `₹${oldPrice.toLocaleString("en-IN")}`;
            priceText.appendChild(oldPriceText);
        }

        card.classList.add("dynamic-product");
        productList.appendChild(card);
    });
    // After all cards are appended:
    if (window.filterProducts) {
        window.filterProducts();
    }
}
fetchProducts();



// Get cart products and update navbar count
async function getCartProducts() {
    const response = await fetch(`${API}/cart`);

    if (!response.ok) {
        throw new Error("Failed to fetch cart");
    }

    const result = await response.json();
    return result.data || result;
}

// Display products from backend
async function fetchProducts() {
    try {
        const response = await fetch(`${API}/alldata`);

        if (!response.ok) {
            throw new Error("Failed to fetch products");
        }

        const result = await response.json();
        const products = result.data || result;

        displayProducts(products);
    } catch (error) {
        console.log("Products error:", error);
    }
}

// Display all products on Products.html
function displayProducts(products) {
    productList.innerHTML = "";

    products.forEach(function (item) {
        const card = template.cloneNode(true);

        card.removeAttribute("id");
        card.hidden = false;
        card.classList.add("dynamic-product");

        card.dataset.category = item.category || "";
        card.dataset.brand = item.brand || "";

        const price = Number(
            String(item.price || "0").replace(/,/g, "")
        );

        const oldPrice = Number(
            String(item.original_price || "0").replace(/,/g, "")
        );

        card.dataset.price = price;

        const img = card.querySelector("img");
        img.src = `${API}/files/${item.image}`;
        img.alt = item.product_title || "Product";

        card.querySelector(".category").textContent =
            item.category || "";

        card.querySelector(".title").textContent =
            item.product_title || "";

        const priceText = card.querySelector(".price");
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

        // Add to Cart button
        const cartButton = card.querySelector(".cart");

        cartButton.textContent = "Add to Cart";

        cartButton.addEventListener("click", function () {
            addtoCart(item);
        });

        productList.appendChild(card);
    });

    // Run existing search/filter function if available
    if (typeof window.filterProducts === "function") {
        window.filterProducts();
    }
}

// Add product to cart
async function addtoCart(item) {
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
    console.log("Backend response:", message);
    throw new Error(message);
}

        alert("Product added to cart!");

        await cartCount();
    } catch (error) {
        console.log("Add to cart error:", error);
        alert("Unable to add product to cart.");
    }
}

// Fetch cart and display it on Cart.html
async function fetchCart() {
    try {
        const products = await getCartProducts();
        displayCart(products);
    } catch (error) {
        console.log("Cart error:", error);
    }
}

// Display cart products
function displayCart(products) {
    productList.innerHTML = "";

    if (products.length === 0) {
        productList.textContent = "Your cart is empty.";
        return;
    }

    products.forEach(function (item) {
        const card = template.cloneNode(true);

        card.removeAttribute("id");
        card.hidden = false;

        const price = Number(
            String(item.price || "0").replace(/,/g, "")
        );

        const oldPrice = Number(
            String(item.original_price || "0").replace(/,/g, "")
        );

        const img = card.querySelector("img");
        img.src = `${API}/files/${item.image}`;
        img.alt = item.product_title || "Product";

        card.querySelector(".category").textContent =
            item.category || "";

        card.querySelector(".title").textContent =
            item.product_title || "";

        const priceText = card.querySelector(".price");
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

        // Remove button
        const cartButton = card.querySelector(".cart");

        cartButton.textContent = "Remove Cart";
        cartButton.style.backgroundColor = "red";

        cartButton.addEventListener("click", function () {
            removeFromCart(item._id);
        });

        // Buy button is not connected to checkout yet
        productList.appendChild(card);
    });
}

// Remove product from cart
async function removeFromCart(id) {
    try {
        const response = await fetch(`${API}/cart/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error("Failed to remove product");
        }

        await fetchCart();
        await cartCount();

    } catch (error) {
        console.log("Remove cart error:", error);
        alert("Unable to remove product.");
    }
}

// Update navbar cart count
async function cartCount() {
    try {
        const products = await getCartProducts();
        const count = document.getElementById("cartCount");

        if (count) {
            count.textContent = products.length;
        }
    } catch (error) {
        console.log("Cart count error:", error);
    }
}
const isCartPage = window.location.pathname
    .toLowerCase()
    .endsWith("cart.html");

if (productList && template) {
    if (isCartPage) {
        fetchCart();
    } else {
        fetchProducts();
    }
}

cartCount();