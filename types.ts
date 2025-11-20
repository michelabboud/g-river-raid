/**
 * Type Definitions for River Raid Game
 *
 * This module contains all TypeScript type definitions and interfaces
 * used throughout the game. These types ensure type safety and provide
 * documentation for the game's data structures.
 *
 * @module types
 */

/**
 * Enumeration of all entity types in the game
 *
 * Each entity type represents a different game object with unique behavior,
 * rendering, and collision properties. This enum is used throughout the game
 * for type checking, rendering decisions, and collision detection.
 *
 * Categories:
 * - Player: PLAYER, WINGMAN (AI companion)
 * - Enemies: HELICOPTER, SHIP, JET, TANK, SUBMARINE, BOMBER, DESTROYER, FIGHTER, BOSS
 * - Projectiles: BULLET, BOSS_BULLET
 * - Items: FUEL, ITEM_* (power-ups and collectibles)
 * - Obstacles: BRIDGE, MINE, TURRET
 * - Scenery: HOUSE, TREE, ROCK, STABLE, ANIMAL, etc.
 *
 * @enum {string}
 */
export enum EntityType {
  PLAYER = 'PLAYER',
  HELICOPTER = 'HELICOPTER',
  SHIP = 'SHIP',
  JET = 'JET',
  FUEL = 'FUEL',
  BRIDGE = 'BRIDGE',
  BULLET = 'BULLET',
  EXPLOSION = 'EXPLOSION',
  MINE = 'MINE',
  TANK = 'TANK',
  HOUSE = 'HOUSE',
  TREE = 'TREE',
  ROCK = 'ROCK',
  TURRET = 'TURRET',
  BOAT = 'BOAT',
  ITEM_SPREAD = 'ITEM_SPREAD',
  ITEM_RAPID = 'ITEM_RAPID',
  ITEM_SHIELD = 'ITEM_SHIELD',
  ITEM_REGEN = 'ITEM_REGEN',
  ITEM_SPEED = 'ITEM_SPEED',
  ITEM_LIFE = 'ITEM_LIFE',
  BOSS = 'BOSS',
  BOSS_BULLET = 'BOSS_BULLET',
  BASE = 'BASE',
  STABLE = 'STABLE',
  ANIMAL = 'ANIMAL',
  SHACK = 'SHACK',
  CRATE = 'CRATE',
  HERD = 'HERD',
  SILO = 'SILO',
  RUIN = 'RUIN',
  FENCE = 'FENCE',
  LOGS = 'LOGS',
  SIGN = 'SIGN',
  BOULDER = 'BOULDER',
  SUBMARINE = 'SUBMARINE',
  RADAR = 'RADAR',
  BOMBER = 'BOMBER',
  DESTROYER = 'DESTROYER',
  FIGHTER = 'FIGHTER',
  BUOY = 'BUOY',
  WRECK = 'WRECK',
  PALM = 'PALM',
  BUNKER = 'BUNKER',
  PIER = 'PIER',
  FUEL_DEPOT = 'FUEL_DEPOT',
  WINGMAN = 'WINGMAN',
  DRONE = 'DRONE',
  HOVERCRAFT = 'HOVERCRAFT'
}

/**
 * Base interface for all game objects (enemies, bullets, scenery, items)
 *
 * This is the foundational interface that all interactive game objects inherit from.
 * It defines position, dimensions, velocity, and lifecycle properties.
 *
 * Coordinate System:
 * - x: Horizontal position (0 = left edge of river, increases rightward)
 * - y: Vertical world position (increases downward, scrolls with camera)
 *
 * Velocity:
 * - vx: Horizontal velocity (pixels per frame)
 * - vy: Vertical velocity relative to world (pixels per frame)
 *
 * @interface Entity
 */
export interface Entity {
  /** Unique identifier for this entity instance */
  id: number;

  /** Type of entity (determines rendering and behavior) */
  type: EntityType;

  /** Horizontal position in pixels (0 = left river edge) */
  x: number;

  /** Vertical world position in pixels (scrolls with camera) */
  y: number;

  /** Width of entity hitbox in pixels */
  width: number;

  /** Height of entity hitbox in pixels */
  height: number;

  /** Horizontal velocity in pixels per frame (positive = rightward) */
  vx: number;

  /** Vertical velocity in pixels per frame (positive = downward) */
  vy: number;

  /** Whether entity is alive and should be processed (false = will be removed) */
  active: boolean;

  /** Current animation frame index (for animated sprites) */
  frame: number;

  /** Points awarded to player when this entity is destroyed (optional) */
  scoreValue?: number;

  /** Current health points (for enemies that require multiple hits) */
  hp?: number;

  /** Maximum health points (for displaying health bars) */
  maxHp?: number;

  /** Boss configuration index 0-9 (for boss entities only) */
  bossId?: number;

  /** Time remaining for hit flash visual effect in seconds */
  hitFlashTimer?: number;
}

/**
 * Specialized interface for the player's aircraft
 *
 * Extends the basic entity concept with player-specific properties like fuel,
 * score, lives, power-ups, and invulnerability.
 *
 * Fuel System:
 * - Depletes constantly during gameplay
 * - Refilled by collecting fuel canisters or depots
 * - Running out of fuel (0) causes instant death
 *
 * Power-Up System:
 * - Spread: Fire 3 bullets in a fan pattern
 * - Rapid: Increased firing rate
 * - Speed: Faster bullet velocity
 *
 * @interface Player
 */
export interface Player {
  /** Unique identifier */
  id: number;

  /** Always EntityType.PLAYER */
  type: EntityType;

  /** Horizontal position in pixels */
  x: number;

  /** Vertical position in pixels (fixed on screen, world scrolls beneath) */
  y: number;

  /** Aircraft hitbox width in pixels */
  width: number;

  /** Aircraft hitbox height in pixels */
  height: number;

  /** Horizontal velocity in pixels per frame */
  vx: number;

  /** Vertical velocity in pixels per frame (affects scroll speed) */
  vy: number;

  /** Current fuel level (0-100, where 0 = empty, 100 = full) */
  fuel: number;

  /** Vertical scroll speed modifier (affects world movement) */
  speed: number;

  /** Whether player aircraft is active (false if game over) */
  active: boolean;

  /** Whether player is currently dead (triggers respawn or game over) */
  isDead: boolean;

  /** Current session score */
  score: number;

  /** Remaining lives/continues */
  lives: number;

  /** Active power-up flags */
  upgrades: {
    /** Spread shot active (fires 3 bullets) */
    spread: boolean;
    /** Rapid fire active (increased fire rate) */
    rapid: boolean;
    /** Speed shot active (faster bullets) */
    speed: boolean;
  };

  /** Time remaining for invulnerability in seconds (post-respawn grace period) */
  invulnerableTimer: number;

  /** Current score multiplier (increases with consecutive kills) */
  multiplier: number;

  /** Current animation frame index */
  frame: number;
}

/**
 * Interface for visual effects (explosions, smoke, sparkles)
 *
 * Particles are short-lived visual effects that enhance gameplay feedback.
 * They fade out over time and are automatically removed when their life expires.
 *
 * Particle Styles:
 * - pixel: Small square particles for explosions and debris
 * - smoke: Larger, fading particles for smoke trails
 * - shockwave: Expanding circle for large explosions
 *
 * @interface Particle
 */
export interface Particle {
  /** Horizontal position in world coordinates */
  x: number;

  /** Vertical position in world coordinates */
  y: number;

  /** Horizontal velocity (pixels per frame) */
  vx: number;

  /** Vertical velocity (pixels per frame) */
  vy: number;

  /** Remaining lifetime in seconds (0 = particle is removed) */
  life: number;

  /** Initial lifetime for calculating fade alpha */
  maxLife: number;

  /** CSS color string (e.g., '#FF0000', 'rgba(255,0,0,0.5)') */
  color: string;

  /** Particle size in pixels (diameter for circles, side length for squares) */
  size: number;

  /** Rendering style determines how particle is drawn */
  style: 'pixel' | 'smoke' | 'shockwave';
}

/**
 * Global game state container
 *
 * This is the root state object that contains all game data for a single session.
 * It's updated every frame and persists across the entire gameplay session.
 *
 * State Management:
 * - Player: Single player aircraft with all player-specific data
 * - Entities: Array of all active game objects (enemies, bullets, items, scenery)
 * - Particles: Array of active visual effects
 *
 * World Scrolling:
 * - cameraY: Vertical world offset (increases as player progresses)
 * - Entities with y < cameraY are off-screen (top) and can be culled
 * - Entities with y > cameraY + screenHeight are not yet visible
 *
 * Procedural Generation:
 * - riverSeed: Used for deterministic random river generation
 * - Same seed = same river layout (useful for reproducibility)
 *
 * @interface GameState
 */
export interface GameState {
  /** Player aircraft with all player-specific properties */
  player: Player;

  /** Array of all active game objects (enemies, projectiles, items, scenery) */
  entities: Entity[];

  /** Array of active particle effects (explosions, smoke, etc.) */
  particles: Particle[];

  /** Current camera vertical position in world coordinates */
  cameraY: number;

  /** Random seed for procedural river generation (ensures reproducibility) */
  riverSeed: number;

  /** Whether the game has ended (all lives lost) */
  isGameOver: boolean;

  /** Whether the game is currently paused */
  isPaused: boolean;

  /** Timestamp of last bullet fired (for rate limiting) */
  lastShotTime: number;

  /** Current difficulty level (1-10+, increases over time) */
  level: number;

  /** Distance traveled since last fuel canister spawn (for spawn timing) */
  distanceSinceLastFuel: number;

  /** Distance traveled in current level (for level progression) */
  distanceInLevel: number;

  /** Distance traveled since last multiplier increase */
  multiplierDistance: number;

  /** Whether a boss is currently active (prevents normal spawns) */
  bossActive: boolean;

  /** Total time played in current session (seconds, for coin generation) */
  gameTime: number;

  /** Coins earned in current session (1 coin per minute) */
  sessionCoins: number;
}

/**
 * Interface for high score leaderboard entries
 *
 * High scores are persisted to browser localStorage and displayed
 * on the main menu leaderboard.
 *
 * @interface HighScore
 */
export interface HighScore {
  /** Player initials or name (typically 3 characters) */
  name: string;

  /** Score achieved in that game session */
  score: number;

  /** ISO date string when the score was achieved */
  date: string;
}