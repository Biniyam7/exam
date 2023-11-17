const catchAsync = require('../middlewares/catchAsync');
const Exam = require('../models/exam'); 

const addExam = catchAsync(async (req, res) => {
    const { question, subject } = req.body;

    // Ensure the question object is present
    if (!question || !question.choices || question.choices.length !== 4 || !question.answer) {
        return res.status(400).json({ error: 'Invalid question format. Choices must be an array with exactly 4 elements, and answer must be provided.' });
    }

    // Ensure the answer is one of the choices
    if (!question.choices.includes(question.answer)) {
        return res.status(400).json({ error: 'The answer must be one of the choices.' });
    }

    const exam = new Exam({
        question,
        subject,
    });

    await exam.save();

    // Check if the exam was saved successfully
    if (exam._id) {
        res.status(201).json(exam);
    } else {
        res.status(400).json({ error: 'Invalid data or failed to save the exam.' });
    }
});

const getExamsBySubject = catchAsync(async (req, res) => {
    const { subject } = req.params;

    // Validate subject
    if (!subject) {
        return res.status(400).json({ error: 'Subject is required.' });
    }

    // Fetch exams based on subject
    const exams = await Exam.find({ subject });

    res.status(200).json(exams);
});

const updateExam = catchAsync(async(req, res) => {
    const update = await Exam.findByIdAndUpdate(
        req.params.id,
        req.body,
        {new: true }
    );
    res.status(201).json(update);



});

const deleteExam = catchAsync(async (req, res) => {
    const del = await Exam.findById(req.params.id);
    if(!del){
        res.status(404);
        throw new Error("Exam not found!!");
    }
    await del.deleteOne();
    res.status(200).json(del);
});

module.exports = {addExam, getExamsBySubject, updateExam, deleteExam};
