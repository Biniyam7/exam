
const express=require('express');
const {createSub, getSub, getPayment, getActiveUsers} = require('../controllers/subscription')
const protect = require('../middlewares/authStudent')

const router=express.Router()

router.post('/create-subscription',protect, createSub);
 
// Get student and associated subscription
router.get('/getsubscription/:studentId', getSub)
router.get('/getpayment', getPayment)
router.get('/getActiveUsers', getActiveUsers)
module.exports = router;