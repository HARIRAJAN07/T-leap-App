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
  Modal,
  Dimensions,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

const API_BASE = "http://localhost:5000"; // 🔧 replace with your server or env variable

// Responsive helpers
const { width, height } = Dimensions.get("window");
const wp = (perc) => (width * perc) / 100;
const hp = (perc) => (height * perc) / 100;

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

  const [modalVisible, setModalVisible] = useState(false);

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
    setModalVisible(true); // show popup
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

  // ================== Render Question Types ==================
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
            </>
          )}
        </View>
      </ScrollView>

      {/* Feedback Popup Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            {checkCorrect(userAnswer, question) ? (
              <Text style={styles.correctText}>✅ Correct!</Text>
            ) : (
              <Text style={styles.incorrectText}>
                ❌ Incorrect. Correct: {question?.answer}
              </Text>
            )}
            {isPractice && question?.explanation && (
              <Text style={styles.explanation}>💡 {question.explanation}</Text>
            )}
            <TouchableOpacity
              style={styles.nextBtnPopup}
              onPress={() => {
                setModalVisible(false);
                fetchQuestion();
              }}
            >
              <Text style={styles.btnText}>Next</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

// ================== Styles ==================
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: wp(4),
  },

  // Main card
  card: {
    backgroundColor: "#fff",
    borderRadius: wp(3),
    padding: wp(4),
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: wp(2),
    elevation: 8,
    width: "85%",
    maxWidth: wp(80),
    alignSelf: "center",
  },

  // Headers
  title: {
    fontSize: wp(4),
    fontWeight: "800",
    marginBottom: hp(1),
    color: "#000",
    textAlign: "center",
  },
  subtitle: {
    fontSize: wp(2),
    color: "#555",
    marginBottom: hp(2),
    fontWeight: "500",
    textAlign: "center",
  },
  question: {
    fontSize: wp(3),
    fontWeight: "600",
    marginBottom: hp(2),
    color: "#111",
    textAlign: "center",
  },

  // Options
  optionsContainer: {
    marginBottom: hp(2),
  },
  optionButton: {
    backgroundColor: "#e8f9ff",
    paddingVertical: hp(2),
    paddingHorizontal: wp(3),
    borderRadius: wp(2),
    marginBottom: hp(1.5),
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  optionButtonSelected: {
    backgroundColor: "#4f46e5",
    borderColor: "#4f46e5",
    transform: [{ scale: 1.05 }],
    shadowColor: "#4f46e5",
    shadowOpacity: 0.3,
    shadowRadius: wp(2),
    elevation: 5,
  },
  optionText: {
    fontSize: wp(2.5),
    fontWeight: "600",
    color: "#333",
  },
  optionTextSelected: {
    color: "#fff",
  },

  // Input
  input: {
    borderWidth: 2,
    borderColor: "#ccc",
    borderRadius: wp(2),
    padding: wp(3),
    marginBottom: hp(2),
    backgroundColor: "#fff",
    fontSize: wp(2.2),
  },

  // True/False row
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: wp(2),
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  // Match section
  matchBox: {
    backgroundColor: "#f0f0ff",
    padding: wp(3),
    borderRadius: wp(2),
    marginBottom: hp(2),
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: wp(1.5),
    elevation: 2,
  },

  // Actions row
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: hp(2),
    flexWrap: "wrap",
    gap: wp(2),
  },

  // Buttons
  submitBtn: {
    borderWidth: 2,
    borderColor: "#16a34a",
    paddingVertical: hp(1.2),
    paddingHorizontal: wp(4),
    borderRadius: wp(2),
  },
  nextBtn: {
    borderWidth: 2,
    borderColor: "#2563eb",
    paddingVertical: hp(1.2),
    paddingHorizontal: wp(4),
    borderRadius: wp(2),
  },
  endBtn: {
    borderWidth: 2,
    borderColor: "#dc2626",
    paddingVertical: hp(1.2),
    paddingHorizontal: wp(4),
    borderRadius: wp(2),
  },
  btnText: {
    fontSize: wp(2),
    fontWeight: "600",
    color: "#111",
  },

  // Report
  reportCard: {
    backgroundColor: "#fff",
    borderRadius: wp(3),
    padding: wp(4),
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: wp(2),
    elevation: 8,
    width: "85%",
    maxWidth: wp(80),
    alignSelf: "center",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: hp(2),
  },
  statBox: {
    flex: 1,
    margin: wp(1),
    alignItems: "center",
    padding: wp(3),
    borderRadius: wp(2),
    backgroundColor: "#e8f9ff",
  },
  statNumber: {
    fontSize: wp(4),
    fontWeight: "bold",
    marginBottom: hp(0.5),
  },
  historyBox: {
    marginBottom: hp(2),
    padding: wp(3),
    backgroundColor: "#f9f9f9",
    borderRadius: wp(2),
  },

  bold: {
    fontWeight: "bold",
  },

  // Popup Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "#fff",
    borderRadius: wp(3),
    padding: wp(4),
    width: "80%",
    maxWidth: wp(70),
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: wp(2),
    elevation: 6,
  },
  correctText: {
    color: "green",
    fontSize: wp(3),
    fontWeight: "bold",
    marginBottom: hp(1),
    textAlign: "center",
  },
  incorrectText: {
    color: "red",
    fontSize: wp(3),
    fontWeight: "bold",
    marginBottom: hp(1),
    textAlign: "center",
  },
  explanation: {
    marginTop: hp(1),
    fontSize: wp(2),
    color: "#333",
    textAlign: "center",
  },
  nextBtnPopup: {
    marginTop: hp(2),
    backgroundColor: "#2563eb",
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(5),
    borderRadius: wp(2),
  },
});
