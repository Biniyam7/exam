const client = require('twilio')('AC2dfb7b3e275f71424e5634b9c0ed0b57', '149b9a11980bff1861f0957a8da966fc');


const sendTextMessage=()=>{
    client.messages
  .create({
    body: 'Hello from Node',
    to: '+12345678901',
    from: '+13344542155',
  })
  .then((message) => console.log(message))
  .catch((error) => {
    // You can implement your fallback code here
    console.log(error);
  });
}