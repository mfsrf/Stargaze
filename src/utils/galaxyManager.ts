// Galaxy manager - handles universe generation and exploration

import { Coordinates, GalaxyPosition, Planet, PlanetType } from "../types/game";
import { GALAXY_CONFIG } from "./gameConstants";

/**
 * Determine planet type based on position (distance from sun)
 */
export function getPlanetType(position: number): PlanetType {
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
    [PlanetType.Water]: "Ocean Planet",
  };
  return names[type];
}

/**
 * Get planet type description
 */
export function getPlanetTypeDescription(type: PlanetType): string {
  const descriptions: Record<PlanetType, string> = {
    [PlanetType.Frozen]: "Far from the sun, icy and cold. Less energy but good metal deposits.",
    [PlanetType.Desert]: "Hot and dry, excellent for solar energy production.",
    [PlanetType.Jungle]: "Moderate temperature, balanced resource production.",
    [PlanetType.Normal]: "Ideal conditions for all types of production.",
    [PlanetType.Water]: "Close to the sun, hot with vast oceans. Good for deuterium.",
  };
  return descriptions[type];
}

/**
 * Get planet type color
 */
export function getPlanetTypeColor(type: PlanetType): string {
  const colors: Record<PlanetType, string> = {
    [PlanetType.Frozen]: "#64B5F6",    // Light blue
    [PlanetType.Desert]: "#FFB74D",    // Orange
    [PlanetType.Jungle]: "#66BB6A",    // Green
    [PlanetType.Normal]: "#78909C",    // Blue-grey
    [PlanetType.Water]: "#4FC3F7",     // Cyan
  };
  return colors[type];
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
  const bonuses: Record<PlanetType, { metal: number; crystal: number; deuterium: number; energy: number }> = {
    [PlanetType.Frozen]: { metal: 1.1, crystal: 1.0, deuterium: 0.9, energy: 0.8 },
    [PlanetType.Desert]: { metal: 1.0, crystal: 1.1, deuterium: 0.8, energy: 1.2 },
    [PlanetType.Jungle]: { metal: 1.0, crystal: 1.0, deuterium: 1.0, energy: 1.0 },
    [PlanetType.Normal]: { metal: 1.0, crystal: 1.0, deuterium: 1.0, energy: 1.0 },
    [PlanetType.Water]: { metal: 0.9, crystal: 0.9, deuterium: 1.2, energy: 1.1 },
  };
  return bonuses[type];
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
