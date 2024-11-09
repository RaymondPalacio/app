const crypto = require("crypto");
const nodemailer = require("nodemailer");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const saltRounds = 10;

// User Registration with Email Verification
exports.signUp = async (req, res) => {
    try {
        const { name, age, email, phno, gender, address, password } = req.body;

        // Check if the email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).send("User with this email already exists.");
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Generate a unique verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');

        // Create and save the user
        const user = new User({
            name,
            age,
            email,
            phno,
            gender,
            address,
            password: hashedPassword,
            role: 'client',
            verificationToken, // Store the token
            isVerified: false, // Flag to indicate if email is verified
        });

        await user.save();

        // Send the verification email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'martmacatangay27@gmail.com', // Replace with your email
                pass: 'sxiu jqsh buvl kksn', // Replace with your email password or app password
            }
        });

        const verificationUrl = `http://localhost:3001/verify-email/${verificationToken}`;

        const mailOptions = {
            from: 'your-email@gmail.com',
            to: email,
            subject: 'Please verify your email address',
            text: `Click the link below to verify your email address:\n\n${verificationUrl}`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log("Error sending email:", error);
            } else {
                console.log('Verification email sent: ' + info.response);
            }
        });

        console.log("User registered successfully");
        return res.redirect("/login"); // Redirect user to the login page
    } catch (error) {
        console.error("Error in sign up", error);
        res.status(500).send("An error occurred during registration.");
    }
};

// Email Verification Endpoint
exports.verifyEmail = async (req, res) => {
    const { verificationToken } = req.params; // Get token from the URL

    try {
        // Find user by verification token
        const user = await User.findOne({ verificationToken });

        if (!user) {
            return res.status(400).send("Invalid or expired verification token.");
        }

        // Mark the user as verified and remove the verification token
        user.isVerified = true;
        user.verificationToken = undefined; // Remove the token after verification
        await user.save();

        return res.send("Your email has been successfully verified! You can now log in.");
    } catch (error) {
        console.error("Email verification error:", error);
        res.status(500).send("An error occurred during email verification.");
    }
};

// Login function
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        // Check if the user exists and if the email is verified
        if (!user) {
            return res.status(401).send("Invalid email or password.");
        }

        if (!user.isVerified) {
            return res.status(401).send("Please verify your email first.");
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).send("Invalid email or password.");
        }

        // Set user session for authentication
        req.session.user = { id: user._id, role: user.role, name: user.name };

        if (user.role === "admin") {
            return res.redirect("/admindashboard");
        } else if (user.role === "client") {
            return res.redirect("/clientdashboard");
        }
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).send("An error occurred during login.");
    }
};

// Logout function
exports.logout = (req, res) => {
    req.user = null;
    res.redirect('/');
};

// Password Reset Flow
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).send("No user found with this email.");
        }

        // Generate a reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetToken = resetToken;
        user.resetTokenExpiry = Date.now() + 3600000; // Token expires in 1 hour
        await user.save();

        // Send reset email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'martmacatangay27@gmail.com', // Replace with your email
                pass: 'sxiu jqsh buvl kksn',  // Replace with your email password or app password
            }
        });

        const resetUrl = `http://localhost:3001/reset-password/${resetToken}`;

        const mailOptions = {
            from: 'your-email@gmail.com',
            to: email,
            subject: 'Password Reset Request',
            text: `Click the link below to reset your password:\n\n${resetUrl}`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log("Error sending email:", error);
            } else {
                console.log('Password reset email sent: ' + info.response);
            }
        });

        res.send("Password reset email sent.");
    } catch (error) {
        console.error("Forgot password error:", error);
        res.status(500).send("An error occurred while processing the password reset request.");
    }
};

// Reset Password Flow
exports.resetPassword = async (req, res) => {
    const { resetToken } = req.params;
    const { newPassword } = req.body;

    try {
        const user = await User.findOne({ resetToken, resetTokenExpiry: { $gt: Date.now() } });

        if (!user) {
            return res.status(400).send("Invalid or expired token.");
        }

        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
        user.password = hashedPassword;
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;

        await user.save();

       

        res.redirect("/login");
    } catch (error) {
        console.error("Reset password error:", error);
        res.status(500).send("An error occurred during password reset.");
    }
};

