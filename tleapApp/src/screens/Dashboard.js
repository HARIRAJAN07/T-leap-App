// src/screens/Dashboard.js
import React, { useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Boy from "../../assets/human_vector.png"; // move image to assets

const Dashboard = () => {
  const navigation = useNavigation();
  const [language, setLanguage] = useState("en");
  const [displayText, setDisplayText] = useState("");

  const texts = {
    en: { welcome: "Hii Champs", chooseClass: "Choose Your Class 🚀" },
    ta: { welcome: "வவணக்கம் தோழா", chooseClass: "உங்கள் வகுப்பைத் தேர்ந்தெடுக்கவும் 🚀" },
  };

  useEffect(() => {
    let index = 0;
    setDisplayText("");
    const interval = setInterval(() => {
      if (index < texts[language].welcome.length) {
        setDisplayText((prev) => prev + texts[language].welcome.charAt(index));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 150);
    return () => clearInterval(interval);
  }, [language]);

  const handleSelectClass = (cls) => {
    navigation.navigate("SubjectSelection", { classId: cls });
  };

  const classNumbers1 = ["6", "7", "8", "9"];
  const classNumbers2 = ["10", "11", "12"];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Language Toggle */}
      <TouchableOpacity
        style={styles.langButton}
        onPress={() => setLanguage(language === "en" ? "ta" : "en")}
      >
        <Text style={styles.langText}>{language === "en" ? "தமிழ்" : "English"}</Text>
      </TouchableOpacity>

      {/* Top Section */}
      <View style={styles.topSection}>
        <View style={{ flex: 1 }}>
          <Text style={styles.welcomeText}>{displayText}|</Text>
          <Text style={styles.chooseClass}>{texts[language].chooseClass}</Text>
        </View>
        <Image source={Boy} style={styles.image} resizeMode="contain" />
      </View>

      {/* First Row */}
      <View style={styles.row}>
        {classNumbers1.map((num) => (
          <TouchableOpacity
            key={num}
            style={styles.card}
            onPress={() => handleSelectClass(num)}
          >
            <Text style={styles.cardText}>{num}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Second Row */}
      <View style={styles.row}>
        {classNumbers2.map((num) => (
          <TouchableOpacity
            key={num}
            style={styles.card}
            onPress={() => handleSelectClass(num)}
          >
            <Text style={styles.cardText}>{num}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    padding: "5%",
    backgroundColor: "#f5f7fa",
  },
  langButton: {
    position: "absolute",
    top: 20,
    right: 20,
    backgroundColor: "black",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    zIndex: 10,
  },
  langText: { color: "white", fontWeight: "bold", fontSize: 14 },
  topSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    width: "100%",
  },
  welcomeText: { fontSize: 28, fontWeight: "bold", color: "black", marginBottom: 10 },
  chooseClass: { fontSize: 20, color: "black", fontWeight: "500" },
  image: { width: 100, height: 100 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
    marginBottom: 20,
  },
  card: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: "#ebedee",
    borderRadius: 22,
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  cardText: { fontSize: 28, fontWeight: "bold", color: "black" },
});

export default Dashboard;
