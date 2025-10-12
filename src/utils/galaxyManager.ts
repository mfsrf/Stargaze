// Galaxy manager - handles universe generation and exploration

import { Coordinates, GalaxyPosition, Planet } from "../types/game";
import { GALAXY_CONFIG } from "./gameConstants";

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
