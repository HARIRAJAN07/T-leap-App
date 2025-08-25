require('dotenv').config();
const readline = require('readline-sync');
const fs = require('fs');
const path = require('path');
const { createObjectCsvWriter } = require('csv-writer');
const { generateQuestion } = require('./groqClient');

// ===== CONFIG =====
const CSV_PATH = path.join(process.cwd(), 'quiz_results.csv');
const SAVE_EVERY_N = 10; // flush every 10 records
// ===================

function askChoice(prompt, choices, allowMultiple = false) {
  console.log(`\n${prompt}`);
  choices.forEach((c, i) => console.log(`${i + 1}) ${c}`));

  if (allowMultiple) {
    const ans = readline.question('Enter choice numbers separated by commas (or "mix" for all): ').trim();
    if (ans.toLowerCase() === 'mix') return 'mix';
    const indexes = ans.split(',').map(x => parseInt(x.trim(), 10)).filter(n => n > 0 && n <= choices.length);
    return indexes.map(i => choices[i - 1]);
  } else {
    const idx = readline.questionInt('Enter choice number: ');
    return choices[idx - 1];
  }
}

async function main() {
  console.log("📚 Smart Quiz Generator\n");

  // Collect user inputs
  const stdClass = readline.question("Enter Class (6-12): ").trim();

  const subjects = ["Science", "Math", "History", "Tamil", "English"];
  const subject = askChoice("Choose Subject:", subjects);

  const difficulties = ["Beginner", "Intermediate", "Advanced"];
  const difficulty = askChoice("Choose Difficulty:", difficulties);

  const topicHint = readline.question("Enter Topic (optional, press Enter to skip): ").trim();

  const languages = ["English", "Tamil"];
  const language = askChoice("Choose Language:", languages);

  const questionTypes = ["MCQ", "Fill in the Blank", "Assertion & Reasoning", "True/False", "Match the Following"];
  let questionType = askChoice("Choose Question Type(s):", questionTypes, true);
  if (Array.isArray(questionType)) {
    questionType = questionType.map(q => {
      switch (q.toLowerCase()) {
        case "mcq": return "mcq";
        case "fill in the blank": return "fill";
        case "assertion & reasoning": return "assertion";
        case "true/false": return "truefalse";
        case "match the following": return "match";
        default: return "mcq";
      }
    });
  } else if (questionType === 'mix') {
    questionType = 'mix';
  } else {
    questionType = "mcq"; // default
  }

  const modes = ["Practice Quiz (Story Mode)", "Test Mode"];
  const mode = askChoice("Choose Mode:", modes);

  console.log(`\n✅ Config:
Class: ${stdClass}
Subject: ${subject}
Difficulty: ${difficulty}
Topic: ${topicHint || "Auto"}
Language: ${language}
Question Type: ${Array.isArray(questionType) ? questionType.join(", ") : questionType}
Mode: ${mode}\n`);

  // CSV setup
  const csvExists = fs.existsSync(CSV_PATH);
  const csvWriter = createObjectCsvWriter({
    path: CSV_PATH,
    header: [
      { id: 'mode', title: 'Mode' },
      { id: 'class', title: 'Class' },
      { id: 'subject', title: 'Subject' },
      { id: 'difficulty', title: 'Difficulty' },
      { id: 'topic', title: 'Topic' },
      { id: 'language', title: 'Language' },
      { id: 'questionType', title: 'Question Type' },
      { id: 'subtopic', title: 'Subtopic' },
      { id: 'question', title: 'Question' },
      { id: 'optionsOrPairs', title: 'Options/Pairs' },
      { id: 'correctAnswer', title: 'Correct Answer' },
      { id: 'userAnswer', title: 'User Answer' },
      { id: 'result', title: 'Result' },
      { id: 'explanation', title: 'Explanation' }
    ],
    append: csvExists
  });

  const buffer = [];
  let totalQ = 0, correctCount = 0;
  const isPractice = mode.startsWith("Practice");

  while (true) {
    totalQ++;
    const q = await generateQuestion({ stdClass, subject, difficulty, topicHint, language, questionType });

    if (!q) {
      console.log(`⚠️ Skipping Q${totalQ}: generation error.`);
      continue;
    }

    console.log(`\nQ${totalQ}: ${q.question}`);
    let userAnswer = "";

    if (q.type === "mcq") {
      const [A, B, C, D] = q.options;
      console.log(`A) ${A}\nB) ${B}\nC) ${C}\nD) ${D}`);
      const ans = readline.question("Your answer (A/B/C/D or text): ").trim();
      const letter = ans.toUpperCase();
      userAnswer = ['A', 'B', 'C', 'D'].includes(letter) ? { A, B, C, D }[letter] : ans;
    } else if (q.type === "fill") {
      userAnswer = readline.question("Fill in the blank: ").trim();
    } else if (q.type === "assertion") {
      console.log("Options:\n1) Both correct and reason explains assertion\n2) Both correct but reason does not explain assertion\n3) Assertion correct, Reason wrong\n4) Assertion wrong, Reason correct");
      const ans = readline.questionInt("Choose option (1-4): ");
      const map = {
        1: "Both correct and reason explains assertion",
        2: "Both correct but reason does not explain assertion",
        3: "Assertion correct, Reason wrong",
        4: "Assertion wrong, Reason correct"
      };
      userAnswer = map[ans] || "";
    } else if (q.type === "truefalse") {
      const ans = readline.question("True or False: ").trim();
      userAnswer = ans;
    } else if (q.type === "match") {
      console.log("Pairs to match:");
      for (const [key, val] of Object.entries(q.pairs || {})) {
        console.log(`${key} -> ${val}`);
      }
      userAnswer = readline.question("Enter your matching (e.g., A-1, B-2, C-3, D-4): ").trim();
    }

    const correct = q.answer;
    const isCorrect = (userAnswer || '').toLowerCase() === (correct || '').toLowerCase();
    if (isCorrect) correctCount++;

    console.log(isCorrect ? "✅ Correct!" : `❌ Incorrect. Correct: ${correct}`);

    if (isPractice && q.explanation) {
      console.log(`💡 ${q.explanation}`);
    }

    buffer.push({
      mode: isPractice ? "Practice" : "Test",
      class: stdClass,
      subject,
      difficulty,
      topic: topicHint || "",
      language,
      questionType: q.type,
      subtopic: q.subtopic || "",
      question: q.question,
      optionsOrPairs: q.options ? q.options.join(" | ") : JSON.stringify(q.pairs || {}),
      correctAnswer: correct,
      userAnswer,
      result: isCorrect ? "Correct" : "Incorrect",
      explanation: q.explanation || ""
    });

    if (buffer.length >= SAVE_EVERY_N) {
      await csvWriter.writeRecords(buffer.splice(0, buffer.length));
      console.log(`📝 Progress saved to ${CSV_PATH}`);
    }

    const more = readline.question(isPractice ? "Press Enter for next question or type 'exit' to stop practice: " : "Press Enter for next question or type 'end' to finish test: ").trim();
    if ((!isPractice && more.toLowerCase() === 'end') || (isPractice && more.toLowerCase() === 'exit')) break;
  }

  if (buffer.length) {
    await csvWriter.writeRecords(buffer);
  }

  if (!isPractice) {
    console.log(`\n📊 Test Summary:
Total Questions: ${totalQ}
Correct: ${correctCount}
Wrong: ${totalQ - correctCount}
Score: ${((correctCount / totalQ) * 100).toFixed(2)}%
`);
  }

  console.log(`\n✅ Results saved in ${CSV_PATH}`);
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
