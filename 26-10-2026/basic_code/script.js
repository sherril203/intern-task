
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
const template = document.getElementById("productTemplate");

document.addEventListener("DOMContentLoaded", () => {
    const productList = document.getElementById("productList");
    const productTemplate = document.getElementById("productTemplate");
    const cartTemplate = document.getElementById("cartTemplate");
    const cartCountElement = document.getElementById("cartCount");

    const isCartPage = window.location.pathname
        .toLowerCase()
        .endsWith("cart.html");

    // SEARCH AND FILTER
    const searchInput = document.getElementById("searchInput");
    const searchButton = document.getElementById("searchBtn");
    const filters = document.querySelectorAll("input[data-filter]");

    function applySearchAndFilters() {
        const searchText = (searchInput?.value || "").trim().toLowerCase();

        const categories = Array.from(
            document.querySelectorAll('input[data-filter="category"]:checked')
        ).map(input => input.value.trim().toLowerCase());

        const brands = Array.from(
            document.querySelectorAll('input[data-filter="brand"]:checked')
        ).map(input => input.value.trim().toLowerCase());

        const prices = Array.from(
            document.querySelectorAll('input[data-filter="price"]:checked')
        ).map(input => input.value);

        document.querySelectorAll(".dynamic-product").forEach(card => {
            const title = card.querySelector(".title")?.textContent.toLowerCase() || "";
            const category = (card.dataset.category || "").toLowerCase();
            const brand = (card.dataset.brand || "").toLowerCase();
            const price = Number(card.dataset.price || 0);

            const searchMatch =
                !searchText ||
                title.includes(searchText) ||
                category.includes(searchText) ||
                brand.includes(searchText);

            const categoryMatch =
                categories.length === 0 || categories.includes(category);

            const brandMatch =
                brands.length === 0 || brands.includes(brand);

            const priceMatch =
                prices.length === 0 ||
                prices.some(range => {
                    if (range === "7000+") return price >= 7000;

                    const [min, max] = range.split("-").map(Number);
                    return price >= min && price <= max;
                });

            card.style.display =
                searchMatch && categoryMatch && brandMatch && priceMatch
                    ? ""
                    : "none";
        });
    }

    filters.forEach(filter => {
        filter.addEventListener("change", applySearchAndFilters);
    });

    searchButton?.addEventListener("click", applySearchAndFilters);
    searchInput?.addEventListener("input", applySearchAndFilters);

    searchInput?.addEventListener("keydown", event => {
        if (event.key === "Enter") {
            applySearchAndFilters();
        }
    });

    window.filterProducts = applySearchAndFilters;


    // PRICE FORMAT
    function formatPrice(value) {
        const price = Number(String(value || "0").replace(/,/g, ""));
        return Number.isFinite(price) ? price : 0;
    }


    // DISPLAY PRODUCT DETAILS
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
        if (category) category.textContent = item.category || "";

        const title = card.querySelector(".title");
        if (title) title.textContent = item.product_title || "";

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
            throw new Error(`Failed to fetch cart: ${response.status}`);
        }

        const result = await response.json();
        const products = result.data || result;

        if (!Array.isArray(products)) {
            throw new Error("Invalid cart data");
        }

        return products;
    }


    // UPDATE CART COUNT
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
        try {
            const response = await fetch(`${API}/alldata`);

            if (!response.ok) {
                throw new Error(`Failed to fetch products: ${response.status}`);
            }

            const result = await response.json();
            const products = result.data || result;

            if (!Array.isArray(products)) {
                throw new Error("Invalid products data");
            }

            displayProducts(products);
        } catch (error) {
            console.error("Products error:", error);
            productList.textContent =
                "Unable to load products. Please try again.";
        }
    }


    // DISPLAY PRODUCTS ON Products.html
   function displayProducts(products) {
    if (!productList || !productTemplate) return;

    // Keep the template and remove only previously rendered products
    productList.querySelectorAll(".dynamic-product").forEach(card => {
        card.remove();
    });

    products.forEach(function (item) {
        const card = productTemplate.cloneNode(true);

        card.removeAttribute("id");
        card.hidden = false;
        card.classList.add("dynamic-product");

        card.dataset.category = (item.category || "").trim();
        card.dataset.brand = (item.brand || "").trim();

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

        // Add to Cart
        const cartButton = card.querySelector(".cart");

        cartButton.textContent = "Add to Cart";
        cartButton.onclick = function () {
            addToCart(item);
        };

        // Buy Now
        const buyButton = card.querySelector(".buy");

        buyButton.hidden = false;
        buyButton.onclick = function () {
            buyNow(item);
        };

        productList.appendChild(card);
    });

    if (typeof window.filterProducts === "function") {
        window.filterProducts();
    }
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
            console.error("Add to Cart error:", response.status, message);
            alert("Product add aagala. Please try again.");
            return;
        }

        await cartCount();
        alert("Product added to cart!");

    } catch (error) {
        console.error("Add to Cart error:", error);
        alert("Server connection failed.");
    }
}


    // FETCH CART ON Cart.html
    async function fetchCart() {
        try {
            const products = await getCartProducts();
            displayCart(products);
        } catch (error) {
            console.error("Cart error:", error);
            productList.textContent =
                "Unable to load your cart. Please try again.";
        }
    }


    // DISPLAY CART USING cartTemplate
    function displayCart(products) {
        if (!productList || !cartTemplate) return;

        productList.innerHTML = "";

        if (products.length === 0) {
            productList.textContent = "Your cart is empty.";
            return;
        }

        products.forEach(item => {
            const card = cartTemplate.cloneNode(true);

            card.removeAttribute("id");
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
                buyButton.hidden = true;
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
                const message = await response.text();
                throw new Error(
                    `Remove failed (${response.status}): ${message}`
                );
            }

            await fetchCart();
            await cartCount();
        } catch (error) {
            console.error("Remove cart error:", error);
            alert("Unable to remove product. Please check the console.");
        }
    }


    // LOAD THE CORRECT PAGE
    if (productList) {
        if (isCartPage) {
            if (cartTemplate) {
                fetchCart();
            } else {
                console.error(
                    'Cart template not found. Add id="cartTemplate" in Cart.html.'
                );
            }
        } else {
            if (productTemplate) {
                fetchProducts();
            } else {
                console.error(
                    'Product template not found. Add id="productTemplate" in Products.html.'
                );
            }
        }
    }

    cartCount();
});
async function buyNow(item) {
    await addToCart(item);
}