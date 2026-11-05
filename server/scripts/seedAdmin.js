// Run: node scripts/seedAdmin.js   (.env mein ADMIN_EMAIL, ADMIN_PASSWORD set karein)
// Strong password ke liye pehle: node scripts/genPassword.js
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const checkPassword = require('../utils/passwordPolicy');

(async () => {
  const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) throw new Error('ADMIN_EMAIL / ADMIN_PASSWORD set karein');

  const problems = checkPassword(ADMIN_PASSWORD, { email: ADMIN_EMAIL });
  if (problems.length) {
    throw new Error('ADMIN_PASSWORD kamzor hai. Password mein:\n - ' + problems.join('\n - ') + '\n(Strong password: node scripts/genPassword.js)');
  }

  await connectDB();
  let u = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });
  if (u) { u.role = 'admin'; u.password = ADMIN_PASSWORD; await u.save(); console.log('Admin updated'); }
  else { await User.create({ name: 'Admin', email: ADMIN_EMAIL, password: ADMIN_PASSWORD, role: 'admin' }); console.log('Admin created'); }
  console.log('Ab server/.env se ADMIN_PASSWORD line hata dein.');
  await mongoose.disconnect();
})().catch((e) => { console.error(e.message); process.exit(1); });
