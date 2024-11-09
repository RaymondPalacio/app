
const User = require("../models/User");
const Product = require("../models/Product");

exports.adminDashboard = async (req, res) => {
    if (req.user && req.user.role === "admin") {
        try {
            
            const products = await Product.find({});

            
            res.render("admindashboard", {
                user: req.user, 
                products: products  
            });
        } catch (error) {
            console.error("Error fetching products:", error);
            res.status(500).send("An error occurred while fetching products.");
        }
    } else {
        res.status(403).send("Access denied. Admins only.");
    }
};

exports.addProduct = async (req, res) => {
    try {
        const { name, price, description, category, stock } = req.body;
        const newProduct = new Product({
            name,
            price,
            description,
            category,
            stock
        });
        await newProduct.save();
        res.redirect("/admindashboard"); 
    } catch (error) {
        console.error("Error adding product:", error);
        res.status(500).send("An error occurred while adding the product.");
    }
};


exports.showAddProductForm = (req, res) => {
    if (req.user && req.user.role === "admin") {
        res.render("addproduct"); 
    } else {
        res.status(403).send("Access denied. Admins only.");
    }
};

exports.showEditProductForm = async (req, res) => {
    const productId = req.params.id;
    try {
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).send("Product not found.");
        }
        res.render("editproduct", { product });
    } catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).send("An error occurred while fetching the product.");
    }
};

exports.updateProduct = async (req, res) => {
    const productId = req.params.id;
    const { name, price, description, category, stock } = req.body;
    try {
        const product = await Product.findByIdAndUpdate(
            productId,
            { name, price, description, category, stock },
            { new: true }  // Return the updated product
        );
        if (!product) {
            return res.status(404).send("Product not found.");
        }
        res.redirect("/admindashboard");
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).send("An error occurred while updating the product.");
    }
};  



exports.deleteProduct = async (req, res) => {
    const productId = req.params.id;
    try {
        const product = await Product.findByIdAndDelete(productId);
        if (!product) {
            return res.status(404).send("Product not found.");
        }
        res.redirect("/admindashboard");
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).send("An error occurred while deleting the product.");
    }
};
