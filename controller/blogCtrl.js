const Blog = require("../models/blogModel");
const validateMongodbId = require("../utils/validateMongodbId");
const User = require('../models/userModel'); //like dislikes of user is required so we need this
const asyncHandler = require("express-async-handler");

//Create a Blog
const createBlog = asyncHandler(async (req, res) => {
    try {
        const newBlog = await Blog.create(req.body);
        res.json(newBlog)
    } catch (error) {
        throw new Error(error);
    }
})


//Update a blog
const updateBlog = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {
        const updateBlog = await Blog.findByIdAndUpdate(id, req.body, {
            new: true,
        });
        res.json(updateBlog)
    } catch (error) {
        throw new Error(error);
    }
})



//Get blog
const getBlog = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {
        const getBlog = await Blog.findById(id)
            .populate('likes')
            .populate('dislikes');
        await Blog.findByIdAndUpdate(id, {
            $inc: { numViews: 1 }
        }, { new: true }
        )
        res.json(getBlog)
    } catch (error) {
        throw new Error(error);
    }
})


//Get all Blogs
const getAllBlogs = asyncHandler(async (req, res) => {
    try {
        const getBlogs = await Blog.find();
        res.json(getBlogs)
    } catch (error) {
        throw new Error(error);
    }
})

//Delete Blogs
const deleteBlog = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {
        const deletedBlog = await Blog.findByIdAndDelete(id);
        res.json(deletedBlog)
    } catch (error) {
        throw new Error(error);
    }
})


//Like a bLog
const likeBlog = asyncHandler(async (req, res) => {
    const { blogId } = req.body;
    validateMongodbId(blogId);

    //Find the blog which you want to be liked
    const blog = await Blog.findById(blogId);

    //Find the login user
    const loginUserId = req?.user?._id;

    //Find if the user has liked the blog
    const isLiked = blog?.isLiked;

    //Find if the user has disliked the blog
    const alreadyDisliked = blog?.dislikes?.find(
        ((userId) => userId?.toSTring() === loginUserId?.toSTring())
    );
    if (alreadyDisliked) {
        const blog = await Blog.findByIdAndUpdate(blogId, {
            $pull: { dislikes: loginUserId },
            isDisliked: false
        }, { new: true });
        res.json(blog);
    }
    if (isLiked) {
        const blog = await Blog.findByIdAndUpdate(blogId, {
            $pull: { likes: loginUserId },
            isLiked: false
        }, { new: true });
        res.json(blog);
    } else {
        const blog = await Blog.findByIdAndUpdate(blogId, {
            $push: { likes: loginUserId },
            isLiked: true
        }, { new: true });
        res.json(blog);
    }
});





//Disklike a bLog
const dislikeBlog = asyncHandler(async (req, res) => {
    const { blogId } = req.body;
    validateMongodbId(blogId);

    //Find the blog which you want to be liked
    const blog = await Blog.findById(blogId);

    //Find the login user
    const loginUserId = req?.user?._id;

    //Find if the user has liked the blog
    const isDisliked = blog?.isDisliked;

    //Find if the user has disliked the blog
    const alreadyLiked = blog?.likes?.find(
        ((userId) => userId?.toSTring() === loginUserId?.toSTring())
    );
    if (alreadyLiked) {
        const blog = await Blog.findByIdAndUpdate(blogId, {
            $pull: { likes: loginUserId },
            isLiked: false
        }, { new: true });
        res.json(blog);
    }
    if (isDisliked) {
        const blog = await Blog.findByIdAndUpdate(blogId, {
            $pull: { dislikes: loginUserId },
            isDisliked: false
        }, { new: true });
        res.json(blog);
    } else {
        const blog = await Blog.findByIdAndUpdate(blogId, {
            $push: { dislikes: loginUserId },
            isDisliked: true
        }, { new: true });
        res.json(blog);
    }
});





module.exports = {
    createBlog,
    updateBlog,
    getBlog,
    getAllBlogs,
    deleteBlog,
    likeBlog,
    dislikeBlog,

}