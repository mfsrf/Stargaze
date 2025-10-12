// ResourceBar component - displays current resources and production rates

import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import useGameStore from "../state/gameStore";
import useThemeStore from "../state/themeStore";
import { calculatePlanetProduction, formatNumber } from "../utils/gameFormulas";

export default function ResourceBar() {
  const theme = useThemeStore((state) => state.theme);
  const selectedPlanetId = useGameStore((state) => state.selectedPlanetId);
  const planets = useGameStore((state) => state.player.planets);
  const resourceMultiplier = useGameStore((state) => state.settings.resourceMultiplier);
  const updateResources = useGameStore((state) => state.updateResources);
  
  const [, setTick] = useState(0);
  
  const selectedPlanet = planets.find((p) => p.id === selectedPlanetId);
  
  // Update resources every second
  useEffect(() => {
    const interval = setInterval(() => {
      updateResources();
      setTick((t) => t + 1);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [updateResources]);
  
  if (!selectedPlanet) return null;
  
  const production = calculatePlanetProduction(selectedPlanet, resourceMultiplier);
  
  const renderResource = (
    name: string,
    amount: number,
    productionPerHour: number,
    icon: keyof typeof Ionicons.glyphMap,
    color: string
  ) => {
    return (
      <View style={{ flex: 1, alignItems: "center" }}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 2 }}>
          <Ionicons name={icon} size={16} color={color} />
          <Text style={{ color: theme.colors.textSecondary, fontSize: 10, marginLeft: 4 }}>
            {name}
          </Text>
        </View>
        <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: "600" }}>
          {formatNumber(amount)}
        </Text>
        <Text style={{ color: theme.colors.success, fontSize: 10 }}>
          +{formatNumber(productionPerHour)}/h
        </Text>
      </View>
    );
  };
  
  return (
    <View
      style={{
        backgroundColor: theme.colors.card,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
        {renderResource(
          "Metal",
          selectedPlanet.resources.metal,
          production.metal,
          "hammer",
          theme.colors.metal
        )}
        {renderResource(
          "Crystal",
          selectedPlanet.resources.crystal,
          production.crystal,
          "diamond",
          theme.colors.crystal
        )}
        {renderResource(
          "Deuterium",
          selectedPlanet.resources.deuterium,
          production.deuterium,
          "water",
          theme.colors.deuterium
        )}
        {renderResource(
          "Energy",
          selectedPlanet.resources.energy,
          0,
          "flash",
          production.energy >= 0 ? theme.colors.energy : theme.colors.danger
        )}
      </View>
    </View>
  );
}
