import React, { useState, useMemo, useRef } from "react";
import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
  useSharedValue,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";
import { StatusBar } from "expo-status-bar";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

// Import your logo from the correct path
import LogoImage from '../assets/logo.png';

const { width, height } = Dimensions.get("window");
const classes = ["VI", "VII", "VIII", "IX", "X"];

// Logo component using your local image
const Logo = () => (
  <View style={styles.logoContainer}>
    <Image
      source={LogoImage}
      style={styles.logo}
      resizeMode="contain"
    />
    <Text style={styles.title}>Select Your Class</Text>
    <Text style={styles.subtitle}>Choose your class to explore available subjects and learning materials</Text>
  </View>
);

// ---------- INDIVIDUAL CLASS CARD ----------
const ClassCard = ({ cls, index, scrollX, isSelected, onPress }) => {
  const CARD_WIDTH = Math.round(width * 0.4);
  const SPACING = 16;
  const inputRange = [
    (index - 1) * CARD_WIDTH,
    index * CARD_WIDTH,
    (index + 1) * CARD_WIDTH,
  ];

  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollX.value,
      inputRange,
      [0.85, 1, 0.85],
      Extrapolate.CLAMP
    );

    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.6, 1, 0.6],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress}>
      <Animated.View style={[styles.card, animatedStyle, isSelected && styles.cardSelected]}>
        <LinearGradient
          colors={isSelected ? ["#A89AEB", "#C7E8F9"] : ["#E0E8F5", "#D1E3F8"]}
          style={styles.cardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.cardContent}>
            <View style={[styles.classBadge, isSelected && styles.classBadgeSelected]}>
              <Text style={[styles.classText, isSelected && styles.classTextSelected]}>
                Class
              </Text>
            </View>
            <Text style={[styles.cardText, isSelected && styles.cardTextSelected]}>
              {cls}
            </Text>
            {isSelected && (
              <View style={styles.selectedIndicator}>
                <Feather name="check-circle" size={24} color="#4CAF50" />
                <Text style={styles.selectedText}>Selected</Text>
              </View>
            )}
          </View>
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
};

// ---------- CLASS CAROUSEL ----------
const ClassCarousel = ({ selected, setSelected, onSelect }) => {
  const CARD_WIDTH = Math.round(width * 0.2);
  const SPACING = 16;
  const SNAP_INTERVAL = CARD_WIDTH + SPACING;
  const scrollX = useSharedValue(0);
  
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
      <Logo />
      
      <View style={styles.carouselContainer}>
        <Animated.ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carouselContent}
          decelerationRate="fast"
          snapToInterval={SNAP_INTERVAL}
          snapToAlignment="center"
          disableIntervalMomentum
          onScroll={(e) => {
            scrollX.value = e.nativeEvent.contentOffset.x;
          }}
          scrollEventThrottle={16}
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
              index={i}
              scrollX={scrollX}
              isSelected={selected === cls}
              onPress={() => scrollToIndex(i)}
            />
          ))}
        </Animated.ScrollView>
      </View>
      
      <View style={styles.instructions}>
        <Text style={styles.instructionsText}>
          Swipe left or right to browse classes
        </Text>
        <Feather name="arrow-left" size={16} color="#666" />
        <Feather name="arrow-right" size={16} color="#666" />
      </View>
    </View>
  );
};

// ---------- MAIN DASHBOARD ----------
const Dashboard = () => {
  const navigation = useNavigation();
  const [selected, setSelected] = useState(null); // No default selection

  const handleSelectClass = (cls) => {
    const classMap = {
      VI: "6", VII: "7", VIII: "8", IX: "9", X: "10", XI: "11", XII: "12",
    };
    navigation.navigate("SubjectSelection", { classId: classMap[cls] });
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      {/* Background with subtle gradient */}
      <LinearGradient 
        colors={["#FBFBFB", "#E8F9FF"]} 
        style={styles.gradient} 
      />
      
      {/* Decorative elements */}
      <View style={styles.circle1} />
      <View style={styles.circle2} />
      
      {/* Main content */}
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
  circle1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(196, 217, 255, 0.3)',
    top: -100,
    left: -100,
  },
  circle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(197, 186, 255, 0.2)',
    bottom: -50,
    right: -50,
  },
  carouselWrapper: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 40,
  },
  carouselContainer: {
    height: height * 0.5,
    justifyContent: 'center',
  },
  carouselContent: {
    paddingHorizontal: (width - (width * 0.7)) / 2,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  card: {
    width: width * 0.2,
    height: height * 0.35,
    marginHorizontal: 8,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
  },
  cardGradient: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  classBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
  },
  classBadgeSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  classText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E7FD9',
  },
  classTextSelected: {
    color: '#8E7FD9',
  },
  cardText: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#444',
  },
  cardTextSelected: {
    color: 'white',
  },
  cardSelected: {
    shadowColor: "#8E7FD9",
    shadowOffset: {
      width: 0,
      height: 15,
    },
    shadowOpacity: 0.3,
    shadowRadius: 25,
    elevation: 15,
  },
  selectedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  selectedText: {
    marginLeft: 6,
    fontWeight: '600',
    color: '#4CAF50',
  },
  instructions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    paddingHorizontal: 20,
  },
  instructionsText: {
    marginRight: 8,
    color: '#666',
    fontSize: 14,
  },
});