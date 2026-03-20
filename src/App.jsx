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
      RUN: 'text-emerald-700 bg-emerald-100 border-emerald-300',
      ORBIT: 'text-blue-700 bg-blue-100 border-blue-300',
      INIT: 'text-stone-600 bg-stone-200 border-stone-300',
      ERROR: 'text-rose-700 bg-rose-100 border-rose-300'
    };
    return colors[state] || 'text-stone-500 bg-stone-100 border-stone-200';
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
    <div className="min-h-screen bg-[#f4efe6] text-stone-800 p-4 md:p-8 font-sans selection:bg-orange-200">
      
      {!isConnected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#f4efe6]/80 backdrop-blur-md">
          <div className="bg-[#fdfcf7] border border-[#e6dfd3] p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center">
            <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <Link className={`w-8 h-8 text-blue-600 ${isConnecting ? 'animate-pulse' : ''}`} />
            </div>
            <h2 className="text-2xl font-bold text-stone-900 mb-2">Constellation Core</h2>
            <p className="text-stone-500 text-sm mb-8">Establish secure bridge to hardware satellites and monitoring systems.</p>
            <button 
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 disabled:opacity-50"
            >
              {isConnecting ? <><Loader2 className="animate-spin w-5 h-5" /> Establishing...</> : 'Connect to WebUI'}
            </button>
          </div>
        </div>
      )}

      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-[#e6dfd3] pb-6">
        <div className="flex items-center gap-4">
          <div className={`p-2 rounded-lg bg-[#fdfcf7] border border-[#e6dfd3] shadow-sm`}>
            <Activity className={`w-8 h-8 ${globalState === 'RUN' ? 'text-emerald-600 animate-pulse' : 'text-blue-600'}`} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">CONSTELLATION <span className="text-blue-600">2026</span></h1>
            <div className="flex items-center gap-2 text-[10px] text-stone-500 uppercase font-bold tracking-[0.2em]">
              <span className={`w-2 h-2 rounded-full ${globalState === 'RUN' ? 'bg-emerald-500 animate-ping' : 'bg-stone-400'}`}></span>
              Live Cluster Monitoring
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-[#fcfbfa] p-2 rounded-2xl border border-[#e6dfd3] shadow-sm">
          <div className="px-4 text-center">
            <p className="text-[10px] text-stone-500 uppercase font-bold">Active Run</p>
            <p className="font-mono text-sm text-stone-900 font-bold">{runId}</p>
          </div>
          <div className="h-8 w-px bg-[#e6dfd3]"></div>
          <div className="px-4 text-center">
            <p className="text-[10px] text-stone-500 uppercase font-bold">Uptime</p>
            <p className="font-mono text-sm text-stone-900 font-bold">{runDuration}s</p>
          </div>
          <div className={`ml-2 px-4 py-2 rounded-xl border text-xs font-black tracking-widest ${getStateColor(globalState)}`}>
            {globalState}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-4 space-y-6">
          
          <section className="bg-[#fdfcf7] border border-[#e6dfd3] rounded-2xl p-6 shadow-md shadow-orange-900/5 relative overflow-hidden">
            <h3 className="text-sm font-bold text-stone-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-blue-600" /> Mission Control
            </h3>

            <div className={`mb-6 p-3 rounded-xl border text-xs leading-relaxed flex items-start gap-3 transition-colors duration-500 ${globalState === 'ERROR' ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-blue-50 border-blue-200 text-blue-800'}`}>
              <Info className="w-4 h-4 mt-0.5 shrink-0" />
              <p><strong>Operator Guide:</strong> {getOperatorGuide()}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button 
                onClick={() => handleTransition('INIT')} 
                disabled={globalState === 'RUN'}
                className="group relative p-4 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl transition-all disabled:opacity-40 flex flex-col items-center justify-center shadow-sm">
                <kbd className="absolute top-2 right-2 px-1.5 py-0.5 bg-stone-200 border border-stone-300 rounded text-[10px] text-stone-500 font-mono">I</kbd>
                <Power className="w-5 h-5 mb-2 text-stone-500 group-hover:text-stone-800 transition-colors" />
                <span className="block text-xs font-bold text-stone-600">INITIALIZE</span>
              </button>
              
              <button 
                onClick={() => handleTransition('ORBIT')} 
                disabled={globalState === 'RUN'}
                className={`group relative p-4 rounded-xl transition-all flex flex-col items-center justify-center border shadow-sm disabled:opacity-40 ${
                  globalState === 'INIT' 
                  ? 'bg-blue-100 border-blue-400 shadow-[0_0_15px_rgba(37,99,235,0.2)] animate-pulse hover:bg-blue-200 text-blue-800' 
                  : 'bg-stone-50 hover:bg-blue-50 border-stone-200 hover:border-blue-200 text-stone-600 hover:text-blue-700'
                }`}>
                <kbd className={`absolute top-2 right-2 px-1.5 py-0.5 border rounded text-[10px] font-mono ${globalState === 'INIT' ? 'bg-blue-50 border-blue-300 text-blue-600' : 'bg-stone-200 border-stone-300 text-stone-500'}`}>O</kbd>
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
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)] animate-pulse hover:bg-emerald-700'
                  : 'bg-emerald-600 text-white border-emerald-700 shadow-md shadow-emerald-900/10 hover:bg-emerald-700'
                }`}>
                <Play className="fill-current w-4 h-4" /> START ACQUISITION
                <kbd className="absolute right-4 px-2 py-1 bg-black/10 border border-white/20 rounded text-[10px] text-white/90 font-mono">R</kbd>
              </button>
              
              <button 
                onClick={() => handleTransition('ORBIT')} 
                disabled={globalState !== 'RUN'}
                className="w-full relative py-4 bg-stone-50 hover:bg-amber-50 hover:text-amber-700 border border-stone-200 hover:border-amber-300 text-stone-600 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-3 disabled:opacity-40 shadow-sm">
                <Square className="fill-current w-4 h-4" /> STOP RUN
                <kbd className="absolute right-4 px-2 py-1 bg-stone-200 border border-stone-300 rounded text-[10px] text-stone-500 font-mono">S</kbd>
              </button>
            </div>

            <button 
              onClick={() => handleTransition('ERROR')}
              className="mt-6 relative w-full py-2 text-[10px] font-bold text-rose-500 hover:text-rose-700 bg-rose-50/50 hover:bg-rose-100 border border-rose-200 hover:border-rose-300 rounded-lg transition-all flex items-center justify-center">
              INJECT CRITICAL FAILURE
              <kbd className="absolute right-2 px-1.5 py-0.5 bg-rose-100 border border-rose-200 rounded text-[9px] text-rose-600 font-mono">E</kbd>
            </button>
          </section>

          <section className="bg-[#fdfcf7] border border-[#e6dfd3] rounded-2xl p-6 shadow-md shadow-orange-900/5">
            <h3 className="text-sm font-bold text-stone-500 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Server className="w-4 h-4 text-purple-600" /> Cluster Satellites
            </h3>
            <div className="space-y-3">
              {satellites.map(sat => (
                <div key={sat.id} className="group p-4 bg-[#f8f5ee] border border-[#e6dfd3] rounded-xl flex justify-between items-center hover:border-orange-900/20 transition-all shadow-sm">
                  <div>
                    <p className="text-sm font-bold text-stone-800">{sat.name}</p>
                    <p className="text-[10px] text-stone-500 font-mono tracking-tighter uppercase">{sat.type}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-[9px] px-2 py-1 rounded font-black tracking-tighter ${getStateColor(sat.state)}`}>
                      {sat.state}
                    </span>
                    <p className={`text-[10px] font-mono mt-1 ${sat.ping === 0 ? 'text-rose-600 animate-pulse font-bold' : 'text-stone-500'}`}>
                      {sat.ping === 0 ? 'OFFLINE' : `${sat.ping}ms`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="col-span-12 lg:col-span-8 space-y-6">
          <section className="bg-[#fdfcf7] border border-[#e6dfd3] rounded-2xl p-6 shadow-md shadow-orange-900/5 h-[400px] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-stone-500 uppercase tracking-widest flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-600" /> CMDP Telemetry Stream
              </h3>
              <div className="flex gap-4">
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-600"></span><span className="text-[10px] text-stone-600 uppercase font-bold">Event Rate</span></div>
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-orange-600"></span><span className="text-[10px] text-stone-600 uppercase font-bold">Temp</span></div>
              </div>
            </div>
            
            <div className="flex-1 relative">
              {globalState !== 'RUN' && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#fdfcf7]/60 backdrop-blur-sm rounded-xl border border-dashed border-[#e6dfd3]">
                  <p className={`text-sm font-bold tracking-widest uppercase flex items-center gap-2 ${globalState === 'ERROR' ? 'text-rose-600' : 'text-stone-500'}`}>
                    <AlertCircle className="w-4 h-4" /> 
                    {globalState === 'ERROR' ? 'SYSTEM HALTED' : 'Hardware Idle - Awaiting RUN'}
                  </p>
                </div>
              )}
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={telemetry}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
                  <XAxis dataKey="time" stroke="#78716c" fontSize={10} tickMargin={10} />
                  <YAxis yAxisId="L" stroke="#78716c" fontSize={10} domain={[1000, 1500]} />
                  <YAxis yAxisId="R" orientation="right" stroke="#78716c" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e7e5e4', borderRadius: '12px', fontSize: '10px', color: '#1c1917' }} />
                  <Line yAxisId="L" type="stepAfter" dataKey="eventRate" stroke="#2563eb" strokeWidth={3} dot={false} isAnimationActive={false} />
                  <Line yAxisId="R" type="monotone" dataKey="temp" stroke="#ea580c" strokeWidth={3} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="bg-[#fcfbfa] border border-[#e6dfd3] rounded-2xl shadow-md shadow-orange-900/5 flex flex-col h-[300px] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#e6dfd3] flex justify-between items-center bg-[#f5f0e6]/50">
              <h3 className="text-sm font-bold text-stone-600 uppercase tracking-widest flex items-center gap-2">
                <Terminal className="w-4 h-4 text-stone-500" /> Observatory Logs
              </h3>
              <div className="text-[10px] font-mono text-stone-500 tracking-tighter bg-white px-2 py-1 rounded border border-stone-200 shadow-sm">LISTENING ON PORT 23953</div>
            </div>
            {/* Inner log container styled like a subtle physical paper logbook */}
            <div className="flex-1 overflow-y-auto p-4 font-mono text-[11px] leading-relaxed space-y-1 scrollbar-hide bg-[#fdfcf7] shadow-inner">
              {logs.map((log, i) => (
                <div key={i} className="flex gap-4 py-1.5 border-b border-stone-100 hover:bg-stone-50 px-2 rounded transition-colors">
                  <span className="text-stone-400 shrink-0">{log.time}</span>
                  <span className={`font-black shrink-0 w-16 ${log.level === 'CRITICAL' ? 'text-rose-600 animate-pulse' : log.level === 'WARNING' ? 'text-orange-600' : log.level === 'STATUS' ? 'text-blue-600' : 'text-emerald-600'}`}>{log.level}</span>
                  <span className="text-purple-600 shrink-0 w-24">[{log.sender}]</span>
                  <span className="text-stone-700 font-medium">{log.msg}</span>
                </div>
              ))}
              {logs.length === 0 && <p className="text-stone-400 italic">No logs in buffer...</p>}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}