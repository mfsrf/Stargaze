// SettingsScreen - game settings and dark mode toggle

import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import useGameStore from "../state/gameStore";
import useThemeStore from "../state/themeStore";

export default function SettingsScreen() {
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const resetGame = useGameStore((state) => state.resetGame);
  const resourceMultiplier = useGameStore((state) => state.settings.resourceMultiplier);
  const instantBuild = useGameStore((state) => state.settings.instantBuild);
  const updateSettings = useGameStore((state) => state.updateSettings);
  const selectedPlanetId = useGameStore((state) => state.selectedPlanetId);
  const addResourcesToPlanet = useGameStore((state) => state.addResourcesToPlanet);
  
  const handleAddResources = () => {
    if (selectedPlanetId) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      addResourcesToPlanet(selectedPlanetId, 1000);
    }
  };
  
  const handleResetGame = () => {
    Alert.alert(
      "Reset Game",
      "Are you sure you want to reset the game? All progress will be lost.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            resetGame();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  };
  
  const handleToggleDarkMode = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleTheme();
  };
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ color: theme.colors.text, fontSize: 28, fontWeight: "bold", marginBottom: 24 }}>
          Settings
        </Text>
        
        {/* Dark Mode Toggle */}
        <View
          style={{
            backgroundColor: theme.colors.card,
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
            <Ionicons
              name={theme.dark ? "moon" : "sunny"}
              size={24}
              color={theme.colors.primary}
              style={{ marginRight: 12 }}
            />
            <View>
              <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: "600" }}>
                Dark Mode
              </Text>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 12, marginTop: 2 }}>
                {theme.dark ? "Enabled" : "Disabled"}
              </Text>
            </View>
          </View>
          <Switch
            value={theme.dark}
            onValueChange={handleToggleDarkMode}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            thumbColor="#FFFFFF"
          />
        </View>
        
        {/* Instant Build Toggle */}
        <View
          style={{
            backgroundColor: theme.colors.card,
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
            <Ionicons
              name="flash"
              size={24}
              color={theme.colors.warning}
              style={{ marginRight: 12 }}
            />
            <View>
              <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: "600" }}>
                Instant Build
              </Text>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 12, marginTop: 2 }}>
                {instantBuild ? "Buildings & research complete instantly" : "Normal construction times"}
              </Text>
            </View>
          </View>
          <Switch
            value={instantBuild}
            onValueChange={(value) => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              updateSettings({ instantBuild: value });
            }}
            trackColor={{ false: theme.colors.border, true: theme.colors.warning }}
            thumbColor="#FFFFFF"
          />
        </View>
        
        {/* Resource Multiplier */}
        <View
          style={{
            backgroundColor: theme.colors.card,
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
            <Ionicons
              name="speedometer"
              size={24}
              color={theme.colors.primary}
              style={{ marginRight: 12 }}
            />
            <View>
              <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: "600" }}>
                Resource Production Speed
              </Text>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 12, marginTop: 2 }}>
                Current: {resourceMultiplier}x
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-around", marginTop: 8 }}>
            {[1, 5, 10, 25, 50].map((multiplier) => (
              <TouchableOpacity
                key={multiplier}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  updateSettings({ resourceMultiplier: multiplier });
                }}
                activeOpacity={0.7}
                style={{
                  backgroundColor:
                    resourceMultiplier === multiplier
                      ? theme.colors.primary
                      : theme.colors.inputBackground,
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                  borderRadius: 8,
                }}
              >
                <Text
                  style={{
                    color:
                      resourceMultiplier === multiplier ? "#FFFFFF" : theme.colors.text,
                    fontSize: 14,
                    fontWeight: "600",
                  }}
                >
                  {multiplier}x
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Testing Tools */}
        <View
          style={{
            backgroundColor: theme.colors.card,
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
            <Ionicons
              name="construct"
              size={24}
              color={theme.colors.warning}
              style={{ marginRight: 12 }}
            />
            <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: "600" }}>
              Testing Tools
            </Text>
          </View>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 12, marginBottom: 12 }}>
            Quick actions for testing gameplay features
          </Text>
          <TouchableOpacity
            onPress={handleAddResources}
            activeOpacity={0.7}
            style={{
              backgroundColor: theme.colors.success,
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: 8,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              shadowColor: theme.colors.success,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <Ionicons name="add-circle" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={{ color: "#FFFFFF", fontSize: 15, fontWeight: "700" }}>
              Add +1000 Resources
            </Text>
          </TouchableOpacity>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 10, marginTop: 8, textAlign: "center" }}>
            Adds 1000 metal, crystal, and deuterium to selected planet
          </Text>
        </View>
        
        {/* Game Info */}
        <View
          style={{
            backgroundColor: theme.colors.card,
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
            <Ionicons
              name="information-circle"
              size={24}
              color={theme.colors.primary}
              style={{ marginRight: 12 }}
            />
            <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: "600" }}>
              About
            </Text>
          </View>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 14, lineHeight: 20 }}>
            Space Empire is an OGame-inspired strategy game. Build your empire, research technologies, construct fleets, and conquer the galaxy!
          </Text>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 12, marginTop: 8 }}>
            Version 1.0.0
          </Text>
        </View>
        
        {/* Reset Game */}
        <TouchableOpacity
          onPress={handleResetGame}
          activeOpacity={0.7}
          style={{
            backgroundColor: theme.colors.danger,
            paddingVertical: 16,
            paddingHorizontal: 32,
            borderRadius: 12,
            alignItems: "center",
            marginTop: 16,
          }}
        >
          <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "bold" }}>
            Reset Game
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
