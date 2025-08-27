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
          colors={["#c5baff", "#c4d9ff", "#e8f9ff"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1 }}
        >
    <View
      style={{
        flex: 1,
        padding: wp(5),
      }}
    >
      {/* Heading */}
      <Text
        style={{
          fontSize: wp(2),
          fontWeight: "bold",
          color: "#000",
          textAlign: "center",
          marginBottom: hp(3),

        }}
      >
        📚 Choose a Topic
      </Text>

      {/* Subtitle */}
      <Text
        style={{
          fontSize: wp(1.5),
          textAlign: "center",
          color: "#444",
          marginBottom: hp(8.5),
        }}
      >
        Select a topic in{" "}
        <Text style={{ fontWeight: "bold" }}>{subject}</Text> for Class{" "}
        <Text style={{ fontWeight: "bold" }}>{classId}</Text> and start learning
        in style! 🚀
      </Text>

      {/* Topics Grid */}
      {topics.length > 0 ? (
        <FlatList
          data={topics}
          keyExtractor={(item, index) => index.toString()}
          numColumns={3} // 🔑 ensures 3 per row
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
                display:"flex",
               justifyContent:"center",
               alignItems:"center",
               padding:"0.6%",
                // Shadow
                elevation: 4, // Android
                shadowColor: "#000", // iOS
                shadowOpacity: 0.2,
                shadowOffset: { width: 0, height: 2 },
                shadowRadius: 5,
              }}
              onPress={() => goNext(item)}
              activeOpacity={0.85}
            >
              {/* <Text
                style={{
                  fontSize: wp(1),
                  marginBottom: hp(0.5),
                }}
              >
                📘
              </Text> */}
              <Text
                style={{
                  fontSize: wp(1.25),
                  fontWeight: "600",
                  textAlign: "center",
                  
                }}
              >
                {item}
              </Text>
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
