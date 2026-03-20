## 📡 Constellation WebUI: Operator's Manual

Welcome to the Constellation WebUI. This interface is designed for low-latency, ergonomic control of satellite telemetry and finite state machines (FSM). Here is how to operate the dashboard.

### 1. FSM Control Panel (State Transitions)
The core of the dashboard is the FSM logic controller. You must step through the hardware states in the correct order:

* **Initialize (INIT):** Prepares the system and connects to the hardware nodes.
* **Launch / Run:** Activates the data streams. Telemetry will not display until the system successfully reaches this state.
* **Reconfigure:** Pauses active streams to allow for parameter adjustments on the fly.
* **Stop / Safe:** Immediately halts all data collection and returns the system to a safe standby mode.

### 2. Pro-Operator Keyboard Shortcuts
To maximize efficiency and reduce reliance on a mouse, the UI features a built-in event listener for keyboard execution. Make sure the browser window is in focus, then use these keys to trigger immediate state changes:

* **Press `I`** ➔ Initialize System
* **Press `O`** ➔ Launch / Run System
* **Press `R`** ➔ Reconfigure System
* **Press `S`** ➔ Stop / Emergency Halt

### 3. Real-Time Telemetry Graphs
Located in the main viewing area, the telemetry charts visualize the CMDP metrics.

* **Awaiting State:** If the dashboard is blurred with a "Awaiting RUN state" message, you must push the system to the **Launch** state first.
* **Live Plotting:** Once running, the graphs will automatically plot incoming data points. Hover over the nodes on the graph to see exact timestamps and metric values in the glassmorphism tooltip.

### 4. Live Event Log Stream
The right-side panel contains the active log buffer. It categorizes system messages automatically so operators can read them at a glance against the twilight background:

* **Standard Logs:** Gray/Stone text indicating normal system operations and state changes.
* **Component Senders:** Highlighted in purple to quickly identify which hardware node is sending the message.
* **CRITICAL Alerts:** Flashing/pulsing red text. If you see this, the system has encountered an error, and the operator should immediately hit **`S`** (Stop) to safe the hardware.