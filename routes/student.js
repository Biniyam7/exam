const express=require('express')
const { registerStudent, loginStudent, logoutStudent,getStudent,loginStatus, forgotPassword,resetPassword,sendOtp } = require('../controllers/student') 
const protect = require('../middlewares/authStudent')
const { takeExam } = require('../controllers/student')
const { getExam } = require('../controllers/student')





const router=express.Router()


router.post('/register',registerStudent)
router.post('/login',loginStudent)
router.get('/logout',logoutStudent)
router.get('/getStudent',protect,getStudent)
router.get('/isLoggedIn',loginStatus)
router.post('/forgotPassword',forgotPassword)
router.put('/resetpassword/:resetToken',protect,resetPassword)
router.post('/sendOtp',sendOtp)
// Verification Endpoint
// router.post('/verify',);
router.post('/getExam',getExam)
router.post('/takeExam',protect,takeExam)

module.exports=router