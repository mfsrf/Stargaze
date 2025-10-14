// ResourceBar component - displays current resources and production rates

import React, { useEffect, useState, useMemo } from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import useGameStore from "../state/gameStore";
import useThemeStore from "../state/themeStore";
import { calculatePlanetProduction, formatNumber, calculateStorageCapacity } from "../utils/gameFormulas";
import { BuildingType } from "../types/game";
import { RESPONSIVE } from "../utils/responsive";

export default React.memo(function ResourceBar() {
  const theme = useThemeStore((state) => state.theme);
  const selectedPlanetId = useGameStore((state) => state.selectedPlanetId);
  const selectedPlanet = useGameStore((state) => 
    state.player.planets.find((p) => p.id === state.selectedPlanetId)
  );
  const resourceMultiplier = useGameStore((state) => state.settings.resourceMultiplier);
  const updateResources = useGameStore((state) => state.updateResources);
  
  const [, setTick] = useState(0);
  
  // Update resources every second
  useEffect(() => {
    const interval = setInterval(() => {
      updateResources();
      setTick((t) => t + 1);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [updateResources]);
  
  // Memoize production calculation
  const production = useMemo(() => {
    if (!selectedPlanet) return null;
    return calculatePlanetProduction(selectedPlanet, resourceMultiplier);
  }, [selectedPlanet, resourceMultiplier]);
  
  // Memoize storage capacities
  const storageCapacities = useMemo(() => {
    if (!selectedPlanet) return null;
    return {
      metal: calculateStorageCapacity(selectedPlanet.buildings[BuildingType.MetalStorage]),
      crystal: calculateStorageCapacity(selectedPlanet.buildings[BuildingType.CrystalStorage]),
      deuterium: calculateStorageCapacity(selectedPlanet.buildings[BuildingType.DeuteriumTank]),
    };
  }, [selectedPlanet?.buildings[BuildingType.MetalStorage], selectedPlanet?.buildings[BuildingType.CrystalStorage], selectedPlanet?.buildings[BuildingType.DeuteriumTank]]);
  
  if (!selectedPlanet || !production || !storageCapacities) return null;
  
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
      <View style={{ flex: 1, alignItems: "center", minWidth: "22%" }}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 2 }}>
          <Ionicons name={icon} size={14} color={color} />
          <Text 
            style={{ color: theme.colors.textSecondary, fontSize: RESPONSIVE.fonts.tiny, marginLeft: 4 }}
            numberOfLines={1}
          >
            {name}
          </Text>
        </View>
        <Text 
          style={{ color: amountColor, fontSize: RESPONSIVE.fonts.medium, fontWeight: "600" }}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {formatNumber(amount)}
        </Text>
        {capacity !== null && (
          <Text style={{ color: theme.colors.textSecondary, fontSize: RESPONSIVE.fonts.tiny }} numberOfLines={1}>
            / {formatNumber(capacity)}
          </Text>
        )}
        <Text 
          style={{ color: theme.colors.success, fontSize: RESPONSIVE.fonts.tiny }}
          numberOfLines={1}
        >
          +{formatNumber(productionPerHour)}/h
        </Text>
      </View>
    );
  };
  
  return (
    <View
      style={{
        backgroundColor: theme.colors.card,
        paddingVertical: RESPONSIVE.padding.small,
        paddingHorizontal: RESPONSIVE.padding.medium,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-around", flexWrap: "wrap" }}>
        {renderResource(
          "Metal",
          selectedPlanet.resources.metal,
          storageCapacities.metal,
          production.metal,
          "hammer",
          theme.colors.metal
        )}
        {renderResource(
          "Crystal",
          selectedPlanet.resources.crystal,
          storageCapacities.crystal,
          production.crystal,
          "diamond",
          theme.colors.crystal
        )}
        {renderResource(
          "Deuterium",
          selectedPlanet.resources.deuterium,
          storageCapacities.deuterium,
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
});
