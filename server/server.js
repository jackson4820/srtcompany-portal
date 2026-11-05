require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();
app.set('trust proxy', 1); // Render/Railway/Nginx ke peeche rate-limit sahi chalne ke liye

app.use(helmet());
app.use(
  cors({
    origin: (process.env.CLIENT_URL || 'http://localhost:5173').split(','),
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api/v1/auth', require('./routes/authRoutes'));
const inquiryRoutes = require('./routes/inquiryRoutes');
app.use('/api/v1/inquiries', inquiryRoutes);
app.use('/api/inquiries', inquiryRoutes); // purana path bhi chalta rahe

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
connectDB()
  .then(async () => {
    // Inquiry schema me koi unique field nahi hai. Agar DB me purana unique index bacha ho (jisse
    // "duplicate entry" error aata hai), to syncIndexes use schema ke hisaab se hata/theek kar deta hai.
    try {
      const dropped = await require('./models/Inquiry').syncIndexes();
      if (dropped.length) console.log('Inquiry: purane indexes hataye ->', dropped.join(', '));
    } catch (e) {
      console.warn('Inquiry index sync skip hua:', e.message);
    }
    app.listen(PORT, () => console.log(`Server running on ${PORT}`));
  })
  .catch((e) => { console.error('Startup failed:', e.message); process.exit(1); });
