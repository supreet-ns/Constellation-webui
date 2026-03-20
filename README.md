# Constellation WebUI - Prototype

A modern, high-performance web interface prototype for the Constellation framework. This project was developed as an evaluation task for **CERN-HSF (GSoC 2026)**, drawing inspiration from existing MissionControl and Observatory GUIs while introducing a refined, operator-focused design language.

## 🎨 Design Philosophy: "Liquid Glass" & Ergonomics
Working in laboratory environments requires interfaces that are highly legible but don't cause eye strain over long shifts. 
Instead of a harsh white background or a completely dark mode, this UI utilizes an **Ergonomic Twilight Palette** combined with a **"Liquid Glass" (Glassmorphism)** aesthetic. This creates visual depth, reduces operator fatigue, and ensures critical telemetry and log data stand out immediately.

## ✨ Key Features
* **Interactive FSM Controller:** Visual state machine controls to initialize, launch, and reconfigure the satellite constellation.
* **Real-Time Telemetry Visualization:** Live-updating data graphs simulating CMDP metrics.
* **Live Event Log Stream:** Color-coded log displays for instant status recognition (INFO, WARNING, CRITICAL).
* **Pro-Operator Keyboard Shortcuts:** Low-latency keyboard navigation allows operators to trigger states without a mouse:
  * `I` - Initialize
  * `O` - Launch
  * `R` - Reconfigure
  * `S` - Stop

## 🛠️ Tech Stack
* **Framework:** React + Vite
* **Styling:** Tailwind CSS (for glassmorphism and custom palette)
* **Icons & Charts:** Lucide React & Recharts

---

## 🚀 Instructions to Run Locally

To get this prototype running on your local machine, follow these steps:

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (v16 or higher recommended).

### Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/supreet-ns/Constellation-webui.git](https://github.com/supreet-ns/Constellation-webui.git)