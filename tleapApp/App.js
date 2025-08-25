// App.js
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Screens
import Dashboard from "./src/screens/Dashboard";
import SubjectSelectionPage from "./src/screens/SubjectSelectionPage";
import TopicSelectionPage from "./src/screens/TopicSelectionPage";
import DifficultySelectionPage from "./src/screens/DifficultySelectionPage";
import QuizType from "./src/screens/QuizType";
import ModeSelectionPage from "./src/screens/ModeSelectionPage";
import LanguageSelectionPage from "./src/screens/LanguageSelectionPage";
import QuestionPage from "./src/screens/QuestionPage";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Dashboard" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Dashboard" component={Dashboard} />
        <Stack.Screen name="SubjectSelection" component={SubjectSelectionPage} />
        <Stack.Screen name="TopicSelection" component={TopicSelectionPage} />
        <Stack.Screen name="DifficultySelection" component={DifficultySelectionPage} />
        <Stack.Screen name="QuizType" component={QuizType} />
        <Stack.Screen name="ModeSelection" component={ModeSelectionPage} />
        <Stack.Screen name="LanguageSelection" component={LanguageSelectionPage} />
        <Stack.Screen name="Question" component={QuestionPage} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
