import React, { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Terminal, Activity, Server, AlertCircle, Play, Square, Power, Link, Loader2, Info } from 'lucide-react';

export default function ConstellationCommandCenter() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [globalState, setGlobalState] = useState('INIT'); 
  const [runId, setRunId] = useState('N/A');
  const [runDuration, setRunDuration] = useState(0);

  const [satellites, setSatellites] = useState([
    { id: 'sat-1', name: 'Caribou_Telescope', type: 'Detector', state: 'INIT', ping: 12 },
    { id: 'sat-2', name: 'EudaqNativeWriter', type: 'Storage', state: 'INIT', ping: 8 },
    { id: 'sat-3', name: 'ESP32_EnvMonitor', type: 'IoT_Sensor', state: 'INIT', ping: 45 }
  ]);

  const [telemetry, setTelemetry] = useState([]);
  const [logs, setLogs] = useState([]);

  // CRASH-PROOF: Strict lock prevents double-firing during HMR or fast clicking
  const handleConnect = () => {
    if (isConnecting || isConnected) return; 
    setIsConnecting(true);
    setTimeout(() => {
      setIsConnected(true);
      setIsConnecting(false);
      setLogs(prev => [
        { time: new Date().toLocaleTimeString(), level: 'INFO', sender: 'Network', msg: 'Gateway established at 127.0.0.1:23953' },
        { time: new Date().toLocaleTimeString(), level: 'STATUS', sender: 'Constellation', msg: 'Handshake successful. Connected to CSCP/CMDP core.' },
        ...(prev || [])
      ].slice(0, 50));
    }, 1500);
  };

  const handleTransition = useCallback((newState) => {
    setGlobalState(newState);
    setSatellites(prevSats => prevSats.map(s => ({ ...s, state: newState })));
    
    if (newState === 'RUN') {
      setRunId(`Run_${Math.floor(2000 + Math.random() * 5000)}`);
      setRunDuration(0);
      setTelemetry([]);
    }
    
    setLogs(prev => [{
      time: new Date().toLocaleTimeString(),
      level: newState === 'ERROR' ? 'CRITICAL' : 'STATUS',
      sender: 'MissionControl',
      msg: `FSM Transition: -> ${newState}`
    }, ...(prev || [])].slice(0, 50));
  }, []);

  useEffect(() => {
    if (!isConnected) return;
    const heartbeat = setInterval(() => {
      setSatellites(prev => prev.map(sat => ({
        ...sat,
        ping: globalState === 'ERROR' ? 0 : Math.max(2, sat.ping + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 5))
      })));
    }, 2000);
    return () => clearInterval(heartbeat);
  }, [globalState, isConnected]);

  useEffect(() => {
    let interval;
    if (globalState === 'RUN') {
      interval = setInterval(() => {
        setRunDuration(prev => prev + 1);
        setTelemetry(prev => {
          const newPoint = {
            time: new Date().toLocaleTimeString([], { hour12: false, second: '2-digit', minute:'2-digit' }),
            eventRate: Math.floor(1100 + Math.random() * 200),
            temp: +(25 + Math.random() * 1.5).toFixed(1)
          };
          return [...(prev || []), newPoint].slice(-15);
        });

        if (Math.random() > 0.7) {
          setLogs(prev => [{
            time: new Date().toLocaleTimeString(),
            level: 'INFO',
            sender: 'Storage',
            msg: 'Event packet synchronized and written to disk.'
          }, ...(prev || [])].slice(0, 50));
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [globalState]);

  useEffect(() => {
    if (!isConnected) return;
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      const key = e.key.toLowerCase();
      if (key === 'i' && globalState !== 'RUN') handleTransition('INIT');
      if (key === 'o' && globalState !== 'RUN') handleTransition('ORBIT');
      if (key === 'r' && globalState === 'ORBIT') handleTransition('RUN');
      if (key === 's' && globalState === 'RUN') handleTransition('ORBIT');
      if (key === 'e' && globalState !== 'ERROR') handleTransition('ERROR');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isConnected, globalState, handleTransition]);

  const getStateColor = (state) => {
    const colors = {
      RUN: 'text-emerald-300 bg-emerald-400/10 border-emerald-400/30 shadow-[0_0_15px_rgba(52,211,153,0.2)]',
      ORBIT: 'text-cyan-300 bg-cyan-400/10 border-cyan-400/30 shadow-[0_0_15px_rgba(34,211,238,0.2)]',
      INIT: 'text-slate-300 bg-white/5 border-white/10',
      ERROR: 'text-rose-300 bg-rose-400/10 border-rose-400/30 shadow-[0_0_15px_rgba(251,113,133,0.2)]'
    };
    return colors[state] || 'text-slate-400 bg-white/5 border-white/10';
  };

  const getOperatorGuide = () => {
    switch(globalState) {
      case 'INIT': return "System initialized. Press [O] to launch satellites into ORBIT.";
      case 'ORBIT': return "Satellites configured. Press [R] to START ACQUISITION.";
      case 'RUN': return "Data acquisition in progress. Press [S] to STOP run.";
      case 'ERROR': return "CRITICAL FAILURE DETECTED. System halted. Require manual reset.";
      default: return "Awaiting operator input.";
    }
  };

  return (
    // Base layer: Deep cosmic blue/black to let the glass pop
    <div className="min-h-screen bg-[#060913] text-slate-200 p-4 md:p-8 font-sans selection:bg-cyan-500/30 relative overflow-hidden">
      
      {/* AMBIENT LIGHT ORBS (The secret to Glassmorphism) */}
      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen"></div>
      <div className="absolute top-[40%] left-[40%] w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>

      {/* Connection Modal (Glass) */}
      {!isConnected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#060913]/40 backdrop-blur-md p-4">
          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 border-t-white/20 border-l-white/20 p-8 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] max-w-sm w-full text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-50 pointer-events-none"></div>
            <div className="bg-blue-500/20 border border-blue-500/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
              <Link className={`w-8 h-8 text-blue-300 ${isConnecting ? 'animate-pulse' : ''}`} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2 relative z-10">Constellation Core</h2>
            <p className="text-slate-300 text-sm mb-8 relative z-10">Establish secure bridge to hardware satellites and monitoring systems.</p>
            <button 
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-full py-3 bg-blue-500/20 hover:bg-blue-500/40 border border-blue-400/30 text-blue-200 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(59,130,246,0.2)] disabled:opacity-50 relative z-10"
            >
              {isConnecting ? <><Loader2 className="animate-spin w-5 h-5" /> Establishing...</> : 'Connect to WebUI'}
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 pb-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-[0_4px_16px_rgba(0,0,0,0.2)]">
              <Activity className={`w-8 h-8 ${globalState === 'RUN' ? 'text-emerald-400 animate-pulse drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'text-blue-400'}`} />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight drop-shadow-md">CONSTELLATION <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">2026</span></h1>
              <div className="flex items-center gap-2 text-[10px] text-slate-400 uppercase font-bold tracking-[0.2em]">
                <span className={`w-2 h-2 rounded-full ${globalState === 'RUN' ? 'bg-emerald-400 animate-ping shadow-[0_0_8px_#34d399]' : 'bg-slate-500'}`}></span>
                Live Cluster Monitoring
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white/5 backdrop-blur-xl p-2 rounded-2xl border border-white/10 border-t-white/20 shadow-[0_4px_16px_rgba(0,0,0,0.2)]">
            <div className="px-4 text-center">
              <p className="text-[10px] text-slate-400 uppercase font-bold">Active Run</p>
              <p className="font-mono text-sm text-white font-bold">{runId}</p>
            </div>
            <div className="h-8 w-px bg-white/10"></div>
            <div className="px-4 text-center">
              <p className="text-[10px] text-slate-400 uppercase font-bold">Uptime</p>
              <p className="font-mono text-sm text-white font-bold">{runDuration}s</p>
            </div>
            <div className={`ml-2 px-4 py-2 rounded-xl border backdrop-blur-md text-xs font-black tracking-widest ${getStateColor(globalState)}`}>
              {globalState}
            </div>
          </div>
        </header>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-4 space-y-6">
            
            {/* GLASS PANEL: Mission Control */}
            <section className="bg-white/5 backdrop-blur-2xl border border-white/10 border-t-white/20 border-l-white/20 rounded-3xl p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30 pointer-events-none"></div>
              
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-4 flex items-center gap-2 relative z-10">
                <Terminal className="w-4 h-4 text-cyan-400" /> Mission Control
              </h3>

              <div className={`mb-6 p-3 rounded-2xl border backdrop-blur-md text-xs leading-relaxed flex items-start gap-3 transition-colors duration-500 relative z-10 ${globalState === 'ERROR' ? 'bg-rose-500/10 border-rose-500/30 text-rose-200' : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-100'}`}>
                <Info className="w-4 h-4 mt-0.5 shrink-0" />
                <p><strong>Operator Guide:</strong> {getOperatorGuide()}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
                <button 
                  onClick={() => handleTransition('INIT')} 
                  disabled={globalState === 'RUN'}
                  className="group relative p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all disabled:opacity-30 flex flex-col items-center justify-center backdrop-blur-md shadow-sm">
                  <kbd className="absolute top-2 right-2 px-1.5 py-0.5 bg-black/30 border border-white/10 rounded text-[10px] text-slate-400 font-mono">I</kbd>
                  <Power className="w-5 h-5 mb-2 text-slate-400 group-hover:text-white transition-colors" />
                  <span className="block text-xs font-bold text-slate-300 group-hover:text-white transition-colors">INITIALIZE</span>
                </button>
                
                <button 
                  onClick={() => handleTransition('ORBIT')} 
                  disabled={globalState === 'RUN'}
                  className={`group relative p-4 rounded-2xl transition-all flex flex-col items-center justify-center border backdrop-blur-md shadow-sm disabled:opacity-30 ${
                    globalState === 'INIT' 
                    ? 'bg-cyan-500/20 border-cyan-400/50 shadow-[0_0_20px_rgba(34,211,238,0.3)] animate-pulse hover:bg-cyan-500/30 text-cyan-100' 
                    : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300 hover:text-cyan-200'
                  }`}>
                  <kbd className={`absolute top-2 right-2 px-1.5 py-0.5 border rounded text-[10px] font-mono ${globalState === 'INIT' ? 'bg-cyan-900/50 border-cyan-400/50 text-cyan-200' : 'bg-black/30 border-white/10 text-slate-400'}`}>O</kbd>
                  <Activity className="w-5 h-5 mb-2" />
                  <span className="block text-xs font-bold">ORBIT</span>
                </button>
              </div>

              <div className="space-y-3 relative z-10">
                <button 
                  onClick={() => handleTransition('RUN')} 
                  disabled={globalState !== 'ORBIT'}
                  className={`w-full relative py-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-3 disabled:grayscale disabled:opacity-30 border backdrop-blur-md ${
                    globalState === 'ORBIT'
                    ? 'bg-emerald-500/30 text-emerald-100 border-emerald-400/60 shadow-[0_0_30px_rgba(52,211,153,0.4)] animate-pulse hover:bg-emerald-500/40'
                    : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:text-white'
                  }`}>
                  <Play className="fill-current w-4 h-4" /> START ACQUISITION
                  <kbd className="absolute right-4 px-2 py-1 bg-black/30 border border-white/20 rounded text-[10px] text-white/70 font-mono">R</kbd>
                </button>
                
                <button 
                  onClick={() => handleTransition('ORBIT')} 
                  disabled={globalState !== 'RUN'}
                  className="w-full relative py-4 bg-white/5 hover:bg-amber-500/20 hover:text-amber-300 border border-white/10 hover:border-amber-500/30 text-slate-300 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-3 disabled:opacity-30 backdrop-blur-md shadow-sm">
                  <Square className="fill-current w-4 h-4" /> STOP RUN
                  <kbd className="absolute right-4 px-2 py-1 bg-black/30 border border-white/10 rounded text-[10px] text-slate-400 font-mono">S</kbd>
                </button>
              </div>

              <button 
                onClick={() => handleTransition('ERROR')}
                className="mt-6 relative w-full py-2 text-[10px] font-bold text-rose-400 hover:text-rose-200 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 hover:border-rose-400/50 rounded-xl transition-all flex items-center justify-center backdrop-blur-md">
                INJECT CRITICAL FAILURE
                <kbd className="absolute right-2 px-1.5 py-0.5 bg-black/40 border border-rose-500/30 rounded text-[9px] text-rose-300 font-mono">E</kbd>
              </button>
            </section>

            {/* GLASS PANEL: Satellites */}
            <section className="bg-white/5 backdrop-blur-2xl border border-white/10 border-t-white/20 border-l-white/20 rounded-3xl p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30 pointer-events-none"></div>
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-6 flex items-center gap-2 relative z-10">
                <Server className="w-4 h-4 text-purple-400" /> Cluster Satellites
              </h3>
              <div className="space-y-3 relative z-10">
                {satellites?.map(sat => {
                  if (!sat) return null; // Defensive render
                  return (
                    <div key={sat.id} className="group p-4 bg-black/20 border border-white/5 rounded-2xl flex justify-between items-center hover:bg-white/5 hover:border-white/20 transition-all shadow-inner backdrop-blur-md">
                      <div>
                        <p className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">{sat.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono tracking-tighter uppercase">{sat.type}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-[9px] px-2 py-1 rounded font-black tracking-tighter backdrop-blur-md ${getStateColor(sat.state)}`}>
                          {sat.state}
                        </span>
                        <p className={`text-[10px] font-mono mt-1.5 ${sat.ping === 0 ? 'text-rose-400 animate-pulse font-bold drop-shadow-[0_0_5px_rgba(251,113,133,0.8)]' : 'text-slate-400'}`}>
                          {sat.ping === 0 ? 'OFFLINE' : `${sat.ping}ms`}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          <div className="col-span-12 lg:col-span-8 space-y-6">
            
            {/* GLASS PANEL: Telemetry Graph */}
            <section className="bg-white/5 backdrop-blur-2xl border border-white/10 border-t-white/20 border-l-white/20 rounded-3xl p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] h-[400px] flex flex-col relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30 pointer-events-none"></div>
              <div className="flex justify-between items-center mb-6 relative z-10">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" /> CMDP Telemetry Stream
                </h3>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]"></span><span className="text-[10px] text-slate-300 uppercase font-bold">Event Rate</span></div>
                  <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]"></span><span className="text-[10px] text-slate-300 uppercase font-bold">Temp</span></div>
                </div>
              </div>
              
              <div className="flex-1 relative z-10 w-full h-full">
                {globalState !== 'RUN' && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 backdrop-blur-md rounded-2xl border border-white/10">
                    <p className={`text-sm font-bold tracking-widest uppercase flex items-center gap-2 ${globalState === 'ERROR' ? 'text-rose-400 drop-shadow-[0_0_5px_rgba(251,113,133,0.5)]' : 'text-slate-400'}`}>
                      <AlertCircle className="w-4 h-4" /> 
                      {globalState === 'ERROR' ? 'SYSTEM HALTED' : 'Hardware Idle - Awaiting RUN'}
                    </p>
                  </div>
                )}
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={telemetry}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickMargin={10} tickLine={false} axisLine={false} />
                    <YAxis yAxisId="L" stroke="#94a3b8" fontSize={10} domain={[1000, 1500]} tickLine={false} axisLine={false} />
                    <YAxis yAxisId="R" orientation="right" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', fontSize: '10px', color: '#f1f5f9', boxShadow: '0 8px 32px 0 rgba(0,0,0,0.5)' }} />
                    <Line yAxisId="L" type="stepAfter" dataKey="eventRate" stroke="#22d3ee" strokeWidth={3} dot={false} isAnimationActive={false} style={{ filter: 'drop-shadow(0px 0px 5px rgba(34,211,238,0.5))' }} />
                    <Line yAxisId="R" type="monotone" dataKey="temp" stroke="#fbbf24" strokeWidth={3} dot={false} isAnimationActive={false} style={{ filter: 'drop-shadow(0px 0px 5px rgba(251,191,36,0.5))' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* GLASS PANEL: Logs */}
            <section className="bg-white/5 backdrop-blur-2xl border border-white/10 border-t-white/20 border-l-white/20 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] flex flex-col h-[300px] overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30 pointer-events-none z-0"></div>
              <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-black/20 relative z-10">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-slate-400" /> Observatory Logs
                </h3>
                <div className="text-[10px] font-mono text-cyan-300 tracking-tighter bg-cyan-900/30 px-2 py-1 rounded border border-cyan-500/30 shadow-sm backdrop-blur-md">LISTENING ON PORT 23953</div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 font-mono text-[11px] leading-relaxed space-y-1 scrollbar-hide relative z-10 bg-black/10">
                {logs?.map((log, i) => {
                  if (!log) return null; // Defensive render
                  return (
                    <div key={i} className="flex gap-4 py-1.5 border-b border-white/5 hover:bg-white/10 px-2 rounded transition-colors">
                      <span className="text-slate-500 shrink-0">{log.time}</span>
                      <span className={`font-black shrink-0 w-16 ${log?.level === 'CRITICAL' ? 'text-rose-400 animate-pulse drop-shadow-[0_0_5px_rgba(251,113,133,0.8)]' : log?.level === 'WARNING' ? 'text-amber-400' : log?.level === 'STATUS' ? 'text-cyan-400' : 'text-emerald-400'}`}>{log?.level}</span>
                      <span className="text-purple-300/80 shrink-0 w-24">[{log?.sender}]</span>
                      <span className="text-slate-200 font-medium">{log?.msg}</span>
                    </div>
                  );
                })}
                {logs.length === 0 && <p className="text-slate-500 italic">No logs in buffer...</p>}
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}