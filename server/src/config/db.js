const mongoose = require('mongoose');

function connectDB(){
  
  mongoose.connect(process.env.MONGO_URI)
    .then(() => {
      console.log('Connected to database!');
    })
    .catch((error) => {
      console.log('Error connecting to database!');
      console.error(error);
      // graceful shutdown.
      process.exit(1);
    })
}

module.exports = connectDB;
