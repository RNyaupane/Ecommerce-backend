const express = require('express');
const { createEnquiry, updateEnquiry, deleteEnquiry, getaEnquiry, getAllEnquiry, } = require('../controller/enqCtrl');
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');
const router=express.Router();


router.post('/',createEnquiry)
router.put('/:id',authMiddleware,isAdmin, updateEnquiry)
router.delete('/:id',authMiddleware,isAdmin, deleteEnquiry)
router.get('/:id', getaEnquiry)
router.get('/', getAllEnquiry)


module.exports=router;