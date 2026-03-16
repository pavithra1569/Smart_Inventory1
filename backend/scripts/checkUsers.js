require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const users = await User.find({}).lean();
  console.log('users:', users.map(u => ({ username: u.username, role: u.role, password: u.password })));
  process.exit(0);
}
run().catch(err => { console.error(err); process.exit(1); });
