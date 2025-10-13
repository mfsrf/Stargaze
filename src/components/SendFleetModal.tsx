// SendFleetModal - modal for sending fleets on missions

import React, { useState, useEffect } from "react";
import { View, Text, Modal, TouchableOpacity, ScrollView, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import useThemeStore from "../state/themeStore";
import useGameStore from "../state/gameStore";
import { ShipType, MissionType, FleetComposition, Coordinates } from "../types/game";
import { SHIP_NAMES } from "../utils/gameConstants";

interface SendFleetModalProps {
  visible: boolean;
  onClose: () => void;
  planetId: string;
  targetCoordinates?: Coordinates;
}

export default function SendFleetModal({ visible, onClose, planetId, targetCoordinates }: SendFleetModalProps) {
  const theme = useThemeStore((state) => state.theme);
  const planets = useGameStore((state) => state.player.planets);
  const sendFleet = useGameStore((state) => state.sendFleet);
  
  const planet = planets.find((p) => p.id === planetId);
  
  const [selectedMission, setSelectedMission] = useState<MissionType>(MissionType.Attack);
  const [targetGalaxy, setTargetGalaxy] = useState(targetCoordinates?.galaxy.toString() || "1");
  const [targetSystem, setTargetSystem] = useState(targetCoordinates?.system.toString() || "1");
  const [targetPosition, setTargetPosition] = useState(targetCoordinates?.position.toString() || "1");
  const [selectedShips, setSelectedShips] = useState<Partial<FleetComposition>>({});
  
  // Update target coordinates when prop changes
  useEffect(() => {
    if (targetCoordinates) {
      setTargetGalaxy(targetCoordinates.galaxy.toString());
      setTargetSystem(targetCoordinates.system.toString());
      setTargetPosition(targetCoordinates.position.toString());
    }
  }, [targetCoordinates]);
  
  if (!planet) return null;
  
  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };
  
  const handleShipQuantityChange = (shipType: ShipType, value: string) => {
    const quantity = parseInt(value) || 0;
    const maxAvailable = planet.fleet[shipType] || 0;
    const clampedQuantity = Math.min(Math.max(0, quantity), maxAvailable);
    
    setSelectedShips({
      ...selectedShips,
      [shipType]: clampedQuantity,
    });
  };
  
  const handleSelectAll = (shipType: ShipType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedShips({
      ...selectedShips,
      [shipType]: planet.fleet[shipType] || 0,
    });
  };
  
  const totalSelectedShips = Object.values(selectedShips).reduce((sum, count) => sum + (count || 0), 0);
  
  const canSendFleet = () => {
    if (totalSelectedShips === 0) return false;
    const galaxy = parseInt(targetGalaxy);
    const system = parseInt(targetSystem);
    const position = parseInt(targetPosition);
    
    if (isNaN(galaxy) || isNaN(system) || isNaN(position)) return false;
    if (galaxy < 1 || galaxy > 5) return false;
    if (system < 1 || system > 100) return false;
    if (position < 1 || position > 15) return false;
    
    // Cannot send to same coordinates
    if (
      galaxy === planet.coordinates.galaxy &&
      system === planet.coordinates.system &&
      position === planet.coordinates.position
    ) {
      return false;
    }
    
    return true;
  };
  
  const handleSendFleet = () => {
    if (!canSendFleet()) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    const destination: Coordinates = {
      galaxy: parseInt(targetGalaxy),
      system: parseInt(targetSystem),
      position: parseInt(targetPosition),
    };
    
    // Convert partial fleet composition to full composition
    const fullFleetComposition: FleetComposition = {
      [ShipType.LightFighter]: selectedShips[ShipType.LightFighter] || 0,
      [ShipType.HeavyFighter]: selectedShips[ShipType.HeavyFighter] || 0,
      [ShipType.Cruiser]: selectedShips[ShipType.Cruiser] || 0,
      [ShipType.Battleship]: selectedShips[ShipType.Battleship] || 0,
      [ShipType.Battlecruiser]: selectedShips[ShipType.Battlecruiser] || 0,
      [ShipType.Bomber]: selectedShips[ShipType.Bomber] || 0,
      [ShipType.Destroyer]: selectedShips[ShipType.Destroyer] || 0,
      [ShipType.Deathstar]: selectedShips[ShipType.Deathstar] || 0,
      [ShipType.SmallCargo]: selectedShips[ShipType.SmallCargo] || 0,
      [ShipType.LargeCargo]: selectedShips[ShipType.LargeCargo] || 0,
      [ShipType.ColonyShip]: selectedShips[ShipType.ColonyShip] || 0,
      [ShipType.Recycler]: selectedShips[ShipType.Recycler] || 0,
      [ShipType.EspionageProbe]: selectedShips[ShipType.EspionageProbe] || 0,
    };
    
    sendFleet(planetId, destination, fullFleetComposition, selectedMission);
    
    // Reset and close
    setSelectedShips({});
    onClose();
  };
  
  const missions = [
    { type: MissionType.Attack, icon: "rocket", label: "Attack", color: theme.colors.danger },
    { type: MissionType.Transport, icon: "cube", label: "Transport", color: theme.colors.primary },
    { type: MissionType.Espionage, icon: "eye", label: "Spy", color: theme.colors.secondary },
  ];
  
  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={handleClose}>
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
            height: "90%",
            maxHeight: "90%",
          }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingVertical: 20,
              paddingHorizontal: 20,
              borderBottomWidth: 1,
              borderBottomColor: theme.colors.border,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", flex: 1 }}>
              <View>
                <Text style={{ color: theme.colors.text, fontSize: 20, fontWeight: "bold" }}>
                  Send Fleet
                </Text>
                <Text style={{ color: theme.colors.textSecondary, fontSize: 11, marginTop: 2 }}>
                  From: {planet.name} | Ships: {Object.entries(planet.fleet).filter(([_, count]) => count > 0).length} types
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
            </View>
          </View>
          
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
            {/* Mission Selection */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: "600", marginBottom: 12 }}>
                Mission Type
              </Text>
              <View style={{ flexDirection: "row", gap: 10 }}>
                {missions.map((mission) => (
                  <TouchableOpacity
                    key={mission.type}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setSelectedMission(mission.type);
                    }}
                    activeOpacity={0.7}
                    style={{
                      flex: 1,
                      backgroundColor:
                        selectedMission === mission.type ? mission.color + "20" : theme.colors.card,
                      borderWidth: 2,
                      borderColor:
                        selectedMission === mission.type ? mission.color : theme.colors.border,
                      borderRadius: 12,
                      padding: 12,
                      alignItems: "center",
                    }}
                  >
                    <Ionicons
                      name={mission.icon as keyof typeof Ionicons.glyphMap}
                      size={24}
                      color={selectedMission === mission.type ? mission.color : theme.colors.textSecondary}
                    />
                    <Text
                      style={{
                        color:
                          selectedMission === mission.type ? mission.color : theme.colors.textSecondary,
                        fontSize: 12,
                        fontWeight: "600",
                        marginTop: 6,
                      }}
                    >
                      {mission.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            {/* Target Coordinates */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: "600", marginBottom: 12 }}>
                Target Coordinates
              </Text>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: theme.colors.textSecondary, fontSize: 12, marginBottom: 6 }}>
                    Galaxy
                  </Text>
                  <TextInput
                    style={{
                      backgroundColor: theme.colors.card,
                      color: theme.colors.text,
                      paddingVertical: 12,
                      paddingHorizontal: 12,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: theme.colors.border,
                      fontSize: 14,
                      textAlign: "center",
                    }}
                    value={targetGalaxy}
                    onChangeText={setTargetGalaxy}
                    keyboardType="number-pad"
                    placeholder="1-5"
                    placeholderTextColor={theme.colors.textSecondary}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: theme.colors.textSecondary, fontSize: 12, marginBottom: 6 }}>
                    System
                  </Text>
                  <TextInput
                    style={{
                      backgroundColor: theme.colors.card,
                      color: theme.colors.text,
                      paddingVertical: 12,
                      paddingHorizontal: 12,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: theme.colors.border,
                      fontSize: 14,
                      textAlign: "center",
                    }}
                    value={targetSystem}
                    onChangeText={setTargetSystem}
                    keyboardType="number-pad"
                    placeholder="1-100"
                    placeholderTextColor={theme.colors.textSecondary}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: theme.colors.textSecondary, fontSize: 12, marginBottom: 6 }}>
                    Position
                  </Text>
                  <TextInput
                    style={{
                      backgroundColor: theme.colors.card,
                      color: theme.colors.text,
                      paddingVertical: 12,
                      paddingHorizontal: 12,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: theme.colors.border,
                      fontSize: 14,
                      textAlign: "center",
                    }}
                    value={targetPosition}
                    onChangeText={setTargetPosition}
                    keyboardType="number-pad"
                    placeholder="1-15"
                    placeholderTextColor={theme.colors.textSecondary}
                  />
                </View>
              </View>
            </View>
            
            {/* Ship Selection */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: "600", marginBottom: 12 }}>
                Select Ships ({totalSelectedShips} selected)
              </Text>
              
              {/* Debug Info */}
              <View style={{ 
                backgroundColor: theme.colors.warning + "20", 
                padding: 12, 
                borderRadius: 8, 
                marginBottom: 12,
                borderWidth: 1,
                borderColor: theme.colors.warning + "40"
              }}>
                <Text style={{ color: theme.colors.warning, fontSize: 12, fontWeight: "600", marginBottom: 4 }}>
                  Debug Info:
                </Text>
                <Text style={{ color: theme.colors.text, fontSize: 11 }}>
                  Source Planet: {planet.name}
                </Text>
                <Text style={{ color: theme.colors.text, fontSize: 11 }}>
                  Planet ID: {planetId}
                </Text>
                <Text style={{ color: theme.colors.text, fontSize: 11, marginTop: 4 }}>
                  Total Fleet Entries: {Object.keys(planet.fleet).length}
                </Text>
                <Text style={{ color: theme.colors.text, fontSize: 11 }}>
                  Ships with count {">"} 0: {Object.entries(planet.fleet).filter(([_, count]) => count > 0).length}
                </Text>
                <Text style={{ color: theme.colors.text, fontSize: 11, marginTop: 4 }}>
                  Fleet Data: {JSON.stringify(planet.fleet, null, 2).substring(0, 200)}...
                </Text>
              </View>
              
              {Object.entries(planet.fleet)
                .filter(([_, count]) => count > 0)
                .map(([shipType, maxCount]) => (
                  <View
                    key={shipType}
                    style={{
                      backgroundColor: theme.colors.card,
                      borderRadius: 10,
                      padding: 12,
                      marginBottom: 10,
                      borderWidth: 1,
                      borderColor: theme.colors.border,
                    }}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                      <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: "600", flex: 1 }}>
                        {SHIP_NAMES[shipType as ShipType]}
                      </Text>
                      <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
                        Available: {maxCount}
                      </Text>
                    </View>
                    <View style={{ flexDirection: "row", gap: 8 }}>
                      <TextInput
                        style={{
                          flex: 1,
                          backgroundColor: theme.colors.background,
                          color: theme.colors.text,
                          paddingVertical: 10,
                          paddingHorizontal: 12,
                          borderRadius: 8,
                          borderWidth: 1,
                          borderColor: theme.colors.border,
                          fontSize: 14,
                          textAlign: "center",
                        }}
                        value={selectedShips[shipType as ShipType]?.toString() || ""}
                        onChangeText={(value) => handleShipQuantityChange(shipType as ShipType, value)}
                        keyboardType="number-pad"
                        placeholder="0"
                        placeholderTextColor={theme.colors.textSecondary}
                      />
                      <TouchableOpacity
                        onPress={() => handleSelectAll(shipType as ShipType)}
                        activeOpacity={0.7}
                        style={{
                          backgroundColor: theme.colors.primary + "20",
                          paddingVertical: 10,
                          paddingHorizontal: 16,
                          borderRadius: 8,
                        }}
                      >
                        <Text style={{ color: theme.colors.primary, fontSize: 12, fontWeight: "600" }}>
                          All
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              
              {Object.entries(planet.fleet).filter(([_, count]) => count > 0).length === 0 && (
                <View style={{
                  backgroundColor: theme.colors.danger + "20",
                  padding: 16,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: theme.colors.danger + "40",
                  alignItems: "center",
                }}>
                  <Ionicons name="alert-circle" size={32} color={theme.colors.danger} />
                  <Text style={{ color: theme.colors.danger, fontSize: 14, fontWeight: "600", marginTop: 8, textAlign: "center" }}>
                    No ships available on {planet.name}
                  </Text>
                  <Text style={{ color: theme.colors.text, fontSize: 12, marginTop: 4, textAlign: "center" }}>
                    Build ships in the Shipyard or select a different planet
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
          
          {/* Send Button */}
          <View style={{ padding: 20, borderTopWidth: 1, borderTopColor: theme.colors.border }}>
            <TouchableOpacity
              onPress={handleSendFleet}
              disabled={!canSendFleet()}
              activeOpacity={0.7}
              style={{
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              {canSendFleet() ? (
                <LinearGradient
                  colors={[theme.colors.primary, theme.colors.secondary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    paddingVertical: 16,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "700" }}>
                    Send {totalSelectedShips} Ships
                  </Text>
                </LinearGradient>
              ) : (
                <View
                  style={{
                    backgroundColor: theme.colors.border,
                    paddingVertical: 16,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: theme.colors.textSecondary, fontSize: 16, fontWeight: "600" }}>
                    {totalSelectedShips === 0 ? "Select Ships" : "Invalid Coordinates"}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
