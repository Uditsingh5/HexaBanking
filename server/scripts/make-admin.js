const path = require('node:path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const mongoose = require('mongoose');
const dns = require('node:dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const email = process.argv[2];
if (!email) {
  console.error('Usage: node scripts/make-admin.js <email>');
  process.exit(1);
}

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  const result = await mongoose.connection.collection('users').findOneAndUpdate(
    { email: email.toLowerCase() },
    { $set: { role: 'admin' } },
    { returnDocument: 'after' }
  );
  if (!result) {
    console.error(`❌ User "${email}" not found.`);
    process.exit(1);
  }
  console.log(`✅ User "${result.email}" is now role: "${result.role}"`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
