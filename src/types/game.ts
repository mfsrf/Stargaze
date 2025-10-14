// Game type definitions for OGame-inspired space strategy game

export interface Coordinates {
  galaxy: number;
  system: number;
  position: number;
}

export interface Resources {
  metal: number;
  crystal: number;
  deuterium: number;
  energy: number;
}

export enum BuildingType {
  MetalMine = "metalMine",
  CrystalMine = "crystalMine",
  DeuteriumSynthesizer = "deuteriumSynthesizer",
  SolarPlant = "solarPlant",
  FusionReactor = "fusionReactor",
  MetalStorage = "metalStorage",
  CrystalStorage = "crystalStorage",
  DeuteriumTank = "deuteriumTank",
  RoboticsFactory = "roboticsFactory",
  Shipyard = "shipyard",
  ResearchLab = "researchLab",
  AllianceDepot = "allianceDepot",
  NaniteFactory = "naniteFactory",
  Terraformer = "terraformer"
}

export enum TechnologyType {
  EnergyTech = "energyTech",
  LaserTech = "laserTech",
  IonTech = "ionTech",
  HyperspaceTech = "hyperspaceTech",
  PlasmaTech = "plasmaTech",
  CombustionDrive = "combustionDrive",
  ImpulseDrive = "impulseDrive",
  HyperspaceDrive = "hyperspaceDrive",
  EspionageTech = "espionageTech",
  ComputerTech = "computerTech",
  Astrophysics = "astrophysics",
  WeaponsTech = "weaponsTech",
  ShieldingTech = "shieldingTech",
  ArmorTech = "armorTech"
}

export enum ShipType {
  LightFighter = "lightFighter",
  HeavyFighter = "heavyFighter",
  Cruiser = "cruiser",
  Battleship = "battleship",
  Battlecruiser = "battlecruiser",
  Bomber = "bomber",
  Destroyer = "destroyer",
  Deathstar = "deathstar",
  SmallCargo = "smallCargo",
  LargeCargo = "largeCargo",
  ColonyShip = "colonyShip",
  Recycler = "recycler",
  EspionageProbe = "espionageProbe",
  Scout = "scout"
}

export enum DefenseType {
  RocketLauncher = "rocketLauncher",
  LightLaser = "lightLaser",
  HeavyLaser = "heavyLaser",
  GaussCannon = "gaussCannon",
  IonCannon = "ionCannon",
  PlasmaTurret = "plasmaTurret",
  SmallShieldDome = "smallShieldDome",
  LargeShieldDome = "largeShieldDome"
}

export enum MissionType {
  Attack = "attack",
  Transport = "transport",
  Colonize = "colonize",
  Espionage = "espionage",
  Harvest = "harvest",
  Hold = "hold",
  Scout = "scout"
}

export interface BuildingLevels {
  [BuildingType.MetalMine]: number;
  [BuildingType.CrystalMine]: number;
  [BuildingType.DeuteriumSynthesizer]: number;
  [BuildingType.SolarPlant]: number;
  [BuildingType.FusionReactor]: number;
  [BuildingType.MetalStorage]: number;
  [BuildingType.CrystalStorage]: number;
  [BuildingType.DeuteriumTank]: number;
  [BuildingType.RoboticsFactory]: number;
  [BuildingType.Shipyard]: number;
  [BuildingType.ResearchLab]: number;
  [BuildingType.AllianceDepot]: number;
  [BuildingType.NaniteFactory]: number;
  [BuildingType.Terraformer]: number;
}

export interface TechnologyLevels {
  [TechnologyType.EnergyTech]: number;
  [TechnologyType.LaserTech]: number;
  [TechnologyType.IonTech]: number;
  [TechnologyType.HyperspaceTech]: number;
  [TechnologyType.PlasmaTech]: number;
  [TechnologyType.CombustionDrive]: number;
  [TechnologyType.ImpulseDrive]: number;
  [TechnologyType.HyperspaceDrive]: number;
  [TechnologyType.EspionageTech]: number;
  [TechnologyType.ComputerTech]: number;
  [TechnologyType.Astrophysics]: number;
  [TechnologyType.WeaponsTech]: number;
  [TechnologyType.ShieldingTech]: number;
  [TechnologyType.ArmorTech]: number;
}

export interface FleetComposition {
  [ShipType.LightFighter]: number;
  [ShipType.HeavyFighter]: number;
  [ShipType.Cruiser]: number;
  [ShipType.Battleship]: number;
  [ShipType.Battlecruiser]: number;
  [ShipType.Bomber]: number;
  [ShipType.Destroyer]: number;
  [ShipType.Deathstar]: number;
  [ShipType.SmallCargo]: number;
  [ShipType.LargeCargo]: number;
  [ShipType.ColonyShip]: number;
  [ShipType.Recycler]: number;
  [ShipType.EspionageProbe]: number;
  [ShipType.Scout]: number;
}

export interface DefenseComposition {
  [DefenseType.RocketLauncher]: number;
  [DefenseType.LightLaser]: number;
  [DefenseType.HeavyLaser]: number;
  [DefenseType.GaussCannon]: number;
  [DefenseType.IonCannon]: number;
  [DefenseType.PlasmaTurret]: number;
  [DefenseType.SmallShieldDome]: number;
  [DefenseType.LargeShieldDome]: number;
}

export interface ConstructionQueue {
  type: BuildingType;
  startTime: number;
  endTime: number;
}

export interface ResearchQueue {
  type: TechnologyType;
  startTime: number;
  endTime: number;
}

export enum PlanetType {
  // Standard planets (original)
  Frozen = "frozen",        // Positions 1-3
  Desert = "desert",        // Positions 4-6
  Jungle = "jungle",        // Positions 7-9
  Normal = "normal",        // Positions 10-12
  Water = "water",          // Positions 13-15
  
  // Special planets (new)
  Toxic = "toxic",          // High metal, reduced crystal
  NoAtmosphere = "noAtmosphere", // High energy, reduced deuterium
  Ocean = "ocean",          // High deuterium, reduced metal
  GasGiant = "gasGiant",    // High crystal, no metal/deuterium
  Volcanic = "volcanic",    // High energy, high metal, reduced crystal
  Barren = "barren",        // Reduced all resources
  Ice = "ice",              // High deuterium, reduced energy
  Lava = "lava",            // High metal, high energy, no deuterium
}

export interface Planet {
  id: string;
  name: string;
  coordinates: Coordinates;
  type: PlanetType;
  temperature: number;
  resources: Resources;
  buildings: BuildingLevels;
  defense: DefenseComposition;
  fleet: FleetComposition;
  maxFields: number;
  usedFields: number;
  lastUpdate: number;
  constructionQueue: ConstructionQueue | null;
  mineEfficiency: {
    metal: number; // 0-100 (percentage)
    crystal: number; // 0-100 (percentage)
    deuterium: number; // 0-100 (percentage)
  };
}

export interface Fleet {
  id: string;
  ships: FleetComposition;
  mission: MissionType;
  origin: Coordinates;
  destination: Coordinates;
  departureTime: number;
  arrivalTime: number;
  returnTime?: number;
  cargo?: Resources;
  isReturning: boolean;
  ownerId: string;
}

export interface CombatRound {
  attackerShips: FleetComposition;
  defenderShips: FleetComposition;
  defenderDefense: DefenseComposition;
  attackerLosses: FleetComposition;
  defenderShipLosses: FleetComposition;
  defenderDefenseLosses: DefenseComposition;
  attackerDamage: number;
  defenderDamage: number;
}

export interface CombatReport {
  id: string;
  timestamp: number;
  coordinates: Coordinates;
  attacker: string;
  defender: string;
  attackerFleet: FleetComposition;
  defenderFleet: FleetComposition;
  defenderDefense: DefenseComposition;
  rounds: CombatRound[];
  result: "attackerWin" | "defenderWin" | "draw";
  plunder?: Resources;
  debrisField?: Resources;
  attackerFleetAfter: FleetComposition;
  defenderFleetAfter: FleetComposition;
  defenderDefenseAfter: DefenseComposition;
}

export interface EspionageReport {
  id: string;
  timestamp: number;
  coordinates: Coordinates;
  targetPlayer: string;
  resources?: Resources;
  fleet?: FleetComposition;
  defense?: DefenseComposition;
  buildings?: Partial<BuildingLevels>;
  research?: Partial<TechnologyLevels>;
  detectionChance: number;
}

export interface ScoutReport {
  id: string;
  timestamp: number;
  coordinates: Coordinates;
  planetName: string;
  planetType: PlanetType;
  temperature: number;
  maxFields: number;
  owner: string | null;
}

export interface Message {
  id: string;
  timestamp: number;
  type: "combat" | "espionage" | "fleet" | "other";
  title: string;
  content: string;
  read: boolean;
  data?: CombatReport | EspionageReport | any;
}

export enum AIDifficulty {
  Easy = "easy",
  Medium = "medium",
  Hard = "hard"
}

export interface AIPlayer {
  id: string;
  name: string;
  difficulty: AIDifficulty;
  planets: Planet[];
  technologies: TechnologyLevels;
  fleets: Fleet[];
  lastActionTime: number;
  strategy: "defensive" | "balanced" | "aggressive";
  targetPlayer?: string;
  personality: {
    aggression: number; // 0-1: How likely to attack
    expansion: number; // 0-1: Priority for colonization
    economy: number; // 0-1: Focus on resource production
    technology: number; // 0-1: Research priority
    riskTolerance: number; // 0-1: Willingness to take risks
  };
}

export interface Player {
  id: string;
  name: string;
  planets: Planet[];
  technologies: TechnologyLevels;
  fleets: Fleet[];
  messages: Message[];
  exploredSystems: string[]; // Format: "galaxy:system"
  scoutedPlanets: Record<string, ScoutReport>; // Format: "galaxy:system:position" -> ScoutReport
  missions: Mission[];
  totalPoints: number;
  economyPoints: number;
  researchPoints: number;
  militaryPoints: number;
}

export interface GalaxyPosition {
  coordinates: Coordinates;
  planet: Planet | null;
  ownerId: string | null;
  playerName: string | null;
  debrisField: Resources | null;
}

export interface GameSettings {
  resourceMultiplier: number;
  speedMultiplier: number;
  notificationsEnabled: boolean;
  darkMode: boolean;
  instantBuild: boolean;
}

export interface GameState {
  player: Player;
  aiPlayers: AIPlayer[];
  settings: GameSettings;
  lastUpdate: number;
  gameStartTime: number;
  initialized: boolean;
}

export enum MissionStatus {
  Available = "available",
  Completed = "completed",
}

export interface MissionRequirement {
  type: "buildingLevel" | "technologyLevel" | "shipsBuilt" | "resourceAmount";
  buildingType?: BuildingType;
  technologyType?: TechnologyType;
  shipType?: ShipType;
  level?: number;
  amount?: number;
}

export interface MissionReward {
  resources?: Resources;
  ships?: Partial<FleetComposition>;
}

export interface Mission {
  id: string;
  name: string;
  description: string;
  requirements: MissionRequirement[];
  rewards: MissionReward;
  status: MissionStatus;
  readyNotificationSent?: boolean; // Track if we already sent notification
}
