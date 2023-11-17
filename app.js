const dotenv=require('dotenv').config()
const connectdb = require("./config/db")
const express=require('express')
const mongoose=require('mongoose')
const bodyParser=require('body-parser')
const cookieParser=require('cookie-parser')
// const client = require('twilio')('AC2dfb7b3e275f71424e5634b9c0ed0b57', '149b9a11980bff1861f0957a8da966fc');

const errorHandler=require('./middlewares/errorHandler')

const app=express();
connectdb();

// mongoose.set('strictQuery',false)
//  mongoose.connect('mongodb://127.0.0.1:27017/examBank1')
//  .then(()=>{
//     console.log("connected")
//  }).catch((e)=>{
//     console.log(e)
//  })
 app.use(express.json())
 app.use(cookieParser())
 app.use(express.urlencoded({extended:false}))
 app.use(bodyParser.json())

//  ROUTES
const providerRoute=require('./routes/examProvider')
const studentRoute=require('./routes/student')
const examRoute=require('./routes/examRoutes')
const payRoute=require('./routes/pay')
const subRoute=require('./routes/subscription')


// Route middlewares
app.use("/api/examProvider",providerRoute)
app.use("/api/students",studentRoute)
app.use("/api/exam",examRoute)
app.use("/api/sub",subRoute)
app.use("/api/pay",payRoute)
app.get('/', (req, res) => {
    res.send('Hello, World!');
   // res.json()
  });
app.use(errorHandler)
const PORT = process.env.PORT || 3000
app.listen(PORT,()=>{
    console.log("listening on port 3000")
 })
//  chapa