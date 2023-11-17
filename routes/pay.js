const express=require('express')
const protect = require('../middlewares/authStudent')
const {pay, verify} = require('../controllers/pay')

const router=express.Router()

// Endpoint for Chapa initialization
router.post('/initialize-payment', pay);

// Endpoint for Chapa verification
router.post('/verify-payment/:tx_ref', verify);

module.exports = router;