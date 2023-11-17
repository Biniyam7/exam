const express=require('express');
const {addExam, getExamsBySubject, updateExam, deleteExam} = require('../controllers/exam');
const router=express.Router()

router.post('/add',addExam);
router.get('/:subject', getExamsBySubject);
router.put('/:id', updateExam);
router.delete('/:id', deleteExam);
module.exports = router;