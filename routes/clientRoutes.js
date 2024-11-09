// routes/clientRoutes.js
const express = require("express");
const User = require("../models/User");
const Product = require("../models/Product");
const router = express.Router();


// Route to show client dashboard
router.get("/clientdashboard", async (req, res) => {
    try {
        const products = await Product.find();  // Fetch all products
        res.render("clientdashboard", { 
            user: req.user,  // Assuming the user is available in req.user
            products: products // Pass products to the view
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error retrieving products");
    }
});


module.exports = router;
