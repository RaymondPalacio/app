
const User = require("../models/User");
const Product = require("../models/Product");

exports.clientdashboard = async (req, res) => {
    if (req.user && req.user.role === "client") {
    try {
        const products = await Product.find();  // Fetch all products
        res.render("clientdashboard", { 
            user: req.user,  // Assuming user is available via session
            products: products  // Pass products to the view
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error retrieving products");
    }
    } else {
        res.status(403).send("Access denied. Admins only.");
    }
};