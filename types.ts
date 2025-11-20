/**
 * Enumeration of all entity types in the game.
 * Used for rendering, collision logic, and spawning.
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
 * Base interface for all game objects (enemies, bullets, scenery).
 */
export interface Entity {
  id: number;
  type: EntityType;
  x: number; // Horizontal position
  y: number; // Vertical world position
  width: number;
  height: number;
  vx: number; // Horizontal velocity
  vy: number; // Vertical velocity
  active: boolean; // If false, entity is removed
  frame: number; // Animation frame
  scoreValue?: number; // Points awarded for destruction
  hp?: number; // Health points (for bosses/armored units)
  maxHp?: number; // Max HP for UI
  bossId?: number; // 0-9 index for specific boss config
  hitFlashTimer?: number; // Time remaining for visual hit feedback
}

/**
 * Specialized interface for the player's character.
 */
export interface Player {
  id: number;
  type: EntityType;
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  vy: number;
  fuel: number; // 0-100
  speed: number; // Vertical scroll speed
  active: boolean;
  isDead: boolean;
  score: number;
  lives: number;
  upgrades: {
    spread: boolean;
    rapid: boolean;
    speed: boolean;
  };
  invulnerableTimer: number; // Seconds remaining
  multiplier: number; // Current score multiplier
  frame: number;
}

/**
 * Interface for visual effects (explosions, smoke, sparkles).
 */
export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number; // Remaining life in seconds
  maxLife: number;
  color: string;
  size: number;
  style: 'pixel' | 'smoke' | 'shockwave';
}

/**
 * Global game state container.
 */
export interface GameState {
  player: Player;
  entities: Entity[];
  particles: Particle[];
  cameraY: number; // Vertical camera position
  riverSeed: number; // Random seed for procedural river gen
  isGameOver: boolean;
  isPaused: boolean;
  lastShotTime: number;
  level: number;
  distanceSinceLastFuel: number;
  distanceInLevel: number;
  multiplierDistance: number;
  bossActive: boolean;
  gameTime: number; // Total session time in seconds
  sessionCoins: number; // Coins earned in current session
}

/**
 * Interface for leaderboard entries.
 */
export interface HighScore {
  name: string; // Initials
  score: number;
  date: string;
}