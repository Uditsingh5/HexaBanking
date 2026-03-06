require('dotenv').config({ quiet: true });
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