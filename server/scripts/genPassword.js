// Run: node scripts/genPassword.js
// Ek strong random password print karta hai (kuch save nahi karta). Isse password manager mein rakhein.
const crypto = require("crypto");

const sets = [
  "abcdefghijkmnopqrstuvwxyz",
  "ABCDEFGHJKLMNPQRSTUVWXYZ",
  "23456789",
  "!@#$%^&*-_+=?",
];
const all = sets.join("");
const pick = (s) => s[crypto.randomInt(s.length)];

const chars = sets.map(pick); // har type ka kam se kam 1 character
while (chars.length < 18) chars.push(pick(all));
for (let i = chars.length - 1; i > 0; i--) {
  // shuffle
  const j = crypto.randomInt(i + 1);
  [chars[i], chars[j]] = [chars[j], chars[i]];
}
console.log("\nNaya password (18 chars):\n\n  " + chars.join("") + "\n");
console.log(
  "Ise server/.env mein ADMIN_PASSWORD= ke aage daalein, seed chalayein, phir .env se hata dein.\n",
);
