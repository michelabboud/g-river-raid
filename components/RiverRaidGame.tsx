import React, { useEffect, useRef, useState } from 'react';
import { Entity, EntityType, GameState, Player, HighScore } from '../types';
import { VirtualJoystick } from './VirtualJoystick';
import { ShootButton } from './ShootButton';
import { FullscreenButton } from './FullscreenButton';
import { isMobileDevice, getCanvasScale } from '../utils/mobile';

// --- CONSTANTS ---
const CANVAS_WIDTH = 320;
const CANVAS_HEIGHT = 480;
const PLAYER_SPEED_X = 190;
const PLAYER_SPEED_Y = 180;
const MAX_SCROLL_SPEED = 250;
const MIN_SCROLL_SPEED = 60;
const BASE_BULLET_SPEED = 600;
const UPGRADED_BULLET_SPEED = 900;
const BOSS_BULLET_SPEED = 100; 
const FUEL_CONSUMPTION = 4.0; 
const FUEL_REGEN_RATE = 3.0;
const RIVER_SEGMENT_HEIGHT = 20;
const SPAWN_DISTANCE = 700;
const FUEL_GUARANTEE_DISTANCE = 400; 
const MULTIPLIER_INCREMENT_DISTANCE = 1000; 
const LEVEL_LENGTH = 4000; 
const WINGMAN_OFFSET_X = 35;
const WINGMAN_OFFSET_Y = 20;

// --- SPRITE DEFINITIONS ---
// Binary arrays representing pixel art for each entity type.
// 1 = filled pixel, 0 = transparent.
const SPRITES: Record<string, number[][]> = {
  PLAYER: [
    [0,0,0,1,0,0,0],
    [0,0,1,1,1,0,0],
    [0,1,1,0,1,1,0],
    [0,1,1,0,1,1,0],
    [1,1,1,0,1,1,1],
    [1,1,1,0,1,1,1],
    [0,1,0,1,0,1,0],
    [1,1,0,0,0,1,1]
  ],
  WINGMAN: [
    [0,0,0,1,0,0,0],
    [0,0,1,1,1,0,0],
    [0,1,1,1,1,1,0],
    [1,1,0,1,0,1,1],
    [1,1,1,1,1,1,1],
    [1,0,0,0,0,0,1]
  ],
  HELICOPTER: [
    [0,0,1,1,1,0,0],
    [1,1,1,1,1,1,1],
    [0,0,0,1,0,0,0],
    [0,1,1,1,1,1,0],
    [0,1,1,1,1,1,0],
    [0,0,1,0,1,0,0],
    [0,1,1,0,1,1,0]
  ],
  SHIP: [
    [0,0,0,0,1,0,0,0,0],
    [0,0,0,1,1,1,0,0,0],
    [0,0,1,1,1,1,1,0,0],
    [1,1,1,1,1,1,1,1,1],
    [0,1,1,1,1,1,1,1,0],
    [0,0,1,1,1,1,1,0,0]
  ],
  DESTROYER: [
    [0,0,0,0,1,0,0,0,0],
    [0,0,0,1,1,1,0,0,0],
    [0,0,1,1,1,1,1,0,0],
    [0,1,1,1,1,1,1,1,0],
    [1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1],
    [0,1,0,1,0,1,0,1,0]
  ],
  SUBMARINE: [
    [0,0,0,0,1,0,0,0],
    [0,0,0,1,1,1,0,0],
    [0,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1],
    [0,0,1,0,0,1,0,0]
  ],
  BOAT: [
    [0,0,0,0,0],
    [0,0,1,0,0],
    [0,1,1,1,0],
    [1,1,1,1,1],
    [0,1,1,1,0]
  ],
  HOVERCRAFT: [
    [0,0,1,1,1,0,0],
    [0,1,1,1,1,1,0],
    [1,1,0,1,0,1,1],
    [1,1,1,1,1,1,1],
    [0,1,1,1,1,1,0]
  ],
  WRECK: [
    [0,0,1,0,0,1,0],
    [0,1,0,1,0,0,1],
    [1,0,0,0,1,0,0],
    [1,0,1,0,1,1,1],
    [0,1,1,1,0,1,0]
  ],
  BUOY: [
    [0,0,1,0,0],
    [0,1,1,1,0],
    [0,1,1,1,0],
    [1,1,1,1,1],
    [0,1,0,1,0]
  ],
  JET: [
    [0,0,0,1,0,0,0],
    [0,0,1,1,1,0,0],
    [0,1,1,1,1,1,0],
    [1,1,0,1,0,1,1],
    [1,1,0,1,0,1,1],
    [1,0,0,1,0,0,1]
  ],
  FIGHTER: [
    [0,0,1,0,0],
    [0,0,1,0,0],
    [0,1,1,1,0],
    [0,1,1,1,0],
    [1,1,1,1,1],
    [1,0,1,0,1],
    [0,1,0,1,0]
  ],
  DRONE: [
    [1,0,1],
    [0,1,0],
    [1,1,1],
    [0,1,0],
    [1,0,1]
  ],
  BOMBER: [
    [0,0,0,1,1,1,0,0,0],
    [0,0,1,1,1,1,1,0,0],
    [0,1,1,1,1,1,1,1,0],
    [1,1,1,0,1,0,1,1,1],
    [1,1,1,0,1,0,1,1,1],
    [1,0,0,0,1,0,0,0,1]
  ],
  TANK: [
    [0,0,1,0,0],
    [0,1,1,1,0],
    [1,1,1,1,1],
    [1,1,1,1,1],
    [1,0,1,0,1]
  ],
  TURRET: [
    [0,0,1,0,0],
    [0,1,1,1,0],
    [0,1,1,1,0],
    [1,1,1,1,1],
    [1,0,0,0,1]
  ],
  RADAR: [
    [0,1,1,1,0],
    [1,0,1,0,1],
    [1,1,1,1,1],
    [0,0,1,0,0],
    [1,1,1,1,1]
  ],
  BUNKER: [
    [0,1,1,1,1,0],
    [1,1,1,1,1,1],
    [1,0,0,0,0,1],
    [1,1,1,1,1,1]
  ],
  HOUSE: [
    [0,0,1,1,0,0],
    [0,1,1,1,1,0],
    [1,1,1,1,1,1],
    [1,0,1,1,0,1],
    [1,1,1,1,1,1]
  ],
  TREE: [
    [0,0,1,0,0],
    [0,1,1,1,0],
    [1,1,1,1,1],
    [0,1,1,1,0],
    [0,0,1,0,0]
  ],
  PALM: [
    [0,1,0,1,0,1,0],
    [0,0,1,1,1,0,0],
    [0,0,0,1,0,0,0],
    [0,0,0,1,0,0,0],
    [0,1,1,1,1,1,0]
  ],
  BASE: [
    [0,0,1,1,0,0],
    [0,1,1,1,1,0],
    [1,1,1,1,1,1],
    [1,0,1,1,0,1],
    [1,1,1,1,1,1],
    [1,1,1,1,1,1]
  ],
  STABLE: [
    [0,0,0,1,1,0,0,0],
    [0,0,1,1,1,1,0,0],
    [0,1,1,1,1,1,1,0],
    [1,1,1,1,1,1,1,1],
    [1,0,1,0,0,1,0,1]
  ],
  ANIMAL: [
    [0,0,0,0,0,0],
    [0,0,1,1,1,0],
    [0,1,1,1,1,1],
    [0,1,0,1,0,1]
  ],
  SHACK: [
    [0,0,1,1,0,0],
    [0,1,1,1,1,0],
    [1,1,0,0,1,1],
    [1,1,0,0,1,1],
    [1,1,1,1,1,1]
  ],
  PIER: [
    [1,1,1,1,1,1],
    [1,0,1,0,1,0],
    [1,0,1,0,1,0],
    [1,0,1,0,1,0]
  ],
  CRATE: [
    [1,1,1,1],
    [1,0,0,1],
    [1,0,0,1],
    [1,1,1,1]
  ],
  HERD: [
    [1,1,0,1,1,0],
    [1,1,0,1,1,0],
    [0,0,0,0,0,0],
    [0,1,1,0,1,1],
    [0,1,1,0,1,1]
  ],
  SILO: [
    [0,1,1,0],
    [1,1,1,1],
    [1,1,1,1],
    [1,1,1,1],
    [1,1,1,1]
  ],
  RUIN: [
    [0,0,0,0,1,0],
    [1,0,1,0,1,1],
    [1,1,1,0,1,1],
    [1,1,1,1,1,1]
  ],
  FENCE: [
    [1,0,1,0,1,0,1],
    [1,1,1,1,1,1,1],
    [1,0,1,0,1,0,1]
  ],
  LOGS: [
    [0,1,1,0],
    [1,1,1,1],
    [1,1,1,1]
  ],
  SIGN: [
    [1,1,1],
    [1,1,1],
    [0,1,0],
    [0,1,0]
  ],
  BOULDER: [
    [0,1,1,0],
    [1,1,1,1],
    [1,1,1,1],
    [0,1,1,1]
  ],
  FUEL: [
    [0,1,1,1,0],
    [1,1,1,1,1],
    [1,0,1,0,1],
    [1,0,1,0,1],
    [1,0,1,0,1],
    [1,0,1,0,1],
    [1,0,1,0,1],
    [1,0,1,0,1],
    [1,1,1,1,1],
    [0,1,1,1,0]
  ],
  FUEL_DEPOT: [
    [0,1,1,1,1,1,1,0],
    [1,1,0,0,0,0,1,1],
    [1,0,1,1,1,1,0,1],
    [1,0,1,0,0,1,0,1],
    [1,0,1,1,1,1,0,1],
    [1,0,1,0,0,0,0,1],
    [1,1,1,1,1,1,1,1],
    [0,1,1,1,1,1,1,0]
  ],
  MINE: [
    [1,0,0,0,1],
    [0,1,1,1,0],
    [0,1,0,1,0],
    [0,1,1,1,0],
    [1,0,0,0,1]
  ],
  ROCK: [
    [0,0,1,1,0,0],
    [0,1,1,1,1,0],
    [1,1,1,1,1,1],
    [0,1,1,1,1,1],
    [0,0,1,1,1,0]
  ],
  ITEM_SPREAD: [
    [1,0,0,0,1],
    [0,1,0,1,0],
    [0,0,1,0,0],
    [0,1,0,1,0],
    [1,0,0,0,1],
    [1,0,0,0,1]
  ],
  ITEM_RAPID: [
    [0,0,1,1,0],
    [0,1,1,0,0],
    [0,0,1,0,0],
    [0,1,1,0,0],
    [0,1,1,1,1],
    [0,0,0,0,1]
  ],
  ITEM_SHIELD: [
    [0,1,1,1,0],
    [1,0,0,0,1],
    [1,0,1,0,1],
    [1,0,0,0,1],
    [0,1,1,1,0]
  ],
  ITEM_REGEN: [
    [0,1,1,1,0],
    [1,0,1,0,1],
    [1,1,1,1,1],
    [1,0,1,0,1],
    [0,1,1,1,0]
  ],
  ITEM_SPEED: [
     [0,0,1,0,0],
     [0,0,1,0,0],
     [0,1,1,1,0],
     [1,0,1,0,1],
     [0,0,1,0,0]
  ],
  ITEM_LIFE: [
    [0,1,0,1,0],
    [1,1,1,1,1],
    [1,1,1,1,1],
    [1,1,1,1,1],
    [0,1,1,1,0],
    [0,0,1,0,0]
  ],
  BOSS_A: [ 
    [0,0,1,1,1,1,0,0],
    [0,1,1,1,1,1,1,0],
    [1,1,0,1,1,0,1,1],
    [1,1,1,1,1,1,1,1],
    [0,1,1,0,0,1,1,0],
    [0,1,0,0,0,0,1,0]
  ],
  BOSS_B: [
    [1,0,0,0,0,0,1],
    [1,1,0,1,0,1,1],
    [1,1,1,1,1,1,1],
    [0,1,1,1,1,1,0],
    [0,0,1,1,1,0,0],
    [0,0,1,1,1,0,0]
  ],
  BOSS_C: [
    [0,0,1,0,1,0,0],
    [0,1,1,1,1,1,0],
    [1,1,1,1,1,1,1],
    [1,1,0,1,0,1,1],
    [1,0,0,1,0,0,1]
  ]
};

// --- ENTITY & LEVEL CONFIGURATION ---

interface EntityDef {
  width: number;
  height: number;
  score: number;
  color: string;
  ground?: boolean; // Is this entity placed on the ground (sides)?
  obstacle?: boolean; // Is this a static obstacle?
  hp?: number; // Hit points for sturdy enemies
}

// Definition of spawn rates, scoring, and dimensions for all entities
const SPAWN_REGISTRY: Partial<Record<EntityType, EntityDef>> = {
  [EntityType.HELICOPTER]: { width: 20, height: 16, score: 100, color: '#ef4444' },
  [EntityType.SHIP]: { width: 24, height: 14, score: 60, color: '#ef4444' },
  [EntityType.DESTROYER]: { width: 30, height: 18, score: 300, color: '#64748b', hp: 3 }, // Armored
  [EntityType.SUBMARINE]: { width: 22, height: 12, score: 150, color: '#0ea5e9' },
  [EntityType.BOAT]: { width: 16, height: 12, score: 80, color: '#ef4444' },
  [EntityType.HOVERCRAFT]: { width: 18, height: 10, score: 150, color: '#10b981' },
  [EntityType.WRECK]: { width: 22, height: 16, score: 0, color: '#78350f', obstacle: true },
  [EntityType.BUOY]: { width: 12, height: 14, score: 0, color: '#ef4444', obstacle: true },
  [EntityType.JET]: { width: 20, height: 14, score: 200, color: '#3b82f6' },
  [EntityType.FIGHTER]: { width: 18, height: 16, score: 250, color: '#eab308' },
  [EntityType.DRONE]: { width: 10, height: 10, score: 300, color: '#a855f7' },
  [EntityType.BOMBER]: { width: 28, height: 20, score: 250, color: '#1e3a8a' },
  [EntityType.TANK]: { width: 18, height: 14, score: 150, color: '#57534e', ground: true },
  [EntityType.TURRET]: { width: 16, height: 16, score: 150, color: '#dc2626', ground: true },
  [EntityType.RADAR]: { width: 14, height: 14, score: 200, color: '#a3a3a3', ground: true },
  [EntityType.FUEL]: { width: 16, height: 25, score: 80, color: '#d946ef' },
  [EntityType.FUEL_DEPOT]: { width: 24, height: 20, score: 0, color: '#22d3ee' }, 
  [EntityType.MINE]: { width: 14, height: 14, score: 200, color: '#18181b' },
  [EntityType.ROCK]: { width: 20, height: 16, score: 0, color: '#525252', obstacle: true },
  [EntityType.BRIDGE]: { width: 320, height: 24, score: 500, color: '#fbbf24' },
  // Ground Scenery
  [EntityType.HOUSE]: { width: 20, height: 16, score: 50, color: '#eab308', ground: true },
  [EntityType.TREE]: { width: 16, height: 18, score: 0, color: '#166534', ground: true },
  [EntityType.PALM]: { width: 18, height: 20, score: 0, color: '#65a30d', ground: true },
  [EntityType.BASE]: { width: 24, height: 20, score: 100, color: '#3f3f46', ground: true },
  [EntityType.STABLE]: { width: 22, height: 18, score: 50, color: '#78350f', ground: true },
  [EntityType.BUNKER]: { width: 22, height: 16, score: 120, color: '#525252', ground: true },
  [EntityType.PIER]: { width: 20, height: 14, score: 40, color: '#a16207', ground: true },
  [EntityType.ANIMAL]: { width: 12, height: 10, score: 10, color: '#e5e7eb', ground: true },
  [EntityType.SHACK]: { width: 18, height: 14, score: 30, color: '#92400e', ground: true },
  [EntityType.CRATE]: { width: 12, height: 12, score: 20, color: '#b45309', ground: true },
  [EntityType.HERD]: { width: 18, height: 14, score: 30, color: '#d4d4d8', ground: true },
  [EntityType.SILO]: { width: 12, height: 20, score: 40, color: '#a3a3a3', ground: true },
  [EntityType.RUIN]: { width: 20, height: 16, score: 20, color: '#78716c', ground: true },
  [EntityType.FENCE]: { width: 24, height: 10, score: 10, color: '#9a3412', ground: true },
  [EntityType.LOGS]: { width: 14, height: 10, score: 10, color: '#713f12', ground: true },
  [EntityType.SIGN]: { width: 10, height: 14, score: 5, color: '#e5e5e5', ground: true },
  [EntityType.BOULDER]: { width: 14, height: 14, score: 10, color: '#525252', ground: true },

  // Powerups
  [EntityType.ITEM_SPREAD]: { width: 16, height: 16, score: 100, color: '#fbbf24' },
  [EntityType.ITEM_RAPID]: { width: 16, height: 16, score: 100, color: '#f97316' },
  [EntityType.ITEM_SHIELD]: { width: 16, height: 16, score: 100, color: '#22d3ee' },
  [EntityType.ITEM_REGEN]: { width: 16, height: 16, score: 100, color: '#4ade80' },
  [EntityType.ITEM_SPEED]: { width: 16, height: 16, score: 100, color: '#3b82f6' },
  [EntityType.ITEM_LIFE]: { width: 16, height: 16, score: 500, color: '#f43f5e' },
  
  [EntityType.WINGMAN]: { width: 20, height: 14, score: 0, color: '#22d3ee' },
};

interface LevelConfig {
  colors: { bg: string; water: string; earth: string; bridge: string };
  spawnRate: number; 
  pool: Partial<Record<EntityType, number>>; // Spawn probability weights
}

// Configuration for different game levels (colors, difficulty, enemy mix)
const LEVEL_CONFIGS: LevelConfig[] = [
  { // Level 1: Day
    colors: { bg: '#4d7c0f', water: '#3b82f6', earth: '#a16207', bridge: '#fbbf24' },
    spawnRate: 0.15,
    pool: { 
      [EntityType.HELICOPTER]: 20, [EntityType.SHIP]: 15, [EntityType.BOAT]: 15, 
      [EntityType.HOVERCRAFT]: 10, [EntityType.SUBMARINE]: 5, [EntityType.FUEL]: 25, 
      [EntityType.FUEL_DEPOT]: 5,
      [EntityType.ROCK]: 10, [EntityType.BUOY]: 5, [EntityType.WRECK]: 5,
      [EntityType.ITEM_RAPID]: 2, [EntityType.ITEM_REGEN]: 2, 
      [EntityType.ITEM_SPEED]: 2, [EntityType.BRIDGE]: 3 
    }
  },
  { // Level 2: Sunset
    colors: { bg: '#c2410c', water: '#1d4ed8', earth: '#78350f', bridge: '#d6d3d1' },
    spawnRate: 0.18,
    pool: { 
      [EntityType.HELICOPTER]: 10, [EntityType.JET]: 15, [EntityType.SHIP]: 10, 
      [EntityType.DESTROYER]: 5, [EntityType.SUBMARINE]: 10, [EntityType.FUEL]: 25,
      [EntityType.FUEL_DEPOT]: 5, [EntityType.DRONE]: 10,
      [EntityType.ROCK]: 15, [EntityType.BUOY]: 5, [EntityType.WRECK]: 5, 
      [EntityType.FIGHTER]: 15, [EntityType.ITEM_SPREAD]: 3, 
      [EntityType.ITEM_SHIELD]: 2, [EntityType.ITEM_REGEN]: 2, [EntityType.ITEM_SPEED]: 3,
      [EntityType.BRIDGE]: 4, [EntityType.ITEM_LIFE]: 1
    }
  },
  { // Level 3: Night
    colors: { bg: '#111827', water: '#312e81', earth: '#374151', bridge: '#9ca3af' },
    spawnRate: 0.20,
    pool: { 
      [EntityType.JET]: 20, [EntityType.BOMBER]: 15, [EntityType.MINE]: 20, 
      [EntityType.SUBMARINE]: 10, [EntityType.DESTROYER]: 15, [EntityType.FIGHTER]: 10,
      [EntityType.DRONE]: 15,
      [EntityType.FUEL]: 25, [EntityType.FUEL_DEPOT]: 5,
      [EntityType.ROCK]: 20, [EntityType.BUOY]: 10,
      [EntityType.ITEM_RAPID]: 3, [EntityType.ITEM_SHIELD]: 3, [EntityType.ITEM_SPEED]: 3, 
      [EntityType.BRIDGE]: 4, [EntityType.ITEM_LIFE]: 1
    }
  },
  { // Level 4+: Alien/Toxic
    colors: { bg: '#4c0519', water: '#064e3b', earth: '#4a044e', bridge: '#f43f5e' },
    spawnRate: 0.25,
    pool: { 
      [EntityType.JET]: 15, [EntityType.BOMBER]: 15, [EntityType.MINE]: 20, 
      [EntityType.HELICOPTER]: 5, [EntityType.FIGHTER]: 15, [EntityType.SUBMARINE]: 10, 
      [EntityType.DESTROYER]: 20, [EntityType.FUEL]: 25, [EntityType.FUEL_DEPOT]: 5,
      [EntityType.ROCK]: 20, [EntityType.DRONE]: 20,
      [EntityType.WRECK]: 10, [EntityType.ITEM_SPREAD]: 5, [EntityType.ITEM_RAPID]: 5, 
      [EntityType.ITEM_REGEN]: 3, [EntityType.ITEM_SPEED]: 3, [EntityType.BRIDGE]: 5, 
      [EntityType.ITEM_LIFE]: 1
    }
  }
];

// --- BOSS CONFIG ---
interface BossConfig {
  name: string;
  sprite: string;
  color: string;
  hp: number;
  width: number;
  height: number;
  behavior: 'HOVER' | 'STRAFE' | 'CHARGE';
  shootRate: number; // ms
}

const BOSS_CONFIGS: BossConfig[] = [
  { name: "IRON CHOPPER", sprite: 'BOSS_A', color: '#ef4444', hp: 30, width: 40, height: 30, behavior: 'HOVER', shootRate: 1500 },
  { name: "STEEL SHARK", sprite: 'BOSS_B', color: '#3b82f6', hp: 40, width: 40, height: 30, behavior: 'STRAFE', shootRate: 1200 },
  { name: "TWIN CANON", sprite: 'BOSS_C', color: '#fbbf24', hp: 50, width: 40, height: 30, behavior: 'HOVER', shootRate: 1000 },
  { name: "HEAVY TANKER", sprite: 'BOSS_A', color: '#57534e', hp: 60, width: 48, height: 36, behavior: 'CHARGE', shootRate: 2000 },
  { name: "DELTA WING", sprite: 'BOSS_B', color: '#a855f7', hp: 70, width: 40, height: 30, behavior: 'STRAFE', shootRate: 800 },
  { name: "RED BARON", sprite: 'BOSS_C', color: '#b91c1c', hp: 80, width: 40, height: 30, behavior: 'HOVER', shootRate: 600 },
  { name: "NIGHTHAWK", sprite: 'BOSS_B', color: '#111827', hp: 90, width: 40, height: 30, behavior: 'STRAFE', shootRate: 1000 },
  { name: "RIVER GOD", sprite: 'BOSS_A', color: '#06b6d4', hp: 100, width: 50, height: 40, behavior: 'HOVER', shootRate: 500 },
  { name: "MECHA CRAB", sprite: 'BOSS_C', color: '#ec4899', hp: 120, width: 40, height: 30, behavior: 'CHARGE', shootRate: 1500 },
  { name: "THE CORE", sprite: 'BOSS_B', color: '#ffffff', hp: 200, width: 60, height: 50, behavior: 'HOVER', shootRate: 400 },
];

// --- SOUND ENGINE ---
// Handles all synthesized audio using the Web Audio API.
class SoundEngine {
  ctx: AudioContext | null = null;
  gainNode: GainNode | null = null;
  engineOsc: OscillatorNode | null = null;
  engineGain: GainNode | null = null;
  
  ambienceNode: AudioBufferSourceNode | null = null;
  ambienceGain: GainNode | null = null;
  
  bossMusicTimer: number | null = null;
  isBossMusicPlaying: boolean = false;

  constructor() {
    try {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new Ctx();
      this.gainNode = this.ctx.createGain();
      this.gainNode.connect(this.ctx.destination);
      this.gainNode.gain.value = 0.3; 
    } catch (e) { console.error(e); }
  }

  /** Starts the continuous low engine hum sound */
  startEngineHum() {
    if (!this.ctx || this.engineOsc) return;
    try {
      const t = this.ctx.currentTime;
      this.engineOsc = this.ctx.createOscillator();
      this.engineGain = this.ctx.createGain();
      
      this.engineOsc.type = 'sawtooth';
      this.engineOsc.frequency.setValueAtTime(60, t);
      
      // Filter for a muffled engine sound
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 400;

      this.engineGain.gain.setValueAtTime(0.05, t);

      this.engineOsc.connect(filter);
      filter.connect(this.engineGain);
      this.engineGain.connect(this.gainNode!);
      this.engineOsc.start();
    } catch (e) { console.error("Error starting engine sound", e); }
  }

  /** Generates pink noise for wind/nature ambience */
  startNatureAmbience() {
    if (!this.ctx || this.ambienceNode) return;
    try {
       const bufferSize = this.ctx.sampleRate * 5; 
       const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
       const data = buffer.getChannelData(0);
       // Pink noise approximation
       let b0, b1, b2, b3, b4, b5, b6;
       b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
       for (let i = 0; i < bufferSize; i++) {
         const white = Math.random() * 2 - 1;
         b0 = 0.99886 * b0 + white * 0.0555179;
         b1 = 0.99332 * b1 + white * 0.0750759;
         b2 = 0.96900 * b2 + white * 0.1538520;
         b3 = 0.86650 * b3 + white * 0.3104856;
         b4 = 0.55000 * b4 + white * 0.5329522;
         b5 = -0.7616 * b5 - white * 0.0168981;
         data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
         data[i] *= 0.11; 
         b6 = white * 0.115926;
       }

       this.ambienceNode = this.ctx.createBufferSource();
       this.ambienceNode.buffer = buffer;
       this.ambienceNode.loop = true;

       const filter = this.ctx.createBiquadFilter();
       filter.type = 'bandpass';
       filter.frequency.value = 400;
       filter.Q.value = 0.5;

       // LFO to modulate wind
       const lfo = this.ctx.createOscillator();
       lfo.frequency.value = 0.1;
       const lfoGain = this.ctx.createGain();
       lfoGain.gain.value = 300;
       lfo.connect(lfoGain);
       lfoGain.connect(filter.frequency);
       lfo.start();

       this.ambienceGain = this.ctx.createGain();
       this.ambienceGain.gain.value = 0.05;

       this.ambienceNode.connect(filter);
       filter.connect(this.ambienceGain);
       this.ambienceGain.connect(this.gainNode!);
       this.ambienceNode.start();
    } catch (e) {}
  }

  stopNatureAmbience() {
    if (this.ambienceNode) {
      try { this.ambienceNode.stop(); this.ambienceNode.disconnect(); } catch(e){}
      this.ambienceNode = null;
    }
  }

  stopEngineHum() {
    if (this.engineOsc) {
      try {
        this.engineOsc.stop();
        this.engineOsc.disconnect();
        this.engineOsc = null;
      } catch (e) {}
    }
  }

  /** Modulates engine pitch based on flight speed */
  updateEngine(speed: number) {
    if (!this.ctx || !this.engineOsc) return;
    const pitch = 60 + (speed / MAX_SCROLL_SPEED) * 60;
    this.engineOsc.frequency.setTargetAtTime(pitch, this.ctx.currentTime, 0.1);
  }

  playTone(freq: number, type: OscillatorType, duration: number, vol: number = 0.1, slide: number = 0) {
    if (!this.ctx || this.ctx.state === 'suspended') return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slide !== 0) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(10, freq + slide), t + duration);
    }

    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc.connect(gain);
    gain.connect(this.gainNode!);
    osc.start();
    osc.stop(t + duration);
  }

  createNoiseBuffer() {
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * 2; 
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  playNoise(duration: number, vol: number = 0.1) {
    if (!this.ctx || this.ctx.state === 'suspended') return;
    const t = this.ctx.currentTime;
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.createNoiseBuffer();
    const noiseGain = this.ctx.createGain();
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1000;

    noiseGain.gain.setValueAtTime(vol, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.gainNode!);
    noise.start();
    noise.stop(t + duration);
  }
  
  startBossMusic() {
    if (this.isBossMusicPlaying || !this.ctx || this.ctx.state === 'suspended') return;
    this.isBossMusicPlaying = true;

    let step = 0;
    const playSeq = () => {
        if (!this.isBossMusicPlaying) return;
        
        // Menacing fast bass riff
        const notes = [
            82.41, 82.41, 98.00, 82.41, 110.00, 103.83, // E2, E2, G2, E2, A2, G#2
            82.41, 82.41, 123.47, 82.41, 116.54, 110.00  // E2, E2, B2, E2, A#2, A2
        ];
        
        const freq = notes[step % notes.length];
        this.playTone(freq, 'sawtooth', 0.12, 0.15);
        this.playTone(freq / 2, 'square', 0.12, 0.2);
        if (step % 8 === 0) {
             this.playTone(freq * 4, 'sine', 0.1, 0.05);
        }

        step++;
        this.bossMusicTimer = window.setTimeout(playSeq, 140); 
    };
    playSeq();
  }

  stopBossMusic() {
    this.isBossMusicPlaying = false;
    if (this.bossMusicTimer) {
        window.clearTimeout(this.bossMusicTimer);
        this.bossMusicTimer = null;
    }
  }

  shoot() { this.playTone(900, 'square', 0.1, 0.1, -400); }
  bossShoot() { this.playTone(200, 'sawtooth', 0.3, 0.2, -50); }
  coin() { this.playTone(1000, 'sine', 0.1, 0.1); setTimeout(() => this.playTone(1500, 'sine', 0.15, 0.05), 50); }
  hit() { this.playTone(150, 'square', 0.05, 0.1); }

  explosion() { 
    // Crunchier explosion mixing noise and low freq osc
    this.playNoise(0.5, 0.5); 
    this.playTone(100, 'sawtooth', 0.4, 0.4, -90);
    this.playTone(60, 'square', 0.5, 0.5, -50);
  }

  refuel() { this.playTone(1200, 'sine', 0.15, 0.05); }
  lowFuel() { this.playTone(150, 'sawtooth', 0.2, 0.1); }
  powerUp() { 
    this.playTone(600, 'sine', 0.1, 0.1, 200); 
    setTimeout(() => this.playTone(800, 'sine', 0.1, 0.1, 200), 100);
  }
  oneUp() {
    this.playTone(400, 'sine', 0.1, 0.1, 300);
    setTimeout(() => this.playTone(600, 'sine', 0.2, 0.1, 300), 150);
    setTimeout(() => this.playTone(1000, 'sine', 0.3, 0.2, 400), 300);
  }
  multiplierUp() {
    this.playTone(400, 'square', 0.1, 0.05, 200);
    setTimeout(() => this.playTone(600, 'square', 0.1, 0.05, 200), 100);
  }
  bossHit() { this.playTone(100, 'square', 0.1, 0.1); }
}

interface Props {
  hasWingman: boolean;
  highScores: HighScore[];
  onGameEnd: (score: number, initials: string | null, coinsEarned: number) => void;
  onExit?: () => void; // Backwards compat
}

/**
 * Core Game Component.
 * Handles the game loop, rendering, collision detection, and state management.
 */
const RiverRaidGame: React.FC<Props> = ({ hasWingman, highScores, onGameEnd, onExit }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  const previousTimeRef = useRef<number | undefined>(undefined);
  const [highScoreInitials, setHighScoreInitials] = useState('');
  const [showHighScoreInput, setShowHighScoreInput] = useState(false);
  
  const keys = useRef<{ [key: string]: boolean }>({});
  const soundRef = useRef<SoundEngine | null>(null);

  // Touch controls state
  const touchDirection = useRef<{ up: boolean; down: boolean; left: boolean; right: boolean }>({
    up: false, down: false, left: false, right: false
  });
  const touchShooting = useRef<boolean>(false);
  const [isMobile, setIsMobile] = useState(false);
  const [canvasScale, setCanvasScale] = useState(1.5);
  
  // Main Game State
  const gameState = useRef<GameState>({
    player: {
      id: 0,
      type: EntityType.PLAYER,
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT - 80,
      width: 24,
      height: 18,
      vx: 0, vy: 0,
      fuel: 100,
      speed: MIN_SCROLL_SPEED * 2,
      active: true,
      isDead: false,
      score: 0,
      lives: 3,
      frame: 0,
      upgrades: { spread: false, rapid: false, speed: false },
      invulnerableTimer: 1.5,
      multiplier: 1,
    },
    entities: [],
    particles: [],
    cameraY: 0,
    riverSeed: Math.random() * 9999,
    isGameOver: false,
    isPaused: false,
    lastShotTime: 0,
    level: 1,
    distanceSinceLastFuel: 0,
    distanceInLevel: 0,
    multiplierDistance: 0,
    bossActive: false,
    gameTime: 0,
    sessionCoins: 0,
  });

  // Separate state for React UI overlay updates (less frequent than game loop)
  const [hudState, setHudState] = useState({ 
    score: 0, fuel: 100, lives: 3, gameOver: false, level: 1, multiplier: 1,
    bossName: '', bossHp: 0, bossMaxHp: 0, isPaused: false, sessionCoins: 0,
    upgrades: { spread: false, rapid: false, speed: false },
    shieldActive: false
  });

  useEffect(() => {
      soundRef.current = new SoundEngine();
      const resume = () => {
          if (soundRef.current?.ctx) {
              soundRef.current.ctx.resume();
              soundRef.current.startEngineHum();
              soundRef.current.startNatureAmbience();
          }
      };
      window.addEventListener('keydown', resume, { once: true });
      window.addEventListener('touchstart', resume, { once: true });
      
      // Spawn Wingman if selected
      if (hasWingman) {
         gameState.current.entities.push({
           id: Math.random(),
           type: EntityType.WINGMAN,
           x: CANVAS_WIDTH / 2 - 30,
           y: CANVAS_HEIGHT - 80 + 20,
           width: 20, height: 14,
           vx: 0, vy: 0, active: true, frame: 0,
           scoreValue: 0
         });
      }

      return () => {
          soundRef.current?.stopEngineHum();
          soundRef.current?.stopNatureAmbience();
          soundRef.current?.stopBossMusic();
      };
  }, [hasWingman]);

  // --- GAME LOGIC HELPERS ---

  // Simplex noise-like function for procedural river path
  const noise = (y: number) => {
    const x = (y + gameState.current.riverSeed) * 0.006;
    return Math.sin(x) * 0.7 + Math.sin(x * 1.7) * 0.3;
  };

  // Calculates river width and center position for a given Y coordinate
  const getRiverStats = (y: number) => {
    const n = noise(y);
    const center = (CANVAS_WIDTH / 2) + (n * (CANVAS_WIDTH * 0.25));
    const levelFactor = Math.min(0.3, gameState.current.level * 0.02);
    // Boss arenas are straight and wide
    if (gameState.current.bossActive) {
        return { center: CANVAS_WIDTH/2, width: CANVAS_WIDTH * 0.85, isBridgeZone: false };
    }
    const baseWidth = CANVAS_WIDTH * (0.55 - levelFactor); 
    const width = baseWidth + (Math.cos(y * 0.01) * 30);
    return { center, width: Math.max(60, width), isBridgeZone: false };
  };

  const getBounds = (y: number) => {
    const { center, width } = getRiverStats(y);
    return { left: center - width / 2, right: center + width / 2 };
  };

  /** Spawns scenery and ground enemies on the river banks */
  const spawnBankEntity = (y: number, side: 'left' | 'right', limitX: number) => {
      const state = gameState.current;
      const r = Math.random();
      let type = EntityType.TREE;
      
      // Hostile Ground Units probability
      if (r < 0.20) {
           const roll = Math.random();
           if (roll > 0.6) type = EntityType.TANK;
           else if (roll > 0.5) type = EntityType.TURRET;
           else type = EntityType.RADAR;
      } else {
           // Scenery Mix
           const s = Math.random();
           if (s < 0.15) type = EntityType.TREE;
           else if (s < 0.25) type = EntityType.PALM;
           else if (s < 0.35) type = EntityType.HOUSE;
           else if (s < 0.40) type = EntityType.BUNKER;
           else if (s < 0.45) type = EntityType.BASE;
           else if (s < 0.50) type = EntityType.STABLE;
           else if (s < 0.55) type = EntityType.SHACK;
           else if (s < 0.60) type = EntityType.PIER;
           else if (s < 0.65) type = EntityType.CRATE;
           else if (s < 0.70) type = EntityType.HERD;
           else if (s < 0.75) type = EntityType.SILO;
           else if (s < 0.80) type = EntityType.RUIN;
           else if (s < 0.85) type = EntityType.FENCE;
           else if (s < 0.90) type = EntityType.LOGS;
           else if (s < 0.95) type = EntityType.SIGN;
           else if (s < 0.97) type = EntityType.BOULDER;
           else type = EntityType.ANIMAL;
      }

      const def = SPAWN_REGISTRY[type]!;
      let x = 0;
      const hugWater = Math.random() < 0.4; 

      // Place entity on left or right bank, optionally hugging the shore
      if (side === 'left') {
          const maxX = limitX - def.width; 
          const minX = 4;
          if (maxX < minX) return;
          
          if (hugWater && [EntityType.HOUSE, EntityType.SHACK, EntityType.BASE, EntityType.PIER, EntityType.BUNKER].includes(type)) {
             x = maxX; 
          } else {
             x = minX + Math.random() * (maxX - minX);
          }
      } else {
          const minX = limitX;
          const maxX = CANVAS_WIDTH - def.width - 4;
          if (maxX < minX) return;
          
          if (hugWater && [EntityType.HOUSE, EntityType.SHACK, EntityType.BASE, EntityType.PIER, EntityType.BUNKER].includes(type)) {
             x = minX; 
          } else {
             x = minX + Math.random() * (maxX - minX);
          }
      }

      let vx = 0;
      if (type === EntityType.TANK) vx = (Math.random() > 0.5 ? 1 : -1) * 10;
      else if (type === EntityType.ANIMAL || type === EntityType.HERD) vx = (Math.random() - 0.5) * 5;

      state.entities.push({
          id: Math.random(), type, x, y,
          width: def.width, height: def.height,
          vx, vy: 0, active: true, frame: 0, scoreValue: def.score
      });
  };

  /** Spawns enemies and items within the river channel */
  const spawnRiverEntity = (y: number) => {
    const state = gameState.current;
    const cfgIndex = Math.min(state.level - 1, LEVEL_CONFIGS.length - 1);
    const config = LEVEL_CONFIGS[cfgIndex];
    
    let forceFuel = false;
    if (state.distanceSinceLastFuel > FUEL_GUARANTEE_DISTANCE) {
        forceFuel = true;
        state.distanceSinceLastFuel = 0;
    }

    if (!forceFuel && Math.random() > config.spawnRate) return;

    let type = EntityType.HELICOPTER;
    if (forceFuel) {
        type = EntityType.FUEL;
    } else {
        // Weighted random selection from pool
        const pool = config.pool;
        const total = Object.values(pool).reduce((a, b) => a + b, 0);
        let r = Math.random() * total;
        for (const [k, v] of Object.entries(pool)) {
            if (r < v) { type = k as EntityType; break; }
            r -= v;
        }
    }
    
    if (type === EntityType.BRIDGE) {
        state.entities.push({
            id: Math.random(), type: EntityType.BRIDGE,
            x: CANVAS_WIDTH / 2, y, 
            width: CANVAS_WIDTH, height: 24,
            vx: 0, vy: 0, active: true, frame: 0, scoreValue: 500
        });
        return;
    }

    if (type === EntityType.FUEL) state.distanceSinceLastFuel = 0;

    const def = SPAWN_REGISTRY[type]!;
    const bounds = getBounds(y);
    if (def.ground) return; 

    const margin = 20;
    const x = bounds.left + margin + Math.random() * (bounds.right - bounds.left - margin * 2);
    
    let vx = 0;
    // Initialize velocities based on type
    if (type === EntityType.HELICOPTER) vx = (Math.random() > 0.5 ? 1 : -1) * (30 + state.level * 5);
    if (type === EntityType.JET) vx = (x < CANVAS_WIDTH/2 ? 1 : -1) * (100 + state.level * 20);
    if (type === EntityType.FIGHTER) vx = (Math.random() > 0.5 ? 1 : -1) * (80 + state.level * 15);
    if (type === EntityType.BOMBER) vx = (Math.random() > 0.5 ? 1 : -1) * 15;
    if (type === EntityType.SHIP || type === EntityType.DESTROYER) vx = (Math.random() > 0.5 ? 1 : -1) * 20;
    if (type === EntityType.BOAT) vx = (Math.random() > 0.5 ? 1 : -1) * 15;
    if (type === EntityType.SUBMARINE) vx = (Math.random() > 0.5 ? 1 : -1) * 10;
    if (type === EntityType.HOVERCRAFT) vx = (Math.random() > 0.5 ? 1 : -1) * 60;
    if (type === EntityType.DRONE) vx = (Math.random() > 0.5 ? 1 : -1) * 80;

    state.entities.push({
        id: Math.random(), type, x, y,
        width: def.width, height: def.height,
        vx, vy: 0, active: true, frame: 0, scoreValue: def.score,
        hp: def.hp
    });
  }

  /** Main spawner loop called as the player scrolls */
  const spawnEntity = (y: number) => {
    const state = gameState.current;
    // Check for Boss Spawn condition
    if (!state.bossActive && state.distanceInLevel > LEVEL_LENGTH) {
        if (!state.entities.some(e => e.type === EntityType.BOSS)) {
            const bossId = (state.level - 1) % BOSS_CONFIGS.length;
            const cfg = BOSS_CONFIGS[bossId];
            state.entities.push({
                id: Math.random(), type: EntityType.BOSS,
                x: CANVAS_WIDTH / 2, y: y + 100, 
                width: cfg.width, height: cfg.height,
                vx: 0, vy: 0, active: true, frame: 0,
                hp: cfg.hp, maxHp: cfg.hp, bossId: bossId,
                scoreValue: 2000
            });
            state.bossActive = true;
            soundRef.current?.startBossMusic();
            return; 
        }
    }

    if (state.bossActive) return; 

    spawnRiverEntity(y);
    const bounds = getBounds(y);
    spawnBankEntity(y, 'left', bounds.left);
    spawnBankEntity(y, 'right', bounds.right);
  };

  const createExplosion = (x: number, y: number, color: string, isBoss: boolean = false) => {
    soundRef.current?.explosion();
    const state = gameState.current;
    const countMultiplier = isBoss ? 5 : 1;
    
    // 1. Fast Debris (Pixels)
    for (let i = 0; i < 12 * countMultiplier; i++) {
        const angle = Math.random() * 6.28;
        const speed = (80 + Math.random() * 200) * (isBoss ? 1.5 : 1);
        state.particles.push({
            x, y, 
            vx: Math.cos(angle) * speed, 
            vy: Math.sin(angle) * speed,
            life: 0.3 + Math.random() * 0.4, 
            maxLife: 0.7,
            color: Math.random() > 0.5 ? '#f59e0b' : color, 
            size: 2 + Math.random() * 4,
            style: 'pixel'
        });
    }

    // 2. Expanding Smoke
    for (let i = 0; i < 6 * countMultiplier; i++) {
        state.particles.push({
            x: x + (Math.random() - 0.5) * 20, 
            y: y + (Math.random() - 0.5) * 20, 
            vx: (Math.random() - 0.5) * 40, 
            vy: (Math.random() - 0.5) * 40,
            life: 0.5 + Math.random() * 0.5, 
            maxLife: 1.0,
            color: '#ffffff', 
            size: 8 + Math.random() * 12 * (isBoss ? 2 : 1),
            style: 'smoke'
        });
    }

    // 3. Shockwave Ring
    state.particles.push({
        x, y, vx: 0, vy: 0,
        life: 0.4, maxLife: 0.4,
        color: '#ffffff', size: 10, style: 'shockwave'
    });
    
    if (isBoss) {
         setTimeout(() => soundRef.current?.explosion(), 200);
         setTimeout(() => soundRef.current?.explosion(), 400);
         // Extra shockwaves for Boss
         state.particles.push({ x, y, vx: 0, vy: 0, life: 0.6, maxLife: 0.6, color: '#fbbf24', size: 5, style: 'shockwave' });
    }
  };

  const createHitEffect = (x: number, y: number, color: string) => {
     const state = gameState.current;
     for(let i=0; i<3; i++) {
         state.particles.push({
             x, y, 
             vx: (Math.random() - 0.5) * 100, 
             vy: (Math.random() - 0.5) * 100,
             life: 0.2, maxLife: 0.2,
             color: color, size: 2, style: 'pixel'
         });
     }
  };

  const state = gameState.current; 

  // --- MAIN UPDATE LOOP ---
  const update = (dt: number) => {
    if (state.isGameOver) {
        soundRef.current?.stopEngineHum();
        soundRef.current?.stopNatureAmbience();
        soundRef.current?.stopBossMusic();
        return;
    }
    if (state.isPaused || state.player.isDead) return;
    
    // --- COIN LOGIC ---
    const prevTime = Math.floor(state.gameTime);
    state.gameTime += dt;
    const currTime = Math.floor(state.gameTime);
    
    // Earn coins every minute
    if (currTime > prevTime && currTime % 60 === 0) {
        const earned = hasWingman ? 2 : 1;
        state.sessionCoins += earned;
        soundRef.current?.coin();
    }

    // --- SPAWN PROTECTION ---
    if (state.player.invulnerableTimer > 0) {
        state.player.invulnerableTimer -= dt;
    }

    // --- PLAYER CONTROLS ---
    // Touch controls are 55% speed for better control
    const TOUCH_SPEED_MULTIPLIER = 0.55;

    // Horizontal movement (keyboard + touch)
    const usingTouchHorizontal = touchDirection.current.left || touchDirection.current.right;
    const usingKeyboardHorizontal = keys.current['ArrowLeft'] || keys.current['a'] || keys.current['ArrowRight'] || keys.current['d'];

    if (keys.current['ArrowLeft'] || keys.current['a'] || touchDirection.current.left) {
        state.player.vx = -PLAYER_SPEED_X * (usingTouchHorizontal && !usingKeyboardHorizontal ? TOUCH_SPEED_MULTIPLIER : 1);
    } else if (keys.current['ArrowRight'] || keys.current['d'] || touchDirection.current.right) {
        state.player.vx = PLAYER_SPEED_X * (usingTouchHorizontal && !usingKeyboardHorizontal ? TOUCH_SPEED_MULTIPLIER : 1);
    } else {
        state.player.vx = 0;
    }

    let targetScroll = MIN_SCROLL_SPEED * 1.5;
    let moveY = 0;

    // Vertical movement (keyboard + touch)
    const usingTouchVertical = touchDirection.current.up || touchDirection.current.down;
    const usingKeyboardVertical = keys.current['ArrowUp'] || keys.current['w'] || keys.current['ArrowDown'] || keys.current['s'];

    if (keys.current['ArrowUp'] || keys.current['w'] || touchDirection.current.up) {
        targetScroll = MAX_SCROLL_SPEED * (usingTouchVertical && !usingKeyboardVertical ? TOUCH_SPEED_MULTIPLIER : 1);
        moveY = -PLAYER_SPEED_Y * (usingTouchVertical && !usingKeyboardVertical ? TOUCH_SPEED_MULTIPLIER : 1);
    } else if (keys.current['ArrowDown'] || keys.current['s'] || touchDirection.current.down) {
        targetScroll = MIN_SCROLL_SPEED;
        moveY = PLAYER_SPEED_Y * (usingTouchVertical && !usingKeyboardVertical ? TOUCH_SPEED_MULTIPLIER : 1);
    }

    state.player.y += moveY * dt;
    state.player.y = Math.max(CANVAS_HEIGHT * 0.1, Math.min(CANVAS_HEIGHT * 0.85, state.player.y));

    state.player.speed += (targetScroll - state.player.speed) * 5 * dt;
    state.cameraY += state.player.speed * dt;
    
    soundRef.current?.updateEngine(state.player.speed);

    if (!state.bossActive) {
      state.distanceSinceLastFuel += state.player.speed * dt;
      state.distanceInLevel += state.player.speed * dt;
      state.multiplierDistance += state.player.speed * dt;
      
      // Increase multiplier based on distance
      if (state.multiplierDistance >= MULTIPLIER_INCREMENT_DISTANCE) {
          state.player.multiplier = Math.min(10, state.player.multiplier + 1); 
          state.multiplierDistance = 0;
          soundRef.current?.multiplierUp();
      }
    }

    state.player.x += state.player.vx * dt;

    // --- FUEL LOGIC ---
    // Only drain fuel if not fighting a boss
    if (!state.bossActive) {
        state.player.fuel -= FUEL_CONSUMPTION * dt;
    }

    // --- SHOOTING ---
    const fireDelay = state.player.upgrades.rapid ? 150 : 300;
    const bulletSpeed = state.player.upgrades.speed ? UPGRADED_BULLET_SPEED : BASE_BULLET_SPEED;

    // Check both keyboard space and touch shooting
    if ((keys.current[' '] || touchShooting.current) && Date.now() - state.lastShotTime > fireDelay) {
        state.lastShotTime = Date.now();
        soundRef.current?.shoot();
        
        const spawnBullet = (vxOffset: number) => {
            state.entities.push({
                id: Math.random(), type: EntityType.BULLET,
                x: state.player.x, y: state.cameraY + (CANVAS_HEIGHT - state.player.y) - 10,
                width: 4, height: 8, vx: vxOffset, vy: bulletSpeed + state.player.speed,
                active: true, frame: 0
            });
        };

        if (state.player.upgrades.spread) {
            spawnBullet(0); spawnBullet(-150); spawnBullet(150);
        } else {
            spawnBullet(0);
        }
    }

    // --- WORLD BOUNDS ---
    const worldPlayerY = state.cameraY + (CANVAS_HEIGHT - state.player.y);
    const bounds = getBounds(worldPlayerY);
    if (state.player.x < bounds.left + 8 || state.player.x > bounds.right - 8) {
        die();
    }

    // --- SPAWNING ---
    const spawnStep = 50;
    const currentSpawnY = Math.floor((state.cameraY + SPAWN_DISTANCE) / spawnStep) * spawnStep;
    const prevSpawnY = Math.floor((state.cameraY + SPAWN_DISTANCE - state.player.speed * dt) / spawnStep) * spawnStep;
    
    if (currentSpawnY > prevSpawnY) {
        for (let y = prevSpawnY + spawnStep; y <= currentSpawnY; y += spawnStep) {
            spawnEntity(y);
        }
    }

    // --- ENTITY UPDATE ---
    let activeBoss: Entity | null = null;

    state.entities.forEach(ent => {
        if (!ent.active) return;
        
        // Hit flash timer decay
        if (ent.hitFlashTimer && ent.hitFlashTimer > 0) ent.hitFlashTimer -= dt;

        // ENEMY UNIQUE BEHAVIORS
        if (ent.type === EntityType.BOMBER) {
             // Periodically drop a mine
             if (Math.random() < 0.015) {
                 state.entities.push({
                    id: Math.random(), type: EntityType.MINE,
                    x: ent.x, y: ent.y - 10, width: 14, height: 14,
                    vx: 0, vy: 0, active: true, frame: 0, scoreValue: 200
                 });
             }
        }
        
        if (ent.type === EntityType.FIGHTER) {
             // Evasive sine wave
             ent.x += Math.sin(Date.now() * 0.005 + ent.id) * 100 * dt;
        }
        
        if (ent.type === EntityType.DRONE) {
             // Fast erratic zigzag
             if (Math.random() < 0.1) ent.vx *= -1;
             ent.x += ent.vx * dt * 2;
        }

        // SPARKLING POWERUPS
        if (ent.type.startsWith('ITEM_') && Math.random() < 0.05) {
            state.particles.push({
                x: ent.x + (Math.random() - 0.5) * ent.width,
                y: ent.y + (Math.random() - 0.5) * ent.height,
                vx: 0, vy: -20,
                life: 0.3, maxLife: 0.3,
                color: '#fff', size: 2, style: 'pixel'
            });
        }

        // WINGMAN LOGIC
        if (ent.type === EntityType.WINGMAN) {
            // Follow player logic with lag
            const targetX = state.player.x + WINGMAN_OFFSET_X;
            const targetY = state.cameraY + (CANVAS_HEIGHT - state.player.y) - WINGMAN_OFFSET_Y;
            
            // Simple lerp
            ent.x += (targetX - ent.x) * 5 * dt;
            ent.y += (targetY - ent.y) * 5 * dt;
            
            // Bounds safety for wingman
            const wb = getBounds(ent.y);
            if (ent.x < wb.left + 10) ent.x = wb.left + 10;
            if (ent.x > wb.right - 10) ent.x = wb.right - 10;
            
            // Auto-shoot
            if (Math.random() < 0.05) { 
               const enemiesAhead = state.entities.some(e => 
                  e.active && e.type !== EntityType.BULLET && e.type !== EntityType.WINGMAN && e.type !== EntityType.PLAYER &&
                  e.y > ent.y && e.y < ent.y + 400 && Math.abs(e.x - ent.x) < 30
               );
               
               if (enemiesAhead) {
                   state.entities.push({
                        id: Math.random(), type: EntityType.BULLET,
                        x: ent.x, y: ent.y + 10,
                        width: 4, height: 8, vx: 0, vy: BASE_BULLET_SPEED + state.player.speed,
                        active: true, frame: 0
                   });
               }
            }
            return;
        }
        
        if (ent.type === EntityType.BOSS) {
            activeBoss = ent;
            const cfg = BOSS_CONFIGS[ent.bossId || 0];
            
            ent.y = state.cameraY + (CANVAS_HEIGHT - 100); 
            
            if (cfg.behavior === 'STRAFE') {
                ent.x += Math.sin(Date.now() * 0.002) * 100 * dt; 
                ent.x = Math.max(bounds.left + 40, Math.min(bounds.right - 40, ent.x));
            } else if (cfg.behavior === 'CHARGE') {
                ent.x += (state.player.x - ent.x) * 2 * dt;
            } else {
                ent.x = CANVAS_WIDTH / 2 + Math.sin(Date.now() * 0.001) * 80;
            }

            // Boss Shooting
            if (Math.random() < (dt * 1000) / cfg.shootRate) {
                 soundRef.current?.bossShoot();
                 const dx = state.player.x - ent.x;
                 const dy = -300; 
                 const dist = Math.sqrt(dx*dx + dy*dy);
                 const dirX = dx / dist;
                 const dirY = dy / dist;
                 
                 state.entities.push({
                    id: Math.random(), type: EntityType.BOSS_BULLET,
                    x: ent.x, y: ent.y, width: 6, height: 6,
                    vx: dirX * BOSS_BULLET_SPEED, 
                    vy: dirY * BOSS_BULLET_SPEED,
                    active: true, frame: 0
                 });
            }
        } else if (ent.type === EntityType.BOSS_BULLET) {
            ent.y += (ent.vy - state.player.speed) * dt; 
            ent.x += ent.vx * dt;
        } else if (ent.type === EntityType.BULLET) {
             ent.y += ent.vy * dt;
             ent.x += ent.vx * dt;
        } else {
             ent.x += ent.vx * dt;
        }

        // Bounds Check for enemies
        if ([EntityType.HELICOPTER, EntityType.SHIP, EntityType.BOAT, EntityType.SUBMARINE, EntityType.DESTROYER, EntityType.JET, EntityType.FIGHTER, EntityType.DRONE, EntityType.HOVERCRAFT].includes(ent.type)) {
            const b = getBounds(ent.y);
            if (ent.x < b.left + 10 || ent.x > b.right - 10) ent.vx *= -1;
        }

        // Remove entities that fall off bottom screen
        if (ent.y < state.cameraY - 200) ent.active = false; 

        // Collision Detection
        const entScreenY = CANVAS_HEIGHT - (ent.y - state.cameraY);
        const playerScreenY = state.player.y;
        
        // Player vs Entity
        if (ent.type !== EntityType.BULLET && ent.type !== EntityType.BOSS_BULLET && ent.type !== EntityType.WINGMAN &&
            Math.abs(state.player.x - ent.x) < (state.player.width + ent.width)/2 - 4 &&
            Math.abs(playerScreenY - entScreenY) < (state.player.height + ent.height)/2 - 4) {
            
            if (ent.type === EntityType.FUEL) {
                state.player.fuel = Math.min(100, state.player.fuel + 40 * dt);
                if (Math.random() > 0.8) soundRef.current?.refuel();
                if (state.player.multiplier > 1) { state.player.multiplier = 1; state.multiplierDistance = 0; }
            } else if (ent.type === EntityType.FUEL_DEPOT) {
                state.player.fuel = 100; // Instant refill
                soundRef.current?.oneUp(); // Distinct sound
                if (state.player.multiplier > 1) { state.player.multiplier = 1; state.multiplierDistance = 0; }
            } else if ([EntityType.ITEM_SPREAD, EntityType.ITEM_RAPID, EntityType.ITEM_SHIELD, EntityType.ITEM_REGEN, EntityType.ITEM_SPEED, EntityType.ITEM_LIFE].includes(ent.type)) {
                ent.active = false;
                
                if (ent.type === EntityType.ITEM_SPREAD) { state.player.upgrades.spread = true; soundRef.current?.powerUp(); }
                if (ent.type === EntityType.ITEM_RAPID) { state.player.upgrades.rapid = true; soundRef.current?.powerUp(); }
                if (ent.type === EntityType.ITEM_SPEED) { state.player.upgrades.speed = true; soundRef.current?.powerUp(); }
                if (ent.type === EntityType.ITEM_REGEN) { state.player.fuel = 100; soundRef.current?.powerUp(); }
                if (ent.type === EntityType.ITEM_SHIELD) { state.player.invulnerableTimer = 10; soundRef.current?.powerUp(); }
                if (ent.type === EntityType.ITEM_LIFE) { state.player.lives++; soundRef.current?.oneUp(); }

            } else {
                if (state.player.invulnerableTimer > 0) {
                   if (ent.type !== EntityType.BOSS && ent.type !== EntityType.BRIDGE) {
                       ent.active = false; 
                       createExplosion(ent.x, entScreenY, SPAWN_REGISTRY[ent.type]?.color || '#fff');
                   }
                } else {
                    die();
                }
            }
        }
        
        // Player vs Boss Bullet
        if (ent.type === EntityType.BOSS_BULLET) {
             if (Math.abs(state.player.x - ent.x) < 10 && Math.abs(playerScreenY - entScreenY) < 10) {
                 if (state.player.invulnerableTimer > 0) {
                     ent.active = false;
                 } else {
                     die();
                 }
             }
        }

        // Player Bullet vs Entity
        if (ent.type === EntityType.BULLET) {
             state.entities.forEach(target => {
                 if (!target.active || target === ent || target.type === EntityType.BULLET || target.type === EntityType.EXPLOSION || target.type === EntityType.BOSS_BULLET || target.type === EntityType.WINGMAN) return;

                 const targetScreenY = CANVAS_HEIGHT - (target.y - state.cameraY);
                 if (Math.abs(ent.x - target.x) < target.width/2 + 4 && Math.abs(ent.y - target.y) < target.height/2 + 4) {
                     ent.active = false;
                     
                     if (target.type === EntityType.BRIDGE) {
                         target.active = false;
                         createExplosion(target.x, targetScreenY, '#fbbf24');
                         state.player.score += (target.scoreValue || 500) * state.player.multiplier;
                         soundRef.current?.explosion();
                     } else if (target.type === EntityType.BOSS) {
                         soundRef.current?.bossHit();
                         target.hp = (target.hp || 0) - 1;
                         createHitEffect(target.x, targetScreenY, '#fff'); 

                         if ((target.hp || 0) <= 0) {
                             target.active = false;
                             createExplosion(target.x, targetScreenY, '#fff', true);
                             
                             state.player.score += (target.scoreValue || 2000) * state.player.multiplier;
                             state.bossActive = false;
                             state.player.lives++; // Boss reward
                             soundRef.current?.oneUp();
                             
                             // --- SAFE TRANSITION LOGIC ---
                             const playerWorldY = state.cameraY + (CANVAS_HEIGHT - state.player.y);
                             const newRiverStats = getRiverStats(playerWorldY);
                             
                             state.player.x = newRiverStats.center;
                             state.player.vx = 0;
                             state.player.invulnerableTimer = 2.0;

                             soundRef.current?.stopBossMusic();
                             state.distanceInLevel = 0;
                             state.level++;
                             
                             state.entities.push({
                                id: Math.random(), type: EntityType.BRIDGE,
                                x: CANVAS_WIDTH/2, y: state.cameraY + SPAWN_DISTANCE, width: CANVAS_WIDTH, height: 24,
                                vx: 0, vy: 0, active: true, frame: 0, scoreValue: 500
                             });
                         }
                     } else if ([EntityType.ITEM_SPREAD, EntityType.ITEM_RAPID, EntityType.ITEM_SHIELD, EntityType.ITEM_REGEN, EntityType.ITEM_SPEED, EntityType.ITEM_LIFE].includes(target.type)) {
                         // Safe
                     } else if (target.type === EntityType.FUEL_DEPOT) {
                         // If user wants to destroy them:
                         target.active = false;
                         createExplosion(target.x, targetScreenY, '#22d3ee');
                         state.player.score += 300 * state.player.multiplier;
                     } else {
                         // Logic for armored enemies
                         if (target.hp && target.hp > 1) {
                             target.hp -= 1;
                             target.hitFlashTimer = 0.1; // Flash white for 100ms
                             soundRef.current?.hit();
                             createHitEffect(target.x, targetScreenY, '#fff');
                         } else {
                             target.active = false;
                             createExplosion(target.x, targetScreenY, SPAWN_REGISTRY[target.type]?.color || '#fff');
                             state.player.score += (target.scoreValue || 50) * state.player.multiplier;
                         }
                     }
                 }
             });
        }
    });

    state.particles.forEach(p => {
        if (p.style === 'shockwave') {
            p.size += 120 * dt; 
        } else if (p.style === 'smoke') {
            p.x += p.vx * dt;
            p.y += (p.vy + state.player.speed) * dt;
            p.size += 10 * dt;
        } else {
            p.x += p.vx * dt;
            p.y += (p.vy + state.player.speed) * dt;
        }
        p.life -= dt;
    });
    state.particles = state.particles.filter(p => p.life > 0);

    if (state.player.fuel <= 0) die();
    if (state.player.fuel < 25 && Math.random() < 0.05) soundRef.current?.lowFuel();

    // Sync local state with React state for UI (throttled to approx 60fps anyway)
    if (Math.random() > 0.1) {
        let bossData = { bossName: '', bossHp: 0, bossMaxHp: 0 };
        if (activeBoss) {
             const b = activeBoss as Entity;
             const cfg = BOSS_CONFIGS[b.bossId || 0];
             bossData = { bossName: cfg.name, bossHp: b.hp || 0, bossMaxHp: b.maxHp || 1 };
        }

        setHudState(prev => ({ 
            ...prev,
            score: state.player.score, 
            fuel: state.player.fuel, 
            lives: state.player.lives, 
            gameOver: state.isGameOver,
            level: state.level,
            multiplier: state.player.multiplier,
            sessionCoins: state.sessionCoins,
            upgrades: { ...state.player.upgrades },
            shieldActive: state.player.invulnerableTimer > 0,
            ...bossData
        }));
    }
  };

  /** Handles player death sequence */
  const die = () => {
      if (state.player.isDead || state.player.invulnerableTimer > 0) return;
      soundRef.current?.stopBossMusic();
      soundRef.current?.stopEngineHum();
      createExplosion(state.player.x, state.player.y, '#fbbf24');
      state.player.isDead = true;
      state.player.lives--;
      state.player.upgrades = { spread: false, rapid: false, speed: false };
      state.player.multiplier = 1;
      state.multiplierDistance = 0;

      setTimeout(() => {
          if (state.player.lives > 0) {
              state.player.isDead = false;
              state.player.active = true;
              state.player.fuel = 100;
              state.player.y = CANVAS_HEIGHT - 80;
              state.player.invulnerableTimer = 1.5; // Spawn Shield
              const b = getBounds(state.cameraY + 200);
              state.player.x = (b.left + b.right) / 2;
              state.player.vx = 0;
              state.entities = state.entities.filter(e => e.type !== EntityType.BOSS_BULLET);
              soundRef.current?.startEngineHum();
              soundRef.current?.startNatureAmbience();
          } else {
              state.isGameOver = true;
              setHudState(s => ({...s, gameOver: true}));
              
              // Check High Score
              const isHighScore = highScores.length < 10 || state.player.score > highScores[highScores.length - 1].score;
              if (isHighScore) {
                  setShowHighScoreInput(true);
              }
          }
      }, 1500);
  };

  const handleHighScoreSubmit = () => {
    if (highScoreInitials.length > 0) {
        onGameEnd(state.player.score, highScoreInitials, state.sessionCoins);
    }
  };

  // --- RENDERER ---
  const drawSprite = (ctx: CanvasRenderingContext2D, type: string, x: number, y: number, scale: number = 2, colorOverride?: string) => {
      const sprite = SPRITES[type];
      if (!sprite) return;
      const h = sprite.length * scale;
      const w = sprite[0].length * scale;
      
      ctx.save();
      ctx.translate(Math.floor(x - w/2), Math.floor(y - h/2));
      ctx.fillStyle = colorOverride || '#fff';
      
      for (let r = 0; r < sprite.length; r++) {
          for (let c = 0; c < sprite[0].length; c++) {
              if (sprite[r][c]) ctx.fillRect(c * scale, r * scale, scale, scale);
          }
      }
      ctx.restore();
  };

  const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const cfg = LEVEL_CONFIGS[(state.level - 1) % LEVEL_CONFIGS.length];

      // Draw Background
      ctx.fillStyle = cfg.colors.bg;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      const startY = Math.floor(state.cameraY / RIVER_SEGMENT_HEIGHT) * RIVER_SEGMENT_HEIGHT;
      const endY = startY + CANVAS_HEIGHT + RIVER_SEGMENT_HEIGHT;
      
      // Draw River
      ctx.fillStyle = cfg.colors.water;
      ctx.beginPath();
      for (let y = startY; y <= endY; y += RIVER_SEGMENT_HEIGHT) {
          const b = getBounds(y);
          const sy = CANVAS_HEIGHT - (y - state.cameraY);
          ctx.rect(b.left, sy - RIVER_SEGMENT_HEIGHT, b.right - b.left, RIVER_SEGMENT_HEIGHT + 2);
      }
      ctx.fill();

      // Draw River Banks (Earth)
      ctx.fillStyle = cfg.colors.earth;
      for (let y = startY; y <= endY; y += RIVER_SEGMENT_HEIGHT) {
          const b = getBounds(y);
          const sy = CANVAS_HEIGHT - (y - state.cameraY);
          ctx.fillRect(b.left - 5, sy - RIVER_SEGMENT_HEIGHT, 5, RIVER_SEGMENT_HEIGHT + 2);
          ctx.fillRect(b.right, sy - RIVER_SEGMENT_HEIGHT, 5, RIVER_SEGMENT_HEIGHT + 2);
      }

      // Draw Entities
      state.entities.forEach(ent => {
          if (!ent.active) return;
          const screenY = CANVAS_HEIGHT - (ent.y - state.cameraY);
          if (screenY < -50 || screenY > CANVAS_HEIGHT + 50) return;

          if (ent.type === EntityType.BRIDGE) {
              ctx.fillStyle = cfg.colors.bridge;
              ctx.fillRect(0, screenY - 12, CANVAS_WIDTH, 24);
              ctx.fillStyle = '#000';
              ctx.fillRect(0, screenY - 2, CANVAS_WIDTH, 4);
              ctx.fillStyle = '#fbbf24';
              ctx.font = '10px monospace';
              ctx.fillText(`BRIDGE`, CANVAS_WIDTH/2 - 20, screenY - 15);
          } else if (ent.type === EntityType.BULLET) {
              ctx.fillStyle = '#fbbf24';
              ctx.fillRect(ent.x - 2, screenY - 4, 4, 8);
          } else if (ent.type === EntityType.BOSS_BULLET) {
              ctx.fillStyle = '#ff0000';
              ctx.fillRect(ent.x - 3, screenY - 3, 6, 6);
          } else if (ent.type === EntityType.BOSS) {
             const bossCfg = BOSS_CONFIGS[ent.bossId || 0];
             // Pulsing boss effect
             const pulse = 1 + Math.sin(Date.now() * 0.01) * 0.1;
             ctx.save();
             ctx.translate(ent.x, screenY);
             ctx.scale(pulse, pulse);
             ctx.translate(-ent.x, -screenY);
             drawSprite(ctx, bossCfg.sprite, ent.x, screenY, 4, bossCfg.color);
             ctx.restore();
          } else if (ent.type === EntityType.WINGMAN) {
             drawSprite(ctx, 'WINGMAN', ent.x, screenY, 2.5, '#22d3ee');
          } else {
              const def = SPAWN_REGISTRY[ent.type] || { color: '#fff' };
              const isAir = ent.type === EntityType.JET || ent.type === EntityType.HELICOPTER || ent.type === EntityType.BOMBER || ent.type === EntityType.FIGHTER || ent.type === EntityType.DRONE;
              
              // Hit Flash Logic
              let color = def.color;
              if (ent.hitFlashTimer && ent.hitFlashTimer > 0) {
                  color = '#ffffff'; // Flash white
              }

              if (isAir) drawSprite(ctx, ent.type, ent.x + 10, screenY + 10, 2.5, 'rgba(0,0,0,0.3)'); // Shadow
              drawSprite(ctx, ent.type, ent.x, screenY, 2.5, color);
              
              if (ent.type === EntityType.SHIP || ent.type === EntityType.BOAT || ent.type === EntityType.SUBMARINE || ent.type === EntityType.DESTROYER || ent.type === EntityType.HOVERCRAFT) {
                  ctx.fillStyle = 'rgba(255,255,255,0.3)';
                  ctx.fillRect(ent.x - 4, screenY + 10, 8, 4); // Water trail
              }
          }
      });

      // Draw Player
      if (!state.player.isDead) {
          // Render Spawn Shield / Invulnerability Blink
          if (state.player.invulnerableTimer > 0) {
             // Bubble Shield Visuals
             ctx.beginPath();
             ctx.arc(state.player.x, state.player.y, 30, 0, Math.PI * 2);
             ctx.fillStyle = `rgba(6, 182, 212, ${0.2 + Math.sin(Date.now() * 0.01) * 0.1})`; 
             ctx.fill();
             ctx.lineWidth = 2;
             ctx.strokeStyle = `rgba(165, 243, 252, ${0.6 + Math.sin(Date.now() * 0.015) * 0.4})`;
             ctx.stroke();
             
             // Player still visible inside
             drawSprite(ctx, 'PLAYER', state.player.x, state.player.y, 2.5, '#eab308');
          } else {
             drawSprite(ctx, 'PLAYER', state.player.x + 8, state.player.y + 8, 2.5, 'rgba(0,0,0,0.4)');
             drawSprite(ctx, 'PLAYER', state.player.x, state.player.y, 2.5, '#eab308');
             ctx.fillStyle = Math.random() > 0.5 ? '#ef4444' : '#f59e0b';
             ctx.fillRect(state.player.x - 2, state.player.y + 12, 4, 6);
          }
      }

      // Draw Particles
      state.particles.forEach(p => {
          if (p.style === 'shockwave') {
             ctx.beginPath();
             ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
             ctx.strokeStyle = p.color;
             ctx.lineWidth = 2;
             ctx.globalAlpha = p.life / p.maxLife;
             ctx.stroke();
          } else if (p.style === 'smoke') {
             ctx.beginPath();
             ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
             ctx.fillStyle = `rgba(255,255,255,0.3)`;
             ctx.globalAlpha = p.life / p.maxLife;
             ctx.fill();
          } else {
              ctx.fillStyle = p.color;
              ctx.globalAlpha = p.life / p.maxLife;
              const s = p.size || 4; 
              ctx.fillRect(p.x - s/2, p.y - s/2, s, s);
          }
          ctx.globalAlpha = 1;
      });
  };

  const loop = (time: number) => {
      if (previousTimeRef.current !== undefined) {
          const dt = Math.min((time - previousTimeRef.current) / 1000, 0.06);
          update(dt);
          draw();
      }
      previousTimeRef.current = time;
      requestRef.current = requestAnimationFrame(loop);
  };

  // Detect mobile and set canvas scale
  useEffect(() => {
    const mobile = isMobileDevice();
    setIsMobile(mobile);
    setCanvasScale(getCanvasScale());

    const handleResize = () => {
      setCanvasScale(getCanvasScale());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          if (e.key.toLowerCase() === 'p') {
              const isPaused = !gameState.current.isPaused;
              gameState.current.isPaused = isPaused;
              setHudState(prev => ({ ...prev, isPaused }));
              
              // Suspend audio context to pause all sound effects
              if (soundRef.current?.ctx) {
                  if (isPaused) soundRef.current.ctx.suspend();
                  else soundRef.current.ctx.resume();
              }
          }
          keys.current[e.key] = true;
      };
      const handleKeyUp = (e: KeyboardEvent) => {
          keys.current[e.key] = false;
      };

      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
      requestRef.current = requestAnimationFrame(loop);
      return () => {
          window.removeEventListener('keydown', handleKeyDown);
          window.removeEventListener('keyup', handleKeyUp);
          cancelAnimationFrame(requestRef.current);
      };
  }, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-black">
      <div className="relative">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="bg-black shadow-2xl origin-center border-4 border-zinc-800"
            style={{
              imageRendering: 'pixelated',
              transform: `scale(${canvasScale})`
            }}
          />
          
          {/* HUD */}
          <div className="absolute top-0 left-0 w-full p-2 flex justify-between font-mono text-white font-bold text-sm tracking-wider drop-shadow-md pointer-events-none">
              <div className="flex flex-col">
                  <div>SCORE {hudState.score.toString().padStart(6, '0')}</div>
                  <div className="text-xs text-slate-400">LIVES {hudState.lives}</div>
              </div>
              
              {/* ACTIVE POWERUPS */}
              <div className="flex flex-col items-end gap-1">
                 {hudState.shieldActive && (
                    <div className="flex items-center gap-1 text-cyan-400 bg-slate-900/50 px-1 rounded">
                       <div className="w-2 h-2 rounded-full border border-current"></div> SHIELD
                    </div>
                 )}
                 {hudState.upgrades.spread && (
                    <div className="flex items-center gap-1 text-yellow-400 bg-slate-900/50 px-1 rounded">
                       <div className="text-[8px] font-bold">[W]</div> SPREAD
                    </div>
                 )}
                 {hudState.upgrades.rapid && (
                    <div className="flex items-center gap-1 text-orange-400 bg-slate-900/50 px-1 rounded">
                       <div className="text-[8px] font-bold">{'>>>'}</div> RAPID
                    </div>
                 )}
                 {hudState.upgrades.speed && (
                    <div className="flex items-center gap-1 text-blue-400 bg-slate-900/50 px-1 rounded">
                       <div className="text-[8px] font-bold">SPD</div> SPEED
                    </div>
                 )}
              </div>
          </div>

           {/* BOSS BAR */}
           {hudState.bossHp > 0 && (
            <div className="absolute top-12 left-1/2 -translate-x-1/2 w-64 text-center">
                <div className="text-red-500 font-black tracking-widest text-xs mb-1 animate-pulse">{hudState.bossName}</div>
                <div className="w-full h-3 bg-zinc-900 border border-red-900">
                    <div className="h-full bg-red-600 transition-all duration-200" style={{ width: `${(hudState.bossHp/hudState.bossMaxHp)*100}%` }} />
                </div>
            </div>
          )}
          
          <div className="absolute top-8 w-full text-center pointer-events-none">
             {hudState.multiplier > 1 && (
               <div className="text-yellow-400 font-black text-lg tracking-widest animate-pulse drop-shadow-[0_2px_0_rgba(0,0,0,0.5)]">
                 MULTIPLIER X{hudState.multiplier}
               </div>
             )}
          </div>
          
          {/* PAUSE OVERLAY */}
          {hudState.isPaused && (
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-50 backdrop-blur-sm">
                  <h2 className="text-6xl font-black text-white tracking-widest drop-shadow-[4px_4px_0_rgba(0,0,0,1)] animate-pulse">PAUSED</h2>
                  <p className="text-white mt-4 font-mono text-sm blink">PRESS 'P' TO RESUME</p>
              </div>
          )}

          {/* FUEL GAUGE */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-48 h-6 bg-zinc-900 border-2 border-zinc-600 rounded">
              <div 
                className={`h-full transition-all duration-200 ${
                   hudState.fuel < 25 ? 'bg-red-500 animate-pulse' : 'bg-gradient-to-r from-yellow-500 to-green-500'
                }`}
                style={{ width: `${Math.max(0, hudState.fuel)}%` }}
              />
              <div className="absolute top-0 w-full text-center text-[10px] text-white font-bold leading-5 drop-shadow-md">
                FUEL
              </div>
          </div>
          
          {/* COIN NOTIFICATION */}
          {hudState.sessionCoins > 0 && !hudState.gameOver && (
              <div className="absolute top-1/2 right-4 -translate-y-1/2 flex flex-col items-end opacity-80 pointer-events-none">
                 <div className="text-yellow-400 font-bold text-xs mb-1">SESSION LOOT</div>
                 <div className="bg-yellow-500 text-black font-black px-2 py-1 rounded text-sm flex items-center gap-1">
                   <span>+{hudState.sessionCoins}</span>
                   <div className="w-2 h-2 rounded-full bg-black"></div>
                 </div>
              </div>
          )}

          {hudState.gameOver && (
              <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center space-y-4 animate-fade-in z-50">
                  <h2 className="text-5xl font-black text-red-600 tracking-widest animate-bounce drop-shadow-[2px_2px_0_#fff]">GAME OVER</h2>
                  <div className="text-2xl text-white font-mono animate-pulse">FINAL SCORE: {hudState.score}</div>
                  
                  {showHighScoreInput ? (
                      <div className="bg-blue-900/80 p-4 border-2 border-blue-500 rounded flex flex-col items-center gap-4 animate-pulse">
                          <div className="text-yellow-400 font-black text-xl">NEW HIGH SCORE!</div>
                          <div className="text-sm text-white">ENTER INITIALS:</div>
                          <input 
                            type="text" 
                            maxLength={3}
                            value={highScoreInitials}
                            onChange={(e) => setHighScoreInitials(e.target.value.toUpperCase())}
                            className="bg-black text-white font-mono text-3xl w-24 text-center border-b-2 border-white outline-none"
                            autoFocus
                          />
                          <button 
                             onClick={handleHighScoreSubmit}
                             disabled={highScoreInitials.length < 3}
                             className="px-4 py-2 bg-green-600 text-white font-bold rounded disabled:opacity-50"
                          >
                             SUBMIT
                          </button>
                      </div>
                  ) : (
                      <>
                        <div className="text-yellow-500 font-mono text-sm">COINS EARNED: {hudState.sessionCoins}</div>
                        <button 
                            onClick={() => onGameEnd(hudState.score, null, hudState.sessionCoins)}
                            className="px-8 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-black text-xl uppercase tracking-wide rounded shadow-[0_4px_0_#a16207] active:translate-y-1 active:shadow-none transition-all"
                        >
                            RETURN TO BASE
                        </button>
                      </>
                  )}
              </div>
          )}

          {/* Touch Controls - Only on Mobile */}
          {isMobile && (
            <>
              <VirtualJoystick
                onDirectionChange={(direction) => {
                  touchDirection.current = direction;
                }}
              />
              <ShootButton
                onShoot={(shooting) => {
                  touchShooting.current = shooting;
                }}
              />
            </>
          )}

          {/* Fullscreen Button */}
          <FullscreenButton />
      </div>
    </div>
  );
};

export default RiverRaidGame;