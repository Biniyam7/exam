// const mongoose=require('mongoose')
// const Schema=mongoose.Schema
// const bcrypt=require('bcryptjs')



// const examTakenSchema = new Schema({
//     exam: {
//         type: Schema.Types.ObjectId,
//         ref: 'Exam'
//     },
//     answers: [{
//         question: {
//             type: String
//         },
//         result: {
//             type: String,
//             enum: ['Correct', 'Incorrect']
//         }
//     }],
//     score: {
//         type: Number
//     }
// });

// const studentSchema=new Schema({
//     name:{
//         type:String,
//         required:true,
//         unique:true
//     },
//     password:{
//         type:String,
//         required:true,
//         minLength:[6,"password must be up to 6 characters"]
//     },
//     phoneNumber:{
//         type:String,
//         required:true,
//         unique:true
//     },
//     email:{
//         type:String,
//         // required:true,
//         unique:true,
//         match:[
//             /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
//             "please enter a valid email"
//         ]
//     },
//     examsTaken:[examTakenSchema],
//     subscription:{
//         type:Schema.Types.ObjectId,
//         ref:'Subscription'
//     }
// },{
//     timestamps:true
// })

// studentSchema.pre("save",async function(next){
//     if(this.isModified("password")){
//         const salt=await bcrypt.genSalt(10)
//         const hashedPassword=await bcrypt.hash(this.password,salt)
//         this.password=hashedPassword
//     }
//     next()
    
// })
// const Student=mongoose.model('Student',studentSchema)
// module.exports=Student


const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');

const examTakenSchema = new Schema({
    exam: {
        type: Schema.Types.ObjectId,
        ref: 'Exam'
    },
    answers: [{
        question: {
            type: String
        },
        result: {
            type: String,
            enum: ['Correct', 'Incorrect']
        }
    }],
    score: {
        type: Number
    }
});

const studentSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minLength: [6, "Password must be at least 6 characters"]
    },
    phoneNumber: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        unique: true,
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            "Please enter a valid email"
        ]
    },
    examsTaken: [examTakenSchema], // Include the examTakenSchema as a subdocument
    subscription: {
        type: Schema.Types.ObjectId,
        ref: 'Subscription'
    }
}, {
    timestamps: true
});

studentSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(this.password, salt);
        this.password = hashedPassword;
    }
    next();
});

const Student = mongoose.model('Student', studentSchema);
module.exports = Student;
