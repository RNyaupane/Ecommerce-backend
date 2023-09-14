const { generateToken } = require('../config/jwtToken');
const User = require('../models/userModel');
const Product = require('../models/productModel');
const Cart = require('../models/cartModel');
const Order = require('../models/orderModel');
const asyncHandler = require('express-async-handler');
const validateMongodbId = require('../utils/validateMongodbId');
const { generateRefreshToken } = require('../config/refreshtoken');
const jwt = require('jsonwebtoken');
const sendEmail = require('./emailCtrl');
const crypto = require('crypto');
const Coupon = require('../models/couponModel');

const uniqid = require('uniqid')


//Create a user
const createUser = asyncHandler(async (req, res) => {
    const email = req.body.email;
    const findUser = await User.findOne({ email: email });
    if (!findUser) {
        //Create a new user
        const newUser = await User.create(req.body);
        res.json(newUser);
    }
    else {
        //User already Exists
        throw new Error('User Already Exists')
    }
});



//Login a User
// const loginUserCtrl = asyncHandler(async (req, res) => {
//     const { email, password } = req.body;
//     //check if user exist or not
//     const findUser = await User.findOne({ email })
//     if (findUser && await findUser.isPasswordMatched(password)) {
//         const refreshToken = await generateRefreshToken(findUser?._id);
//         const updateUser = await User.findByIdAndUpdate(findUser.id, {
//             refreshToken: refreshToken,
//         }, {
//             new: true
//         })
//         res.cookie('refreshToken', refreshToken, {
//             httpOnly: true,
//             maxAge: 72 * 60 * 60 * 1000,
//         });
//         res.json({
//             id: findUser?._id,
//             firstname: findUser?.firstname,
//             lastname: findUser.lastname,
//             email: findUser.email,
//             mobile: findUser.mobile,
//             token: generateToken(findUser?._id),
//         });
//     } else {
//         throw new Error("Invalid Credentials")
//     }
// })
const loginUserCtrl = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Check if the user exists
    const findUser = await User.findOne({ email });

    if (findUser && await findUser.isPasswordMatched(password)) {
        // Generate a new refresh token
        const refreshToken = await generateRefreshToken(findUser?._id);

        // Update the user's refresh token
        const updateUser = await User.findByIdAndUpdate(findUser.id, {
            refreshToken: refreshToken,
        }, {
            new: true
        });

        // Set the refresh token as an HTTP-only cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 72 * 60 * 60 * 1000, // 72 hours
        });

        // Respond with user information and access token
        res.json({
            id: findUser?._id,
            firstname: findUser?.firstname,
            lastname: findUser?.lastname,
            email: findUser?.email,
            mobile: findUser?.mobile,
            token: generateToken(findUser?._id),
        });
    } else {
        // Invalid credentials
        throw new Error("Invalid Credentials");
    }
});



//Admin Login
const loginAdmin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    //check if user exist or not
    const findAdmin = await User.findOne({ email })
    if (findAdmin.role !== 'admin') throw new Error("You are not an Admin");
    if (findAdmin && await findAdmin.isPasswordMatched(password)) {
        const refreshToken = await generateRefreshToken(findAdmin?._id);
        const updateUser = await User.findByIdAndUpdate(findAdmin.id, {
            refreshToken: refreshToken,
        }, {
            new: true
        })
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 72 * 60 * 60 * 1000,
        });
        res.json({
            id: findAdmin?._id,
            firstname: findAdmin?.firstname,
            lastname: findAdmin.lastname,
            email: findAdmin.email,
            mobile: findAdmin.mobile,
            token: generateToken(findAdmin?._id),
        });
    } else {
        throw new Error("Invalid Credentials")
    }
})


//handle refresh token
const handleRefreshToken = asyncHandler(async (req, res) => {
    const cookie = req.cookies;
    if (!cookie?.refreshToken) throw new Error('No refresh Token in Cookies');
    const refreshToken = cookie.refreshToken;
    const user = await User.findOne({ refreshToken });
    if (!user) throw new Error('No Refresh Token Present in Databaseor not matched')
    jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
        if (err || user.id !== decoded.id) {
            throw new Error("There is something wrong with refresh Token");
        }
        const accessToken = generateToken(user?._id)
        res.json({ accessToken });
    });
})



// Logout Functionality
const logout = asyncHandler(async (req, res) => {
    const cookie = req.cookies;
    if (!cookie?.refreshToken) throw new Error('No refresh Token in Cookies');
    const refreshToken = cookie.refreshToken;
    const user = await User.findOne({ refreshToken });
    if (!user) {
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: true,
        });
        return res.sendStatus(204); // Forbidden
    }
    await User.findOneAndUpdate(
        { refreshToken },
        {
            refreshToken: "",
        }
    );
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,
    });
    res.sendStatus(204); // Forbidden
});




//Get all users
const getallUser = asyncHandler(async (req, res) => {
    try {
        const getUsers = await User.find();
        res.json(getUsers);
    }
    catch (error) {
        throw new Error(error);
    }
})



//Get a single user
const getaUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {
        const getaUser = await User.findById(id);
        res.json({
            getaUser,
        })
    }
    catch (error) {
        throw new Error(error);
    }
})



//Delete user
const deleteaUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {
        const deleteaUser = await User.findByIdAndDelete(id);
        res.json({
            deleteaUser,
        })
    }
    catch (error) {
        throw new Error(error);
    }
})



//Update a user
const updatedUser = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validateMongodbId(_id);
    try {
        const updatedUser = await User.findByIdAndUpdate(_id, {
            firstname: req?.body?.firstname,
            lastname: req?.body?.lastname,
            email: req?.body?.email,
            mobile: req?.body?.mobile,
        },
            {
                new: true,
            })
        res.json(updatedUser);
    }
    catch (error) {
        throw new Error(error);
    }
})


//Save user address
const saveAddress = asyncHandler(async (req, res, next) => {
    const { _id } = req.user;
    validateMongodbId(_id);
    try {
        const updatedUser = await User.findByIdAndUpdate(_id, {
            address: req?.body?.address,
        },
            {
                new: true,
            })
        res.json(updatedUser);
    }
    catch (error) {
        throw new Error(error);
    }
})


// Block a user
const blockUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {
        const blockuser = await User.findByIdAndUpdate(id, {
            isBlocked: true
        }, {
            new: true,
        });
        res.json(blockuser);
    }
    catch (error) {
        throw new Error(error);
    }
});



// Unblock a user
const unblockUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {
        const unblock = await User.findByIdAndUpdate(id, {
            isBlocked: false
        }, {
            new: true,
        });
        res.json({
            message: "User is Unblocked"
        })
    }
    catch (error) {
        throw new Error(error);
    }
});



//Updating a password
const updatePassword = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { password } = req.body;
    validateMongodbId(_id);
    const user = await User.findById(_id);
    if (password) {
        user.password = password;
        const updatedPassword = await user.save();
        res.json(updatedPassword);
    }
    else {
        res.json(user);
    }
})


//Forgot Password
const forgotPasswordToken = asyncHandler(async (req, res) => {
    try {
        const { email } = req.body;

        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            throw new Error("User not found with this email");
        }

        // Generate a password reset token
        const token = await user.createPasswordResetToken();
        await user.save();

        // Construct the password reset URL
        const resetURL = `Hi there, <a href="http://localhost:5000/api/user/reset-password/${token}">Click Here<a/> to reset your password. Please note that the link expires after 10 minutes.`;

        // Prepare email data
        const emailData = {
            to: email,
            subject: "Password Reset Link",
            text: "Hello! We received a request to reset your password.",
            html: resetURL,
        };

        // Send the password reset email
        await sendEmail(emailData);

        res.json({ message: "Password reset token has been sent to your email.", token });
    } catch (error) {
        // Handle any errors that occur during the process
        res.status(500).json({ error: "An error occurred while processing your request." });
    }
});




//Reset Password
const resetPassword = asyncHandler(async (req, res) => {
    try {
        const { password } = req.body;
        const token = req.params.token;

        // Hash the token using SHA-256
        const hashedToken = crypto.createHash('sha256').update(token).digest("hex");

        // Find a user with a valid reset token and not expired
        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() },
        });

        if (!user) {
            throw new Error("Token Expired or Invalid, Please request a new reset link.");
        }

        // Update the user's password and reset token details
        user.password = password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        // Respond with a success message or user object (based on preference)
        res.json({ message: "Password reset successful.", user });
    } catch (error) {
        // Handle errors that occur during the process
        res.status(400).json({ error: error.message });
    }
});


const getWishlist = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    try {
        const findUser = await User.findById(_id).populate('wishlist');
        res.json(findUser);

    } catch (error) {
        throw new Error(error);
    }
})


//Create user cart
const userCart = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { cart } = req.body;
    // validateMongodbId(_id);
    try {
        let products = [];
        const user = await User.findById(_id);
        //Check if user already have product in cart
        const alreadyExistCart = await Cart.findOne({ orderby: user._id });
        if (alreadyExistCart) {
            await Cart.findOneAndDelete({ orderby: user._id });
        }
        for (let i = 0; i < cart.length; i++) {
            let object = {};
            object.product = cart[i]._id;
            object.count = cart[i].count;
            object.color = cart[i].color;
            let getPrice = await Product.findById(cart[i]._id).select('price').exec();
            object.price = getPrice.price;
            products.push(object);
        }
        let cartTotal = 0;
        for (let i = 0; i < products.length; i++) {
            cartTotal = cartTotal + products[i].price * products[i].count;
        }

        let newCart = await new Cart({
            products,
            cartTotal,
            orderby: user?.id,
        }).save();
        res.json(newCart);
    } catch (error) {
        throw new Error(error);
    }
})


//Get user cart
const getUserCart = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validateMongodbId(_id);
    try {
        const cart = await Cart.findOne({ orderby: _id }).populate("products.product")
        res.json(cart);
    } catch (error) {
        throw new Error(error);
    }
})


//Empty Cart functionality
const emptyCart = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validateMongodbId(_id);
    try {
        const user = await User.findOne(_id);
        const cart = await Cart.findOneAndRemove({ orderby: user._id });
        res.json(cart);
    } catch (error) {
        throw new Error(error);
    }
})


const applyCoupon = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validateMongodbId(_id);
    const { coupon } = req.body;
    const validCoupon = await Coupon.findOne({ name: coupon });
    if (validCoupon === null) {
        throw new Error("Invalid Coupon");
    }
    const user = await User.findOne({ _id });
    let { products, cartTotal } = await Cart.findOne({ orderby: user._id }).populate("products.product");
    let totalAfterDiscount = (cartTotal - (cartTotal * validCoupon.discount) / 100).toFixed(2);
    await Cart.findOneAndUpdate(
        { orderby: user._id },
        { totalAfterDiscount },
        { new: true }
    )
    res.json(totalAfterDiscount);
})


//
const createOrder = asyncHandler(async (req, res) => {
    const { COD, couponApplied } = req.body;
    const { _id } = req.user;
    validateMongodbId(_id);
    try {
        if (!COD) throw new Error("Create Cash order failed");
        const user = await User.findById(_id)
        let userCart = await Cart.findOne({ orderby: user._id });
        let finalAmount = 0;
        if (couponApplied && userCart.totalAfterDiscount) {
            finalAmount = userCart.totalAfterDiscount;
        } else {
            finalAmount = userCart.cartTotal;
        }
        let newOrder = await new Order(
            {
                products: userCart.products,
                paymentIntent: {
                    id: uniqid(),
                    method: "COD",
                    amount: finalAmount,
                    status: "Cash on Delivery",
                    created: Date.now(),
                    currency: "usd",
                },
                orderby: user._id,
                orderStatus: "Cash on Delivery",
            }
        ).save();
        let update = userCart.products.map((item) => {
            return {
                updateOne: {
                    filter: { _id: item.product._id },
                    update: { $inc: { quantity: -item.count, sold: +item.count } },
                }
            }
        })
        const updated = await Product.bulkWrite(update, {});
        res.json({ message: "success" })
    } catch (error) {
        throw new Error(error);
    }
})


const getOrders = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validateMongodbId(_id);
    try {
        const userorders = await Order.findOne({ orderby: _id }).populate('products.product').populate('orderby').exec();
        res.json(userorders);
    } catch (error) {
        throw new Error(error)
    }
})
const getAllOrders = asyncHandler(async (req, res) => {
    try {
        const allorders = await Order.find().populate('products.product').populate('orderby').exec();
        res.json(allorders);
    } catch (error) {
        throw new Error(error)
    }
})


const updateOrderStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const { id } = req.params;
    validateMongodbId(id);
    try {
        const updateOrderStatus = await Order.findByIdAndUpdate(id,
            {
                orderStatus: status,
                paymentIntent: {
                    status: status,
                }
            }, { new: true })
        res.json(updateOrderStatus);
    } catch (error) {
        throw new Error(error);
    }
})

module.exports = {
    createUser,
    loginUserCtrl,
    getallUser,
    getaUser,
    deleteaUser,
    updatedUser,
    blockUser,
    unblockUser,
    handleRefreshToken,
    logout,
    updatePassword,
    forgotPasswordToken,
    resetPassword,
    loginAdmin,
    getWishlist,
    saveAddress,
    userCart,
    getUserCart,
    emptyCart,
    applyCoupon,
    createOrder,
    getOrders,
    getAllOrders,
    updateOrderStatus
};
