require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { generateQuestion } = require('./groqClient');

const app = express();
app.use(express.json());
app.use(cors());

// ===== Routes =====

// Health check
app.get('/', (req, res) => {
  res.send('✅ Backend is running...');
});

// Generate Question API
app.post('/generate-question', async (req, res) => {
  try {
    const { stdClass, subject, difficulty, topicHint, language, questionType } = req.body;

    const q = await generateQuestion({ stdClass, subject, difficulty, topicHint, language, questionType });

    if (!q) {
      return res.status(500).json({ error: 'Failed to generate question' });
    }

    res.json(q);
  } catch (err) {
    console.error("❌ Error in /generate-question:", err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ===================

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
