
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
  BOULDER = 'BOULDER'
}

export interface Entity {
  id: number;
  type: EntityType;
  x: number; // 0 to 100 (percent of river width mostly, but game logic uses virtual pixels)
  y: number; // world Y coordinate
  width: number;
  height: number;
  vx: number;
  vy: number;
  active: boolean;
  frame: number; // For animation
  scoreValue?: number;
  hp?: number;
  maxHp?: number;
  bossId?: number; // 0-9 for the 10 bosses
}

export interface Player {
  id: number;
  type: EntityType;
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  vy: number;
  fuel: number;
  speed: number; // vertical speed relative to map scroll
  active: boolean;
  isDead: boolean;
  score: number;
  lives: number;
  activePowerUp: EntityType | null;
  powerUpTimer: number;
  multiplier: number;
  frame: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}

export interface GameState {
  player: Player;
  entities: Entity[];
  particles: Particle[];
  cameraY: number;
  riverSeed: number;
  isGameOver: boolean;
  isPaused: boolean;
  lastShotTime: number;
  level: number;
  distanceSinceLastFuel: number;
  distanceInLevel: number;
  multiplierDistance: number;
  bossActive: boolean;
}
