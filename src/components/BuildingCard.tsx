// BuildingCard component - displays building info and upgrade button

import React from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import useGameStore from "../state/gameStore";
import useThemeStore from "../state/themeStore";
import { BuildingType } from "../types/game";
import {
  getBuildingCost,
  getBuildingConstructionTime,
  canAfford,
  formatNumber,
  formatDuration,
} from "../utils/gameFormulas";
import { BUILDING_NAMES } from "../utils/gameConstants";

interface BuildingCardProps {
  buildingType: BuildingType;
  planetId: string;
}

const BUILDING_ICONS: Record<BuildingType, keyof typeof Ionicons.glyphMap> = {
  [BuildingType.MetalMine]: "hammer",
  [BuildingType.CrystalMine]: "diamond",
  [BuildingType.DeuteriumSynthesizer]: "water",
  [BuildingType.SolarPlant]: "sunny",
  [BuildingType.FusionReactor]: "nuclear",
  [BuildingType.MetalStorage]: "cube",
  [BuildingType.CrystalStorage]: "cube-outline",
  [BuildingType.DeuteriumTank]: "flask",
  [BuildingType.RoboticsFactory]: "construct",
  [BuildingType.Shipyard]: "rocket",
  [BuildingType.ResearchLab]: "flask-outline",
  [BuildingType.AllianceDepot]: "people",
  [BuildingType.NaniteFactory]: "hardware-chip",
  [BuildingType.Terraformer]: "globe",
};

export default function BuildingCard({ buildingType, planetId }: BuildingCardProps) {
  const theme = useThemeStore((state) => state.theme);
  const planet = useGameStore((state) =>
    state.player.planets.find((p) => p.id === planetId)
  );
  const upgradeBuilding = useGameStore((state) => state.upgradeBuilding);
  
  if (!planet) return null;
  
  const currentLevel = planet.buildings[buildingType];
  const cost = getBuildingCost(buildingType, currentLevel);
  const constructionTime = getBuildingConstructionTime(
    buildingType,
    currentLevel,
    planet.buildings[BuildingType.RoboticsFactory],
    planet.buildings[BuildingType.NaniteFactory]
  );
  
  const isUnderConstruction =
    planet.constructionQueue?.type === buildingType;
  const canUpgrade = canAfford(planet.resources, cost) && !planet.constructionQueue;
  
  const handleUpgrade = () => {
    if (canUpgrade) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      upgradeBuilding(planetId, buildingType);
    }
  };
  
  const progress = isUnderConstruction && planet.constructionQueue
    ? ((Date.now() - planet.constructionQueue.startTime) /
        (planet.constructionQueue.endTime - planet.constructionQueue.startTime)) * 100
    : 0;
  
  const timeRemaining = isUnderConstruction && planet.constructionQueue
    ? Math.max(0, planet.constructionQueue.endTime - Date.now()) / 1000
    : 0;
  
  return (
    <View
      style={{
        backgroundColor: theme.colors.card,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: theme.colors.border,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: theme.colors.primary + "20",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
          }}
        >
          <Ionicons
            name={BUILDING_ICONS[buildingType]}
            size={24}
            color={theme.colors.primary}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: "600" }}>
            {BUILDING_NAMES[buildingType]}
          </Text>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 14 }}>
            Level {currentLevel}
          </Text>
        </View>
      </View>
      
      {isUnderConstruction ? (
        <View>
          <View style={{ marginBottom: 8 }}>
            <View
              style={{
                height: 4,
                backgroundColor: theme.colors.border,
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  height: "100%",
                  width: `${progress}%`,
                  backgroundColor: theme.colors.success,
                }}
              />
            </View>
          </View>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 12, textAlign: "center" }}>
            Upgrading to Level {currentLevel + 1} - {formatDuration(timeRemaining)}
          </Text>
        </View>
      ) : (
        <>
          <View style={{ marginBottom: 12 }}>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 12, marginBottom: 4 }}>
              Upgrade Cost:
            </Text>
            <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
              {cost.metal > 0 && (
                <View style={{ alignItems: "center" }}>
                  <Ionicons name="hammer" size={14} color={theme.colors.metal} />
                  <Text
                    style={{
                      color: planet.resources.metal >= cost.metal ? theme.colors.text : theme.colors.danger,
                      fontSize: 12,
                    }}
                  >
                    {formatNumber(cost.metal)}
                  </Text>
                </View>
              )}
              {cost.crystal > 0 && (
                <View style={{ alignItems: "center" }}>
                  <Ionicons name="diamond" size={14} color={theme.colors.crystal} />
                  <Text
                    style={{
                      color: planet.resources.crystal >= cost.crystal ? theme.colors.text : theme.colors.danger,
                      fontSize: 12,
                    }}
                  >
                    {formatNumber(cost.crystal)}
                  </Text>
                </View>
              )}
              {cost.deuterium > 0 && (
                <View style={{ alignItems: "center" }}>
                  <Ionicons name="water" size={14} color={theme.colors.deuterium} />
                  <Text
                    style={{
                      color: planet.resources.deuterium >= cost.deuterium ? theme.colors.text : theme.colors.danger,
                      fontSize: 12,
                    }}
                  >
                    {formatNumber(cost.deuterium)}
                  </Text>
                </View>
              )}
            </View>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 10, textAlign: "center", marginTop: 4 }}>
              Time: {formatDuration(constructionTime)}
            </Text>
          </View>
          
          <Pressable
            onPress={handleUpgrade}
            disabled={!canUpgrade}
            style={({ pressed }) => ({
              backgroundColor: canUpgrade ? theme.colors.primary : theme.colors.border,
              paddingVertical: 10,
              paddingHorizontal: 16,
              borderRadius: 8,
              alignItems: "center",
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text
              style={{
                color: canUpgrade ? "#FFFFFF" : theme.colors.textSecondary,
                fontSize: 14,
                fontWeight: "600",
              }}
            >
              {canUpgrade ? "Upgrade" : planet.constructionQueue ? "Building..." : "Insufficient Resources"}
            </Text>
          </Pressable>
        </>
      )}
    </View>
  );
}
