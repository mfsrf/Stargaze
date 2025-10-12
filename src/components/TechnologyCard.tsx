// TechnologyCard component - displays technology info and research button

import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import useGameStore from "../state/gameStore";
import useThemeStore from "../state/themeStore";
import { TechnologyType, BuildingType } from "../types/game";
import {
  getTechnologyCost,
  getTechnologyResearchTime,
  canAfford,
  formatNumber,
  formatDuration,
} from "../utils/gameFormulas";
import { TECHNOLOGY_NAMES } from "../utils/gameConstants";

interface TechnologyCardProps {
  technologyType: TechnologyType;
}

const TECHNOLOGY_ICONS: Record<TechnologyType, keyof typeof Ionicons.glyphMap> = {
  [TechnologyType.EnergyTech]: "flash",
  [TechnologyType.LaserTech]: "radio-button-on",
  [TechnologyType.IonTech]: "nuclear",
  [TechnologyType.HyperspaceTech]: "planet",
  [TechnologyType.PlasmaTech]: "flame",
  [TechnologyType.CombustionDrive]: "rocket",
  [TechnologyType.ImpulseDrive]: "airplane",
  [TechnologyType.HyperspaceDrive]: "sparkles",
  [TechnologyType.EspionageTech]: "eye",
  [TechnologyType.ComputerTech]: "hardware-chip",
  [TechnologyType.Astrophysics]: "telescope",
  [TechnologyType.WeaponsTech]: "trending-up",
  [TechnologyType.ShieldingTech]: "shield",
  [TechnologyType.ArmorTech]: "shield-checkmark",
};

const TECHNOLOGY_COLORS: Record<TechnologyType, string[]> = {
  [TechnologyType.EnergyTech]: ["#FFD54F", "#FFC107"],
  [TechnologyType.LaserTech]: ["#FF6B6B", "#E74C3C"],
  [TechnologyType.IonTech]: ["#9575CD", "#7E57C2"],
  [TechnologyType.HyperspaceTech]: ["#4FC3F7", "#29B6F6"],
  [TechnologyType.PlasmaTech]: ["#FF6B9D", "#E91E63"],
  [TechnologyType.CombustionDrive]: ["#FF9800", "#F57C00"],
  [TechnologyType.ImpulseDrive]: ["#42A5F5", "#1E88E5"],
  [TechnologyType.HyperspaceDrive]: ["#AB47BC", "#8E24AA"],
  [TechnologyType.EspionageTech]: ["#78909C", "#546E7A"],
  [TechnologyType.ComputerTech]: ["#26C6DA", "#00ACC1"],
  [TechnologyType.Astrophysics]: ["#7E57C2", "#5E35B1"],
  [TechnologyType.WeaponsTech]: ["#EF5350", "#D32F2F"],
  [TechnologyType.ShieldingTech]: ["#66BB6A", "#43A047"],
  [TechnologyType.ArmorTech]: ["#8D6E63", "#6D4C41"],
};

export default function TechnologyCard({ technologyType }: TechnologyCardProps) {
  const theme = useThemeStore((state) => state.theme);
  const technologies = useGameStore((state) => state.player.technologies);
  const planets = useGameStore((state) => state.player.planets);
  const researchQueue = useGameStore((state) => state.researchQueue);
  const startResearch = useGameStore((state) => state.startResearch);
  const instantBuild = useGameStore((state) => state.settings.instantBuild);
  
  const currentLevel = technologies[technologyType];
  const cost = getTechnologyCost(technologyType, currentLevel);
  
  // Find best research lab
  const bestLabPlanet = planets.reduce((best, planet) => {
    const labLevel = planet.buildings[BuildingType.ResearchLab];
    const bestLabLevel = best?.buildings[BuildingType.ResearchLab] || 0;
    return labLevel > bestLabLevel ? planet : best;
  }, planets[0]);
  
  const researchTime = getTechnologyResearchTime(
    technologyType,
    currentLevel,
    bestLabPlanet?.buildings[BuildingType.ResearchLab] || 0
  );
  
  const isUnderResearch = researchQueue?.type === technologyType;
  const canResearch = !researchQueue && bestLabPlanet && canAfford(bestLabPlanet.resources, cost);
  
  const handleResearch = () => {
    if (canResearch) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const success = startResearch(technologyType);
      if (success && instantBuild) {
        // Instantly complete research
        setTimeout(() => {
          useGameStore.getState().finishResearch();
        }, 100);
      }
    }
  };
  
  const progress = isUnderResearch && researchQueue
    ? ((Date.now() - researchQueue.startTime) /
        (researchQueue.endTime - researchQueue.startTime)) * 100
    : 0;
  
  const timeRemaining = isUnderResearch && researchQueue
    ? Math.max(0, researchQueue.endTime - Date.now()) / 1000
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
          colors={[TECHNOLOGY_COLORS[technologyType][0] + "60", TECHNOLOGY_COLORS[technologyType][1] + "30"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
            shadowColor: TECHNOLOGY_COLORS[technologyType][0],
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 4,
          }}
        >
          <Ionicons
            name={TECHNOLOGY_ICONS[technologyType]}
            size={30}
            color={TECHNOLOGY_COLORS[technologyType][0]}
          />
        </LinearGradient>
        <View style={{ flex: 1 }}>
          <Text style={{ color: theme.colors.text, fontSize: 17, fontWeight: "700" }}>
            {TECHNOLOGY_NAMES[technologyType]}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 2 }}>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 14 }}>
              Level {currentLevel}
            </Text>
            {currentLevel > 0 && (
              <View style={{ 
                marginLeft: 8, 
                backgroundColor: theme.colors.primary + "20",
                paddingHorizontal: 6,
                paddingVertical: 2,
                borderRadius: 4,
              }}>
                <Text style={{ color: theme.colors.primary, fontSize: 10, fontWeight: "600" }}>
                  Researched
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
      
      {isUnderResearch ? (
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
                colors={[theme.colors.secondary, theme.colors.primary]}
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
            Researching Level {currentLevel + 1} - {formatDuration(timeRemaining)}
          </Text>
        </View>
      ) : (
        <>
          <View style={{ marginBottom: 12 }}>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 12, marginBottom: 4 }}>
              Research Cost:
            </Text>
            <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
              {cost.metal > 0 && (
                <View style={{ alignItems: "center" }}>
                  <Ionicons name="hammer" size={14} color={theme.colors.metal} />
                  <Text
                    style={{
                      color: bestLabPlanet && bestLabPlanet.resources.metal >= cost.metal ? theme.colors.text : theme.colors.danger,
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
                      color: bestLabPlanet && bestLabPlanet.resources.crystal >= cost.crystal ? theme.colors.text : theme.colors.danger,
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
                      color: bestLabPlanet && bestLabPlanet.resources.deuterium >= cost.deuterium ? theme.colors.text : theme.colors.danger,
                      fontSize: 12,
                    }}
                  >
                    {formatNumber(cost.deuterium)}
                  </Text>
                </View>
              )}
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: 4 }}>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 10 }}>
                Time: {formatDuration(researchTime)}
              </Text>
              {bestLabPlanet && bestLabPlanet.buildings[BuildingType.ResearchLab] > 0 && (
                <View style={{ 
                  marginLeft: 6,
                  backgroundColor: theme.colors.primary + "20",
                  paddingHorizontal: 4,
                  paddingVertical: 1,
                  borderRadius: 3,
                }}>
                  <Text style={{ color: theme.colors.primary, fontSize: 9, fontWeight: "600" }}>
                    -{Math.round((1 - 1 / (1 + bestLabPlanet.buildings[BuildingType.ResearchLab])) * 100)}%
                  </Text>
                </View>
              )}
            </View>
          </View>
          
          <TouchableOpacity
            onPress={handleResearch}
            disabled={!canResearch}
            activeOpacity={0.7}
            style={{
              borderRadius: 10,
              overflow: "hidden",
              shadowColor: canResearch ? theme.colors.secondary : "transparent",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: canResearch ? 3 : 0,
            }}
          >
            {canResearch ? (
              <LinearGradient
                colors={[theme.colors.secondary, theme.colors.primary]}
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
                  Research Level {currentLevel + 1}
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
                  {researchQueue ? "Already Researching" : "Insufficient Resources"}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}
