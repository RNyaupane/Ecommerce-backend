const asyncHandler = require('express-async-handler');
const Color = require('../models/colorModel');
const validateMongodbId = require('../utils/validateMongodbId');


//Create a Color
const createColor = asyncHandler(async (req, res) => {
    try {
        const newColor = await Color.create(req.body);
        res.status(201).json(newColor);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});



//Update Color
const updateColor = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        validateMongodbId(id); // Assuming this function validates the MongoDB ObjectId

        const updatedColor = await Color.findByIdAndUpdate(id, req.body, {
            new: true,
        });

        if (!updatedColor) {
            res.status(404).json({ message: 'Color not found' });
            return;
        }
        res.json(updatedColor);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});



//Delete Color
const deleteColor = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        validateMongodbId(id);

        const deletedColor = await Color.findByIdAndDelete(id);

        if (!deletedColor) {
            res.status(404).json({ message: 'Color not found' });
            return;
        }
        res.json({ message: 'Color deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});


//get a Color
const getaColor = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        validateMongodbId(id); // Assuming this function validates the MongoDB ObjectId

        const foundColor = await Color.findById(id);

        if (!foundColor) {
            res.status(404).json({ message: 'Color not found' });
            return;
        }
        res.json(foundColor);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});


//get all Color
const getAllColor = asyncHandler(async (req, res) => {
    try {
        const foundAllColor = await Color.find();
        
        if (!foundAllColor) {
            res.status(404).json({ message: 'Color not found' });
            return;
        }
        res.json(foundAllColor);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});



module.exports = {
    createColor,
    updateColor,
    deleteColor,
    getaColor,
    getAllColor,

};