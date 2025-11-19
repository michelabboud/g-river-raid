import React, { useState } from 'react';
import RiverRaidGame from './components/RiverRaidGame';

const App: React.FC = () => {
  const [gameStarted, setGameStarted] = useState(false);

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-zinc-900 text-zinc-100 font-mono">
      {!gameStarted ? (
        <div className="max-w-md w-full p-8 bg-zinc-800 rounded-xl shadow-2xl border-4 border-zinc-700 text-center space-y-6">
          <h1 className="text-5xl font-black text-yellow-400 tracking-tighter uppercase drop-shadow-md">
            River Raid
          </h1>
          <p className="text-zinc-400 text-sm">
            REMASTERED EDITION
          </p>
          
          <div className="space-y-2 text-left bg-zinc-900/50 p-4 rounded-lg text-sm border border-zinc-700">
            <p className="font-bold text-yellow-200">MISSION BRIEFING:</p>
            <ul className="list-disc list-inside space-y-1 text-zinc-300">
              <li>Fly up the river without crashing.</li>
              <li>Shoot enemies (<span className="text-red-400">Helis, Ships, Jets</span>).</li>
              <li>Destroy bridges to save progress.</li>
              <li>Fly over <span className="text-pink-400">FUEL</span> tanks to refuel.</li>
              <li>Don't run out of fuel!</li>
            </ul>
          </div>

          <div className="space-y-2 text-left bg-zinc-900/50 p-4 rounded-lg text-sm border border-zinc-700">
             <p className="font-bold text-yellow-200">CONTROLS:</p>
             <div className="grid grid-cols-2 gap-2 text-zinc-300">
                <span>WASD / Arrows</span>
                <span className="text-right">Move & Speed</span>
                <span>SPACE</span>
                <span className="text-right">Shoot</span>
             </div>
             <p className="text-xs text-zinc-500 mt-2">* Touch controls available on mobile</p>
          </div>

          <button
            onClick={() => setGameStarted(true)}
            className="w-full py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-xl rounded shadow-[0_4px_0_rgb(161,98,7)] active:shadow-none active:translate-y-1 transition-all uppercase"
          >
            Start Mission
          </button>
        </div>
      ) : (
        <RiverRaidGame onExit={() => setGameStarted(false)} />
      )}
    </div>
  );
};

export default App;