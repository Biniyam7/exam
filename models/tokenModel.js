const mongoose=require('mongoose')
const Schema=mongoose.Schema

const tokenSchema=Schema({
    studentId:{
        type:Schema.Types.ObjectId,
        // required:true,
        ref:'Student'
    },
    providerId:{
        type:Schema.Types.ObjectId,
        // required:true,
        ref:'ExamProvider'
    },
    
    token:{
        type:String,
        required:true
    },
    createdAt:{
        type:Date,
        required:true
    },
    expiresAt:{
        type:Date,
        required:true
    },
})

const Token=mongoose.model('Token',tokenSchema)
module.exports=Token