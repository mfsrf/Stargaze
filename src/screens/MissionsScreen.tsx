// MissionsScreen - displays available and completed missions

import React from "react";
import { View, ScrollView, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import useGameStore from "../state/gameStore";
import useThemeStore from "../state/themeStore";
import { MissionStatus, Mission } from "../types/game";
import { BUILDING_NAMES } from "../utils/gameConstants";

export default function MissionsScreen() {
  const theme = useThemeStore((state) => state.theme);
  const missions = useGameStore((state) => state.player.missions);
  const planets = useGameStore((state) => state.player.planets);
  const claimMissionReward = useGameStore((state) => state.claimMissionReward);
  
  const availableMissions = missions.filter((m) => m.status === MissionStatus.Available);
  const completedMissions = missions.filter((m) => m.status === MissionStatus.Completed);
  
  const checkRequirementsMet = (mission: Mission): boolean => {
    return mission.requirements.every((req) => {
      if (req.type === "buildingLevel" && req.buildingType) {
        return planets.some(
          (planet) => planet.buildings[req.buildingType!] >= (req.level || 1)
        );
      }
      return false;
    });
  };
  
  const renderMission = (mission: Mission) => {
    const requirementsMet = checkRequirementsMet(mission);
    const isCompleted = mission.status === MissionStatus.Completed;
    
    return (
      <View
        key={mission.id}
        style={{
          backgroundColor: theme.colors.card,
          borderRadius: 12,
          padding: 16,
          marginBottom: 12,
          borderWidth: 2,
          borderColor: isCompleted
            ? theme.colors.success + "40"
            : requirementsMet
            ? theme.colors.primary + "60"
            : theme.colors.border,
        }}
      >
        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons
                name={isCompleted ? "checkmark-circle" : requirementsMet ? "flag" : "flag-outline"}
                size={24}
                color={isCompleted ? theme.colors.success : requirementsMet ? theme.colors.primary : theme.colors.textSecondary}
              />
              <Text
                style={{
                  color: theme.colors.text,
                  fontSize: 16,
                  fontWeight: "bold",
                  marginLeft: 8,
                  flex: 1,
                }}
              >
                {mission.name}
              </Text>
            </View>
          </View>
          {isCompleted && (
            <View
              style={{
                backgroundColor: theme.colors.success + "20",
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 6,
              }}
            >
              <Text style={{ color: theme.colors.success, fontSize: 11, fontWeight: "700" }}>
                COMPLETED
              </Text>
            </View>
          )}
          {!isCompleted && requirementsMet && (
            <View
              style={{
                backgroundColor: theme.colors.primary + "20",
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 6,
              }}
            >
              <Text style={{ color: theme.colors.primary, fontSize: 11, fontWeight: "700" }}>
                READY!
              </Text>
            </View>
          )}
        </View>
        
        {/* Description */}
        <Text
          style={{
            color: theme.colors.textSecondary,
            fontSize: 14,
            lineHeight: 20,
            marginBottom: 16,
          }}
        >
          {mission.description}
        </Text>
        
        {/* Requirements */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ color: theme.colors.text, fontSize: 13, fontWeight: "600", marginBottom: 8 }}>
            📋 Requirements:
          </Text>
          {mission.requirements.map((req, index) => {
            let requirementText = "";
            let met = false;
            
            if (req.type === "buildingLevel" && req.buildingType) {
              requirementText = `${BUILDING_NAMES[req.buildingType]} - Level ${req.level}`;
              met = planets.some(
                (planet) => planet.buildings[req.buildingType!] >= (req.level || 1)
              );
            }
            
            return (
              <View
                key={index}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 4,
                  paddingLeft: 8,
                }}
              >
                <Ionicons
                  name={met ? "checkmark-circle" : "ellipse-outline"}
                  size={16}
                  color={met ? theme.colors.success : theme.colors.textSecondary}
                />
                <Text
                  style={{
                    color: met ? theme.colors.success : theme.colors.textSecondary,
                    fontSize: 13,
                    marginLeft: 6,
                  }}
                >
                  {requirementText}
                </Text>
              </View>
            );
          })}
        </View>
        
        {/* Rewards */}
        <View style={{ marginBottom: !isCompleted && requirementsMet ? 16 : 0 }}>
          <Text style={{ color: theme.colors.text, fontSize: 13, fontWeight: "600", marginBottom: 8 }}>
            🎁 Rewards:
          </Text>
          {mission.rewards.resources && (
            <View style={{ flexDirection: "row", gap: 12, paddingLeft: 8 }}>
              {mission.rewards.resources.metal > 0 && (
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons name="hammer" size={14} color={theme.colors.metal} />
                  <Text style={{ color: theme.colors.text, fontSize: 12, marginLeft: 4, fontWeight: "600" }}>
                    {mission.rewards.resources.metal.toLocaleString()}
                  </Text>
                </View>
              )}
              {mission.rewards.resources.crystal > 0 && (
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons name="diamond" size={14} color={theme.colors.crystal} />
                  <Text style={{ color: theme.colors.text, fontSize: 12, marginLeft: 4, fontWeight: "600" }}>
                    {mission.rewards.resources.crystal.toLocaleString()}
                  </Text>
                </View>
              )}
              {mission.rewards.resources.deuterium > 0 && (
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons name="water" size={14} color={theme.colors.deuterium} />
                  <Text style={{ color: theme.colors.text, fontSize: 12, marginLeft: 4, fontWeight: "600" }}>
                    {mission.rewards.resources.deuterium.toLocaleString()}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
        
        {/* Claim Button */}
        {!isCompleted && requirementsMet && (
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
              claimMissionReward(mission.id);
            }}
            activeOpacity={0.7}
            style={{
              borderRadius: 10,
              overflow: "hidden",
            }}
          >
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                paddingVertical: 12,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#FFFFFF", fontSize: 14, fontWeight: "700" }}>
                🎉 Claim Rewards
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    );
  };
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16 }}
      >
        {/* Header */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ color: theme.colors.text, fontSize: 28, fontWeight: "bold" }}>
            Missions
          </Text>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 14, marginTop: 4 }}>
            Complete missions to earn rewards
          </Text>
        </View>
        
        {/* Available Missions */}
        {availableMissions.length > 0 && (
          <View style={{ marginBottom: 20 }}>
            <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: "bold", marginBottom: 12 }}>
              📌 Available Missions
            </Text>
            {availableMissions.map(renderMission)}
          </View>
        )}
        
        {/* Completed Missions */}
        {completedMissions.length > 0 && (
          <View>
            <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: "bold", marginBottom: 12 }}>
              ✅ Completed Missions
            </Text>
            {completedMissions.map(renderMission)}
          </View>
        )}
        
        {/* No missions */}
        {missions.length === 0 && (
          <View style={{ 
            flex: 1, 
            alignItems: "center", 
            justifyContent: "center",
            paddingVertical: 60,
          }}>
            <Ionicons name="rocket-outline" size={64} color={theme.colors.textSecondary} />
            <Text style={{ 
              color: theme.colors.textSecondary, 
              fontSize: 16, 
              marginTop: 16,
              textAlign: "center",
            }}>
              No missions available yet
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
