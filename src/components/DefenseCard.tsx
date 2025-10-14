// DefenseCard component - displays defense info and build button

import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import useGameStore from "../state/gameStore";
import useThemeStore from "../state/themeStore";
import { DefenseType, TechnologyType } from "../types/game";
import { 
  canAfford, 
  formatNumber,
  calculateAttackPower,
  calculateShieldPower,
  calculateArmorPower,
} from "../utils/gameFormulas";
import { DEFENSE_BASE_COSTS, DEFENSE_NAMES, DEFENSE_STATS } from "../utils/gameConstants";
import { RESPONSIVE } from "../utils/responsive";

interface DefenseCardProps {
  defenseType: DefenseType;
  planetId: string;
}

const DEFENSE_ICONS: Record<DefenseType, keyof typeof Ionicons.glyphMap> = {
  [DefenseType.RocketLauncher]: "rocket-outline",
  [DefenseType.LightLaser]: "flash-outline",
  [DefenseType.HeavyLaser]: "flash",
  [DefenseType.GaussCannon]: "nuclear-outline",
  [DefenseType.IonCannon]: "thunderstorm-outline",
  [DefenseType.PlasmaTurret]: "flame",
  [DefenseType.SmallShieldDome]: "shield-outline",
  [DefenseType.LargeShieldDome]: "shield",
};

const DEFENSE_COLORS: Record<DefenseType, string[]> = {
  [DefenseType.RocketLauncher]: ["#EF5350", "#E53935"],
  [DefenseType.LightLaser]: ["#42A5F5", "#1E88E5"],
  [DefenseType.HeavyLaser]: ["#5C6BC0", "#3949AB"],
  [DefenseType.GaussCannon]: ["#78909C", "#546E7A"],
  [DefenseType.IonCannon]: ["#AB47BC", "#8E24AA"],
  [DefenseType.PlasmaTurret]: ["#FF7043", "#F4511E"],
  [DefenseType.SmallShieldDome]: ["#66BB6A", "#43A047"],
  [DefenseType.LargeShieldDome]: ["#26A69A", "#00897B"],
};

export default function DefenseCard({ defenseType, planetId }: DefenseCardProps) {
  const theme = useThemeStore((state) => state.theme);
  const planet = useGameStore((state) =>
    state.player.planets.find((p) => p.id === planetId)
  );
  const technologies = useGameStore((state) => state.player.technologies);
  const buildDefense = useGameStore((state) => state.buildDefense);
  const [quantity, setQuantity] = useState("1");
  
  if (!planet) return null;
  
  const cost = DEFENSE_BASE_COSTS[defenseType];
  const baseStats = DEFENSE_STATS[defenseType];
  const currentCount = planet.defense[defenseType] || 0;
  
  // Calculate stats with technology bonuses
  const stats = {
    attack: calculateAttackPower(baseStats.attack, technologies[TechnologyType.WeaponsTech]),
    shield: calculateShieldPower(baseStats.shield, technologies[TechnologyType.ShieldingTech]),
    armor: calculateArmorPower(baseStats.armor, technologies[TechnologyType.ArmorTech]),
  };
  
  // Check if any bonuses are active
  const hasWeaponsBonus = technologies[TechnologyType.WeaponsTech] > 0;
  const hasShieldBonus = technologies[TechnologyType.ShieldingTech] > 0;
  const hasArmorBonus = technologies[TechnologyType.ArmorTech] > 0;
  
  const quantityNum = parseInt(quantity) || 0;
  const totalCost = {
    metal: cost.metal * quantityNum,
    crystal: cost.crystal * quantityNum,
    deuterium: cost.deuterium * quantityNum,
    energy: 0,
  };
  
  const canBuild = quantityNum > 0 && canAfford(planet.resources, totalCost);
  
  // Shield domes can only be built once
  const isDome = defenseType === DefenseType.SmallShieldDome || defenseType === DefenseType.LargeShieldDome;
  const isMaxed = isDome && currentCount >= 1;
  
  // Calculate max affordable quantity
  const maxMetal = cost.metal > 0 ? Math.floor(planet.resources.metal / cost.metal) : Infinity;
  const maxCrystal = cost.crystal > 0 ? Math.floor(planet.resources.crystal / cost.crystal) : Infinity;
  const maxDeuterium = cost.deuterium > 0 ? Math.floor(planet.resources.deuterium / cost.deuterium) : Infinity;
  const maxAffordable = isDome ? (currentCount >= 1 ? 0 : 1) : Math.min(maxMetal, maxCrystal, maxDeuterium);
  
  const handleBuild = () => {
    if (canBuild && !isMaxed) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      buildDefense(planetId, defenseType, quantityNum);
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
          colors={[DEFENSE_COLORS[defenseType][0] + "60", DEFENSE_COLORS[defenseType][1] + "30"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
            shadowColor: DEFENSE_COLORS[defenseType][0],
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 4,
          }}
        >
          <Ionicons
            name={DEFENSE_ICONS[defenseType]}
            size={30}
            color={DEFENSE_COLORS[defenseType][0]}
          />
        </LinearGradient>
        <View style={{ flex: 1 }}>
          <Text style={{ color: theme.colors.text, fontSize: 17, fontWeight: "700" }}>
            {DEFENSE_NAMES[defenseType]}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 2 }}>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 14 }}>
              Installed: {currentCount}
            </Text>
            {isMaxed && (
              <View style={{ 
                marginLeft: 8, 
                backgroundColor: theme.colors.success + "20",
                paddingHorizontal: 6,
                paddingVertical: 2,
                borderRadius: 4,
              }}>
                <Text style={{ color: theme.colors.success, fontSize: 10, fontWeight: "600" }}>
                  Max
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
      
      {/* Defense Stats */}
      <View style={{ marginBottom: 12, paddingVertical: 8, borderTopWidth: 1, borderBottomWidth: 1, borderColor: theme.colors.border }}>
        <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
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
      </View>
      
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
      
      {!isMaxed ? (
        <>
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
                  Build {quantityNum} {DEFENSE_NAMES[defenseType]}{quantityNum > 1 ? "s" : ""}
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
                  {quantityNum === 0 ? "Enter Quantity" : "Insufficient Resources"}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </>
      ) : (
        <View
          style={{
            backgroundColor: theme.colors.success + "20",
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: 10,
            alignItems: "center",
          }}
        >
          <Text style={{ color: theme.colors.success, fontSize: 15, fontWeight: "600" }}>
            Shield Dome Already Built
          </Text>
        </View>
      )}
    </View>
  );
}
