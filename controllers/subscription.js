const catchAsync = require("../middlewares/catchAsync");
const Student = require('../models/student');
const Subscription = require('../models/subscription')
const Payment = require('../models/pay')

const createSub = catchAsync(async (req, res) => {
    try {
      console.log("payment processed")
      const studentId = req.users._id
      var{first_name,last_name,email,currency,amount,status} = req.body;
      console.log(first_name,last_name,email,currency,amount,status);
      // Check if the student exists
      const student = await Student.findById(studentId);
      const startDate = new Date();
      const payment = await Payment.create({
        amount,
        status,
        phoneNumber: student.phoneNumber,
      });  

     // const {subscriptionPlan} = req.body;

      const endDate = new Date();
      
      if(amount == 300)
      {
       endDate.setDate(endDate.getDate() + 365);
      }
      else if(amount == 200)
      {
       endDate.setDate(endDate.getDate() + 183);
      }
      else if(amount == 50)
      {
      endDate.setDate(endDate.getDate() + 30);
      }
      console.log(endDate);
      
      
      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }
    
      const existingSubscription = await Subscription.findOne({ student: student._id });

      if (existingSubscription) {
        // If a subscription exists, update the endDate
        existingSubscription.endDate = endDate;
        await existingSubscription.save();
        
        return res.status(200).json(existingSubscription); 
      } else {
        // Create a new subscription if it doesn't exist
        const subscription = await Subscription.create({
          startDate,
          endDate,
          student: student._id,
        });
    
        return res.status(201).json(subscription);
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  const getSub = catchAsync(async (req, res) => {
    try {
      const studentId = req.params.studentId;
      
      // Populate the student with the associated subscription
      const student = await Student.findById(studentId)
      const existingSubscription = await Subscription.findOne({ student: student._id });
      console.log('studentWithSubscription:', existingSubscription);
  
      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }
  
      // Check if the subscription has expired
     
  
      if (!existingSubscription) {
        return res.status(404).json({ error: 'Subscription not found for this student' });
      }
  
      const currentDate = new Date();
      const subscriptionEndDate = new Date(existingSubscription.endDate);
  
      const isExpired = subscriptionEndDate < currentDate;
  
      // You can now use the value of isExpired to determine if the subscription has expired
      return res.json({
        
        isExpired,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  
  const getPayment = catchAsync(async (req, res) => {
    const payments = await Payment.find();
  
    if (!payments || payments.length === 0) {
      console.log("No records yet");
      return res.status(200).json({
        message: "No records yet",
      });
    }
    const extractedPayments = payments.map(({ amount, status, phoneNumber }) => ({
      amount,
      status,
      phoneNumber,
    }));
  
    
    res.status(200).json(extractedPayments);
  });

  const getActiveUsers = catchAsync(async(req,res)=>{
    const subs = await Subscription.find().populate('student');
  
    if (!subs || subs.length === 0) {
      console.log("No active users yet");
      return res.status(200).json({
        message: "No active users yet",
      });
    }
    const extractedsubs = subs.map(({ plan, startDate, endDate, student }) => ({
      plan, 
      startDate, 
      endDate, 
      student_phoneNumber: student ? student.phoneNumber : null,
    }));
  
    
    res.status(200).json(extractedsubs);
  })
 
 
module.exports = {createSub, getSub, getPayment, getActiveUsers};