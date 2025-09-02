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
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";
import { StatusBar } from "expo-status-bar";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import Logo from "../../assets/logo.png";

const { width, height } = Dimensions.get("window");
const classes = ["VI", "VII", "VIII", "IX", "X"];

// Logo component with image - positioned in top left
const LogoComponent = () => (
  <View style={styles.logoContainer}>
    <Image source={Logo} style={styles.logoImage} resizeMode="contain" />
  </View>
);

// ---------- INDIVIDUAL CLASS CARD ----------
const ClassCard = ({ cls, index, scrollX, isSelected, onPress }) => {
  const CARD_WIDTH = Math.round(width * 0.55);
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
                <Feather name="check-circle" size={20} color="#4CAF50" />
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
  const CARD_WIDTH = Math.round(width * 0.55);
  const SPACING = 12;
  const SNAP_INTERVAL = CARD_WIDTH + SPACING;
  const scrollX = useSharedValue(0);
  
  const scrollRef = useRef(null);

  const scrollToIndex = (i) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ x: i * SNAP_INTERVAL, animated: true });
    }
    setSelected(classes[i]);
    setTimeout(() => {
      onSelect(classes[i]);
    }, 300);
  };

  return (
    <View style={styles.carouselWrapper}>
      <LogoComponent />
      
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Select Your Class</Text>
        <Text style={styles.subtitle}>Choose your class to explore available subjects and learning materials</Text>
      </View>
      
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
        <View style={styles.arrowsContainer}>
          <Feather name="arrow-left" size={16} color="#666" />
          <Feather name="arrow-right" size={16} color="#666" />
        </View>
      </View>
    </View>
  );
};

// ---------- MAIN DASHBOARD ----------
const Dashboard = () => {
  const navigation = useNavigation();
  const [selected, setSelected] = useState(null);

  const handleSelectClass = (cls) => {
    const classMap = {
      VI: "6", VII: "7", VIII: "8", IX: "9", X: "10",
    };
    navigation.navigate("SubjectSelection", { classId: classMap[cls] });
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <LinearGradient 
        colors={["#FBFBFB", "#E8F9FF"]} 
        style={styles.gradient} 
      />
      
      <View style={styles.circle1} />
      <View style={styles.circle2} />
      
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
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(196, 217, 255, 0.3)',
    top: -80,
    left: -80,
  },
  circle2: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(197, 186, 255, 0.2)',
    bottom: -40,
    right: -40,
    zIndex: -1, // Ensure it stays behind the content
  },
  carouselWrapper: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 20,
  },
  carouselContainer: {
    height: height * 0.4,
    justifyContent: 'center',
  },
  carouselContent: {
    paddingHorizontal: (width - (width * 0.55)) / 2,
  },
  logoContainer: {
    position: 'absolute',
    top: height * 0.05,
    left: 20,
    zIndex: 10,
  },
  logoImage: {
    width: 140,
    height: 100,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
    marginTop: height * 0.15, // Push down to make space for logo
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 17,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 50,
    paddingHorizontal: 20,
  },
  card: {
    width: width * 0.35,
    height: 180,
    marginHorizontal: 6,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  cardGradient: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  classBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  classBadgeSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  classText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E7FD9',
  },
  classTextSelected: {
    color: '#8E7FD9',
  },
  cardText: {
    fontSize: 42,
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
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 12,
  },
  selectedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  selectedText: {
    marginLeft: 4,
    fontWeight: '600',
    color: '#4CAF50',
    fontSize: 12,
  },
  instructions: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  instructionsText: {
    color: '#666',
    fontSize: 14,
    marginBottom: 6,
  },
  arrowsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
});