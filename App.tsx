/**
 * River Raid - Main Application Component
 *
 * This is the root component of the River Raid game application.
 * It manages the global application state and controls the flow between
 * the main menu and the game itself.
 *
 * Key Responsibilities:
 * - Display and manage the main menu UI with retro arcade styling
 * - Handle high score persistence via localStorage
 * - Manage the "Bravery Coins" currency system
 * - Control Wingman (AI companion) feature purchases
 * - Toggle between menu and active gameplay
 * - Process game session results and update persistent data
 *
 * Game Flow:
 * 1. User sees main menu with options and high scores
 * 2. User can optionally purchase Wingman for 5 coins
 * 3. User clicks "LAUNCH" to start game
 * 4. Game runs until player loses all lives
 * 5. Game ends, coins are awarded, high score is processed
 * 6. Return to main menu
 *
 * Persistent Data (localStorage):
 * - river_raid_coins: Total Bravery Coins earned across all sessions
 * - river_raid_highscores: Top 10 high scores with initials and dates
 *
 * @module App
 */

import React, { useState, useEffect } from 'react';
import RiverRaidGame from './components/RiverRaidGame';
import { HighScore } from './types';

// Cost in Bravery Coins to hire the Wingman AI companion for one game session
const WINGMAN_COST = 5;

/**
 * Main Application Component
 *
 * Manages the global game state, including coins, high scores, and the main menu UI.
 * Handles transitions between menu and gameplay, and persists player data.
 *
 * @component
 * @returns {JSX.Element} The root application UI (menu or game)
 */
const App: React.FC = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [coins, setCoins] = useState<number>(0);
  const [highScores, setHighScores] = useState<HighScore[]>([]);
  const [useWingman, setUseWingman] = useState(false);
  const [showHighScores, setShowHighScores] = useState(false);

  /**
   * Initialize game data from local storage on mount.
   */
  useEffect(() => {
    // Load data from local storage
    const savedCoins = localStorage.getItem('river_raid_coins');
    if (savedCoins) setCoins(parseInt(savedCoins, 10));

    const savedScores = localStorage.getItem('river_raid_highscores');
    if (savedScores) {
      try {
        setHighScores(JSON.parse(savedScores));
      } catch (e) { console.error("Failed to parse high scores", e); }
    }
  }, []);

  /**
   * Persist game data to local storage.
   * @param newCoins Updated coin balance.
   * @param newHighScores Updated high score list.
   */
  const saveGameData = (newCoins: number, newHighScores: HighScore[]) => {
    setCoins(newCoins);
    setHighScores(newHighScores);
    localStorage.setItem('river_raid_coins', newCoins.toString());
    localStorage.setItem('river_raid_highscores', JSON.stringify(newHighScores));
  };

  /**
   * Callback triggered when a game session ends.
   * updates coins and processes high scores.
   * @param score The final score achieved.
   * @param initials The player's initials (if a high score was achieved).
   * @param earnedCoins Coins earned during the session.
   */
  const handleGameEnd = (score: number, initials: string | null, earnedCoins: number) => {
    let newCoins = coins + earnedCoins;
    
    let newScores = [...highScores];
    if (initials && score > 0) {
      newScores.push({ name: initials.toUpperCase().substring(0, 3), score, date: new Date().toLocaleDateString() });
      newScores.sort((a, b) => b.score - a.score);
      newScores = newScores.slice(0, 10);
    }

    saveGameData(newCoins, newScores);
    setGameStarted(false);
    setUseWingman(false); // Reset wingman selection after game
  };

  /**
   * Starts the game loop. Deducts coins if Wingman is selected.
   */
  const startGame = () => {
    if (useWingman) {
      if (coins >= WINGMAN_COST) {
        const newCoins = coins - WINGMAN_COST;
        setCoins(newCoins);
        localStorage.setItem('river_raid_coins', newCoins.toString());
        setGameStarted(true);
      } else {
        alert("Not enough Bravery Coins!");
        setUseWingman(false);
      }
    } else {
      setGameStarted(true);
    }
  };

  /**
   * Toggles the Wingman selection state.
   */
  const toggleWingman = () => {
    if (!useWingman && coins < WINGMAN_COST) return;
    setUseWingman(!useWingman);
  };

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-slate-900 text-white font-mono overflow-hidden select-none">
      <style>{`
        @keyframes wave {
          0%, 100% { transform: translateY(0) skewX(-12deg); }
          50% { transform: translateY(-10px) skewX(-12deg); }
        }
        @keyframes flyLoop {
          0% { transform: translate(-100px, 100px) rotate(45deg) scale(0.5); opacity: 0; }
          20% { opacity: 1; }
          40% { transform: translate(300px, -200px) rotate(45deg) scale(1); }
          41% { transform: translate(300px, -200px) rotate(225deg) scale(1); }
          80% { transform: translate(-200px, 200px) rotate(225deg) scale(0.8); }
          100% { transform: translate(-300px, 300px) rotate(225deg) scale(0.5); opacity: 0; }
        }
        .animate-wave { animation: wave 3s ease-in-out infinite; }
        .animate-fly { animation: flyLoop 8s linear infinite; }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>

      {!gameStarted ? (
        <div className="relative w-full max-w-2xl p-8 flex flex-col items-center space-y-8 z-10" style={{ transform: 'scale(0.95)' }}>
           {/* Retro Background Pattern */}
           <div className="absolute inset-0 z-[-1] opacity-20" 
                style={{ 
                  backgroundImage: 'repeating-linear-gradient(45deg, #1e3a8a 0, #1e3a8a 10px, #172554 10px, #172554 20px)' 
                }}>
           </div>

           {/* Animated Fighter Plane */}
           <div className="absolute z-0 animate-fly pointer-events-none">
             <div className="w-16 h-16 relative opacity-50">
                <div className="absolute top-1/2 left-0 w-full h-2 bg-yellow-500"></div>
                <div className="absolute top-1/2 left-1/2 w-2 h-8 bg-yellow-500 -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute top-1/2 left-1/2 w-12 h-12 border-2 border-white rounded-full -translate-x-1/2 -translate-y-1/2 opacity-20"></div>
             </div>
           </div>

           {/* Title Header */}
           <div className="flex flex-col items-center space-y-2 drop-shadow-[4px_4px_0_rgba(0,0,0,1)] z-10">
             <div className="w-full flex justify-center space-x-2 mb-4">
                <div className="h-4 w-16 bg-red-600"></div>
                <div className="h-4 w-16 bg-white"></div>
                <div className="h-4 w-16 bg-blue-600"></div>
             </div>
             <h1 className="animate-wave text-7xl md:text-9xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 filter drop-shadow-lg"
                 style={{ WebkitTextStroke: '2px #fff' }}>
                RIVER
             </h1>
             <h1 className="animate-wave delay-100 text-7xl md:text-9xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-red-500 to-red-800 mt-[-1rem] z-10"
                  style={{ WebkitTextStroke: '2px #fff' }}>
                RAID
             </h1>
             <div className="text-xl tracking-[0.5em] text-blue-300 font-bold mt-4 uppercase animate-pulse">
                Remastered
             </div>
          </div>
          
          {showHighScores ? (
            <div className="bg-slate-800/95 border-4 border-yellow-500 p-6 rounded-sm shadow-[8px_8px_0_rgba(0,0,0,0.5)] w-full max-w-md backdrop-blur-sm relative z-20">
               <h2 className="text-3xl font-black text-yellow-400 text-center mb-6 tracking-widest underline">HIGH SCORES</h2>
               <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-hide">
                  {highScores.length === 0 ? (
                    <div className="text-center text-slate-500 py-8">NO RECORDS YET</div>
                  ) : (
                    highScores.map((score, idx) => (
                      <div key={idx} className="flex justify-between text-xl font-mono border-b border-slate-700 pb-1">
                        <div className="flex gap-4">
                          <span className="text-slate-500 w-6">{idx + 1}.</span>
                          <span className="text-white">{score.name}</span>
                        </div>
                        <span className="text-yellow-500">{score.score.toLocaleString()}</span>
                      </div>
                    ))
                  )}
               </div>
               <button 
                 onClick={() => setShowHighScores(false)}
                 className="mt-6 w-full py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold uppercase rounded"
               >
                 Back to Menu
               </button>
            </div>
          ) : (
            <>
              {/* Main Menu Card */}
              <div className="bg-slate-800/90 border-4 border-slate-200 p-6 rounded-sm shadow-[8px_8px_0_rgba(0,0,0,0.5)] w-full max-w-md backdrop-blur-sm relative z-10">
                 <div className="flex justify-between items-center mb-4 border-b border-slate-600 pb-2">
                    <div className="text-yellow-400 font-bold text-sm">BALANCE: {coins} COINS</div>
                    <button 
                      onClick={() => setShowHighScores(true)}
                      className="text-xs bg-slate-700 px-2 py-1 hover:bg-slate-600 rounded"
                    >
                      HIGH SCORES
                    </button>
                 </div>

                 <div className="text-center space-y-4">
                    <div className="p-4 bg-black/40 border border-slate-600 rounded text-left font-mono text-xs md:text-sm text-slate-300 leading-relaxed">
                      <p className="text-yellow-400 font-bold mb-2">{'>>'} MISSION DIRECTIVE:</p>
                      <p>1. PENETRATE ENEMY DEFENSES.</p>
                      <p>2. EARN <span className="text-yellow-400">1 COIN</span> PER MINUTE.</p>
                      <p>3. <span className="text-cyan-400">WINGMAN</span> DOUBLES COIN EARNINGS.</p>
                    </div>
                    
                    {/* Wingman Purchase */}
                    <div 
                      onClick={toggleWingman}
                      className={`cursor-pointer p-3 border-2 rounded transition-all flex items-center justify-between ${
                        useWingman 
                          ? 'bg-blue-900/50 border-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.5)]' 
                          : 'bg-slate-700/30 border-slate-600 hover:border-slate-400'
                      } ${coins < WINGMAN_COST ? 'opacity-50 grayscale' : ''}`}
                    >
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center font-bold text-black text-xs">AI</div>
                          <div className="text-left">
                            <div className={`font-bold text-sm ${useWingman ? 'text-blue-300' : 'text-slate-300'}`}>HIRE WINGMAN</div>
                            <div className="text-[10px] text-slate-400">Autofire helper. +2 Coins/Min</div>
                          </div>
                       </div>
                       <div className={`text-xs font-bold px-2 py-1 rounded ${useWingman ? 'bg-blue-600 text-white' : 'bg-slate-800 text-yellow-500'}`}>
                         {useWingman ? 'SELECTED' : `${WINGMAN_COST} COINS`}
                       </div>
                    </div>
                 </div>
              </div>

              <button
                onClick={startGame}
                className="group relative px-12 py-4 bg-yellow-500 text-black font-black text-2xl uppercase tracking-wider hover:bg-yellow-400 active:translate-y-1 transition-all shadow-[0_6px_0_#854d0e] active:shadow-none z-10"
              >
                <span className="absolute inset-0 border-2 border-white opacity-20 group-hover:scale-105 transition-transform"></span>
                {useWingman ? 'LAUNCH SQUADRON' : 'LAUNCH SOLO'}
              </button>
            </>
          )}
          
          <div className="text-slate-500 text-xs z-10">
            © 1982-2025 RETRO WORKS INC.
          </div>
        </div>
      ) : (
        <RiverRaidGame 
          hasWingman={useWingman} 
          highScores={highScores}
          onGameEnd={handleGameEnd} 
        />
      )}
    </div>
  );
};

export default App;