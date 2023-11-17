const mongoose=require('mongoose')
const paymentSchema = new mongoose.Schema({
    amount:{
      type: Number,
    },
    status: String,
    phoneNumber: Number,
  });
  
const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;