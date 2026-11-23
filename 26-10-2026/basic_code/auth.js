
const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

// Get the required role from the current page
const currentPage = window.location.pathname.toLowerCase();

const adminPages = [
    "admin.html",
    "adminproducts.html",
    "feedback.html",
    "productform.html"
];

const userPages = [
    "cart.html",
    "checkout.html",
    "userprofile.html"
];

const page = currentPage.split("/").pop();

if (!token) {
    window.location.replace("./login.html");
}
else if (adminPages.includes(page) && role !== "admin") {
    window.location.replace("./login.html");
}
else if (userPages.includes(page) && role !== "user") {
    window.location.replace("./login.html");
}
