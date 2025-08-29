require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { generateQuestion } = require('./groqClient');
const fs = require("fs");
const path = require("path");

const JSON_PATH = path.join(process.cwd(), "offline_questions.json");

// ===== Helper functions =====
function saveOffline(question) {
  try {
    let existing = [];
    if (fs.existsSync(JSON_PATH)) {
      existing = JSON.parse(fs.readFileSync(JSON_PATH, "utf-8"));
    }
    existing.push(question);
    fs.writeFileSync(JSON_PATH, JSON.stringify(existing, null, 2), "utf-8");
    console.log("💾 Question saved offline");
  } catch (err) {
    console.error("❌ Error saving offline:", err);
  }
}

function loadOffline() {
  try {
    if (fs.existsSync(JSON_PATH)) {
      return JSON.parse(fs.readFileSync(JSON_PATH, "utf-8"));
    }
    return [];
  } catch (err) {
    console.error("❌ Error loading offline:", err);
    return [];
  }
}

// ===== App setup =====
const app = express();
app.use(express.json());
app.use(cors());

// ===== Routes =====

// Health check
app.get('/', (req, res) => {
  res.send('✅ Backend is running...');
});

// Get all offline questions
app.get('/offline-questions', (req, res) => {
  const offlineQs = loadOffline();
  res.json(offlineQs);
});

// Save offline question manually (optional)
app.post('/save-offline-question', (req, res) => {
  try {
    const q = req.body;
    saveOffline(q);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to save offline question" });
  }
});

// Generate Question API
app.post('/generate-question', async (req, res) => {
  try {
    const { stdClass, subject, difficulty, topicHint, language, questionType } = req.body;

    let q;

    try {
      // Try online (Groq)
      q = await generateQuestion({ stdClass, subject, difficulty, topicHint, language, questionType });

      if (q) {
        saveOffline(q); // ✅ save for offline reuse
      }
    } catch (err) {
      console.log("⚠️ Online fetch failed. Using offline questions...");
      const offlineQs = loadOffline();

      // pick a random offline question
      if (offlineQs.length > 0) {
        q = offlineQs[Math.floor(Math.random() * offlineQs.length)];
      }
    }

    if (!q) {
      return res.status(500).json({ error: 'No question available (online + offline failed)' });
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
