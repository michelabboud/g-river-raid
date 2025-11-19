
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
  ROCK = 'ROCK'
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
}

export interface Player extends Entity {
  fuel: number;
  speed: number; // vertical speed relative to map scroll
  isDead: boolean;
  score: number;
  lives: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
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
}
