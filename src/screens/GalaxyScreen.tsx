// GalaxyScreen - explore and interact with the universe

import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import useThemeStore from "../state/themeStore";
import useGameStore from "../state/gameStore";
import PlanetDetailModal from "../components/PlanetDetailModal";
import { Planet } from "../types/game";
import { generateSystemView, getPlanetTypeColor } from "../utils/galaxyManager";
import { formatNumber } from "../utils/gameFormulas";

export default function GalaxyScreen() {
  const theme = useThemeStore((state) => state.theme);
  const playerPlanets = useGameStore((state) => state.player.planets);
  const aiPlayers = useGameStore((state) => state.aiPlayers);
  
  // Start at first player planet location
  const firstPlanet = playerPlanets[0];
  const [selectedGalaxy, setSelectedGalaxy] = useState(firstPlanet?.coordinates.galaxy || 1);
  const [selectedSystem, setSelectedSystem] = useState(firstPlanet?.coordinates.system || 1);
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null);
  const [isPlanetModalVisible, setIsPlanetModalVisible] = useState(false);
  
  // Get all AI planets
  const aiPlanets = aiPlayers.flatMap((ai) => ai.planets);
  
  // Generate system view
  const systemPositions = generateSystemView(
    selectedGalaxy,
    selectedSystem,
    playerPlanets,
    aiPlanets
  );
  
  const handleGalaxyChange = (direction: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedGalaxy((prev) => {
      const newGalaxy = prev + direction;
      if (newGalaxy < 1) return 5;
      if (newGalaxy > 5) return 1;
      return newGalaxy;
    });
  };
  
  const handleSystemChange = (direction: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedSystem((prev) => {
      const newSystem = prev + direction;
      if (newSystem < 1) return 100;
      if (newSystem > 100) return 1;
      return newSystem;
    });
  };
  
  const handlePlanetClick = (planet: Planet, isPlayer: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedPlanet(planet);
    setIsPlanetModalVisible(true);
  };
  
  const handleFindRandomEnemy = () => {
    if (aiPlanets.length === 0) return;
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const randomEnemy = aiPlanets[Math.floor(Math.random() * aiPlanets.length)];
    setSelectedGalaxy(randomEnemy.coordinates.galaxy);
    setSelectedSystem(randomEnemy.coordinates.system);
  };
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={["top"]}>
      {/* Planet Detail Modal */}
      <PlanetDetailModal
        visible={isPlanetModalVisible}
        planet={selectedPlanet}
        onClose={() => setIsPlanetModalVisible(false)}
        isPlayerPlanet={selectedPlanet ? playerPlanets.some(p => p.id === selectedPlanet.id) : false}
      />
      
      {/* Header */}
      <View
        style={{
          backgroundColor: theme.colors.card,
          paddingVertical: 16,
          paddingHorizontal: 16,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        }}
      >
        <Text style={{ color: theme.colors.text, fontSize: 24, fontWeight: "bold", marginBottom: 16 }}>
          Galaxy Explorer
        </Text>
        
        {/* Find Random Enemy Button */}
        {aiPlanets.length > 0 && (
          <TouchableOpacity
            onPress={handleFindRandomEnemy}
            activeOpacity={0.7}
            style={{
              backgroundColor: theme.colors.danger,
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: 10,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <Ionicons name="search" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={{ color: "#FFFFFF", fontSize: 15, fontWeight: "700" }}>
              Find Random Enemy
            </Text>
          </TouchableOpacity>
        )}
        
        {/* Galaxy Selector */}
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 14, width: 60 }}>
            Galaxy:
          </Text>
          <TouchableOpacity
            onPress={() => handleGalaxyChange(-1)}
            activeOpacity={0.7}
            style={{
              backgroundColor: theme.colors.inputBackground,
              padding: 8,
              borderRadius: 8,
            }}
          >
            <Ionicons name="chevron-back" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
          <View
            style={{
              backgroundColor: theme.colors.primary + "20",
              paddingVertical: 8,
              paddingHorizontal: 20,
              marginHorizontal: 8,
              borderRadius: 8,
              minWidth: 80,
              alignItems: "center",
            }}
          >
            <Text style={{ color: theme.colors.primary, fontSize: 18, fontWeight: "bold" }}>
              {selectedGalaxy}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => handleGalaxyChange(1)}
            activeOpacity={0.7}
            style={{
              backgroundColor: theme.colors.inputBackground,
              padding: 8,
              borderRadius: 8,
            }}
          >
            <Ionicons name="chevron-forward" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
        
        {/* System Selector */}
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 14, width: 60 }}>
            System:
          </Text>
          <TouchableOpacity
            onPress={() => handleSystemChange(-1)}
            activeOpacity={0.7}
            style={{
              backgroundColor: theme.colors.inputBackground,
              padding: 8,
              borderRadius: 8,
            }}
          >
            <Ionicons name="chevron-back" size={20} color={theme.colors.secondary} />
          </TouchableOpacity>
          <View
            style={{
              backgroundColor: theme.colors.secondary + "20",
              paddingVertical: 8,
              paddingHorizontal: 20,
              marginHorizontal: 8,
              borderRadius: 8,
              minWidth: 80,
              alignItems: "center",
            }}
          >
            <Text style={{ color: theme.colors.secondary, fontSize: 18, fontWeight: "bold" }}>
              {selectedSystem}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => handleSystemChange(1)}
            activeOpacity={0.7}
            style={{
              backgroundColor: theme.colors.inputBackground,
              padding: 8,
              borderRadius: 8,
            }}
          >
            <Ionicons name="chevron-forward" size={20} color={theme.colors.secondary} />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* System View */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16 }}
      >
        <Text style={{ color: theme.colors.textSecondary, fontSize: 14, marginBottom: 12 }}>
          System [{selectedGalaxy}:{selectedSystem}]
        </Text>
        
        {systemPositions.map((position) => {
          const isPlayerPlanet = position.ownerId === "player";
          const isOccupied = position.planet !== null;
          const planetTypeColor = isOccupied && position.planet ? getPlanetTypeColor(position.planet.type) : theme.colors.textSecondary;
          
          return (
            <TouchableOpacity
              key={`${position.coordinates.galaxy}-${position.coordinates.system}-${position.coordinates.position}`}
              onPress={() => {
                if (isOccupied && position.planet) {
                  handlePlanetClick(position.planet, isPlayerPlanet);
                }
              }}
              disabled={!isOccupied}
              activeOpacity={0.7}
              style={{
                backgroundColor: theme.colors.card,
                borderRadius: 12,
                padding: 14,
                marginBottom: 10,
                borderWidth: 1,
                borderColor: isPlayerPlanet
                  ? theme.colors.success
                  : isOccupied
                  ? planetTypeColor
                  : theme.colors.border,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: isOccupied ? planetTypeColor + "30" : theme.colors.border,
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 12,
                    }}
                  >
                    <Ionicons
                      name={isOccupied ? "planet" : "ellipse-outline"}
                      size={24}
                      color={isOccupied ? planetTypeColor : theme.colors.textSecondary}
                    />
                  </View>
                  
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: "600" }}>
                      Position {position.coordinates.position}
                    </Text>
                    {isOccupied ? (
                      <>
                        <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
                          {position.planet?.name}
                        </Text>
                        <Text
                          style={{
                            color: isPlayerPlanet ? theme.colors.success : theme.colors.danger,
                            fontSize: 11,
                            marginTop: 2,
                          }}
                        >
                          {position.playerName} • {position.planet?.maxFields} fields
                        </Text>
                      </>
                    ) : (
                      <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
                        Empty position
                      </Text>
                    )}
                  </View>
                </View>
                
                {/* Action Buttons */}
                <View style={{ flexDirection: "row", gap: 8 }}>
                  {isOccupied && !isPlayerPlanet && (
                    <TouchableOpacity
                      activeOpacity={0.7}
                      style={{
                        backgroundColor: theme.colors.danger + "20",
                        padding: 8,
                        borderRadius: 8,
                      }}
                    >
                      <Ionicons name="rocket" size={18} color={theme.colors.danger} />
                    </TouchableOpacity>
                  )}
                  {!isOccupied && (
                    <TouchableOpacity
                      activeOpacity={0.7}
                      style={{
                        backgroundColor: theme.colors.success + "20",
                        padding: 8,
                        borderRadius: 8,
                      }}
                    >
                      <Ionicons name="add-circle" size={18} color={theme.colors.success} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
              
              {/* Resources preview for player planets */}
              {isPlayerPlanet && position.planet && (
                <View
                  style={{
                    flexDirection: "row",
                    marginTop: 10,
                    paddingTop: 10,
                    borderTopWidth: 1,
                    borderTopColor: theme.colors.border,
                    gap: 12,
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Ionicons name="hammer" size={12} color={theme.colors.metal} />
                    <Text style={{ color: theme.colors.textSecondary, fontSize: 11, marginLeft: 4 }}>
                      {formatNumber(position.planet.resources.metal)}
                    </Text>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Ionicons name="diamond" size={12} color={theme.colors.crystal} />
                    <Text style={{ color: theme.colors.textSecondary, fontSize: 11, marginLeft: 4 }}>
                      {formatNumber(position.planet.resources.crystal)}
                    </Text>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Ionicons name="water" size={12} color={theme.colors.deuterium} />
                    <Text style={{ color: theme.colors.textSecondary, fontSize: 11, marginLeft: 4 }}>
                      {formatNumber(position.planet.resources.deuterium)}
                    </Text>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
        
        {/* Quick navigation to player planets */}
        <View style={{ marginTop: 20 }}>
          <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: "bold", marginBottom: 12 }}>
            Your Planets
          </Text>
          {playerPlanets.map((planet) => (
            <TouchableOpacity
              key={planet.id}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedGalaxy(planet.coordinates.galaxy);
                setSelectedSystem(planet.coordinates.system);
              }}
              activeOpacity={0.7}
              style={{
                backgroundColor: theme.colors.card,
                borderRadius: 10,
                padding: 12,
                marginBottom: 8,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                borderWidth: 1,
                borderColor: theme.colors.success,
              }}
            >
              <View>
                <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: "600" }}>
                  {planet.name}
                </Text>
                <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
                  [{planet.coordinates.galaxy}:{planet.coordinates.system}:{planet.coordinates.position}]
                </Text>
              </View>
              <Ionicons name="navigate" size={20} color={theme.colors.success} />
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Enemy Locator */}
        <View style={{ marginTop: 20, marginBottom: 20 }}>
          <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: "bold", marginBottom: 12 }}>
            Enemy Planets
          </Text>
          {aiPlanets.length === 0 ? (
            <View
              style={{
                backgroundColor: theme.colors.card,
                borderRadius: 10,
                padding: 16,
                alignItems: "center",
              }}
            >
              <Ionicons name="shield-checkmark" size={32} color={theme.colors.success} />
              <Text style={{ color: theme.colors.textSecondary, fontSize: 14, marginTop: 8 }}>
                No enemies detected in the galaxy
              </Text>
            </View>
          ) : (
            <>
              {aiPlanets.map((planet) => (
                <TouchableOpacity
                  key={planet.id}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedGalaxy(planet.coordinates.galaxy);
                    setSelectedSystem(planet.coordinates.system);
                  }}
                  activeOpacity={0.7}
                  style={{
                    backgroundColor: theme.colors.card,
                    borderRadius: 10,
                    padding: 12,
                    marginBottom: 8,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderWidth: 1,
                    borderColor: theme.colors.danger,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
                      <Ionicons name="skull" size={16} color={theme.colors.danger} style={{ marginRight: 6 }} />
                      <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: "600" }}>
                        {planet.name}
                      </Text>
                    </View>
                    <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
                      [{planet.coordinates.galaxy}:{planet.coordinates.system}:{planet.coordinates.position}]
                    </Text>
                    <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
                      <Ionicons name="locate" size={12} color={theme.colors.textSecondary} style={{ marginRight: 4 }} />
                      <Text style={{ color: theme.colors.textSecondary, fontSize: 11 }}>
                        {planet.maxFields} fields
                      </Text>
                    </View>
                  </View>
                  <View style={{ alignItems: "center" }}>
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        // TODO: Open attack modal
                      }}
                      activeOpacity={0.7}
                      style={{
                        backgroundColor: theme.colors.danger + "20",
                        padding: 10,
                        borderRadius: 8,
                        marginBottom: 6,
                      }}
                    >
                      <Ionicons name="rocket" size={20} color={theme.colors.danger} />
                    </TouchableOpacity>
                    <Ionicons name="navigate" size={16} color={theme.colors.danger} />
                  </View>
                </TouchableOpacity>
              ))}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
