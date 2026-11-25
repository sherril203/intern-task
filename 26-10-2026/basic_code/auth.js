const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

const page = window.location.pathname.split("/").pop().toLowerCase();

const adminPages = [
    "admin.html",
    "adminproducts.html",
    "feedback.html",
    "productform.html"
];

const userPages = [
    "cart.html",
    "checkout.html",
    "user.html",
    "myorders.html"
];

if (!token) {
    window.location.replace("./login.html");
}
else if (adminPages.includes(page) && role !== "admin") {
    window.location.replace("./login.html");
}
else if (userPages.includes(page) && role !== "user") {
    window.location.replace("./login.html");
}