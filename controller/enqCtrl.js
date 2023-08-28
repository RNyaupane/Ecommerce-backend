const asyncHandler = require('express-async-handler');
const Enquiry = require('../models/enqModel');
const validateMongodbId = require('../utils/validateMongodbId');


//Create a Enquiry
const createEnquiry = asyncHandler(async (req, res) => {
    try {
        const newEnquiry = await Enquiry.create(req.body);
        res.status(201).json(newEnquiry);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});



//Update Enquiry
const updateEnquiry = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        validateMongodbId(id); // Assuming this function validates the MongoDB ObjectId

        const updatedEnquiry = await Enquiry.findByIdAndUpdate(id, req.body, {
            new: true,
        });

        if (!updatedEnquiry) {
            res.status(404).json({ message: 'Enquiry not found' });
            return;
        }
        res.json(updatedEnquiry);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});



//Delete Enquiry
const deleteEnquiry = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        validateMongodbId(id);

        const deletedEnquiry = await Enquiry.findByIdAndDelete(id);

        if (!deletedEnquiry) {
            res.status(404).json({ message: 'Enquiry not found' });
            return;
        }
        res.json({ message: 'Enquiry deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});


//get a Enquiry
const getaEnquiry = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        validateMongodbId(id); // Assuming this function validates the MongoDB ObjectId

        const foundEnquiry = await Enquiry.findById(id);

        if (!foundEnquiry) {
            res.status(404).json({ message: 'Enquiry not found' });
            return;
        }
        res.json(foundEnquiry);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});


//get all Enquiry
const getAllEnquiry = asyncHandler(async (req, res) => {
    try {
        const foundAllEnquiry = await Enquiry.find();
        
        if (!foundAllEnquiry) {
            res.status(404).json({ message: 'Enquiry not found' });
            return;
        }
        res.json(foundAllEnquiry);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});



module.exports = {
    createEnquiry,
    updateEnquiry,
    deleteEnquiry,
    getaEnquiry,
    getAllEnquiry,

};