import React, { useState, useMemo, useRef } from "react";
import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import Animated, {
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { StatusBar } from "expo-status-bar";
import { useNavigation } from "@react-navigation/native";

// ✅ Import the shared Logo component
import Logo from "../components/logo";

const { width, height } = Dimensions.get("window");
const classes = ["VI", "VII", "VIII", "IX", "X", "XI", "XII"];

// 🎯 Emoji map for each class
const emojiMap = {
  VI: "📐",
  VII: "📙",
  VIII: "🧪",
  IX: "📘",
  X: "📗",
  XI: "🧬",
  XII: "🎓",
};

// ---------- INDIVIDUAL CLASS CARD ----------
const ClassCard = ({ cls, isSelected, onPress }) => {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withSpring(isSelected ? 1.15 : 1, {
          damping: 15,
          stiffness: 150,
        }),
      },
      {
        translateY: withSpring(isSelected ? -15 : 0, {
          damping: 15,
          stiffness: 150,
        }),
      },
    ],
  }));

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
      <Animated.View
        style={[
          styles.cardShadow,
          animatedStyle,
          isSelected && styles.cardSelected,
        ]}
      >
        <LinearGradient
          colors={["#ffffffcc", "#dcd6ff"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardClip}
        >
          <BlurView intensity={50} tint="light" style={styles.blur}>
            {/* Emoji */}
            <Text style={styles.cardEmoji}>{emojiMap[cls]}</Text>
            {/* Class Name */}
            <Text style={styles.cardText}>Class {cls}</Text>
          </BlurView>
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
};

// ---------- CLASS CAROUSEL ----------
const ClassCarousel = ({ selected, setSelected, onSelect }) => {
  const CARD_MARGIN = 25;
  const CARD_WIDTH = Math.round(width * 0.35);
  const SNAP_INTERVAL = CARD_WIDTH + CARD_MARGIN * 2;
  const SIDE_PADDING = Math.max(0, (width - CARD_WIDTH) / 2 - CARD_MARGIN);

  const scrollRef = useRef(null);

  const offsets = useMemo(
    () => classes.map((_, i) => i * SNAP_INTERVAL),
    [SNAP_INTERVAL]
  );

  const scrollToIndex = (i) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ x: i * SNAP_INTERVAL, animated: true });
    }
    setSelected(classes[i]);
    // Small delay for animation before navigation
    setTimeout(() => {
      onSelect(classes[i]);
    }, 300);
  };

  return (
    <View style={styles.carouselWrapper}>
      {/* ✅ Use shared Logo here */}
      <Logo />

      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          styles.carouselContainer,
          { paddingHorizontal: SIDE_PADDING },
        ]}
        decelerationRate="fast"
        snapToOffsets={offsets}
        snapToAlignment="start"
        disableIntervalMomentum
        onMomentumScrollEnd={(e) => {
          const i = Math.round(e.nativeEvent.contentOffset.x / SNAP_INTERVAL);
          if (classes[i]) {
            setSelected(classes[i]);
          }
        }}
      >
        {classes.map((cls, i) => (
          <ClassCard
            key={cls}
            cls={cls}
            isSelected={selected === cls}
            onPress={() => scrollToIndex(i)}
          />
        ))}
      </ScrollView>
    </View>
  );
};

// ---------- MAIN DASHBOARD ----------
const Dashboard = () => {
  const navigation = useNavigation();
  const [selected, setSelected] = useState(null);

  const handleSelectClass = (cls) => {
    const classMap = {
      VI: "6",
      VII: "7",
      VIII: "8",
      IX: "9",
      X: "10",
      XI: "11",
      XII: "12",
    };
    navigation.navigate("SubjectSelection", { classId: classMap[cls] });
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <LinearGradient colors={["#C4D9FF", "#C5BAFF"]} style={styles.gradient} />

      <ClassCarousel
        selected={selected}
        setSelected={setSelected}
        onSelect={handleSelectClass}
      />
    </View>
  );
};

export default Dashboard;

// ---------- STYLES ----------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FBFBFB",
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  carouselWrapper: {
    flex: 1,
    justifyContent: "center",
  },
  carouselContainer: {
    alignItems: "center",
    justifyContent: "center",
    flexGrow: 1,
  },
  cardShadow: {
    borderRadius: 200,
    marginHorizontal: width * 0.05,
    shadowColor: "#9B7BFF",
    shadowOpacity: 0.3,
    shadowRadius: 25,
    elevation: 10,
  },
  cardClip: {
    width: width * 0.35,
    height: height * 0.55,
    borderRadius: 200,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  blur: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  cardEmoji: {
    fontSize: 90,
    marginBottom: 12,
  },
  cardText: {
    fontSize: Math.min(70, width * 0.12),
    fontWeight: "800",
    color: "#333",
    letterSpacing: 1,
  },
  cardSelected: {
    borderWidth: 4,
    borderColor: "#9B7BFF",
    shadowColor: "#9B7BFF",
    shadowRadius: 40,
    shadowOpacity: 0.5,
  },
});
