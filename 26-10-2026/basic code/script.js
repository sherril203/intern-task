document.addEventListener("DOMContentLoaded", () => {
    const products = document.querySelectorAll(".product");

    const filters = document.querySelectorAll(
        'input[data-filter]'
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

        products.forEach(product => {
            const category = (
                product.dataset.category || ""
            ).trim().toLowerCase();

            const brand = (
                product.dataset.brand || ""
            ).trim().toLowerCase();

            const price = Number(product.dataset.price);

            // Category filter
            const categoryMatch =
                selectedCategories.length === 0 ||
                selectedCategories.includes(category);

            // Brand filter
            const brandMatch =
                selectedBrands.length === 0 ||
                selectedBrands.includes(brand);

            // Price filter
            const priceMatch =
                selectedPrices.length === 0 ||
                selectedPrices.some(range => {
                    if (range === "7000+") {
                        return price >= 7000;
                    }

                    const [min, max] = range
                        .split("-")
                        .map(Number);

                    return price >= min && price <= max;
                });

            // Display product if all selected filters match
            product.style.display =
                categoryMatch && brandMatch && priceMatch
                    ? ""
                    : "none";
        });
    }

    filters.forEach(filter => {
        filter.addEventListener("change", filterProducts);
    });

    filterProducts();
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

    products.forEach(function(item) {
        const card = template.cloneNode(true);
        card.dataset.category = item.category || "";
        card.dataset.brand = item.brand || "";

        const price = Number(String(item.price || "0").replace(/,/g, ""));
        const oldPrice = Number(String(item.original_price || "0").replace(/,/g, ""));

        card.dataset.price = price;

        const img = card.querySelector("img");
        img.src = `${API}/files/${item.image}`;
        img.alt = item.product_title || "Product";

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
}
fetchProducts();

