// Galaxy manager - handles universe generation and exploration

import { Coordinates, GalaxyPosition, Planet, PlanetType } from "../types/game";
import { GALAXY_CONFIG, PLANET_TYPE_BONUSES } from "./gameConstants";

/**
 * Determine planet type based on position (distance from sun) with randomization
 */
export function getPlanetType(position: number): PlanetType {
  // 20% chance for special planet type
  const random = Math.random();
  
  if (random < 0.20) {
    // Special planet types (20% chance)
    const specialTypes = [
      PlanetType.Toxic,
      PlanetType.NoAtmosphere,
      PlanetType.Ocean,
      PlanetType.GasGiant,
      PlanetType.Volcanic,
      PlanetType.Barren,
      PlanetType.Ice,
      PlanetType.Lava,
    ];
    return specialTypes[Math.floor(Math.random() * specialTypes.length)];
  }
  
  // Standard planet types based on position (80% chance)
  if (position >= 1 && position <= 3) return PlanetType.Frozen;
  if (position >= 4 && position <= 6) return PlanetType.Desert;
  if (position >= 7 && position <= 9) return PlanetType.Jungle;
  if (position >= 10 && position <= 12) return PlanetType.Normal;
  return PlanetType.Water; // 13-15
}

/**
 * Get planet type display name
 */
export function getPlanetTypeName(type: PlanetType): string {
  const names: Record<PlanetType, string> = {
    [PlanetType.Frozen]: "Frozen Planet",
    [PlanetType.Desert]: "Desert Planet",
    [PlanetType.Jungle]: "Jungle Planet",
    [PlanetType.Normal]: "Normal Planet",
    [PlanetType.Water]: "Water Planet",
    [PlanetType.Toxic]: "Toxic Planet",
    [PlanetType.NoAtmosphere]: "Airless Planet",
    [PlanetType.Ocean]: "Ocean World",
    [PlanetType.GasGiant]: "Gas Giant",
    [PlanetType.Volcanic]: "Volcanic Planet",
    [PlanetType.Barren]: "Barren World",
    [PlanetType.Ice]: "Ice Planet",
    [PlanetType.Lava]: "Lava World",
  };
  return names[type];
}

/**
 * Get planet type description
 */
export function getPlanetTypeDescription(type: PlanetType): string {
  return PLANET_TYPE_BONUSES[type].description;
}

/**
 * Get planet type color
 */
export function getPlanetTypeColor(type: PlanetType): string {
  return PLANET_TYPE_BONUSES[type].color;
}

/**
 * Calculate temperature based on position
 */
export function calculateTemperature(position: number): number {
  // Positions closer to sun (15) are hotter, farther (1) are colder
  const baseTemp = -100; // Base temperature at position 1
  const tempRange = 200; // Temperature range
  return Math.round(baseTemp + (position / 15) * tempRange);
}

/**
 * Get resource bonus based on planet type
 */
export function getPlanetResourceBonus(type: PlanetType): {
  metal: number;
  crystal: number;
  deuterium: number;
  energy: number;
} {
  return {
    metal: PLANET_TYPE_BONUSES[type].metal,
    crystal: PLANET_TYPE_BONUSES[type].crystal,
    deuterium: PLANET_TYPE_BONUSES[type].deuterium,
    energy: PLANET_TYPE_BONUSES[type].energy,
  };
}

/**
 * Check if coordinates are occupied
 */
export function isPositionOccupied(
  coordinates: Coordinates,
  allPlanets: Planet[]
): boolean {
  return allPlanets.some(
    (p) =>
      p.coordinates.galaxy === coordinates.galaxy &&
      p.coordinates.system === coordinates.system &&
      p.coordinates.position === coordinates.position
  );
}

/**
 * Get planet at specific coordinates
 */
export function getPlanetAtCoordinates(
  coordinates: Coordinates,
  allPlanets: Planet[]
): Planet | null {
  return (
    allPlanets.find(
      (p) =>
        p.coordinates.galaxy === coordinates.galaxy &&
        p.coordinates.system === coordinates.system &&
        p.coordinates.position === coordinates.position
    ) || null
  );
}

/**
 * Generate galaxy system view
 */
export function generateSystemView(
  galaxy: number,
  system: number,
  playerPlanets: Planet[],
  aiPlanets: Planet[]
): GalaxyPosition[] {
  const positions: GalaxyPosition[] = [];
  const allPlanets = [...playerPlanets, ...aiPlanets];

  for (let position = 1; position <= GALAXY_CONFIG.positions; position++) {
    const coordinates: Coordinates = { galaxy, system, position };
    const planet = getPlanetAtCoordinates(coordinates, allPlanets);

    if (planet) {
      // Determine owner
      const isPlayerPlanet = playerPlanets.some((p) => p.id === planet.id);
      const ownerId = isPlayerPlanet ? "player" : "ai";
      const playerName = isPlayerPlanet ? "You" : "AI Player";

      positions.push({
        coordinates,
        planet,
        ownerId,
        playerName,
        debrisField: null, // TODO: Implement debris fields
      });
    } else {
      // Empty position
      positions.push({
        coordinates,
        planet: null,
        ownerId: null,
        playerName: null,
        debrisField: null,
      });
    }
  }

  return positions;
}

/**
 * Calculate planet size based on position (like OGame)
 */
export function calculatePlanetSize(position: number): number {
  // Positions 4-12 are best (163-300 fields)
  // Positions 1-3, 13-15 are smaller (100-163 fields)
  if (position >= 4 && position <= 12) {
    return Math.floor(163 + Math.random() * 137); // 163-300
  } else {
    return Math.floor(100 + Math.random() * 63); // 100-163
  }
}

/**
 * Get random unoccupied position in galaxy
 */
export function getRandomEmptyPosition(
  galaxy: number,
  allPlanets: Planet[]
): Coordinates {
  let attempts = 0;
  const maxAttempts = 100;

  while (attempts < maxAttempts) {
    const system = Math.floor(Math.random() * GALAXY_CONFIG.systems) + 1;
    const position = [4, 6, 8, 10, 12][Math.floor(Math.random() * 5)]; // Good positions

    const coordinates: Coordinates = { galaxy, system, position };

    if (!isPositionOccupied(coordinates, allPlanets)) {
      return coordinates;
    }

    attempts++;
  }

  // Fallback: any position
  const system = Math.floor(Math.random() * GALAXY_CONFIG.systems) + 1;
  const position = Math.floor(Math.random() * GALAXY_CONFIG.positions) + 1;
  return { galaxy, system, position };
}
