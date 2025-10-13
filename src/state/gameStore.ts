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
import { getPlanetType, calculateTemperature } from "../utils/galaxyManager";

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
  
  // Message management
  addMessage: (message: Message) => void;
  markMessageAsRead: (messageId: string) => void;
  deleteMessage: (messageId: string) => void;
  
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
  };
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
          
          const aiPlayer: AIPlayer = {
            id: aiId,
            name: aiNames[i],
            difficulty: difficulty as AIDifficulty,
            planets: [aiPlanet],
            technologies: { ...INITIAL_TECHNOLOGIES },
            fleets: [],
            lastActionTime: Date.now(),
            strategy: strategies[i % strategies.length],
            targetPlayer: undefined,
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
        
        updatedFleets = updatedFleets.filter((fleet) => {
          // Check if fleet arrived at destination
          if (!fleet.isReturning && currentTime >= fleet.arrivalTime) {
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
              
              finalPlanets = finalPlanets.map((p) => 
                p.id === originPlanet.id ? { ...p, fleet: updatedFleet } : p
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
          },
          researchQueue: updatedResearchQueue,
          lastUpdate: currentTime,
        });
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
        
        // Deduct ships from source planet
        const updatedPlanets = state.player.planets.map((p) => {
          if (p.id === fromPlanetId) {
            const updatedFleet: FleetComposition = { ...p.fleet };
            for (const [shipType, count] of Object.entries(ships)) {
              if (count > 0) {
                updatedFleet[shipType as ShipType] -= count;
              }
            }
            return {
              ...p,
              fleet: updatedFleet,
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
