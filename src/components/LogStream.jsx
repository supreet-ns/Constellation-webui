import React from 'react';
import { Terminal } from 'lucide-react';

const LogStream = ({ logs }) => (
  <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden flex flex-col h-[300px]">
    <div className="px-6 py-3 border-b border-white/10 bg-black/20 text-[10px] font-bold tracking-widest text-slate-400 flex justify-between">
      <span className="flex gap-2"><Terminal size={12}/> OBSERVATORY_LOGS</span>
      <span className="text-cyan-400/70 font-mono">PORT: 23953</span>
    </div>
    <div className="flex-1 overflow-y-auto p-4 font-mono text-[11px] space-y-1 bg-black/10">
      {logs?.map((log, i) => (
        <div key={i} className="flex gap-4 border-b border-white/5 pb-1 hover:bg-white/5 px-1 rounded transition-colors">
          <span className="text-slate-500">{log.time}</span>
          <span className={`font-bold w-16 ${log.level === 'STATUS' ? 'text-cyan-400' : 'text-slate-400'}`}>{log.level}</span>
          <span className="text-purple-300/60 truncate w-24">[{log.sender}]</span>
          <span className="text-slate-300">{log.msg}</span>
        </div>
      ))}
    </div>
  </div>
);
export default LogStream;