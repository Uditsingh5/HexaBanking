const mongoose = require('mongoose');

function connectDB(){
  
  mongoose.connect(process.env.MONGO_URI)
    .then(() => {
      console.log('Connected to database!');
    })
    .catch((error) => {
      console.log('Error connecting to database!');
      console.error(error);
      process.exit(1);
      // close the server bcz it will consume resources with no services available;
    })
}

module.exports = connectDB;
