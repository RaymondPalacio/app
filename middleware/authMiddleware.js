
const User = require("../models/User");
const bcrypt = require("bcrypt");

async function login(req, res) {
    const { email, password } = req.body;

    
    const user = await User.findOne({ email });

    if (user && await bcrypt.compare(password, user.password)) {
        
        req.user = {
            id: user._id,
            role: user.role,
        };

        
        req.session.user = req.user; 

        return res.redirect("/admindashboard"); 
    }

    res.status(401).send("Invalid email or password");
}

module.exports = {
    login,
};


function isAdmin(req, res, next) {
    console.log("Checking admin access. User data:", req.user); 
    if (req.user && req.user.role === 'admin') {
        return next(); 
    }
    return res.status(403).send("Access denied. Admins only."); 
}

module.exports = {
    isAdmin,
};

function isClient(req, res, next) {
    console.log("Checking admin access. User data:", req.user); 
    if (req.user && req.user.role === 'client') {
        return next();
    }
    return res.status(403).send("Access denied. Clients only.");
}

module.exports = {
    isClient,
    isAdmin,
};

