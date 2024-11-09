
const express = require("express");
const router = express.Router();
const { adminDashboard, addProduct, showAddProductForm, showEditProductForm, updateProduct, deleteProduct } = require("../controllers/adminController");
const { isAdmin } = require("../middleware/authMiddleware");


router.get("/admindashboard", isAdmin, adminDashboard);


router.get("/addproduct", isAdmin, showAddProductForm);  


router.post("/addproduct", isAdmin, addProduct);  

router.get("/editproduct/:id", isAdmin, showEditProductForm);
router.post("/editproduct/:id", isAdmin, updateProduct);

router.post("/deleteproduct/:id", isAdmin, deleteProduct);




module.exports = router;
