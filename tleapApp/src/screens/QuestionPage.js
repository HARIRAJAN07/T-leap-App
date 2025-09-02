import React, { useCallback, useEffect, useState } from "react";
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
import Logo from "../components/logo";
import topicsData from "../data/topics.json";
import mcqData from "../data/mcq.json";
import fillData from "../data/fill.json";
import truefalseData from "../data/truefalse.json";

const API_BASE = "http://localhost:5000";

// Responsive helpers
const { width, height } = Dimensions.get("window");
const wp = (perc) => (width * perc) / 100;
const hp = (perc) => (height * perc) / 100;

// Track used subtopics globally (per session)
let usedSubtopics = {};

function getPracticeQuestion({ classId, subject, topic, difficulty, questionType, topicObj }) {
  let questionBank;

  // Switch now correctly guards for missing/invalid type
  switch ((questionType || "").trim().toLowerCase()) {
    case "mcq":
      questionBank = mcqData;
      break;
    case "fill":
      questionBank = fillData;
      break;
    case "truefalse":
      questionBank = truefalseData;
      break;
    default:
      return { message: "Invalid question type" };
  }

  // Defensive: Ensure topicObj and its structure is correct
  const subtopics = topicObj?.topichint || [];
  if (!Array.isArray(subtopics) || subtopics.length === 0) return { message: "No subtopics found" };

  // Normalize topic name for consistent keys (fix: use lower + trim for all keys)
  const topicKey = topic.trim().toLowerCase();
  if (!usedSubtopics[topicKey]) usedSubtopics[topicKey] = new Set();

  const remaining = subtopics.filter((s) => !usedSubtopics[topicKey].has(s));
  if (remaining.length === 0) {
    usedSubtopics[topicKey] = new Set(); // Reset after exhausting all
    return { message: "All subtopics completed" };
  }

  const nextSubtopic = remaining[0];
  usedSubtopics[topicKey].add(nextSubtopic);

  // Fix: Always normalize things to trim and lowercase for comparison
  const question = questionBank.find(
    (q) =>
      q.class.toString().trim() === classId.toString().trim() &&
      (q.subject || "").toString().trim().toLowerCase() === subject.toString().trim().toLowerCase() &&
      (q.topic || "").toString().trim().toLowerCase() === topicKey &&
      (q.subtopic || "").toString().trim().toLowerCase() === nextSubtopic.toString().trim().toLowerCase() &&
      (q.difficulty || "").toString().trim().toLowerCase() === (difficulty || "").toString().trim().toLowerCase()
  );
  return question || { message: `No question found for subtopic "${nextSubtopic}"` };
}

export default function QuestionPage() {
  const route = useRoute();
  const navigation = useNavigation();
  const { classId, subject, topic, difficulty, questionType, mode, language } = route.params;
  const isPractice = mode === "practice";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [question, setQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [history, setHistory] = useState([]);
  const [showReport, setShowReport] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  /**
   * Fix: Defensive access for topicsData shape.
   * topicsData should be { class10: { math: [topics...] }, ... }
   */
  const classKey = `class${classId}`.trim();
  const subjectKey = (subject || "").trim().toLowerCase();
  const subjectTopics = topicsData[classKey]?.[subjectKey] || [];
  const topicKey = (topic || "").trim().toLowerCase();

  // Defensive: Find topicObj by normalized topic name
  const topicObj = subjectTopics.find(
    (t) => (t.topic || "").toString().trim().toLowerCase() === topicKey
  );

  const payload = (subtopicHint) => ({
    stdClass: classId,
    subject,
    difficulty,
    topicHint: decodeURIComponent(topic),
    subtopicHint: decodeURIComponent(subtopicHint || ""),
    language,
    questionType,
  });

  const fetchQuestion = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setSubmitted(false);
      setUserAnswer("");
      let data;

      if (isPractice) {
        // PRACTICE MODE: pull from JSON
        if (!topicObj) {
          setError("Topic not found for this subject/class");
          setQuestion(null);
          return;
        }
        data = getPracticeQuestion({
          classId,
          subject,
          topic,
          difficulty,
          questionType,
          topicObj,
        });
        if (data.message) setError(data.message);
      } else {
        // TEST MODE: keep API
        const randomHint =
          topicObj?.topichint?.[
            Math.floor(Math.random() * (topicObj.topichint?.length || 0))
          ];
        const res = await fetch(`${API_BASE}/generate-question`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload(randomHint)),
        });
        if (!res.ok) throw new Error(`API ${res.status}`);
        data = await res.json();
      }

      setQuestion(data);
    } catch (e) {
      console.error(e);
      setError(e.message || "Failed to load question");
      setQuestion(null);
    } finally {
      setLoading(false);
    }
  }, [
    isPractice,
    classId,
    subject,
    difficulty,
    topic,
    questionType,
    language,
    topicObj,
  ]);

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
    setModalVisible(true);
  };

  const onNext = () => {
    fetchQuestion();
  };

  const onEnd = () => {
    setSubmitted(true);
    if (isPractice) {
      navigation.navigate("Dashboard");
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

  // ================== Report ==================
  if (showReport && !isPractice) {
    const total = history.length;
    const wrong = total - correctCount;
    return (
      <LinearGradient
        colors={["#c5baff", "#c4d9ff", "#e8f9ff"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1 }}
      >
        <Logo />
        <ScrollView
          contentContainerStyle={styles.container}
          stickyHeaderIndices={[2]}
        >
          <Text style={styles.title}>📊 Test Report</Text>
          <Text style={styles.subtitle}>
            Class {classId} · {subject} · {decodeURIComponent(topic)} ·{" "}
            {difficulty} · {questionType.toUpperCase()}
          </Text>
          <View style={styles.stickyStatsWrapper}>
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{total}</Text>
                <Text style={styles.statLabel}>Total Questions</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: "#e0ffe0" }]}>
                <Text style={[styles.statNumber, { color: "green" }]}>
                  {correctCount}
                </Text>
                <Text style={styles.statLabel}>Correct</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: "#ffe0e0" }]}>
                <Text style={[styles.statNumber, { color: "#b91c1c" }]}>
                  {wrong}
                </Text>
                <Text style={styles.statLabel}>Wrong</Text>
              </View>
            </View>
          </View>
          {history.map((h, i) => (
            <View key={i} style={styles.historyBox}>
              <Text style={styles.historyQuestion}>
                Q{i + 1}. {h.question}
              </Text>
              <Text style={styles.historyAnswer}>
                Your Answer: {h.userAnswer || "-"}
              </Text>
              <Text style={styles.historyAnswer}>
                Correct Answer: {h.correctAnswer}
              </Text>
              <Text
                style={[
                  styles.historyStatus,
                  { color: h.isCorrect ? "green" : "#b91c1c" },
                ]}
              >
                {h.isCorrect ? "✅ Correct" : "❌ Incorrect"}
              </Text>
            </View>
          ))}
          <TouchableOpacity
            style={[styles.endBtn, { marginTop: hp(2), alignSelf: "center" }]}
            onPress={() => navigation.navigate("Dashboard")}
          >
            <Text style={styles.btnText}>🏠 Back to Home</Text>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
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
      <Logo />
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>
            {isPractice ? "📖 Practice Mode" : "📝 Test Mode"}
          </Text>
          <Text style={styles.subtitle}>
            Class {classId} · {subject} · {decodeURIComponent(topic)} ·{" "}
            {difficulty} · {questionType.toUpperCase()}
          </Text>
          {loading && <ActivityIndicator size="large" color="#000" />}
          {error !== "" && (
            <Text style={{ color: "red", textAlign: "center" }}>{error}</Text>
          )}
          {question && question.question && (
            <>
              <Text style={styles.question}>{question.question}</Text>
              {question.type?.toLowerCase() === "mcq" && renderMCQ()}
              {question.type?.toLowerCase() === "fill" && renderFill()}
              {question.type?.toLowerCase() === "truefalse" && renderTrueFalse()}
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
      </View>
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
              <Text style={styles.incorrectText}>❌ Incorrect</Text>
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

// ... (styles remain unchanged)
// ================== Styles ==================
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: wp(4),
  },
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
  title: {
    fontSize: wp(3),
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: hp(2),
    color: "#000",
  },
  subtitle: {
    fontSize: wp(1.5),
    textAlign: "center",
    color: "#555",
    marginBottom: hp(5),
  },
  question: {
    fontSize: wp(2),
    fontWeight: "500",
    marginBottom: hp(2),
    color: "#111",
    textAlign: "center",
  },
  optionsContainer: { 
    marginBottom: hp(2),
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  optionButton: {
    backgroundColor: "#e8f9ff",
    paddingVertical: hp(2),
    paddingHorizontal: wp(3),
    borderRadius: wp(2),
    margin: wp(1.5),
    width: "45%",            
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  optionButtonSelected: {
    backgroundColor: "#c5baff",
    borderColor: "#c5baff",
    transform: [{ scale: 1.05 }],
    shadowColor: "#c5baff",
    shadowOpacity: 0.3,
    shadowRadius: wp(2),
    elevation: 5,
  },
  optionText: { fontSize: wp(2), fontWeight: "500", color: "#333" },
  optionTextSelected: { color: "#333" },
  input: {
    borderWidth: 2,
    borderColor: "#ccc",
    borderRadius: wp(2),
    padding: wp(3),
    marginBottom: hp(2),
    backgroundColor: "#fff",
    fontSize: wp(2.2),
  },
  row: { flexDirection: "row", justifyContent: "space-between", gap: wp(2) },
  rowBetween: { flexDirection: "row", justifyContent: "space-between" },
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
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: hp(2),
    flexWrap: "wrap",
    gap: wp(2),
  },
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
    borderColor: "#b91c1c",
    paddingVertical: hp(1.2),
    paddingHorizontal: wp(4),
    borderRadius: wp(2),
  },
  btnText: { fontSize: wp(2), fontWeight: "600", color: "#111" },
 stickyStatsWrapper: {
  backgroundColor: "transparent", 
  paddingVertical: hp(1),
  zIndex: 10,
},
statsRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  marginVertical: hp(1),
  backgroundColor: "rgba(255,255,255,0.9)", // only around the row
  borderRadius: wp(3),
  padding: wp(2),
  shadowColor: "#000",
  shadowOpacity: 0.1,
  shadowRadius: wp(2),
  elevation: 4,
},


  statBox: {
    flex: 1,
    margin: wp(1),
    alignItems: "center",
    padding: wp(3),
    borderRadius: wp(2),
    backgroundColor: "#e8f9ff",
  },
  statLabel: {
    fontSize: wp(1.8),
    color: "#333",
    fontWeight: "500",
    textAlign: "center",
  },
  statNumber: { fontSize: wp(4), fontWeight: "bold", marginBottom: hp(0.5) },
  historyBox: {
    marginBottom: hp(2),
    padding: wp(3),
    backgroundColor: "#f9f9f9",
    borderRadius: wp(2),
  },
  historyQuestion: {
    fontSize: wp(1.8),
    fontWeight: "600",
    marginBottom: hp(1),
    color: "#111",
  },
  historyAnswer: {
    fontSize: wp(1.5),
    color: "#333",
    marginBottom: hp(0.5),
  },
  historyStatus: {
    fontSize: wp(1.5),
    fontWeight: "500",
  },
  bold: { fontWeight: "bold" },
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
    color: "#b91c1c",
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
    backgroundColor: "#c5baff",
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(3),
    borderRadius: wp(2),
  },
});