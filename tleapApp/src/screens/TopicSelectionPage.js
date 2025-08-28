// screens/TopicSelectionPage.js
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
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

// helpers for responsiveness
const wp = (perc) => (width * perc) / 100;
const hp = (perc) => (height * perc) / 100;

// Card size for 3 per row
const CARD_WIDTH = width / 3.5;
const CARD_HEIGHT = CARD_WIDTH * 0.6;

const TopicSelectionPage = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { classId, subject } = route.params;

  const classKey = `class${classId}`;
  const topics = topicsData[classKey]?.[subject.toLowerCase()] || [];

  const goNext = (selectedTopic) => {
    

    navigation.navigate("DifficultySelection", {
      classId,
      subject,
      topic: selectedTopic,
    
    });
  };

  return (
    <LinearGradient
      colors={["#c5baff", "#c4d9ff", "#e8f9ff"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <View style={{ flex: 1, padding: wp(5) }}>
        {/* Back Button */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "rgba(255,255,255,0.7)",
            paddingVertical: hp(1),
            paddingHorizontal: wp(3),
            borderRadius: wp(5),
            alignSelf: "flex-start",
            marginBottom: hp(2),
            elevation: 3,
          }}
        >
          <Ionicons name="arrow-back" size={20} color="#333" />
          <Text
            style={{
              marginLeft: wp(1.5),
              fontSize: wp(3),
              fontWeight: "600",
              color: "#333",
            }}
          >
            Back
          </Text>
        </TouchableOpacity>

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
            fontSize: wp(3),
            textAlign: "center",
            color: "#444",
            marginBottom: hp(5),
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
            numColumns={3}
            columnWrapperStyle={{ justifyContent: "space-evenly" }}
            contentContainerStyle={{ paddingBottom: hp(2) }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={{
                  width: CARD_WIDTH,
                  height: CARD_HEIGHT,
                  backgroundColor: "#fff",
                  borderRadius: wp(2),
                  marginBottom: hp(2),
                  justifyContent: "center",
                  alignItems: "center",
                  padding: wp(1),
                  elevation: 4,
                  shadowColor: "#000",
                  shadowOpacity: 0.2,
                  shadowOffset: { width: 0, height: 2 },
                  shadowRadius: 5,
                }}
                onPress={() => goNext(item.topic)}
                activeOpacity={0.85}
              >
                <Text
                  style={{
                    fontSize: wp(3),
                    fontWeight: "600",
                    textAlign: "center",
                  }}
                >
                  {item.topic}
                </Text>
              </TouchableOpacity>
            )}
          />
        ) : (
          <Text
            style={{
              textAlign: "center",
              fontSize: wp(4),
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
