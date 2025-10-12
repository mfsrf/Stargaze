// PlanetSelector component - horizontal scrollable planet switcher

import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import * as Haptics from "expo-haptics";
import useGameStore from "../state/gameStore";
import useThemeStore from "../state/themeStore";
import { formatNumber } from "../utils/gameFormulas";

export default function PlanetSelector() {
  const theme = useThemeStore((state) => state.theme);
  const planets = useGameStore((state) => state.player.planets);
  const selectedPlanetId = useGameStore((state) => state.selectedPlanetId);
  const selectPlanet = useGameStore((state) => state.selectPlanet);
  
  const handleSelectPlanet = (planetId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    selectPlanet(planetId);
  };
  
  return (
    <View
      style={{
        backgroundColor: theme.colors.card,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
      }}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 12 }}
      >
        {planets.map((planet) => {
          const isSelected = planet.id === selectedPlanetId;
          return (
            <TouchableOpacity
              key={planet.id}
              onPress={() => handleSelectPlanet(planet.id)}
              activeOpacity={0.7}
              style={{
                backgroundColor: isSelected ? theme.colors.primary : theme.colors.inputBackground,
                paddingVertical: 10,
                paddingHorizontal: 16,
                borderRadius: 20,
                marginHorizontal: 4,
                minWidth: 120,
                borderWidth: 1,
                borderColor: isSelected ? theme.colors.primary : theme.colors.border,
              }}
            >
              <Text
                style={{
                  color: isSelected ? "#FFFFFF" : theme.colors.text,
                  fontSize: 14,
                  fontWeight: "600",
                  textAlign: "center",
                  marginBottom: 2,
                }}
              >
                {planet.name}
              </Text>
              <Text
                style={{
                  color: isSelected ? "#FFFFFF" : theme.colors.textSecondary,
                  fontSize: 10,
                  textAlign: "center",
                }}
              >
                [{planet.coordinates.galaxy}:{planet.coordinates.system}:{planet.coordinates.position}]
              </Text>
              <Text
                style={{
                  color: isSelected ? "#FFFFFF" : theme.colors.textSecondary,
                  fontSize: 10,
                  textAlign: "center",
                  marginTop: 2,
                }}
              >
                {formatNumber(planet.resources.metal + planet.resources.crystal + planet.resources.deuterium)} resources
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
