import { useState, useEffect, useCallback } from 'react';

export const useConstellation = () => {
  const [globalState, setGlobalState] = useState('INIT');
  const [runId, setRunId] = useState('N/A');
  const [runDuration, setRunDuration] = useState(0);
  const [telemetry, setTelemetry] = useState([]);
  const [logs, setLogs] = useState([]);
  const [satellites, setSatellites] = useState([
    { id: 'sat-1', name: 'Caribou_Telescope', type: 'Detector', state: 'INIT', ping: 12 },
    { id: 'sat-2', name: 'EudaqNativeWriter', type: 'Storage', state: 'INIT', ping: 8 },
    { id: 'sat-3', name: 'ESP32_EnvMonitor', type: 'IoT_Sensor', state: 'INIT', ping: 45 }
  ]);

  const addLog = useCallback((level, sender, msg) => {
    setLogs(prev => [{ time: new Date().toLocaleTimeString(), level, sender, msg }, ...(prev || [])].slice(0, 50));
  }, []);

  const handleTransition = useCallback((newState) => {
    setGlobalState(newState);
    setSatellites(prev => prev.map(s => ({ ...s, state: newState })));
    if (newState === 'RUN') {
      setRunId(`Run_${Math.floor(2000 + Math.random() * 5000)}`);
      setRunDuration(0);
      setTelemetry([]);
    }
    addLog(newState === 'ERROR' ? 'CRITICAL' : 'STATUS', 'MissionControl', `FSM Transition: -> ${newState}`);
  }, [addLog]);

  // Simulation Timers
  useEffect(() => {
    let interval;
    if (globalState === 'RUN') {
      interval = setInterval(() => {
        setRunDuration(prev => prev + 1);
        setTelemetry(prev => [...(prev || []), {
          time: new Date().toLocaleTimeString([], { second: '2-digit' }),
          eventRate: Math.floor(1100 + Math.random() * 200),
          temp: +(25 + Math.random() * 1.5).toFixed(1)
        }].slice(-15));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [globalState]);

  return { globalState, runId, runDuration, telemetry, logs, satellites, handleTransition };
};