// NewGameScreen - initial setup for new games

import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import useGameStore from "../state/gameStore";
import useThemeStore from "../state/themeStore";
import { GALAXY_CONFIG } from "../utils/gameConstants";

export default function NewGameScreen() {
  const theme = useThemeStore((state) => state.theme);
  const insets = useSafeAreaInsets();
  const initializeGame = useGameStore((state) => state.initializeGame);
  
  const [empireName, setEmpireName] = useState("");
  const [selectedGalaxy, setSelectedGalaxy] = useState(1);
  const [aiCount, setAiCount] = useState(3);
  
  const handleStartGame = () => {
    if (!empireName.trim()) {
      return;
    }
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    initializeGame(empireName.trim(), selectedGalaxy, aiCount);
    // Navigation will be handled by App.tsx based on initialized state
  };
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView
        contentContainerStyle={{
          padding: 24,
          paddingBottom: insets.bottom + 24,
        }}
      >
        <View style={{ alignItems: "center", marginBottom: 32, marginTop: 20 }}>
          <Ionicons name="planet" size={80} color={theme.colors.primary} />
          <Text
            style={{
              fontSize: 32,
              fontWeight: "bold",
              color: theme.colors.text,
              marginTop: 16,
            }}
          >
            Space Empire
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: theme.colors.textSecondary,
              marginTop: 8,
              textAlign: "center",
            }}
          >
            Build your empire across the galaxy
          </Text>
        </View>
        
        {/* Empire Name */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              color: theme.colors.text,
              fontSize: 16,
              fontWeight: "600",
              marginBottom: 8,
            }}
          >
            Empire Name
          </Text>
          <TextInput
            value={empireName}
            onChangeText={setEmpireName}
            placeholder="Enter your empire name"
            placeholderTextColor={theme.colors.textSecondary}
            style={{
              backgroundColor: theme.colors.inputBackground,
              color: theme.colors.text,
              padding: 16,
              borderRadius: 12,
              fontSize: 16,
              borderWidth: 1,
              borderColor: theme.colors.border,
            }}
            maxLength={20}
          />
        </View>
        
        {/* Starting Galaxy */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              color: theme.colors.text,
              fontSize: 16,
              fontWeight: "600",
              marginBottom: 8,
            }}
          >
            Starting Galaxy
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 8 }}>
            {Array.from({ length: GALAXY_CONFIG.galaxies }, (_, i) => i + 1).map((galaxy) => (
              <TouchableOpacity
                key={galaxy}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedGalaxy(galaxy);
                }}
                activeOpacity={0.7}
                style={{
                  backgroundColor:
                    selectedGalaxy === galaxy
                      ? theme.colors.primary
                      : theme.colors.inputBackground,
                  paddingVertical: 12,
                  paddingHorizontal: 20,
                  borderRadius: 8,
                  margin: 4,
                  borderWidth: 1,
                  borderColor:
                    selectedGalaxy === galaxy ? theme.colors.primary : theme.colors.border,
                }}
              >
                <Text
                  style={{
                    color: selectedGalaxy === galaxy ? "#FFFFFF" : theme.colors.text,
                    fontSize: 14,
                    fontWeight: "600",
                  }}
                >
                  Galaxy {galaxy}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* AI Difficulty */}
        <View style={{ marginBottom: 32 }}>
          <Text
            style={{
              color: theme.colors.text,
              fontSize: 16,
              fontWeight: "600",
              marginBottom: 8,
            }}
          >
            Number of AI Opponents
          </Text>
          <View style={{ flexDirection: "row", justifyContent: "space-around", marginTop: 8 }}>
            {[3, 4, 5].map((count) => (
              <TouchableOpacity
                key={count}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setAiCount(count);
                }}
                activeOpacity={0.7}
                style={{
                  backgroundColor:
                    aiCount === count ? theme.colors.primary : theme.colors.inputBackground,
                  paddingVertical: 16,
                  paddingHorizontal: 24,
                  borderRadius: 12,
                  flex: 1,
                  marginHorizontal: 4,
                  borderWidth: 1,
                  borderColor:
                    aiCount === count ? theme.colors.primary : theme.colors.border,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: aiCount === count ? "#FFFFFF" : theme.colors.text,
                    fontSize: 20,
                    fontWeight: "bold",
                  }}
                >
                  {count}
                </Text>
                <Text
                  style={{
                    color: aiCount === count ? "#FFFFFF" : theme.colors.textSecondary,
                    fontSize: 12,
                    marginTop: 4,
                  }}
                >
                  {count === 3 ? "Easy" : count === 4 ? "Medium" : "Hard"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Start Button */}
        <TouchableOpacity
          onPress={handleStartGame}
          disabled={!empireName.trim()}
          activeOpacity={0.7}
          style={{
            backgroundColor: empireName.trim() ? theme.colors.primary : theme.colors.border,
            paddingVertical: 16,
            paddingHorizontal: 32,
            borderRadius: 12,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: empireName.trim() ? "#FFFFFF" : theme.colors.textSecondary,
              fontSize: 18,
              fontWeight: "bold",
            }}
          >
            Start Game
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
