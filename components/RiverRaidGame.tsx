
import React, { useEffect, useRef, useState } from 'react';
import { Entity, EntityType, GameState, Player } from '../types';

// --- CONSTANTS ---
const CANVAS_WIDTH = 320;
const CANVAS_HEIGHT = 480;
const PLAYER_SPEED_X = 190;
const PLAYER_SPEED_Y = 180;
const MAX_SCROLL_SPEED = 250;
const MIN_SCROLL_SPEED = 60;
const BULLET_SPEED = 600;
const FUEL_CONSUMPTION = 5.5;
const RIVER_SEGMENT_HEIGHT = 20;
const SPAWN_DISTANCE = 700;
const FUEL_GUARANTEE_DISTANCE = 400; // Much more frequent fuel
const POWERUP_DURATION = 10; // Seconds
const MULTIPLIER_INCREMENT_DISTANCE = 1000; // Distance to travel to increase multiplier

// --- SPRITE DEFINITIONS (Improved Pixel Art) ---
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
  BOAT: [
    [0,0,0,0,0],
    [0,0,1,0,0],
    [0,1,1,1,0],
    [1,1,1,1,1],
    [0,1,1,1,0]
  ],
  JET: [
    [0,0,0,1,0,0,0],
    [0,0,1,1,1,0,0],
    [0,1,1,1,1,1,0],
    [1,1,0,1,0,1,1],
    [1,1,0,1,0,1,1],
    [1,0,0,1,0,0,1]
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
  FUEL: [
    [0,1,1,1,0],
    [1,1,1,1,1],
    [1,0,1,0,1],
    [1,0,1,0,1],
    [1,1,1,1,1],
    [0,1,1,1,0]
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
  ]
};

// --- ENTITY & LEVEL CONFIGURATION ---

interface EntityDef {
  width: number;
  height: number;
  score: number;
  color: string;
  ground?: boolean; // true if it spawns on land (banks)
  obstacle?: boolean; // true if it's a static obstacle (Rock)
}

const SPAWN_REGISTRY: Partial<Record<EntityType, EntityDef>> = {
  [EntityType.HELICOPTER]: { width: 20, height: 16, score: 100, color: '#ef4444' },
  [EntityType.SHIP]: { width: 24, height: 14, score: 60, color: '#ef4444' },
  [EntityType.BOAT]: { width: 16, height: 12, score: 80, color: '#ef4444' },
  [EntityType.JET]: { width: 20, height: 14, score: 200, color: '#3b82f6' },
  [EntityType.TANK]: { width: 18, height: 14, score: 150, color: '#57534e', ground: true },
  [EntityType.TURRET]: { width: 16, height: 16, score: 150, color: '#dc2626', ground: true },
  [EntityType.FUEL]: { width: 16, height: 20, score: 80, color: '#d946ef' }, 
  [EntityType.MINE]: { width: 14, height: 14, score: 200, color: '#18181b' },
  [EntityType.HOUSE]: { width: 20, height: 16, score: 0, color: '#eab308', ground: true },
  [EntityType.TREE]: { width: 16, height: 18, score: 0, color: '#166534', ground: true },
  [EntityType.ROCK]: { width: 20, height: 16, score: 0, color: '#525252', obstacle: true },
  // Powerups
  [EntityType.ITEM_SPREAD]: { width: 16, height: 16, score: 100, color: '#fbbf24' },
  [EntityType.ITEM_RAPID]: { width: 16, height: 16, score: 100, color: '#f97316' },
  [EntityType.ITEM_SHIELD]: { width: 16, height: 16, score: 100, color: '#22d3ee' },
};

interface LevelConfig {
  colors: { bg: string; water: string; earth: string; bridge: string };
  spawnRate: number; // base chance per spawn tick
  pool: Partial<Record<EntityType, number>>; // Type -> Relative Weight
}

const LEVEL_CONFIGS: LevelConfig[] = [
  { // Level 1: Day - Crowded river
    colors: { bg: '#4d7c0f', water: '#3b82f6', earth: '#a16207', bridge: '#fbbf24' },
    spawnRate: 0.15, // High density
    pool: { 
      [EntityType.HELICOPTER]: 30, 
      [EntityType.SHIP]: 30,
      [EntityType.BOAT]: 20,
      [EntityType.FUEL]: 30, // Frequent fuel
      [EntityType.HOUSE]: 40, // Lots of scenery
      [EntityType.TREE]: 40,
      [EntityType.ROCK]: 20,
      [EntityType.ITEM_RAPID]: 2,
    }
  },
  { // Level 2: Sunset - Heavy resistance
    colors: { bg: '#c2410c', water: '#1d4ed8', earth: '#78350f', bridge: '#d6d3d1' },
    spawnRate: 0.18,
    pool: { 
      [EntityType.HELICOPTER]: 25, 
      [EntityType.JET]: 25, 
      [EntityType.SHIP]: 20, 
      [EntityType.TANK]: 25,
      [EntityType.TURRET]: 20,
      [EntityType.FUEL]: 30,
      [EntityType.ROCK]: 25,
      [EntityType.ITEM_SPREAD]: 3,
      [EntityType.ITEM_SHIELD]: 2,
    }
  },
  { // Level 3: Night - Minefield
    colors: { bg: '#111827', water: '#312e81', earth: '#374151', bridge: '#9ca3af' },
    spawnRate: 0.20,
    pool: { 
      [EntityType.JET]: 40, 
      [EntityType.MINE]: 40, 
      [EntityType.TANK]: 20,
      [EntityType.TURRET]: 20,
      [EntityType.FUEL]: 30,
      [EntityType.ROCK]: 30,
      [EntityType.ITEM_RAPID]: 3,
      [EntityType.ITEM_SHIELD]: 3,
    }
  },
  { // Level 4+: Alien/Toxic - Chaos
    colors: { bg: '#4c0519', water: '#064e3b', earth: '#4a044e', bridge: '#f43f5e' },
    spawnRate: 0.25,
    pool: { 
      [EntityType.JET]: 40, 
      [EntityType.MINE]: 40, 
      [EntityType.HELICOPTER]: 30, 
      [EntityType.TURRET]: 30,
      [EntityType.FUEL]: 30,
      [EntityType.ROCK]: 30,
      [EntityType.ITEM_SPREAD]: 5,
      [EntityType.ITEM_RAPID]: 5,
    }
  }
];

// --- SOUND ENGINE (Enhanced) ---
class SoundEngine {
  ctx: AudioContext | null = null;
  gainNode: GainNode | null = null;

  constructor() {
    try {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new Ctx();
      this.gainNode = this.ctx.createGain();
      this.gainNode.connect(this.ctx.destination);
      this.gainNode.gain.value = 0.3; // Master volume
    } catch (e) { console.error(e); }
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
    const bufferSize = this.ctx.sampleRate * 2; // 2 seconds
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
    
    // Simple lowpass filter for "thud" sound
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

  shoot() { this.playTone(900, 'square', 0.1, 0.1, -400); }
  explosion() { this.playNoise(0.4, 0.4); }
  refuel() { this.playTone(1200, 'sine', 0.15, 0.05); } // Ding ding
  lowFuel() { this.playTone(150, 'sawtooth', 0.2, 0.1); }
  powerUp() { 
    this.playTone(600, 'sine', 0.1, 0.1, 200); 
    setTimeout(() => this.playTone(800, 'sine', 0.1, 0.1, 200), 100);
  }
  multiplierUp() {
    this.playTone(400, 'square', 0.1, 0.05, 200);
    setTimeout(() => this.playTone(600, 'square', 0.1, 0.05, 200), 100);
  }
}

interface Props {
  onExit: () => void;
}

const RiverRaidGame: React.FC<Props> = ({ onExit }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  const previousTimeRef = useRef<number | undefined>(undefined);
  
  const keys = useRef<{ [key: string]: boolean }>({});
  const soundRef = useRef<SoundEngine | null>(null);
  
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
      activePowerUp: null,
      powerUpTimer: 0,
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
    multiplierDistance: 0,
  });

  const [hudState, setHudState] = useState({ score: 0, fuel: 100, lives: 3, gameOver: false, level: 1, multiplier: 1 });

  useEffect(() => {
      soundRef.current = new SoundEngine();
      const resume = () => soundRef.current?.ctx?.resume();
      window.addEventListener('keydown', resume, { once: true });
      window.addEventListener('touchstart', resume, { once: true });
  }, []);

  // --- GAME LOGIC ---

  // Procedural River Generation
  const noise = (y: number) => {
    const x = (y + gameState.current.riverSeed) * 0.006; // smoother river
    return Math.sin(x) * 0.7 + Math.sin(x * 1.7) * 0.3;
  };

  const getRiverStats = (y: number) => {
    const n = noise(y);
    const center = (CANVAS_WIDTH / 2) + (n * (CANVAS_WIDTH * 0.25));
    // Vary width based on level difficulty? Narrower is harder.
    const levelFactor = Math.min(0.3, gameState.current.level * 0.02);
    const baseWidth = CANVAS_WIDTH * (0.55 - levelFactor); 
    const width = baseWidth + (Math.cos(y * 0.01) * 30);
    
    // Bridge checkpoint forcing a wide straight area
    const distToBridge = Math.abs((y % 3000) - 1500);
    if (distToBridge > 1300) {
        return { center: CANVAS_WIDTH / 2, width: CANVAS_WIDTH * 0.8, isBridgeZone: true };
    }

    return { center, width: Math.max(60, width), isBridgeZone: false };
  };

  const getBounds = (y: number) => {
    const { center, width } = getRiverStats(y);
    return { left: center - width / 2, right: center + width / 2 };
  };

  const spawnEntity = (y: number) => {
    const state = gameState.current;
    
    // BRIDGE SPAWNING
    if (Math.abs(y % 3000) < 20 && !state.entities.some(e => e.type === EntityType.BRIDGE && Math.abs(e.y - y) < 400)) {
        state.entities.push({
            id: Math.random(), type: EntityType.BRIDGE,
            x: CANVAS_WIDTH/2, y: y, width: CANVAS_WIDTH, height: 24,
            vx: 0, vy: 0, active: true, frame: 0, scoreValue: 500
        });
        return;
    }

    const cfgIndex = Math.min(state.level - 1, LEVEL_CONFIGS.length - 1);
    const config = LEVEL_CONFIGS[cfgIndex];
    
    // Check Fuel Pity Timer
    let forceFuel = false;
    if (state.distanceSinceLastFuel > FUEL_GUARANTEE_DISTANCE) {
        forceFuel = true;
        state.distanceSinceLastFuel = 0;
    }

    if (!forceFuel && Math.random() > config.spawnRate) return;

    // Determine Type
    let type = EntityType.HELICOPTER;
    if (forceFuel) {
        type = EntityType.FUEL;
    } else {
        // Weighted Random
        const pool = config.pool;
        const total = Object.values(pool).reduce((a, b) => a + b, 0);
        let r = Math.random() * total;
        for (const [k, v] of Object.entries(pool)) {
            if (r < v) { type = k as EntityType; break; }
            r -= v;
        }
    }

    if (type === EntityType.FUEL) state.distanceSinceLastFuel = 0;

    // Setup Entity
    const def = SPAWN_REGISTRY[type]!;
    const bounds = getBounds(y);
    let x = 0;
    let vx = 0;

    if (def.ground) {
        // Spawn on bank
        const onRight = Math.random() > 0.5;
        x = onRight ? bounds.right + 10 + Math.random() * 20 : bounds.left - 10 - Math.random() * 20;
        if (type === EntityType.TANK) vx = onRight ? -8 : 8;
    } else {
        // Spawn in river
        const margin = 20;
        x = bounds.left + margin + Math.random() * (bounds.right - bounds.left - margin * 2);
        
        // Movement logic based on type
        if (type === EntityType.HELICOPTER) vx = (Math.random() > 0.5 ? 1 : -1) * (30 + state.level * 5);
        if (type === EntityType.JET) vx = (x < CANVAS_WIDTH/2 ? 1 : -1) * (100 + state.level * 20);
        if (type === EntityType.SHIP) vx = (Math.random() > 0.5 ? 1 : -1) * 20;
        if (type === EntityType.BOAT) vx = (Math.random() > 0.5 ? 1 : -1) * 15;
        // Powerups are stationary or slow drift
    }

    state.entities.push({
        id: Math.random(),
        type,
        x, y,
        width: def.width,
        height: def.height,
        vx, vy: 0,
        active: true, frame: 0,
        scoreValue: def.score
    });
  };

  const createExplosion = (x: number, y: number, color: string) => {
    soundRef.current?.explosion();
    
    // 1. Shockwave/Flash (Fast expanding white circles)
    for (let i = 0; i < 6; i++) {
        state.particles.push({
            x, y,
            vx: (Math.random() - 0.5) * 120,
            vy: (Math.random() - 0.5) * 120,
            life: 0.1 + Math.random() * 0.2,
            color: '#ffffff',
            size: 8 + Math.random() * 12
        });
    }

    // 2. High energy sparks (Yellow/Red)
    for (let i = 0; i < 16; i++) {
         const angle = Math.random() * 6.28;
         const speed = 80 + Math.random() * 180;
         state.particles.push({
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 0.3 + Math.random() * 0.4,
            color: Math.random() > 0.5 ? '#f59e0b' : '#ef4444',
            size: 2 + Math.random() * 4
         });
    }

    // 3. Debris (Entity color)
    for (let i = 0; i < 10; i++) {
         state.particles.push({
            x, y,
            vx: (Math.random() - 0.5) * 250,
            vy: (Math.random() - 0.5) * 250,
            life: 0.5 + Math.random() * 0.5,
            color: color,
            size: 3 + Math.random() * 4
         });
    }
  };

  const state = gameState.current; // Shortcut

  const update = (dt: number) => {
    if (state.isGameOver || state.isPaused || state.player.isDead) return;

    // --- POWERUP TIMER ---
    if (state.player.activePowerUp) {
        state.player.powerUpTimer -= dt;
        if (state.player.powerUpTimer <= 0) {
            state.player.activePowerUp = null;
        }
    }

    // --- CONTROLS ---
    // Left/Right
    if (keys.current['ArrowLeft'] || keys.current['a']) state.player.vx = -PLAYER_SPEED_X;
    else if (keys.current['ArrowRight'] || keys.current['d']) state.player.vx = PLAYER_SPEED_X;
    else state.player.vx = 0;

    // Up/Down (Vertical Movement & Scroll Speed Control)
    let targetScroll = MIN_SCROLL_SPEED * 1.5;
    let moveY = 0;

    if (keys.current['ArrowUp'] || keys.current['w']) {
        targetScroll = MAX_SCROLL_SPEED; // Fast
        moveY = -PLAYER_SPEED_Y; 
    } else if (keys.current['ArrowDown'] || keys.current['s']) {
        targetScroll = MIN_SCROLL_SPEED; // Slow
        moveY = PLAYER_SPEED_Y;
    }

    // Apply visual Y movement
    state.player.y += moveY * dt;
    // Clamp Visual Y (Top 10% to Bottom 20%)
    state.player.y = Math.max(CANVAS_HEIGHT * 0.1, Math.min(CANVAS_HEIGHT * 0.85, state.player.y));

    // Smooth Scroll Speed Transition
    state.player.speed += (targetScroll - state.player.speed) * 5 * dt;

    // Advance World
    state.cameraY += state.player.speed * dt;
    state.distanceSinceLastFuel += state.player.speed * dt;
    
    // Multiplier Progress
    state.multiplierDistance += state.player.speed * dt;
    if (state.multiplierDistance >= MULTIPLIER_INCREMENT_DISTANCE) {
        state.player.multiplier = Math.min(10, state.player.multiplier + 1); // Cap at 10x
        state.multiplierDistance = 0;
        soundRef.current?.multiplierUp();
    }

    state.player.x += state.player.vx * dt;
    state.player.fuel -= FUEL_CONSUMPTION * dt;

    // Shooting
    const fireDelay = state.player.activePowerUp === EntityType.ITEM_RAPID ? 100 : 250;
    
    if (keys.current[' '] && Date.now() - state.lastShotTime > fireDelay) {
        state.lastShotTime = Date.now();
        soundRef.current?.shoot();
        
        const spawnBullet = (vxOffset: number) => {
            state.entities.push({
                id: Math.random(), type: EntityType.BULLET,
                x: state.player.x, y: state.cameraY + (CANVAS_HEIGHT - state.player.y) - 10,
                width: 4, height: 8, vx: vxOffset, vy: BULLET_SPEED + state.player.speed,
                active: true, frame: 0
            });
        };

        if (state.player.activePowerUp === EntityType.ITEM_SPREAD) {
            spawnBullet(0);
            spawnBullet(-150);
            spawnBullet(150);
        } else {
            spawnBullet(0);
        }
    }

    // --- COLLISIONS & LOGIC ---
    
    // 1. Bank Collision
    const worldPlayerY = state.cameraY + (CANVAS_HEIGHT - state.player.y);
    const bounds = getBounds(worldPlayerY);
    if (state.player.x < bounds.left + 8 || state.player.x > bounds.right - 8) {
        die();
    }

    // 2. Spawning
    const spawnY = Math.floor((state.cameraY + SPAWN_DISTANCE) / 50) * 50;
    const prevSpawnY = Math.floor((state.cameraY + SPAWN_DISTANCE - state.player.speed * dt) / 50) * 50;
    if (spawnY > prevSpawnY) spawnEntity(spawnY);

    // 3. Entities
    state.entities.forEach(ent => {
        if (!ent.active) return;

        // Movement
        if (ent.type === EntityType.BULLET) {
             ent.y += ent.vy * dt;
             ent.x += ent.vx * dt;
        } else {
             ent.x += ent.vx * dt;
        }

        // Screen Wrapping (Reflected) for simple enemies
        if (ent.type === EntityType.HELICOPTER || ent.type === EntityType.SHIP || ent.type === EntityType.BOAT) {
            const b = getBounds(ent.y);
            if (ent.x < b.left + 10 || ent.x > b.right - 10) ent.vx *= -1;
        }

        // Cull
        if (ent.y < state.cameraY - 100) ent.active = false;

        // Collision Detection
        const entScreenY = CANVAS_HEIGHT - (ent.y - state.cameraY);
        const playerScreenY = state.player.y;
        
        // Player vs Entity
        if (ent.type !== EntityType.BULLET && 
            Math.abs(state.player.x - ent.x) < (state.player.width + ent.width)/2 - 4 &&
            Math.abs(playerScreenY - entScreenY) < (state.player.height + ent.height)/2 - 4) {
            
            if (ent.type === EntityType.FUEL) {
                state.player.fuel = Math.min(100, state.player.fuel + 40 * dt);
                if (Math.random() > 0.8) soundRef.current?.refuel();
                
                // Reset Multiplier on Fuel Pickup
                if (state.player.multiplier > 1) {
                    state.player.multiplier = 1;
                    state.multiplierDistance = 0;
                }

            } else if ([EntityType.ITEM_SPREAD, EntityType.ITEM_RAPID, EntityType.ITEM_SHIELD].includes(ent.type)) {
                // Pickup Powerup
                ent.active = false;
                state.player.activePowerUp = ent.type;
                state.player.powerUpTimer = POWERUP_DURATION;
                soundRef.current?.powerUp();
            } else {
                // Crash
                if (state.player.activePowerUp === EntityType.ITEM_SHIELD) {
                    // Shield destroys enemy but saves player
                    ent.active = false;
                    createExplosion(ent.x, entScreenY, SPAWN_REGISTRY[ent.type]?.color || '#fff');
                    soundRef.current?.explosion();
                } else {
                    die();
                }
            }
        }

        // Bullet vs Entity
        if (ent.type === EntityType.BULLET) {
             // Bullet hitting walls?
             const bBounds = getBounds(ent.y);
             if (ent.x < bBounds.left || ent.x > bBounds.right) ent.active = false;

             // Bullet hitting enemies
             state.entities.forEach(target => {
                 if (!target.active || target === ent || target.type === EntityType.BULLET || target.type === EntityType.EXPLOSION) return;
                 
                 // Don't shoot trees or houses or rocks? (Rocks indestructible)
                 if (target.type === EntityType.ROCK || target.type === EntityType.TREE || target.type === EntityType.HOUSE) return;

                 const targetScreenY = CANVAS_HEIGHT - (target.y - state.cameraY);
                 
                 if (Math.abs(ent.x - target.x) < target.width/2 + 4 && Math.abs(ent.y - target.y) < target.height/2 + 4) {
                     ent.active = false; // Bullet dies
                     
                     if (target.type === EntityType.BRIDGE) {
                         target.active = false;
                         createExplosion(target.x, targetScreenY, '#fff');
                         state.player.score += 500 * state.player.multiplier;
                         state.level++;
                         // Flash screen?
                     } else if ([EntityType.ITEM_SPREAD, EntityType.ITEM_RAPID, EntityType.ITEM_SHIELD].includes(target.type)) {
                         // Don't destroy items with bullets!
                     } else {
                         target.active = false;
                         createExplosion(target.x, targetScreenY, SPAWN_REGISTRY[target.type]?.color || '#fff');
                         state.player.score += (target.scoreValue || 50) * state.player.multiplier;
                     }
                 }
             });
        }
    });

    // 4. Particles
    state.particles.forEach(p => {
        p.x += p.vx * dt;
        // Move particles down with the scroll speed to simulate them being grounded in the world
        p.y += (p.vy + state.player.speed) * dt;
        p.life -= dt;
    });
    state.particles = state.particles.filter(p => p.life > 0);

    // 5. Check Conditions
    if (state.player.fuel <= 0) die();
    if (state.player.fuel < 25 && Math.random() < 0.05) soundRef.current?.lowFuel();

    // Update HUD occasionally
    if (Math.random() > 0.5) {
        setHudState({ 
            score: state.player.score, 
            fuel: state.player.fuel, 
            lives: state.player.lives, 
            gameOver: state.isGameOver,
            level: state.level,
            multiplier: state.player.multiplier
        });
    }
  };

  const die = () => {
      if (state.player.isDead) return;
      createExplosion(state.player.x, state.player.y, '#fbbf24');
      state.player.isDead = true;
      state.player.lives--;
      state.player.activePowerUp = null;
      
      // Reset Multiplier on Death
      state.player.multiplier = 1;
      state.multiplierDistance = 0;

      setTimeout(() => {
          if (state.player.lives > 0) {
              // Reset Position
              state.player.isDead = false;
              state.player.active = true;
              state.player.fuel = 100;
              state.player.y = CANVAS_HEIGHT - 80;
              
              // Find safe X
              const b = getBounds(state.cameraY + 200);
              state.player.x = (b.left + b.right) / 2;
              state.player.vx = 0;
              
              // Clear nearby enemies
              state.entities = state.entities.filter(e => e.y > state.cameraY + 600 || e.y < state.cameraY - 100);
          } else {
              state.isGameOver = true;
              setHudState(s => ({...s, gameOver: true}));
          }
      }, 1500);
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

      // 1. Background
      ctx.fillStyle = cfg.colors.bg;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // 2. River
      const startY = Math.floor(state.cameraY / RIVER_SEGMENT_HEIGHT) * RIVER_SEGMENT_HEIGHT;
      const endY = startY + CANVAS_HEIGHT + RIVER_SEGMENT_HEIGHT;
      
      ctx.fillStyle = cfg.colors.water;
      ctx.beginPath();
      for (let y = startY; y <= endY; y += RIVER_SEGMENT_HEIGHT) {
          const b = getBounds(y);
          const sy = CANVAS_HEIGHT - (y - state.cameraY);
          ctx.rect(b.left, sy - RIVER_SEGMENT_HEIGHT, b.right - b.left, RIVER_SEGMENT_HEIGHT + 2);
      }
      ctx.fill();

      // River Banks Detail
      ctx.fillStyle = cfg.colors.earth;
      for (let y = startY; y <= endY; y += RIVER_SEGMENT_HEIGHT) {
          const b = getBounds(y);
          const sy = CANVAS_HEIGHT - (y - state.cameraY);
          ctx.fillRect(b.left - 5, sy - RIVER_SEGMENT_HEIGHT, 5, RIVER_SEGMENT_HEIGHT + 2);
          ctx.fillRect(b.right, sy - RIVER_SEGMENT_HEIGHT, 5, RIVER_SEGMENT_HEIGHT + 2);
      }

      // 3. Entities
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
              ctx.fillText(`BRIDGE ${state.level}`, CANVAS_WIDTH/2 - 20, screenY - 15);
          } else if (ent.type === EntityType.BULLET) {
              ctx.fillStyle = '#fbbf24';
              ctx.fillRect(ent.x - 2, screenY - 4, 4, 8);
          } else {
              const def = SPAWN_REGISTRY[ent.type] || { color: '#fff' };
              const isAir = ent.type === EntityType.JET || ent.type === EntityType.HELICOPTER;
              
              // Shadow for flying things
              if (isAir) {
                  drawSprite(ctx, ent.type, ent.x + 10, screenY + 10, 2.5, 'rgba(0,0,0,0.3)');
              }

              // Draw Entity
              drawSprite(ctx, ent.type, ent.x, screenY, 2.5, def.color);

              // Water trail for ships
              if (ent.type === EntityType.SHIP || ent.type === EntityType.BOAT) {
                  ctx.fillStyle = 'rgba(255,255,255,0.3)';
                  ctx.fillRect(ent.x - 4, screenY + 10, 8, 4);
              }
          }
      });

      // 4. Player
      if (!state.player.isDead) {
          // Active Shield Effect
          if (state.player.activePowerUp === EntityType.ITEM_SHIELD) {
             ctx.beginPath();
             ctx.arc(state.player.x, state.player.y, 25, 0, Math.PI * 2);
             ctx.strokeStyle = `rgba(34, 211, 238, ${0.5 + Math.sin(Date.now() * 0.01) * 0.3})`; // Cyan pulsing
             ctx.lineWidth = 3;
             ctx.stroke();
          }

          // Shadow
          drawSprite(ctx, 'PLAYER', state.player.x + 8, state.player.y + 8, 2.5, 'rgba(0,0,0,0.4)');
          // Jet
          drawSprite(ctx, 'PLAYER', state.player.x, state.player.y, 2.5, '#eab308');
          // Thrust
          ctx.fillStyle = Math.random() > 0.5 ? '#ef4444' : '#f59e0b';
          ctx.fillRect(state.player.x - 2, state.player.y + 12, 4, 6);
      }

      // 5. Particles
      state.particles.forEach(p => {
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.life;
          // Use varying size
          const s = p.size || 4; 
          ctx.fillRect(p.x - s/2, p.y - s/2, s, s);
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

  useEffect(() => {
      const onKey = (e: KeyboardEvent, v: boolean) => keys.current[e.key] = v;
      const down = (e: KeyboardEvent) => onKey(e, true);
      const up = (e: KeyboardEvent) => onKey(e, false);
      window.addEventListener('keydown', down);
      window.addEventListener('keyup', up);
      requestRef.current = requestAnimationFrame(loop);
      return () => {
          window.removeEventListener('keydown', down);
          window.removeEventListener('keyup', up);
          cancelAnimationFrame(requestRef.current);
      };
  }, []);

  // --- HUD ---
  return (
    <div className="relative w-full h-full flex items-center justify-center bg-black">
      <div className="relative">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="bg-black shadow-2xl scale-[1.5] origin-center border-4 border-zinc-800"
            style={{ imageRendering: 'pixelated' }}
          />
          
          {/* OVERLAY UI */}
          <div className="absolute top-0 left-0 w-full p-2 flex justify-between font-mono text-white font-bold text-sm tracking-wider drop-shadow-md">
              <div>SCORE {hudState.score.toString().padStart(6, '0')}</div>
              <div>LIVES {hudState.lives}</div>
          </div>
          
          {/* MULTIPLIER DISPLAY */}
          <div className="absolute top-8 w-full text-center pointer-events-none">
             {hudState.multiplier > 1 && (
               <div className="text-yellow-400 font-black text-lg tracking-widest animate-pulse drop-shadow-[0_2px_0_rgba(0,0,0,0.5)]">
                 MULTIPLIER X{hudState.multiplier}
               </div>
             )}
          </div>

          {/* FUEL GAUGE */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-48 h-6 bg-zinc-900 border-2 border-zinc-600 rounded">
              <div 
                className={`h-full transition-all duration-200 ${hudState.fuel < 25 ? 'bg-red-500 animate-pulse' : 'bg-gradient-to-r from-yellow-500 to-green-500'}`}
                style={{ width: `${Math.max(0, hudState.fuel)}%` }}
              />
              <div className="absolute top-0 w-full text-center text-[10px] text-white font-bold leading-5 drop-shadow-md">FUEL</div>
          </div>

          {hudState.gameOver && (
              <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center space-y-4 animate-fade-in">
                  <h2 className="text-4xl font-black text-red-500 tracking-widest">GAME OVER</h2>
                  <div className="text-xl text-white">FINAL SCORE: {hudState.score}</div>
                  <button 
                    onClick={onExit}
                    className="px-6 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded shadow-lg"
                  >
                      RETURN TO BASE
                  </button>
              </div>
          )}
      </div>
    </div>
  );
};

export default RiverRaidGame;
