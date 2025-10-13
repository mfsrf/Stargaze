// ShipCard component - displays ship info and build button

import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import useGameStore from "../state/gameStore";
import useThemeStore from "../state/themeStore";
import { ShipType, TechnologyType, BuildingType } from "../types/game";
import {
  canAfford,
  formatNumber,
  calculateShipSpeed,
  calculateAttackPower,
  calculateShieldPower,
  calculateArmorPower,
  checkShipPrerequisites,
} from "../utils/gameFormulas";
import { SHIP_BASE_COSTS, SHIP_NAMES, SHIP_STATS, SHIP_PREREQUISITES, BUILDING_NAMES, TECHNOLOGY_NAMES } from "../utils/gameConstants";

interface ShipCardProps {
  shipType: ShipType;
  planetId: string;
}

const SHIP_ICONS: Record<ShipType, keyof typeof Ionicons.glyphMap> = {
  [ShipType.LightFighter]: "airplane-outline",
  [ShipType.HeavyFighter]: "airplane",
  [ShipType.Cruiser]: "boat-outline",
  [ShipType.Battleship]: "rocket-outline",
  [ShipType.Battlecruiser]: "rocket",
  [ShipType.Bomber]: "thunderstorm-outline",
  [ShipType.Destroyer]: "skull-outline",
  [ShipType.Deathstar]: "planet-outline",
  [ShipType.SmallCargo]: "cube-outline",
  [ShipType.LargeCargo]: "cube",
  [ShipType.ColonyShip]: "home-outline",
  [ShipType.Recycler]: "reload-outline",
  [ShipType.EspionageProbe]: "eye-outline",
  [ShipType.Scout]: "compass-outline",
};

const SHIP_COLORS: Record<ShipType, string[]> = {
  [ShipType.LightFighter]: ["#64B5F6", "#42A5F5"],
  [ShipType.HeavyFighter]: ["#FF7043", "#F4511E"],
  [ShipType.Cruiser]: ["#9575CD", "#7E57C2"],
  [ShipType.Battleship]: ["#E53935", "#C62828"],
  [ShipType.Battlecruiser]: ["#D32F2F", "#B71C1C"],
  [ShipType.Bomber]: ["#FFA726", "#FB8C00"],
  [ShipType.Destroyer]: ["#7E57C2", "#5E35B1"],
  [ShipType.Deathstar]: ["#212121", "#000000"],
  [ShipType.SmallCargo]: ["#78909C", "#607D8B"],
  [ShipType.LargeCargo]: ["#546E7A", "#455A64"],
  [ShipType.ColonyShip]: ["#66BB6A", "#4CAF50"],
  [ShipType.Recycler]: ["#4DB6AC", "#26A69A"],
  [ShipType.EspionageProbe]: ["#90A4AE", "#78909C"],
  [ShipType.Scout]: ["#80CBC4", "#4DB6AC"],
};

const SHIP_CATEGORIES: Record<ShipType, "combat" | "civil"> = {
  [ShipType.LightFighter]: "combat",
  [ShipType.HeavyFighter]: "combat",
  [ShipType.Cruiser]: "combat",
  [ShipType.Battleship]: "combat",
  [ShipType.Battlecruiser]: "combat",
  [ShipType.Bomber]: "combat",
  [ShipType.Destroyer]: "combat",
  [ShipType.Deathstar]: "combat",
  [ShipType.SmallCargo]: "civil",
  [ShipType.LargeCargo]: "civil",
  [ShipType.ColonyShip]: "civil",
  [ShipType.Recycler]: "civil",
  [ShipType.EspionageProbe]: "civil",
  [ShipType.Scout]: "civil",
};

export default React.memo(function ShipCard({ shipType, planetId }: ShipCardProps) {
  const theme = useThemeStore((state) => state.theme);
  const planet = useGameStore((state) =>
    state.player.planets.find((p) => p.id === planetId)
  );
  const technologies = useGameStore((state) => state.player.technologies);
  const buildShips = useGameStore((state) => state.buildShips);
  const [quantity, setQuantity] = useState("1");
  
  if (!planet) return null;
  
  const cost = SHIP_BASE_COSTS[shipType];
  const baseStats = SHIP_STATS[shipType];
  const currentCount = planet.fleet[shipType] || 0;
  const category = SHIP_CATEGORIES[shipType];
  
  // Calculate stats with technology bonuses
  const stats = {
    attack: calculateAttackPower(baseStats.attack, technologies[TechnologyType.WeaponsTech]),
    shield: calculateShieldPower(baseStats.shield, technologies[TechnologyType.ShieldingTech]),
    armor: calculateArmorPower(baseStats.armor, technologies[TechnologyType.ArmorTech]),
    speed: calculateShipSpeed(
      baseStats.speed,
      technologies[TechnologyType.CombustionDrive],
      technologies[TechnologyType.ImpulseDrive],
      technologies[TechnologyType.HyperspaceDrive]
    ),
    cargo: baseStats.cargo,
    fuelConsumption: baseStats.fuelConsumption,
  };
  
  // Check if any bonuses are active
  const hasWeaponsBonus = technologies[TechnologyType.WeaponsTech] > 0;
  const hasShieldBonus = technologies[TechnologyType.ShieldingTech] > 0;
  const hasArmorBonus = technologies[TechnologyType.ArmorTech] > 0;
  const hasDriveBonus = technologies[TechnologyType.CombustionDrive] > 0 || 
                        technologies[TechnologyType.ImpulseDrive] > 0 || 
                        technologies[TechnologyType.HyperspaceDrive] > 0;
  
  // Check prerequisites
  const prerequisites = SHIP_PREREQUISITES[shipType];
  const prerequisiteCheck = checkShipPrerequisites(
    shipType,
    planet.buildings,
    technologies,
    prerequisites
  );
  const canBuildShip = prerequisiteCheck.met;
  
  const quantityNum = parseInt(quantity) || 0;
  const totalCost = {
    metal: cost.metal * quantityNum,
    crystal: cost.crystal * quantityNum,
    deuterium: cost.deuterium * quantityNum,
    energy: 0,
  };
  
  const canBuild = canBuildShip && quantityNum > 0 && canAfford(planet.resources, totalCost);
  
  // Calculate max affordable quantity
  const maxMetal = cost.metal > 0 ? Math.floor(planet.resources.metal / cost.metal) : Infinity;
  const maxCrystal = cost.crystal > 0 ? Math.floor(planet.resources.crystal / cost.crystal) : Infinity;
  const maxDeuterium = cost.deuterium > 0 ? Math.floor(planet.resources.deuterium / cost.deuterium) : Infinity;
  const maxAffordable = Math.min(maxMetal, maxCrystal, maxDeuterium);
  
  const handleBuild = () => {
    if (canBuild) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      buildShips(planetId, shipType, quantityNum);
      setQuantity("1");
    }
  };
  
  const handleMaxQuantity = () => {
    if (maxAffordable > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setQuantity(maxAffordable.toString());
    }
  };
  
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
          colors={[SHIP_COLORS[shipType][0] + "60", SHIP_COLORS[shipType][1] + "30"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
            shadowColor: SHIP_COLORS[shipType][0],
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 4,
          }}
        >
          <Ionicons
            name={SHIP_ICONS[shipType]}
            size={30}
            color={SHIP_COLORS[shipType][0]}
          />
        </LinearGradient>
        <View style={{ flex: 1 }}>
          <Text style={{ color: theme.colors.text, fontSize: 17, fontWeight: "700" }}>
            {SHIP_NAMES[shipType]}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 2 }}>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 14 }}>
              Available: {currentCount}
            </Text>
            <View style={{ 
              marginLeft: 8, 
              backgroundColor: category === "combat" ? theme.colors.danger + "20" : theme.colors.primary + "20",
              paddingHorizontal: 6,
              paddingVertical: 2,
              borderRadius: 4,
            }}>
              <Text style={{ 
                color: category === "combat" ? theme.colors.danger : theme.colors.primary, 
                fontSize: 10, 
                fontWeight: "600" 
              }}>
                {category === "combat" ? "Combat" : "Civil"}
              </Text>
            </View>
          </View>
        </View>
      </View>
      
      {/* Ship Stats */}
      <View style={{ marginBottom: 12, paddingVertical: 8, borderTopWidth: 1, borderBottomWidth: 1, borderColor: theme.colors.border }}>
        <View style={{ flexDirection: "row", justifyContent: "space-around", marginBottom: 4 }}>
          <View style={{ alignItems: "center" }}>
            <Ionicons name="flash" size={14} color={theme.colors.danger} />
            <Text style={{ color: theme.colors.textSecondary, fontSize: 10 }}>Attack</Text>
            <Text style={{ color: hasWeaponsBonus ? theme.colors.success : theme.colors.text, fontSize: 12, fontWeight: "600" }}>
              {formatNumber(stats.attack)}
            </Text>
          </View>
          <View style={{ alignItems: "center" }}>
            <Ionicons name="shield" size={14} color={theme.colors.primary} />
            <Text style={{ color: theme.colors.textSecondary, fontSize: 10 }}>Shield</Text>
            <Text style={{ color: hasShieldBonus ? theme.colors.success : theme.colors.text, fontSize: 12, fontWeight: "600" }}>
              {formatNumber(stats.shield)}
            </Text>
          </View>
          <View style={{ alignItems: "center" }}>
            <Ionicons name="fitness" size={14} color={theme.colors.crystal} />
            <Text style={{ color: theme.colors.textSecondary, fontSize: 10 }}>Armor</Text>
            <Text style={{ color: hasArmorBonus ? theme.colors.success : theme.colors.text, fontSize: 12, fontWeight: "600" }}>
              {formatNumber(stats.armor)}
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
          <View style={{ alignItems: "center" }}>
            <Ionicons name="speedometer" size={14} color={theme.colors.success} />
            <Text style={{ color: theme.colors.textSecondary, fontSize: 10 }}>Speed</Text>
            <Text style={{ color: hasDriveBonus ? theme.colors.success : theme.colors.text, fontSize: 12, fontWeight: "600" }}>
              {formatNumber(stats.speed)}
            </Text>
          </View>
          <View style={{ alignItems: "center" }}>
            <Ionicons name="cube" size={14} color={theme.colors.metal} />
            <Text style={{ color: theme.colors.textSecondary, fontSize: 10 }}>Cargo</Text>
            <Text style={{ color: theme.colors.text, fontSize: 12, fontWeight: "600" }}>
              {formatNumber(stats.cargo)}
            </Text>
          </View>
          <View style={{ alignItems: "center" }}>
            <Ionicons name="water" size={14} color={theme.colors.deuterium} />
            <Text style={{ color: theme.colors.textSecondary, fontSize: 10 }}>Fuel</Text>
            <Text style={{ color: theme.colors.text, fontSize: 12, fontWeight: "600" }}>
              {formatNumber(stats.fuelConsumption)}
            </Text>
          </View>
        </View>
      </View>
      
      {/* Prerequisites - Show if not met */}
      {!canBuildShip && prerequisiteCheck.missing.length > 0 && (
        <View style={{ 
          marginBottom: 12, 
          padding: 12, 
          backgroundColor: theme.colors.danger + "10",
          borderRadius: 8,
          borderWidth: 1,
          borderColor: theme.colors.danger + "30",
        }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
            <Ionicons name="lock-closed" size={16} color={theme.colors.danger} />
            <Text style={{ color: theme.colors.danger, fontSize: 13, fontWeight: "700", marginLeft: 6 }}>
              Requirements Not Met
            </Text>
          </View>
          {prerequisiteCheck.missing.map((req, index) => {
            // Check if it's a building or technology
            const isBuildingKey = Object.values(BuildingType).includes(req.name as BuildingType);
            const isTechKey = Object.values(TechnologyType).includes(req.name as TechnologyType);
            
            let displayName = req.name;
            if (isBuildingKey) {
              displayName = BUILDING_NAMES[req.name as BuildingType];
            } else if (isTechKey) {
              displayName = TECHNOLOGY_NAMES[req.name as TechnologyType];
            }
            
            return (
              <View key={index} style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
                <Ionicons name="alert-circle" size={12} color={theme.colors.danger} />
                <Text style={{ color: theme.colors.text, fontSize: 11, marginLeft: 6 }}>
                  {displayName}: Level {req.required} (Current: {req.current})
                </Text>
              </View>
            );
          })}
        </View>
      )}
      
      {/* Unit Cost */}
      <View style={{ marginBottom: 12 }}>
        <Text style={{ color: theme.colors.textSecondary, fontSize: 12, marginBottom: 4 }}>
          Unit Cost:
        </Text>
        <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
          {cost.metal > 0 && (
            <View style={{ alignItems: "center" }}>
              <Ionicons name="hammer" size={14} color={theme.colors.metal} />
              <Text style={{ color: theme.colors.text, fontSize: 12 }}>
                {formatNumber(cost.metal)}
              </Text>
            </View>
          )}
          {cost.crystal > 0 && (
            <View style={{ alignItems: "center" }}>
              <Ionicons name="diamond" size={14} color={theme.colors.crystal} />
              <Text style={{ color: theme.colors.text, fontSize: 12 }}>
                {formatNumber(cost.crystal)}
              </Text>
            </View>
          )}
          {cost.deuterium > 0 && (
            <View style={{ alignItems: "center" }}>
              <Ionicons name="water" size={14} color={theme.colors.deuterium} />
              <Text style={{ color: theme.colors.text, fontSize: 12 }}>
                {formatNumber(cost.deuterium)}
              </Text>
            </View>
          )}
        </View>
      </View>
      
      {/* Quantity Input */}
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12, gap: 8 }}>
        <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Quantity:</Text>
        <TextInput
          style={{
            flex: 1,
            backgroundColor: theme.colors.background,
            color: theme.colors.text,
            paddingVertical: 8,
            paddingHorizontal: 12,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: theme.colors.border,
            fontSize: 14,
            fontWeight: "600",
          }}
          value={quantity}
          onChangeText={setQuantity}
          keyboardType="number-pad"
          placeholder="0"
          placeholderTextColor={theme.colors.textSecondary}
        />
        <TouchableOpacity
          onPress={handleMaxQuantity}
          activeOpacity={0.7}
          style={{
            backgroundColor: theme.colors.primary + "20",
            paddingVertical: 8,
            paddingHorizontal: 12,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: theme.colors.primary, fontSize: 12, fontWeight: "600" }}>
            Max ({maxAffordable})
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Total Cost */}
      {quantityNum > 0 && (
        <View style={{ marginBottom: 12 }}>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 12, marginBottom: 4 }}>
            Total Cost:
          </Text>
          <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
            {totalCost.metal > 0 && (
              <View style={{ alignItems: "center" }}>
                <Ionicons name="hammer" size={14} color={theme.colors.metal} />
                <Text
                  style={{
                    color: planet.resources.metal >= totalCost.metal ? theme.colors.text : theme.colors.danger,
                    fontSize: 12,
                    fontWeight: "600",
                  }}
                >
                  {formatNumber(totalCost.metal)}
                </Text>
              </View>
            )}
            {totalCost.crystal > 0 && (
              <View style={{ alignItems: "center" }}>
                <Ionicons name="diamond" size={14} color={theme.colors.crystal} />
                <Text
                  style={{
                    color: planet.resources.crystal >= totalCost.crystal ? theme.colors.text : theme.colors.danger,
                    fontSize: 12,
                    fontWeight: "600",
                  }}
                >
                  {formatNumber(totalCost.crystal)}
                </Text>
              </View>
            )}
            {totalCost.deuterium > 0 && (
              <View style={{ alignItems: "center" }}>
                <Ionicons name="water" size={14} color={theme.colors.deuterium} />
                <Text
                  style={{
                    color: planet.resources.deuterium >= totalCost.deuterium ? theme.colors.text : theme.colors.danger,
                    fontSize: 12,
                    fontWeight: "600",
                  }}
                >
                  {formatNumber(totalCost.deuterium)}
                </Text>
              </View>
            )}
          </View>
        </View>
      )}
      
      {/* Build Button */}
      <TouchableOpacity
        onPress={handleBuild}
        disabled={!canBuild}
        activeOpacity={0.7}
        style={{
          borderRadius: 10,
          overflow: "hidden",
          shadowColor: canBuild ? theme.colors.primary : "transparent",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
          elevation: canBuild ? 3 : 0,
        }}
      >
        {canBuild ? (
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
              Build {quantityNum} {SHIP_NAMES[shipType]}{quantityNum > 1 ? "s" : ""}
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
              {!canBuildShip ? "Locked - Research Required" : quantityNum === 0 ? "Enter Quantity" : "Insufficient Resources"}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
});
