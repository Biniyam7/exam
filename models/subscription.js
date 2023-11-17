const mongoose=require('mongoose')
const subscriptionSchema = new mongoose.Schema({
    plan:{
      type: String,
        //required: true,
      enum: ['gold', 'silver', 'basic'],
    },
    startDate: Date,
    endDate: Date,
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      unique: true,
    },
  });
  
  const Subscription = mongoose.model('Subscription', subscriptionSchema);
module.exports = Subscription;