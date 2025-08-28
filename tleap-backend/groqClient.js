require('dotenv').config();
const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/** Normalize difficulty levels */
function normalizeDifficulty(d) {
  const x = (d || "").toString().toLowerCase();
  if (["beginner", "easy", "e"].includes(x)) return "easy";
  if (["intermediate", "medium", "m"].includes(x)) return "medium";
  if (["advanced", "hard", "h"].includes(x)) return "hard";
  return "medium";
}

/** Call Groq and parse strict JSON safely */
async function askGROQ(
  prompt,
  { model = "llama3-8b-8192", temperature = 0.6, max_tokens = 700 } = {}
) {
  try {
    const response = await groq.chat.completions.create({
      model,
      messages: [{ role: "user", content: prompt }],
      temperature,
      max_tokens
    });

    let text = response.choices?.[0]?.message?.content?.trim() || "";

    // ---- SAFER JSON EXTRACTION ----
    const jsonMatch = text.match(/\{[\s\S]*?\}/); // non-greedy match
    if (!jsonMatch) throw new Error("No JSON found in response");

    let cleanJson = jsonMatch[0].trim();
    cleanJson = cleanJson.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');

    const parsed = JSON.parse(cleanJson);

    if (!parsed.question || !parsed.type) {
      throw new Error("Missing question or type in parsed JSON");
    }

    if (parsed.type === "mcq") {
      if (!Array.isArray(parsed.options) || parsed.options.length !== 4 || !parsed.answer) {
        throw new Error("MCQ missing options or answer");
      }
      parsed.options = parsed.options.map(o => (o == null ? "" : String(o)));
      if (!parsed.options.includes(parsed.answer)) {
        parsed.answer = parsed.options[0]; // fallback
      }
    }

    parsed.explanation = parsed.explanation || "";
    parsed.subtopic = parsed.subtopic || "";

    return parsed;
  } catch (err) {
    console.error("❌ askGROQ error:", err.message);
    return null;
  }
}

/**
 * Generate ONE question (MCQ, Fill, Assertion, True/False, Match)
 */
async function generateQuestion({
  stdClass,
  subject,
  difficulty,
  topicHint = "",
  subtopicHint = "",
  language = "English",
  questionType = "mcq",
  askedQuestions = []
}) {
  const lvl = normalizeDifficulty(difficulty);
  const lang = (language || "English").toLowerCase().startsWith("tam") ? "Tamil" : "English";

  let typeInstruction = "";
  if (Array.isArray(questionType)) {
    typeInstruction = `Choose randomly from these types: ${questionType.join(", ")}.`;
  } else if (questionType === "mix") {
    typeInstruction =
      "Choose randomly from MCQ, Fill in the Blank, Assertion & Reasoning, True/False, or Match the Following.";
  } else {
    const map = {
      mcq: "Multiple Choice Question with 4 options",
      fill: "Fill in the Blank question (one correct answer)",
      assertion: "Assertion and Reasoning question",
      truefalse: "True or False question",
      match: "Match the Following question"
    };
    typeInstruction = map[questionType.toLowerCase()] || "Multiple Choice Question";
  }

  const topicLine = topicHint?.trim()
    ? `- Topic: "${topicHint}".`
    : `- If topic is not given, choose a relevant topic.`;

  const subtopicLine = subtopicHint?.trim()
    ? `- Subtopic: "${subtopicHint}". Generate questions specifically from this subtopic.`
    : `- If subtopic is not given, generate from the entire topic or lesson.`;

  const languageRule =
    lang === "Tamil"
      ? `- Write the entire question, options, and explanation in Tamil.`
      : `- Write everything in English.`;

  const subjectGuard = `
- Subject: ${subject}.
- Suitable for Class ${stdClass} based on Indian school syllabus.
- Ensure accuracy and avoid out-of-syllabus content.
- For Math: use clean numeric/algebraic questions solvable without calculators.
- For languages: focus on grammar, vocabulary, and comprehension.
`;

  const uniquenessRule =
    askedQuestions.length > 0
      ? `- Do NOT repeat any of these previously generated questions: ${askedQuestions.map(q => `"${q}"`).join(", ")}`
      : `- Ensure all questions are unique and never repeated.`;

  const prompt = `
You are a strict quiz generator.

Requirements:
- Class: ${stdClass}
${subjectGuard}
- Difficulty: ${lvl}
${topicLine}
${subtopicLine}
${languageRule}
- Question Type: ${typeInstruction}
- ${uniquenessRule}
- Output format: STRICT JSON, no extra text.

JSON structure by type:

MCQ:
{
  "question": "string",
  "type": "mcq",
  "options": ["option1","option2","option3","option4"],
  "answer": "one option exactly",
  "explanation": "brief reason",
  "subtopic": "short tag"
}

Fill in the Blank:
{
  "question": "string with ____",
  "type": "fill",
  "answer": "correct word or phrase",
  "explanation": "brief reason",
  "subtopic": "short tag"
}

Assertion & Reasoning:
{
  "question": "Assertion: ... Reason: ...",
  "type": "assertion",
  "answer": "Both correct and reason explains assertion" OR "Both correct but reason does not explain assertion" OR "Assertion correct, Reason wrong" OR "Assertion wrong, Reason correct",
  "explanation": "brief reason",
  "subtopic": "short tag"
}

True/False:
{
  "question": "string",
  "type": "truefalse",
  "answer": "True" OR "False",
  "explanation": "brief reason",
  "subtopic": "short tag"
}

Match the Following:
{
  "question": "Match the following",
  "type": "match",
  "pairs": {"A":"1","B":"2","C":"3","D":"4"},
  "answer": "A-1, B-2, C-3, D-4",
  "explanation": "brief reason",
  "subtopic": "short tag"
}
`;

  for (let attempt = 1; attempt <= 3; attempt++) {
    const q = await askGROQ(prompt, { temperature: attempt === 1 ? 0.4 : 0.7 });
    if (q) return q;
  }
  return null;
}

module.exports = { generateQuestion, normalizeDifficulty };
