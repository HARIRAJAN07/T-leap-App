// screens/TopicSelectionPage.js
import React from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import topicsData from "../data/topics.json"; 

const TopicSelectionPage = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { classId, subject } = route.params;

  // Correct way to fetch topics
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
    <View style={styles.container}>
      {/* Heading */}
      <Text style={styles.heading}>📚 Choose a Topic</Text>

      {/* Subtitle */}
      <Text style={styles.subtitle}>
        Select a topic in <Text style={styles.bold}>{subject}</Text> for Class{" "}
        <Text style={styles.bold}>{classId}</Text> and start learning in style! 🚀
      </Text>

      {/* Topics Grid */}
      {topics.length > 0 ? (
        <FlatList
          data={topics}
          keyExtractor={(item, index) => index.toString()}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => goNext(item)}
              activeOpacity={0.8}
            >
              <Text style={styles.icon}>📘</Text>
              <Text style={styles.topicText}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      ) : (
        <Text style={styles.noTopics}>No topics available for this subject.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#c5baff",
    padding: 20,
  },
  heading: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#444",
    marginBottom: 20,
  },
  bold: {
    fontWeight: "bold",
  },
  card: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    margin: 8,
    padding: 16,
    borderRadius: 16,
    elevation: 3, // shadow for Android
    shadowColor: "#000", // shadow for iOS
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  icon: {
    fontSize: 24,
    marginRight: 10,
  },
  topicText: {
    fontSize: 16,
    fontWeight: "600",
  },
  noTopics: {
    textAlign: "center",
    fontSize: 16,
    color: "#777",
    marginTop: 20,
  },
});

export default TopicSelectionPage;
