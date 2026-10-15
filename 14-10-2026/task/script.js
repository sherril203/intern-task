
const products = [...document.querySelectorAll(".product-info")];

// One selected value for each clickable link filter.
const activeLinks = {};

const selectedFilters = {}; // for checkbox

document.querySelectorAll(".sidebar [data-filter]").forEach((control) => {
  const filterName = control.dataset.filter;

  if (control.matches('input[type="checkbox"]')) {
    control.addEventListener("change", () => {
      selectedFilters[filterName] ??= new Set();

      if (control.checked) {
        selectedFilters[filterName].add(control.value);
      } else {
        selectedFilters[filterName].delete(control.value);
      }

      if (selectedFilters[filterName].size === 0) {
        delete selectedFilters[filterName];
      }

      filterProducts();
    });
  } else {
    control.addEventListener("click", (event) => {
      event.preventDefault();

      const value = control.dataset.value;

      // "all" clears only the category selection.
      if (filterName === "category" && value === "all") {
        delete activeLinks.category;
      } else if (activeLinks[filterName] === value) {
        delete activeLinks[filterName];
      } else {
        activeLinks[filterName] = value;
      }

      filterProducts();
    });
  }
});

function getProductValue(product, key) {
  return product.dataset[key] ?? "";
}

function matchesLinkFilter(product, filterName, value) {
  const data = product.dataset;

  switch (filterName) {
    case "category":
      return data.category === value;

    case "price": {
      const price = Number(data.price);

      if (value === "20001-plus") return price >= 20001;

      const [min, max] = value.split("-").map(Number);
      return price >= min && price <= max;
    }

    case "discount":
      return Number(data.discount) >= Number(value);

    case "deal":
      return data.deal === value;

    default:
      return getProductValue(product, filterName) === value;
  }
}

function matchesCheckboxFilter(product, filterName, values) {
  const data = product.dataset;

  switch (filterName) {
    case "prime":
    case "madeForAmazon":
    case "topBrand":
    case "customizable":
    case "payOnDelivery":
      return data[filterName] === "true";

    case "brand":
      return values.includes(data.brand);

    case "delivery": {
      const deliveryOptions = (data.delivery || "").split(/\s+/);
      return values.some((value) => deliveryOptions.includes(value));
    }

    case "condition":
      return values.includes(data.condition);

    case "arrival":
      return values.some(
        (days) => Number(data.arrivalDays) <= Number(days)
      );

    case "seller":
      return values.includes(data.seller);

    case "origin":
      return values.includes(data.origin);

    case "includeOutOfStock":
      // This option is handled separately below.
      return true;

    default:
      return true;
  }
}

function filterProducts() {
  const includeOutOfStock =
    selectedFilters.includeOutOfStock?.has("true") ?? false;

  products.forEach((product) => {
    let show = true;

    // Hide out-of-stock items unless the user enables that option.
    if (!includeOutOfStock && product.dataset.inStock !== "true") {
      show = false;
    }

    // Apply clickable link filters.
    for (const [filterName, value] of Object.entries(activeLinks)) {
      if (!matchesLinkFilter(product, filterName, value)) {
        show = false;
        break;
      }
    }

    // Apply checkbox filters together.
    if (show) {
      for (const [filterName, values] of Object.entries(selectedFilters)) {
        if (
          filterName === "includeOutOfStock" ||
          values.size === 0
        ) {
          continue;
        }

        if (!matchesCheckboxFilter(product, filterName, [...values])) {
          show = false;
          break;
        }
      }
    }

    product.style.display = show ? "" : "none";
  });
}

// Run once when the page loads.
filterProducts();
