# 🏥 SlotCraft — Smart Clinic Queue & Appointment SaaS

> **Zero-Waiting-Room digital queue system tailored for private clinics in suburban Mumbai (Dombivli, Kalyan & MMR).**  
> Built with 100% zero-cost local-first architecture (Next.js 16 App Router + native `node:sqlite` + Web Audio API).

[![License: MIT](https://img.shields.io/badge/License-MIT-teal.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v26+-059669.svg)](https://nodejs.org)
[![Next.js](https://img.shields.io/badge/Next.js-16.4-black.svg)](https://nextjs.org)
[![Zero Cost](https://img.shields.io/badge/Cost-%E2%82%B90%20Free%20Tier-emerald.svg)](#architecture)

---

## 📌 The Problem & Real-World Context

In suburban Mumbai transit hubs like **Dombivli East (Phadke Road / Manpada Road)**, private dental, pediatric, and general clinics experience a severe peak rush between **6:30 PM and 9:00 PM** as thousands of commuters return on Central Railway local trains.

* **Traditional Clinic Chaos:** 12–15 tired patients crammed in a small lobby, coughing on each other. Front desk staff are bombarded every 5 minutes with *"Kitna time lagega? Mera number kab aayega?"*.
* **Costly No-Shows:** Frustrated patients leave without consulting, costing clinics ₹1,500–₹3,000 every evening in lost chair time.
* **The SlotCraft Solution:** Commuters book from their phone while on the train, track their live token in real-time, and walk in right when 1 patient remains ahead. Receptionists call patients with one tap or keyboard hotkey (`Key N`).

---

## 🚀 Live System Portals

| Portal | Route | Target User | Key Capabilities |
|---|---|---|---|
| **Commercial Hub** | `/` | Everyone / Doctors | Interactive live queue simulation, clinic overview, ROI calculator & FAQ. |
| **Patient Booking** | `/book` | Commuters & Patients | Doctor/Room selection, 3-step mobile booking (Treatment $\rightarrow$ Slot $\rightarrow$ Details) & immediate digital token issuance. |
| **Live Digital Token** | `/token/[id]` | Commuters | Live boarding pass countdown, 3-step progress bar, station commute guidance, self-service +15m delay buffer & WhatsApp link. |
| **80mm POS Thermal Slip** | `/print/[id]` | Walk-ins & Seniors | Standard 80mm/58mm thermal receipt layout for walk-in tickets with mobile QR tracker and print CSS. |
| **Reception Command Desk** | `/reception` | Front-Desk Staff | Multi-room caller (Room 1 & 2), keyboard hotkey (`N`), 5-second walk-in modal, instant print slip trigger, live search, and CSV register export. |
| **Doctor Consultation Room** | `/doctor` | Clinic Owner / Doctor | Multi-room toggle (Dr. Rohan / Dr. Ananya), clinical notes, Rx presets, printable letterhead, and daily earnings counter (₹). |
| **Waiting Room TV Mode** | `/display` | Waiting Lobby | Full-screen large-format board for 43"/55" wall monitors with automated two-tone hospital chimes and speech synthesis. |
| **Clinic Settings & Rooms** | `/settings` | Admin / Doctor | Manage clinic branding, Doctor 1 & 2 credentials/rooms, Dombivli evening rush hours, and reseed demo queue. |

---

## 🛠️ Architecture & Tech Stack (100% Free & Local-First)

* **Full-Stack Framework:** [Next.js 16](https://nextjs.org) with Turbopack & React 19 Client Components.
* **Styling & Design System:** Tailwind CSS v4 with [Geist](https://vercel.com/font) typography, based on [ui-ux-pro-max](https://github.com) accessibility guidelines (WCAG 4.5:1 text contrast).
* **Database:** Native Node.js `node:sqlite` (`DatabaseSync`). Zero C++ build tools, zero external database subscriptions, auto-initialized and seeded on first run.
* **Audio Synthesis:** Native **Web Audio API** (`lib/sound.js`) producing pleasant harmonic hospital chimes (C5 $\rightarrow$ E5) without external audio files.
* **WhatsApp Engine:** Native `https://wa.me/` direct URL protocol for one-click patient notifications without paid Meta API keys.

---

## ⚡ Quickstart

### Prerequisites
* Node.js v22+ or v26+ (for native `node:sqlite` support).

### 1. Clone & Install
```bash
git clone https://github.com/layyzee/slotcraft.git
cd slotcraft
npm install
```

### 2. Run the App
```bash
# Using the one-click macOS launcher
./start.sh

# Or manually:
npm run dev -- -p 3001
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

---

## 📂 Project Structure

```text
slotcraft_app/
├── app/
│   ├── api/
│   │   ├── book/          # Booking endpoint (generates tokens)
│   │   ├── clinic/        # Clinic profile & pricing menu
│   │   ├── export/        # Daily register CSV download
│   │   └── queue/         # Live queue management (call_next, delay, cancel)
│   ├── book/              # Mobile patient booking screen
│   ├── display/           # Full-screen waiting room lobby TV mode
│   ├── doctor/            # Doctor consultation EMR & printable Rx
│   ├── reception/         # Front-desk command desk (Kanban + Caller)
│   ├── token/[id]/        # Live patient token tracker & commuter pass
│   ├── layout.js          # Root layout & Geist typography
│   └── page.js            # High-converting commercial landing page
├── lib/
│   ├── db.js              # Native node:sqlite engine & seed data
│   ├── sound.js           # Web Audio API synthesized hospital chime
│   └── whatsapp.js        # Zero-cost WhatsApp direct URL generator
├── BUSINESS_PLAYBOOK.md   # Setup costs, pricing math & local sales script
├── ROADMAP.md             # Project phase checklist and milestones
└── start.sh               # One-click launcher script
```

---

## 📈 Commercial & Scaling Strategy

See [BUSINESS_PLAYBOOK.md](./BUSINESS_PLAYBOOK.md) for the complete operational breakdown:
* **Operating Cost:** **₹0 – ₹58 / month** (Free tier Vercel + Turso SQLite + Native WhatsApp).
* **Pricing Model:** **₹999 / month** (Starter) or **₹1,499 / month** (Pro with Lobby TV).
* **Dombivli Market Potential:** 50 clinics across Dombivli & Kalyan = **₹7.2 Lakh / year ARR** at ~95% profit margin.

---

## 📄 License
MIT License. Created by [Balaji Palani](https://github.com/layyzee).
