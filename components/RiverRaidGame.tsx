import React, { useEffect, useRef } from 'react';
import { EntityType, GameState, HighScore } from '../types';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const WINGMAN_OFFSET_X = 60;
const WINGMAN_OFFSET_Y = 60;
const BASE_BULLET_SPEED = 800;

interface RiverRaidGameProps {
  hasWingman: boolean;
  highScores: HighScore[];
  onGameEnd: (score: number, initials: string | null, earnedCoins: number) => void;
}

const RiverRaidGame: React.FC<RiverRaidGameProps> = ({ hasWingman, highScores, onGameEnd }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  const keys = useRef<{ [key: string]: boolean }>({});
  
  // Initialize Game State
  const state = useRef<GameState>({
    player: {
      id: 0,
      type: EntityType.PLAYER,
      x: CANVAS_WIDTH / 2,
      y: 100,
      width: 48,
      height: 32,
      vx: 0,
      vy: 0,
      fuel: 100,
      speed: 200,
      active: true,
      isDead: false,
      score: 0,
      lives: 3,
      upgrades: { spread: false, rapid: false, speed: false },
      invulnerableTimer: 0,
      multiplier: 1,
      frame: 0
    },
    entities: [],
    particles: [],
    cameraY: 0,
    riverSeed: Math.random() * 1000,
    isGameOver: false,
    isPaused: false,
    lastShotTime: 0,
    level: 1,
    distanceSinceLastFuel: 0,
    distanceInLevel: 0,
    multiplierDistance: 0,
    bossActive: false,
    gameTime: 0,
    sessionCoins: 0
  });

  const getBounds = (y: number) => {
    const s = state.current.riverSeed;
    const noise1 = Math.sin(y * 0.002 + s) * 100;
    const noise2 = Math.cos(y * 0.005 + s) * 50;
    const centerX = CANVAS_WIDTH / 2 + noise1 + noise2;
    const width = 400 + Math.sin(y * 0.001) * 100;
    return { left: centerX - width / 2, right: centerX + width / 2, centerX };
  };

  const update = (dt: number) => {
    const s = state.current;
    if (s.isGameOver) return;

    s.gameTime += dt;
    const p = s.player;

    // Controls
    if (keys.current['ArrowLeft']) p.x -= 300 * dt;
    if (keys.current['ArrowRight']) p.x += 300 * dt;
    if (keys.current['ArrowUp']) p.speed = Math.min(p.speed + 500 * dt, 600);
    else if (keys.current['ArrowDown']) p.speed = Math.max(p.speed - 500 * dt, 100);
    else {
        if (p.speed > 200) p.speed -= 200 * dt;
        if (p.speed < 200) p.speed += 200 * dt;
    }

    // Move Player
    p.y += p.speed * dt;
    s.cameraY = p.y - 100;

    // Bounds & Collision
    const bounds = getBounds(p.y);
    if (p.x < bounds.left || p.x > bounds.right) {
        handleGameOver();
        return;
    }
    p.fuel -= 5 * dt;
    if (p.fuel <= 0) {
        handleGameOver();
        return;
    }

    // Shooting
    if ((keys.current['Space'] || keys.current['KeyZ']) && s.gameTime - s.lastShotTime > 0.2) {
        s.entities.push({
            id: Math.random(),
            type: EntityType.BULLET,
            x: p.x,
            y: p.y + 20,
            width: 4,
            height: 12,
            vx: 0,
            vy: BASE_BULLET_SPEED,
            active: true,
            frame: 0
        });
        s.lastShotTime = s.gameTime;
    }

    // Spawn Logic
    if (Math.random() < 0.02) {
        const spawnY = s.cameraY + CANVAS_HEIGHT + 50;
        const b = getBounds(spawnY);
        const isShip = Math.random() > 0.5;
        s.entities.push({
            id: Math.random(),
            type: isShip ? EntityType.SHIP : EntityType.HELICOPTER,
            x: b.left + Math.random() * (b.right - b.left),
            y: spawnY,
            width: 40,
            height: 30,
            vx: isShip ? 0 : (Math.random() - 0.5) * 100,
            vy: 0,
            active: true,
            frame: 0,
            scoreValue: 100
        });
    }
    // Fuel Depot Spawn
    if (Math.random() < 0.005) {
         const spawnY = s.cameraY + CANVAS_HEIGHT + 50;
         const b = getBounds(spawnY);
         s.entities.push({
             id: Math.random(),
             type: EntityType.FUEL,
             x: b.centerX,
             y: spawnY,
             width: 30,
             height: 50,
             vx: 0, vy: 0, active: true, frame: 0, scoreValue: 0
         });
    }

    // Update Entities
    s.entities.forEach(ent => {
        if (!ent.active) return;

        // WINGMAN LOGIC
        if (ent.type === EntityType.WINGMAN) {
            // Follow player logic with lag
            const targetX = p.x + WINGMAN_OFFSET_X;
            const targetY = p.y - WINGMAN_OFFSET_Y; // Keep relative to player in world space
            
            // Simple lerp
            ent.x += (targetX - ent.x) * 5 * dt;
            ent.y += (targetY - ent.y) * 5 * dt;
            
            // Bounds safety for wingman
            const wb = getBounds(ent.y);
            if (ent.x < wb.left + 10) ent.x = wb.left + 10;
            if (ent.x > wb.right - 10) ent.x = wb.right - 10;
            
            // Auto-shoot
            if (Math.random() < 0.05) { 
               const enemiesAhead = s.entities.some(e => 
                  e.active && 
                  e.type !== EntityType.BULLET && 
                  e.type !== EntityType.WINGMAN && 
                  e.type !== EntityType.PLAYER &&
                  e.type !== EntityType.FUEL && 
                  e.y > ent.y && e.y < ent.y + 400 && Math.abs(e.x - ent.x) < 50
               );
               
               if (enemiesAhead) {
                   s.entities.push({
                        id: Math.random(), type: EntityType.BULLET,
                        x: ent.x, y: ent.y + 10,
                        width: 4, height: 12, vx: 0, vy: BASE_BULLET_SPEED + s.player.speed,
                        active: true, frame: 0
                   });
               }
            }
            return;
        }

        if (ent.type === EntityType.BULLET) {
            ent.y += ent.vy * dt;
            if (ent.y > s.cameraY + CANVAS_HEIGHT + 100) ent.active = false;
            // Collision
            s.entities.forEach(target => {
                if (target === ent || !target.active) return;
                if (target.type === EntityType.PLAYER || target.type === EntityType.WINGMAN || target.type === EntityType.BULLET) return;
                
                if (Math.abs(ent.x - target.x) < (ent.width + target.width)/2 && 
                    Math.abs(ent.y - target.y) < (ent.height + target.height)/2) {
                        ent.active = false;
                        target.active = false;
                        p.score += target.scoreValue || 0;
                        // Explosion particle
                        s.particles.push({
                             x: target.x, y: target.y, vx: 0, vy: 0,
                             life: 0.5, maxLife: 0.5, color: 'orange', size: 30, style: 'pixel'
                        });
                }
            });
        } else if (ent.type === EntityType.FUEL) {
            if (Math.abs(p.x - ent.x) < (p.width + ent.width)/2 && 
                Math.abs(p.y - ent.y) < (p.height + ent.height)/2) {
                p.fuel = 100; // Refuel
                ent.active = false; // Consume
                p.score += 50;
            }
        } else {
            // Enemy logic
            if (ent.type === EntityType.HELICOPTER) {
                ent.x += ent.vx * dt;
                const b = getBounds(ent.y);
                if (ent.x < b.left || ent.x > b.right) ent.vx *= -1;
            }
            // Player collision with enemy
            if (Math.abs(p.x - ent.x) < (p.width + ent.width)/2 && 
                Math.abs(p.y - ent.y) < (p.height + ent.height)/2) {
                    handleGameOver();
            }
        }
    });

    // Clean up entities
    s.entities = s.entities.filter(e => e.active && e.y > s.cameraY - 100);
    
    // Update Particles
    s.particles.forEach(pt => {
        pt.life -= dt;
    });
    s.particles = s.particles.filter(pt => pt.life > 0);
  };

  const handleGameOver = () => {
      if (state.current.isGameOver) return;
      state.current.isGameOver = true;
      
      // Coins calculation: 1 per minute, doubled if wingman
      const minutes = state.current.gameTime / 60;
      const earnedCoins = Math.floor(minutes * (hasWingman ? 2 : 1)) + Math.floor(state.current.player.score / 1000);
      
      setTimeout(() => {
          const initials = prompt(`GAME OVER\nScore: ${state.current.player.score}\nEnter Initials:`) || "AAA";
          onGameEnd(state.current.player.score, initials, earnedCoins > 0 ? earnedCoins : 0);
      }, 100);
  };

  const draw = () => {
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) return;
      const s = state.current;
      
      // Background
      ctx.fillStyle = '#1e3a8a'; // Deep blue
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      
      // River Banks
      ctx.fillStyle = '#064e3b'; // Dark green
      ctx.beginPath();
      for (let sy = 0; sy <= CANVAS_HEIGHT; sy += 20) {
          const worldY = s.cameraY + (CANVAS_HEIGHT - sy);
          const b = getBounds(worldY);
          ctx.fillRect(0, sy, b.left, 20); // Left bank
          ctx.fillRect(b.right, sy, CANVAS_WIDTH - b.right, 20); // Right bank
      }
      
      // Helper to convert world to screen
      const toScreen = (x: number, y: number) => ({ x, y: CANVAS_HEIGHT - (y - s.cameraY) });
      
      // Entities
      [...s.entities, s.player].forEach(e => {
          if (!e.active) return;
          const pos = toScreen(e.x, e.y);
          
          ctx.save();
          ctx.translate(pos.x, pos.y);
          
          if (e.type === EntityType.PLAYER) {
              ctx.fillStyle = '#fbbf24'; // Yellow jet
              ctx.beginPath();
              ctx.moveTo(0, -20); ctx.lineTo(15, 15); ctx.lineTo(0, 10); ctx.lineTo(-15, 15);
              ctx.fill();
              if (Math.random() > 0.5) { // Flame
                  ctx.fillStyle = '#f87171';
                  ctx.fillRect(-5, 12, 10, 10);
              }
          } else if (e.type === EntityType.WINGMAN) {
              ctx.fillStyle = '#60a5fa'; // Blue jet
              ctx.beginPath();
              ctx.moveTo(0, -15); ctx.lineTo(12, 12); ctx.lineTo(0, 8); ctx.lineTo(-12, 12);
              ctx.fill();
          } else if (e.type === EntityType.SHIP) {
              ctx.fillStyle = '#9ca3af';
              ctx.fillRect(-20, -10, 40, 20);
              ctx.fillStyle = '#4b5563';
              ctx.fillRect(-10, -15, 20, 10);
          } else if (e.type === EntityType.HELICOPTER) {
              ctx.fillStyle = '#ec4899';
              ctx.beginPath(); ctx.arc(0,0, 15, 0, Math.PI*2); ctx.fill();
              ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
              ctx.beginPath(); ctx.moveTo(-20, 0); ctx.lineTo(20, 0); ctx.stroke();
              ctx.rotate(s.gameTime * 10);
          } else if (e.type === EntityType.FUEL) {
              ctx.fillStyle = '#ef4444';
              ctx.fillRect(-15, -25, 30, 50);
              ctx.fillStyle = '#fff';
              ctx.font = '12px monospace';
              ctx.fillText("FUEL", -14, 5);
          } else if (e.type === EntityType.BULLET) {
              ctx.fillStyle = '#fff';
              ctx.fillRect(-2, -6, 4, 12);
          }
          
          ctx.restore();
      });
      
      // Particles
      s.particles.forEach(p => {
           const pos = toScreen(p.x, p.y);
           ctx.fillStyle = p.color;
           ctx.beginPath();
           ctx.arc(pos.x, pos.y, p.size * (p.life/p.maxLife), 0, Math.PI*2);
           ctx.fill();
      });
      
      // HUD
      ctx.fillStyle = '#fff';
      ctx.font = '20px monospace';
      ctx.fillText(`SCORE: ${s.player.score}`, 20, 30);
      ctx.fillText(`FUEL:`, 20, 60);
      
      // Fuel Bar
      ctx.fillStyle = '#374151';
      ctx.fillRect(80, 45, 200, 15);
      ctx.fillStyle = s.player.fuel < 30 ? '#ef4444' : '#10b981';
      ctx.fillRect(80, 45, 2 * s.player.fuel, 15);
  };

  useEffect(() => {
      if (hasWingman) {
         state.current.entities.push({
            id: 999,
            type: EntityType.WINGMAN,
            x: state.current.player.x + WINGMAN_OFFSET_X,
            y: state.current.player.y - WINGMAN_OFFSET_Y,
            width: 30, height: 30, vx: 0, vy: 0, active: true, frame: 0
         });
      }

      const loop = (time: number) => {
          const dt = 0.016; // Fixed step
          update(dt);
          draw();
          if (!state.current.isGameOver) {
            requestRef.current = requestAnimationFrame(loop);
          }
      };
      
      const down = (e: KeyboardEvent) => keys.current[e.code] = true;
      const up = (e: KeyboardEvent) => keys.current[e.code] = false;
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
    <div className="relative flex items-center justify-center bg-black w-full h-full">
        <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="border-4 border-slate-700 shadow-2xl max-h-[90vh]" />
    </div>
  );
};

export default RiverRaidGame;