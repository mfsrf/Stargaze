// PlanetScreen - main screen with tabs for Buildings, Research, Shipyard, Defense, Fleet

import React from "react";
import { View, ScrollView, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import useGameStore from "../state/gameStore";
import useThemeStore from "../state/themeStore";
import ResourceBar from "../components/ResourceBar";
import PlanetSelector from "../components/PlanetSelector";
import BuildingCard from "../components/BuildingCard";
import TechnologyCard from "../components/TechnologyCard";
import ShipCard from "../components/ShipCard";
import DefenseCard from "../components/DefenseCard";
import SendFleetModal from "../components/SendFleetModal";
import { BuildingType, TechnologyType, ShipType, MissionType, DefenseType } from "../types/game";
import { SHIP_STATS, SHIP_NAMES, PLANET_TYPE_BONUSES } from "../utils/gameConstants";
import { 
  formatNumber, 
  calculateShipSpeed, 
  calculateAttackPower,
  calculateShieldPower,
  calculateArmorPower,
} from "../utils/gameFormulas";
import { getPlanetTypeName, getPlanetTypeColor } from "../utils/galaxyManager";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { RESPONSIVE } from "../utils/responsive";

// Ship colors from ShipCard component
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

const Tab = createMaterialTopTabNavigator();

function BuildingsTab() {
  const theme = useThemeStore((state) => state.theme);
  const selectedPlanetId = useGameStore((state) => state.selectedPlanetId);
  const planets = useGameStore((state) => state.player.planets);
  const setMineEfficiency = useGameStore((state) => state.setMineEfficiency);
  
  const planet = planets.find((p) => p.id === selectedPlanetId);
  
  if (!selectedPlanetId || !planet) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: theme.colors.textSecondary }}>No planet selected</Text>
      </View>
    );
  }
  
  const resourceBuildings = [
    BuildingType.MetalMine,
    BuildingType.CrystalMine,
    BuildingType.DeuteriumSynthesizer,
    BuildingType.SolarPlant,
    BuildingType.FusionReactor,
  ];
  
  const storageBuildings = [
    BuildingType.MetalStorage,
    BuildingType.CrystalStorage,
    BuildingType.DeuteriumTank,
  ];
  
  const facilityBuildings = [
    BuildingType.RoboticsFactory,
    BuildingType.Shipyard,
    BuildingType.ResearchLab,
    BuildingType.NaniteFactory,
    BuildingType.Terraformer,
  ];
  
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={{ padding: 16 }}
    >
      {/* Planet Type Info */}
      <View style={{ 
        backgroundColor: theme.colors.card, 
        borderRadius: 12, 
        padding: 16, 
        marginBottom: 16,
        borderWidth: 1,
        borderColor: theme.colors.border,
      }}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
          <Ionicons name="planet" size={24} color={getPlanetTypeColor(planet.type)} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: "bold" }}>
              {getPlanetTypeName(planet.type)} Planet
            </Text>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 12, marginTop: 2 }}>
              {PLANET_TYPE_BONUSES[planet.type].description}
            </Text>
          </View>
        </View>
        
        {/* Production Bonuses */}
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {PLANET_TYPE_BONUSES[planet.type].metal !== 1.0 && (
            <View style={{ 
              flexDirection: "row", 
              alignItems: "center",
              backgroundColor: PLANET_TYPE_BONUSES[planet.type].metal > 1.0 ? theme.colors.success + "20" : theme.colors.danger + "20",
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 6,
            }}>
              <Ionicons name="hammer" size={12} color={theme.colors.metal} />
              <Text style={{ 
                color: PLANET_TYPE_BONUSES[planet.type].metal > 1.0 ? theme.colors.success : theme.colors.danger, 
                fontSize: 11, 
                fontWeight: "600",
                marginLeft: 4,
              }}>
                {PLANET_TYPE_BONUSES[planet.type].metal > 1.0 ? "+" : ""}{Math.round((PLANET_TYPE_BONUSES[planet.type].metal - 1.0) * 100)}%
              </Text>
            </View>
          )}
          {PLANET_TYPE_BONUSES[planet.type].crystal !== 1.0 && (
            <View style={{ 
              flexDirection: "row", 
              alignItems: "center",
              backgroundColor: PLANET_TYPE_BONUSES[planet.type].crystal > 1.0 ? theme.colors.success + "20" : theme.colors.danger + "20",
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 6,
            }}>
              <Ionicons name="diamond" size={12} color={theme.colors.crystal} />
              <Text style={{ 
                color: PLANET_TYPE_BONUSES[planet.type].crystal > 1.0 ? theme.colors.success : theme.colors.danger, 
                fontSize: 11, 
                fontWeight: "600",
                marginLeft: 4,
              }}>
                {PLANET_TYPE_BONUSES[planet.type].crystal > 1.0 ? "+" : ""}{Math.round((PLANET_TYPE_BONUSES[planet.type].crystal - 1.0) * 100)}%
              </Text>
            </View>
          )}
          {PLANET_TYPE_BONUSES[planet.type].deuterium !== 1.0 && (
            <View style={{ 
              flexDirection: "row", 
              alignItems: "center",
              backgroundColor: PLANET_TYPE_BONUSES[planet.type].deuterium > 1.0 ? theme.colors.success + "20" : theme.colors.danger + "20",
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 6,
            }}>
              <Ionicons name="water" size={12} color={theme.colors.deuterium} />
              <Text style={{ 
                color: PLANET_TYPE_BONUSES[planet.type].deuterium > 1.0 ? theme.colors.success : theme.colors.danger, 
                fontSize: 11, 
                fontWeight: "600",
                marginLeft: 4,
              }}>
                {PLANET_TYPE_BONUSES[planet.type].deuterium > 1.0 ? "+" : ""}{Math.round((PLANET_TYPE_BONUSES[planet.type].deuterium - 1.0) * 100)}%
              </Text>
            </View>
          )}
          {PLANET_TYPE_BONUSES[planet.type].energy !== 1.0 && (
            <View style={{ 
              flexDirection: "row", 
              alignItems: "center",
              backgroundColor: PLANET_TYPE_BONUSES[planet.type].energy > 1.0 ? theme.colors.success + "20" : theme.colors.danger + "20",
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 6,
            }}>
              <Ionicons name="flash" size={12} color={theme.colors.energy} />
              <Text style={{ 
                color: PLANET_TYPE_BONUSES[planet.type].energy > 1.0 ? theme.colors.success : theme.colors.danger, 
                fontSize: 11, 
                fontWeight: "600",
                marginLeft: 4,
              }}>
                {PLANET_TYPE_BONUSES[planet.type].energy > 1.0 ? "+" : ""}{Math.round((PLANET_TYPE_BONUSES[planet.type].energy - 1.0) * 100)}%
              </Text>
            </View>
          )}
        </View>
      </View>
      
      <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: "bold", marginBottom: 12 }}>
        Resource Production
      </Text>
      {resourceBuildings.map((building) => (
        <BuildingCard key={building} buildingType={building} planetId={selectedPlanetId} />
      ))}
      
      {/* Mine Efficiency Controls */}
      <View style={{ 
        backgroundColor: theme.colors.card, 
        borderRadius: 12, 
        padding: 16, 
        marginTop: 16,
        borderWidth: 1,
        borderColor: theme.colors.border,
      }}>
        <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: "bold", marginBottom: 12 }}>
          ⚡ Mine Efficiency Controls
        </Text>
        <Text style={{ color: theme.colors.textSecondary, fontSize: 12, marginBottom: 16 }}>
          Reduce efficiency to save energy. Lower efficiency = less production + less energy consumption.
        </Text>
        
        {/* Metal Mine Efficiency */}
        <View style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="hammer" size={16} color={theme.colors.metal} />
              <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: "600", marginLeft: 6 }}>
                Metal Mine
              </Text>
            </View>
            <Text style={{ color: theme.colors.primary, fontSize: 14, fontWeight: "bold" }}>
              {planet.mineEfficiency?.metal || 100}%
            </Text>
          </View>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {[0, 10, 25, 50, 75, 90, 100].map((value) => (
              <TouchableOpacity
                key={value}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setMineEfficiency(selectedPlanetId, "metal", value);
                }}
                activeOpacity={0.7}
                style={{
                  flex: 1,
                  backgroundColor: (planet.mineEfficiency?.metal || 100) === value ? theme.colors.primary : theme.colors.background,
                  paddingVertical: 8,
                  borderRadius: 6,
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                }}
              >
                <Text style={{ 
                  color: (planet.mineEfficiency?.metal || 100) === value ? "#FFFFFF" : theme.colors.textSecondary, 
                  fontSize: 11,
                  fontWeight: "600",
                }}>
                  {value}%
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Crystal Mine Efficiency */}
        <View style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="diamond" size={16} color={theme.colors.crystal} />
              <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: "600", marginLeft: 6 }}>
                Crystal Mine
              </Text>
            </View>
            <Text style={{ color: theme.colors.primary, fontSize: 14, fontWeight: "bold" }}>
              {planet.mineEfficiency?.crystal || 100}%
            </Text>
          </View>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {[0, 10, 25, 50, 75, 90, 100].map((value) => (
              <TouchableOpacity
                key={value}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setMineEfficiency(selectedPlanetId, "crystal", value);
                }}
                activeOpacity={0.7}
                style={{
                  flex: 1,
                  backgroundColor: (planet.mineEfficiency?.crystal || 100) === value ? theme.colors.primary : theme.colors.background,
                  paddingVertical: 8,
                  borderRadius: 6,
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                }}
              >
                <Text style={{ 
                  color: (planet.mineEfficiency?.crystal || 100) === value ? "#FFFFFF" : theme.colors.textSecondary, 
                  fontSize: 11,
                  fontWeight: "600",
                }}>
                  {value}%
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Deuterium Synthesizer Efficiency */}
        <View>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="water" size={16} color={theme.colors.deuterium} />
              <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: "600", marginLeft: 6 }}>
                Deuterium Synth
              </Text>
            </View>
            <Text style={{ color: theme.colors.primary, fontSize: 14, fontWeight: "bold" }}>
              {planet.mineEfficiency?.deuterium || 100}%
            </Text>
          </View>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {[0, 10, 25, 50, 75, 90, 100].map((value) => (
              <TouchableOpacity
                key={value}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setMineEfficiency(selectedPlanetId, "deuterium", value);
                }}
                activeOpacity={0.7}
                style={{
                  flex: 1,
                  backgroundColor: (planet.mineEfficiency?.deuterium || 100) === value ? theme.colors.primary : theme.colors.background,
                  paddingVertical: 8,
                  borderRadius: 6,
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                }}
              >
                <Text style={{ 
                  color: (planet.mineEfficiency?.deuterium || 100) === value ? "#FFFFFF" : theme.colors.textSecondary, 
                  fontSize: 11,
                  fontWeight: "600",
                }}>
                  {value}%
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
      
      <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: "bold", marginBottom: 12, marginTop: 12 }}>
        Storage
      </Text>
      {storageBuildings.map((building) => (
        <BuildingCard key={building} buildingType={building} planetId={selectedPlanetId} />
      ))}
      
      <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: "bold", marginBottom: 12, marginTop: 12 }}>
        Facilities
      </Text>
      {facilityBuildings.map((building) => (
        <BuildingCard key={building} buildingType={building} planetId={selectedPlanetId} />
      ))}
    </ScrollView>
  );
}

function ResearchTab() {
  const theme = useThemeStore((state) => state.theme);
  const planets = useGameStore((state) => state.player.planets);
  
  const hasResearchLab = planets.some((p) => p.buildings[BuildingType.ResearchLab] > 0);
  
  if (!hasResearchLab) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background, alignItems: "center", justifyContent: "center", padding: 20 }}>
        <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: "bold", marginBottom: 8 }}>
          Research Lab Required
        </Text>
        <Text style={{ color: theme.colors.textSecondary, fontSize: 14, textAlign: "center" }}>
          Build a Research Lab in the Buildings tab to unlock technologies.
        </Text>
      </View>
    );
  }
  
  const driveTechnologies = [
    TechnologyType.CombustionDrive,
    TechnologyType.ImpulseDrive,
    TechnologyType.HyperspaceDrive,
  ];
  
  const weaponTechnologies = [
    TechnologyType.EnergyTech,
    TechnologyType.LaserTech,
    TechnologyType.IonTech,
    TechnologyType.PlasmaTech,
    TechnologyType.WeaponsTech,
    TechnologyType.ShieldingTech,
    TechnologyType.ArmorTech,
  ];
  
  const advancedTechnologies = [
    TechnologyType.HyperspaceTech,
    TechnologyType.EspionageTech,
    TechnologyType.ComputerTech,
    TechnologyType.Astrophysics,
  ];
  
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={{ padding: 16 }}
    >
      <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: "bold", marginBottom: 12 }}>
        Propulsion Systems
      </Text>
      {driveTechnologies.map((tech) => (
        <TechnologyCard key={tech} technologyType={tech} />
      ))}
      
      <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: "bold", marginBottom: 12, marginTop: 12 }}>
        Combat Technologies
      </Text>
      {weaponTechnologies.map((tech) => (
        <TechnologyCard key={tech} technologyType={tech} />
      ))}
      
      <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: "bold", marginBottom: 12, marginTop: 12 }}>
        Advanced Research
      </Text>
      {advancedTechnologies.map((tech) => (
        <TechnologyCard key={tech} technologyType={tech} />
      ))}
    </ScrollView>
  );
}

function ShipyardTab() {
  const theme = useThemeStore((state) => state.theme);
  const selectedPlanetId = useGameStore((state) => state.selectedPlanetId);
  const planets = useGameStore((state) => state.player.planets);
  
  if (!selectedPlanetId) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: theme.colors.textSecondary }}>No planet selected</Text>
      </View>
    );
  }
  
  const planet = planets.find((p) => p.id === selectedPlanetId);
  
  if (!planet) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: theme.colors.textSecondary }}>Planet not found</Text>
      </View>
    );
  }
  
  // Check if shipyard exists
  if (planet.buildings[BuildingType.Shipyard] === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background, alignItems: "center", justifyContent: "center", padding: 20 }}>
        <Text style={{ color: theme.colors.textSecondary, textAlign: "center", marginBottom: 8 }}>
          You need to build a Shipyard first!
        </Text>
        <Text style={{ color: theme.colors.textSecondary, textAlign: "center", fontSize: 12 }}>
          (Go to Buildings tab → Facilities)
        </Text>
      </View>
    );
  }
  
  const combatShips = [
    ShipType.LightFighter,
    ShipType.HeavyFighter,
    ShipType.Cruiser,
    ShipType.Battleship,
    ShipType.Battlecruiser,
    ShipType.Bomber,
    ShipType.Destroyer,
    ShipType.Deathstar,
  ];
  
  const civilShips = [
    ShipType.SmallCargo,
    ShipType.LargeCargo,
    ShipType.ColonyShip,
    ShipType.Recycler,
    ShipType.EspionageProbe,
    ShipType.Scout,
  ];
  
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={{ padding: 16 }}
    >
      {/* Combat Ships Section */}
      <View style={{ marginBottom: 20 }}>
        <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: "700", marginBottom: 12 }}>
          Combat Ships
        </Text>
        {combatShips.map((shipType) => (
          <ShipCard key={shipType} shipType={shipType} planetId={selectedPlanetId} />
        ))}
      </View>
      
      {/* Civil Ships Section */}
      <View style={{ marginBottom: 20 }}>
        <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: "700", marginBottom: 12 }}>
          Civil Ships
        </Text>
        {civilShips.map((shipType) => (
          <ShipCard key={shipType} shipType={shipType} planetId={selectedPlanetId} />
        ))}
      </View>
    </ScrollView>
  );
}

function DefenseTab() {
  const theme = useThemeStore((state) => state.theme);
  const selectedPlanetId = useGameStore((state) => state.selectedPlanetId);
  const planets = useGameStore((state) => state.player.planets);
  
  if (!selectedPlanetId) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: theme.colors.textSecondary }}>No planet selected</Text>
      </View>
    );
  }
  
  const planet = planets.find((p) => p.id === selectedPlanetId);
  
  if (!planet) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: theme.colors.textSecondary }}>Planet not found</Text>
      </View>
    );
  }
  
  // Check if shipyard exists (needed for defense)
  if (planet.buildings[BuildingType.Shipyard] === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background, alignItems: "center", justifyContent: "center", padding: 20 }}>
        <Text style={{ color: theme.colors.textSecondary, textAlign: "center", marginBottom: 8 }}>
          You need to build a Shipyard first!
        </Text>
        <Text style={{ color: theme.colors.textSecondary, textAlign: "center", fontSize: 12 }}>
          (Go to Buildings tab → Facilities)
        </Text>
      </View>
    );
  }
  
  const defenseUnits = [
    DefenseType.RocketLauncher,
    DefenseType.LightLaser,
    DefenseType.HeavyLaser,
    DefenseType.GaussCannon,
    DefenseType.IonCannon,
    DefenseType.PlasmaTurret,
  ];
  
  const shieldDomes = [
    DefenseType.SmallShieldDome,
    DefenseType.LargeShieldDome,
  ];
  
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={{ padding: 16 }}
    >
      {/* Defense Units Section */}
      <View style={{ marginBottom: 20 }}>
        <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: "700", marginBottom: 12 }}>
          Defense Units
        </Text>
        {defenseUnits.map((defenseType) => (
          <DefenseCard key={defenseType} defenseType={defenseType} planetId={selectedPlanetId} />
        ))}
      </View>
      
      {/* Shield Domes Section */}
      <View style={{ marginBottom: 20 }}>
        <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: "700", marginBottom: 12 }}>
          Shield Domes
        </Text>
        <Text style={{ color: theme.colors.textSecondary, fontSize: 12, marginBottom: 12 }}>
          Shield domes can only be built once per planet
        </Text>
        {shieldDomes.map((defenseType) => (
          <DefenseCard key={defenseType} defenseType={defenseType} planetId={selectedPlanetId} />
        ))}
      </View>
    </ScrollView>
  );
}

function FleetTab() {
  const theme = useThemeStore((state) => state.theme);
  const selectedPlanetId = useGameStore((state) => state.selectedPlanetId);
  const planets = useGameStore((state) => state.player.planets);
  const playerFleets = useGameStore((state) => state.player.fleets);
  const technologies = useGameStore((state) => state.player.technologies);
  const [isSendFleetModalVisible, setIsSendFleetModalVisible] = React.useState(false);
  
  if (!selectedPlanetId) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: theme.colors.textSecondary }}>No planet selected</Text>
      </View>
    );
  }
  
  const planet = planets.find((p) => p.id === selectedPlanetId);
  
  if (!planet) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: theme.colors.textSecondary }}>Planet not found</Text>
      </View>
    );
  }
  
  // Get ships on this planet
  const availableShips = planet.fleet;
  const totalShips = Object.values(availableShips).reduce((sum, count) => sum + count, 0);
  
  // Get fleets in transit from or to this planet
  const fleetsInTransit = playerFleets.filter(
    (fleet) =>
      (fleet.origin.galaxy === planet.coordinates.galaxy &&
        fleet.origin.system === planet.coordinates.system &&
        fleet.origin.position === planet.coordinates.position) ||
      (fleet.destination.galaxy === planet.coordinates.galaxy &&
        fleet.destination.system === planet.coordinates.system &&
        fleet.destination.position === planet.coordinates.position)
  );
  
  const formatTimeRemaining = (timestamp: number) => {
    const remaining = Math.max(0, timestamp - Date.now());
    const seconds = Math.floor(remaining / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };
  
  const getMissionIcon = (mission: MissionType): keyof typeof Ionicons.glyphMap => {
    switch (mission) {
      case MissionType.Attack:
        return "rocket";
      case MissionType.Transport:
        return "cube";
      case MissionType.Colonize:
        return "home";
      case MissionType.Espionage:
        return "eye";
      case MissionType.Scout:
        return "compass";
      case MissionType.Harvest:
        return "reload";
      case MissionType.Hold:
        return "pause";
      default:
        return "airplane";
    }
  };
  
  const getMissionColor = (mission: MissionType): string => {
    switch (mission) {
      case MissionType.Attack:
        return theme.colors.danger;
      case MissionType.Transport:
        return theme.colors.primary;
      case MissionType.Colonize:
        return theme.colors.success;
      case MissionType.Espionage:
        return theme.colors.secondary;
      case MissionType.Scout:
        return theme.colors.success;
      case MissionType.Harvest:
        return theme.colors.crystal;
      case MissionType.Hold:
        return theme.colors.textSecondary;
      default:
        return theme.colors.text;
    }
  };
  
  return (
    <>
      <SendFleetModal
        visible={isSendFleetModalVisible}
        onClose={() => setIsSendFleetModalVisible(false)}
        planetId={selectedPlanetId}
      />
      <ScrollView
        style={{ flex: 1, backgroundColor: theme.colors.background }}
        contentContainerStyle={{ padding: 16 }}
      >
        {/* Fleet Overview */}
      <View
        style={{
          backgroundColor: theme.colors.card,
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: theme.colors.border,
        }}
      >
        <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: "700", marginBottom: 12 }}>
          Fleet Overview
        </Text>
        <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
          <View style={{ alignItems: "center" }}>
            <Ionicons name="airplane" size={24} color={theme.colors.primary} />
            <Text style={{ color: theme.colors.textSecondary, fontSize: 12, marginTop: 4 }}>
              On Planet
            </Text>
            <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: "700" }}>
              {totalShips}
            </Text>
          </View>
          <View style={{ alignItems: "center" }}>
            <Ionicons name="navigate" size={24} color={theme.colors.secondary} />
            <Text style={{ color: theme.colors.textSecondary, fontSize: 12, marginTop: 4 }}>
              In Transit
            </Text>
            <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: "700" }}>
              {fleetsInTransit.length}
            </Text>
          </View>
        </View>
      </View>
      
      {/* Available Ships */}
      <View style={{ marginBottom: 16 }}>
        <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: "700", marginBottom: 12 }}>
          Available Ships
        </Text>
        {totalShips === 0 ? (
          <View
            style={{
              backgroundColor: theme.colors.card,
              borderRadius: 12,
              padding: 20,
              alignItems: "center",
              borderWidth: 1,
              borderColor: theme.colors.border,
            }}
          >
            <Ionicons name="construct" size={32} color={theme.colors.textSecondary} />
            <Text style={{ color: theme.colors.textSecondary, fontSize: 14, marginTop: 8, textAlign: "center" }}>
              No ships on this planet
            </Text>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 12, marginTop: 4, textAlign: "center" }}>
              Build ships in the Shipyard tab
            </Text>
          </View>
        ) : (
          <View
            style={{
              backgroundColor: theme.colors.card,
              borderRadius: 12,
              padding: 16,
              borderWidth: 1,
              borderColor: theme.colors.border,
            }}
          >
            {Object.entries(availableShips)
              .filter(([_, count]) => count > 0)
              .map(([shipType, count]) => {
                const baseStats = SHIP_STATS[shipType as ShipType];
                const name = SHIP_NAMES[shipType as ShipType];
                const colors = SHIP_COLORS[shipType as ShipType];
                const icon = SHIP_ICONS[shipType as ShipType];
                
                // Calculate stats with technology bonuses
                const stats = {
                  attack: calculateAttackPower(baseStats.attack, technologies[TechnologyType.WeaponsTech]),
                  speed: calculateShipSpeed(
                    baseStats.speed,
                    technologies[TechnologyType.CombustionDrive],
                    technologies[TechnologyType.ImpulseDrive],
                    technologies[TechnologyType.HyperspaceDrive]
                  ),
                };
                
                return (
                  <View
                    key={shipType}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingVertical: 10,
                      borderBottomWidth: 1,
                      borderBottomColor: theme.colors.border,
                    }}
                  >
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: colors[0] + "30",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 12,
                      }}
                    >
                      <Ionicons name={icon} size={20} color={colors[0]} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: "600" }}>
                        {name}
                      </Text>
                      <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
                        Attack: {formatNumber(stats.attack)} • Speed: {formatNumber(stats.speed)}
                      </Text>
                    </View>
                    <View
                      style={{
                        backgroundColor: theme.colors.primary + "20",
                        paddingVertical: 6,
                        paddingHorizontal: 12,
                        borderRadius: 8,
                      }}
                    >
                      <Text style={{ color: theme.colors.primary, fontSize: 16, fontWeight: "700" }}>
                        {count}
                      </Text>
                    </View>
                  </View>
                );
              })}
          </View>
        )}
      </View>
      
      {/* Fleets in Transit */}
      {fleetsInTransit.length > 0 && (
        <View style={{ marginBottom: 16 }}>
          <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: "700", marginBottom: 12 }}>
            Fleets in Transit
          </Text>
          {fleetsInTransit.map((fleet) => {
            const isOutgoing =
              fleet.origin.galaxy === planet.coordinates.galaxy &&
              fleet.origin.system === planet.coordinates.system &&
              fleet.origin.position === planet.coordinates.position;
            const timeToUse = fleet.isReturning ? fleet.returnTime : fleet.arrivalTime;
            const totalFleetShips = Object.values(fleet.ships).reduce((sum, count) => sum + count, 0);
            
            return (
              <View
                key={fleet.id}
                style={{
                  backgroundColor: theme.colors.card,
                  borderRadius: 12,
                  padding: 14,
                  marginBottom: 10,
                  borderWidth: 1,
                  borderLeftWidth: 4,
                  borderColor: theme.colors.border,
                  borderLeftColor: getMissionColor(fleet.mission),
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: getMissionColor(fleet.mission) + "20",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 10,
                    }}
                  >
                    <Ionicons
                      name={getMissionIcon(fleet.mission)}
                      size={18}
                      color={getMissionColor(fleet.mission)}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: "600" }}>
                      {fleet.mission.charAt(0).toUpperCase() + fleet.mission.slice(1)} Mission
                    </Text>
                    <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
                      {isOutgoing ? "Outgoing" : "Returning"} • {totalFleetShips} ships
                    </Text>
                  </View>
                </View>
                
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 8 }}>
                  <View>
                    <Text style={{ color: theme.colors.textSecondary, fontSize: 11 }}>
                      {isOutgoing ? "To" : "From"}
                    </Text>
                    <Text style={{ color: theme.colors.text, fontSize: 12, fontWeight: "600" }}>
                      [{isOutgoing ? fleet.destination.galaxy : fleet.origin.galaxy}:
                      {isOutgoing ? fleet.destination.system : fleet.origin.system}:
                      {isOutgoing ? fleet.destination.position : fleet.origin.position}]
                    </Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={{ color: theme.colors.textSecondary, fontSize: 11 }}>
                      Arrival
                    </Text>
                    <Text style={{ color: theme.colors.success, fontSize: 12, fontWeight: "600" }}>
                      {timeToUse ? formatTimeRemaining(timeToUse) : "N/A"}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      )}
      
      {/* Send Fleet Button */}
      {totalShips > 0 && (
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setIsSendFleetModalVisible(true);
          }}
          activeOpacity={0.7}
          style={{
            backgroundColor: theme.colors.primary,
            borderRadius: 12,
            padding: 16,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 20,
          }}
        >
          <Ionicons name="rocket" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "700" }}>
            Send Fleet
          </Text>
        </TouchableOpacity>
      )}
    </ScrollView>
    </>
  );
}

export default function PlanetScreen() {
  const theme = useThemeStore((state) => state.theme);
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={["top"]}>
      <ResourceBar />
      <PlanetSelector />
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: {
            backgroundColor: theme.colors.card,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
          },
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.textSecondary,
          tabBarIndicatorStyle: {
            backgroundColor: theme.colors.primary,
            height: 3,
          },
          tabBarLabelStyle: {
            fontSize: RESPONSIVE.fonts.small,
            fontWeight: "600",
            textTransform: "none",
            marginHorizontal: 0,
            paddingHorizontal: 0,
          },
          tabBarItemStyle: {
            flex: 1,
            paddingHorizontal: RESPONSIVE.isSmall ? 4 : 8,
          },
          tabBarScrollEnabled: false,
          swipeEnabled: true,
        }}
      >
        <Tab.Screen name="Buildings" component={BuildingsTab} />
        <Tab.Screen name="Research" component={ResearchTab} />
        <Tab.Screen name="Shipyard" component={ShipyardTab} />
        <Tab.Screen name="Defense" component={DefenseTab} />
        <Tab.Screen name="Fleet" component={FleetTab} />
      </Tab.Navigator>
    </SafeAreaView>
  );
}
