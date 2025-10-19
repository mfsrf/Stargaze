// SendFleetModal - modal for sending fleets on missions

import React, { useState, useEffect } from "react";
import { View, Text, Modal, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import useThemeStore from "../state/themeStore";
import useGameStore from "../state/gameStore";
import { ShipType, MissionType, FleetComposition, Coordinates } from "../types/game";
import { SHIP_NAMES, SHIP_STATS } from "../utils/gameConstants";
import { formatNumber } from "../utils/gameFormulas";

interface SendFleetModalProps {
  visible: boolean;
  onClose: () => void;
  planetId: string;
  targetCoordinates?: Coordinates;
}

export default function SendFleetModal({ visible, onClose, planetId, targetCoordinates }: SendFleetModalProps) {
  const theme = useThemeStore((state) => state.theme);
  const planets = useGameStore((state) => state.player.planets);
  const aiPlayers = useGameStore((state) => state.aiPlayers);
  const scoutedPlanets = useGameStore((state) => state.player.scoutedPlanets || {});
  const sendFleet = useGameStore((state) => state.sendFleet);
  
  const planet = planets.find((p) => p.id === planetId);
  
  // Determine target context
  const coordKey = targetCoordinates ? `${targetCoordinates.galaxy}:${targetCoordinates.system}:${targetCoordinates.position}` : "";
  const destIsPlayerPlanet = !!planets.find(
    (p) => p.coordinates.galaxy === (targetCoordinates?.galaxy || 0) &&
           p.coordinates.system === (targetCoordinates?.system || 0) &&
           p.coordinates.position === (targetCoordinates?.position || 0)
  );
  const destIsAIPlanet = aiPlayers.some((ai) =>
    ai.planets.some(
      (p) => p.coordinates.galaxy === (targetCoordinates?.galaxy || 0) &&
             p.coordinates.system === (targetCoordinates?.system || 0) &&
             p.coordinates.position === (targetCoordinates?.position || 0)
    )
  );
  const destIsOccupied = destIsPlayerPlanet || destIsAIPlanet;
  const destIsScouted = coordKey ? !!scoutedPlanets[coordKey] : false;
  
  const [selectedMission, setSelectedMission] = useState<MissionType>(destIsOccupied ? MissionType.Attack : MissionType.Scout);
  
  useEffect(() => {
    if (!targetCoordinates) return;
    if (destIsOccupied) setSelectedMission(MissionType.Attack);
    else setSelectedMission(MissionType.Scout);
  }, [coordKey]);
  const [targetGalaxy, setTargetGalaxy] = useState(targetCoordinates?.galaxy.toString() || "1");
  const [targetSystem, setTargetSystem] = useState(targetCoordinates?.system.toString() || "1");
  const [targetPosition, setTargetPosition] = useState(targetCoordinates?.position.toString() || "1");
  const [selectedShips, setSelectedShips] = useState<Partial<FleetComposition>>({});
  const [cargoMetal, setCargoMetal] = useState("0");
  const [cargoCrystal, setCargoCrystal] = useState("0");
  const [cargoDeuterium, setCargoDeuterium] = useState("0");
  
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
  
  // Calculate total cargo capacity
  const totalCargoCapacity = Object.entries(selectedShips).reduce((total, [shipType, count]) => {
    if (count > 0) {
      const cargo = SHIP_STATS[shipType as ShipType]?.cargo || 0;
      return total + (cargo * count);
    }
    return total;
  }, 0);
  
  // Calculate total cargo selected
  const totalCargoSelected = (parseInt(cargoMetal) || 0) + (parseInt(cargoCrystal) || 0) + (parseInt(cargoDeuterium) || 0);
  
  // Check cargo validation
  const metalAmount = parseInt(cargoMetal) || 0;
  const crystalAmount = parseInt(cargoCrystal) || 0;
  const deuteriumAmount = parseInt(cargoDeuterium) || 0;
  const hasEnoughMetal = metalAmount <= planet.resources.metal;
  const hasEnoughCrystal = crystalAmount <= planet.resources.crystal;
  const hasEnoughDeuterium = deuteriumAmount <= planet.resources.deuterium;
  const cargoFitsInCapacity = totalCargoSelected <= totalCargoCapacity;
  
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
    
    // Validate cargo if transport mission
    if (selectedMission === MissionType.Transport) {
      if (!hasEnoughMetal || !hasEnoughCrystal || !hasEnoughDeuterium) return false;
      if (!cargoFitsInCapacity) return false;
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
      [ShipType.Scout]: selectedShips[ShipType.Scout] || 0,
    };
    
    // Prepare cargo for transport missions
    const cargo = selectedMission === MissionType.Transport ? {
      metal: parseInt(cargoMetal) || 0,
      crystal: parseInt(cargoCrystal) || 0,
      deuterium: parseInt(cargoDeuterium) || 0,
      energy: 0,
    } : undefined;
    
    sendFleet(planetId, destination, fullFleetComposition, selectedMission, cargo);
    
    // Reset and close
    setSelectedShips({});
    setCargoMetal("0");
    setCargoCrystal("0");
    setCargoDeuterium("0");
    onClose();
  };
  
  const missions = [
    { type: MissionType.Attack, icon: "rocket", label: "Attack", color: theme.colors.danger, disabled: !destIsOccupied },
    { type: MissionType.Transport, icon: "cube", label: "Transport", color: theme.colors.primary, disabled: !destIsOccupied },
    { type: MissionType.Espionage, icon: "eye", label: "Spy", color: theme.colors.secondary, disabled: !destIsOccupied },
    { type: MissionType.Scout, icon: "compass", label: "Scout", color: theme.colors.success, disabled: destIsOccupied },
    { type: MissionType.Hold, icon: "home", label: "Transfer", color: theme.colors.success, disabled: !destIsPlayerPlanet },
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
                <Text style={{ color: theme.colors.textSecondary, fontSize: 12, marginTop: 2 }}>
                  From: {planet.name}
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
          
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }} keyboardShouldPersistTaps="handled">
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
                        if (mission.disabled) return;
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setSelectedMission(mission.type);
                      }}
                      activeOpacity={0.7}
                      disabled={mission.disabled}
                      style={{
                        flex: 1,
                        backgroundColor:
                          mission.disabled ? theme.colors.border : (selectedMission === mission.type ? mission.color + "20" : theme.colors.card),
                        borderWidth: 2,
                        borderColor:
                          mission.disabled ? theme.colors.border : (selectedMission === mission.type ? mission.color : theme.colors.border),
                        borderRadius: 12,
                        padding: 12,
                        alignItems: "center",
                        opacity: mission.disabled ? 0.5 : 1,
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
                          mission.disabled ? theme.colors.textSecondary : (selectedMission === mission.type ? mission.color : theme.colors.textSecondary),
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
            
            {/* Cargo Selection - Only show for Transport mission */}
            {selectedMission === MissionType.Transport && (
              <View style={{ marginBottom: 20 }}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: "600" }}>
                    Resources to Transport
                  </Text>
                  <View style={{
                    backgroundColor: cargoFitsInCapacity ? theme.colors.primary + "20" : theme.colors.danger + "20",
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 6,
                    borderWidth: 1,
                    borderColor: cargoFitsInCapacity ? "transparent" : theme.colors.danger + "40",
                  }}>
                    <Text style={{ color: cargoFitsInCapacity ? theme.colors.primary : theme.colors.danger, fontSize: 11, fontWeight: "700" }}>
                      {totalCargoSelected.toLocaleString()} / {formatNumber(totalCargoCapacity)}
                    </Text>
                  </View>
                </View>
                
                {!cargoFitsInCapacity && (
                  <View style={{
                    backgroundColor: theme.colors.danger + "20",
                    padding: 12,
                    borderRadius: 8,
                    marginBottom: 12,
                    borderWidth: 1,
                    borderColor: theme.colors.danger + "40",
                  }}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <Ionicons name="alert-circle" size={16} color={theme.colors.danger} />
                      <Text style={{ color: theme.colors.danger, fontSize: 12, fontWeight: "600", marginLeft: 6 }}>
                        Cargo exceeds ship capacity
                      </Text>
                    </View>
                  </View>
                )}
                
                {totalCargoCapacity === 0 && (
                  <View style={{
                    backgroundColor: theme.colors.warning + "20",
                    padding: 12,
                    borderRadius: 8,
                    marginBottom: 12,
                    borderWidth: 1,
                    borderColor: theme.colors.warning + "40",
                  }}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <Ionicons name="alert-circle" size={16} color={theme.colors.warning} />
                      <Text style={{ color: theme.colors.warning, fontSize: 12, fontWeight: "600", marginLeft: 6 }}>
                        Select cargo ships to transport resources
                      </Text>
                    </View>
                  </View>
                )}
                
                {/* Metal */}
                <View style={{ marginBottom: 12 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <Ionicons name="hammer" size={16} color={theme.colors.metal} style={{ marginRight: 6 }} />
                      <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: "600" }}>
                        Metal
                      </Text>
                    </View>
                    <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
                      Available: {formatNumber(planet.resources.metal)}
                    </Text>
                  </View>
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    <TextInput
                      style={{
                        flex: 1,
                        backgroundColor: theme.colors.card,
                        color: hasEnoughMetal ? theme.colors.text : theme.colors.danger,
                        paddingVertical: 10,
                        paddingHorizontal: 12,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: hasEnoughMetal ? theme.colors.border : theme.colors.danger,
                        fontSize: 14,
                        textAlign: "center",
                      }}
                      value={cargoMetal}
                      onChangeText={setCargoMetal}
                      keyboardType="number-pad"
                      placeholder="0"
                      placeholderTextColor={theme.colors.textSecondary}
                    />
                    <TouchableOpacity
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        const maxMetal = Math.min(Math.floor(planet.resources.metal), totalCargoCapacity);
                        setCargoMetal(maxMetal.toString());
                      }}
                      activeOpacity={0.7}
                      disabled={totalCargoCapacity === 0}
                      style={{
                        backgroundColor: totalCargoCapacity > 0 ? theme.colors.primary + "20" : theme.colors.border,
                        paddingVertical: 10,
                        paddingHorizontal: 16,
                        borderRadius: 8,
                        opacity: totalCargoCapacity > 0 ? 1 : 0.5,
                      }}
                    >
                      <Text style={{ color: totalCargoCapacity > 0 ? theme.colors.primary : theme.colors.textSecondary, fontSize: 12, fontWeight: "600" }}>
                        Max
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
                
                {/* Crystal */}
                <View style={{ marginBottom: 12 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <Ionicons name="diamond" size={16} color={theme.colors.crystal} style={{ marginRight: 6 }} />
                      <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: "600" }}>
                        Crystal
                      </Text>
                    </View>
                    <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
                      Available: {formatNumber(planet.resources.crystal)}
                    </Text>
                  </View>
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    <TextInput
                      style={{
                        flex: 1,
                        backgroundColor: theme.colors.card,
                        color: hasEnoughCrystal ? theme.colors.text : theme.colors.danger,
                        paddingVertical: 10,
                        paddingHorizontal: 12,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: hasEnoughCrystal ? theme.colors.border : theme.colors.danger,
                        fontSize: 14,
                        textAlign: "center",
                      }}
                      value={cargoCrystal}
                      onChangeText={setCargoCrystal}
                      keyboardType="number-pad"
                      placeholder="0"
                      placeholderTextColor={theme.colors.textSecondary}
                    />
                    <TouchableOpacity
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        const metalAmount = parseInt(cargoMetal) || 0;
                        const remainingCapacity = totalCargoCapacity - metalAmount;
                        const maxCrystal = Math.min(Math.floor(planet.resources.crystal), remainingCapacity);
                        setCargoCrystal(Math.max(0, maxCrystal).toString());
                      }}
                      activeOpacity={0.7}
                      disabled={totalCargoCapacity === 0}
                      style={{
                        backgroundColor: totalCargoCapacity > 0 ? theme.colors.primary + "20" : theme.colors.border,
                        paddingVertical: 10,
                        paddingHorizontal: 16,
                        borderRadius: 8,
                        opacity: totalCargoCapacity > 0 ? 1 : 0.5,
                      }}
                    >
                      <Text style={{ color: totalCargoCapacity > 0 ? theme.colors.primary : theme.colors.textSecondary, fontSize: 12, fontWeight: "600" }}>
                        Max
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
                
                {/* Deuterium */}
                <View style={{ marginBottom: 12 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <Ionicons name="water" size={16} color={theme.colors.deuterium} style={{ marginRight: 6 }} />
                      <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: "600" }}>
                        Deuterium
                      </Text>
                    </View>
                    <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
                      Available: {formatNumber(planet.resources.deuterium)}
                    </Text>
                  </View>
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    <TextInput
                      style={{
                        flex: 1,
                        backgroundColor: theme.colors.card,
                        color: hasEnoughDeuterium ? theme.colors.text : theme.colors.danger,
                        paddingVertical: 10,
                        paddingHorizontal: 12,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: hasEnoughDeuterium ? theme.colors.border : theme.colors.danger,
                        fontSize: 14,
                        textAlign: "center",
                      }}
                      value={cargoDeuterium}
                      onChangeText={setCargoDeuterium}
                      keyboardType="number-pad"
                      placeholder="0"
                      placeholderTextColor={theme.colors.textSecondary}
                    />
                    <TouchableOpacity
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        const metalAmount = parseInt(cargoMetal) || 0;
                        const crystalAmount = parseInt(cargoCrystal) || 0;
                        const remainingCapacity = totalCargoCapacity - metalAmount - crystalAmount;
                        const maxDeuterium = Math.min(Math.floor(planet.resources.deuterium), remainingCapacity);
                        setCargoDeuterium(Math.max(0, maxDeuterium).toString());
                      }}
                      activeOpacity={0.7}
                      disabled={totalCargoCapacity === 0}
                      style={{
                        backgroundColor: totalCargoCapacity > 0 ? theme.colors.primary + "20" : theme.colors.border,
                        paddingVertical: 10,
                        paddingHorizontal: 16,
                        borderRadius: 8,
                        opacity: totalCargoCapacity > 0 ? 1 : 0.5,
                      }}
                    >
                      <Text style={{ color: totalCargoCapacity > 0 ? theme.colors.primary : theme.colors.textSecondary, fontSize: 12, fontWeight: "600" }}>
                        Max
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
            </ScrollView>
          </KeyboardAvoidingView>
            
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
                    {totalSelectedShips === 0 
                      ? "Select Ships" 
                      : selectedMission === MissionType.Transport && !cargoFitsInCapacity
                      ? "Cargo Exceeds Capacity"
                      : selectedMission === MissionType.Transport && (!hasEnoughMetal || !hasEnoughCrystal || !hasEnoughDeuterium)
                      ? "Not Enough Resources"
                      : "Invalid Coordinates"}
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
