const catchAsync=require('./catchAsync')
const ExamProvider = require('../models/examProvider')
const jwt=require('jsonwebtoken')

const protect=catchAsync(async(req,res,next)=>{
    try{
        const token=req.cookies.token
        if(!token){
            res.status(401)
            throw new Error("Not Authorized,please Login")
        }
        const verified=jwt.verify(token,process.env.JWT_SECRET)
        const provider=await ExamProvider.findById(verified.id).select("-password")
        if(!provider){
            res.status(404)
            throw new Error("exam provider not found")
        }
        req.user=provider
        next()
    }catch{
        res.status(401)
        throw new Error("Not Authorized,please Login")
    }
})
module.exports=protect