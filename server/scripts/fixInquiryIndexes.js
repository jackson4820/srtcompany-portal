// Ek baar chalane ke liye: inquiries collection se purane UNIQUE index hatata hai.
// Run: node scripts/fixInquiryIndexes.js   (server folder se, .env me MONGO_URI hona chahiye)
require('dotenv').config();
const mongoose = require('mongoose');
const Inquiry = require('../models/Inquiry');

(async () => {
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 8000, family: 4 });
  const indexes = await Inquiry.collection.indexes();
  console.log('Current indexes on "inquiries":');
  indexes.forEach((i) => console.log(` - ${i.name}  key=${JSON.stringify(i.key)}  unique=${!!i.unique}`));

  // Inquiry schema me koi unique field nahi hai, isliye _id ke alawa har unique index purana/galat hai
  const bad = indexes.filter((i) => i.unique && i.name !== '_id_');
  if (!bad.length) console.log('\nKoi extra unique index nahi mila.');
  for (const i of bad) {
    await Inquiry.collection.dropIndex(i.name);
    console.log(`\nDropped unique index: ${i.name}`);
  }
  await mongoose.disconnect();
})().catch((e) => { console.error(e.message); process.exit(1); });
