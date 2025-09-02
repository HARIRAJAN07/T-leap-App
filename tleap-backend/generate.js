const fs = require("fs");
const { generateQuestion } = require("./groqClient");
const data = require("./data.json");

// constants
const CLASS = "class8";
const SUBJECT = "math"; // fixed subject
const LANGUAGE = "english"; // fixed language
const DIFFICULTIES = ["Easy", "Medium", "Hard"];

// helper: read + append + deduplicate
function saveQuestions(parsed) {
  try {
    const mcqData = parsed.filter(q => q.type === "mcq");
    const fillData = parsed.filter(q => q.type === "fill");
    const trueFalseData = parsed.filter(q => q.type === "truefalse");

    const updateFile = (filename, newData) => {
      let existing = [];

      try {
        if (fs.existsSync(filename)) {
          const data = fs.readFileSync(filename, "utf-8").trim();
          if (data) {
            existing = JSON.parse(data); // only parse if non-empty
          }
        }
      } catch (err) {
        console.error(`⚠ Corrupted ${filename}, resetting file., err.message`);
        existing = [];
      }

      // merge old + new
      const merged = [...existing, ...newData];

      // deduplicate by question text
      const seen = new Set();
      const unique = merged.filter(item => {
        if (seen.has(item.question)) return false;
        seen.add(item.question);
        return true;
      });

      fs.writeFileSync(filename, JSON.stringify(unique, null, 2), "utf-8");
    };

    if (mcqData.length > 0) updateFile("mcq.json", mcqData);
    if (fillData.length > 0) updateFile("fill.json", fillData);
    if (trueFalseData.length > 0) updateFile("truefalse.json", trueFalseData);

    console.log("📂 Files appended: mcq.json, fill.json, truefalse.json");
  } catch (err) {
    console.error("❌ Error saving questions:", err);
  }
}

async function gen() {
  try {
    // fetch topics for the given class + subject
    const topics = data[CLASS][SUBJECT];

    for (let topicObj of topics) {
      const { topic, topichint } = topicObj;

      // loop through hints inside each topic
      for (let hint of topichint) {
        // loop through difficulty levels
        for (let difficulty of DIFFICULTIES) {
          console.log(`\n🔹 Generating for Topic: ${topic}, Hint: ${hint}, Difficulty: ${difficulty}`);

          const response = await generateQuestion({
            stdClass: CLASS.replace("class", ""), // "6"
            subject: SUBJECT,
            difficulty: difficulty,
            topicHint: topic,
            subtopicHint: hint,
            language: LANGUAGE,
          });

          let parsed = response;
          if (typeof response === "string") {
            parsed = JSON.parse(response);
          }

          console.log("✅ Parsed JSON:", JSON.stringify(parsed, null, 2));

          // 👉 Save to separate files (append + dedupe)
          saveQuestions(parsed);
        }
      }
    }
  } catch (err) {
    console.error("❌ Error generating questions:", err);
  }
}

gen();