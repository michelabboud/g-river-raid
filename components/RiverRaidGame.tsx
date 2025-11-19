
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
const FUEL_REGEN_RATE = 3.0; // Fuel gained per second when Regen active
const RIVER_SEGMENT_HEIGHT = 20;
const SPAWN_DISTANCE = 700;
const FUEL_GUARANTEE_DISTANCE = 400; 
const POWERUP_DURATION = 12; 
const MULTIPLIER_INCREMENT_DISTANCE = 1000; 
const LEVEL_LENGTH = 4000; // Distance before boss spawns

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
  ],
  ITEM_REGEN: [
    [0,1,1,1,0],
    [1,0,1,0,1],
    [1,1,1,1,1],
    [1,0,1,0,1],
    [0,1,1,1,0]
  ],
  // Boss Shapes
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
  ground?: boolean;
  obstacle?: boolean;
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
  [EntityType.ROCK]: { width: 20, height: 16, score: 0, color: '#525252', obstacle: true },
  // Ground Scenery
  [EntityType.HOUSE]: { width: 20, height: 16, score: 50, color: '#eab308', ground: true },
  [EntityType.TREE]: { width: 16, height: 18, score: 0, color: '#166534', ground: true },
  [EntityType.BASE]: { width: 24, height: 20, score: 100, color: '#3f3f46', ground: true },
  [EntityType.STABLE]: { width: 22, height: 18, score: 50, color: '#78350f', ground: true },
  [EntityType.ANIMAL]: { width: 12, height: 10, score: 10, color: '#e5e7eb', ground: true },
  [EntityType.SHACK]: { width: 18, height: 14, score: 30, color: '#92400e', ground: true },
  [EntityType.CRATE]: { width: 12, height: 12, score: 20, color: '#b45309', ground: true },
  [EntityType.HERD]: { width: 18, height: 14, score: 30, color: '#d4d4d8', ground: true },
  [EntityType.SILO]: { width: 12, height: 20, score: 40, color: '#a3a3a3', ground: true },
  [EntityType.RUIN]: { width: 20, height: 16, score: 20, color: '#78716c', ground: true },
  [EntityType.FENCE]: { width: 24, height: 10, score: 10, color: '#9a3412', ground: true },

  // Powerups
  [EntityType.ITEM_SPREAD]: { width: 16, height: 16, score: 100, color: '#fbbf24' },
  [EntityType.ITEM_RAPID]: { width: 16, height: 16, score: 100, color: '#f97316' },
  [EntityType.ITEM_SHIELD]: { width: 16, height: 16, score: 100, color: '#22d3ee' },
  [EntityType.ITEM_REGEN]: { width: 16, height: 16, score: 100, color: '#4ade80' },
};

interface LevelConfig {
  colors: { bg: string; water: string; earth: string; bridge: string };
  spawnRate: number; 
  pool: Partial<Record<EntityType, number>>;
}

const LEVEL_CONFIGS: LevelConfig[] = [
  { // Level 1: Day
    colors: { bg: '#4d7c0f', water: '#3b82f6', earth: '#a16207', bridge: '#fbbf24' },
    spawnRate: 0.15,
    pool: { [EntityType.HELICOPTER]: 30, [EntityType.SHIP]: 30, [EntityType.BOAT]: 20, [EntityType.FUEL]: 30, [EntityType.ROCK]: 20, [EntityType.ITEM_RAPID]: 2, [EntityType.ITEM_REGEN]: 2 }
  },
  { // Level 2: Sunset
    colors: { bg: '#c2410c', water: '#1d4ed8', earth: '#78350f', bridge: '#d6d3d1' },
    spawnRate: 0.18,
    pool: { [EntityType.HELICOPTER]: 25, [EntityType.JET]: 25, [EntityType.SHIP]: 20, [EntityType.FUEL]: 30, [EntityType.ROCK]: 25, [EntityType.ITEM_SPREAD]: 3, [EntityType.ITEM_SHIELD]: 2, [EntityType.ITEM_REGEN]: 2 }
  },
  { // Level 3: Night
    colors: { bg: '#111827', water: '#312e81', earth: '#374151', bridge: '#9ca3af' },
    spawnRate: 0.20,
    pool: { [EntityType.JET]: 40, [EntityType.MINE]: 40, [EntityType.FUEL]: 30, [EntityType.ROCK]: 30, [EntityType.ITEM_RAPID]: 3, [EntityType.ITEM_SHIELD]: 3 }
  },
  { // Level 4+: Alien/Toxic
    colors: { bg: '#4c0519', water: '#064e3b', earth: '#4a044e', bridge: '#f43f5e' },
    spawnRate: 0.25,
    pool: { [EntityType.JET]: 40, [EntityType.MINE]: 40, [EntityType.HELICOPTER]: 30, [EntityType.FUEL]: 30, [EntityType.ROCK]: 30, [EntityType.ITEM_SPREAD]: 5, [EntityType.ITEM_RAPID]: 5, [EntityType.ITEM_REGEN]: 3 }
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
class SoundEngine {
  ctx: AudioContext | null = null;
  gainNode: GainNode | null = null;
  engineOsc: OscillatorNode | null = null;
  engineGain: GainNode | null = null;
  
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
        // Main bass
        this.playTone(freq, 'sawtooth', 0.12, 0.15);
        // Sub
        this.playTone(freq / 2, 'square', 0.12, 0.2);
        // High tension ping occasionally
        if (step % 8 === 0) {
             this.playTone(freq * 4, 'sine', 0.1, 0.05);
        }

        step++;
        this.bossMusicTimer = window.setTimeout(playSeq, 140); // Fast tempo
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
  explosion() { this.playNoise(0.4, 0.4); }
  refuel() { this.playTone(1200, 'sine', 0.15, 0.05); }
  lowFuel() { this.playTone(150, 'sawtooth', 0.2, 0.1); }
  powerUp() { 
    this.playTone(600, 'sine', 0.1, 0.1, 200); 
    setTimeout(() => this.playTone(800, 'sine', 0.1, 0.1, 200), 100);
  }
  multiplierUp() {
    this.playTone(400, 'square', 0.1, 0.05, 200);
    setTimeout(() => this.playTone(600, 'square', 0.1, 0.05, 200), 100);
  }
  bossHit() { this.playTone(100, 'square', 0.1, 0.1); }
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
    distanceInLevel: 0,
    multiplierDistance: 0,
    bossActive: false
  });

  const [hudState, setHudState] = useState({ 
    score: 0, fuel: 100, lives: 3, gameOver: false, level: 1, multiplier: 1,
    bossName: '', bossHp: 0, bossMaxHp: 0
  });

  useEffect(() => {
      soundRef.current = new SoundEngine();
      const resume = () => {
          if (soundRef.current?.ctx) {
              soundRef.current.ctx.resume();
              soundRef.current.startEngineHum();
          }
      };
      window.addEventListener('keydown', resume, { once: true });
      window.addEventListener('touchstart', resume, { once: true });
      
      // Clean up engine sound on exit
      return () => {
          if (soundRef.current?.engineOsc) {
              try { soundRef.current.engineOsc.stop(); } catch (e) {}
          }
          soundRef.current?.stopBossMusic();
      };
  }, []);

  // --- GAME LOGIC ---

  const noise = (y: number) => {
    const x = (y + gameState.current.riverSeed) * 0.006;
    return Math.sin(x) * 0.7 + Math.sin(x * 1.7) * 0.3;
  };

  const getRiverStats = (y: number) => {
    const n = noise(y);
    const center = (CANVAS_WIDTH / 2) + (n * (CANVAS_WIDTH * 0.25));
    const levelFactor = Math.min(0.3, gameState.current.level * 0.02);
    // Force wide river for boss fight
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

  const spawnBankEntity = (y: number, side: 'left' | 'right', limitX: number) => {
      const state = gameState.current;
      // Bank Logic: Always spawn scenery, sometimes spawn enemy
      // Left side spans 0 to limitX
      // Right side spans limitX to CANVAS_WIDTH
      
      let xMin = 0, xMax = 0;
      if (side === 'left') {
          xMin = 0;
          xMax = limitX - 10;
      } else {
          xMin = limitX + 10;
          xMax = CANVAS_WIDTH;
      }

      if (xMax - xMin < 10) return; // Too narrow

      const x = xMin + Math.random() * (xMax - xMin);
      
      // Probabilities
      const r = Math.random();
      let type = EntityType.TREE;
      
      // 20% chance for a hostile ground unit if level > 1
      if (state.level > 1 && r < 0.2) {
           type = Math.random() > 0.5 ? EntityType.TANK : EntityType.TURRET;
      } else {
           // Scenery Mix - Expanded with more variety
           const s = Math.random();
           if (s < 0.20) type = EntityType.TREE;
           else if (s < 0.35) type = EntityType.HOUSE;
           else if (s < 0.45) type = EntityType.BASE;
           else if (s < 0.55) type = EntityType.STABLE;
           else if (s < 0.65) type = EntityType.SHACK;
           else if (s < 0.75) type = EntityType.CRATE;
           else if (s < 0.80) type = EntityType.HERD;
           else if (s < 0.85) type = EntityType.SILO;
           else if (s < 0.90) type = EntityType.RUIN;
           else if (s < 0.95) type = EntityType.FENCE;
           else type = EntityType.ANIMAL;
      }

      const def = SPAWN_REGISTRY[type]!;
      // Ensure completely off river
      if (side === 'left' && x + def.width > limitX) return;
      if (side === 'right' && x < limitX) return;

      let vx = 0;
      if (type === EntityType.TANK) {
          vx = (Math.random() > 0.5 ? 1 : -1) * 10;
      } else if (type === EntityType.ANIMAL || type === EntityType.HERD) {
          vx = (Math.random() - 0.5) * 5;
      }

      state.entities.push({
          id: Math.random(), type, x, y,
          width: def.width, height: def.height,
          vx, vy: 0, active: true, frame: 0, scoreValue: def.score
      });
  };

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
        const pool = config.pool;
        const total = Object.values(pool).reduce((a, b) => a + b, 0);
        let r = Math.random() * total;
        for (const [k, v] of Object.entries(pool)) {
            if (r < v) { type = k as EntityType; break; }
            r -= v;
        }
    }

    if (type === EntityType.FUEL) state.distanceSinceLastFuel = 0;

    const def = SPAWN_REGISTRY[type]!;
    const bounds = getBounds(y);
    let x = 0;
    let vx = 0;

    // River Items only
    if (def.ground) return; // Skip if pool accidentaly has ground items, though we split logic

    const margin = 20;
    x = bounds.left + margin + Math.random() * (bounds.right - bounds.left - margin * 2);
    
    if (type === EntityType.HELICOPTER) vx = (Math.random() > 0.5 ? 1 : -1) * (30 + state.level * 5);
    if (type === EntityType.JET) vx = (x < CANVAS_WIDTH/2 ? 1 : -1) * (100 + state.level * 20);
    if (type === EntityType.SHIP) vx = (Math.random() > 0.5 ? 1 : -1) * 20;
    if (type === EntityType.BOAT) vx = (Math.random() > 0.5 ? 1 : -1) * 15;

    state.entities.push({
        id: Math.random(), type, x, y,
        width: def.width, height: def.height,
        vx, vy: 0, active: true, frame: 0, scoreValue: def.score
    });
  }

  const spawnEntity = (y: number) => {
    const state = gameState.current;
    
    // --- BOSS SPAWNING ---
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

    // --- SPAWNING LOGIC ---
    // 1. River Contents (Enemies, Fuel, Rocks)
    spawnRiverEntity(y);

    // 2. Bank Contents (Scenery, Ground Enemies) - ALWAYS try to populate banks
    const bounds = getBounds(y);
    spawnBankEntity(y, 'left', bounds.left);
    spawnBankEntity(y, 'right', bounds.right);
  };

  const createExplosion = (x: number, y: number, color: string) => {
    soundRef.current?.explosion();
    const state = gameState.current;
    for (let i = 0; i < 6; i++) {
        state.particles.push({
            x, y, vx: (Math.random() - 0.5) * 120, vy: (Math.random() - 0.5) * 120,
            life: 0.1 + Math.random() * 0.2, color: '#ffffff', size: 8 + Math.random() * 12
        });
    }
    for (let i = 0; i < 16; i++) {
         const angle = Math.random() * 6.28;
         const speed = 80 + Math.random() * 180;
         state.particles.push({
            x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
            life: 0.3 + Math.random() * 0.4, color: Math.random() > 0.5 ? '#f59e0b' : '#ef4444', size: 2 + Math.random() * 4
         });
    }
    for (let i = 0; i < 10; i++) {
         state.particles.push({
            x, y, vx: (Math.random() - 0.5) * 250, vy: (Math.random() - 0.5) * 250,
            life: 0.5 + Math.random() * 0.5, color: color, size: 3 + Math.random() * 4
         });
    }
  };

  const state = gameState.current; 

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
    if (keys.current['ArrowLeft'] || keys.current['a']) state.player.vx = -PLAYER_SPEED_X;
    else if (keys.current['ArrowRight'] || keys.current['d']) state.player.vx = PLAYER_SPEED_X;
    else state.player.vx = 0;

    let targetScroll = MIN_SCROLL_SPEED * 1.5;
    let moveY = 0;

    if (keys.current['ArrowUp'] || keys.current['w']) {
        targetScroll = MAX_SCROLL_SPEED;
        moveY = -PLAYER_SPEED_Y; 
    } else if (keys.current['ArrowDown'] || keys.current['s']) {
        targetScroll = MIN_SCROLL_SPEED;
        moveY = PLAYER_SPEED_Y;
    }

    state.player.y += moveY * dt;
    state.player.y = Math.max(CANVAS_HEIGHT * 0.1, Math.min(CANVAS_HEIGHT * 0.85, state.player.y));

    state.player.speed += (targetScroll - state.player.speed) * 5 * dt;
    state.cameraY += state.player.speed * dt;
    
    // Update Ambient Sound
    soundRef.current?.updateEngine(state.player.speed);

    if (!state.bossActive) {
      state.distanceSinceLastFuel += state.player.speed * dt;
      state.distanceInLevel += state.player.speed * dt;
      state.multiplierDistance += state.player.speed * dt;
      
      if (state.multiplierDistance >= MULTIPLIER_INCREMENT_DISTANCE) {
          state.player.multiplier = Math.min(10, state.player.multiplier + 1); 
          state.multiplierDistance = 0;
          soundRef.current?.multiplierUp();
      }
    }

    state.player.x += state.player.vx * dt;

    // --- FUEL LOGIC ---
    if (state.player.activePowerUp === EntityType.ITEM_REGEN) {
        // Fuel Regeneration
        state.player.fuel = Math.min(100, state.player.fuel + FUEL_REGEN_RATE * dt);
    } else {
        state.player.fuel -= FUEL_CONSUMPTION * dt;
    }

    // --- SHOOTING ---
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
            spawnBullet(0); spawnBullet(-150); spawnBullet(150);
        } else {
            spawnBullet(0);
        }
    }

    // --- WORLD ---
    const worldPlayerY = state.cameraY + (CANVAS_HEIGHT - state.player.y);
    const bounds = getBounds(worldPlayerY);
    if (state.player.x < bounds.left + 8 || state.player.x > bounds.right - 8) {
        die();
    }

    const spawnStep = 50;
    const currentSpawnY = Math.floor((state.cameraY + SPAWN_DISTANCE) / spawnStep) * spawnStep;
    const prevSpawnY = Math.floor((state.cameraY + SPAWN_DISTANCE - state.player.speed * dt) / spawnStep) * spawnStep;
    
    // Ensure we don't skip rows if frame rate drops or speed is high
    if (currentSpawnY > prevSpawnY) {
        // Loop from the next required row up to the current target row
        for (let y = prevSpawnY + spawnStep; y <= currentSpawnY; y += spawnStep) {
            spawnEntity(y);
        }
    }

    // --- ENTITY UPDATE ---
    let activeBoss: Entity | null = null;

    state.entities.forEach(ent => {
        if (!ent.active) return;
        
        if (ent.type === EntityType.BOSS) {
            activeBoss = ent;
            const cfg = BOSS_CONFIGS[ent.bossId || 0];
            
            // Boss Movement Logic
            ent.y = state.cameraY + (CANVAS_HEIGHT - 100); // Keep boss at top of screen
            
            // Behavior
            if (cfg.behavior === 'STRAFE') {
                ent.x += Math.sin(Date.now() * 0.002) * 100 * dt; // Simple sway
                // Keep in bounds
                ent.x = Math.max(bounds.left + 40, Math.min(bounds.right - 40, ent.x));
            } else if (cfg.behavior === 'CHARGE') {
                ent.x += (state.player.x - ent.x) * 2 * dt; // Seek player slowly
            } else {
                // Hover
                ent.x = CANVAS_WIDTH / 2 + Math.sin(Date.now() * 0.001) * 80;
            }

            // Boss Shooting
            if (Math.random() < (dt * 1000) / cfg.shootRate) {
                 soundRef.current?.bossShoot();
                 state.entities.push({
                    id: Math.random(), type: EntityType.BOSS_BULLET,
                    x: ent.x, y: ent.y, width: 6, height: 6,
                    vx: (state.player.x - ent.x), vy: -300,
                    active: true, frame: 0
                 });
            }
        } else if (ent.type === EntityType.BOSS_BULLET) {
            ent.y += (ent.vy - state.player.speed) * dt; // Move down relative to player
            ent.x += ent.vx * dt;
        } else if (ent.type === EntityType.BULLET) {
             ent.y += ent.vy * dt;
             ent.x += ent.vx * dt;
        } else {
             ent.x += ent.vx * dt;
        }

        // Bounds Check & Culling
        if (ent.type === EntityType.HELICOPTER || ent.type === EntityType.SHIP || ent.type === EntityType.BOAT) {
            const b = getBounds(ent.y);
            if (ent.x < b.left + 10 || ent.x > b.right - 10) ent.vx *= -1;
        }
        // Ground units simple patrol limits
        if (ent.type === EntityType.TANK || ent.type === EntityType.ANIMAL || ent.type === EntityType.HERD) {
            // Keep off river
        }

        if (ent.y < state.cameraY - 200) ent.active = false; // Cull behind

        // Collision
        const entScreenY = CANVAS_HEIGHT - (ent.y - state.cameraY);
        const playerScreenY = state.player.y;
        
        // Player vs Entity
        if (ent.type !== EntityType.BULLET && ent.type !== EntityType.BOSS_BULLET &&
            Math.abs(state.player.x - ent.x) < (state.player.width + ent.width)/2 - 4 &&
            Math.abs(playerScreenY - entScreenY) < (state.player.height + ent.height)/2 - 4) {
            
            if (ent.type === EntityType.FUEL) {
                state.player.fuel = Math.min(100, state.player.fuel + 40 * dt);
                if (Math.random() > 0.8) soundRef.current?.refuel();
                if (state.player.multiplier > 1) { state.player.multiplier = 1; state.multiplierDistance = 0; }
            } else if ([EntityType.ITEM_SPREAD, EntityType.ITEM_RAPID, EntityType.ITEM_SHIELD, EntityType.ITEM_REGEN].includes(ent.type)) {
                ent.active = false;
                state.player.activePowerUp = ent.type;
                state.player.powerUpTimer = POWERUP_DURATION;
                soundRef.current?.powerUp();
            } else {
                if (state.player.activePowerUp === EntityType.ITEM_SHIELD) {
                    if (ent.type === EntityType.BOSS) {
                        // Shield bounces off boss
                    } else {
                        ent.active = false;
                        createExplosion(ent.x, entScreenY, SPAWN_REGISTRY[ent.type]?.color || '#fff');
                        soundRef.current?.explosion();
                    }
                } else {
                    die();
                }
            }
        }
        
        // Player vs Boss Bullet
        if (ent.type === EntityType.BOSS_BULLET) {
             if (Math.abs(state.player.x - ent.x) < 10 && Math.abs(playerScreenY - entScreenY) < 10) {
                 if (state.player.activePowerUp === EntityType.ITEM_SHIELD) {
                     ent.active = false;
                 } else {
                     die();
                 }
             }
        }

        // Player Bullet vs Entity
        if (ent.type === EntityType.BULLET) {
             state.entities.forEach(target => {
                 if (!target.active || target === ent || target.type === EntityType.BULLET || target.type === EntityType.EXPLOSION || target.type === EntityType.BOSS_BULLET) return;
                 // Ground scenery can be destroyed for points too
                 // if (target.type === EntityType.ROCK || target.type === EntityType.TREE || target.type === EntityType.HOUSE) return; 

                 const targetScreenY = CANVAS_HEIGHT - (target.y - state.cameraY);
                 if (Math.abs(ent.x - target.x) < target.width/2 + 4 && Math.abs(ent.y - target.y) < target.height/2 + 4) {
                     ent.active = false;
                     
                     if (target.type === EntityType.BRIDGE) {
                         // Bridge only destroys if no boss active, but bridge shouldn't exist with boss
                     } else if (target.type === EntityType.BOSS) {
                         // Boss Damage
                         soundRef.current?.bossHit();
                         target.hp = (target.hp || 0) - 1;
                         // Small visual hit
                         state.particles.push({
                             x: target.x + (Math.random()-0.5)*20, 
                             y: target.y + (Math.random()-0.5)*20,
                             vx: 0, vy: 0, life: 0.1, size: 4, color: '#fff'
                         });

                         if ((target.hp || 0) <= 0) {
                             target.active = false;
                             createExplosion(target.x, targetScreenY, '#fff');
                             // Big explosion
                             for(let k=0;k<5;k++) setTimeout(() => createExplosion(target.x + (Math.random()-0.5)*40, targetScreenY + (Math.random()-0.5)*40, '#f00'), k*100);
                             
                             state.player.score += (target.scoreValue || 2000) * state.player.multiplier;
                             state.bossActive = false;
                             soundRef.current?.stopBossMusic();
                             state.distanceInLevel = 0;
                             state.level++;
                             
                             // Spawn Bridge reward immediately
                             state.entities.push({
                                id: Math.random(), type: EntityType.BRIDGE,
                                x: CANVAS_WIDTH/2, y: state.cameraY + SPAWN_DISTANCE, width: CANVAS_WIDTH, height: 24,
                                vx: 0, vy: 0, active: true, frame: 0, scoreValue: 500
                             });
                         }
                     } else if ([EntityType.ITEM_SPREAD, EntityType.ITEM_RAPID, EntityType.ITEM_SHIELD, EntityType.ITEM_REGEN].includes(target.type)) {
                         // Safe
                     } else {
                         target.active = false;
                         createExplosion(target.x, targetScreenY, SPAWN_REGISTRY[target.type]?.color || '#fff');
                         state.player.score += (target.scoreValue || 50) * state.player.multiplier;
                     }
                 }
             });
        }
    });

    state.particles.forEach(p => {
        p.x += p.vx * dt;
        p.y += (p.vy + state.player.speed) * dt;
        p.life -= dt;
    });
    state.particles = state.particles.filter(p => p.life > 0);

    if (state.player.fuel <= 0) die();
    if (state.player.fuel < 25 && Math.random() < 0.05) soundRef.current?.lowFuel();

    // Update HUD
    if (Math.random() > 0.1) {
        let bossData = { bossName: '', bossHp: 0, bossMaxHp: 0 };
        if (activeBoss) {
             const b = activeBoss as Entity;
             const cfg = BOSS_CONFIGS[b.bossId || 0];
             bossData = { bossName: cfg.name, bossHp: b.hp || 0, bossMaxHp: b.maxHp || 1 };
        }

        setHudState({ 
            score: state.player.score, 
            fuel: state.player.fuel, 
            lives: state.player.lives, 
            gameOver: state.isGameOver,
            level: state.level,
            multiplier: state.player.multiplier,
            ...bossData
        });
    }
  };

  const die = () => {
      if (state.player.isDead) return;
      soundRef.current?.stopBossMusic();
      createExplosion(state.player.x, state.player.y, '#fbbf24');
      state.player.isDead = true;
      state.player.lives--;
      state.player.activePowerUp = null;
      state.player.multiplier = 1;
      state.multiplierDistance = 0;

      setTimeout(() => {
          if (state.player.lives > 0) {
              state.player.isDead = false;
              state.player.active = true;
              state.player.fuel = 100;
              state.player.y = CANVAS_HEIGHT - 80;
              const b = getBounds(state.cameraY + 200);
              state.player.x = (b.left + b.right) / 2;
              state.player.vx = 0;
              state.entities = state.entities.filter(e => e.type !== EntityType.BOSS_BULLET);
              // If boss is active, don't delete it, but maybe reset position?
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

      ctx.fillStyle = cfg.colors.bg;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

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

      ctx.fillStyle = cfg.colors.earth;
      for (let y = startY; y <= endY; y += RIVER_SEGMENT_HEIGHT) {
          const b = getBounds(y);
          const sy = CANVAS_HEIGHT - (y - state.cameraY);
          ctx.fillRect(b.left - 5, sy - RIVER_SEGMENT_HEIGHT, 5, RIVER_SEGMENT_HEIGHT + 2);
          ctx.fillRect(b.right, sy - RIVER_SEGMENT_HEIGHT, 5, RIVER_SEGMENT_HEIGHT + 2);
      }

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
          } else if (ent.type === EntityType.BOSS_BULLET) {
              ctx.fillStyle = '#ff0000';
              ctx.fillRect(ent.x - 3, screenY - 3, 6, 6);
          } else if (ent.type === EntityType.BOSS) {
             const bossCfg = BOSS_CONFIGS[ent.bossId || 0];
             drawSprite(ctx, bossCfg.sprite, ent.x, screenY, 4, bossCfg.color);
          } else {
              const def = SPAWN_REGISTRY[ent.type] || { color: '#fff' };
              const isAir = ent.type === EntityType.JET || ent.type === EntityType.HELICOPTER;
              if (isAir) drawSprite(ctx, ent.type, ent.x + 10, screenY + 10, 2.5, 'rgba(0,0,0,0.3)');
              drawSprite(ctx, ent.type, ent.x, screenY, 2.5, def.color);
              if (ent.type === EntityType.SHIP || ent.type === EntityType.BOAT) {
                  ctx.fillStyle = 'rgba(255,255,255,0.3)';
                  ctx.fillRect(ent.x - 4, screenY + 10, 8, 4);
              }
          }
      });

      if (!state.player.isDead) {
          if (state.player.activePowerUp === EntityType.ITEM_SHIELD) {
             ctx.beginPath();
             ctx.arc(state.player.x, state.player.y, 25, 0, Math.PI * 2);
             ctx.strokeStyle = `rgba(34, 211, 238, ${0.5 + Math.sin(Date.now() * 0.01) * 0.3})`; 
             ctx.lineWidth = 3;
             ctx.stroke();
          }
          drawSprite(ctx, 'PLAYER', state.player.x + 8, state.player.y + 8, 2.5, 'rgba(0,0,0,0.4)');
          drawSprite(ctx, 'PLAYER', state.player.x, state.player.y, 2.5, '#eab308');
          ctx.fillStyle = Math.random() > 0.5 ? '#ef4444' : '#f59e0b';
          ctx.fillRect(state.player.x - 2, state.player.y + 12, 4, 6);
      }

      state.particles.forEach(p => {
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.life;
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
          
          {/* HUD */}
          <div className="absolute top-0 left-0 w-full p-2 flex justify-between font-mono text-white font-bold text-sm tracking-wider drop-shadow-md">
              <div>SCORE {hudState.score.toString().padStart(6, '0')}</div>
              <div>LIVES {hudState.lives}</div>
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

          {/* FUEL GAUGE */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-48 h-6 bg-zinc-900 border-2 border-zinc-600 rounded">
              <div 
                className={`h-full transition-all duration-200 ${
                    gameState.current.player.activePowerUp === EntityType.ITEM_REGEN 
                    ? 'bg-green-500 animate-pulse' 
                    : hudState.fuel < 25 ? 'bg-red-500 animate-pulse' : 'bg-gradient-to-r from-yellow-500 to-green-500'
                }`}
                style={{ width: `${Math.max(0, hudState.fuel)}%` }}
              />
              <div className="absolute top-0 w-full text-center text-[10px] text-white font-bold leading-5 drop-shadow-md">
                {gameState.current.player.activePowerUp === EntityType.ITEM_REGEN ? 'REGENERATING' : 'FUEL'}
              </div>
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
