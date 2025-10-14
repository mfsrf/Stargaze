// PlanetSelector component - horizontal scrollable planet switcher

import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import useGameStore from "../state/gameStore";
import useThemeStore from "../state/themeStore";
import { formatNumber } from "../utils/gameFormulas";
import { RESPONSIVE } from "../utils/responsive";

export default function PlanetSelector() {
  const theme = useThemeStore((state) => state.theme);
  const planets = useGameStore((state) => state.player.planets);
  const selectedPlanetId = useGameStore((state) => state.selectedPlanetId);
  const selectPlanet = useGameStore((state) => state.selectPlanet);
  const renamePlanet = useGameStore((state) => state.renamePlanet);
  
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [renamingPlanetId, setRenamingPlanetId] = useState<string | null>(null);
  const [newPlanetName, setNewPlanetName] = useState("");
  
  const handleSelectPlanet = (planetId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    selectPlanet(planetId);
  };
  
  const handleLongPress = (planetId: string, currentName: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setRenamingPlanetId(planetId);
    setNewPlanetName(currentName);
    setRenameModalVisible(true);
  };
  
  const handleConfirmRename = () => {
    if (renamingPlanetId && newPlanetName.trim()) {
      renamePlanet(renamingPlanetId, newPlanetName.trim());
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setRenameModalVisible(false);
      setRenamingPlanetId(null);
      setNewPlanetName("");
    }
  };
  
  return (
    <View
      style={{
        backgroundColor: theme.colors.card,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
      }}
    >
      {/* Rename Modal */}
      <Modal
        visible={renameModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRenameModalVisible(false)}
      >
        <Pressable 
          style={{ 
            flex: 1, 
            backgroundColor: "rgba(0,0,0,0.7)", 
            justifyContent: "center", 
            alignItems: "center",
            padding: 20,
          }}
          onPress={() => {
            // Close modal when backdrop is pressed
            setRenameModalVisible(false);
            setRenamingPlanetId(null);
            setNewPlanetName("");
          }}
        >
          <Pressable 
            style={{ 
              backgroundColor: theme.colors.card, 
              borderRadius: 16, 
              padding: 24,
              width: "100%",
              maxWidth: 400,
            }}
            onPress={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
          >
            <View style={{ alignItems: "center", marginBottom: 20 }}>
              <View style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: theme.colors.primary + "20",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 12,
              }}>
                <Ionicons name="create" size={32} color={theme.colors.primary} />
              </View>
              <Text style={{ color: theme.colors.text, fontSize: 20, fontWeight: "bold" }}>
                Rename Planet
              </Text>
            </View>
            
            <TextInput
              style={{
                backgroundColor: theme.colors.background,
                color: theme.colors.text,
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 10,
                fontSize: 16,
                marginBottom: 20,
                borderWidth: 1,
                borderColor: theme.colors.border,
              }}
              value={newPlanetName}
              onChangeText={setNewPlanetName}
              placeholder="Enter new planet name"
              placeholderTextColor={theme.colors.textSecondary}
              autoFocus
              maxLength={30}
            />
            
            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setRenameModalVisible(false);
                  setRenamingPlanetId(null);
                  setNewPlanetName("");
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
                onPress={handleConfirmRename}
                activeOpacity={0.7}
                disabled={!newPlanetName.trim()}
                style={{
                  flex: 1,
                  backgroundColor: newPlanetName.trim() ? theme.colors.primary : theme.colors.border,
                  paddingVertical: 14,
                  borderRadius: 10,
                  alignItems: "center",
                  shadowColor: newPlanetName.trim() ? theme.colors.primary : "transparent",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                  elevation: newPlanetName.trim() ? 3 : 0,
                }}
              >
                <Text style={{ color: "#FFFFFF", fontSize: 15, fontWeight: "700" }}>
                  Rename
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 12 }}
      >
        {planets.map((planet) => {
          const isSelected = planet.id === selectedPlanetId;
          return (
            <TouchableOpacity
              key={planet.id}
              onPress={() => handleSelectPlanet(planet.id)}
              onLongPress={() => handleLongPress(planet.id, planet.name)}
              activeOpacity={0.7}
              style={{
                backgroundColor: isSelected ? theme.colors.primary : theme.colors.inputBackground,
                paddingVertical: 10,
                paddingHorizontal: 16,
                borderRadius: 20,
                marginHorizontal: 4,
                minWidth: RESPONSIVE.isSmall ? 100 : 120,
                maxWidth: RESPONSIVE.isSmall ? 140 : 180,
                borderWidth: 1,
                borderColor: isSelected ? theme.colors.primary : theme.colors.border,
              }}
            >
              <Text
                style={{
                  color: isSelected ? "#FFFFFF" : theme.colors.text,
                  fontSize: RESPONSIVE.fonts.medium,
                  fontWeight: "600",
                  textAlign: "center",
                  marginBottom: 2,
                }}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {planet.name}
              </Text>
              <Text
                style={{
                  color: isSelected ? "#FFFFFF" : theme.colors.textSecondary,
                  fontSize: RESPONSIVE.fonts.tiny,
                  textAlign: "center",
                }}
                numberOfLines={1}
              >
                [{planet.coordinates.galaxy}:{planet.coordinates.system}:{planet.coordinates.position}]
              </Text>
              <Text
                style={{
                  color: isSelected ? "#FFFFFF" : theme.colors.textSecondary,
                  fontSize: RESPONSIVE.fonts.tiny,
                  textAlign: "center",
                  marginTop: 2,
                }}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {formatNumber(planet.resources.metal + planet.resources.crystal + planet.resources.deuterium)} resources
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
