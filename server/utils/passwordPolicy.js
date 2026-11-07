// Admin password ki minimum strength check. seedAdmin.js yahin se use karta hai.
const COMMON = [
  "password",
  "admin",
  "qwerty",
  "letmein",
  "welcome",
  "srt",
  "srtcompany",
  "12345678",
  "abc123",
];

module.exports = function checkPassword(pw = "", { email = "" } = {}) {
  const problems = [];
  if (pw.length < 14) problems.push("kam se kam 14 characters ka ho");
  if (!/[a-z]/.test(pw)) problems.push("ek small letter (a-z) ho");
  if (!/[A-Z]/.test(pw)) problems.push("ek capital letter (A-Z) ho");
  if (!/\d/.test(pw)) problems.push("ek number ho");
  if (!/[^A-Za-z0-9]/.test(pw)) problems.push("ek symbol (!@#$ etc.) ho");
  const low = pw.toLowerCase();
  if (COMMON.some((w) => low.includes(w)))
    problems.push('"password/admin/srt" jaise common words na hon');
  const local = email.split("@")[0]?.toLowerCase();
  if (local && local.length >= 3 && low.includes(local))
    problems.push("email ka naam password mein na ho");
  return problems; // khali array = password theek hai
};
