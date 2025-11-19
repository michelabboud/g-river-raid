
import React, { useState } from 'react';
import RiverRaidGame from './components/RiverRaidGame';

const App: React.FC = () => {
  const [gameStarted, setGameStarted] = useState(false);

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
      `}</style>

      {!gameStarted ? (
        <div className="relative w-full max-w-2xl p-8 flex flex-col items-center space-y-8 z-10">
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
          
          {/* Main Card */}
          <div className="bg-slate-800/90 border-4 border-slate-200 p-6 rounded-sm shadow-[8px_8px_0_rgba(0,0,0,0.5)] w-full max-w-md backdrop-blur-sm relative z-10">
             <div className="text-center space-y-4">
                <div className="p-4 bg-black/40 border border-slate-600 rounded text-left font-mono text-xs md:text-sm text-slate-300 leading-relaxed">
                  <p className="text-yellow-400 font-bold mb-2">>> MISSION DIRECTIVE:</p>
                  <p>1. PENETRATE ENEMY RIVER DEFENSES.</p>
                  <p>2. NEUTRALIZE HOSTILES: <span className="text-red-400">JETS, CHOPPERS, SUBS</span>.</p>
                  <p>3. MONITOR FUEL LEVELS. REFUEL AT <span className="text-pink-400">CANISTERS</span>.</p>
                  <p>4. DEFEAT THE <span className="text-red-500 font-bold animate-pulse">BOSS</span> AT RIVER'S END.</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm font-bold">
                   <div className="bg-blue-900/50 p-2 border border-blue-700 rounded">
                      <span className="text-blue-300 block text-xs mb-1">ARROWS / WASD</span>
                      MANEUVER
                   </div>
                   <div className="bg-red-900/50 p-2 border border-red-700 rounded">
                      <span className="text-red-300 block text-xs mb-1">SPACE</span>
                      FIRE WEAPONS
                   </div>
                </div>
             </div>
          </div>

          <button
            onClick={() => setGameStarted(true)}
            className="group relative px-12 py-4 bg-yellow-500 text-black font-black text-2xl uppercase tracking-wider hover:bg-yellow-400 active:translate-y-1 transition-all shadow-[0_6px_0_#854d0e] active:shadow-none z-10"
          >
            <span className="absolute inset-0 border-2 border-white opacity-20 group-hover:scale-105 transition-transform"></span>
            Insert Coin / Start
          </button>
          
          <div className="text-slate-500 text-xs z-10">
            © 1982-2025 RETRO WORKS INC.
          </div>
        </div>
      ) : (
        <RiverRaidGame onExit={() => setGameStarted(false)} />
      )}
    </div>
  );
};

export default App;
