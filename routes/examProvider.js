const express=require('express')
const router=express.Router()

const protect = require('../middlewares/authProvider')
const { registerProvider, loginProvider, logoutProvider, getProvider, loginStatus, createExam, getExams, updateExam, deleteExam } = require('../controllers/examProvider')

router.post('/register',registerProvider)
router.post('/login',loginProvider)
router.get('/logout',logoutProvider)
router.get('/getExamProvider',protect,getProvider)
router.get('/isLoggedIn',loginStatus)
router.post('/exams',protect,createExam)
router.get('/exams',protect,getExams)
router.delete('/exams/:examId',protect,deleteExam)


module.exports=router