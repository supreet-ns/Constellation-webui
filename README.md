# Constellation WebUI - Prototype

🚀 **Live Demo:** https://constellation-webui.vercel.app
*(Clicking this link directly opens the online webpage prototype)*

---

This repository contains a prototype web interface for the Constellation framework. 

The dashboard takes inspiration from the existing MissionControl and Observatory GUIs, combining Finite State Machine (FSM) controls and live telemetry visualization into a single, high-performance interface.

## 🎨 UI/UX Design Philosophy
To reduce operator eye strain during long laboratory shifts, this interface utilizes an **Ergonomic Twilight Palette** combined with a **"Liquid Glass" (Glassmorphism)** aesthetic. This creates visual depth and ensures critical telemetry and log data stand out immediately.

## ✨ Implemented Features
This prototype fulfills all evaluation requirements for interactive elements:

1. **Interactive Buttons (FSM Controller):** Visual state machine controls to Initialize, Launch, Reconfigure, and Stop the hardware constellation.
2. **Real-Time Graphs:** Live-updating telemetry charts simulating CMDP metrics.
3. **Log Displays:** A live event log stream that auto-categorizes incoming messages by severity (INFO, WARNING, CRITICAL).

**⚡ Pro-Operator Keyboard Shortcuts:**
Low-latency keyboard navigation allows operators to trigger states instantly without a mouse:
* `I` - Initialize
* `O` - Orbit 
* `R` - Run 
* `S` - Stop / Emergency Safe

## 🛠️ Tech Stack
* **Framework:** React + Vite
* **Styling:** Tailwind CSS
* **Data Visualization:** Recharts
* **Icons:** Lucide React

---

## ⚙️ Instructions to Run Locally

If you prefer to evaluate this project on your local machine rather than the live link, please follow these steps:

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (v16 or higher recommended).

### Setup Steps

1. **Clone this repository:**

        git clone https://github.com/supreet-ns/Constellation-webui.git

2. **Navigate into the project directory:**

        cd Constellation-webui

3. **Install the required dependencies:**

        npm install

4. **Start the local development server:**

        npm run dev

5. **View the application:**
    Open your browser and navigate to the local host URL provided in the terminal (default is usually http://localhost:5173).
---
### The Final Git Push
Once you type this into VS Code and save, run these exact commands in your terminal to lock in the final version on GitHub:
 ```bash
    git add README.md
    git commit -m "docs: add direct Vercel deployment link to the top of the README"
    git push origin main