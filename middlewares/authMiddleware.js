const express = require('express')
const User = require('../models/userModel')
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const expressAsyncHandler = require('express-async-handler');

const authMiddleware = asyncHandler(async(req, res, next)=>{
    let token;
    if(req?.headers?.authorization?.startsWith('Bearer')){
        token = req.headers.authorization.split(" ")[1];
        try{
            if(token){
                const decoded = jwt.verify(token,process.env.JWT_SECRET);
                const user = await User.findById(decoded?.id);
                req.user = user;
                next();
            }
        }
        catch(error){
            throw new Error("Not Authorized, token expired, Please Login again");
        }
    }else{
        throw new Error('There is no token attached to the header')
    }
})


const isAdmin = asyncHandler(async (req, res, next)=>{
    const { email } = req.user;
    const adminUser = await User.findOne({email});
    if(adminUser.role !== "admin"){
        throw new Error('You are not an admin')
    }else{
        next();
    }
})
            // const isAdmin = asyncHandler(async (req, res, next) => {
            //     if (!req.user) {
            //         return res.status(401).json({ error: 'Unauthorized' });
            //     }
            //     const { email } = req.user;
            //     try {
            //         const adminUser = await User.findOne({ email });
            //         if (!adminUser || adminUser.role !== "admin") {
            //             return res.status(403).json({ error: 'You are not an admin' });
            //         }
            //         next();
            //     } catch (error) {
            //         res.status(500).json({ error: 'Server error' });
            //     }
            // });


module.exports = {authMiddleware, isAdmin};