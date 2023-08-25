const asyncHandler = require('express-async-handler');
const Brand = require('../models/brandModel');
const validateMongodbId = require('../utils/validateMongodbId');


//Create a Brand
const createBrand = asyncHandler(async (req, res) => {
    try {
        const newBrand = await Brand.create(req.body);
        res.status(201).json(newBrand);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});



//Update Brand
const updateBrand = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        validateMongodbId(id); // Assuming this function validates the MongoDB ObjectId

        const updatedBrand = await Brand.findByIdAndUpdate(id, req.body, {
            new: true,
        });

        if (!updatedBrand) {
            res.status(404).json({ message: 'Brand not found' });
            return;
        }
        res.json(updatedBrand);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});



//Delete Brand
const deleteBrand = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        validateMongodbId(id);

        const deletedBrand = await Brand.findByIdAndDelete(id);

        if (!deletedBrand) {
            res.status(404).json({ message: 'Brand not found' });
            return;
        }
        res.json({ message: 'Brand deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});


//get a Brand
const getaBrand = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        validateMongodbId(id); // Assuming this function validates the MongoDB ObjectId

        const foundBrand = await Brand.findById(id);

        if (!foundBrand) {
            res.status(404).json({ message: 'Brand not found' });
            return;
        }
        res.json(foundBrand);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});


//get all Brand
const getAllBrand = asyncHandler(async (req, res) => {
    try {
        const foundAllBrand = await Brand.find();
        
        if (!foundAllBrand) {
            res.status(404).json({ message: 'Brand not found' });
            return;
        }
        res.json(foundAllBrand);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});



module.exports = {
    createBrand,
    updateBrand,
    deleteBrand,
    getaBrand,
    getAllBrand,

};