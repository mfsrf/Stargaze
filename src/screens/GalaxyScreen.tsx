// GalaxyScreen - explore and interact with the universe

import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import useThemeStore from "../state/themeStore";
import useGameStore from "../state/gameStore";
import PlanetDetailModal from "../components/PlanetDetailModal";
import SendFleetModal from "../components/SendFleetModal";
import { Planet, ShipType, Coordinates } from "../types/game";
import { generateSystemView, getPlanetTypeColor } from "../utils/galaxyManager";
import { formatNumber } from "../utils/gameFormulas";

export default function GalaxyScreen() {
  const theme = useThemeStore((state) => state.theme);
  const playerPlanets = useGameStore((state) => state.player.planets);
  const selectedPlanetId = useGameStore((state) => state.selectedPlanetId);
  const aiPlayers = useGameStore((state) => state.aiPlayers);
  const scoutedPlanets = useGameStore((state) => state.player.scoutedPlanets || {});
  const colonizePlanet = useGameStore((state) => state.colonizePlanet);
  
  // Start at first player planet location
  const firstPlanet = playerPlanets[0];
  const [selectedGalaxy, setSelectedGalaxy] = useState(firstPlanet?.coordinates.galaxy || 1);
  const [selectedSystem, setSelectedSystem] = useState(firstPlanet?.coordinates.system || 1);
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null);
  const [isPlanetModalVisible, setIsPlanetModalVisible] = useState(false);
  const [colonizeModalVisible, setColonizeModalVisible] = useState(false);
  const [colonizeTarget, setColonizeTarget] = useState<Coordinates | null>(null);
  const [attackModalVisible, setAttackModalVisible] = useState(false);
  const [attackTargetCoords, setAttackTargetCoords] = useState<Coordinates | null>(null);
  
  // Get all AI planets
  const aiPlanets = aiPlayers.flatMap((ai) => ai.planets);
  
  // Check if player has colony ship
  const hasColonyShip = playerPlanets.some((p) => p.fleet[ShipType.ColonyShip] > 0);
  
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
  
  const handleColonizeClick = (coordinates: Coordinates) => {
    if (!hasColonyShip) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setColonizeTarget(coordinates);
    setColonizeModalVisible(true);
  };
  
  const handleConfirmColonize = () => {
    if (!colonizeTarget) return;
    
    const success = colonizePlanet(colonizeTarget);
    
    if (success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setColonizeModalVisible(false);
      setColonizeTarget(null);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };
  
  const handleAttackClick = (targetCoords: Coordinates) => {
    // Use first player planet as default source
    if (playerPlanets.length === 0) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setAttackTargetCoords(targetCoords);
    setAttackModalVisible(true);
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
      
      {/* Send Fleet / Attack Modal */}
      {playerPlanets.length > 0 && attackTargetCoords && selectedPlanetId && (
        <SendFleetModal
          visible={attackModalVisible}
          onClose={() => {
            setAttackModalVisible(false);
            setAttackTargetCoords(null);
          }}
          planetId={selectedPlanetId}
          targetCoordinates={attackTargetCoords}
        />
      )}
      
      {/* Colonize Confirmation Modal */}
      <Modal
        visible={colonizeModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setColonizeModalVisible(false)}
      >
        <View style={{ 
          flex: 1, 
          backgroundColor: "rgba(0,0,0,0.7)", 
          justifyContent: "center", 
          alignItems: "center",
          padding: 20,
        }}>
          <View style={{ 
            backgroundColor: theme.colors.card, 
            borderRadius: 16, 
            padding: 24,
            width: "100%",
            maxWidth: 400,
          }}>
            <View style={{ alignItems: "center", marginBottom: 20 }}>
              <View style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: theme.colors.success + "20",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 12,
              }}>
                <Ionicons name="planet" size={32} color={theme.colors.success} />
              </View>
              <Text style={{ color: theme.colors.text, fontSize: 20, fontWeight: "bold" }}>
                Colonize Planet?
              </Text>
            </View>
            
            {colonizeTarget && (
              <View style={{ marginBottom: 20 }}>
                <Text style={{ color: theme.colors.textSecondary, fontSize: 14, textAlign: "center", marginBottom: 12 }}>
                  Colonize position [{colonizeTarget.galaxy}:{colonizeTarget.system}:{colonizeTarget.position}]
                </Text>
                <View style={{
                  backgroundColor: theme.colors.background,
                  padding: 12,
                  borderRadius: 8,
                  marginBottom: 12,
                }}>
                  <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                    <Ionicons name="information-circle" size={16} color={theme.colors.primary} />
                    <Text style={{ color: theme.colors.text, fontSize: 13, fontWeight: "600", marginLeft: 8 }}>
                      Colonization Cost:
                    </Text>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Ionicons name="rocket" size={14} color={theme.colors.textSecondary} />
                    <Text style={{ color: theme.colors.textSecondary, fontSize: 12, marginLeft: 6 }}>
                      1 Colony Ship (will be consumed)
                    </Text>
                  </View>
                </View>
                <Text style={{ color: theme.colors.textSecondary, fontSize: 12, textAlign: "center", lineHeight: 16 }}>
                  A new colony will be established with basic infrastructure. The colony ship will be consumed in the process.
                </Text>
              </View>
            )}
            
            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setColonizeModalVisible(false);
                  setColonizeTarget(null);
                }}
                activeOpacity={0.7}
                style={{
                  flex: 1,
                  backgroundColor: theme.colors.border,
                  paddingVertical: 14,
                  borderRadius: 10,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: theme.colors.text, fontSize: 15, fontWeight: "600" }}>
                  Cancel
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={handleConfirmColonize}
                activeOpacity={0.7}
                style={{
                  flex: 1,
                  backgroundColor: theme.colors.success,
                  paddingVertical: 14,
                  borderRadius: 10,
                  alignItems: "center",
                  shadowColor: theme.colors.success,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                <Text style={{ color: "#FFFFFF", fontSize: 15, fontWeight: "700" }}>
                  Colonize
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
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
        
        {/* Colony Ship Status */}
        {hasColonyShip ? (
          <View style={{
            backgroundColor: theme.colors.success + "20",
            paddingVertical: 10,
            paddingHorizontal: 12,
            borderRadius: 8,
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 16,
            borderWidth: 1,
            borderColor: theme.colors.success + "40",
          }}>
            <Ionicons name="checkmark-circle" size={18} color={theme.colors.success} style={{ marginRight: 8 }} />
            <Text style={{ color: theme.colors.success, fontSize: 13, fontWeight: "600", flex: 1 }}>
              Colony Ship Available - Click empty positions to colonize
            </Text>
          </View>
        ) : (
          <View style={{
            backgroundColor: theme.colors.warning + "20",
            paddingVertical: 10,
            paddingHorizontal: 12,
            borderRadius: 8,
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 16,
            borderWidth: 1,
            borderColor: theme.colors.warning + "40",
          }}>
            <Ionicons name="alert-circle" size={18} color={theme.colors.warning} style={{ marginRight: 8 }} />
            <Text style={{ color: theme.colors.warning, fontSize: 13, fontWeight: "600", flex: 1 }}>
              Build a Colony Ship to colonize new planets
            </Text>
          </View>
        )}
        
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
          
          // Check if this empty position has been scouted
          const coordKey = `${position.coordinates.galaxy}:${position.coordinates.system}:${position.coordinates.position}`;
          const scoutReport = !isOccupied ? scoutedPlanets[coordKey] : null;
          const hasScoutData = scoutReport !== undefined;
          
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
                  : hasScoutData
                  ? theme.colors.primary + "60"
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
                      backgroundColor: isOccupied ? planetTypeColor + "30" : hasScoutData ? theme.colors.primary + "20" : theme.colors.border,
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 12,
                    }}
                  >
                    <Ionicons
                      name={isOccupied ? "planet" : hasScoutData ? "planet-outline" : "ellipse-outline"}
                      size={24}
                      color={isOccupied ? planetTypeColor : hasScoutData ? theme.colors.primary : theme.colors.textSecondary}
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
                    ) : hasScoutData && scoutReport ? (
                      <>
                        <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
                          {scoutReport.planetName}
                        </Text>
                        <Text style={{ color: theme.colors.primary, fontSize: 11, marginTop: 2 }}>
                          🧭 Scouted • {scoutReport.maxFields} fields • {scoutReport.temperature}°C
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
                      onPress={(e) => {
                        e.stopPropagation();
                        handleAttackClick(position.coordinates);
                      }}
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
                      onPress={(e) => {
                        e.stopPropagation();
                        handleColonizeClick(position.coordinates);
                      }}
                      disabled={!hasColonyShip}
                      activeOpacity={0.7}
                      style={{
                        backgroundColor: hasColonyShip ? theme.colors.success + "20" : theme.colors.border,
                        padding: 8,
                        borderRadius: 8,
                        opacity: hasColonyShip ? 1 : 0.5,
                      }}
                    >
                      <Ionicons 
                        name={hasColonyShip ? "add-circle" : "lock-closed"} 
                        size={18} 
                        color={hasColonyShip ? theme.colors.success : theme.colors.textSecondary} 
                      />
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
                        handleAttackClick(planet.coordinates);
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
