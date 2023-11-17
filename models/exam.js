const mongoose = require('mongoose');
const Schema=mongoose.Schema
const questionSchema = new Schema({
    questionText: {
        type: String,
        required: true
    },
    options: {
        type: [String],
        required: true
    },
    correctAnswer: {
        type: String,
        required: true
    },
    explanation: {
        type: String,
        required: true
    }
});

const examSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        enum: ['Math', 'Science', 'History', 'English'], // Example subjects (modify as needed)
        required: true
    },
    questions: {
        type: [questionSchema],
        required: true
    },
    providerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ExamProvider', // Reference to the provider creating the exam
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Exam = mongoose.model('Exam', examSchema);

module.exports = Exam;
