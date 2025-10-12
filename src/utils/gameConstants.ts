// Game constants and configurations

import {
  BuildingType,
  TechnologyType,
  ShipType,
  DefenseType,
  Resources,
  BuildingLevels,
  TechnologyLevels,
  FleetComposition,
  DefenseComposition,
} from "../types/game";

// Base costs for buildings (metal, crystal, deuterium)
export const BUILDING_BASE_COSTS: Record<BuildingType, Resources> = {
  [BuildingType.MetalMine]: { metal: 60, crystal: 15, deuterium: 0, energy: 0 },
  [BuildingType.CrystalMine]: { metal: 48, crystal: 24, deuterium: 0, energy: 0 },
  [BuildingType.DeuteriumSynthesizer]: { metal: 225, crystal: 75, deuterium: 0, energy: 0 },
  [BuildingType.SolarPlant]: { metal: 75, crystal: 30, deuterium: 0, energy: 0 },
  [BuildingType.FusionReactor]: { metal: 900, crystal: 360, deuterium: 180, energy: 0 },
  [BuildingType.MetalStorage]: { metal: 1000, crystal: 0, deuterium: 0, energy: 0 },
  [BuildingType.CrystalStorage]: { metal: 1000, crystal: 500, deuterium: 0, energy: 0 },
  [BuildingType.DeuteriumTank]: { metal: 1000, crystal: 1000, deuterium: 0, energy: 0 },
  [BuildingType.RoboticsFactory]: { metal: 400, crystal: 120, deuterium: 200, energy: 0 },
  [BuildingType.Shipyard]: { metal: 400, crystal: 200, deuterium: 100, energy: 0 },
  [BuildingType.ResearchLab]: { metal: 200, crystal: 400, deuterium: 200, energy: 0 },
  [BuildingType.AllianceDepot]: { metal: 20000, crystal: 40000, deuterium: 0, energy: 0 },
  [BuildingType.NaniteFactory]: { metal: 1000000, crystal: 500000, deuterium: 100000, energy: 0 },
  [BuildingType.Terraformer]: { metal: 0, crystal: 50000, deuterium: 100000, energy: 0 },
};

// Base production per hour at level 1
export const BASE_PRODUCTION: Record<string, number> = {
  metal: 30,
  crystal: 20,
  deuterium: 10,
};

// Energy consumption per level
export const ENERGY_CONSUMPTION: Record<string, number> = {
  metalMine: 10,
  crystalMine: 10,
  deuteriumSynthesizer: 20,
};

// Energy production
export const ENERGY_PRODUCTION: Record<string, number> = {
  solarPlant: 20,
  fusionReactor: 50,
};

// Building names
export const BUILDING_NAMES: Record<BuildingType, string> = {
  [BuildingType.MetalMine]: "Metal Mine",
  [BuildingType.CrystalMine]: "Crystal Mine",
  [BuildingType.DeuteriumSynthesizer]: "Deuterium Synthesizer",
  [BuildingType.SolarPlant]: "Solar Plant",
  [BuildingType.FusionReactor]: "Fusion Reactor",
  [BuildingType.MetalStorage]: "Metal Storage",
  [BuildingType.CrystalStorage]: "Crystal Storage",
  [BuildingType.DeuteriumTank]: "Deuterium Tank",
  [BuildingType.RoboticsFactory]: "Robotics Factory",
  [BuildingType.Shipyard]: "Shipyard",
  [BuildingType.ResearchLab]: "Research Lab",
  [BuildingType.AllianceDepot]: "Alliance Depot",
  [BuildingType.NaniteFactory]: "Nanite Factory",
  [BuildingType.Terraformer]: "Terraformer",
};

// Technology base costs
export const TECHNOLOGY_BASE_COSTS: Record<TechnologyType, Resources> = {
  [TechnologyType.EnergyTech]: { metal: 0, crystal: 800, deuterium: 400, energy: 0 },
  [TechnologyType.LaserTech]: { metal: 200, crystal: 100, deuterium: 0, energy: 0 },
  [TechnologyType.IonTech]: { metal: 1000, crystal: 300, deuterium: 100, energy: 0 },
  [TechnologyType.HyperspaceTech]: { metal: 0, crystal: 4000, deuterium: 2000, energy: 0 },
  [TechnologyType.PlasmaTech]: { metal: 2000, crystal: 4000, deuterium: 1000, energy: 0 },
  [TechnologyType.CombustionDrive]: { metal: 400, crystal: 0, deuterium: 600, energy: 0 },
  [TechnologyType.ImpulseDrive]: { metal: 2000, crystal: 4000, deuterium: 600, energy: 0 },
  [TechnologyType.HyperspaceDrive]: { metal: 10000, crystal: 20000, deuterium: 6000, energy: 0 },
  [TechnologyType.EspionageTech]: { metal: 200, crystal: 1000, deuterium: 200, energy: 0 },
  [TechnologyType.ComputerTech]: { metal: 0, crystal: 400, deuterium: 600, energy: 0 },
  [TechnologyType.Astrophysics]: { metal: 4000, crystal: 8000, deuterium: 4000, energy: 0 },
  [TechnologyType.WeaponsTech]: { metal: 800, crystal: 200, deuterium: 0, energy: 0 },
  [TechnologyType.ShieldingTech]: { metal: 200, crystal: 600, deuterium: 0, energy: 0 },
  [TechnologyType.ArmorTech]: { metal: 1000, crystal: 0, deuterium: 0, energy: 0 },
};

// Technology names
export const TECHNOLOGY_NAMES: Record<TechnologyType, string> = {
  [TechnologyType.EnergyTech]: "Energy Technology",
  [TechnologyType.LaserTech]: "Laser Technology",
  [TechnologyType.IonTech]: "Ion Technology",
  [TechnologyType.HyperspaceTech]: "Hyperspace Technology",
  [TechnologyType.PlasmaTech]: "Plasma Technology",
  [TechnologyType.CombustionDrive]: "Combustion Drive",
  [TechnologyType.ImpulseDrive]: "Impulse Drive",
  [TechnologyType.HyperspaceDrive]: "Hyperspace Drive",
  [TechnologyType.EspionageTech]: "Espionage Technology",
  [TechnologyType.ComputerTech]: "Computer Technology",
  [TechnologyType.Astrophysics]: "Astrophysics",
  [TechnologyType.WeaponsTech]: "Weapons Technology",
  [TechnologyType.ShieldingTech]: "Shielding Technology",
  [TechnologyType.ArmorTech]: "Armor Technology",
};

// Ship base costs
export const SHIP_BASE_COSTS: Record<ShipType, Resources> = {
  [ShipType.LightFighter]: { metal: 3000, crystal: 1000, deuterium: 0, energy: 0 },
  [ShipType.HeavyFighter]: { metal: 6000, crystal: 4000, deuterium: 0, energy: 0 },
  [ShipType.Cruiser]: { metal: 20000, crystal: 7000, deuterium: 2000, energy: 0 },
  [ShipType.Battleship]: { metal: 45000, crystal: 15000, deuterium: 0, energy: 0 },
  [ShipType.Battlecruiser]: { metal: 30000, crystal: 40000, deuterium: 15000, energy: 0 },
  [ShipType.Bomber]: { metal: 50000, crystal: 25000, deuterium: 15000, energy: 0 },
  [ShipType.Destroyer]: { metal: 60000, crystal: 50000, deuterium: 15000, energy: 0 },
  [ShipType.Deathstar]: { metal: 5000000, crystal: 4000000, deuterium: 1000000, energy: 0 },
  [ShipType.SmallCargo]: { metal: 2000, crystal: 2000, deuterium: 0, energy: 0 },
  [ShipType.LargeCargo]: { metal: 6000, crystal: 6000, deuterium: 0, energy: 0 },
  [ShipType.ColonyShip]: { metal: 10000, crystal: 20000, deuterium: 10000, energy: 0 },
  [ShipType.Recycler]: { metal: 10000, crystal: 6000, deuterium: 2000, energy: 0 },
  [ShipType.EspionageProbe]: { metal: 0, crystal: 1000, deuterium: 0, energy: 0 },
};

// Ship names
export const SHIP_NAMES: Record<ShipType, string> = {
  [ShipType.LightFighter]: "Light Fighter",
  [ShipType.HeavyFighter]: "Heavy Fighter",
  [ShipType.Cruiser]: "Cruiser",
  [ShipType.Battleship]: "Battleship",
  [ShipType.Battlecruiser]: "Battlecruiser",
  [ShipType.Bomber]: "Bomber",
  [ShipType.Destroyer]: "Destroyer",
  [ShipType.Deathstar]: "Deathstar",
  [ShipType.SmallCargo]: "Small Cargo Ship",
  [ShipType.LargeCargo]: "Large Cargo Ship",
  [ShipType.ColonyShip]: "Colony Ship",
  [ShipType.Recycler]: "Recycler",
  [ShipType.EspionageProbe]: "Espionage Probe",
};

// Ship stats (attack, shield, armor, speed, cargo, fuel consumption)
export interface ShipStats {
  attack: number;
  shield: number;
  armor: number;
  speed: number;
  cargo: number;
  fuelConsumption: number;
}

export const SHIP_STATS: Record<ShipType, ShipStats> = {
  [ShipType.LightFighter]: { attack: 50, shield: 10, armor: 400, speed: 12500, cargo: 50, fuelConsumption: 20 },
  [ShipType.HeavyFighter]: { attack: 150, shield: 25, armor: 1000, speed: 10000, cargo: 100, fuelConsumption: 75 },
  [ShipType.Cruiser]: { attack: 400, shield: 50, armor: 2700, speed: 15000, cargo: 800, fuelConsumption: 300 },
  [ShipType.Battleship]: { attack: 1000, shield: 200, armor: 6000, speed: 10000, cargo: 1500, fuelConsumption: 500 },
  [ShipType.Battlecruiser]: { attack: 700, shield: 400, armor: 7000, speed: 10000, cargo: 750, fuelConsumption: 250 },
  [ShipType.Bomber]: { attack: 1000, shield: 500, armor: 7500, speed: 4000, cargo: 500, fuelConsumption: 1000 },
  [ShipType.Destroyer]: { attack: 2000, shield: 500, armor: 11000, speed: 5000, cargo: 2000, fuelConsumption: 1000 },
  [ShipType.Deathstar]: { attack: 200000, shield: 50000, armor: 900000, speed: 100, cargo: 1000000, fuelConsumption: 1 },
  [ShipType.SmallCargo]: { attack: 5, shield: 10, armor: 400, speed: 5000, cargo: 5000, fuelConsumption: 20 },
  [ShipType.LargeCargo]: { attack: 5, shield: 25, armor: 1200, speed: 7500, cargo: 25000, fuelConsumption: 50 },
  [ShipType.ColonyShip]: { attack: 50, shield: 100, armor: 3000, speed: 2500, cargo: 7500, fuelConsumption: 1000 },
  [ShipType.Recycler]: { attack: 1, shield: 10, armor: 1600, speed: 2000, cargo: 20000, fuelConsumption: 300 },
  [ShipType.EspionageProbe]: { attack: 0, shield: 0, armor: 100, speed: 100000000, cargo: 5, fuelConsumption: 1 },
};

// Defense base costs
export const DEFENSE_BASE_COSTS: Record<DefenseType, Resources> = {
  [DefenseType.RocketLauncher]: { metal: 2000, crystal: 0, deuterium: 0, energy: 0 },
  [DefenseType.LightLaser]: { metal: 1500, crystal: 500, deuterium: 0, energy: 0 },
  [DefenseType.HeavyLaser]: { metal: 6000, crystal: 2000, deuterium: 0, energy: 0 },
  [DefenseType.GaussCannon]: { metal: 20000, crystal: 15000, deuterium: 2000, energy: 0 },
  [DefenseType.IonCannon]: { metal: 2000, crystal: 6000, deuterium: 0, energy: 0 },
  [DefenseType.PlasmaTurret]: { metal: 50000, crystal: 50000, deuterium: 30000, energy: 0 },
  [DefenseType.SmallShieldDome]: { metal: 10000, crystal: 10000, deuterium: 0, energy: 0 },
  [DefenseType.LargeShieldDome]: { metal: 50000, crystal: 50000, deuterium: 0, energy: 0 },
};

// Defense names
export const DEFENSE_NAMES: Record<DefenseType, string> = {
  [DefenseType.RocketLauncher]: "Rocket Launcher",
  [DefenseType.LightLaser]: "Light Laser",
  [DefenseType.HeavyLaser]: "Heavy Laser",
  [DefenseType.GaussCannon]: "Gauss Cannon",
  [DefenseType.IonCannon]: "Ion Cannon",
  [DefenseType.PlasmaTurret]: "Plasma Turret",
  [DefenseType.SmallShieldDome]: "Small Shield Dome",
  [DefenseType.LargeShieldDome]: "Large Shield Dome",
};

// Defense stats (attack, shield, armor)
export interface DefenseStats {
  attack: number;
  shield: number;
  armor: number;
}

export const DEFENSE_STATS: Record<DefenseType, DefenseStats> = {
  [DefenseType.RocketLauncher]: { attack: 80, shield: 20, armor: 200 },
  [DefenseType.LightLaser]: { attack: 100, shield: 25, armor: 200 },
  [DefenseType.HeavyLaser]: { attack: 250, shield: 100, armor: 800 },
  [DefenseType.GaussCannon]: { attack: 1100, shield: 200, armor: 3500 },
  [DefenseType.IonCannon]: { attack: 150, shield: 500, armor: 800 },
  [DefenseType.PlasmaTurret]: { attack: 3000, shield: 300, armor: 10000 },
  [DefenseType.SmallShieldDome]: { attack: 1, shield: 2000, armor: 2000 },
  [DefenseType.LargeShieldDome]: { attack: 1, shield: 10000, armor: 10000 },
};

// Initial building levels for new planets
export const INITIAL_BUILDINGS: BuildingLevels = {
  [BuildingType.MetalMine]: 0,
  [BuildingType.CrystalMine]: 0,
  [BuildingType.DeuteriumSynthesizer]: 0,
  [BuildingType.SolarPlant]: 0,
  [BuildingType.FusionReactor]: 0,
  [BuildingType.MetalStorage]: 0,
  [BuildingType.CrystalStorage]: 0,
  [BuildingType.DeuteriumTank]: 0,
  [BuildingType.RoboticsFactory]: 0,
  [BuildingType.Shipyard]: 0,
  [BuildingType.ResearchLab]: 0,
  [BuildingType.AllianceDepot]: 0,
  [BuildingType.NaniteFactory]: 0,
  [BuildingType.Terraformer]: 0,
};

// Initial technology levels
export const INITIAL_TECHNOLOGIES: TechnologyLevels = {
  [TechnologyType.EnergyTech]: 0,
  [TechnologyType.LaserTech]: 0,
  [TechnologyType.IonTech]: 0,
  [TechnologyType.HyperspaceTech]: 0,
  [TechnologyType.PlasmaTech]: 0,
  [TechnologyType.CombustionDrive]: 0,
  [TechnologyType.ImpulseDrive]: 0,
  [TechnologyType.HyperspaceDrive]: 0,
  [TechnologyType.EspionageTech]: 0,
  [TechnologyType.ComputerTech]: 0,
  [TechnologyType.Astrophysics]: 0,
  [TechnologyType.WeaponsTech]: 0,
  [TechnologyType.ShieldingTech]: 0,
  [TechnologyType.ArmorTech]: 0,
};

// Initial fleet composition
export const INITIAL_FLEET: FleetComposition = {
  [ShipType.LightFighter]: 0,
  [ShipType.HeavyFighter]: 0,
  [ShipType.Cruiser]: 0,
  [ShipType.Battleship]: 0,
  [ShipType.Battlecruiser]: 0,
  [ShipType.Bomber]: 0,
  [ShipType.Destroyer]: 0,
  [ShipType.Deathstar]: 0,
  [ShipType.SmallCargo]: 0,
  [ShipType.LargeCargo]: 0,
  [ShipType.ColonyShip]: 0,
  [ShipType.Recycler]: 0,
  [ShipType.EspionageProbe]: 0,
};

// Initial defense composition
export const INITIAL_DEFENSE: DefenseComposition = {
  [DefenseType.RocketLauncher]: 0,
  [DefenseType.LightLaser]: 0,
  [DefenseType.HeavyLaser]: 0,
  [DefenseType.GaussCannon]: 0,
  [DefenseType.IonCannon]: 0,
  [DefenseType.PlasmaTurret]: 0,
  [DefenseType.SmallShieldDome]: 0,
  [DefenseType.LargeShieldDome]: 0,
};

// Galaxy configuration
export const GALAXY_CONFIG = {
  galaxies: 5,
  systems: 100,
  positions: 15,
};

// Starting resources
export const STARTING_RESOURCES: Resources = {
  metal: 500,
  crystal: 300,
  deuterium: 100,
  energy: 0,
};

// Base construction time in seconds (reduced for mobile)
export const BASE_CONSTRUCTION_TIME = 60; // 1 minute base

// Resource multiplier for faster gameplay
export const DEFAULT_RESOURCE_MULTIPLIER = 10;

// Building prerequisites
export const BUILDING_PREREQUISITES: Partial<Record<BuildingType, Partial<BuildingLevels | TechnologyLevels>>> = {
  [BuildingType.Shipyard]: { [BuildingType.RoboticsFactory]: 2 },
  [BuildingType.ResearchLab]: { [BuildingType.RoboticsFactory]: 1 },
  [BuildingType.FusionReactor]: { [TechnologyType.EnergyTech]: 3 },
  [BuildingType.NaniteFactory]: { [BuildingType.RoboticsFactory]: 10 },
  [BuildingType.Terraformer]: { [BuildingType.NaniteFactory]: 1 },
};

// Technology prerequisites
export const TECHNOLOGY_PREREQUISITES: Partial<Record<TechnologyType, Partial<TechnologyLevels | BuildingLevels>>> = {
  [TechnologyType.IonTech]: { [TechnologyType.LaserTech]: 5, [TechnologyType.EnergyTech]: 4 },
  [TechnologyType.HyperspaceTech]: { [TechnologyType.EnergyTech]: 5 },
  [TechnologyType.PlasmaTech]: { [TechnologyType.EnergyTech]: 8, [TechnologyType.LaserTech]: 10, [TechnologyType.IonTech]: 5 },
  [TechnologyType.ImpulseDrive]: { [TechnologyType.EnergyTech]: 1 },
  [TechnologyType.HyperspaceDrive]: { [TechnologyType.HyperspaceTech]: 3 },
};

// Ship prerequisites
export const SHIP_PREREQUISITES: Partial<Record<ShipType, Partial<TechnologyLevels | BuildingLevels>>> = {
  [ShipType.LightFighter]: { [BuildingType.Shipyard]: 1, [TechnologyType.CombustionDrive]: 1 },
  [ShipType.HeavyFighter]: { [BuildingType.Shipyard]: 3, [TechnologyType.ImpulseDrive]: 2, [TechnologyType.ArmorTech]: 2 },
  [ShipType.Cruiser]: { [BuildingType.Shipyard]: 5, [TechnologyType.ImpulseDrive]: 4, [TechnologyType.IonTech]: 2 },
  [ShipType.Battleship]: { [BuildingType.Shipyard]: 7, [TechnologyType.HyperspaceDrive]: 4 },
  [ShipType.ColonyShip]: { [BuildingType.Shipyard]: 4, [TechnologyType.ImpulseDrive]: 3 },
  [ShipType.Recycler]: { [BuildingType.Shipyard]: 4, [TechnologyType.CombustionDrive]: 6, [TechnologyType.ShieldingTech]: 2 },
  [ShipType.EspionageProbe]: { [BuildingType.Shipyard]: 3, [TechnologyType.CombustionDrive]: 3, [TechnologyType.EspionageTech]: 2 },
  [ShipType.Bomber]: { [BuildingType.Shipyard]: 8, [TechnologyType.ImpulseDrive]: 6, [TechnologyType.PlasmaTech]: 5 },
  [ShipType.Destroyer]: { [BuildingType.Shipyard]: 9, [TechnologyType.HyperspaceDrive]: 6, [TechnologyType.HyperspaceTech]: 5 },
  [ShipType.Deathstar]: { [BuildingType.Shipyard]: 12, [TechnologyType.HyperspaceDrive]: 7, [TechnologyType.HyperspaceTech]: 6, [TechnologyType.WeaponsTech]: 12 },
};
