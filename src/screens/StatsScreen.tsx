// StatsScreen - rankings and statistics

import React, { useEffect, useMemo } from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import useThemeStore from "../state/themeStore";
import useGameStore from "../state/gameStore";
import { formatNumber, getBuildingCost, getTechnologyCost } from "../utils/gameFormulas";
import { SHIP_BASE_COSTS, DEFENSE_BASE_COSTS } from "../utils/gameConstants";
import { BuildingType, TechnologyType, ShipType, DefenseType } from "../types/game";
import { RESPONSIVE } from "../utils/responsive";

export default function StatsScreen() {
  const theme = useThemeStore((state) => state.theme);
  const player = useGameStore((state) => state.player);
  const aiPlayers = useGameStore((state) => state.aiPlayers);
  const calculatePlayerPoints = useGameStore((state) => state.calculatePlayerPoints);
  
  // Recalculate points when screen is viewed
  useEffect(() => {
    calculatePlayerPoints();
  }, []);
  
  // Live-calc AI points (economy, research, military)
  const aiRankings = useMemo(() => {
    return aiPlayers.map((ai) => {
      let economyPoints = 0;
      let researchPoints = 0;
      let militaryPoints = 0;
      
      // Buildings economy points
      ai.planets.forEach((planet) => {
        Object.entries(planet.buildings).forEach(([bType, level]) => {
          if (level > 0) {
            for (let i = 0; i < level; i++) {
              const cost = getBuildingCost(bType as BuildingType, i);
              economyPoints += (cost.metal + cost.crystal + cost.deuterium) / 1000;
            }
          }
        });
        // Defense points
        Object.entries(planet.defense).forEach(([dType, count]) => {
          if ((count as number) > 0) {
            const base = DEFENSE_BASE_COSTS[dType as DefenseType];
            militaryPoints += ((base.metal + base.crystal + base.deuterium) * (count as number)) / 1000;
          }
        });
        // Fleet points
        Object.entries(planet.fleet).forEach(([sType, count]) => {
          if (count > 0) {
            const base = SHIP_BASE_COSTS[sType as ShipType];
            militaryPoints += ((base.metal + base.crystal + base.deuterium) * count) / 1000;
          }
        });
      });
      
      // Active AI fleets count toward military
      (ai.fleets || []).forEach((fleet) => {
        Object.entries(fleet.ships).forEach(([sType, count]) => {
          if (count > 0) {
            const base = SHIP_BASE_COSTS[sType as ShipType];
            militaryPoints += ((base.metal + base.crystal + base.deuterium) * count) / 1000;
          }
        });
      });
      
      // Technologies points
      Object.entries(ai.technologies).forEach(([tType, level]) => {
        if (level > 0) {
          for (let i = 0; i < level; i++) {
            const cost = getTechnologyCost(tType as TechnologyType, i);
            researchPoints += (cost.metal + cost.crystal + cost.deuterium) / 1000;
          }
        }
      });
      
      const totalPoints = Math.floor(economyPoints + researchPoints + militaryPoints);
      return {
        name: ai.name,
        isPlayer: false,
        economyPoints: Math.floor(economyPoints),
        researchPoints: Math.floor(researchPoints),
        militaryPoints: Math.floor(militaryPoints),
        totalPoints,
      };
    });
  }, [aiPlayers]);
  
  // Calculate total resources across all planets
  const totalResources = player.planets.reduce(
    (total, planet) => ({
      metal: total.metal + planet.resources.metal,
      crystal: total.crystal + planet.resources.crystal,
      deuterium: total.deuterium + planet.resources.deuterium,
    }),
    { metal: 0, crystal: 0, deuterium: 0 }
  );
  
  // Count total ships
  const totalShips = player.planets.reduce((total, planet) => {
    return total + Object.values(planet.fleet).reduce((sum, count) => sum + count, 0);
  }, 0);
  
  // Count total defense
  const totalDefense = player.planets.reduce((total, planet) => {
    return total + Object.values(planet.defense).reduce((sum, count) => sum + (count as number), 0);
  }, 0);
  
  // Calculate total technology levels
  const totalTechLevels = Object.values(player.technologies).reduce((sum, level) => sum + level, 0);
  
  // Calculate total building levels
  const totalBuildingLevels = player.planets.reduce((total, planet) => {
    return total + Object.values(planet.buildings).reduce((sum, level) => sum + level, 0);
  }, 0);
  

  
  const allPlayers = [
    { 
      name: player.name, 
      totalPoints: player.totalPoints,
      economyPoints: player.economyPoints,
      researchPoints: player.researchPoints,
      militaryPoints: player.militaryPoints,
      isPlayer: true 
    },
    ...aiRankings
  ].sort((a, b) => b.totalPoints - a.totalPoints);
  
  const playerRank = allPlayers.findIndex((p) => p.isPlayer) + 1;
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={["top"]}>
      {/* Header */}
      <View style={{ 
        backgroundColor: theme.colors.card, 
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
      }}>
        <Text style={{ 
          color: theme.colors.text, 
          fontSize: 24, 
          fontWeight: "bold",
        }}>
          Statistics
        </Text>
        <Text style={{ 
          color: theme.colors.textSecondary, 
          fontSize: 14,
          marginTop: 4,
        }}>
          Track your empire progress and rankings
        </Text>
      </View>
      
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        {/* Player Rank Card */}
        <LinearGradient
          colors={[theme.colors.primary + "30", theme.colors.secondary + "20"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: 16,
            padding: 20,
            marginBottom: 16,
            borderWidth: 2,
            borderColor: theme.colors.primary + "40",
          }}
        >
          <View style={{ alignItems: "center" }}>
            <Text style={{ 
              color: theme.colors.textSecondary, 
              fontSize: RESPONSIVE.fonts.small,
              fontWeight: "600",
              marginBottom: 4,
            }}>
              YOUR RANK
            </Text>
            <Text style={{ 
              color: theme.colors.text, 
              fontSize: 48, 
              fontWeight: "bold",
              marginBottom: 4,
            }}>
              #{playerRank}
            </Text>
            <Text style={{ 
              color: theme.colors.text, 
              fontSize: RESPONSIVE.fonts.large,
              fontWeight: "700",
              marginBottom: 12,
            }}>
              {player.name}
            </Text>
            <View style={{ 
              flexDirection: "row", 
              alignItems: "center",
              backgroundColor: theme.colors.primary + "20",
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
            }}>
              <Ionicons name="trophy" size={20} color={theme.colors.primary} />
              <Text style={{ 
                color: theme.colors.primary, 
                fontSize: RESPONSIVE.fonts.large,
                fontWeight: "700",
                marginLeft: 8,
              }}>
                {formatNumber(player.totalPoints)} points
              </Text>
            </View>
          </View>
        </LinearGradient>
        
        {/* Points Breakdown */}
        <View style={{ 
          backgroundColor: theme.colors.card,
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: theme.colors.border,
        }}>
          <Text style={{ 
            color: theme.colors.text, 
            fontSize: RESPONSIVE.fonts.large,
            fontWeight: "700",
            marginBottom: 16,
          }}>
            Points Breakdown
          </Text>
          
          {/* Economy Points */}
          <View style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
              <View style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: theme.colors.metal + "20",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}>
                <Ionicons name="hammer" size={20} color={theme.colors.metal} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: theme.colors.text, fontSize: RESPONSIVE.fonts.medium, fontWeight: "600" }}>
                  Economy Points
                </Text>
                <Text style={{ color: theme.colors.metal, fontSize: RESPONSIVE.fonts.large, fontWeight: "700" }}>
                  {formatNumber(player.economyPoints)}
                </Text>
              </View>
            </View>
            <View style={{ height: 6, backgroundColor: theme.colors.border, borderRadius: 3, overflow: "hidden" }}>
              <View style={{ 
                height: "100%", 
                width: `${Math.min(100, (player.economyPoints / player.totalPoints) * 100)}%`,
                backgroundColor: theme.colors.metal,
              }} />
            </View>
          </View>
          
          {/* Research Points */}
          <View style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
              <View style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: theme.colors.primary + "20",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}>
                <Ionicons name="flask" size={20} color={theme.colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: theme.colors.text, fontSize: RESPONSIVE.fonts.medium, fontWeight: "600" }}>
                  Research Points
                </Text>
                <Text style={{ color: theme.colors.primary, fontSize: RESPONSIVE.fonts.large, fontWeight: "700" }}>
                  {formatNumber(player.researchPoints)}
                </Text>
              </View>
            </View>
            <View style={{ height: 6, backgroundColor: theme.colors.border, borderRadius: 3, overflow: "hidden" }}>
              <View style={{ 
                height: "100%", 
                width: `${Math.min(100, (player.researchPoints / player.totalPoints) * 100)}%`,
                backgroundColor: theme.colors.primary,
              }} />
            </View>
          </View>
          
          {/* Military Points */}
          <View>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
              <View style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: theme.colors.danger + "20",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}>
                <Ionicons name="rocket" size={20} color={theme.colors.danger} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: theme.colors.text, fontSize: RESPONSIVE.fonts.medium, fontWeight: "600" }}>
                  Military Points
                </Text>
                <Text style={{ color: theme.colors.danger, fontSize: RESPONSIVE.fonts.large, fontWeight: "700" }}>
                  {formatNumber(player.militaryPoints)}
                </Text>
              </View>
            </View>
            <View style={{ height: 6, backgroundColor: theme.colors.border, borderRadius: 3, overflow: "hidden" }}>
              <View style={{ 
                height: "100%", 
                width: `${Math.min(100, (player.militaryPoints / player.totalPoints) * 100)}%`,
                backgroundColor: theme.colors.danger,
              }} />
            </View>
          </View>
        </View>
        
        {/* Empire Statistics */}
        <View style={{ 
          backgroundColor: theme.colors.card,
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: theme.colors.border,
        }}>
          <Text style={{ 
            color: theme.colors.text, 
            fontSize: RESPONSIVE.fonts.large,
            fontWeight: "700",
            marginBottom: 16,
          }}>
            Empire Statistics
          </Text>
          
          <View style={{ flexDirection: "row", flexWrap: "wrap", marginHorizontal: -6 }}>
            {/* Planets */}
            <View style={{ width: "50%", padding: 6 }}>
              <View style={{ 
                backgroundColor: theme.colors.background,
                borderRadius: 8,
                padding: 12,
                alignItems: "center",
              }}>
                <Ionicons name="planet" size={24} color={theme.colors.primary} />
                <Text style={{ 
                  color: theme.colors.text, 
                  fontSize: 20, 
                  fontWeight: "700",
                  marginTop: 8,
                }}>
                  {player.planets.length}
                </Text>
                <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
                  Planets
                </Text>
              </View>
            </View>
            
            {/* Ships */}
            <View style={{ width: "50%", padding: 6 }}>
              <View style={{ 
                backgroundColor: theme.colors.background,
                borderRadius: 8,
                padding: 12,
                alignItems: "center",
              }}>
                <Ionicons name="rocket" size={24} color={theme.colors.danger} />
                <Text style={{ 
                  color: theme.colors.text, 
                  fontSize: 20, 
                  fontWeight: "700",
                  marginTop: 8,
                }}>
                  {formatNumber(totalShips)}
                </Text>
                <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
                  Ships
                </Text>
              </View>
            </View>
            
            {/* Defense */}
            <View style={{ width: "50%", padding: 6 }}>
              <View style={{ 
                backgroundColor: theme.colors.background,
                borderRadius: 8,
                padding: 12,
                alignItems: "center",
              }}>
                <Ionicons name="shield" size={24} color={theme.colors.success} />
                <Text style={{ 
                  color: theme.colors.text, 
                  fontSize: 20, 
                  fontWeight: "700",
                  marginTop: 8,
                }}>
                  {formatNumber(totalDefense)}
                </Text>
                <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
                  Defense
                </Text>
              </View>
            </View>
            
            {/* Buildings */}
            <View style={{ width: "50%", padding: 6 }}>
              <View style={{ 
                backgroundColor: theme.colors.background,
                borderRadius: 8,
                padding: 12,
                alignItems: "center",
              }}>
                <Ionicons name="construct" size={24} color={theme.colors.metal} />
                <Text style={{ 
                  color: theme.colors.text, 
                  fontSize: 20, 
                  fontWeight: "700",
                  marginTop: 8,
                }}>
                  {totalBuildingLevels}
                </Text>
                <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
                  Building Lvls
                </Text>
              </View>
            </View>
            
            {/* Technologies */}
            <View style={{ width: "50%", padding: 6 }}>
              <View style={{ 
                backgroundColor: theme.colors.background,
                borderRadius: 8,
                padding: 12,
                alignItems: "center",
              }}>
                <Ionicons name="flask-outline" size={24} color={theme.colors.primary} />
                <Text style={{ 
                  color: theme.colors.text, 
                  fontSize: 20, 
                  fontWeight: "700",
                  marginTop: 8,
                }}>
                  {totalTechLevels}
                </Text>
                <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
                  Tech Lvls
                </Text>
              </View>
            </View>
            
            {/* Fleets */}
            <View style={{ width: "50%", padding: 6 }}>
              <View style={{ 
                backgroundColor: theme.colors.background,
                borderRadius: 8,
                padding: 12,
                alignItems: "center",
              }}>
                <Ionicons name="send" size={24} color={theme.colors.warning} />
                <Text style={{ 
                  color: theme.colors.text, 
                  fontSize: 20, 
                  fontWeight: "700",
                  marginTop: 8,
                }}>
                  {player.fleets.length}
                </Text>
                <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
                  Active Fleets
                </Text>
              </View>
            </View>
          </View>
        </View>
        
        {/* Resources */}
        <View style={{ 
          backgroundColor: theme.colors.card,
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: theme.colors.border,
        }}>
          <Text style={{ 
            color: theme.colors.text, 
            fontSize: RESPONSIVE.fonts.large,
            fontWeight: "700",
            marginBottom: 16,
          }}>
            Total Resources
          </Text>
          
          <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
            <View style={{ alignItems: "center" }}>
              <Ionicons name="hammer" size={28} color={theme.colors.metal} />
              <Text style={{ 
                color: theme.colors.text, 
                fontSize: RESPONSIVE.fonts.medium,
                fontWeight: "700",
                marginTop: 6,
              }}>
                {formatNumber(totalResources.metal)}
              </Text>
              <Text style={{ color: theme.colors.textSecondary, fontSize: RESPONSIVE.fonts.small }}>
                Metal
              </Text>
            </View>
            
            <View style={{ alignItems: "center" }}>
              <Ionicons name="diamond" size={28} color={theme.colors.crystal} />
              <Text style={{ 
                color: theme.colors.text, 
                fontSize: RESPONSIVE.fonts.medium,
                fontWeight: "700",
                marginTop: 6,
              }}>
                {formatNumber(totalResources.crystal)}
              </Text>
              <Text style={{ color: theme.colors.textSecondary, fontSize: RESPONSIVE.fonts.small }}>
                Crystal
              </Text>
            </View>
            
            <View style={{ alignItems: "center" }}>
              <Ionicons name="water" size={28} color={theme.colors.deuterium} />
              <Text style={{ 
                color: theme.colors.text, 
                fontSize: RESPONSIVE.fonts.medium,
                fontWeight: "700",
                marginTop: 6,
              }}>
                {formatNumber(totalResources.deuterium)}
              </Text>
              <Text style={{ color: theme.colors.textSecondary, fontSize: RESPONSIVE.fonts.small }}>
                Deuterium
              </Text>
            </View>
          </View>
        </View>
        
        {/* Rankings */}
        <View style={{ 
          backgroundColor: theme.colors.card,
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: theme.colors.border,
        }}>
          <Text style={{ 
            color: theme.colors.text, 
            fontSize: RESPONSIVE.fonts.large,
            fontWeight: "700",
            marginBottom: 16,
          }}>
            Galaxy Rankings
          </Text>
          
          {allPlayers.map((p, index) => (
            <View 
              key={index}
              style={{ 
                flexDirection: "row", 
                alignItems: "center",
                paddingVertical: 12,
                paddingHorizontal: 12,
                backgroundColor: p.isPlayer ? theme.colors.primary + "10" : "transparent",
                borderRadius: 8,
                marginBottom: 8,
                borderWidth: p.isPlayer ? 1 : 0,
                borderColor: p.isPlayer ? theme.colors.primary + "30" : "transparent",
              }}
            >
              <Text style={{ 
                color: p.isPlayer ? theme.colors.primary : theme.colors.textSecondary,
                fontSize: RESPONSIVE.fonts.large,
                fontWeight: "700",
                width: 32,
              }}>
                #{index + 1}
              </Text>
              <View style={{ flex: 1 }}>
                <Text style={{ 
                  color: theme.colors.text, 
                  fontSize: RESPONSIVE.fonts.medium,
                  fontWeight: p.isPlayer ? "700" : "600",
                }}>
                  {p.name} {p.isPlayer && "(You)"}
                </Text>
              </View>
              <Text style={{ 
                color: theme.colors.text,
                fontSize: RESPONSIVE.fonts.medium,
                fontWeight: "700",
              }}>
                {formatNumber(p.totalPoints)}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
