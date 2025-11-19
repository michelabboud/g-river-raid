import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Entity, EntityType, GameState, Particle, Player } from '../types';

// --- CONSTANTS ---
const CANVAS_WIDTH = 320;
const CANVAS_HEIGHT = 480;
const PLAYER_SPEED_X = 200; // px per second
const MAX_SCROLL_SPEED = 150;
const MIN_SCROLL_SPEED = 30;
const BULLET_SPEED = 400;
const FUEL_CONSUMPTION = 8; // per second
const RIVER_SEGMENT_HEIGHT = 20;
const SPAWN_DISTANCE = 600; // Distance ahead of camera to spawn entities

// Colors
const C_WATER = '#3b82f6';
const C_GRASS = '#15803d';
const C_EARTH = '#a16207';
const C_PLAYER = '#fbbf24';
const C_ENEMY = '#ef4444';
const C_FUEL = '#ec4899';
const C_BRIDGE = '#1f2937';

interface Props {
  onExit: () => void;
}

const RiverRaidGame: React.FC<Props> = ({ onExit }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  const previousTimeRef = useRef<number | undefined>(undefined);
  
  // Input State
  const keys = useRef<{ [key: string]: boolean }>({});
  
  // Game State Ref (Mutable for performance)
  const gameState = useRef<GameState>({
    player: {
      id: 0,
      type: EntityType.PLAYER,
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT - 100,
      width: 16,
      height: 16,
      vx: 0,
      vy: 0,
      fuel: 100,
      speed: MIN_SCROLL_SPEED * 2,
      active: true,
      isDead: false,
      score: 0,
      lives: 3,
      frame: 0
    },
    entities: [],
    particles: [],
    cameraY: 0,
    riverSeed: Math.random() * 1000,
    isGameOver: false,
    isPaused: false,
    lastShotTime: 0,
    level: 1
  });

  const [hudState, setHudState] = useState({ score: 0, fuel: 100, lives: 3, gameOver: false });

  // --- HELPER FUNCTIONS ---

  // Simple Pseudo-Random for consistent map generation based on Y coordinate
  const noise = (y: number) => {
    const x = (y + gameState.current.riverSeed) * 0.01;
    return Math.sin(x) * 0.5 + Math.sin(x * 2.5) * 0.25 + Math.sin(x * 0.5) * 0.25;
  };

  const getRiverWidth = (y: number) => {
    // Narrow points occasionally
    const n = noise(y);
    const baseWidth = CANVAS_WIDTH * 0.5;
    const variable = CANVAS_WIDTH * 0.3;
    let width = baseWidth + n * variable;
    
    // Force a bridge choke point every 2000 pixels
    const bridgeZone = Math.abs((y % 2000) - 1000);
    if (bridgeZone > 950) {
       // Near bridge
       return CANVAS_WIDTH * 0.8; // Wide river at bridge for crossing
    }
    
    return Math.max(40, Math.min(CANVAS_WIDTH - 20, width));
  };

  const getRiverCenter = (y: number) => {
    const n = noise(y + 5000); // Different seed offset
    const maxOffset = CANVAS_WIDTH * 0.25;
    return (CANVAS_WIDTH / 2) + (n * maxOffset);
  };

  const getRiverBounds = (y: number) => {
    const w = getRiverWidth(y);
    const c = getRiverCenter(y);
    return {
      left: c - w / 2,
      right: c + w / 2
    };
  };

  const spawnEntity = (y: number) => {
    // Deterministic spawning based on Y so it feels like a map
    const spawnRate = 0.02 + (gameState.current.level * 0.005);
    const seed = (y * 1234.5678) % 1;
    
    // Only spawn if we are lucky
    if (seed > spawnRate) return;

    // Check bridge
    if (Math.abs(y % 2000) < 20 && !gameState.current.entities.some(e => e.type === EntityType.BRIDGE && Math.abs(e.y - y) < 100)) {
      gameState.current.entities.push({
        id: Date.now() + Math.random(),
        type: EntityType.BRIDGE,
        x: CANVAS_WIDTH / 2,
        y: y,
        width: CANVAS_WIDTH,
        height: 20,
        vx: 0,
        vy: 0,
        active: true,
        frame: 0
      });
      return;
    }

    const bounds = getRiverBounds(y);
    const typeSeed = ((y * 987.6543) % 1);
    
    let type = EntityType.HELICOPTER;
    if (typeSeed > 0.7) type = EntityType.SHIP;
    if (typeSeed > 0.9) type = EntityType.JET;
    if (typeSeed < 0.15) type = EntityType.FUEL;

    const margin = 20;
    const spawnX = bounds.left + margin + ((bounds.right - margin) - (bounds.left + margin)) * ((y * 333) % 1);

    gameState.current.entities.push({
      id: Date.now() + Math.random(),
      type,
      x: spawnX,
      y: y,
      width: type === EntityType.FUEL ? 12 : 16,
      height: type === EntityType.SHIP ? 8 : 12,
      vx: type === EntityType.HELICOPTER ? 20 * (Math.random() > 0.5 ? 1 : -1) : 0,
      vy: 0,
      active: true,
      frame: 0
    });
  };

  const createExplosion = (x: number, y: number, color: string = '#fbbf24') => {
    for (let i = 8; i < 16; i++) {
      const angle = (Math.PI * 2 * i) / 8;
      const speed = 50 + Math.random() * 50;
      gameState.current.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.5,
        color
      });
    }
  };

  const resetPlayer = (fullReset = false) => {
    const player = gameState.current.player;
    if (fullReset) {
        player.score = 0;
        player.lives = 3;
        player.fuel = 100;
        gameState.current.cameraY = 0;
        gameState.current.entities = [];
        gameState.current.level = 1;
    }
    
    // Place player safely in center of river
    const currentY = gameState.current.cameraY + 100;
    const bounds = getRiverBounds(currentY);
    player.x = (bounds.left + bounds.right) / 2;
    player.y = 100; // Screen relative Y
    player.vx = 0;
    player.isDead = false;
    player.active = true;
    player.fuel = 100;
    gameState.current.isPaused = false;
  };

  // --- MAIN LOOP ---

  const update = (dt: number) => {
    const state = gameState.current;
    if (state.isGameOver || state.isPaused) return;
    if (state.player.isDead) return;

    // 1. Player Movement logic
    // Horizontal
    if (keys.current['ArrowLeft'] || keys.current['a']) state.player.vx = -PLAYER_SPEED_X;
    else if (keys.current['ArrowRight'] || keys.current['d']) state.player.vx = PLAYER_SPEED_X;
    else state.player.vx = 0;

    state.player.x += state.player.vx * dt;

    // Vertical Speed (Scroll Speed)
    let targetScrollSpeed = MAX_SCROLL_SPEED * 0.6; // Cruising speed
    if (keys.current['ArrowUp'] || keys.current['w']) targetScrollSpeed = MAX_SCROLL_SPEED;
    if (keys.current['ArrowDown'] || keys.current['s']) targetScrollSpeed = MIN_SCROLL_SPEED;
    
    // Smooth acceleration
    state.player.speed += (targetScrollSpeed - state.player.speed) * 5 * dt;
    state.cameraY += state.player.speed * dt;

    // 2. Fuel Logic
    state.player.fuel -= FUEL_CONSUMPTION * dt;
    if (state.player.fuel <= 0) {
        handleDeath();
    }

    // 3. Shooting
    if (keys.current[' '] && Date.now() - state.lastShotTime > 300) {
      state.lastShotTime = Date.now();
      state.entities.push({
        id: Date.now(),
        type: EntityType.BULLET,
        x: state.player.x,
        y: state.cameraY + state.player.y + 5,
        width: 2,
        height: 6,
        vx: 0,
        vy: BULLET_SPEED + state.player.speed, // Bullet moves relative to world, faster than plane
        active: true,
        frame: 0
      });
    }

    // 4. Collision Detection - World (River Banks)
    // We check collision at the player's WORLD Y.
    // Player Y is relative to screen bottom (essentially fixed on screen)
    // World Y = cameraY + player.y
    const playerWorldY = state.cameraY + state.player.y;
    const bounds = getRiverBounds(playerWorldY);
    
    // Player hitbox is small
    const halfW = state.player.width / 2;
    if (state.player.x - halfW < bounds.left || state.player.x + halfW > bounds.right) {
        // Crashed into land
        handleDeath();
    }

    // 5. Entities Update
    // Spawn new ones ahead
    const spawnY = Math.floor((state.cameraY + SPAWN_DISTANCE) / 50) * 50;
    if (spawnY > (Math.floor((state.cameraY + SPAWN_DISTANCE - state.player.speed * dt) / 50) * 50)) {
       spawnEntity(spawnY);
    }

    state.entities.forEach(ent => {
        if (!ent.active) return;

        // Move Enemies
        if (ent.type === EntityType.HELICOPTER) {
            // Patrol logic
            const b = getRiverBounds(ent.y);
            ent.x += ent.vx * dt;
            if (ent.x < b.left + 10 || ent.x > b.right - 10) ent.vx *= -1;
        } else if (ent.type === EntityType.JET) {
            ent.x += 50 * dt; // Jets strafe fast
        } else if (ent.type === EntityType.BULLET) {
            ent.y += ent.vy * dt;
        }

        // Cleanup off-screen (behind player)
        if (ent.y < state.cameraY - 50) {
            ent.active = false;
        }

        // Collision with Player
        // Convert entity world Y to screen Y for AABB check
        // Player is at state.player.y (screen coords)
        // Entity Screen Y = ent.y - state.cameraY
        const entScreenY = ent.y - state.cameraY;
        
        // AABB
        if (Math.abs(state.player.x - ent.x) < (state.player.width + ent.width) / 2 &&
            Math.abs(state.player.y - entScreenY) < (state.player.height + ent.height) / 2) {
             
             if (ent.type === EntityType.FUEL) {
                 // Refuel sound effect trigger here
                 state.player.fuel = Math.min(100, state.player.fuel + 40 * dt); // Need to hover to fill
             } else if (ent.type !== EntityType.BULLET) {
                 handleDeath();
             }
        }

        // Collision with Bullets
        if (ent.type === EntityType.BULLET) {
            // Check against other entities
            state.entities.forEach(target => {
                if (!target.active || target.type === EntityType.BULLET || target.type === EntityType.EXPLOSION) return;
                
                // Bullet hits target?
                if (Math.abs(ent.x - target.x) < (ent.width + target.width) / 2 &&
                    Math.abs(ent.y - target.y) < (ent.height + target.height) / 2) {
                    
                    // Hit!
                    ent.active = false;
                    if (target.type === EntityType.BRIDGE) {
                        target.active = false;
                        createExplosion(target.x, target.y - state.cameraY, '#fff');
                        state.player.score += 500;
                        state.level++; // Checkpoint
                    } else {
                        target.active = false;
                        createExplosion(target.x, target.y - state.cameraY);
                        state.player.score += (target.type === EntityType.FUEL ? 60 : 100);
                    }
                }
            });
            
            // Bullet hits land?
            const bBounds = getRiverBounds(ent.y);
            if (ent.x < bBounds.left || ent.x > bBounds.right) {
                ent.active = false; // Hit wall
            }
        }
    });

    // 6. Particles
    state.particles.forEach(p => {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= dt;
    });
    state.particles = state.particles.filter(p => p.life > 0);

    // Sync React State for HUD occasionally
    if (Math.random() > 0.9) {
        setHudState({
            score: state.player.score,
            fuel: state.player.fuel,
            lives: state.player.lives,
            gameOver: state.isGameOver
        });
    }
  };

  const handleDeath = () => {
      const state = gameState.current;
      createExplosion(state.player.x, state.player.y, '#ef4444');
      state.player.isDead = true;
      state.player.lives -= 1;
      
      setTimeout(() => {
          if (state.player.lives > 0) {
              resetPlayer();
              state.player.isDead = false;
          } else {
              state.isGameOver = true;
              setHudState(prev => ({ ...prev, gameOver: true }));
          }
      }, 2000);
  };

  // --- DRAWING ---

  const drawEntity = (ctx: CanvasRenderingContext2D, ent: Entity, screenY: number) => {
    const { x, width, height, type } = ent;
    const y = screenY; // already converted
    
    ctx.save();
    ctx.translate(Math.floor(x), Math.floor(y));
    
    if (type === EntityType.PLAYER) {
        ctx.fillStyle = C_PLAYER;
        // Simple Jet shape
        ctx.beginPath();
        ctx.moveTo(0, -8);
        ctx.lineTo(4, 2);
        ctx.lineTo(8, 4);
        ctx.lineTo(2, 4);
        ctx.lineTo(0, 8);
        ctx.lineTo(-2, 4);
        ctx.lineTo(-8, 4);
        ctx.lineTo(-4, 2);
        ctx.closePath();
        ctx.fill();
        
        // Jet shadow/detail
        ctx.fillStyle = 'black';
        ctx.fillRect(-1, -2, 2, 6);

    } else if (type === EntityType.HELICOPTER) {
        ctx.fillStyle = C_ENEMY;
        ctx.fillRect(-6, -3, 12, 6); // Body
        ctx.fillStyle = '#000';
        // Rotor animation
        const rotor = (Date.now() / 50) % 2 > 1 ? 8 : -8;
        ctx.fillRect(-8, -5, 16, 2); // Rotor
        ctx.fillRect(-2, -5, 4, -2); // Top
    } else if (type === EntityType.SHIP) {
        ctx.fillStyle = C_ENEMY;
        ctx.fillRect(-8, -2, 16, 4);
        ctx.fillStyle = '#fff';
        ctx.fillRect(-4, -5, 8, 3);
    } else if (type === EntityType.FUEL) {
        ctx.fillStyle = C_FUEL;
        ctx.fillRect(-5, -8, 10, 16);
        ctx.fillStyle = '#fff';
        ctx.font = '8px monospace';
        ctx.fillText('F', -2, 2);
    } else if (type === EntityType.BRIDGE) {
        ctx.fillStyle = C_BRIDGE;
        ctx.fillRect(-CANVAS_WIDTH/2, -10, CANVAS_WIDTH, 20);
        ctx.fillStyle = '#fbbf24'; // Road stripes
        ctx.fillRect(-CANVAS_WIDTH/2, -1, CANVAS_WIDTH, 2);
    } else if (type === EntityType.BULLET) {
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(-1, -3, 2, 6);
    } else if (type === EntityType.JET) {
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.moveTo(0, -6);
        ctx.lineTo(6, 6);
        ctx.lineTo(-6, 6);
        ctx.fill();
    }
    
    ctx.restore();
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const state = gameState.current;

    // Clear
    ctx.fillStyle = C_GRASS;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw River
    // Optimization: Draw strips.
    ctx.fillStyle = C_WATER;
    
    // We draw from screen bottom (cameraY) to screen top (cameraY + height)
    // Step size matches RIVER_SEGMENT_HEIGHT
    const startY = Math.floor(state.cameraY / RIVER_SEGMENT_HEIGHT) * RIVER_SEGMENT_HEIGHT;
    const endY = startY + CANVAS_HEIGHT + RIVER_SEGMENT_HEIGHT;

    ctx.beginPath();
    for (let y = startY; y <= endY; y += RIVER_SEGMENT_HEIGHT) {
        const bounds = getRiverBounds(y);
        const screenY = CANVAS_HEIGHT - (y - state.cameraY);
        
        // To make it smooth, we might want quadTo, but rects are more retro
        ctx.rect(bounds.left, screenY - RIVER_SEGMENT_HEIGHT, bounds.right - bounds.left, RIVER_SEGMENT_HEIGHT + 1);
    }
    ctx.fill();
    
    // Draw Mud Banks (Lines at edges)
    ctx.fillStyle = C_EARTH;
    for (let y = startY; y <= endY; y += RIVER_SEGMENT_HEIGHT) {
        const bounds = getRiverBounds(y);
        const screenY = CANVAS_HEIGHT - (y - state.cameraY);
        ctx.fillRect(bounds.left - 4, screenY - RIVER_SEGMENT_HEIGHT, 4, RIVER_SEGMENT_HEIGHT + 1);
        ctx.fillRect(bounds.right, screenY - RIVER_SEGMENT_HEIGHT, 4, RIVER_SEGMENT_HEIGHT + 1);
    }

    // Draw Entities
    state.entities.forEach(ent => {
        if (!ent.active) return;
        // Entity Y is world coordinate. Convert to screen.
        // Screen 0,0 is top-left.
        // World is scrolling up.
        // ScreenY = CANVAS_HEIGHT - (ent.y - cameraY)  <-- This would mean y=0 is bottom.
        // BUT, standard canvas is y=0 top.
        // Let's say Player is at screen y=380 (near bottom).
        // That corresponds to cameraY.
        // Let's flip the logic to match `update`:
        // In update: player Y is screen relative (e.g. 100px from bottom).
        // CameraY tracks how far we flew.
        // World Y of an object is absolute.
        // ScreenY = CANVAS_HEIGHT - (ent.y - state.cameraY);
        // Wait, if cameraY increases, objects should move DOWN.
        // So ScreenY = CANVAS_HEIGHT - (ent.y - state.cameraY) - OFFSET?
        
        // Let's redefine coordinates for sanity:
        // CameraY = 0 initially.
        // Player is at fixed ScreenY e.g. 400.
        // Objects are at WorldY.
        // Object ScreenY = (CANVAS_HEIGHT - PlayerScreenY) + (PlayerWorldY - ObjectWorldY) ? No.
        
        // SIMPLER:
        // Screen Y=0 is Top. Y=480 is Bottom.
        // Camera is looking at `cameraY` (bottom of screen).
        // Object at `cameraY` should be at bottom (480).
        // Object at `cameraY + 480` should be at top (0).
        // Object ScreenY = CANVAS_HEIGHT - (ObjectWorldY - state.cameraY);
        
        const screenY = CANVAS_HEIGHT - (ent.y - state.cameraY);
        if (screenY > -50 && screenY < CANVAS_HEIGHT + 50) {
            drawEntity(ctx, ent, screenY);
        }
    });

    // Draw Player
    if (!state.player.isDead) {
        // Player Y in state is "distance from bottom"
        // So screen Y = CANVAS_HEIGHT - player.y
        drawEntity(ctx, state.player, CANVAS_HEIGHT - state.player.y);
    }

    // Draw Particles
    state.particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, CANVAS_HEIGHT - (p.y - state.cameraY), 3, 3);
    });
  };

  const loop = (time: number) => {
    if (previousTimeRef.current !== undefined) {
      const dt = Math.min((time - previousTimeRef.current) / 1000, 0.05); // Cap dt at 50ms
      update(dt);
      draw();
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    // Input Listeners
    const handleKeyDown = (e: KeyboardEvent) => keys.current[e.key] = true;
    const handleKeyUp = (e: KeyboardEvent) => keys.current[e.key] = false;
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Start Loop
    requestRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  // Touch Controls
  const handleTouchStart = (action: string) => {
      keys.current[action] = true;
  };
  const handleTouchEnd = (action: string) => {
      keys.current[action] = false;
  };


  return (
    <div className="relative w-full h-full flex items-center justify-center bg-black">
        {/* Game Canvas */}
        <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="h-full aspect-[2/3] bg-zinc-900 shadow-2xl max-h-[90vh] border-4 border-zinc-700 rounded-md"
        />
        
        {/* HUD Overlay */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-full max-w-md px-6 flex justify-between font-mono text-xl font-bold drop-shadow-md pointer-events-none">
            <div className="text-yellow-400">SCORE: {hudState.score.toString().padStart(6, '0')}</div>
            <div className={hudState.fuel < 30 ? "text-red-500 animate-pulse" : "text-white"}>
                FUEL: <span className="inline-block w-24 h-4 bg-zinc-700 border border-white align-middle ml-1">
                    <span className="block h-full bg-pink-500 transition-all duration-200" style={{ width: `${Math.max(0, hudState.fuel)}%` }}></span>
                </span>
            </div>
        </div>
        
        {/* Game Over Screen */}
        {hudState.gameOver && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-50 text-white animate-in fade-in duration-300">
                <h2 className="text-5xl font-black text-red-500 mb-4">GAME OVER</h2>
                <p className="text-2xl mb-8">FINAL SCORE: {hudState.score}</p>
                <div className="flex gap-4">
                    <button 
                        onClick={() => {
                            resetPlayer(true);
                            setHudState(prev => ({ ...prev, gameOver: false }));
                        }}
                        className="px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded uppercase"
                    >
                        Try Again
                    </button>
                    <button 
                        onClick={onExit}
                        className="px-6 py-3 bg-zinc-700 hover:bg-zinc-600 text-white font-bold rounded uppercase"
                    >
                        Exit
                    </button>
                </div>
            </div>
        )}

        {/* Mobile Controls Overlay */}
        <div className="absolute bottom-8 left-0 right-0 px-8 flex justify-between md:hidden select-none">
            <div className="flex gap-4">
                <button 
                    onTouchStart={() => handleTouchStart('ArrowLeft')} 
                    onTouchEnd={() => handleTouchEnd('ArrowLeft')}
                    className="w-16 h-16 bg-white/20 rounded-full backdrop-blur flex items-center justify-center active:bg-white/40"
                >
                   ←
                </button>
                <button 
                    onTouchStart={() => handleTouchStart('ArrowRight')} 
                    onTouchEnd={() => handleTouchEnd('ArrowRight')}
                    className="w-16 h-16 bg-white/20 rounded-full backdrop-blur flex items-center justify-center active:bg-white/40"
                >
                   →
                </button>
            </div>
            <div className="flex gap-4">
                <button 
                    onTouchStart={() => handleTouchStart(' ')} 
                    onTouchEnd={() => handleTouchEnd(' ')}
                    className="w-20 h-20 bg-red-500/50 rounded-full backdrop-blur flex items-center justify-center active:bg-red-500/70 font-bold border-2 border-red-400"
                >
                   FIRE
                </button>
            </div>
        </div>
    </div>
  );
};

export default RiverRaidGame;