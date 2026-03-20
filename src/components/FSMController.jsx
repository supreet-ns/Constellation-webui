import React from 'react';
import { Terminal, Power, Activity, Play, Square, Info } from 'lucide-react';

const FSMController = ({ state, onTransition }) => {
  const guide = {
    INIT: "System initialized. Press [O] to launch satellites into ORBIT.",
    ORBIT: "Satellites configured. Press [R] to RUN and start data acquisition.",
    RUN: "Data acquisition in progress. Press [S] to STOP run.",
    ERROR: "CRITICAL FAILURE. System halted. Requires manual reset."
  };

  return (
    <section className="bg-white/5 backdrop-blur-2xl border border-white/10 border-t-white/20 border-l-white/20 rounded-3xl p-6 shadow-xl relative overflow-hidden">
      <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-4 flex items-center gap-2">
        <Terminal className="w-4 h-4 text-cyan-400" /> Mission Control
      </h3>
      <div className="mb-6 p-3 rounded-2xl border backdrop-blur-md text-xs bg-cyan-500/10 border-cyan-500/30 text-cyan-100 flex gap-3 leading-relaxed">
        <Info className="w-4 h-4 mt-0.5 shrink-0" />
        <p><strong>Guide:</strong> {guide[state]}</p>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <button onClick={() => onTransition('INIT')} disabled={state === 'RUN'} className="group relative p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 disabled:opacity-30 flex flex-col items-center shadow-sm">
          <Power className="w-5 h-5 mb-2 text-slate-400 group-hover:text-white" />
          <span className="text-[10px] font-bold text-slate-300">INITIALIZE</span>
          <kbd className="absolute top-2 right-2 px-1.5 py-0.5 bg-black/30 rounded text-[9px] font-mono">I</kbd>
        </button>
        <button onClick={() => onTransition('ORBIT')} disabled={state === 'RUN'} className={`group relative p-4 rounded-2xl border ${state === 'INIT' ? 'bg-cyan-500/20 border-cyan-400 animate-pulse' : 'bg-white/5 border-white/10'}`}>
          <Activity className="w-5 h-5 mb-2 text-cyan-400" />
          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Orbit</span>
          <kbd className="absolute top-2 right-2 px-1.5 py-0.5 bg-black/30 rounded text-[9px] font-mono">O</kbd>
        </button>
      </div>
      <div className="space-y-3">
        <button onClick={() => onTransition('RUN')} disabled={state !== 'ORBIT'} className={`w-full relative py-4 rounded-2xl font-black text-sm border transition-all ${state === 'ORBIT' ? 'bg-emerald-600/30 text-emerald-100 border-emerald-400 animate-pulse' : 'bg-white/5 border-white/10 opacity-30'}`}>
          <Play className="inline mr-2 fill-current" size={16} /> START ACQUISITION
          <kbd className="absolute right-4 px-2 py-1 bg-black/30 border border-white/10 rounded text-[10px] font-mono">R</kbd>
        </button>
        <button onClick={() => onTransition('ORBIT')} disabled={state !== 'RUN'} className="w-full relative py-4 bg-white/5 hover:bg-amber-500/20 hover:text-amber-300 border border-white/10 rounded-2xl font-black text-sm flex justify-center items-center gap-3 transition-all shadow-sm">
          <Square className="fill-current w-4 h-4" /> STOP RUN
          <kbd className="absolute right-4 px-2 py-1 bg-black/30 border border-white/10 rounded text-[10px] font-mono">S</kbd>
        </button>
      </div>
    </section>
  );
};
export default FSMController;