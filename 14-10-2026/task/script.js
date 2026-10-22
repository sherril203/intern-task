
// document.addEventListener("DOMContentLoaded", () => {
//     const products = [...document.querySelectorAll(".product-info")];

//     // Track selected filters
//     const selected = {
//         category: "",
//         price: "",
//         discount: "",
//     };

//     function getCheckedValues(filterName) {
//         return [
//             ...document.querySelectorAll(
//                 `input[data-filter="${filterName}"]:checked`
//             )
//         ].map(input => input.value.trim().toLowerCase());
//     }

//     function matchesProduct(product) {
//         const data = product.dataset;

//         // Category
//         if (
//             selected.category &&
//             selected.category !== "all" &&
//             data.category?.toLowerCase() !== selected.category
//         ) {
//             return false;
//         }

//         // Brand: allow any selected brand
//         const brands = getCheckedValues("brand");
//         if (
//             brands.length &&
//             !brands.includes(data.brand?.toLowerCase())
//         ) {
//             return false;
//         }

//         // Prime
//         if (
//             getCheckedValues("prime").length &&
//             data.prime !== "true"
//         ) {
//             return false;
//         }

//         // Delivery day (products must have data-delivery)
//         const delivery = getCheckedValues("delivery");
//         if (
//             delivery.length &&
//             !delivery.some(day =>
//                 (data.delivery || "").toLowerCase().split(/\s+/).includes(day)
//             )
//         ) {
//             return false;
//         }

//         // Condition
//         const conditions = getCheckedValues("condition");
//         if (
//             conditions.length &&
//             !conditions.includes(data.condition?.toLowerCase())
//         ) {
//             return false;
//         }

//         // Price range
//         if (selected.price) {
//             const price = Number(data.price);
//             const [min, max] = selected.price.split("-");

//             if (price < Number(min)) return false;
//             if (max !== "plus" && price > Number(max)) return false;
//         }

//         // Discount percentage
//         if (
//             selected.discount &&
//             Number(data.discount || 0) < Number(selected.discount)
//         ) {
//             return false;
//         }

//         // Boolean checkbox filters
//         const booleanFilters = {
//             madeForAmazon: "madeForAmazon",
//             topBrand: "topBrand",
//             customizable: "customizable",
//             payOnDelivery: "payOnDelivery",
//         };

//         for (const [filterName, dataName] of Object.entries(booleanFilters)) {
//             if (
//                 getCheckedValues(filterName).length &&
//                 data[dataName] !== "true"
//             ) {
//                 return false;
//             }
//         }

//         // Availability: hide out-of-stock products by default
//         if (
//             !getCheckedValues("includeOutOfStock").length &&
//             data.inStock === "false"
//         ) {
//             return false;
//         }

//         // New arrivals
//         const arrivals = getCheckedValues("arrival");
//         if (
//             arrivals.length &&
//             !arrivals.some(days =>
//                 Number(data.arrivalDays) <= Number(days)
//             )
//         ) {
//             return false;
//         }

//         // Seller
//         const sellers = getCheckedValues("seller");
//         if (
//             sellers.length &&
//             !sellers.includes(data.seller?.toLowerCase())
//         ) {
//             return false;
//         }

//         // Country of origin
//         const origins = getCheckedValues("origin");
//         if (
//             origins.length &&
//             !origins.includes(data.origin?.toLowerCase())
//         ) {
//             return false;
//         }

//         return true;
//     }

//     function applyFilters() {
//         let visibleCount = 0;

//         products.forEach(product => {
//             const show = matchesProduct(product);
//             product.style.display = show ? "" : "none";

//             if (show) visibleCount++;
//         });

//         // Update each section's product grid
//         document.querySelectorAll(".product-list").forEach(list => {
//             const section = list.closest(".electro-products");
//             if (!section) return;

//             const sectionProducts = [
//                 ...list.querySelectorAll(".product-info")
//             ];

//             const sectionHasProducts = sectionProducts.some(product =>
//                 product.style.display !== "none"
//             );

//             const message = section.parentElement.querySelector(".no-products");

//             if (message) {
//                 message.style.display = sectionHasProducts ? "none" : "block";
//             }
//         });

//         // Optional: display a page-wide result count
//         const count = document.getElementById("filterCount");
//         if (count) {
//             count.textContent = `${visibleCount} product(s) found`;
//         }
//     }

//     // Sidebar checkboxes
//     document.querySelectorAll(".sidebar input[data-filter]")
//         .forEach(input => {
//             input.addEventListener("change", applyFilters);
//         });

//     // Category links
//     document.querySelectorAll(
//         '.sidebar a[data-filter="category"]'
//     ).forEach(link => {
//         link.addEventListener("click", event => {
//             event.preventDefault();
//             selected.category = (
//                 link.dataset.value || ""
//             ).toLowerCase();

//             applyFilters();
//         });
//     });

//     // Price links
//     document.querySelectorAll(".sidebar a[data-value]")
//         .forEach(link => {
//             if (link.dataset.filter === "discount") return;

//             link.addEventListener("click", event => {
//                 event.preventDefault();
//                 selected.price = link.dataset.value || "";
//                 applyFilters();
//             });
//         });

//     // Discount links
//     document.querySelectorAll(
//         '.sidebar a[data-filter="discount"]'
//     ).forEach(link => {
//         link.addEventListener("click", event => {
//             event.preventDefault();
//             selected.discount = link.dataset.value || "";
//             applyFilters();
//         });
//     });

//     // Clicking a selected category/price/discount again clears it
//     document.querySelectorAll(".sidebar a[data-filter], .sidebar a[data-value]")
//         .forEach(link => {
//             link.addEventListener("dblclick", event => {
//                 event.preventDefault();

//                 if (link.dataset.filter === "category") {
//                     selected.category = "";
//                 } else if (link.dataset.filter === "discount") {
//                     selected.discount = "";
//                 } else if (link.dataset.value) {
//                     selected.price = "";
//                 }

//                 applyFilters();
//             });
//         });

//     applyFilters();
// });



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
