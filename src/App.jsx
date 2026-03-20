import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Terminal, Activity, Server, AlertCircle, Play, Square, ArrowUpCircle, ShieldAlert } from 'lucide-react';

export default function ConstellationCommandCenter() {
  // Constellation FSM Global State
  const [globalState, setGlobalState] = useState('INIT'); 
  const [runId, setRunId] = useState('Run_0000');
  const [runDuration, setRunDuration] = useState(0);

  // Simulated Constellation Satellites
  const [satellites, setSatellites] = useState([
    { id: 'sat-1', name: 'Caribou_Telescope', type: 'Detector', state: 'INIT', ping: '12ms' },
    { id: 'sat-2', name: 'EudaqNativeWriter', type: 'Storage', state: 'INIT', ping: '8ms' },
    { id: 'sat-3', name: 'ESP32_EnvMonitor', type: 'IoT_Sensor', state: 'INIT', ping: '45ms' }
  ]);

  // Telemetry & Logs
  const [telemetry, setTelemetry] = useState([]);
  const [logs, setLogs] = useState([
    { time: new Date().toLocaleTimeString(), level: 'STATUS', sender: 'Constellation', msg: 'System Initialized. Awaiting ORBIT transition.' }
  ]);

  // Simulation Engine: Runs when State is "RUN"
  useEffect(() => {
    let interval;
    if (globalState === 'RUN') {
      interval = setInterval(() => {
        setRunDuration(prev => prev + 1);
        
        // Simulate live graph telemetry
        setTelemetry(prev => {
          const newPoint = {
            time: new Date().toLocaleTimeString([], { hour12: false, second: '2-digit', minute:'2-digit' }),
            eventRate: Math.floor(1000 + Math.random() * 250),
            temp: +(24 + Math.random() * 2).toFixed(1)
          };
          return [...prev, newPoint].slice(-15); // Keep last 15 points
        });

        // Simulate live Observatory logs
        if (Math.random() > 0.7) {
          const levels = ['INFO', 'STATUS', 'WARNING'];
          const randomLevel = levels[Math.floor(Math.random() * levels.length)];
          const senders = ['Caribou_Telescope', 'ESP32_EnvMonitor'];
          const sender = senders[Math.floor(Math.random() * senders.length)];
          
          setLogs(prev => [{
            time: new Date().toLocaleTimeString(),
            level: randomLevel,
            sender: sender,
            msg: randomLevel === 'WARNING' ? 'Latency spike detected in data transmission.' : 'Data chunk written successfully.'
          }, ...prev].slice(0, 30));
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [globalState]);

  // FSM Command Handlers
  const handleTransition = (newState) => {
    setGlobalState(newState);
    const newSats = satellites.map(sat => ({ ...sat, state: newState }));
    setSatellites(newSats);
    
    if (newState === 'RUN') {
      setRunId(`Run_${Math.floor(1000 + Math.random() * 9000)}`);
      setRunDuration(0);
    }
    
    setLogs(prev => [{
      time: new Date().toLocaleTimeString(),
      level: newState === 'ERROR' ? 'CRITICAL' : 'STATUS',
      sender: 'MissionControl',
      msg: `Constellation transitioned to ${newState} state.`
    }, ...prev]);
  };

  // UI Helpers
  const getStateColor = (state) => {
    switch(state) {
      case 'RUN': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'ORBIT': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'INIT': return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
      case 'ERROR': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
      default: return 'text-slate-400';
    }
  };

  const getLogColor = (level) => {
    switch(level) {
      case 'CRITICAL': return 'text-rose-500';
      case 'WARNING': return 'text-amber-400';
      case 'STATUS': return 'text-emerald-400';
      default: return 'text-slate-300';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 font-sans">
      {/* Header */}
      <header className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <Activity className="text-blue-500 w-8 h-8" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Constellation WebUI</h1>
            <p className="text-xs text-slate-500 uppercase tracking-widest">Unified Mission Control & Observatory</p>
          </div>
        </div>
        <div className="flex gap-4 items-center">
          <div className="text-right">
            <div className="text-sm text-slate-400">Current Run</div>
            <div className="font-mono text-lg font-bold text-white">{globalState === 'RUN' ? runId : 'N/A'}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-400">Duration</div>
            <div className="font-mono text-lg font-bold text-white">{globalState === 'RUN' ? `${runDuration}s` : '00:00'}</div>
          </div>
          <div className={`px-4 py-2 rounded-full border font-bold text-sm tracking-wide ${getStateColor(globalState)}`}>
            STATE: {globalState}
          </div>
        </div>
      </header>

      {/* Main Grid - Bento Box Layout */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Left Column: Controls & Satellites (MissionControl) */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* FSM Controls */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Terminal className="w-5 h-5 text-blue-400"/> Command Controller
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => handleTransition('INIT')} disabled={globalState === 'RUN'} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors border border-slate-700">
                Initialize (INIT)
              </button>
              <button onClick={() => handleTransition('ORBIT')} disabled={globalState === 'RUN'} className="px-4 py-2 bg-slate-800 hover:bg-blue-900/30 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors border border-slate-700 hover:border-blue-500/50">
                Launch (ORBIT)
              </button>
              <button onClick={() => handleTransition('RUN')} disabled={globalState !== 'ORBIT'} className="px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 disabled:opacity-50 rounded-lg text-sm font-bold transition-colors border border-emerald-500/30 flex justify-center items-center gap-2">
                <Play className="w-4 h-4"/> Start Run
              </button>
              <button onClick={() => handleTransition('ORBIT')} disabled={globalState !== 'RUN'} className="px-4 py-2 bg-rose-600/20 hover:bg-rose-600/40 text-rose-400 disabled:opacity-50 rounded-lg text-sm font-bold transition-colors border border-rose-500/30 flex justify-center items-center gap-2">
                <Square className="w-4 h-4"/> Stop Run
              </button>
            </div>
          </div>

          {/* Satellite Roster */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Server className="w-5 h-5 text-purple-400"/> Connected Satellites
            </h2>
            <div className="space-y-3">
              {satellites.map(sat => (
                <div key={sat.id} className="p-3 bg-slate-950/50 rounded-lg border border-slate-800 flex justify-between items-center">
                  <div>
                    <div className="font-medium text-sm text-slate-200">{sat.name}</div>
                    <div className="text-xs text-slate-500">{sat.type}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded-sm font-bold ${getStateColor(sat.state)}`}>
                      {sat.state}
                    </span>
                    <span className="text-[10px] text-slate-500">{sat.ping}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Telemetry Graph & Logs (Observatory) */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          
          {/* Telemetry Graph */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg h-[350px] flex flex-col">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400"/> Real-time Telemetry (CMDP)
            </h2>
            <div className="flex-1 w-full relative">
              {globalState !== 'RUN' && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm rounded-lg border border-dashed border-slate-700">
                  <div className="text-slate-400 flex items-center gap-2 font-medium">
                    <AlertCircle className="w-5 h-5"/> Awaiting RUN state for telemetry data
                  </div>
                </div>
              )}
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={telemetry} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={12} tickMargin={10} />
                  <YAxis yAxisId="left" stroke="#64748b" fontSize={12} domain={['auto', 'auto']} />
                  <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={12} domain={[20, 30]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                    itemStyle={{ color: '#e2e8f0' }}
                  />
                  <Line yAxisId="left" type="monotone" dataKey="eventRate" stroke="#3b82f6" strokeWidth={2} dot={false} isAnimationActive={false} name="Event Rate (Hz)" />
                  <Line yAxisId="right" type="monotone" dataKey="temp" stroke="#f59e0b" strokeWidth={2} dot={false} isAnimationActive={false} name="Temperature (°C)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Log Interface */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-0 shadow-lg overflow-hidden flex flex-col h-[250px]">
            <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
               <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-slate-400"/> System Logs
              </h2>
              <span className="text-xs text-slate-500 font-mono">Total Messages: {logs.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-1 bg-[#0a0f18]">
              {logs.map((log, i) => (
                <div key={i} className="flex gap-4 hover:bg-slate-800/30 py-1 px-2 rounded group">
                  <span className="text-slate-600 min-w-[70px]">{log.time}</span>
                  <span className={`font-bold min-w-[70px] ${getLogColor(log.level)}`}>{log.level}</span>
                  <span className="text-purple-400/80 min-w-[140px] truncate">[{log.sender}]</span>
                  <span className="text-slate-300 group-hover:text-white transition-colors">{log.msg}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}