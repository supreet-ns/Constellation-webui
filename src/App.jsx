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

  const handleConnect = () => {
    setIsConnecting(true);
    setTimeout(() => {
      setIsConnected(true);
      setIsConnecting(false);
      setLogs(prev => [
        { time: new Date().toLocaleTimeString(), level: 'INFO', sender: 'Network', msg: 'Gateway established at 127.0.0.1:23953' },
        { time: new Date().toLocaleTimeString(), level: 'STATUS', sender: 'Constellation', msg: 'Handshake successful. Connected to CSCP/CMDP core.' },
        ...prev
      ]);
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
    }, ...prev].slice(0, 50));
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
          return [...prev, newPoint].slice(-15);
        });

        if (Math.random() > 0.7) {
          setLogs(prev => [{
            time: new Date().toLocaleTimeString(),
            level: 'INFO',
            sender: 'Storage',
            msg: 'Event packet synchronized and written to disk.'
          }, ...prev].slice(0, 50));
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
      RUN: 'text-emerald-300 bg-emerald-900/40 border-emerald-500/50',
      ORBIT: 'text-blue-300 bg-blue-900/40 border-blue-500/50',
      INIT: 'text-slate-300 bg-slate-600/40 border-slate-500',
      ERROR: 'text-rose-300 bg-rose-900/40 border-rose-500/50'
    };
    return colors[state] || 'text-slate-400 bg-slate-700 border-slate-600';
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
    // Twilight Background: slate-800 instead of black or white
    <div className="min-h-screen bg-slate-800 text-slate-200 p-4 md:p-8 font-sans selection:bg-blue-500/30">
      
      {!isConnected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-md">
          {/* Modals are slightly lighter: slate-700 */}
          <div className="bg-slate-700 border border-slate-600 p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center">
            <div className="bg-blue-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <Link className={`w-8 h-8 text-blue-400 ${isConnecting ? 'animate-pulse' : ''}`} />
            </div>
            <h2 className="text-2xl font-bold text-slate-100 mb-2">Constellation Core</h2>
            <p className="text-slate-400 text-sm mb-8">Establish secure bridge to hardware satellites and monitoring systems.</p>
            <button 
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
            >
              {isConnecting ? <><Loader2 className="animate-spin w-5 h-5" /> Establishing...</> : 'Connect to WebUI'}
            </button>
          </div>
        </div>
      )}

      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-slate-700 pb-6">
        <div className="flex items-center gap-4">
          <div className={`p-2 rounded-lg bg-slate-700 border border-slate-600 shadow-sm`}>
            <Activity className={`w-8 h-8 ${globalState === 'RUN' ? 'text-emerald-400 animate-pulse' : 'text-blue-400'}`} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">CONSTELLATION <span className="text-blue-400">2026</span></h1>
            <div className="flex items-center gap-2 text-[10px] text-slate-400 uppercase font-bold tracking-[0.2em]">
              <span className={`w-2 h-2 rounded-full ${globalState === 'RUN' ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`}></span>
              Live Cluster Monitoring
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-slate-700/50 p-2 rounded-2xl border border-slate-600 shadow-sm">
          <div className="px-4 text-center">
            <p className="text-[10px] text-slate-400 uppercase font-bold">Active Run</p>
            <p className="font-mono text-sm text-slate-100 font-bold">{runId}</p>
          </div>
          <div className="h-8 w-px bg-slate-600"></div>
          <div className="px-4 text-center">
            <p className="text-[10px] text-slate-400 uppercase font-bold">Uptime</p>
            <p className="font-mono text-sm text-slate-100 font-bold">{runDuration}s</p>
          </div>
          <div className={`ml-2 px-4 py-2 rounded-xl border text-xs font-black tracking-widest ${getStateColor(globalState)}`}>
            {globalState}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-4 space-y-6">
          
          {/* UI Cards are slate-700 to pop slightly off the slate-800 background */}
          <section className="bg-slate-700 border border-slate-600 rounded-2xl p-6 shadow-md relative overflow-hidden">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-blue-400" /> Mission Control
            </h3>

            <div className={`mb-6 p-3 rounded-xl border text-xs leading-relaxed flex items-start gap-3 transition-colors duration-500 ${globalState === 'ERROR' ? 'bg-rose-900/30 border-rose-500/30 text-rose-200' : 'bg-blue-900/30 border-blue-500/30 text-blue-200'}`}>
              <Info className="w-4 h-4 mt-0.5 shrink-0" />
              <p><strong>Operator Guide:</strong> {getOperatorGuide()}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button 
                onClick={() => handleTransition('INIT')} 
                disabled={globalState === 'RUN'}
                className="group relative p-4 bg-slate-800 hover:bg-slate-600 border border-slate-600 rounded-xl transition-all disabled:opacity-40 flex flex-col items-center justify-center shadow-sm">
                <kbd className="absolute top-2 right-2 px-1.5 py-0.5 bg-slate-700 border border-slate-500 rounded text-[10px] text-slate-300 font-mono">I</kbd>
                <Power className="w-5 h-5 mb-2 text-slate-400 group-hover:text-slate-200 transition-colors" />
                <span className="block text-xs font-bold text-slate-300">INITIALIZE</span>
              </button>
              
              <button 
                onClick={() => handleTransition('ORBIT')} 
                disabled={globalState === 'RUN'}
                className={`group relative p-4 rounded-xl transition-all flex flex-col items-center justify-center border shadow-sm disabled:opacity-40 ${
                  globalState === 'INIT' 
                  ? 'bg-blue-600/30 border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)] animate-pulse hover:bg-blue-600/40 text-blue-200' 
                  : 'bg-slate-800 hover:bg-blue-900/30 border-slate-600 hover:border-blue-500/50 text-slate-400 hover:text-blue-300'
                }`}>
                <kbd className={`absolute top-2 right-2 px-1.5 py-0.5 border rounded text-[10px] font-mono ${globalState === 'INIT' ? 'bg-blue-900/50 border-blue-400 text-blue-200' : 'bg-slate-700 border-slate-500 text-slate-400'}`}>O</kbd>
                <Activity className="w-5 h-5 mb-2" />
                <span className="block text-xs font-bold">ORBIT</span>
              </button>
            </div>

            <div className="space-y-3">
              <button 
                onClick={() => handleTransition('RUN')} 
                disabled={globalState !== 'ORBIT'}
                className={`w-full relative py-4 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-3 disabled:grayscale disabled:opacity-40 border ${
                  globalState === 'ORBIT'
                  ? 'bg-emerald-600 text-white border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)] animate-pulse hover:bg-emerald-500'
                  : 'bg-emerald-600 text-white border-emerald-500 shadow-md hover:bg-emerald-500'
                }`}>
                <Play className="fill-current w-4 h-4" /> START ACQUISITION
                <kbd className="absolute right-4 px-2 py-1 bg-black/20 border border-white/20 rounded text-[10px] text-white/90 font-mono">R</kbd>
              </button>
              
              <button 
                onClick={() => handleTransition('ORBIT')} 
                disabled={globalState !== 'RUN'}
                className="w-full relative py-4 bg-slate-800 hover:bg-amber-900/30 hover:text-amber-400 border border-slate-600 hover:border-amber-500/50 text-slate-400 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-3 disabled:opacity-40 shadow-sm">
                <Square className="fill-current w-4 h-4" /> STOP RUN
                <kbd className="absolute right-4 px-2 py-1 bg-slate-700 border border-slate-500 rounded text-[10px] text-slate-400 font-mono">S</kbd>
              </button>
            </div>

            <button 
              onClick={() => handleTransition('ERROR')}
              className="mt-6 relative w-full py-2 text-[10px] font-bold text-rose-400 hover:text-rose-300 bg-rose-900/20 hover:bg-rose-900/40 border border-rose-500/30 hover:border-rose-400 rounded-lg transition-all flex items-center justify-center">
              INJECT CRITICAL FAILURE
              <kbd className="absolute right-2 px-1.5 py-0.5 bg-rose-950 border border-rose-800 rounded text-[9px] text-rose-400 font-mono">E</kbd>
            </button>
          </section>

          <section className="bg-slate-700 border border-slate-600 rounded-2xl p-6 shadow-md">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Server className="w-4 h-4 text-purple-400" /> Cluster Satellites
            </h3>
            <div className="space-y-3">
              {satellites.map(sat => (
                <div key={sat.id} className="group p-4 bg-slate-800 border border-slate-600 rounded-xl flex justify-between items-center hover:border-slate-500 transition-all shadow-sm">
                  <div>
                    <p className="text-sm font-bold text-slate-200">{sat.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono tracking-tighter uppercase">{sat.type}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-[9px] px-2 py-1 rounded font-black tracking-tighter ${getStateColor(sat.state)}`}>
                      {sat.state}
                    </span>
                    <p className={`text-[10px] font-mono mt-1 ${sat.ping === 0 ? 'text-rose-400 animate-pulse font-bold' : 'text-slate-400'}`}>
                      {sat.ping === 0 ? 'OFFLINE' : `${sat.ping}ms`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="col-span-12 lg:col-span-8 space-y-6">
          <section className="bg-slate-700 border border-slate-600 rounded-2xl p-6 shadow-md h-[400px] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" /> CMDP Telemetry Stream
              </h3>
              <div className="flex gap-4">
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-400"></span><span className="text-[10px] text-slate-300 uppercase font-bold">Event Rate</span></div>
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-400"></span><span className="text-[10px] text-slate-300 uppercase font-bold">Temp</span></div>
              </div>
            </div>
            
            <div className="flex-1 relative">
              {globalState !== 'RUN' && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-800/60 backdrop-blur-sm rounded-xl border border-dashed border-slate-600">
                  <p className={`text-sm font-bold tracking-widest uppercase flex items-center gap-2 ${globalState === 'ERROR' ? 'text-rose-400' : 'text-slate-400'}`}>
                    <AlertCircle className="w-4 h-4" /> 
                    {globalState === 'ERROR' ? 'SYSTEM HALTED' : 'Hardware Idle - Awaiting RUN'}
                  </p>
                </div>
              )}
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={telemetry}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" vertical={false} />
                  <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickMargin={10} />
                  <YAxis yAxisId="L" stroke="#94a3b8" fontSize={10} domain={[1000, 1500]} />
                  <YAxis yAxisId="R" orientation="right" stroke="#94a3b8" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '12px', fontSize: '10px', color: '#f1f5f9' }} />
                  <Line yAxisId="L" type="stepAfter" dataKey="eventRate" stroke="#60a5fa" strokeWidth={3} dot={false} isAnimationActive={false} />
                  <Line yAxisId="R" type="monotone" dataKey="temp" stroke="#fbbf24" strokeWidth={3} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="bg-slate-800 border border-slate-600 rounded-2xl shadow-md flex flex-col h-[300px] overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-600 flex justify-between items-center bg-slate-700/50">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                <Terminal className="w-4 h-4 text-slate-400" /> Observatory Logs
              </h3>
              <div className="text-[10px] font-mono text-slate-300 tracking-tighter bg-slate-900 px-2 py-1 rounded border border-slate-700 shadow-sm">LISTENING ON PORT 23953</div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 font-mono text-[11px] leading-relaxed space-y-1 scrollbar-hide shadow-inner">
              {logs.map((log, i) => (
                <div key={i} className="flex gap-4 py-1.5 border-b border-slate-700 hover:bg-slate-700/50 px-2 rounded transition-colors">
                  <span className="text-slate-500 shrink-0">{log.time}</span>
                  <span className={`font-black shrink-0 w-16 ${log.level === 'CRITICAL' ? 'text-rose-400 animate-pulse' : log.level === 'WARNING' ? 'text-amber-400' : log.level === 'STATUS' ? 'text-blue-400' : 'text-emerald-400'}`}>{log.level}</span>
                  <span className="text-purple-400 shrink-0 w-24">[{log.sender}]</span>
                  <span className="text-slate-300 font-medium">{log.msg}</span>
                </div>
              ))}
              {logs.length === 0 && <p className="text-slate-500 italic">No logs in buffer...</p>}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}