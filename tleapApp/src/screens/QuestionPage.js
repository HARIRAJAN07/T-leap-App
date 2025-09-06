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
import matchData from "../data/matchData.json";
import dragdropData from "../data/dragdropData.json";
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';

const API_BASE = "http://localhost:5000";

// Responsive helpers
const { width, height } = Dimensions.get("window");
const wp = (perc) => (width * perc) / 100;
const hp = (perc) => (height * perc) / 100;

// Track used subtopics globally (per session)
let usedSubtopics = {};

function getPracticeQuestion({ classId, subject, topic, difficulty, questionType, topicObj }) {
  let questionBank;

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
    case "match":
      questionBank = matchData;
      break;
    case "dragdrop":
      questionBank = dragdropData;
      break;
    default:
      return { message: "Invalid question type" };
  }

  const subtopics = topicObj?.topichint || [];
  if (!Array.isArray(subtopics) || subtopics.length === 0) return { message: "No subtopics found" };

  const topicKey = topic.trim().toLowerCase();
  if (!usedSubtopics[topicKey]) usedSubtopics[topicKey] = new Set();

  const remaining = subtopics.filter((s) => !usedSubtopics[topicKey].has(s));
  if (remaining.length === 0) {
    usedSubtopics[topicKey] = new Set();
    return { message: "All subtopics completed" };
  }

  const nextSubtopic = remaining[0];
  usedSubtopics[topicKey].add(nextSubtopic);

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

  // States for 'match' type
  const [userMatches, setUserMatches] = useState({});
  const [terms, setTerms] = useState([]);
  const [definitions, setDefinitions] = useState([]);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [termColors, setTermColors] = useState({});
  const [colorIndex, setColorIndex] = useState(0);

  // States for 'dragdrop' type
  const [userDropzone, setUserDropzone] = useState({});
  const [draggableItems, setDraggableItems] = useState([]);
  const [dropzoneItems, setDropzoneItems] = useState([]);
  const [draggedItem, setDraggedItem] = useState(null);

  const colors = ["#b5e5a4", "#a4b5e5", "#e5a4b5", "#e5d1a4", "#c1a4e5", "#a4e5c1"];

  const classKey = `class${classId}`.trim();
  const subjectKey = (subject || "").trim().toLowerCase();
  const subjectTopics = topicsData[classKey]?.[subjectKey] || [];
  const topicKey = (topic || "").trim().toLowerCase();

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
      setUserMatches({});
      setTerms([]);
      setDefinitions([]);
      setSelectedTerm(null);
      setTermColors({});
      setColorIndex(0);
      setUserDropzone({});
      setDraggableItems([]);
      setDropzoneItems([]);
      setDraggedItem(null);

      let data;

      if (isPractice) {
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
        if (data.message) {
          setError(data.message);
          setQuestion(null);
          return;
        }
      } else {
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

      if (data?.type?.toLowerCase() === "match") {
        const shuffledTerms = [...data.matches];
        const shuffledDefinitions = [...data.matches].sort(() => 0.5 - Math.random());
        setTerms(shuffledTerms);
        setDefinitions(shuffledDefinitions);
      }
      
      if (data?.type?.toLowerCase() === "dragdrop") {
        const shuffledDraggables = [...data.matches].sort(() => 0.5 - Math.random());
        const shuffledDropzones = [...data.matches].sort(() => 0.5 - Math.random());
        setDraggableItems(shuffledDraggables);
        setDropzoneItems(shuffledDropzones);
      }
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
    const type = q.type?.toLowerCase();

    switch (type) {
      case "mcq":
      case "fill":
      case "truefalse":
        const correct = (q.answer || "").toString().trim().toLowerCase();
        const got = (ua || "").toString().trim().toLowerCase();
        return correct === got;
      case "match":
        const correctMatches = q.matches;
        let isMatchCorrect = true;
        for (const term of correctMatches) {
          const userDef = ua[term.term];
          if (!userDef || (userDef.trim().toLowerCase() !== term.definition.trim().toLowerCase())) {
            isMatchCorrect = false;
            break;
          }
        }
        return isMatchCorrect;
      case "dragdrop":
        const correctDropzone = q.matches;
        let isDragDropCorrect = true;
        for (const item of correctDropzone) {
          const userDroppedTerm = ua[item.definition];
          if (!userDroppedTerm || (userDroppedTerm.trim().toLowerCase() !== item.term.trim().toLowerCase())) {
            isDragDropCorrect = false;
            break;
          }
        }
        return isDragDropCorrect;
      default:
        return false;
    }
  };

  const onSubmit = () => {
    if (!question) return;

    let finalAnswer;
    let correctAnswerFormatted;

    if (question.type?.toLowerCase() === "match") {
      finalAnswer = userMatches;
      correctAnswerFormatted = question.matches.map(m => `${m.term} -> ${m.definition}`).join("\n");
    } else if (question.type?.toLowerCase() === "dragdrop") {
      finalAnswer = userDropzone;
      correctAnswerFormatted = question.matches.map(m => `${m.term} -> ${m.definition}`).join("\n");
    } else {
      finalAnswer = userAnswer;
      correctAnswerFormatted = question.answer;
    }

    const isCorrect = checkCorrect(finalAnswer, question);
    setSubmitted(true);
    setHistory((h) => [
      ...h,
      {
        question: question.question,
        type: question.type,
        correctAnswer: correctAnswerFormatted,
        userAnswer: (question.type?.toLowerCase() === "match" || question.type?.toLowerCase() === "dragdrop") ?
          Object.entries(finalAnswer).map(([key, value]) => `${key} -> ${value}`).join("\n") : finalAnswer,
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

  const handleTermSelect = (term) => {
    setSelectedTerm(term);
    if (!termColors[term.term]) {
      const newTermColors = { ...termColors, [term.term]: colors[colorIndex] };
      setTermColors(newTermColors);
      setColorIndex((colorIndex + 1) % colors.length);
    }
  };

  const handleDefinitionSelect = (definition) => {
    if (selectedTerm) {
      const newMatches = {
        ...userMatches,
        [selectedTerm.term]: definition.definition,
      };
      setUserMatches(newMatches);
      setSelectedTerm(null);
    }
  };

  const onDragEnd = useCallback(({ absoluteX, absoluteY, item }) => {
    setDraggedItem(null);
    let foundDropzone = null;

    dropzoneItems.forEach((dropzone) => {
      const dropzoneLayout = dropzone.layout;
      if (dropzoneLayout) {
        if (
          absoluteX > dropzoneLayout.x &&
          absoluteX < dropzoneLayout.x + dropzoneLayout.width &&
          absoluteY > dropzoneLayout.y &&
          absoluteY < dropzoneLayout.y + dropzoneLayout.height
        ) {
          foundDropzone = dropzone;
        }
      }
    });

    if (foundDropzone) {
      setUserDropzone((prev) => {
        const updated = { ...prev };
        const existingTerm = Object.keys(updated).find(key => updated[key] === foundDropzone.definition);
        if (existingTerm) {
          delete updated[existingTerm];
          setDraggableItems(oldItems => [...oldItems, { term: existingTerm, definition: foundDropzone.definition }]);
        }
        updated[item.term] = foundDropzone.definition;
        return updated;
      });
      setDraggableItems((oldItems) => oldItems.filter((i) => i.term !== item.term));
    }
  }, [dropzoneItems]);

  const onDropzoneLayout = useCallback((event, item) => {
    setDropzoneItems(prev => {
      const newItems = [...prev];
      const itemIndex = newItems.findIndex(i => i.definition === item.definition);
      if (itemIndex > -1) {
        newItems[itemIndex] = { ...item, layout: event.nativeEvent.layout };
      }
      return newItems;
    });
  }, []);

  const DraggableItem = ({ item }) => {
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const isDragging = useSharedValue(false);

    const gestureHandler = useAnimatedGestureHandler({
      onStart: (event, ctx) => {
        ctx.startX = translateX.value;
        ctx.startY = translateY.value;
        isDragging.value = true;
        runOnJS(setDraggedItem)(item);
      },
      onActive: (event, ctx) => {
        translateX.value = ctx.startX + event.translationX;
        translateY.value = ctx.startY + event.translationY;
      },
      onEnd: (event) => {
        isDragging.value = false;
        runOnJS(onDragEnd)({
          absoluteX: event.absoluteX,
          absoluteY: event.absoluteY,
          item: item,
        });
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      },
    });

    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [{ translateX: translateX.value }, { translateY: translateY.value }],
        zIndex: isDragging.value ? 10 : 1,
      };
    });

    const isDropped = userDropzone[item.term];
    if (isDropped) {
      return null;
    }

    return (
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View style={[styles.dragItem, animatedStyle]}>
          <Text style={styles.dragText}>{item.term}</Text>
        </Animated.View>
      </PanGestureHandler>
    );
  };
  
  const Dropzone = ({ item }) => {
    const droppedTerm = Object.keys(userDropzone).find(key => userDropzone[key] === item.definition);
    
    return (
      <View 
        style={[styles.dropItem, droppedTerm && styles.dropItemFilled]}
        onLayout={(e) => onDropzoneLayout(e, item)}
      >
        <Text style={styles.dragText}>{droppedTerm ? droppedTerm : item.definition}</Text>
      </View>
    );
  };

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

  const renderMatch = () => {
    return (
      <View style={styles.matchContainer}>
        <View style={styles.matchColumn}>
          <Text style={styles.matchHeader}>Terms</Text>
          {terms.map((item, index) => (
            <TouchableOpacity
              key={item.term}
              style={[
                styles.matchItem,
                selectedTerm?.term === item.term && styles.matchItemSelected,
                {
                  borderColor: termColors[item.term] || '#e2e8f0',
                  backgroundColor: termColors[item.term] ? `${termColors[item.term]}80` : '#f0f4f8'
                },
              ]}
              onPress={() => handleTermSelect(item)}
            >
              <Text style={styles.matchText}>{item.term}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.matchColumn}>
          <Text style={styles.matchHeader}>Definitions</Text>
          {definitions.map((item, index) => (
            <TouchableOpacity
              key={item.definition}
              style={[
                styles.matchItem,
                {
                  borderColor: Object.values(userMatches).includes(item.definition) ? termColors[Object.keys(userMatches).find(key => userMatches[key] === item.definition)] || '#16a34a' : '#e2e8f0',
                  backgroundColor: Object.values(userMatches).includes(item.definition) ? `${termColors[Object.keys(userMatches).find(key => userMatches[key] === item.definition)]}80` || '#e0ffe0' : '#f0f4f8',
                }
              ]}
              onPress={() => handleDefinitionSelect(item)}
              disabled={!selectedTerm}
            >
              <Text style={styles.matchText}>{item.definition}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };
  
  const renderDragDrop = () => (
    <View style={styles.dragDropContainer}>
      <View style={styles.dragColumn}>
        <Text style={styles.dragHeader}>Terms</Text>
        {draggableItems.map((item, index) => (
          <DraggableItem key={item.term} item={item} />
        ))}
      </View>
      <View style={styles.dropColumn}>
        <Text style={styles.dragHeader}>Definitions</Text>
        {dropzoneItems.map((item, index) => (
          <Dropzone key={item.definition} item={item} />
        ))}
      </View>
    </View>
  );

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

  return (
    <LinearGradient
      colors={["#c5baff", "#c4d9ff", "#e8f9ff"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <Logo />
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
          {error !== "" && (
            <Text style={{ color: "red", textAlign: "center" }}>{error}</Text>
          )}
          {question && question.question && (
            <>
              <Text style={styles.question}>{question.question}</Text>
              {question.type?.toLowerCase() === "mcq" && renderMCQ()}
              {question.type?.toLowerCase() === "fill" && renderFill()}
              {question.type?.toLowerCase() === "truefalse" && renderTrueFalse()}
              {question.type?.toLowerCase() === "match" && renderMatch()}
              {question.type?.toLowerCase() === "dragdrop" && renderDragDrop()}
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
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            {checkCorrect(
              question?.type?.toLowerCase() === "match" ? userMatches : (question?.type?.toLowerCase() === "dragdrop" ? userDropzone : userAnswer),
              question
            ) ? (
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
    backgroundColor: "rgba(255,255,255,0.9)",
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
  matchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp(2),
  },
  matchColumn: {
    width: '48%',
    gap: hp(1),
  },
  matchHeader: {
    fontSize: wp(2),
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: hp(1),
    color: '#333',
  },
  matchItem: {
    backgroundColor: '#f0f4f8',
    padding: wp(2),
    borderRadius: wp(2),
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  matchItemSelected: {
    borderColor: '#2563eb',
    backgroundColor: '#dbeafe',
  },
  matchItemPaired: {
    backgroundColor: '#e0ffe0',
    borderColor: '#16a34a',
  },
  matchText: {
    fontSize: wp(1.8),
    color: '#1e293b',
  },
  dragDropContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp(2),
  },
  dragColumn: {
    width: '48%',
    alignItems: 'center',
    gap: hp(1),
  },
  dropColumn: {
    width: '48%',
    alignItems: 'center',
    gap: hp(1),
  },
  dragHeader: {
    fontSize: wp(2),
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: hp(1),
    color: '#333',
  },
  dragItem: {
    backgroundColor: '#f0f4f8',
    padding: wp(2),
    borderRadius: wp(2),
    borderWidth: 1,
    borderColor: '#e2e8f0',
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: wp(1),
    elevation: 3,
  },
  dragText: {
    fontSize: wp(1.8),
    color: '#1e293b',
    textAlign: 'center'
  },
  dropItem: {
    backgroundColor: '#fff',
    padding: wp(2),
    borderRadius: wp(2),
    borderWidth: 2,
    borderColor: '#a4b5e5',
    minHeight: hp(6),
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropItemFilled: {
    backgroundColor: '#e8f9ff',
    borderColor: '#c5baff',
  }
});