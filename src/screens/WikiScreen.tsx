// WikiScreen - comprehensive game encyclopedia

import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import useThemeStore from "../state/themeStore";
import { BuildingType, TechnologyType, ShipType, DefenseType, PlanetType } from "../types/game";
import { 
  BUILDING_NAMES, 
  TECHNOLOGY_NAMES, 
  SHIP_NAMES, 
  DEFENSE_NAMES,
  SHIP_BASE_COSTS,
  DEFENSE_BASE_COSTS,
  SHIP_STATS,
  DEFENSE_STATS,
  PLANET_TYPE_BONUSES,
} from "../utils/gameConstants";
import { 
  getBuildingCost, 
  getTechnologyCost,
  formatNumber,
} from "../utils/gameFormulas";
import { getPlanetTypeName, getPlanetTypeColor } from "../utils/galaxyManager";
import { RESPONSIVE } from "../utils/responsive";

type WikiSection = "buildings" | "research" | "ships" | "defense" | "planets";

const BUILDING_DESCRIPTIONS: Record<BuildingType, string> = {
  [BuildingType.MetalMine]: "Extracts metal ore from the planet's crust. Metal is the most basic resource required for construction.",
  [BuildingType.CrystalMine]: "Harvests crystalline structures from deep underground. Crystal is essential for advanced technologies.",
  [BuildingType.DeuteriumSynthesizer]: "Synthesizes deuterium from heavy water. Deuterium is used as fuel for ships and advanced facilities.",
  [BuildingType.SolarPlant]: "Converts solar radiation into energy. Provides clean, renewable power for your planet's operations.",
  [BuildingType.FusionReactor]: "Uses deuterium to generate massive amounts of energy through nuclear fusion.",
  [BuildingType.MetalStorage]: "Stores metal resources. Higher levels increase maximum storage capacity.",
  [BuildingType.CrystalStorage]: "Stores crystal resources. Higher levels increase maximum storage capacity.",
  [BuildingType.DeuteriumTank]: "Stores deuterium fuel. Higher levels increase maximum storage capacity.",
  [BuildingType.RoboticsFactory]: "Automates construction processes. Reduces building construction time significantly.",
  [BuildingType.Shipyard]: "Manufactures ships and defense systems. Required for building your fleet.",
  [BuildingType.ResearchLab]: "Enables technological research. Higher levels unlock advanced technologies.",
  [BuildingType.AllianceDepot]: "Facilitates trade and cooperation with allies.",
  [BuildingType.NaniteFactory]: "Uses nanomachines for ultra-fast construction. Dramatically reduces build times.",
  [BuildingType.Terraformer]: "Expands available building space by terraforming hostile terrain.",
};

const TECHNOLOGY_DESCRIPTIONS: Record<TechnologyType, string> = {
  [TechnologyType.EnergyTech]: "Improves energy efficiency across all systems. Required for advanced technologies.",
  [TechnologyType.LaserTech]: "Develops laser weapons and shield technology. Increases combat effectiveness.",
  [TechnologyType.IonTech]: "Harnesses ion particle technology for powerful weapons and propulsion.",
  [TechnologyType.HyperspaceTech]: "Unlocks faster-than-light travel and advanced ship drives.",
  [TechnologyType.PlasmaTech]: "Masters plasma manipulation for devastating weapons.",
  [TechnologyType.CombustionDrive]: "Basic propulsion technology. Increases speed of small ships.",
  [TechnologyType.ImpulseDrive]: "Advanced propulsion for medium ships. Provides excellent fuel efficiency.",
  [TechnologyType.HyperspaceDrive]: "Enables capital ships to travel at incredible speeds through hyperspace.",
  [TechnologyType.EspionageTech]: "Improves intelligence gathering capabilities and probe effectiveness.",
  [TechnologyType.ComputerTech]: "Enhances fleet coordination and allows larger fleet operations.",
  [TechnologyType.Astrophysics]: "Expands colony capacity and improves resource expedition success.",
  [TechnologyType.WeaponsTech]: "Increases attack power of all ships and defense systems.",
  [TechnologyType.ShieldingTech]: "Strengthens shields on all ships and defense installations.",
  [TechnologyType.ArmorTech]: "Reinforces armor plating on ships and defensive structures.",
};

const SHIP_DESCRIPTIONS: Record<ShipType, string> = {
  [ShipType.LightFighter]: "Fast, agile fighter. Good against other small ships. Low cost makes it ideal for early game combat.",
  [ShipType.HeavyFighter]: "Heavily armed fighter with better armor. Effective against light fighters and cruisers.",
  [ShipType.Cruiser]: "Versatile warship with balanced stats. Good for raiding and mid-game combat.",
  [ShipType.Battleship]: "Powerful capital ship with heavy weapons. Excellent for large-scale battles.",
  [ShipType.Battlecruiser]: "Fast battleship with devastating firepower. Very effective but expensive.",
  [ShipType.Bomber]: "Specialized for destroying defensive structures. Essential for breaking fortified positions.",
  [ShipType.Destroyer]: "Anti-bomber and anti-battleship specialist. Strong shields and heavy armor.",
  [ShipType.Deathstar]: "Ultimate weapon. Can destroy planets and obliterate entire fleets.",
  [ShipType.SmallCargo]: "Basic transport ship. Carries resources between planets efficiently.",
  [ShipType.LargeCargo]: "Heavy cargo vessel. Much larger cargo capacity than small cargo.",
  [ShipType.ColonyShip]: "Establishes new colonies. Consumed upon colonizing a planet.",
  [ShipType.Recycler]: "Harvests debris from battles. Recovers valuable resources from debris fields.",
  [ShipType.EspionageProbe]: "Gathers intelligence on enemy positions. Fast and stealthy.",
  [ShipType.Scout]: "Explores unknown systems. Reveals planet information without combat.",
};

const DEFENSE_DESCRIPTIONS: Record<DefenseType, string> = {
  [DefenseType.RocketLauncher]: "Basic defense system. Cheap and effective against light ships.",
  [DefenseType.LightLaser]: "Energy-based defense. Good against fighters and small ships.",
  [DefenseType.HeavyLaser]: "Powerful laser battery. Effective against medium-sized vessels.",
  [DefenseType.GaussCannon]: "Magnetic accelerator weapon. Deals heavy kinetic damage.",
  [DefenseType.IonCannon]: "Ion particle weapon. Disrupts shields and electronics.",
  [DefenseType.PlasmaTurret]: "Advanced plasma weapon. Extremely powerful but expensive.",
  [DefenseType.SmallShieldDome]: "Generates a protective shield over the planet. Absorbs moderate damage.",
  [DefenseType.LargeShieldDome]: "Massive shield generator. Provides exceptional protection.",
};

export default function WikiScreen() {
  const theme = useThemeStore((state) => state.theme);
  const [selectedSection, setSelectedSection] = useState<WikiSection>("buildings");
  
  const handleSectionChange = (section: WikiSection) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedSection(section);
  };
  
  const renderSectionButton = (section: WikiSection, icon: keyof typeof Ionicons.glyphMap, label: string) => {
    const isActive = selectedSection === section;
    return (
      <TouchableOpacity
        onPress={() => handleSectionChange(section)}
        activeOpacity={0.7}
        style={{
          flex: 1,
          backgroundColor: isActive ? theme.colors.primary : theme.colors.card,
          paddingVertical: 12,
          paddingHorizontal: 8,
          borderRadius: 10,
          alignItems: "center",
          borderWidth: 1,
          borderColor: isActive ? theme.colors.primary : theme.colors.border,
        }}
      >
        <Ionicons 
          name={icon} 
          size={20} 
          color={isActive ? "#FFFFFF" : theme.colors.textSecondary} 
        />
        <Text
          style={{
            color: isActive ? "#FFFFFF" : theme.colors.textSecondary,
            fontSize: RESPONSIVE.fonts.tiny,
            fontWeight: "600",
            marginTop: 4,
          }}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };
  
  const renderBuildingsSection = () => {
    return (
      <View>
        <Text style={{ 
          color: theme.colors.text, 
          fontSize: RESPONSIVE.fonts.xlarge, 
          fontWeight: "bold",
          marginBottom: 16,
        }}>
          Buildings
        </Text>
        
        {Object.values(BuildingType).map((building) => {
          const cost = getBuildingCost(building, 1);
          return (
            <View
              key={building}
              style={{
                backgroundColor: theme.colors.card,
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: theme.colors.border,
              }}
            >
              <Text style={{ 
                color: theme.colors.text, 
                fontSize: RESPONSIVE.fonts.large, 
                fontWeight: "700",
                marginBottom: 8,
              }}>
                {BUILDING_NAMES[building]}
              </Text>
              
              <Text style={{ 
                color: theme.colors.textSecondary, 
                fontSize: RESPONSIVE.fonts.body,
                lineHeight: 20,
                marginBottom: 12,
              }}>
                {BUILDING_DESCRIPTIONS[building]}
              </Text>
              
              <View style={{ 
                backgroundColor: theme.colors.background,
                padding: 12,
                borderRadius: 8,
              }}>
                <Text style={{ 
                  color: theme.colors.textSecondary, 
                  fontSize: RESPONSIVE.fonts.small,
                  fontWeight: "600",
                  marginBottom: 8,
                }}>
                  Base Cost (Level 1):
                </Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
                  {cost.metal > 0 && (
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <Ionicons name="hammer" size={14} color={theme.colors.metal} />
                      <Text style={{ 
                        color: theme.colors.text, 
                        fontSize: RESPONSIVE.fonts.small,
                        marginLeft: 4,
                      }}>
                        {formatNumber(cost.metal)}
                      </Text>
                    </View>
                  )}
                  {cost.crystal > 0 && (
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <Ionicons name="diamond" size={14} color={theme.colors.crystal} />
                      <Text style={{ 
                        color: theme.colors.text, 
                        fontSize: RESPONSIVE.fonts.small,
                        marginLeft: 4,
                      }}>
                        {formatNumber(cost.crystal)}
                      </Text>
                    </View>
                  )}
                  {cost.deuterium > 0 && (
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <Ionicons name="water" size={14} color={theme.colors.deuterium} />
                      <Text style={{ 
                        color: theme.colors.text, 
                        fontSize: RESPONSIVE.fonts.small,
                        marginLeft: 4,
                      }}>
                        {formatNumber(cost.deuterium)}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          );
        })}
      </View>
    );
  };
  
  const renderResearchSection = () => {
    return (
      <View>
        <Text style={{ 
          color: theme.colors.text, 
          fontSize: RESPONSIVE.fonts.xlarge, 
          fontWeight: "bold",
          marginBottom: 16,
        }}>
          Research Technologies
        </Text>
        
        {Object.values(TechnologyType).map((tech) => {
          const cost = getTechnologyCost(tech, 1);
          return (
            <View
              key={tech}
              style={{
                backgroundColor: theme.colors.card,
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: theme.colors.border,
              }}
            >
              <Text style={{ 
                color: theme.colors.text, 
                fontSize: RESPONSIVE.fonts.large, 
                fontWeight: "700",
                marginBottom: 8,
              }}>
                {TECHNOLOGY_NAMES[tech]}
              </Text>
              
              <Text style={{ 
                color: theme.colors.textSecondary, 
                fontSize: RESPONSIVE.fonts.body,
                lineHeight: 20,
                marginBottom: 12,
              }}>
                {TECHNOLOGY_DESCRIPTIONS[tech]}
              </Text>
              
              <View style={{ 
                backgroundColor: theme.colors.background,
                padding: 12,
                borderRadius: 8,
              }}>
                <Text style={{ 
                  color: theme.colors.textSecondary, 
                  fontSize: RESPONSIVE.fonts.small,
                  fontWeight: "600",
                  marginBottom: 8,
                }}>
                  Base Cost (Level 1):
                </Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
                  {cost.metal > 0 && (
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <Ionicons name="hammer" size={14} color={theme.colors.metal} />
                      <Text style={{ 
                        color: theme.colors.text, 
                        fontSize: RESPONSIVE.fonts.small,
                        marginLeft: 4,
                      }}>
                        {formatNumber(cost.metal)}
                      </Text>
                    </View>
                  )}
                  {cost.crystal > 0 && (
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <Ionicons name="diamond" size={14} color={theme.colors.crystal} />
                      <Text style={{ 
                        color: theme.colors.text, 
                        fontSize: RESPONSIVE.fonts.small,
                        marginLeft: 4,
                      }}>
                        {formatNumber(cost.crystal)}
                      </Text>
                    </View>
                  )}
                  {cost.deuterium > 0 && (
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <Ionicons name="water" size={14} color={theme.colors.deuterium} />
                      <Text style={{ 
                        color: theme.colors.text, 
                        fontSize: RESPONSIVE.fonts.small,
                        marginLeft: 4,
                      }}>
                        {formatNumber(cost.deuterium)}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          );
        })}
      </View>
    );
  };
  
  const renderShipsSection = () => {
    return (
      <View>
        <Text style={{ 
          color: theme.colors.text, 
          fontSize: RESPONSIVE.fonts.xlarge, 
          fontWeight: "bold",
          marginBottom: 16,
        }}>
          Ships
        </Text>
        
        {Object.values(ShipType).map((ship) => {
          const cost = SHIP_BASE_COSTS[ship];
          const stats = SHIP_STATS[ship];
          return (
            <View
              key={ship}
              style={{
                backgroundColor: theme.colors.card,
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: theme.colors.border,
              }}
            >
              <Text style={{ 
                color: theme.colors.text, 
                fontSize: RESPONSIVE.fonts.large, 
                fontWeight: "700",
                marginBottom: 8,
              }}>
                {SHIP_NAMES[ship]}
              </Text>
              
              <Text style={{ 
                color: theme.colors.textSecondary, 
                fontSize: RESPONSIVE.fonts.body,
                lineHeight: 20,
                marginBottom: 12,
              }}>
                {SHIP_DESCRIPTIONS[ship]}
              </Text>
              
              {/* Stats */}
              <View style={{ 
                backgroundColor: theme.colors.background,
                padding: 12,
                borderRadius: 8,
                marginBottom: 8,
              }}>
                <Text style={{ 
                  color: theme.colors.textSecondary, 
                  fontSize: RESPONSIVE.fonts.small,
                  fontWeight: "600",
                  marginBottom: 8,
                }}>
                  Base Stats:
                </Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Ionicons name="flash" size={12} color={theme.colors.danger} />
                    <Text style={{ 
                      color: theme.colors.text, 
                      fontSize: RESPONSIVE.fonts.small,
                      marginLeft: 4,
                    }}>
                      Attack: {formatNumber(stats.attack)}
                    </Text>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Ionicons name="shield" size={12} color={theme.colors.primary} />
                    <Text style={{ 
                      color: theme.colors.text, 
                      fontSize: RESPONSIVE.fonts.small,
                      marginLeft: 4,
                    }}>
                      Shield: {formatNumber(stats.shield)}
                    </Text>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Ionicons name="fitness" size={12} color={theme.colors.crystal} />
                    <Text style={{ 
                      color: theme.colors.text, 
                      fontSize: RESPONSIVE.fonts.small,
                      marginLeft: 4,
                    }}>
                      Armor: {formatNumber(stats.armor)}
                    </Text>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Ionicons name="speedometer" size={12} color={theme.colors.success} />
                    <Text style={{ 
                      color: theme.colors.text, 
                      fontSize: RESPONSIVE.fonts.small,
                      marginLeft: 4,
                    }}>
                      Speed: {formatNumber(stats.speed)}
                    </Text>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Ionicons name="cube" size={12} color={theme.colors.metal} />
                    <Text style={{ 
                      color: theme.colors.text, 
                      fontSize: RESPONSIVE.fonts.small,
                      marginLeft: 4,
                    }}>
                      Cargo: {formatNumber(stats.cargo)}
                    </Text>
                  </View>
                </View>
              </View>
              
              {/* Cost */}
              <View style={{ 
                backgroundColor: theme.colors.background,
                padding: 12,
                borderRadius: 8,
              }}>
                <Text style={{ 
                  color: theme.colors.textSecondary, 
                  fontSize: RESPONSIVE.fonts.small,
                  fontWeight: "600",
                  marginBottom: 8,
                }}>
                  Unit Cost:
                </Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
                  {cost.metal > 0 && (
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <Ionicons name="hammer" size={14} color={theme.colors.metal} />
                      <Text style={{ 
                        color: theme.colors.text, 
                        fontSize: RESPONSIVE.fonts.small,
                        marginLeft: 4,
                      }}>
                        {formatNumber(cost.metal)}
                      </Text>
                    </View>
                  )}
                  {cost.crystal > 0 && (
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <Ionicons name="diamond" size={14} color={theme.colors.crystal} />
                      <Text style={{ 
                        color: theme.colors.text, 
                        fontSize: RESPONSIVE.fonts.small,
                        marginLeft: 4,
                      }}>
                        {formatNumber(cost.crystal)}
                      </Text>
                    </View>
                  )}
                  {cost.deuterium > 0 && (
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <Ionicons name="water" size={14} color={theme.colors.deuterium} />
                      <Text style={{ 
                        color: theme.colors.text, 
                        fontSize: RESPONSIVE.fonts.small,
                        marginLeft: 4,
                      }}>
                        {formatNumber(cost.deuterium)}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          );
        })}
      </View>
    );
  };
  
  const renderDefenseSection = () => {
    return (
      <View>
        <Text style={{ 
          color: theme.colors.text, 
          fontSize: RESPONSIVE.fonts.xlarge, 
          fontWeight: "bold",
          marginBottom: 16,
        }}>
          Defense Systems
        </Text>
        
        {Object.values(DefenseType).map((defense) => {
          const cost = DEFENSE_BASE_COSTS[defense];
          const stats = DEFENSE_STATS[defense];
          return (
            <View
              key={defense}
              style={{
                backgroundColor: theme.colors.card,
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: theme.colors.border,
              }}
            >
              <Text style={{ 
                color: theme.colors.text, 
                fontSize: RESPONSIVE.fonts.large, 
                fontWeight: "700",
                marginBottom: 8,
              }}>
                {DEFENSE_NAMES[defense]}
              </Text>
              
              <Text style={{ 
                color: theme.colors.textSecondary, 
                fontSize: RESPONSIVE.fonts.body,
                lineHeight: 20,
                marginBottom: 12,
              }}>
                {DEFENSE_DESCRIPTIONS[defense]}
              </Text>
              
              {/* Stats */}
              <View style={{ 
                backgroundColor: theme.colors.background,
                padding: 12,
                borderRadius: 8,
                marginBottom: 8,
              }}>
                <Text style={{ 
                  color: theme.colors.textSecondary, 
                  fontSize: RESPONSIVE.fonts.small,
                  fontWeight: "600",
                  marginBottom: 8,
                }}>
                  Base Stats:
                </Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Ionicons name="flash" size={12} color={theme.colors.danger} />
                    <Text style={{ 
                      color: theme.colors.text, 
                      fontSize: RESPONSIVE.fonts.small,
                      marginLeft: 4,
                    }}>
                      Attack: {formatNumber(stats.attack)}
                    </Text>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Ionicons name="shield" size={12} color={theme.colors.primary} />
                    <Text style={{ 
                      color: theme.colors.text, 
                      fontSize: RESPONSIVE.fonts.small,
                      marginLeft: 4,
                    }}>
                      Shield: {formatNumber(stats.shield)}
                    </Text>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Ionicons name="fitness" size={12} color={theme.colors.crystal} />
                    <Text style={{ 
                      color: theme.colors.text, 
                      fontSize: RESPONSIVE.fonts.small,
                      marginLeft: 4,
                    }}>
                      Armor: {formatNumber(stats.armor)}
                    </Text>
                  </View>
                </View>
              </View>
              
              {/* Cost */}
              <View style={{ 
                backgroundColor: theme.colors.background,
                padding: 12,
                borderRadius: 8,
              }}>
                <Text style={{ 
                  color: theme.colors.textSecondary, 
                  fontSize: RESPONSIVE.fonts.small,
                  fontWeight: "600",
                  marginBottom: 8,
                }}>
                  Unit Cost:
                </Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
                  {cost.metal > 0 && (
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <Ionicons name="hammer" size={14} color={theme.colors.metal} />
                      <Text style={{ 
                        color: theme.colors.text, 
                        fontSize: RESPONSIVE.fonts.small,
                        marginLeft: 4,
                      }}>
                        {formatNumber(cost.metal)}
                      </Text>
                    </View>
                  )}
                  {cost.crystal > 0 && (
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <Ionicons name="diamond" size={14} color={theme.colors.crystal} />
                      <Text style={{ 
                        color: theme.colors.text, 
                        fontSize: RESPONSIVE.fonts.small,
                        marginLeft: 4,
                      }}>
                        {formatNumber(cost.crystal)}
                      </Text>
                    </View>
                  )}
                  {cost.deuterium > 0 && (
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <Ionicons name="water" size={14} color={theme.colors.deuterium} />
                      <Text style={{ 
                        color: theme.colors.text, 
                        fontSize: RESPONSIVE.fonts.small,
                        marginLeft: 4,
                      }}>
                        {formatNumber(cost.deuterium)}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          );
        })}
      </View>
    );
  };
  
  const renderPlanetsSection = () => {
    return (
      <View>
        <Text style={{ 
          color: theme.colors.text, 
          fontSize: RESPONSIVE.fonts.xlarge, 
          fontWeight: "bold",
          marginBottom: 16,
        }}>
          Planet Types
        </Text>
        
        <Text style={{ 
          color: theme.colors.textSecondary, 
          fontSize: RESPONSIVE.fonts.body,
          lineHeight: 20,
          marginBottom: 20,
        }}>
          Different planet types provide bonuses and penalties to resource production. Choose your colonies wisely based on your strategic needs.
        </Text>
        
        {Object.values(PlanetType).map((type) => {
          const bonuses = PLANET_TYPE_BONUSES[type];
          const planetColor = getPlanetTypeColor(type);
          
          return (
            <View
              key={type}
              style={{
                backgroundColor: theme.colors.card,
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: planetColor + "40",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                <Ionicons name="planet" size={24} color={planetColor} style={{ marginRight: 12 }} />
                <Text style={{ 
                  color: theme.colors.text, 
                  fontSize: RESPONSIVE.fonts.large, 
                  fontWeight: "700",
                  flex: 1,
                }}>
                  {getPlanetTypeName(type)}
                </Text>
              </View>
              
              <Text style={{ 
                color: theme.colors.textSecondary, 
                fontSize: RESPONSIVE.fonts.body,
                lineHeight: 20,
                marginBottom: 12,
              }}>
                {bonuses.description}
              </Text>
              
              <View style={{ 
                backgroundColor: theme.colors.background,
                padding: 12,
                borderRadius: 8,
              }}>
                <Text style={{ 
                  color: theme.colors.textSecondary, 
                  fontSize: RESPONSIVE.fonts.small,
                  fontWeight: "600",
                  marginBottom: 8,
                }}>
                  Production Modifiers:
                </Text>
                <View style={{ gap: 6 }}>
                  {bonuses.metal !== 1.0 && (
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <Ionicons 
                        name="hammer" 
                        size={14} 
                        color={bonuses.metal > 1.0 ? theme.colors.success : theme.colors.danger} 
                      />
                      <Text style={{ 
                        color: bonuses.metal > 1.0 ? theme.colors.success : theme.colors.danger,
                        fontSize: RESPONSIVE.fonts.small,
                        marginLeft: 6,
                        fontWeight: "600",
                      }}>
                        Metal: {bonuses.metal > 1.0 ? "+" : ""}{Math.round((bonuses.metal - 1.0) * 100)}%
                      </Text>
                    </View>
                  )}
                  {bonuses.crystal !== 1.0 && (
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <Ionicons 
                        name="diamond" 
                        size={14} 
                        color={bonuses.crystal > 1.0 ? theme.colors.success : theme.colors.danger} 
                      />
                      <Text style={{ 
                        color: bonuses.crystal > 1.0 ? theme.colors.success : theme.colors.danger,
                        fontSize: RESPONSIVE.fonts.small,
                        marginLeft: 6,
                        fontWeight: "600",
                      }}>
                        Crystal: {bonuses.crystal > 1.0 ? "+" : ""}{Math.round((bonuses.crystal - 1.0) * 100)}%
                      </Text>
                    </View>
                  )}
                  {bonuses.deuterium !== 1.0 && (
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <Ionicons 
                        name="water" 
                        size={14} 
                        color={bonuses.deuterium > 1.0 ? theme.colors.success : theme.colors.danger} 
                      />
                      <Text style={{ 
                        color: bonuses.deuterium > 1.0 ? theme.colors.success : theme.colors.danger,
                        fontSize: RESPONSIVE.fonts.small,
                        marginLeft: 6,
                        fontWeight: "600",
                      }}>
                        Deuterium: {bonuses.deuterium > 1.0 ? "+" : ""}{Math.round((bonuses.deuterium - 1.0) * 100)}%
                      </Text>
                    </View>
                  )}
                  {bonuses.energy !== 1.0 && (
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <Ionicons 
                        name="flash" 
                        size={14} 
                        color={bonuses.energy > 1.0 ? theme.colors.success : theme.colors.danger} 
                      />
                      <Text style={{ 
                        color: bonuses.energy > 1.0 ? theme.colors.success : theme.colors.danger,
                        fontSize: RESPONSIVE.fonts.small,
                        marginLeft: 6,
                        fontWeight: "600",
                      }}>
                        Energy: {bonuses.energy > 1.0 ? "+" : ""}{Math.round((bonuses.energy - 1.0) * 100)}%
                      </Text>
                    </View>
                  )}
                  {bonuses.metal === 1.0 && bonuses.crystal === 1.0 && bonuses.deuterium === 1.0 && bonuses.energy === 1.0 && (
                    <Text style={{ 
                      color: theme.colors.textSecondary,
                      fontSize: RESPONSIVE.fonts.small,
                      fontStyle: "italic",
                    }}>
                      No modifiers - Balanced production
                    </Text>
                  )}
                </View>
              </View>
            </View>
          );
        })}
      </View>
    );
  };
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={["top"]}>
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
        <Text style={{ 
          color: theme.colors.text, 
          fontSize: RESPONSIVE.fonts.xxlarge, 
          fontWeight: "bold",
          marginBottom: 16,
        }}>
          Game Wiki
        </Text>
        
        {/* Section Selector */}
        <View style={{ flexDirection: "row", gap: 8 }}>
          {renderSectionButton("buildings", "hammer", "Buildings")}
          {renderSectionButton("research", "flask", "Research")}
          {renderSectionButton("ships", "rocket", "Ships")}
          {renderSectionButton("defense", "shield", "Defense")}
          {renderSectionButton("planets", "planet", "Planets")}
        </View>
      </View>
      
      {/* Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16 }}
      >
        {selectedSection === "buildings" && renderBuildingsSection()}
        {selectedSection === "research" && renderResearchSection()}
        {selectedSection === "ships" && renderShipsSection()}
        {selectedSection === "defense" && renderDefenseSection()}
        {selectedSection === "planets" && renderPlanetsSection()}
      </ScrollView>
    </SafeAreaView>
  );
}
