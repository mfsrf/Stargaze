// Game formulas and calculations

import {
  Resources,
  Planet,
  BuildingType,
  TechnologyType,
  FleetComposition,
  ShipType,
} from "../types/game";
import {
  BUILDING_BASE_COSTS,
  TECHNOLOGY_BASE_COSTS,
  BASE_PRODUCTION,
  ENERGY_CONSUMPTION,
  ENERGY_PRODUCTION,
  BASE_CONSTRUCTION_TIME,
  SHIP_STATS,
} from "./gameConstants";

/**
 * Calculate the cost of upgrading a building to the next level
 */
export function getBuildingCost(type: BuildingType, currentLevel: number): Resources {
  const baseCost = BUILDING_BASE_COSTS[type];
  const multiplier = Math.pow(2, currentLevel);
  
  return {
    metal: Math.floor(baseCost.metal * multiplier),
    crystal: Math.floor(baseCost.crystal * multiplier),
    deuterium: Math.floor(baseCost.deuterium * multiplier),
    energy: 0,
  };
}

/**
 * Calculate the construction time for a building upgrade (in seconds)
 */
export function getBuildingConstructionTime(
  type: BuildingType,
  currentLevel: number,
  roboticsLevel: number,
  naniteLevel: number
): number {
  const cost = getBuildingCost(type, currentLevel);
  const totalCost = cost.metal + cost.crystal;
  
  const baseTime = (totalCost / 2500) * BASE_CONSTRUCTION_TIME;
  const roboticsBonus = 1 / (1 + roboticsLevel);
  const naniteBonus = naniteLevel > 0 ? 1 / Math.pow(2, naniteLevel) : 1;
  
  return Math.max(baseTime * roboticsBonus * naniteBonus, 5); // Min 5 seconds
}

/**
 * Calculate the cost of researching a technology to the next level
 */
export function getTechnologyCost(type: TechnologyType, currentLevel: number): Resources {
  const baseCost = TECHNOLOGY_BASE_COSTS[type];
  const multiplier = Math.pow(2, currentLevel);
  
  return {
    metal: Math.floor(baseCost.metal * multiplier),
    crystal: Math.floor(baseCost.crystal * multiplier),
    deuterium: Math.floor(baseCost.deuterium * multiplier),
    energy: 0,
  };
}

/**
 * Calculate the research time for a technology (in seconds)
 */
export function getTechnologyResearchTime(
  type: TechnologyType,
  currentLevel: number,
  researchLabLevel: number
): number {
  const cost = getTechnologyCost(type, currentLevel);
  const totalCost = cost.metal + cost.crystal;
  
  const baseTime = (totalCost / 1000) * BASE_CONSTRUCTION_TIME;
  const labBonus = 1 / (1 + researchLabLevel);
  
  return Math.max(baseTime * labBonus, 10); // Min 10 seconds
}

/**
 * Calculate metal production per hour for a planet
 */
export function calculateMetalProduction(
  mineLevel: number,
  resourceMultiplier: number
): number {
  if (mineLevel === 0) return 600 * resourceMultiplier; // Base production
  return Math.floor(BASE_PRODUCTION.metal * mineLevel * Math.pow(1.1, mineLevel) * resourceMultiplier);
}

/**
 * Calculate crystal production per hour for a planet
 */
export function calculateCrystalProduction(
  mineLevel: number,
  resourceMultiplier: number
): number {
  if (mineLevel === 0) return 300 * resourceMultiplier; // Base production
  return Math.floor(BASE_PRODUCTION.crystal * mineLevel * Math.pow(1.1, mineLevel) * resourceMultiplier);
}

/**
 * Calculate deuterium production per hour for a planet
 */
export function calculateDeuteriumProduction(
  synthLevel: number,
  resourceMultiplier: number
): number {
  if (synthLevel === 0) return 0; // No base production
  return Math.floor(BASE_PRODUCTION.deuterium * synthLevel * Math.pow(1.1, synthLevel) * resourceMultiplier);
}

/**
 * Calculate energy production for a planet
 */
export function calculateEnergyProduction(solarPlantLevel: number, fusionReactorLevel: number): number {
  const solarEnergy = solarPlantLevel * ENERGY_PRODUCTION.solarPlant * Math.pow(1.1, solarPlantLevel);
  const fusionEnergy = fusionReactorLevel * ENERGY_PRODUCTION.fusionReactor * Math.pow(1.05, fusionReactorLevel);
  return Math.floor(solarEnergy + fusionEnergy);
}

/**
 * Calculate energy consumption for a planet
 */
export function calculateEnergyConsumption(
  metalMineLevel: number,
  crystalMineLevel: number,
  deuteriumSynthLevel: number
): number {
  const metalConsumption = metalMineLevel * ENERGY_CONSUMPTION.metalMine * Math.pow(1.1, metalMineLevel);
  const crystalConsumption = crystalMineLevel * ENERGY_CONSUMPTION.crystalMine * Math.pow(1.1, crystalMineLevel);
  const deuteriumConsumption = deuteriumSynthLevel * ENERGY_CONSUMPTION.deuteriumSynthesizer * Math.pow(1.1, deuteriumSynthLevel);
  
  return Math.floor(metalConsumption + crystalConsumption + deuteriumConsumption);
}

/**
 * Calculate energy balance for a planet
 */
export function calculateEnergyBalance(planet: Planet): number {
  const production = calculateEnergyProduction(
    planet.buildings[BuildingType.SolarPlant],
    planet.buildings[BuildingType.FusionReactor]
  );
  
  const consumption = calculateEnergyConsumption(
    planet.buildings[BuildingType.MetalMine],
    planet.buildings[BuildingType.CrystalMine],
    planet.buildings[BuildingType.DeuteriumSynthesizer]
  );
  
  return production - consumption;
}

/**
 * Calculate storage capacity for a resource
 */
export function calculateStorageCapacity(storageLevel: number): number {
  const baseCapacity = 5000;
  if (storageLevel === 0) return baseCapacity;
  return Math.floor(baseCapacity * Math.pow(1.6, storageLevel));
}

/**
 * Calculate total production per hour for a planet
 */
export function calculatePlanetProduction(planet: Planet, resourceMultiplier: number): Resources {
  const energyBalance = calculateEnergyBalance(planet);
  const energyEfficiency = energyBalance >= 0 ? 1 : Math.max(0.1, (energyBalance + calculateEnergyConsumption(
    planet.buildings[BuildingType.MetalMine],
    planet.buildings[BuildingType.CrystalMine],
    planet.buildings[BuildingType.DeuteriumSynthesizer]
  )) / calculateEnergyConsumption(
    planet.buildings[BuildingType.MetalMine],
    planet.buildings[BuildingType.CrystalMine],
    planet.buildings[BuildingType.DeuteriumSynthesizer]
  ));
  
  return {
    metal: calculateMetalProduction(planet.buildings[BuildingType.MetalMine], resourceMultiplier) * energyEfficiency,
    crystal: calculateCrystalProduction(planet.buildings[BuildingType.CrystalMine], resourceMultiplier) * energyEfficiency,
    deuterium: calculateDeuteriumProduction(planet.buildings[BuildingType.DeuteriumSynthesizer], resourceMultiplier) * energyEfficiency,
    energy: energyBalance,
  };
}

/**
 * Check if player can afford a cost
 */
export function canAfford(resources: Resources, cost: Resources): boolean {
  return (
    resources.metal >= cost.metal &&
    resources.crystal >= cost.crystal &&
    resources.deuterium >= cost.deuterium
  );
}

/**
 * Deduct cost from resources
 */
export function deductCost(resources: Resources, cost: Resources): Resources {
  return {
    metal: resources.metal - cost.metal,
    crystal: resources.crystal - cost.crystal,
    deuterium: resources.deuterium - cost.deuterium,
    energy: resources.energy,
  };
}

/**
 * Add resources together
 */
export function addResources(a: Resources, b: Resources): Resources {
  return {
    metal: a.metal + b.metal,
    crystal: a.crystal + b.crystal,
    deuterium: a.deuterium + b.deuterium,
    energy: a.energy + b.energy,
  };
}

/**
 * Calculate used fields on a planet
 */
export function calculateUsedFields(planet: Planet): number {
  let used = 0;
  
  // Each building level uses 1 field
  Object.values(planet.buildings).forEach((level) => {
    used += level;
  });
  
  return used;
}

/**
 * Calculate travel time between two coordinates (in seconds)
 */
export function calculateTravelTime(
  from: { galaxy: number; system: number; position: number },
  to: { galaxy: number; system: number; position: number },
  fleet: FleetComposition,
  speedMultiplier: number
): number {
  // Find slowest ship in fleet
  let slowestSpeed = Infinity;
  Object.entries(fleet).forEach(([shipType, count]) => {
    if (count > 0) {
      const speed = SHIP_STATS[shipType as ShipType].speed;
      if (speed < slowestSpeed) {
        slowestSpeed = speed;
      }
    }
  });
  
  if (slowestSpeed === Infinity) return 0;
  
  // Calculate distance
  let distance = 0;
  if (from.galaxy !== to.galaxy) {
    distance = Math.abs(from.galaxy - to.galaxy) * 20000;
  } else if (from.system !== to.system) {
    distance = Math.abs(from.system - to.system) * 2700 + Math.abs(from.position - to.position) * 1000;
  } else {
    distance = Math.abs(from.position - to.position) * 1000 + 5;
  }
  
  const time = (3500 / (slowestSpeed * speedMultiplier / 10)) * Math.sqrt(distance * 10 / (slowestSpeed * speedMultiplier / 10)) + 10;
  
  return Math.max(Math.floor(time), 5); // Min 5 seconds
}

/**
 * Calculate fuel consumption for a fleet mission
 */
export function calculateFuelConsumption(
  from: { galaxy: number; system: number; position: number },
  to: { galaxy: number; system: number; position: number },
  fleet: FleetComposition
): number {
  const distance = calculateDistance(from, to);
  let totalFuel = 0;
  
  Object.entries(fleet).forEach(([shipType, count]) => {
    if (count > 0) {
      const stats = SHIP_STATS[shipType as ShipType];
      const shipFuel = stats.fuelConsumption * count * (distance / 35000 + 1);
      totalFuel += shipFuel;
    }
  });
  
  return Math.floor(totalFuel);
}

/**
 * Calculate distance between coordinates
 */
function calculateDistance(
  from: { galaxy: number; system: number; position: number },
  to: { galaxy: number; system: number; position: number }
): number {
  if (from.galaxy !== to.galaxy) {
    return Math.abs(from.galaxy - to.galaxy) * 20000;
  } else if (from.system !== to.system) {
    return Math.abs(from.system - to.system) * 2700 + Math.abs(from.position - to.position) * 1000;
  } else {
    return Math.abs(from.position - to.position) * 1000 + 5;
  }
}

/**
 * Calculate total cargo capacity of a fleet
 */
export function calculateCargoCapacity(fleet: FleetComposition): number {
  let totalCapacity = 0;
  
  Object.entries(fleet).forEach(([shipType, count]) => {
    if (count > 0) {
      totalCapacity += SHIP_STATS[shipType as ShipType].cargo * count;
    }
  });
  
  return totalCapacity;
}

/**
 * Calculate points for ranking
 */
export function calculatePoints(planet: Planet, technologies: Record<string, number>): number {
  let points = 0;
  
  // Building points
  Object.entries(planet.buildings).forEach(([buildingType, level]) => {
    const cost = getBuildingCost(buildingType as BuildingType, level - 1);
    points += Math.floor((cost.metal + cost.crystal + cost.deuterium) / 1000);
  });
  
  // Technology points
  Object.entries(technologies).forEach(([techType, level]) => {
    const cost = getTechnologyCost(techType as TechnologyType, level - 1);
    points += Math.floor((cost.metal + cost.crystal + cost.deuterium) / 1000);
  });
  
  // Fleet points
  Object.entries(planet.fleet).forEach(([_, count]) => {
    if (count > 0) {
      points += count; // Simplified for now
    }
  });
  
  return points;
}

/**
 * Format number with thousand separators
 */
export function formatNumber(num: number): string {
  return Math.floor(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Format time duration in readable format
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

/**
 * Calculate technology bonus (10% per level)
 */
export function calculateTechnologyBonus(techLevel: number): number {
  return 1 + (techLevel * 0.1);
}

/**
 * Calculate ship speed with drive technology bonus
 */
export function calculateShipSpeed(
  baseSpeed: number,
  combustionLevel: number,
  impulseLevel: number,
  hyperspaceLevel: number
): number {
  // Use the highest applicable drive technology
  const maxDriveLevel = Math.max(combustionLevel, impulseLevel, hyperspaceLevel);
  return Math.floor(baseSpeed * calculateTechnologyBonus(maxDriveLevel));
}

/**
 * Calculate ship/defense attack with weapons technology bonus
 */
export function calculateAttackPower(baseAttack: number, weaponsLevel: number): number {
  return Math.floor(baseAttack * calculateTechnologyBonus(weaponsLevel));
}

/**
 * Calculate ship/defense shield with shielding technology bonus
 */
export function calculateShieldPower(baseShield: number, shieldingLevel: number): number {
  return Math.floor(baseShield * calculateTechnologyBonus(shieldingLevel));
}

/**
 * Calculate ship/defense armor with armor technology bonus
 */
export function calculateArmorPower(baseArmor: number, armorLevel: number): number {
  return Math.floor(baseArmor * calculateTechnologyBonus(armorLevel));
}

/**
 * Check if ship prerequisites are met
 */
export function checkShipPrerequisites(
  shipType: ShipType,
  buildings: any,
  technologies: any,
  prerequisites: Partial<Record<string, number>> | undefined
): { met: boolean; missing: Array<{ name: string; required: number; current: number }> } {
  const missing: Array<{ name: string; required: number; current: number }> = [];
  
  if (!prerequisites) {
    return { met: true, missing: [] };
  }
  
  for (const [key, requiredLevel] of Object.entries(prerequisites)) {
    if (requiredLevel === undefined) continue;
    
    const currentLevel = buildings[key] ?? technologies[key] ?? 0;
    
    if (currentLevel < requiredLevel) {
      missing.push({
        name: key,
        required: requiredLevel,
        current: currentLevel,
      });
    }
  }
  
  return {
    met: missing.length === 0,
    missing,
  };
}
