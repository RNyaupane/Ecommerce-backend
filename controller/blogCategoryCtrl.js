const asyncHandler = require('express-async-handler');
const Category = require('../models/blogCategoryModel');
const validateMongodbId = require('../utils/validateMongodbId');


//Create a Category
const createCategory = asyncHandler(async (req, res) => {
    try {
        const newCategory = await Category.create(req.body);
        res.status(201).json(newCategory);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});



//Update Category
const updateCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        validateMongodbId(id); // Assuming this function validates the MongoDB ObjectId

        const updatedCategory = await Category.findByIdAndUpdate(id, req.body, {
            new: true,
        });

        if (!updatedCategory) {
            res.status(404).json({ message: 'Blog Category not found' });
            return;
        }
        res.json(updatedCategory);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});



//Delete Category
const deleteCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        validateMongodbId(id);

        const deletedCategory = await Category.findByIdAndDelete(id);

        if (!deletedCategory) {
            res.status(404).json({ message: 'Blog Category not found' });
            return;
        }
        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});


//get a Category
const getaCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        validateMongodbId(id); // Assuming this function validates the MongoDB ObjectId

        const foundCategory = await Category.findById(id);
        
        if (!foundCategory) {
            res.status(404).json({ message: 'Blog Category not found' });
            return;
        }
        res.json(foundCategory);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});


//get all Category
const getAllCategory = asyncHandler(async (req, res) => {
    try {
        const foundAllCategory = await Category.find();
        
        if (!foundAllCategory) {
            res.status(404).json({ message: 'Blog Category not found' });
            return;
        }
        res.json(foundAllCategory);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});



module.exports = {
    createCategory,
    updateCategory,
    deleteCategory,
    getaCategory,
    getAllCategory,

};