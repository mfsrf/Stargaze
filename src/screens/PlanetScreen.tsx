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
import { BuildingType, TechnologyType } from "../types/game";

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
  
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ color: theme.colors.textSecondary }}>Shipyard coming soon</Text>
    </View>
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
