// src/screens/TopicSelectionPage.js
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import topicsData from "../data/topics.json";
import { LinearGradient } from "expo-linear-gradient";
import Logo from "../components/logo";        // ✅ use consistent case
import BackButton from "../components/BackButton"; // ✅ reusable back button

const { width, height } = Dimensions.get("window");

// helpers for responsiveness
const wp = (perc) => (width * perc) / 100;
const hp = (perc) => (height * perc) / 100;

// Card size for 3 per row
const CARD_WIDTH = width / 4;
const CARD_HEIGHT = CARD_WIDTH * 0.2;

const TopicSelectionPage = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { classId, subject } = route.params;

  const classKey = `class${classId}`;
  const topics = topicsData[classKey]?.[subject.toLowerCase()] || [];

  const goNext = (topic) => {
    navigation.navigate("DifficultySelection", {
      classId,
      subject,
      topic,
    });
  };

  return (
    <LinearGradient
      colors={["#FBFBFB", "#E8F9FF"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      {/* ✅ Global Logo + Back Button */}
      <Logo />
      <BackButton onPress={() => navigation.goBack()} />

      <View
        style={{
          flex: 1,
          padding: wp(5),
        }}
      >
        {/* Heading */}
        <Text
          style={{
            fontSize: wp(4),
            fontWeight: "bold",
            color: "#000",
            textAlign: "center",
            marginBottom: hp(2),
          }}
        >
          📚 Choose a Topic
        </Text>

        {/* Subtitle */}
        <Text
          style={{
            fontSize: wp(2),
            textAlign: "center",
            color: "#555",
            marginBottom: hp(8),
          }}
        >
          Select a topic in{" "}
          <Text style={{ fontWeight: "bold" }}>{subject}</Text> for Class{" "}
          <Text style={{ fontWeight: "bold" }}>{classId}</Text> and start
          learning in style! 🚀
        </Text>

        {/* Topics Grid */}
        {topics.length > 0 ? (
          <FlatList
            data={topics}
            keyExtractor={(item, index) => index.toString()}
            numColumns={3} // 🔑 ensures 3 per row
            columnWrapperStyle={{ justifyContent: "flex-start" }}
            contentContainerStyle={{
              paddingBottom: hp(10),
              paddingLeft: hp(10),
            }}
            scrollEnabled={true}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={{
                  width: CARD_WIDTH,
                  height: CARD_HEIGHT,
                  borderRadius: wp(2),
                  marginBottom: hp(2),
                  marginRight: wp(2),
                  elevation: 4, // Android shadow
                  shadowColor: "#000", // iOS shadow
                  shadowOpacity: 0.2,
                  shadowOffset: { width: 0, height: 2 },
                  shadowRadius: 5,
                  overflow: "hidden", // ✅ ensures gradient respects borderRadius
                }}
                onPress={() => goNext(item.topic)}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={["#c5baff", "#c4d9ff", "#e8f9ff"]} // 🎨 gradient colors
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: wp(1.25),
                      fontWeight: "600",
                      textAlign: "center",
                      color: "#000", // 🔑 text visible on gradient
                    }}
                  >
                    {item.topic}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          />
        ) : (
          <Text
            style={{
              textAlign: "center",
              fontSize: wp(2.5),
              color: "#777",
              marginTop: hp(2),
            }}
          >
            No topics available for this subject.
          </Text>
        )}
      </View>
    </LinearGradient>
  );
};

export default TopicSelectionPage;
