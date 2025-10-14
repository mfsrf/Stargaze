// Main game state management store

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { v4 as uuidv4 } from "uuid";
import {
  GameState,
  Player,
  AIPlayer,
  AIDifficulty,
  Planet,
  Resources,
  BuildingType,
  TechnologyType,
  DefenseType,
  Fleet,
  Message,
  Coordinates,
  FleetComposition,
  ShipType,
  MissionType,
  GameSettings,
  PlanetType,
  EspionageReport,
  ScoutReport,
  CombatReport,
  CombatRound,
  DefenseComposition,
  Mission,
  MissionStatus,
} from "../types/game";
import {
  STARTING_RESOURCES,
  INITIAL_BUILDINGS,
  INITIAL_TECHNOLOGIES,
  INITIAL_FLEET,
  INITIAL_DEFENSE,
  DEFAULT_RESOURCE_MULTIPLIER,
  GALAXY_CONFIG,
  SHIP_BASE_COSTS,
  DEFENSE_BASE_COSTS,
  SHIP_PREREQUISITES,
  SHIP_STATS,
  PLANET_TYPE_BONUSES,
} from "../utils/gameConstants";
import {
  calculatePlanetProduction,
  calculateStorageCapacity,
  getBuildingCost,
  getBuildingConstructionTime,
  getTechnologyCost,
  getTechnologyResearchTime,
  canAfford,
  deductCost,
  calculateUsedFields,
  checkShipPrerequisites,
} from "../utils/gameFormulas";
import { getPlanetType, calculateTemperature, getPlanetTypeName } from "../utils/galaxyManager";

interface GameStore extends GameState {
  // Game initialization
  initializeGame: (playerName: string, startGalaxy: number, aiCount: number) => void;
  resetGame: () => void;
  
  // Resource management
  updateResources: () => void;
  addResourcesToPlanet: (planetId: string, amount: number) => void;
  
  // Building management
  upgradeBuilding: (planetId: string, buildingType: BuildingType) => boolean;
  finishConstruction: (planetId: string) => void;
  
  // Research management
  startResearch: (technologyType: TechnologyType) => boolean;
  finishResearch: () => void;
  
  // Fleet management
  buildShips: (planetId: string, shipType: ShipType, quantity: number) => boolean;
  buildDefense: (planetId: string, defenseType: DefenseType, quantity: number) => boolean;
  sendFleet: (
    fromPlanetId: string,
    destination: Coordinates,
    ships: FleetComposition,
    mission: MissionType,
    cargo?: Resources
  ) => boolean;
  
  // Planet management
  colonizePlanet: (coordinates: Coordinates) => boolean;
  renamePlanet: (planetId: string, newName: string) => void;
  selectPlanet: (planetId: string) => void;
  setMineEfficiency: (planetId: string, mineType: "metal" | "crystal" | "deuterium", efficiency: number) => void;
  
  // Message management
  addMessage: (message: Message) => void;
  markMessageAsRead: (messageId: string) => void;
  deleteMessage: (messageId: string) => void;
  
  // Mission management
  checkMissions: () => void;
  claimMissionReward: (missionId: string) => void;
  
  // AI management
  updateAI: () => void;
  
  // Settings
  updateSettings: (settings: Partial<GameSettings>) => void;
  
  // Current selections
  selectedPlanetId: string | null;
  researchQueue: {
    type: TechnologyType;
    startTime: number;
    endTime: number;
  } | null;
}

const createInitialPlanet = (
  name: string,
  coordinates: Coordinates,
  isStarting: boolean
): Planet => {
  const planetType = getPlanetType(coordinates.position);
  const temperature = calculateTemperature(coordinates.position);
  
  return {
    id: uuidv4(),
    name,
    coordinates,
    type: planetType,
    temperature,
    resources: isStarting ? { ...STARTING_RESOURCES } : { metal: 0, crystal: 0, deuterium: 0, energy: 0 },
    buildings: { ...INITIAL_BUILDINGS },
    defense: { ...INITIAL_DEFENSE },
    fleet: { ...INITIAL_FLEET },
    maxFields: 163,
    usedFields: 0,
    lastUpdate: Date.now(),
    constructionQueue: null,
    mineEfficiency: {
      metal: 100,
      crystal: 100,
      deuterium: 100,
    },
  };
};

const createInitialMissions = (): Mission[] => {
  return [
    {
      id: "mission-1",
      name: "Upgrade the Metal Mine to Level 1",
      description: "Metal is the heart of your empire. To produce more you need better facilities. Start by upgrading the Metal Mine to Level 1.",
      requirements: [
        {
          type: "buildingLevel",
          buildingType: BuildingType.MetalMine,
          level: 1,
        },
      ],
      rewards: {
        resources: {
          metal: 500,
          crystal: 500,
          deuterium: 0,
          energy: 0,
        },
      },
      status: MissionStatus.Available,
    },
    {
      id: "mission-2",
      name: "Improve Energy Levels",
      description: "With the upgrade of the Metal Mine you now have negative energy. This means you are consuming more than producing, which decreases the resources that you produce. Balance the energy by upgrading the Solar Plant.",
      requirements: [
        {
          type: "buildingLevel",
          buildingType: BuildingType.SolarPlant,
          level: 1,
        },
      ],
      rewards: {
        resources: {
          metal: 500,
          crystal: 500,
          deuterium: 0,
          energy: 0,
        },
      },
      status: MissionStatus.Available,
    },
  ];
};

const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      // Initial state
      player: {
        id: "",
        name: "",
        planets: [],
        technologies: { ...INITIAL_TECHNOLOGIES },
        fleets: [],
        messages: [],
        exploredSystems: [],
        scoutedPlanets: {},
        missions: [],
        totalPoints: 0,
        economyPoints: 0,
        researchPoints: 0,
        militaryPoints: 0,
      },
      aiPlayers: [],
      settings: {
        resourceMultiplier: DEFAULT_RESOURCE_MULTIPLIER,
        speedMultiplier: 1,
        notificationsEnabled: true,
        darkMode: true,
        instantBuild: false,
      },
      lastUpdate: Date.now(),
      gameStartTime: 0,
      initialized: false,
      selectedPlanetId: null,
      researchQueue: null,
      
      // Initialize new game
      initializeGame: (playerName: string, startGalaxy: number, aiCount: number) => {
        const playerId = uuidv4();
        
        // Create player's starting planet
        const startCoordinates: Coordinates = {
          galaxy: startGalaxy,
          system: Math.floor(Math.random() * GALAXY_CONFIG.systems) + 1,
          position: [4, 6, 8, 10, 12][Math.floor(Math.random() * 5)],
        };
        
        const startingPlanet = createInitialPlanet("Homeworld", startCoordinates, true);
        
        const player: Player = {
          id: playerId,
          name: playerName,
          planets: [startingPlanet],
          technologies: { ...INITIAL_TECHNOLOGIES },
          fleets: [],
          messages: [],
          exploredSystems: [`${startCoordinates.galaxy}:${startCoordinates.system}`], // Start with home system explored
          scoutedPlanets: {},
          missions: createInitialMissions(),
          totalPoints: 0,
          economyPoints: 0,
          researchPoints: 0,
          militaryPoints: 0,
        };
        
        // Create AI players
        const aiPlayers: AIPlayer[] = [];
        const aiNames = [
          "Emperor Xarok",
          "Queen Zarena",
          "Commander Vex",
          "Lord Kryton",
          "Admiral Nexus",
        ];
        const strategies: Array<"defensive" | "balanced" | "aggressive"> = ["defensive", "balanced", "aggressive"];
        
        const allPlanets = [startingPlanet]; // Track all planets to avoid collisions
        
        for (let i = 0; i < aiCount; i++) {
          const aiId = uuidv4();
          
          // Create AI starting planet in a different location
          let aiCoordinates: Coordinates;
          let attempts = 0;
          do {
            aiCoordinates = {
              galaxy: Math.floor(Math.random() * GALAXY_CONFIG.galaxies) + 1,
              system: Math.floor(Math.random() * GALAXY_CONFIG.systems) + 1,
              position: [4, 6, 8, 10, 12][Math.floor(Math.random() * 5)],
            };
            attempts++;
          } while (
            attempts < 50 &&
            allPlanets.some(
              (p) =>
                p.coordinates.galaxy === aiCoordinates.galaxy &&
                p.coordinates.system === aiCoordinates.system &&
                p.coordinates.position === aiCoordinates.position
            )
          );
          
          const aiPlanet = createInitialPlanet(
            `${aiNames[i]} Base`,
            aiCoordinates,
            true
          );
          
          allPlanets.push(aiPlanet);
          
          // Determine difficulty and give AI advantages
          const difficulty =
            aiCount === 3
              ? "easy"
              : aiCount === 4
              ? "medium"
              : "hard";
          
          // Give AI some starting resources based on difficulty
          const resourceMultiplier = difficulty === "easy" ? 1.2 : difficulty === "medium" ? 1.5 : 2;
          aiPlanet.resources = {
            metal: STARTING_RESOURCES.metal * resourceMultiplier,
            crystal: STARTING_RESOURCES.crystal * resourceMultiplier,
            deuterium: STARTING_RESOURCES.deuterium * resourceMultiplier,
            energy: 0,
          };
          
          // Give AI some starting buildings based on difficulty
          if (difficulty === "medium" || difficulty === "hard") {
            aiPlanet.buildings[BuildingType.MetalMine] = 2;
            aiPlanet.buildings[BuildingType.CrystalMine] = 2;
            aiPlanet.buildings[BuildingType.SolarPlant] = 2;
          }
          if (difficulty === "hard") {
            aiPlanet.buildings[BuildingType.MetalMine] = 3;
            aiPlanet.buildings[BuildingType.CrystalMine] = 3;
            aiPlanet.buildings[BuildingType.SolarPlant] = 3;
            aiPlanet.buildings[BuildingType.RoboticsFactory] = 1;
          }
          
          // Assign strategy and generate personality
          const strategy = strategies[i % strategies.length];
          let personality;
          
          if (strategy === "aggressive") {
            personality = {
              aggression: 0.7 + Math.random() * 0.3, // 0.7-1.0
              expansion: 0.4 + Math.random() * 0.3, // 0.4-0.7
              economy: 0.3 + Math.random() * 0.3, // 0.3-0.6
              technology: 0.4 + Math.random() * 0.2, // 0.4-0.6
              riskTolerance: 0.7 + Math.random() * 0.3, // 0.7-1.0
            };
          } else if (strategy === "defensive") {
            personality = {
              aggression: 0.1 + Math.random() * 0.2, // 0.1-0.3
              expansion: 0.5 + Math.random() * 0.3, // 0.5-0.8
              economy: 0.7 + Math.random() * 0.3, // 0.7-1.0
              technology: 0.6 + Math.random() * 0.3, // 0.6-0.9
              riskTolerance: 0.1 + Math.random() * 0.3, // 0.1-0.4
            };
          } else { // balanced
            personality = {
              aggression: 0.4 + Math.random() * 0.3, // 0.4-0.7
              expansion: 0.5 + Math.random() * 0.3, // 0.5-0.8
              economy: 0.5 + Math.random() * 0.3, // 0.5-0.8
              technology: 0.5 + Math.random() * 0.3, // 0.5-0.8
              riskTolerance: 0.4 + Math.random() * 0.3, // 0.4-0.7
            };
          }
          
          const aiPlayer: AIPlayer = {
            id: aiId,
            name: aiNames[i],
            difficulty: difficulty as AIDifficulty,
            planets: [aiPlanet],
            technologies: { ...INITIAL_TECHNOLOGIES },
            fleets: [],
            lastActionTime: Date.now(),
            strategy,
            targetPlayer: undefined,
            personality,
          };
          
          aiPlayers.push(aiPlayer);
        }
        
        set({
          player,
          aiPlayers,
          selectedPlanetId: startingPlanet.id,
          initialized: true,
          gameStartTime: Date.now(),
          lastUpdate: Date.now(),
        });
      },
      
      // Reset game
      resetGame: () => {
        set({
          player: {
            id: "",
            name: "",
            planets: [],
            technologies: { ...INITIAL_TECHNOLOGIES },
            fleets: [],
            messages: [],
            exploredSystems: [],
            scoutedPlanets: {},
            missions: [],
            totalPoints: 0,
            economyPoints: 0,
            researchPoints: 0,
            militaryPoints: 0,
          },
          aiPlayers: [],
          selectedPlanetId: null,
          initialized: false,
          researchQueue: null,
          lastUpdate: Date.now(),
          gameStartTime: 0,
        });
      },
      
      // Update resources based on time passed
      updateResources: () => {
        const state = get();
        const currentTime = Date.now();
        const timeDelta = (currentTime - state.lastUpdate) / 1000; // seconds
        
        const updatedPlanets = state.player.planets.map((planet) => {
          const production = calculatePlanetProduction(planet, state.settings.resourceMultiplier);
          const productionPerSecond = {
            metal: production.metal / 3600,
            crystal: production.crystal / 3600,
            deuterium: production.deuterium / 3600,
            energy: production.energy,
          };
          
          // Calculate storage capacities
          const metalCap = calculateStorageCapacity(planet.buildings[BuildingType.MetalStorage]);
          const crystalCap = calculateStorageCapacity(planet.buildings[BuildingType.CrystalStorage]);
          const deuteriumCap = calculateStorageCapacity(planet.buildings[BuildingType.DeuteriumTank]);
          
          // Update resources with caps
          const newResources = {
            metal: Math.min(planet.resources.metal + productionPerSecond.metal * timeDelta, metalCap),
            crystal: Math.min(planet.resources.crystal + productionPerSecond.crystal * timeDelta, crystalCap),
            deuterium: Math.min(planet.resources.deuterium + productionPerSecond.deuterium * timeDelta, deuteriumCap),
            energy: productionPerSecond.energy,
          };
          
          // Check and complete construction
          let updatedPlanet = { ...planet, resources: newResources };
          if (planet.constructionQueue && currentTime >= planet.constructionQueue.endTime) {
            const buildingType = planet.constructionQueue.type;
            updatedPlanet.buildings = {
              ...updatedPlanet.buildings,
              [buildingType]: updatedPlanet.buildings[buildingType] + 1,
            };
            updatedPlanet.constructionQueue = null;
            updatedPlanet.usedFields = calculateUsedFields(updatedPlanet);
          }
          
          return updatedPlanet;
        });
        
        // Check and complete research
        let updatedTechnologies = { ...state.player.technologies };
        let updatedResearchQueue = state.researchQueue;
        if (state.researchQueue && currentTime >= state.researchQueue.endTime) {
          const techType = state.researchQueue.type;
          updatedTechnologies = {
            ...updatedTechnologies,
            [techType]: updatedTechnologies[techType] + 1,
          };
          updatedResearchQueue = null;
        }
        
        // Process fleet movements
        let updatedFleets = [...state.player.fleets];
        let finalPlanets = [...updatedPlanets];
        
        const newMessages: Message[] = [];
        
        updatedFleets = updatedFleets.filter((fleet) => {
          // Check if fleet arrived at destination
          if (!fleet.isReturning && currentTime >= fleet.arrivalTime) {
            // Process mission on arrival
            if (fleet.mission === MissionType.Transport && fleet.cargo) {
              // Find destination planet (if it's owned by player)
              const destPlanet = finalPlanets.find(
                (p) => p.coordinates.galaxy === fleet.destination.galaxy &&
                       p.coordinates.system === fleet.destination.system &&
                       p.coordinates.position === fleet.destination.position
              );
              
              // Deliver cargo to destination planet
              if (destPlanet) {
                finalPlanets = finalPlanets.map((p) => {
                  if (p.id === destPlanet.id) {
                    return {
                      ...p,
                      resources: {
                        metal: p.resources.metal + fleet.cargo!.metal,
                        crystal: p.resources.crystal + fleet.cargo!.crystal,
                        deuterium: p.resources.deuterium + fleet.cargo!.deuterium,
                        energy: p.resources.energy,
                      },
                    };
                  }
                  return p;
                });
                
                // Count ships sent
                const shipCount = Object.values(fleet.ships).reduce((sum, count) => sum + count, 0);
                const totalCargo = fleet.cargo.metal + fleet.cargo.crystal + fleet.cargo.deuterium;
                
                // Generate detailed transport success message
                newMessages.push({
                  id: uuidv4(),
                  type: "fleet",
                  title: "✓ Transport Successful",
                  content: `Your transport fleet has delivered ${totalCargo.toLocaleString()} resources to ${destPlanet.name}.\n\n📍 Destination: [${fleet.destination.galaxy}:${fleet.destination.system}:${fleet.destination.position}]\n🚀 Fleet: ${shipCount} ships\n\n📦 Delivered:\n  • Metal: ${fleet.cargo.metal.toLocaleString()}\n  • Crystal: ${fleet.cargo.crystal.toLocaleString()}\n  • Deuterium: ${fleet.cargo.deuterium.toLocaleString()}\n\nYour fleet is now returning home.`,
                  timestamp: currentTime,
                  read: false,
                });
              } else {
                // Could not find destination planet
                const shipCount = Object.values(fleet.ships).reduce((sum, count) => sum + count, 0);
                
                newMessages.push({
                  id: uuidv4(),
                  type: "fleet",
                  title: "⚠ Transport Failed",
                  content: `Your transport fleet arrived at [${fleet.destination.galaxy}:${fleet.destination.system}:${fleet.destination.position}] but found no planet to deliver cargo to.\n\n📦 Cargo Returning:\n  • Metal: ${fleet.cargo.metal.toLocaleString()}\n  • Crystal: ${fleet.cargo.crystal.toLocaleString()}\n  • Deuterium: ${fleet.cargo.deuterium.toLocaleString()}\n\n🚀 Fleet: ${shipCount} ships\n\nThe fleet is returning to origin with all cargo.`,
                  timestamp: currentTime,
                  read: false,
                });
              }
            }
            
            // Process espionage missions
            if (fleet.mission === MissionType.Espionage) {
              // Find target planet (could be player's own planet, AI planet, or empty)
              const targetPlanet = finalPlanets.find(
                (p) => p.coordinates.galaxy === fleet.destination.galaxy &&
                       p.coordinates.system === fleet.destination.system &&
                       p.coordinates.position === fleet.destination.position
              );
              
              // Check AI planets too
              let targetAIPlanet: Planet | null = null;
              let targetPlayerName = "Unknown";
              
              if (!targetPlanet) {
                for (const aiPlayer of state.aiPlayers) {
                  const aiPlanet = aiPlayer.planets.find(
                    (p) => p.coordinates.galaxy === fleet.destination.galaxy &&
                           p.coordinates.system === fleet.destination.system &&
                           p.coordinates.position === fleet.destination.position
                  );
                  if (aiPlanet) {
                    targetAIPlanet = aiPlanet;
                    targetPlayerName = aiPlayer.name;
                    break;
                  }
                }
              } else {
                targetPlayerName = state.player.name;
              }
              
              const actualTarget = targetPlanet || targetAIPlanet;
              
              if (actualTarget) {
                // Calculate espionage level based on probe count and tech
                const probeCount = fleet.ships[ShipType.EspionageProbe];
                const espionageTech = state.player.technologies[TechnologyType.EspionageTech];
                
                // Determine what information is revealed (more probes = more info)
                const infoLevel = Math.min(probeCount + espionageTech, 8);
                
                // Build espionage report
                const espionageReport: EspionageReport = {
                  id: uuidv4(),
                  timestamp: currentTime,
                  coordinates: fleet.destination,
                  targetPlayer: targetPlayerName,
                  detectionChance: Math.max(0, 100 - (probeCount * 10 + espionageTech * 5)),
                };
                
                // Level 1+: Always see resources
                if (infoLevel >= 1) {
                  espionageReport.resources = { ...actualTarget.resources };
                }
                
                // Level 3+: See fleet
                if (infoLevel >= 3) {
                  espionageReport.fleet = { ...actualTarget.fleet };
                }
                
                // Level 5+: See defense
                if (infoLevel >= 5) {
                  espionageReport.defense = { ...actualTarget.defense };
                }
                
                // Level 7+: See buildings
                if (infoLevel >= 7) {
                  espionageReport.buildings = { ...actualTarget.buildings };
                }
                
                // Build report content
                let reportContent = `Espionage Report for ${actualTarget.name}\n📍 Location: [${fleet.destination.galaxy}:${fleet.destination.system}:${fleet.destination.position}]\n👤 Owner: ${targetPlayerName}\n🔍 Detection Risk: ${espionageReport.detectionChance}%\n\n`;
                
                if (espionageReport.resources) {
                  const totalRes = espionageReport.resources.metal + espionageReport.resources.crystal + espionageReport.resources.deuterium;
                  reportContent += `💰 RESOURCES (${totalRes.toLocaleString()} total):\n`;
                  reportContent += `  • Metal: ${espionageReport.resources.metal.toLocaleString()}\n`;
                  reportContent += `  • Crystal: ${espionageReport.resources.crystal.toLocaleString()}\n`;
                  reportContent += `  • Deuterium: ${espionageReport.resources.deuterium.toLocaleString()}\n\n`;
                }
                
                if (espionageReport.fleet) {
                  const fleetEntries = Object.entries(espionageReport.fleet).filter(([_, count]) => (count as number) > 0);
                  if (fleetEntries.length > 0) {
                    reportContent += `🚀 FLEET:\n`;
                    fleetEntries.forEach(([type, count]) => {
                      reportContent += `  • ${type}: ${count as number}\n`;
                    });
                    reportContent += "\n";
                  }
                }
                
                if (espionageReport.defense) {
                  const defenseEntries = Object.entries(espionageReport.defense).filter(([_, count]) => (count as number) > 0);
                  if (defenseEntries.length > 0) {
                    reportContent += `🛡️ DEFENSE:\n`;
                    defenseEntries.forEach(([type, count]) => {
                      reportContent += `  • ${type}: ${count as number}\n`;
                    });
                    reportContent += "\n";
                  }
                }
                
                if (espionageReport.buildings) {
                  reportContent += `🏗️ BUILDINGS:\n`;
                  Object.entries(espionageReport.buildings)
                    .filter(([_, level]) => (level as number) > 0)
                    .forEach(([type, level]) => {
                      reportContent += `  • ${type}: Level ${level as number}\n`;
                    });
                }
                
                // Generate espionage message
                newMessages.push({
                  id: uuidv4(),
                  type: "espionage",
                  title: `🔍 Espionage Report: ${actualTarget.name}`,
                  content: reportContent,
                  timestamp: currentTime,
                  read: false,
                  data: espionageReport,
                });
              } else {
                // No planet found
                newMessages.push({
                  id: uuidv4(),
                  type: "espionage",
                  title: "🔍 Espionage: No Target",
                  content: `Your espionage probes arrived at [${fleet.destination.galaxy}:${fleet.destination.system}:${fleet.destination.position}] but found no planet.\n\nThe position is empty or uninhabited.`,
                  timestamp: currentTime,
                  read: false,
                });
              }
            }
            
            // Process scout missions
            if (fleet.mission === MissionType.Scout) {
              // Find target planet (could be player's own planet, AI planet, or empty)
              const targetPlanet = finalPlanets.find(
                (p) => p.coordinates.galaxy === fleet.destination.galaxy &&
                       p.coordinates.system === fleet.destination.system &&
                       p.coordinates.position === fleet.destination.position
              );
              
              // Check AI planets too
              let targetAIPlanet: Planet | null = null;
              let targetOwnerName = "Unoccupied";
              
              if (!targetPlanet) {
                for (const aiPlayer of state.aiPlayers) {
                  const aiPlanet = aiPlayer.planets.find(
                    (p) => p.coordinates.galaxy === fleet.destination.galaxy &&
                           p.coordinates.system === fleet.destination.system &&
                           p.coordinates.position === fleet.destination.position
                  );
                  if (aiPlanet) {
                    targetAIPlanet = aiPlanet;
                    targetOwnerName = aiPlayer.name;
                    break;
                  }
                }
              } else {
                targetOwnerName = state.player.name;
              }
              
              const actualTarget = targetPlanet || targetAIPlanet;
              
              // Generate planet info even if empty position
              const position = fleet.destination.position;
              const planetType = getPlanetType(position);
              const temperature = calculateTemperature(position);
              const maxFields = Math.floor(150 + Math.random() * 100); // 150-250 fields
              const planetName = actualTarget?.name || `Position ${position}`;
              
              // Build scout report
              const scoutReport: ScoutReport = {
                id: uuidv4(),
                timestamp: currentTime,
                coordinates: fleet.destination,
                planetName: planetName,
                planetType: planetType,
                temperature: temperature,
                maxFields: maxFields,
                owner: actualTarget ? targetOwnerName : null,
              };
              
              // Get planet type info from constants
              const planetTypeInfo = PLANET_TYPE_BONUSES[planetType];
              const planetTypeName = getPlanetTypeName(planetType);
              
              // Build report content
              let reportContent = `Scout Report for ${planetName}\n📍 Location: [${fleet.destination.galaxy}:${fleet.destination.system}:${fleet.destination.position}]\n\n`;
              reportContent += `🌍 PLANET CHARACTERISTICS:\n`;
              reportContent += `  • Type: ${planetTypeName}\n`;
              reportContent += `  • Temperature: ${temperature}°C\n`;
              reportContent += `  • Fields: ${maxFields}\n`;
              reportContent += `  • Status: ${actualTarget ? `Occupied by ${targetOwnerName}` : "Unoccupied - Available for colonization"}\n\n`;
              reportContent += `📊 PRODUCTION BONUSES:\n`;
              reportContent += `  • ${planetTypeInfo.description}\n\n`;
              
              // Show bonuses/penalties
              const bonuses = [];
              if (planetTypeInfo.metal !== 1.0) {
                const sign = planetTypeInfo.metal > 1.0 ? "+" : "";
                bonuses.push(`  • Metal: ${sign}${Math.round((planetTypeInfo.metal - 1.0) * 100)}%`);
              }
              if (planetTypeInfo.crystal !== 1.0) {
                const sign = planetTypeInfo.crystal > 1.0 ? "+" : "";
                bonuses.push(`  • Crystal: ${sign}${Math.round((planetTypeInfo.crystal - 1.0) * 100)}%`);
              }
              if (planetTypeInfo.deuterium !== 1.0) {
                const sign = planetTypeInfo.deuterium > 1.0 ? "+" : "";
                bonuses.push(`  • Deuterium: ${sign}${Math.round((planetTypeInfo.deuterium - 1.0) * 100)}%`);
              }
              if (planetTypeInfo.energy !== 1.0) {
                const sign = planetTypeInfo.energy > 1.0 ? "+" : "";
                bonuses.push(`  • Energy: ${sign}${Math.round((planetTypeInfo.energy - 1.0) * 100)}%`);
              }
              
              if (bonuses.length > 0) {
                reportContent += bonuses.join("\n");
              }
              
              // Store scout report in player's scouted planets record
              const coordKey = `${fleet.destination.galaxy}:${fleet.destination.system}:${fleet.destination.position}`;
              state.player.scoutedPlanets[coordKey] = scoutReport;
              
              // Generate scout message
              newMessages.push({
                id: uuidv4(),
                type: "other",
                title: `🧭 Scout Report: ${planetName}`,
                content: reportContent,
                timestamp: currentTime,
                read: false,
                data: scoutReport,
              });
            }
            
            // Process attack missions
            if (fleet.mission === MissionType.Attack) {
              // Find target planet (could be AI planet)
              let targetPlanet: Planet | null = null;
              let targetPlayerName = "Unknown";
              let isPlayerPlanet = false;
              
              // Check player planets first
              targetPlanet = finalPlanets.find(
                (p) => p.coordinates.galaxy === fleet.destination.galaxy &&
                       p.coordinates.system === fleet.destination.system &&
                       p.coordinates.position === fleet.destination.position
              ) || null;
              
              if (targetPlanet) {
                targetPlayerName = state.player.name;
                isPlayerPlanet = true;
              } else {
                // Check AI planets
                for (const aiPlayer of state.aiPlayers) {
                  const aiPlanet = aiPlayer.planets.find(
                    (p) => p.coordinates.galaxy === fleet.destination.galaxy &&
                           p.coordinates.system === fleet.destination.system &&
                           p.coordinates.position === fleet.destination.position
                  );
                  if (aiPlanet) {
                    targetPlanet = aiPlanet;
                    targetPlayerName = aiPlayer.name;
                    break;
                  }
                }
              }
              
              if (targetPlanet) {
                // Calculate combat
                const attackerFleet = { ...fleet.ships };
                const defenderFleet = { ...targetPlanet.fleet };
                const defenderDefense = { ...targetPlanet.defense };
                
                // Simple combat resolution (can be made more complex)
                let attackerPower = 0;
                let defenderPower = 0;
                
                // Calculate attacker power
                Object.entries(attackerFleet).forEach(([shipType, count]) => {
                  const stats = SHIP_STATS[shipType as ShipType];
                  if (stats && count > 0) {
                    attackerPower += stats.attack * count;
                  }
                });
                
                // Calculate defender fleet power
                Object.entries(defenderFleet).forEach(([shipType, count]) => {
                  const stats = SHIP_STATS[shipType as ShipType];
                  if (stats && (count as number) > 0) {
                    defenderPower += stats.attack * (count as number);
                  }
                });
                
                // Calculate defender defense power (defense is worth 1.5x)
                Object.entries(defenderDefense).forEach(([defType, count]) => {
                  if ((count as number) > 0) {
                    defenderPower += 100 * (count as number) * 1.5;
                  }
                });
                
                // Determine winner
                const attackerWins = attackerPower > defenderPower;
                const powerRatio = attackerWins ? attackerPower / Math.max(defenderPower, 1) : defenderPower / Math.max(attackerPower, 1);
                
                // Calculate losses (simplified)
                const attackerLosses: FleetComposition = {} as FleetComposition;
                const defenderShipLosses: FleetComposition = {} as FleetComposition;
                const defenderDefenseLosses: DefenseComposition = {} as DefenseComposition;
                
                if (attackerWins) {
                  // Attacker wins - light losses for attacker, heavy for defender
                  Object.entries(attackerFleet).forEach(([shipType, count]) => {
                    const lossPercent = Math.random() * 0.3; // 0-30% losses
                    attackerLosses[shipType as ShipType] = Math.floor(count * lossPercent);
                  });
                  
                  // Defender loses most/all
                  Object.entries(defenderFleet).forEach(([shipType, count]) => {
                    const lossPercent = 0.7 + Math.random() * 0.3; // 70-100% losses
                    defenderShipLosses[shipType as ShipType] = Math.floor((count as number) * lossPercent);
                  });
                  
                  Object.entries(defenderDefense).forEach(([defType, count]) => {
                    const lossPercent = 0.5 + Math.random() * 0.3; // 50-80% losses
                    defenderDefenseLosses[defType as DefenseType] = Math.floor((count as number) * lossPercent);
                  });
                } else {
                  // Defender wins - heavy losses for attacker
                  Object.entries(attackerFleet).forEach(([shipType, count]) => {
                    const lossPercent = 0.7 + Math.random() * 0.3; // 70-100% losses
                    attackerLosses[shipType as ShipType] = Math.floor(count * lossPercent);
                  });
                  
                  // Defender light losses
                  Object.entries(defenderFleet).forEach(([shipType, count]) => {
                    const lossPercent = Math.random() * 0.3; // 0-30% losses
                    defenderShipLosses[shipType as ShipType] = Math.floor((count as number) * lossPercent);
                  });
                  
                  Object.entries(defenderDefense).forEach(([defType, count]) => {
                    const lossPercent = Math.random() * 0.2; // 0-20% losses
                    defenderDefenseLosses[defType as DefenseType] = Math.floor((count as number) * lossPercent);
                  });
                }
                
                // Calculate plunder if attacker wins
                let plunder: Resources | undefined;
                if (attackerWins) {
                  const maxPlunder = Object.entries(fleet.ships).reduce((total, [shipType, count]) => {
                    const cargo = SHIP_STATS[shipType as ShipType]?.cargo || 0;
                    return total + (cargo * count);
                  }, 0);
                  
                  const availableResources = targetPlanet.resources.metal + targetPlanet.resources.crystal + targetPlanet.resources.deuterium;
                  const plunderAmount = Math.min(maxPlunder * 0.5, availableResources * 0.5); // Can plunder up to 50% of resources or cargo capacity
                  
                  plunder = {
                    metal: Math.floor(targetPlanet.resources.metal * 0.5 * (plunderAmount / availableResources)),
                    crystal: Math.floor(targetPlanet.resources.crystal * 0.5 * (plunderAmount / availableResources)),
                    deuterium: Math.floor(targetPlanet.resources.deuterium * 0.5 * (plunderAmount / availableResources)),
                    energy: 0,
                  };
                  
                  // Deduct plundered resources from target
                  if (isPlayerPlanet) {
                    finalPlanets = finalPlanets.map((p) => {
                      if (p.id === targetPlanet!.id) {
                        // Update fleet with losses
                        const updatedFleet = { ...p.fleet };
                        Object.keys(updatedFleet).forEach((type) => {
                          const shipType = type as ShipType;
                          updatedFleet[shipType] = Math.max(0, updatedFleet[shipType] - (defenderShipLosses[shipType] || 0));
                        });
                        
                        // Update defense with losses
                        const updatedDefense = { ...p.defense };
                        Object.keys(updatedDefense).forEach((type) => {
                          const defType = type as DefenseType;
                          updatedDefense[defType] = Math.max(0, (updatedDefense[defType] as number) - (defenderDefenseLosses[defType] || 0));
                        });
                        
                        return {
                          ...p,
                          resources: {
                            metal: p.resources.metal - plunder!.metal,
                            crystal: p.resources.crystal - plunder!.crystal,
                            deuterium: p.resources.deuterium - plunder!.deuterium,
                            energy: p.resources.energy,
                          },
                          fleet: updatedFleet,
                          defense: updatedDefense,
                        };
                      }
                      return p;
                    });
                  }
                }
                
                // Update attacker fleet (subtract losses)
                Object.entries(attackerLosses).forEach(([shipType, losses]) => {
                  fleet.ships[shipType as ShipType] = Math.max(0, fleet.ships[shipType as ShipType] - losses);
                });
                
                // Add plunder to fleet cargo
                if (plunder) {
                  fleet.cargo = plunder;
                }
                
                // Create combat report
                const defenderFleetAfter = { ...defenderFleet };
                Object.keys(defenderFleetAfter).forEach((type) => {
                  const shipType = type as ShipType;
                  defenderFleetAfter[shipType] = Math.max(0, (defenderFleetAfter[shipType] as number) - (defenderShipLosses[shipType] || 0));
                });
                
                const defenderDefenseAfter = { ...defenderDefense };
                Object.keys(defenderDefenseAfter).forEach((type) => {
                  const defType = type as DefenseType;
                  defenderDefenseAfter[defType] = Math.max(0, (defenderDefenseAfter[defType] as number) - (defenderDefenseLosses[defType] || 0));
                });
                
                const combatReport: CombatReport = {
                  id: uuidv4(),
                  timestamp: currentTime,
                  coordinates: fleet.destination,
                  attacker: state.player.name,
                  defender: targetPlayerName,
                  attackerFleet: attackerFleet,
                  defenderFleet: defenderFleet,
                  defenderDefense: defenderDefense,
                  rounds: [], // Simplified - not tracking individual rounds
                  result: attackerWins ? "attackerWin" : "defenderWin",
                  plunder,
                  attackerFleetAfter: fleet.ships,
                  defenderFleetAfter: defenderFleetAfter,
                  defenderDefenseAfter: defenderDefenseAfter,
                };
                
                // Build combat report message
                let reportContent = `⚔️ BATTLE AT ${targetPlanet.name}\n📍 [${fleet.destination.galaxy}:${fleet.destination.system}:${fleet.destination.position}]\n\n`;
                reportContent += `🎯 RESULT: ${attackerWins ? "VICTORY!" : "DEFEAT"}\n\n`;
                
                // Attacker losses
                const totalAttackerLosses = Object.values(attackerLosses).reduce((sum, count) => sum + count, 0);
                reportContent += `YOUR LOSSES (${totalAttackerLosses} ships):\n`;
                Object.entries(attackerLosses).forEach(([type, count]) => {
                  if (count > 0) reportContent += `  • ${type}: ${count}\n`;
                });
                
                // Defender losses
                const totalDefenderShipLosses = Object.values(defenderShipLosses).reduce((sum, count) => sum + count, 0);
                const totalDefenderDefenseLosses = Object.values(defenderDefenseLosses).reduce((sum, count) => sum + count, 0);
                reportContent += `\nENEMY LOSSES:\n`;
                reportContent += `  Ships: ${totalDefenderShipLosses}\n`;
                reportContent += `  Defense: ${totalDefenderDefenseLosses}\n`;
                
                if (plunder) {
                  const totalPlunder = plunder.metal + plunder.crystal + plunder.deuterium;
                  reportContent += `\n💰 PLUNDER (${totalPlunder.toLocaleString()}):\n`;
                  reportContent += `  • Metal: ${plunder.metal.toLocaleString()}\n`;
                  reportContent += `  • Crystal: ${plunder.crystal.toLocaleString()}\n`;
                  reportContent += `  • Deuterium: ${plunder.deuterium.toLocaleString()}\n`;
                }
                
                // Generate combat message
                newMessages.push({
                  id: uuidv4(),
                  type: "combat",
                  title: attackerWins ? "⚔️ Victory!" : "⚔️ Defeat",
                  content: reportContent,
                  timestamp: currentTime,
                  read: false,
                  data: combatReport,
                });
              } else {
                // No planet found
                newMessages.push({
                  id: uuidv4(),
                  type: "fleet",
                  title: "⚔️ Attack: No Target",
                  content: `Your attack fleet arrived at [${fleet.destination.galaxy}:${fleet.destination.system}:${fleet.destination.position}] but found no planet to attack.\n\nThe position is empty.`,
                  timestamp: currentTime,
                  read: false,
                });
              }
            }
            
            // Fleet arrived - mark as returning
            fleet.isReturning = true;
            return true;
          }
          
          // Check if fleet returned home
          if (fleet.isReturning && fleet.returnTime && currentTime >= fleet.returnTime) {
            // Return ships to origin planet
            const originPlanet = finalPlanets.find(
              (p) => p.coordinates.galaxy === fleet.origin.galaxy &&
                     p.coordinates.system === fleet.origin.system &&
                     p.coordinates.position === fleet.origin.position
            );
            
            if (originPlanet) {
              const updatedFleet: FleetComposition = { ...originPlanet.fleet };
              for (const [shipType, count] of Object.entries(fleet.ships)) {
                if (count > 0) {
                  updatedFleet[shipType as ShipType] += count;
                }
              }
              
              // If transport mission failed, return cargo
              // Also return plunder from successful attacks
              let updatedResources = originPlanet.resources;
              if (fleet.mission === MissionType.Transport && fleet.cargo) {
                const destPlanet = finalPlanets.find(
                  (p) => p.coordinates.galaxy === fleet.destination.galaxy &&
                         p.coordinates.system === fleet.destination.system &&
                         p.coordinates.position === fleet.destination.position
                );
                
                // Return cargo only if destination wasn't found (failed delivery)
                if (!destPlanet) {
                  updatedResources = {
                    metal: originPlanet.resources.metal + fleet.cargo.metal,
                    crystal: originPlanet.resources.crystal + fleet.cargo.crystal,
                    deuterium: originPlanet.resources.deuterium + fleet.cargo.deuterium,
                    energy: originPlanet.resources.energy,
                  };
                }
              }
              
              // Return plunder from attack missions
              if (fleet.mission === MissionType.Attack && fleet.cargo) {
                updatedResources = {
                  metal: originPlanet.resources.metal + fleet.cargo.metal,
                  crystal: originPlanet.resources.crystal + fleet.cargo.crystal,
                  deuterium: originPlanet.resources.deuterium + fleet.cargo.deuterium,
                  energy: originPlanet.resources.energy,
                };
              }
              
              finalPlanets = finalPlanets.map((p) => 
                p.id === originPlanet.id ? { ...p, fleet: updatedFleet, resources: updatedResources } : p
              );
            }
            
            // Remove fleet
            return false;
          }
          
          return true;
        });
        
        set({
          player: {
            ...state.player,
            planets: finalPlanets,
            technologies: updatedTechnologies,
            fleets: updatedFleets,
            messages: [...newMessages, ...state.player.messages],
          },
          researchQueue: updatedResearchQueue,
          lastUpdate: currentTime,
        });
        
        // Update AI after player resources
        get().updateAI();
        
        // Check mission progress
        get().checkMissions();
      },
      
      // Upgrade building
      upgradeBuilding: (planetId: string, buildingType: BuildingType) => {
        const state = get();
        const planet = state.player.planets.find((p) => p.id === planetId);
        if (!planet || planet.constructionQueue) return false;
        
        const currentLevel = planet.buildings[buildingType];
        const cost = getBuildingCost(buildingType, currentLevel);
        
        if (!canAfford(planet.resources, cost)) return false;
        
        // Check field availability
        const fieldsNeeded = calculateUsedFields(planet) + 1;
        if (fieldsNeeded > planet.maxFields) return false;
        
        const constructionTime = getBuildingConstructionTime(
          buildingType,
          currentLevel,
          planet.buildings[BuildingType.RoboticsFactory],
          planet.buildings[BuildingType.NaniteFactory]
        );
        
        const updatedPlanets = state.player.planets.map((p) => {
          if (p.id === planetId) {
            return {
              ...p,
              resources: deductCost(p.resources, cost),
              constructionQueue: {
                type: buildingType,
                startTime: Date.now(),
                endTime: Date.now() + constructionTime * 1000,
              },
            };
          }
          return p;
        });
        
        set({
          player: {
            ...state.player,
            planets: updatedPlanets,
          },
        });
        
        return true;
      },
      
      // Finish construction manually (for immediate completion)
      finishConstruction: (planetId: string) => {
        const state = get();
        const updatedPlanets = state.player.planets.map((planet) => {
          if (planet.id === planetId && planet.constructionQueue) {
            const buildingType = planet.constructionQueue.type;
            return {
              ...planet,
              buildings: {
                ...planet.buildings,
                [buildingType]: planet.buildings[buildingType] + 1,
              },
              constructionQueue: null,
              usedFields: calculateUsedFields(planet) + 1,
            };
          }
          return planet;
        });
        
        set({
          player: {
            ...state.player,
            planets: updatedPlanets,
          },
        });
      },
      
      // Start research
      startResearch: (technologyType: TechnologyType) => {
        const state = get();
        if (state.researchQueue) return false;
        
        const currentLevel = state.player.technologies[technologyType];
        const cost = getTechnologyCost(technologyType, currentLevel);
        
        // Find planet with highest research lab that can afford it
        const planet = state.player.planets.find((p) =>
          p.buildings[BuildingType.ResearchLab] > 0 && canAfford(p.resources, cost)
        );
        
        if (!planet) return false;
        
        const researchTime = getTechnologyResearchTime(
          technologyType,
          currentLevel,
          planet.buildings[BuildingType.ResearchLab]
        );
        
        const updatedPlanets = state.player.planets.map((p) => {
          if (p.id === planet.id) {
            return {
              ...p,
              resources: deductCost(p.resources, cost),
            };
          }
          return p;
        });
        
        set({
          player: {
            ...state.player,
            planets: updatedPlanets,
          },
          researchQueue: {
            type: technologyType,
            startTime: Date.now(),
            endTime: Date.now() + researchTime * 1000,
          },
        });
        
        return true;
      },
      
      // Finish research
      finishResearch: () => {
        const state = get();
        if (!state.researchQueue) return;
        
        const techType = state.researchQueue.type;
        set({
          player: {
            ...state.player,
            technologies: {
              ...state.player.technologies,
              [techType]: state.player.technologies[techType] + 1,
            },
          },
          researchQueue: null,
        });
      },
      
      // Build ships
      buildShips: (planetId: string, shipType: ShipType, quantity: number) => {
        const state = get();
        const planet = state.player.planets.find((p) => p.id === planetId);
        if (!planet || planet.buildings[BuildingType.Shipyard] === 0) return false;
        
        // Check prerequisites
        const prerequisites = SHIP_PREREQUISITES[shipType];
        const prerequisiteCheck = checkShipPrerequisites(
          shipType,
          planet.buildings,
          state.player.technologies,
          prerequisites
        );
        
        if (!prerequisiteCheck.met) {
          return false;
        }
        
        // Calculate total cost
        const shipCost = SHIP_BASE_COSTS[shipType];
        const totalCost = {
          metal: shipCost.metal * quantity,
          crystal: shipCost.crystal * quantity,
          deuterium: shipCost.deuterium * quantity,
          energy: 0,
        };
        
        if (!canAfford(planet.resources, totalCost)) return false;
        
        const updatedPlanets = state.player.planets.map((p) => {
          if (p.id === planetId) {
            return {
              ...p,
              resources: deductCost(p.resources, totalCost),
              fleet: {
                ...p.fleet,
                [shipType]: p.fleet[shipType] + quantity,
              },
            };
          }
          return p;
        });
        
        set({
          player: {
            ...state.player,
            planets: updatedPlanets,
          },
        });
        
        return true;
      },
      
      // Build defense
      buildDefense: (planetId: string, defenseType: DefenseType, quantity: number) => {
        const state = get();
        const planet = state.player.planets.find((p) => p.id === planetId);
        if (!planet || planet.buildings[BuildingType.Shipyard] === 0) return false;
        
        // Calculate total cost
        const defenseCost = DEFENSE_BASE_COSTS[defenseType];
        const totalCost = {
          metal: defenseCost.metal * quantity,
          crystal: defenseCost.crystal * quantity,
          deuterium: defenseCost.deuterium * quantity,
          energy: 0,
        };
        
        if (!canAfford(planet.resources, totalCost)) return false;
        
        const updatedPlanets = state.player.planets.map((p) => {
          if (p.id === planetId) {
            return {
              ...p,
              resources: deductCost(p.resources, totalCost),
              defense: {
                ...p.defense,
                [defenseType]: p.defense[defenseType] + quantity,
              },
            };
          }
          return p;
        });
        
        set({
          player: {
            ...state.player,
            planets: updatedPlanets,
          },
        });
        
        return true;
      },
      
      // Send fleet (simplified for now)
      sendFleet: (
        fromPlanetId: string,
        destination: Coordinates,
        ships: FleetComposition,
        mission: MissionType,
        cargo?: Resources
      ) => {
        const state = get();
        const sourcePlanet = state.player.planets.find((p) => p.id === fromPlanetId);
        
        if (!sourcePlanet) return false;
        
        // Check if player has enough ships
        for (const [shipType, count] of Object.entries(ships)) {
          if (count > 0 && sourcePlanet.fleet[shipType as ShipType] < count) {
            return false;
          }
        }
        
        // Validate cargo if it's a transport mission
        if (mission === MissionType.Transport && cargo) {
          // Check if player has enough resources
          if (cargo.metal > sourcePlanet.resources.metal) return false;
          if (cargo.crystal > sourcePlanet.resources.crystal) return false;
          if (cargo.deuterium > sourcePlanet.resources.deuterium) return false;
          
          // Check if cargo fits in ship capacity
          const totalCargoCapacity = Object.entries(ships).reduce((total, [shipType, count]) => {
            if (count > 0) {
              const cargoCapacity = SHIP_STATS[shipType as ShipType]?.cargo || 0;
              return total + (cargoCapacity * count);
            }
            return total;
          }, 0);
          
          const totalCargoWeight = cargo.metal + cargo.crystal + cargo.deuterium;
          if (totalCargoWeight > totalCargoCapacity) return false;
        }
        
        // Calculate travel time (simplified - 30 seconds per system difference)
        const galaxyDiff = Math.abs(destination.galaxy - sourcePlanet.coordinates.galaxy);
        const systemDiff = Math.abs(destination.system - sourcePlanet.coordinates.system);
        const positionDiff = Math.abs(destination.position - sourcePlanet.coordinates.position);
        const travelTime = (galaxyDiff * 60 + systemDiff * 30 + positionDiff * 10) * 1000; // in milliseconds
        const minTravelTime = 10000; // minimum 10 seconds
        const actualTravelTime = Math.max(travelTime, minTravelTime);
        
        const now = Date.now();
        const arrivalTime = now + actualTravelTime;
        const returnTime = arrivalTime + actualTravelTime;
        
        // Create fleet
        const newFleet: Fleet = {
          id: uuidv4(),
          ships,
          mission,
          origin: sourcePlanet.coordinates,
          destination,
          departureTime: now,
          arrivalTime,
          returnTime,
          cargo,
          isReturning: false,
          ownerId: "player",
        };
        
        // Deduct ships and cargo resources from source planet
        const updatedPlanets = state.player.planets.map((p) => {
          if (p.id === fromPlanetId) {
            const updatedFleet: FleetComposition = { ...p.fleet };
            for (const [shipType, count] of Object.entries(ships)) {
              if (count > 0) {
                updatedFleet[shipType as ShipType] -= count;
              }
            }
            
            // Deduct cargo resources if transport mission
            const updatedResources = mission === MissionType.Transport && cargo ? {
              metal: p.resources.metal - cargo.metal,
              crystal: p.resources.crystal - cargo.crystal,
              deuterium: p.resources.deuterium - cargo.deuterium,
              energy: p.resources.energy,
            } : p.resources;
            
            return {
              ...p,
              fleet: updatedFleet,
              resources: updatedResources,
            };
          }
          return p;
        });
        
        // Add fleet to player's fleets
        set({
          player: {
            ...state.player,
            planets: updatedPlanets,
            fleets: [...state.player.fleets, newFleet],
          },
        });
        
        return true;
      },
      
      // Colonize planet
      colonizePlanet: (coordinates: Coordinates) => {
        const state = get();
        
        // Check if player has a colony ship
        let colonyShipPlanet: Planet | null = null;
        for (const planet of state.player.planets) {
          if (planet.fleet[ShipType.ColonyShip] > 0) {
            colonyShipPlanet = planet;
            break;
          }
        }
        
        if (!colonyShipPlanet) return false;
        
        // Create new planet
        const newPlanet = createInitialPlanet(
          `Colony ${state.player.planets.length + 1}`,
          coordinates,
          false
        );
        
        // Remove colony ship
        const updatedPlanets = state.player.planets.map((p) => {
          if (p.id === colonyShipPlanet!.id) {
            return {
              ...p,
              fleet: {
                ...p.fleet,
                [ShipType.ColonyShip]: p.fleet[ShipType.ColonyShip] - 1,
              },
            };
          }
          return p;
        });
        
        updatedPlanets.push(newPlanet);
        
        set({
          player: {
            ...state.player,
            planets: updatedPlanets,
          },
        });
        
        return true;
      },
      
      // Rename planet
      renamePlanet: (planetId: string, newName: string) => {
        const state = get();
        const updatedPlanets = state.player.planets.map((p) => {
          if (p.id === planetId) {
            return { ...p, name: newName };
          }
          return p;
        });
        
        set({
          player: {
            ...state.player,
            planets: updatedPlanets,
          },
        });
      },
      
      // Select planet
      selectPlanet: (planetId: string) => {
        set({ selectedPlanetId: planetId });
      },
      
      // Set mine efficiency
      setMineEfficiency: (planetId: string, mineType: "metal" | "crystal" | "deuterium", efficiency: number) => {
        const state = get();
        const clampedEfficiency = Math.max(0, Math.min(100, efficiency));
        
        const updatedPlanets = state.player.planets.map((planet) => {
          if (planet.id === planetId) {
            return {
              ...planet,
              mineEfficiency: {
                ...planet.mineEfficiency,
                [mineType]: clampedEfficiency,
              },
            };
          }
          return planet;
        });
        
        set({
          player: {
            ...state.player,
            planets: updatedPlanets,
          },
        });
      },
      
      // Add message
      addMessage: (message: Message) => {
        const state = get();
        set({
          player: {
            ...state.player,
            messages: [message, ...state.player.messages],
          },
        });
      },
      
      // Mark message as read
      markMessageAsRead: (messageId: string) => {
        const state = get();
        set({
          player: {
            ...state.player,
            messages: state.player.messages.map((m) =>
              m.id === messageId ? { ...m, read: true } : m
            ),
          },
        });
      },
      
      // Delete message
      deleteMessage: (messageId: string) => {
        const state = get();
        set({
          player: {
            ...state.player,
            messages: state.player.messages.filter((m) => m.id !== messageId),
          },
        });
      },
      
      // Update settings
      updateSettings: (settings: Partial<GameSettings>) => {
        const state = get();
        set({
          settings: {
            ...state.settings,
            ...settings,
          },
        });
      },
      
      // Check missions for completion
      checkMissions: () => {
        const state = get();
        
        // Migration: Add missions to old saved games
        if (!state.player.missions) {
          set({
            player: {
              ...state.player,
              missions: createInitialMissions(),
            },
          });
          return;
        }
        
        const updatedMissions = state.player.missions.map((mission) => {
          if (mission.status === MissionStatus.Completed) return mission;
          
          // Check if all requirements are met
          const allRequirementsMet = mission.requirements.every((req) => {
            if (req.type === "buildingLevel" && req.buildingType) {
              // Check if any planet has the required building level
              return state.player.planets.some(
                (planet) => planet.buildings[req.buildingType!] >= (req.level || 1)
              );
            }
            if (req.type === "technologyLevel" && req.technologyType) {
              return state.player.technologies[req.technologyType] >= (req.level || 1);
            }
            return false;
          });
          
          // Mission complete but not yet claimed
          if (allRequirementsMet && !mission.readyNotificationSent) {
            // Send notification that mission is ready
            get().addMessage({
              id: uuidv4(),
              type: "other",
              title: "🎯 Mission Ready!",
              content: `Mission "${mission.name}" is ready to claim!\n\nHead to the Missions tab to collect your rewards.`,
              timestamp: Date.now(),
              read: false,
            });
            
            return { ...mission, readyNotificationSent: true };
          }
          
          return mission;
        });
        
        set({
          player: {
            ...state.player,
            missions: updatedMissions,
          },
        });
      },
      
      // Claim mission reward
      claimMissionReward: (missionId: string) => {
        const state = get();
        const mission = state.player.missions.find((m) => m.id === missionId);
        
        if (!mission || mission.status === MissionStatus.Completed) return;
        
        // Check if mission requirements are met
        const allRequirementsMet = mission.requirements.every((req) => {
          if (req.type === "buildingLevel" && req.buildingType) {
            return state.player.planets.some(
              (planet) => planet.buildings[req.buildingType!] >= (req.level || 1)
            );
          }
          if (req.type === "technologyLevel" && req.technologyType) {
            return state.player.technologies[req.technologyType] >= (req.level || 1);
          }
          return false;
        });
        
        if (!allRequirementsMet) return;
        
        // Award resources to first planet
        let updatedPlanets = [...state.player.planets];
        if (mission.rewards.resources && updatedPlanets.length > 0) {
          updatedPlanets[0] = {
            ...updatedPlanets[0],
            resources: {
              metal: updatedPlanets[0].resources.metal + (mission.rewards.resources.metal || 0),
              crystal: updatedPlanets[0].resources.crystal + (mission.rewards.resources.crystal || 0),
              deuterium: updatedPlanets[0].resources.deuterium + (mission.rewards.resources.deuterium || 0),
              energy: updatedPlanets[0].resources.energy,
            },
          };
        }
        
        // Award ships to first planet
        if (mission.rewards.ships && updatedPlanets.length > 0) {
          const updatedFleet = { ...updatedPlanets[0].fleet };
          Object.entries(mission.rewards.ships).forEach(([shipType, count]) => {
            if (count) {
              updatedFleet[shipType as ShipType] += count;
            }
          });
          updatedPlanets[0] = {
            ...updatedPlanets[0],
            fleet: updatedFleet,
          };
        }
        
        // Mark mission as completed
        const updatedMissions = state.player.missions.map((m) =>
          m.id === missionId ? { ...m, status: MissionStatus.Completed } : m
        );
        
        set({
          player: {
            ...state.player,
            planets: updatedPlanets,
            missions: updatedMissions,
          },
        });
        
        // Add notification message
        get().addMessage({
          id: uuidv4(),
          type: "other",
          title: `🎉 Mission Complete!`,
          content: `You completed: ${mission.name}\n\nRewards claimed successfully!`,
          timestamp: Date.now(),
          read: false,
        });
      },
      
      // Add resources to planet (cheat for testing)
      addResourcesToPlanet: (planetId: string, amount: number) => {
        const state = get();
        const updatedPlanets = state.player.planets.map((planet) => {
          if (planet.id === planetId) {
            return {
              ...planet,
              resources: {
                ...planet.resources,
                metal: planet.resources.metal + amount,
                crystal: planet.resources.crystal + amount,
                deuterium: planet.resources.deuterium + amount,
              },
            };
          }
          return planet;
        });
        
        set({
          player: {
            ...state.player,
            planets: updatedPlanets,
          },
        });
      },
      
      // AI Update Logic
      updateAI: () => {
        const state = get();
        const currentTime = Date.now();
        
        const updatedAIPlayers = state.aiPlayers.map((ai) => {
          // Migrate old AI without personality (for saved games)
          if (!ai.personality) {
            let personality;
            if (ai.strategy === "aggressive") {
              personality = {
                aggression: 0.7 + Math.random() * 0.3,
                expansion: 0.4 + Math.random() * 0.3,
                economy: 0.3 + Math.random() * 0.3,
                technology: 0.4 + Math.random() * 0.2,
                riskTolerance: 0.7 + Math.random() * 0.3,
              };
            } else if (ai.strategy === "defensive") {
              personality = {
                aggression: 0.1 + Math.random() * 0.2,
                expansion: 0.5 + Math.random() * 0.3,
                economy: 0.7 + Math.random() * 0.3,
                technology: 0.6 + Math.random() * 0.3,
                riskTolerance: 0.1 + Math.random() * 0.3,
              };
            } else {
              personality = {
                aggression: 0.4 + Math.random() * 0.3,
                expansion: 0.5 + Math.random() * 0.3,
                economy: 0.5 + Math.random() * 0.3,
                technology: 0.5 + Math.random() * 0.3,
                riskTolerance: 0.4 + Math.random() * 0.3,
              };
            }
            ai = { ...ai, personality };
          }
          
          // Only update AI every 30 seconds to 2 minutes based on difficulty
          const updateInterval = ai.difficulty === "easy" ? 120000 : ai.difficulty === "medium" ? 60000 : 30000;
          if (currentTime - ai.lastActionTime < updateInterval) {
            return ai;
          }
          
          let updatedAI = { ...ai, lastActionTime: currentTime };
          
          // Update AI resources for all planets
          updatedAI.planets = updatedAI.planets.map((planet) => {
            const production = calculatePlanetProduction(planet, state.settings.resourceMultiplier);
            const timeDelta = (currentTime - planet.lastUpdate) / 1000;
            const productionPerSecond = {
              metal: production.metal / 3600,
              crystal: production.crystal / 3600,
              deuterium: production.deuterium / 3600,
              energy: production.energy,
            };
            
            // Calculate storage capacities
            const metalCap = calculateStorageCapacity(planet.buildings[BuildingType.MetalStorage]);
            const crystalCap = calculateStorageCapacity(planet.buildings[BuildingType.CrystalStorage]);
            const deuteriumCap = calculateStorageCapacity(planet.buildings[BuildingType.DeuteriumTank]);
            
            return {
              ...planet,
              resources: {
                metal: Math.min(planet.resources.metal + productionPerSecond.metal * timeDelta, metalCap),
                crystal: Math.min(planet.resources.crystal + productionPerSecond.crystal * timeDelta, crystalCap),
                deuterium: Math.min(planet.resources.deuterium + productionPerSecond.deuterium * timeDelta, deuteriumCap),
                energy: productionPerSecond.energy,
              },
              lastUpdate: currentTime,
            };
          });
          
          // AI Decision Making
          const mainPlanet = updatedAI.planets[0];
          if (!mainPlanet) return updatedAI;
          
          // 1. Build Economy (if personality.economy is high)
          if (Math.random() < updatedAI.personality.economy) {
            const economyBuildings = [
              BuildingType.MetalMine,
              BuildingType.CrystalMine,
              BuildingType.DeuteriumSynthesizer,
              BuildingType.SolarPlant,
            ];
            
            for (const buildingType of economyBuildings) {
              if (mainPlanet.constructionQueue) break;
              
              const currentLevel = mainPlanet.buildings[buildingType];
              const cost = getBuildingCost(buildingType, currentLevel);
              
              if (canAfford(mainPlanet.resources, cost) && calculateUsedFields(mainPlanet) < mainPlanet.maxFields) {
                updatedAI.planets[0] = {
                  ...mainPlanet,
                  resources: deductCost(mainPlanet.resources, cost),
                  constructionQueue: {
                    type: buildingType,
                    startTime: currentTime,
                    endTime: currentTime + 60000, // 1 minute for AI
                  },
                };
                break;
              }
            }
          }
          
          // 2. Build Military (if personality.aggression is high)
          if (Math.random() < updatedAI.personality.aggression && mainPlanet.buildings[BuildingType.Shipyard] > 0) {
            const shipType = ai.strategy === "aggressive" ? ShipType.LightFighter : ShipType.SmallCargo;
            const shipCost = SHIP_BASE_COSTS[shipType];
            const quantity = Math.floor(mainPlanet.resources.metal / shipCost.metal);
            
            if (quantity > 0 && quantity <= 10) {
              const totalCost = {
                metal: shipCost.metal * quantity,
                crystal: shipCost.crystal * quantity,
                deuterium: shipCost.deuterium * quantity,
                energy: 0,
              };
              
              if (canAfford(mainPlanet.resources, totalCost)) {
                updatedAI.planets[0] = {
                  ...mainPlanet,
                  resources: deductCost(mainPlanet.resources, totalCost),
                  fleet: {
                    ...mainPlanet.fleet,
                    [shipType]: mainPlanet.fleet[shipType] + quantity,
                  },
                };
              }
            }
          }
          
          // 3. Send Attack Fleet (if aggressive and has enough ships)
          if (Math.random() < updatedAI.personality.aggression * 0.5) {
            const totalFighters = mainPlanet.fleet[ShipType.LightFighter] + mainPlanet.fleet[ShipType.HeavyFighter];
            
            if (totalFighters >= 10) {
              // Find a target (player's weakest planet)
              const targetPlanet = state.player.planets.reduce((weakest, planet) => {
                const planetFleet = Object.values(planet.fleet).reduce((sum, count) => sum + count, 0);
                const weakestFleet = Object.values(weakest.fleet).reduce((sum, count) => sum + count, 0);
                return planetFleet < weakestFleet ? planet : weakest;
              });
              
              // Calculate risk
              const targetDefense = Object.values(targetPlanet.fleet).reduce((sum, count) => sum + count, 0);
              const riskLevel = targetDefense / totalFighters;
              
              // Only attack if risk is acceptable based on personality
              if (riskLevel < (1 - updatedAI.personality.riskTolerance) * 2) {
                const attackShips: FleetComposition = {
                  ...INITIAL_FLEET,
                  [ShipType.LightFighter]: Math.floor(mainPlanet.fleet[ShipType.LightFighter] * 0.7),
                  [ShipType.HeavyFighter]: Math.floor(mainPlanet.fleet[ShipType.HeavyFighter] * 0.7),
                };
                
                // Create AI fleet
                const newFleet: Fleet = {
                  id: uuidv4(),
                  ships: attackShips,
                  mission: MissionType.Attack,
                  origin: mainPlanet.coordinates,
                  destination: targetPlanet.coordinates,
                  departureTime: currentTime,
                  arrivalTime: currentTime + 60000, // 1 minute travel
                  returnTime: currentTime + 120000, // Return after 2 minutes
                  isReturning: false,
                  ownerId: ai.id,
                };
                
                // Deduct ships from AI planet
                updatedAI.planets[0] = {
                  ...mainPlanet,
                  fleet: {
                    ...mainPlanet.fleet,
                    [ShipType.LightFighter]: mainPlanet.fleet[ShipType.LightFighter] - attackShips[ShipType.LightFighter],
                    [ShipType.HeavyFighter]: mainPlanet.fleet[ShipType.HeavyFighter] - attackShips[ShipType.HeavyFighter],
                  },
                };
                
                updatedAI.fleets = [...updatedAI.fleets, newFleet];
                updatedAI.targetPlayer = state.player.id;
                
                // Send notification to player
                get().addMessage({
                  id: uuidv4(),
                  type: "other",
                  title: `⚠️ Incoming Attack!`,
                  content: `${ai.name} is sending an attack fleet to ${targetPlanet.name}!\n\n📍 Target: [${targetPlanet.coordinates.galaxy}:${targetPlanet.coordinates.system}:${targetPlanet.coordinates.position}]\n🚀 Enemy Fleet: ${attackShips[ShipType.LightFighter]} Light Fighters, ${attackShips[ShipType.HeavyFighter]} Heavy Fighters\n⏰ Arrival: ~1 minute\n\nPrepare your defenses!`,
                  timestamp: currentTime,
                  read: false,
                });
              }
            }
          }
          
          return updatedAI;
        });
        
        set({
          aiPlayers: updatedAIPlayers,
        });
      },
    }),
    {
      name: "game-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        player: state.player,
        aiPlayers: state.aiPlayers,
        settings: state.settings,
        lastUpdate: state.lastUpdate,
        gameStartTime: state.gameStartTime,
        initialized: state.initialized,
        selectedPlanetId: state.selectedPlanetId,
        researchQueue: state.researchQueue,
      }),
    }
  )
);

export default useGameStore;
