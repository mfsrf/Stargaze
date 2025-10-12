// ResourceBar component - displays current resources and production rates

import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import useGameStore from "../state/gameStore";
import useThemeStore from "../state/themeStore";
import { calculatePlanetProduction, formatNumber, calculateStorageCapacity } from "../utils/gameFormulas";
import { BuildingType } from "../types/game";

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
  
  // Calculate storage capacities
  const metalCapacity = calculateStorageCapacity(selectedPlanet.buildings[BuildingType.MetalStorage]);
  const crystalCapacity = calculateStorageCapacity(selectedPlanet.buildings[BuildingType.CrystalStorage]);
  const deuteriumCapacity = calculateStorageCapacity(selectedPlanet.buildings[BuildingType.DeuteriumTank]);
  
  const renderResource = (
    name: string,
    amount: number,
    capacity: number | null,
    productionPerHour: number,
    icon: keyof typeof Ionicons.glyphMap,
    color: string
  ) => {
    // Check if resource is at or near capacity (95% or more)
    const isAtCapacity = capacity !== null && amount >= capacity * 0.95;
    const amountColor = isAtCapacity ? theme.colors.danger : theme.colors.text;
    
    return (
      <View style={{ flex: 1, alignItems: "center" }}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 2 }}>
          <Ionicons name={icon} size={16} color={color} />
          <Text style={{ color: theme.colors.textSecondary, fontSize: 10, marginLeft: 4 }}>
            {name}
          </Text>
        </View>
        <Text style={{ color: amountColor, fontSize: 14, fontWeight: "600" }}>
          {formatNumber(amount)}
        </Text>
        {capacity !== null && (
          <Text style={{ color: theme.colors.textSecondary, fontSize: 9 }}>
            / {formatNumber(capacity)}
          </Text>
        )}
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
          metalCapacity,
          production.metal,
          "hammer",
          theme.colors.metal
        )}
        {renderResource(
          "Crystal",
          selectedPlanet.resources.crystal,
          crystalCapacity,
          production.crystal,
          "diamond",
          theme.colors.crystal
        )}
        {renderResource(
          "Deuterium",
          selectedPlanet.resources.deuterium,
          deuteriumCapacity,
          production.deuterium,
          "water",
          theme.colors.deuterium
        )}
        {renderResource(
          "Energy",
          selectedPlanet.resources.energy,
          null,
          0,
          "flash",
          production.energy >= 0 ? theme.colors.energy : theme.colors.danger
        )}
      </View>
    </View>
  );
}
