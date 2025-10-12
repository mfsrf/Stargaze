// PlanetDetailModal - shows planet information in a modal

import React from "react";
import { View, Text, Modal, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { Planet } from "../types/game";
import useThemeStore from "../state/themeStore";
import {
  getPlanetTypeName,
  getPlanetTypeDescription,
  getPlanetTypeColor,
  getPlanetResourceBonus,
  getPlanetType,
  calculateTemperature,
} from "../utils/galaxyManager";
import { formatNumber } from "../utils/gameFormulas";

interface PlanetDetailModalProps {
  visible: boolean;
  planet: Planet | null;
  onClose: () => void;
  isPlayerPlanet: boolean;
}

export default function PlanetDetailModal({
  visible,
  planet,
  onClose,
  isPlayerPlanet,
}: PlanetDetailModalProps) {
  const theme = useThemeStore((state) => state.theme);

  if (!planet) return null;

  // If planet doesn't have a type, assign one based on position
  const planetType = planet.type || getPlanetType(planet.coordinates.position);
  const planetTemp = planet.temperature ?? calculateTemperature(planet.coordinates.position);
  
  const planetColor = getPlanetTypeColor(planetType);
  const planetTypeName = getPlanetTypeName(planetType);
  const planetDescription = getPlanetTypeDescription(planetType);
  const resourceBonus = getPlanetResourceBonus(planetType);
  
  // Safety check for undefined bonuses
  const safeResourceBonus = {
    metal: resourceBonus?.metal ?? 1.0,
    crystal: resourceBonus?.crystal ?? 1.0,
    deuterium: resourceBonus?.deuterium ?? 1.0,
    energy: resourceBonus?.energy ?? 1.0,
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          justifyContent: "flex-end",
        }}
      >
        <View
          style={{
            backgroundColor: theme.colors.background,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            maxHeight: "80%",
          }}
        >
          {/* Header */}
          <LinearGradient
            colors={[planetColor + "40", planetColor + "10"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              paddingVertical: 20,
              paddingHorizontal: 20,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ color: theme.colors.text, fontSize: 24, fontWeight: "bold" }}>
                {planet.name}
              </Text>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 14, marginTop: 4 }}>
                [{planet.coordinates.galaxy}:{planet.coordinates.system}:{planet.coordinates.position}]
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleClose}
              activeOpacity={0.7}
              style={{
                backgroundColor: theme.colors.card,
                width: 36,
                height: 36,
                borderRadius: 18,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </LinearGradient>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 20 }}
          >
            {/* Planet Type */}
            <View
              style={{
                backgroundColor: theme.colors.card,
                borderRadius: 12,
                padding: 16,
                marginBottom: 16,
                borderLeftWidth: 4,
                borderLeftColor: planetColor,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                <Ionicons name="planet" size={24} color={planetColor} style={{ marginRight: 12 }} />
                <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: "bold" }}>
                  {planetTypeName}
                </Text>
              </View>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 14, lineHeight: 20 }}>
                {planetDescription}
              </Text>
            </View>

            {/* Planet Stats */}
            <View
              style={{
                backgroundColor: theme.colors.card,
                borderRadius: 12,
                padding: 16,
                marginBottom: 16,
              }}
            >
              <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: "bold", marginBottom: 12 }}>
                Planet Statistics
              </Text>
              
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
                <Text style={{ color: theme.colors.textSecondary, fontSize: 14 }}>Temperature:</Text>
                <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: "600" }}>
                  {planetTemp}°C
                </Text>
              </View>
              
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
                <Text style={{ color: theme.colors.textSecondary, fontSize: 14 }}>Fields:</Text>
                <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: "600" }}>
                  {planet.usedFields} / {planet.maxFields}
                </Text>
              </View>
              
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ color: theme.colors.textSecondary, fontSize: 14 }}>Position:</Text>
                <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: "600" }}>
                  {planet.coordinates.position} (Distance from sun)
                </Text>
              </View>
            </View>

            {/* Resource Bonuses */}
            <View
              style={{
                backgroundColor: theme.colors.card,
                borderRadius: 12,
                padding: 16,
                marginBottom: 16,
              }}
            >
              <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: "bold", marginBottom: 12 }}>
                Resource Production Bonuses
              </Text>
              
              <View style={{ marginBottom: 10 }}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Ionicons name="hammer" size={16} color={theme.colors.metal} style={{ marginRight: 8 }} />
                    <Text style={{ color: theme.colors.textSecondary, fontSize: 14 }}>Metal:</Text>
                  </View>
                  <Text
                    style={{
                      color: safeResourceBonus.metal > 1 ? theme.colors.success : safeResourceBonus.metal < 1 ? theme.colors.danger : theme.colors.text,
                      fontSize: 14,
                      fontWeight: "600",
                    }}
                  >
                    {safeResourceBonus.metal > 1 ? "+" : ""}{((safeResourceBonus.metal - 1) * 100).toFixed(0)}%
                  </Text>
                </View>
              </View>
              
              <View style={{ marginBottom: 10 }}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Ionicons name="diamond" size={16} color={theme.colors.crystal} style={{ marginRight: 8 }} />
                    <Text style={{ color: theme.colors.textSecondary, fontSize: 14 }}>Crystal:</Text>
                  </View>
                  <Text
                    style={{
                      color: safeResourceBonus.crystal > 1 ? theme.colors.success : safeResourceBonus.crystal < 1 ? theme.colors.danger : theme.colors.text,
                      fontSize: 14,
                      fontWeight: "600",
                    }}
                  >
                    {safeResourceBonus.crystal > 1 ? "+" : ""}{((safeResourceBonus.crystal - 1) * 100).toFixed(0)}%
                  </Text>
                </View>
              </View>
              
              <View style={{ marginBottom: 10 }}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Ionicons name="water" size={16} color={theme.colors.deuterium} style={{ marginRight: 8 }} />
                    <Text style={{ color: theme.colors.textSecondary, fontSize: 14 }}>Deuterium:</Text>
                  </View>
                  <Text
                    style={{
                      color: safeResourceBonus.deuterium > 1 ? theme.colors.success : safeResourceBonus.deuterium < 1 ? theme.colors.danger : theme.colors.text,
                      fontSize: 14,
                      fontWeight: "600",
                    }}
                  >
                    {safeResourceBonus.deuterium > 1 ? "+" : ""}{((safeResourceBonus.deuterium - 1) * 100).toFixed(0)}%
                  </Text>
                </View>
              </View>
              
              <View>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Ionicons name="flash" size={16} color={theme.colors.energy} style={{ marginRight: 8 }} />
                    <Text style={{ color: theme.colors.textSecondary, fontSize: 14 }}>Solar Energy:</Text>
                  </View>
                  <Text
                    style={{
                      color: safeResourceBonus.energy > 1 ? theme.colors.success : safeResourceBonus.energy < 1 ? theme.colors.danger : theme.colors.text,
                      fontSize: 14,
                      fontWeight: "600",
                    }}
                  >
                    {safeResourceBonus.energy > 1 ? "+" : ""}{((safeResourceBonus.energy - 1) * 100).toFixed(0)}%
                  </Text>
                </View>
              </View>
            </View>

            {/* Current Resources (only for player planets) */}
            {isPlayerPlanet && (
              <View
                style={{
                  backgroundColor: theme.colors.card,
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 16,
                }}
              >
                <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: "bold", marginBottom: 12 }}>
                  Current Resources
                </Text>
                
                <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
                  <View style={{ alignItems: "center" }}>
                    <Ionicons name="hammer" size={20} color={theme.colors.metal} />
                    <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: "600", marginTop: 4 }}>
                      {formatNumber(planet.resources.metal)}
                    </Text>
                  </View>
                  <View style={{ alignItems: "center" }}>
                    <Ionicons name="diamond" size={20} color={theme.colors.crystal} />
                    <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: "600", marginTop: 4 }}>
                      {formatNumber(planet.resources.crystal)}
                    </Text>
                  </View>
                  <View style={{ alignItems: "center" }}>
                    <Ionicons name="water" size={20} color={theme.colors.deuterium} />
                    <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: "600", marginTop: 4 }}>
                      {formatNumber(planet.resources.deuterium)}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
