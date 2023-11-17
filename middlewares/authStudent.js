const catchAsync=require('./catchAsync')
const Student = require('../models/student')
const jwt=require('jsonwebtoken')

const protect=catchAsync(async(req,res,next)=>{
    try{
        const token=req.cookies.token
        if(!token){
            res.status(401)
            throw new Error("Not Authorized,please Login")
        }
        const verified=jwt.verify(token,process.env.JWT_SECRET)
        const student=await Student.findById(verified.id).select("-password")
        if(!student){
            res.status(404)
            throw new Error("student not found")
        }
        req.user=student
        next()
    }catch{
        res.status(401)
        throw new Error("Not Authorized,please Login")
    }
})
module.exports=protect