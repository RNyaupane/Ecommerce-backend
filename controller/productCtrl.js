const Product = require('../models/productModel');
const User = require('../models/userModel')
const asyncHandler = require('express-async-handler');
const validateMongodbId = require('../utils/validateMongodbId');
const slugify = require('slugify');


//Create Product
const createProduct = asyncHandler(async (req, res) => {
    try {
        if (req.body.title) {
            req.body.slug = slugify(req.body.title);
        }
        const newProduct = await Product.create(req.body);
        res.json(newProduct);
    } catch (error) {
        throw new Error(error);
    }
});



//Update Product
const updateProduct = asyncHandler(async (req, res) => {
    const id = req.params.id; // Extract the id from req.params
    validateMongodbId(id);
    try {
        if (req.body.title) {
            req.body.slug = slugify(req.body.title);
        }
        const updateProduct = await Product.findOneAndUpdate({ _id: id }, req.body, {
            new: true,
        });
        if (!updateProduct) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(updateProduct);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});


//Delete Product
const deleteProduct = asyncHandler(async (req, res) => {
    const id = req.params.id; // Extract the id from req.params
    validateMongodbId(id);
    try {
        const deleteProduct = await Product.findOneAndDelete({ _id: id });

        if (!deleteProduct) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json(deleteProduct);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});



//Get Product
const getaProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {
        const findProduct = await Product.findById(id);
        res.json(findProduct);
    }

    catch (error) {
        throw new Error(error)
    }
})


//Get All Porducts
const getAllProduct = asyncHandler(async (req, res) => {
    try {
        //Filtering
        const queryObj = { ...req.query };
        const excludeFields = ['page', 'sort', 'limit', 'fields'];
        excludeFields.forEach((el) => delete queryObj[el])

        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt\lte\lt)\b/g, (match) => `$${match}`);
        let query = Product.find(JSON.parse(queryStr));


        //Sorting
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(" ");
            query = query.sort(sortBy)
        } else {
            query = query.sort('-createdAt');
        }


        //limiting the fields (Hamle Model ma select false gare jasto)
        if (req.query.fields) {
            const fields = req.query.fields.split(",").join(" ");
            query = query.select(fields);
        } else {
            query = query.select('-__v');
        }


        //Pagination
        const page = req.query.page;
        const limit = req.query.limit;
        const skip = (page - 1) * limit;
        query = query.skip(skip).limit(limit);
        if (req.query.page) {
            const productCount = await Product.countDocuments();
            if (skip >= productCount) throw new Error("This Page Doesnot exist");
        }
        console.log(page, limit, skip);

        const product = await query;
        res.json(product);
    }
    catch (error) {
        throw new Error(error);
    }
})


const addToWishlist = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { productId } = req.body;
    try {
        const user = await User.findById(_id);
        const alreadyAdded = user.wishlist.find((id) => id.toString() === productId);
        if (alreadyAdded) {
            let user = await User.findByIdAndUpdate(_id, {
                $pull: { wishlist: productId },
            }, {
                new: true,
            })
            res.json(user);
        } else {
            let user = await User.findByIdAndUpdate(_id, {
                $push: { wishlist: productId },
            }, {
                new: true,
            })
            res.json(user);
        }
    } catch (error) {
        throw new Error(error);
    }
})


//Rating
const rating = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { star, productId } = req.body;
    try {
        const product = await Product.findById(productId);

        //check already rated or not
        let alreadyRated = product.ratings.find((userId) => userId.postedby.toString() === _id.toString());
        if (alreadyRated) {
            const updateRating = await Product.updateOne({
                ratings: { $elemMatch: alreadyRated },
            },
                {
                    $set: { "ratings.$.star": star }
                },
                {
                    new: true,
                })
        }
        else {
            const rateProduct = await Product.findByIdAndUpdate(productId, {
                $push: {
                    ratings: {
                        star: star,
                        postedby: _id,
                    },
                },
            }, { new: true });
        }
        const getAllRatings = await Product.findById(productId);
        let totalRating = getAllRatings.ratings.length;
        let ratingSum = getAllRatings.ratings.map((item) => item.star)
            .reduce((prev, curr) => prev+curr, 0);
        let actualRating = Math.round(ratingSum / totalRating);
        let finalProduct = await Product.findByIdAndUpdate(productId, {
            totalrating: actualRating,
        }, { new: true })
        res.json(finalProduct)
    }
    catch (error) {
        throw new Error(error);
    }
})




module.exports = {
    createProduct,
    getaProduct,
    getAllProduct,
    updateProduct,
    deleteProduct,
    addToWishlist,
    rating
};
