// PlanetScreen - main screen with tabs for Buildings, Research, Shipyard, Fleet

import React from "react";
import { View, ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import useGameStore from "../state/gameStore";
import useThemeStore from "../state/themeStore";
import ResourceBar from "../components/ResourceBar";
import PlanetSelector from "../components/PlanetSelector";
import BuildingCard from "../components/BuildingCard";
import TechnologyCard from "../components/TechnologyCard";
import ShipCard from "../components/ShipCard";
import { BuildingType, TechnologyType, ShipType } from "../types/game";

const Tab = createMaterialTopTabNavigator();

function BuildingsTab() {
  const theme = useThemeStore((state) => state.theme);
  const selectedPlanetId = useGameStore((state) => state.selectedPlanetId);
  
  if (!selectedPlanetId) {
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
      <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: "bold", marginBottom: 12 }}>
        Resource Production
      </Text>
      {resourceBuildings.map((building) => (
        <BuildingCard key={building} buildingType={building} planetId={selectedPlanetId} />
      ))}
      
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

function FleetTab() {
  const theme = useThemeStore((state) => state.theme);
  
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ color: theme.colors.textSecondary }}>Fleet coming soon</Text>
    </View>
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
            fontSize: 12,
            fontWeight: "600",
            textTransform: "none",
          },
          swipeEnabled: true,
        }}
      >
        <Tab.Screen name="Buildings" component={BuildingsTab} />
        <Tab.Screen name="Research" component={ResearchTab} />
        <Tab.Screen name="Shipyard" component={ShipyardTab} />
        <Tab.Screen name="Fleet" component={FleetTab} />
      </Tab.Navigator>
    </SafeAreaView>
  );
}
