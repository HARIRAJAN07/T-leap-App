const express = require('express');
const ollama = require('ollama');
const { z } = require('zod');
const { zodToJsonSchema } = require('zod-to-json-schema');


const app = express();
app.use(express.json());

// ---- Base schema for questions ----
const baseSchema = z.object({
  type: z.enum(['mcq', 'true_false', 'fill_blank', 'match_following', 'assertion_reasoning']),
  question: z.string(),
  correct_answer: z.string(),
  explanation: z.string().optional(),
  options: z.array(z.string()).optional(), // for MCQ
  columnA: z.array(z.string()).optional(), // for match_following
  columnB: z.array(z.string()).optional(), // for match_following
  correct_pairs: z.record(z.string(), z.string()).optional(), // for match_following
  assertion: z.string().optional(), // for assertion_reasoning
  reason: z.string().optional() // for assertion_reasoning
});

const hasTamil = (txt) => /[\u0B80-\u0BFF]/.test(txt);
const isMostlyEnglish = (txt) => {
  const letters = txt.replace(/[^A-Za-z]/g, '').length;
  return letters / Math.max(1, txt.length) > 0.3;
};

const tempByDiff = { easy: 0.8, medium: 0.7, difficult: 0.6 };

function buildSystemPrompt() {
  return [
    "You are an offline question generator for Tamil Nadu State Board (Samacheer Kalvi) classes 6 to 12.",
    "Generate questions strictly from the Tamil Nadu State Board syllabus for the given class and subject.",
    "Do not use CBSE or NCERT exclusive topics.",
    "Return valid JSON matching the schema provided without any extra text."
  ].join('\n');
}

function buildUserPrompt({ klass, subject, subtopic, difficulty, language, mode, question_type, count }) {
  const scope = subtopic?.trim()
    ? `Focus ONLY on the subtopic: "${subtopic}".`
    : "Cover any topic from the entire syllabus for this subject and class.";

  const reveal = mode === 'practice'
    ? "Include a brief explanation for the answer."
    : "Do NOT include explanation text in your reasoning; still fill JSON field but we will hide it.";

  let languageInstruction = "";
  if (language === 'ta' || subject.toLowerCase() === "tamil") {
    languageInstruction = "**IMPORTANT: Generate ALL text (questions, options, answers) fully in Tamil script only. Do NOT use English words or transliteration. Use proper Tamil grammar.**";
  } else {
    languageInstruction = "Generate ALL text fully in English only.";
  }

  if (subject.toLowerCase() === "tamil") {
    languageInstruction += " The questions should be based on Tamil grammar, literature, or language concepts.";
  }

  return [
    `Class: ${klass} (Tamil Nadu State Board - Samacheer Kalvi)`,
    `Subject: ${subject}`,
    scope,
    `Difficulty: ${difficulty}`,
    `Language: ${language === 'ta' ? 'Tamil' : 'English'}`,
    `Assessment mode: ${mode}`,
    `Question Type: ${question_type}`,
    `Create ${count} unique questions of ONLY this type: ${question_type}. No repetitions.`,
    languageInstruction,
    "If question_type = mcq → 4 options are mandatory.",
    "If question_type = fill_blank → include blank (____) in question.",
    "If question_type = true_false → answer must be True or False.",
    "If question_type = match_following → include columnA, columnB and correct_pairs.",
    "If question_type = assertion_reasoning → include assertion and reason fields and correct_answer as explanation of both.",
    reveal,
    "Return ONLY valid JSON array (no markdown, no extra text)."
  ].join('\n');
}

app.post('/api/generate', async (req, res) => {
  try {
    let {
      klass,
      subject,
      subtopic = "",
      difficulty,
      language,
      mode,
      question_type,
      count = 1
    } = req.body;

    // Basic validations
    if (!(Number.isInteger(klass) && klass >= 6 && klass <= 12))
      return res.status(400).json({ error: 'klass must be 6..12' });

    if (!['easy', 'medium', 'difficult'].includes(difficulty))
      return res.status(400).json({ error: 'difficulty must be easy|medium|difficult' });

    if (!['en', 'ta'].includes(language))
      return res.status(400).json({ error: 'language must be en|ta' });

    if (!['practice', 'test'].includes(mode))
      return res.status(400).json({ error: 'mode must be practice|test' });

    if (!['mcq', 'fill_blank', 'true_false', 'match_following', 'assertion_reasoning'].includes(question_type))
      return res.status(400).json({ error: 'question_type must be one of mcq|fill_blank|true_false|match_following|assertion_reasoning' });

    if (!subject || typeof subject !== 'string')
      return res.status(400).json({ error: 'subject is required' });

    if (!(Number.isInteger(count) && count > 0 && count <= 20))
      return res.status(400).json({ error: 'count must be an integer between 1 and 20' });

    // 🔹 Force Tamil language if subject is Tamil
    if (subject.toLowerCase() === "tamil") {
      language = 'ta';
    }

    const system = buildSystemPrompt();
    const user = buildUserPrompt({ klass, subject, subtopic, difficulty, language, mode, question_type, count });

    const schema = zodToJsonSchema(z.array(baseSchema));

    const response = await ollama.chat({
      model: 'aya:8b-23', // You can also try 'mistral' or 'llama2' if available for better Tamil
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user }
      ],
      format: schema,
      options: { temperature: tempByDiff[difficulty] ?? 0.7 }
    });

    const questionsArray = z.array(baseSchema).parse(JSON.parse(response.message.content));

    // Language enforcement
    const validQuestions = [];
    for (const q of questionsArray) {
      if (language === 'ta' && !hasTamil(q.question)) continue;
      if (language === 'en' && !isMostlyEnglish(q.question)) continue;
      if (mode === 'test') delete q.explanation;
      validQuestions.push(q);
    }

    if (validQuestions.length === 0)
      return res.status(422).json({ error: 'Model did not return valid questions in the required language.' });

    return res.json({
      meta: { klass, subject, subtopic, difficulty, language, mode, question_type, count },
      questions: validQuestions
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: String(err?.message ?? err) });
  }
});

const PORT = process.env.PORT || 3030;
app.listen(PORT, () => console.log(`QGen API listening on http://localhost:${PORT}`));
