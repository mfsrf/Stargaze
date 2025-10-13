// BuildingCard component - displays building info and upgrade button

import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
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
  calculateMetalProduction,
  calculateCrystalProduction,
  calculateDeuteriumProduction,
  calculateEnergyProduction,
} from "../utils/gameFormulas";
import { BUILDING_NAMES, PLANET_TYPE_BONUSES, ENERGY_CONSUMPTION } from "../utils/gameConstants";

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

const BUILDING_COLORS: Record<BuildingType, string[]> = {
  [BuildingType.MetalMine]: ["#A0826D", "#8B7355"],
  [BuildingType.CrystalMine]: ["#64B5F6", "#4A90E2"],
  [BuildingType.DeuteriumSynthesizer]: ["#66BB6A", "#50C878"],
  [BuildingType.SolarPlant]: ["#FFD54F", "#FFD700"],
  [BuildingType.FusionReactor]: ["#FF6B6B", "#FF4757"],
  [BuildingType.MetalStorage]: ["#757575", "#616161"],
  [BuildingType.CrystalStorage]: ["#9575CD", "#7E57C2"],
  [BuildingType.DeuteriumTank]: ["#4DB6AC", "#26A69A"],
  [BuildingType.RoboticsFactory]: ["#FFA726", "#FB8C00"],
  [BuildingType.Shipyard]: ["#5E35B1", "#512DA8"],
  [BuildingType.ResearchLab]: ["#29B6F6", "#039BE5"],
  [BuildingType.AllianceDepot]: ["#EC407A", "#D81B60"],
  [BuildingType.NaniteFactory]: ["#AB47BC", "#8E24AA"],
  [BuildingType.Terraformer]: ["#66BB6A", "#43A047"],
};

export default React.memo(function BuildingCard({ buildingType, planetId }: BuildingCardProps) {
  const theme = useThemeStore((state) => state.theme);
  const planet = useGameStore((state) =>
    state.player.planets.find((p) => p.id === planetId)
  );
  const upgradeBuilding = useGameStore((state) => state.upgradeBuilding);
  const instantBuild = useGameStore((state) => state.settings.instantBuild);
  const finishConstruction = useGameStore((state) => state.finishConstruction);
  const resourceMultiplier = useGameStore((state) => state.settings.resourceMultiplier);
  
  if (!planet) return null;
  
  const currentLevel = planet.buildings[buildingType];
  const cost = getBuildingCost(buildingType, currentLevel);
  const constructionTime = getBuildingConstructionTime(
    buildingType,
    currentLevel,
    planet.buildings[BuildingType.RoboticsFactory],
    planet.buildings[BuildingType.NaniteFactory]
  );
  
  // Calculate energy consumption for next level (for mines)
  let nextLevelEnergyConsumption = 0;
  const isMine = buildingType === BuildingType.MetalMine || 
                 buildingType === BuildingType.CrystalMine || 
                 buildingType === BuildingType.DeuteriumSynthesizer;
  
  if (isMine) {
    const nextLevel = currentLevel + 1;
    let consumptionRate = 0;
    
    if (buildingType === BuildingType.MetalMine) {
      consumptionRate = ENERGY_CONSUMPTION.metalMine;
    } else if (buildingType === BuildingType.CrystalMine) {
      consumptionRate = ENERGY_CONSUMPTION.crystalMine;
    } else if (buildingType === BuildingType.DeuteriumSynthesizer) {
      consumptionRate = ENERGY_CONSUMPTION.deuteriumSynthesizer;
    }
    
    nextLevelEnergyConsumption = Math.floor(nextLevel * consumptionRate * Math.pow(1.1, nextLevel));
  }
  
  // Calculate production info for resource buildings
  let productionInfo: { amount: number; bonus: number } | null = null;
  if (currentLevel > 0) {
    const planetBonus = PLANET_TYPE_BONUSES[planet.type];
    switch (buildingType) {
      case BuildingType.MetalMine:
        productionInfo = {
          amount: calculateMetalProduction(currentLevel, resourceMultiplier, 100, planet.type),
          bonus: planetBonus.metal,
        };
        break;
      case BuildingType.CrystalMine:
        productionInfo = {
          amount: calculateCrystalProduction(currentLevel, resourceMultiplier, 100, planet.type),
          bonus: planetBonus.crystal,
        };
        break;
      case BuildingType.DeuteriumSynthesizer:
        productionInfo = {
          amount: calculateDeuteriumProduction(currentLevel, resourceMultiplier, 100, planet.type),
          bonus: planetBonus.deuterium,
        };
        break;
      case BuildingType.SolarPlant:
      case BuildingType.FusionReactor:
        productionInfo = {
          amount: calculateEnergyProduction(
            buildingType === BuildingType.SolarPlant ? currentLevel : 0,
            buildingType === BuildingType.FusionReactor ? currentLevel : 0,
            planet.type
          ),
          bonus: planetBonus.energy,
        };
        break;
    }
  }
  
  const isUnderConstruction =
    planet.constructionQueue?.type === buildingType;
  const canUpgrade = canAfford(planet.resources, cost) && !planet.constructionQueue;
  
  const handleUpgrade = () => {
    if (canUpgrade) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const success = upgradeBuilding(planetId, buildingType);
      if (success && instantBuild) {
        // Instantly complete construction
        setTimeout(() => {
          finishConstruction(planetId);
        }, 100);
      }
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
        <LinearGradient
          colors={[BUILDING_COLORS[buildingType][0] + "60", BUILDING_COLORS[buildingType][1] + "30"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
            shadowColor: BUILDING_COLORS[buildingType][0],
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 4,
          }}
        >
          <Ionicons
            name={BUILDING_ICONS[buildingType]}
            size={30}
            color={BUILDING_COLORS[buildingType][0]}
          />
        </LinearGradient>
        <View style={{ flex: 1 }}>
          <Text style={{ color: theme.colors.text, fontSize: 17, fontWeight: "700" }}>
            {BUILDING_NAMES[buildingType]}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 2 }}>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 14 }}>
              Level {currentLevel}
            </Text>
            {currentLevel > 0 && (
              <View style={{ 
                marginLeft: 8, 
                backgroundColor: theme.colors.success + "20",
                paddingHorizontal: 6,
                paddingVertical: 2,
                borderRadius: 4,
              }}>
                <Text style={{ color: theme.colors.success, fontSize: 10, fontWeight: "600" }}>
                  Active
                </Text>
              </View>
            )}
          </View>
          {/* Production Info */}
          {productionInfo && (
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
                {formatNumber(productionInfo.amount)}/h
              </Text>
              {productionInfo.bonus !== 1.0 && (
                <View style={{ 
                  marginLeft: 6,
                  backgroundColor: productionInfo.bonus > 1.0 ? theme.colors.success + "15" : theme.colors.danger + "15",
                  paddingHorizontal: 4,
                  paddingVertical: 1,
                  borderRadius: 3,
                }}>
                  <Text style={{ 
                    color: productionInfo.bonus > 1.0 ? theme.colors.success : theme.colors.danger, 
                    fontSize: 9, 
                    fontWeight: "600" 
                  }}>
                    {productionInfo.bonus > 1.0 ? "+" : ""}{Math.round((productionInfo.bonus - 1.0) * 100)}%
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </View>
      
      {isUnderConstruction ? (
        <View>
          <View style={{ marginBottom: 8 }}>
            <View
              style={{
                height: 6,
                backgroundColor: theme.colors.border,
                borderRadius: 3,
                overflow: "hidden",
              }}
            >
              <LinearGradient
                colors={[theme.colors.success, theme.colors.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  height: "100%",
                  width: `${progress}%`,
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
              {isMine && nextLevelEnergyConsumption > 0 && (
                <View style={{ alignItems: "center" }}>
                  <Ionicons name="flash" size={14} color={theme.colors.energy} />
                  <Text
                    style={{
                      color: theme.colors.text,
                      fontSize: 12,
                    }}
                  >
                    {formatNumber(nextLevelEnergyConsumption)}
                  </Text>
                </View>
              )}
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: 4 }}>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 10 }}>
                Time: {formatDuration(constructionTime)}
              </Text>
              {planet.buildings[BuildingType.RoboticsFactory] > 0 && (
                <View style={{ 
                  marginLeft: 6,
                  backgroundColor: theme.colors.success + "20",
                  paddingHorizontal: 4,
                  paddingVertical: 1,
                  borderRadius: 3,
                }}>
                  <Text style={{ color: theme.colors.success, fontSize: 9, fontWeight: "600" }}>
                    -{Math.round((1 - 1 / (1 + planet.buildings[BuildingType.RoboticsFactory])) * 100)}%
                  </Text>
                </View>
              )}
            </View>
          </View>
          
          <TouchableOpacity
            onPress={handleUpgrade}
            disabled={!canUpgrade}
            activeOpacity={0.7}
            style={{
              borderRadius: 10,
              overflow: "hidden",
              shadowColor: canUpgrade ? theme.colors.primary : "transparent",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: canUpgrade ? 3 : 0,
            }}
          >
            {canUpgrade ? (
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontSize: 15,
                    fontWeight: "700",
                  }}
                >
                  Upgrade to Level {currentLevel + 1}
                </Text>
              </LinearGradient>
            ) : (
              <View
                style={{
                  backgroundColor: theme.colors.border,
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: theme.colors.textSecondary,
                    fontSize: 15,
                    fontWeight: "600",
                  }}
                >
                  {planet.constructionQueue ? "Building..." : "Insufficient Resources"}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </>
      )}
    </View>
  );
});
