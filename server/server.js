const path = require('node:path');
require('dotenv').config({
  path: path.join(__dirname, '.env'),
  quiet: true,
});

// this is used bcz the mongo is causing some issue that i wanna skip.
const dns = require('node:dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);


const app = require('./src/app');
// using require bcz old companies already used its bcz it is legacy and import is new.
const PORT = process.env.PORT || 3000;
const connectDB = require('./src/config/db');

connectDB();

app.listen(PORT,()=>{
  console.log(`Server is running on port ${PORT}`);
})