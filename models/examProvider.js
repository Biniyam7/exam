const mongoose=require('mongoose')
const Schema=mongoose.Schema
const bcrypt=require('bcryptjs')

const providerSchema=new Schema({
    name:String,
    email:{
        type:String,
        unique:true,
        match:[
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            "please enter a valid email"
        ]
    },
    password:String,
    examsPublished:[{
        type:Schema.Types.ObjectId,
        ref:'Exam'
    }],

},{
    timestamps:true
})
providerSchema.pre("save",async function(next){
    if(this.isModified("password")){
        const salt=await bcrypt.genSalt(10)
        const hashedPassword=await bcrypt.hash(this.password,salt)
        this.password=hashedPassword
    }
    next()   
})

const ExamProvider=mongoose.model('ExamProvider',providerSchema)
module.exports=ExamProvider