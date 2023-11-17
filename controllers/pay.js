const catchAsync = require("../middlewares/catchAsync");

const Chapa = require('chapa');
const Subscription = require("../models/subscription");


let myChapa = new Chapa('CHASECK_TEST-7mSnUUlCknqZrInKDc9QusA7zy7KNONq')

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate a random 6-digit number
const RandomNumber = getRandomInt(100000, 9999999).toString();
//console.log(RandomNumber);


const pay = catchAsync(async (req, res) => {
    try {
        const {subscriptionPlan} = req.body;

        let amount = 0;
        if (subscriptionPlan === "gold" )
        {
            amount = 300;
        }
        else if (subscriptionPlan === "silver" )
        {
            amount = 200;
        }
        else if (subscriptionPlan === "basic" )
        {
            amount = 50;
        }

      const customerInfo = {"amount": amount,
      "currency": "ETB",
      "email": "biniyamsisay728@gmail.com",
      "first_name": "Abebe",
      "last_name": "Bikila",
      "tx_ref": RandomNumber, 
      "callback_url": "http://localhost:3000/",
      "return_url":"http://localhost:3000/",
      "customization": {
          "title": subscriptionPlan,
          "description": "payment for subscription"}};
  
      const response = await myChapa.initialize(customerInfo, { autoRef: true });
  
      res.json(response);
      // res.redirect(response.data.checkout_url)
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

const verify = catchAsync(async (req, res) => {
    try {
      const txRef = req.params.tx_ref;
      const response = await myChapa.verify(txRef);
  
      // Check if the payment was successful
      if (response.status === 'success') {
        console.log('Payment verification successful');
        res.json(response);
      } else {
        console.log('Payment verification failed');
        res.status(400).json(response);
      }
    } catch (error) {
      console.error('Error during payment verification:', error.message);
      // Handle specific Chapa errors here if needed
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

module.exports = {pay, verify};