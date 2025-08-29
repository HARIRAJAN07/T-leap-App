const fs = require("fs");
const path = require("path");

// Function to save questions into local JSON file
function saveQuestions(questions) {
  const filePath = path.join(__dirname, "data", "questions.json");

  try {
    fs.writeFileSync(filePath, JSON.stringify(questions, null, 2), "utf-8");
    console.log("✅ Questions saved locally to questions.json");
  } catch (err) {
    console.error("❌ Error saving questions:", err);
  }
}

module.exports = saveQuestions;
