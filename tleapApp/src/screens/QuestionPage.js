// QuestionPage.js
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

const API_BASE = "http://localhost:5000"; // 🔧 replace with your server or env variable

export default function QuestionPage() {
  const route = useRoute();
  const navigation = useNavigation();
  const { classId, subject, topic, difficulty, questionType, mode, language } =
    route.params;
  const isPractice = mode === "practice";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [question, setQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const [history, setHistory] = useState([]);
  const [showReport, setShowReport] = useState(false);

  const payload = useMemo(
    () => ({
      stdClass: classId,
      subject,
      difficulty,
      topicHint: decodeURIComponent(topic),
      language,
      questionType,
    }),
    [classId, subject, difficulty, topic, questionType, language]
  );

  const fetchQuestion = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setSubmitted(false);
      setUserAnswer("");

      const res = await fetch(`${API_BASE}/generate-question`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`API ${res.status}`);
      const data = await res.json();
      setQuestion(data);
    } catch (e) {
      setError(e.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [payload]);

  useEffect(() => {
    fetchQuestion();
  }, [fetchQuestion]);

  const checkCorrect = (ua, q) => {
    if (!q) return false;
    const correct = (q.answer || "").toString().trim().toLowerCase();
    const got = (ua || "").toString().trim().toLowerCase();
    return correct === got;
  };

  const onSubmit = () => {
    if (!question) return;
    const isCorrect = checkCorrect(userAnswer, question);
    setSubmitted(true);
    setHistory((h) => [
      ...h,
      {
        question: question.question,
        type: question.type,
        correctAnswer: question.answer,
        userAnswer,
        isCorrect,
      },
    ]);
  };

  const onNext = () => {
    fetchQuestion();
  };

  const onEnd = () => {
    setSubmitted(true);
    if (isPractice) {
      navigation.navigate("Home");
    } else {
      setShowReport(true);
    }
  };

  const correctCount = history.filter((h) => h.isCorrect).length;

  // ================== Renders ==================
  const renderMCQ = () => (
    <View style={styles.optionsContainer}>
      {(question?.options || []).map((opt, i) => (
        <TouchableOpacity
          key={i}
          style={[
            styles.optionButton,
            userAnswer === opt && styles.optionButtonSelected,
          ]}
          onPress={() => setUserAnswer(opt)}
        >
          <Text
            style={[
              styles.optionText,
              userAnswer === opt && styles.optionTextSelected,
            ]}
          >
            {opt}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderFill = () => (
    <TextInput
      value={userAnswer}
      onChangeText={setUserAnswer}
      style={styles.input}
      placeholder="✍️ Type your answer here"
    />
  );

  const renderTrueFalse = () => (
    <View style={styles.row}>
      {["True", "False"].map((t) => (
        <TouchableOpacity
          key={t}
          style={[
            styles.optionButton,
            userAnswer === t && styles.optionButtonSelected,
          ]}
          onPress={() => setUserAnswer(t)}
        >
          <Text
            style={[
              styles.optionText,
              userAnswer === t && styles.optionTextSelected,
            ]}
          >
            {t}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderAssertion = () => {
    const opts = [
      "Both correct and reason explains assertion",
      "Both correct but reason does not explain assertion",
      "Assertion correct, Reason wrong",
      "Assertion wrong, Reason correct",
    ];
    return (
      <View style={styles.optionsContainer}>
        {opts.map((o, i) => (
          <TouchableOpacity
            key={i}
            style={[
              styles.optionButton,
              userAnswer === o && styles.optionButtonSelected,
            ]}
            onPress={() => setUserAnswer(o)}
          >
            <Text
              style={[
                styles.optionText,
                userAnswer === o && styles.optionTextSelected,
              ]}
            >
              {i + 1}. {o}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderMatch = () => (
    <View>
      <View style={styles.matchBox}>
        <Text style={styles.bold}>🔗 Pairs to match:</Text>
        {Object.entries(question?.pairs || {}).map(([k, v]) => (
          <View key={k} style={styles.rowBetween}>
            <Text>{k}</Text>
            <Text style={styles.bold}>{v}</Text>
          </View>
        ))}
      </View>
      <TextInput
        value={userAnswer}
        onChangeText={setUserAnswer}
        style={styles.input}
        placeholder="👉 Enter mapping like A-1, B-2, C-3, D-4"
      />
    </View>
  );

  // ================== Report ==================
  if (showReport && !isPractice) {
    const total = history.length;
    const wrong = total - correctCount;
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.reportCard}>
          <Text style={styles.title}>📊 Test Report</Text>
          <Text style={styles.subtitle}>
            Class {classId} · {subject} · {decodeURIComponent(topic)} ·{" "}
            {difficulty} · {questionType.toUpperCase()}
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{total}</Text>
              <Text>Total Questions</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: "#e0ffe0" }]}>
              <Text style={[styles.statNumber, { color: "green" }]}>
                {correctCount}
              </Text>
              <Text>Correct</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: "#ffe0e0" }]}>
              <Text style={[styles.statNumber, { color: "red" }]}>{wrong}</Text>
              <Text>Wrong</Text>
            </View>
          </View>

          {history.map((h, i) => (
            <View key={i} style={styles.historyBox}>
              <Text style={styles.bold}>Q{i + 1}. {h.question}</Text>
              <Text>Your Answer: {h.userAnswer || "-"}</Text>
              <Text>Correct Answer: {h.correctAnswer}</Text>
              <Text style={{ color: h.isCorrect ? "green" : "red" }}>
                {h.isCorrect ? "✅ Correct" : "❌ Incorrect"}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    );
  }

  // ================== Main Screen ==================
  return (
    <LinearGradient
          colors={["#c5baff", "#c4d9ff", "#e8f9ff"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1 }}
        >
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>
          {isPractice ? "📖 Practice Mode" : "📝 Test Mode"}
        </Text>
        <Text style={styles.subtitle}>
          Class {classId} · {subject} · {decodeURIComponent(topic)} ·{" "}
          {difficulty} · {questionType.toUpperCase()}
        </Text>

        {loading && <ActivityIndicator size="large" color="#000" />}
        {error !== "" && <Text style={{ color: "red" }}>{error}</Text>}

        {question && (
          <>
            <Text style={styles.question}>{question.question}</Text>

            {question.type === "mcq" && renderMCQ()}
            {question.type === "fill" && renderFill()}
            {question.type === "truefalse" && renderTrueFalse()}
            {question.type === "assertion" && renderAssertion()}
            {question.type === "match" && renderMatch()}

            {/* Buttons */}
            <View style={styles.actionsRow}>
              {!submitted && (
                <TouchableOpacity style={styles.submitBtn} onPress={onSubmit}>
                  <Text style={styles.btnText}>Submit</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.nextBtn} onPress={onNext}>
                <Text style={styles.btnText}>Next</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.endBtn} onPress={onEnd}>
                <Text style={styles.btnText}>End Test</Text>
              </TouchableOpacity>
            </View>

            {/* Feedback */}
            {submitted && (
              <View style={styles.feedbackBox}>
                {checkCorrect(userAnswer, question) ? (
                  <Text style={{ color: "green", fontWeight: "bold" }}>
                    ✅ Correct!
                  </Text>
                ) : (
                  <Text style={{ color: "red", fontWeight: "bold" }}>
                    ❌ Incorrect. Correct: {question.answer}
                  </Text>
                )}
                {isPractice && question.explanation && (
                  <Text>💡 {question.explanation}</Text>
                )}
              </View>
            )}
          </>
        )}
      </View>
    </ScrollView>
    </LinearGradient>
  );
}

// ================== Styles ==================
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  subtitle: { fontSize: 14, color: "#555", marginBottom: 16 },
  question: { fontSize: 18, fontWeight: "600", marginBottom: 16 },
  optionsContainer: { gap: 10 },
  optionButton: {
    backgroundColor: "#e8f9ff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  optionButtonSelected: {
    backgroundColor: "#4f46e5",
  },
  optionText: { textAlign: "center", fontSize: 16, color: "#333" },
  optionTextSelected: { color: "#fff" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  row: { flexDirection: "row", gap: 10 },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  matchBox: {
    backgroundColor: "#f0f0ff",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    flexWrap: "wrap",
    gap: 10,
  },
  submitBtn: {
    backgroundColor: "green",
    padding: 12,
    borderRadius: 10,
  },
  nextBtn: {
    backgroundColor: "blue",
    padding: 12,
    borderRadius: 10,
  },
  endBtn: {
    backgroundColor: "red",
    padding: 12,
    borderRadius: 10,
  },
  btnText: { color: "#fff", fontWeight: "bold" },
  feedbackBox: {
    marginTop: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    backgroundColor: "#f9f9f9",
  },
  reportCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 16,
  },
  statBox: {
    flex: 1,
    margin: 5,
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#e8f9ff",
  },
  statNumber: { fontSize: 22, fontWeight: "bold" },
  historyBox: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
  },
  bold: { fontWeight: "bold" },
});
