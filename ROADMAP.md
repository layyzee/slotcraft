# 🏥 SlotCraft — Master Project Roadmap & Phase Checklist

**Product:** SlotCraft (Zero-Waiting-Room Local Clinic Queue & Appointment SaaS)  
**Target Market:** Private Clinics in Dombivli & suburban MMR (Dentists, Pediatricians, Physiotherapists)  
**Architecture:** 100% Zero-Cost Local-First (Next.js 16 + Native `node:sqlite` + Web Audio API)  
**Local Live Server:** [http://localhost:3001](http://localhost:3001)  
**Last Updated:** November 15, 2026  

---

## 📊 High-Level Phase Overview

- **Phase 1: Core Queue Engine & Human-Craft UI** (100% COMPLETE ✅)
- **Phase 2: Patient Flow & Practice Analytics** (CURRENT FOCUS 🟡)
- **Phase 3: Hardware Integration & Waiting Room TV Mode** (PLANNED ⚪)
- **Phase 4: Local Go-To-Market & Commercialization** (PLANNED ⚪)

---

## ✅ Phase 1: Core Queue Engine & Human-Craft UI (COMPLETE)

*Goal: Build a working, zero-cost, 3-portal SaaS with live queue synchronization and high-craft UI.*

- [x] **1.1 Zero-Cost Embedded Database Layer**
  - [x] Native Node.js `node:sqlite` implementation in `lib/db.js` (No external C++ compilation).
  - [x] Auto-initialization and tables for `clinics`, `doctors`, `services`, and `appointments`.
  - [x] Pre-seeded with real Dombivli clinic data: *Smile Care Dental Clinic (Phadke Road)*.
- [x] **1.2 Real-Time REST Queue API**
  - [x] `GET /api/clinic` — Clinic profile, doctor credentials, and service pricing menu.
  - [x] `GET /api/queue` — Real-time queue breakdown (`nowServing`, `waiting`, `upcoming`, `completed`, `stats`).
  - [x] `POST /api/queue` — Actions for `call_next`, `add_walk_in`, `mark_arrived`, `mark_no_show`, `save_notes`, and `complete_consultation`.
  - [x] `POST /api/book` — Instant appointment creation and token number generation.
- [x] **1.3 UI Overhaul (Eliminating "AI Slop")**
  - [x] Ditched pitch-black dark mode & glowing blurs in favor of a crisp, soft `#f8fafc` medical canvas.
  - [x] Branded title & metadata (`SlotCraft · Smart Clinic Queue & Token Manager`).
  - [x] Applied Geist font typography with clean WCAG 4.5:1 text contrast.
- [x] **1.4 Dedicated Role Portals**
  - [x] **Homepage (`/`):** Real-time clinic display board, Dombivli commute guide, and 3 workspace cards.
  - [x] **Patient Booking (`/book`):** Clean 3-step checkout style service & slot selector.
  - [x] **Receptionist Command Desk (`/reception`):** High-speed Kanban columns, walk-in modal, and live search.
  - [x] **Doctor Consultation Chamber (`/doctor`):** Clinical examination notes, Rx presets, and daily revenue counter.
- [x] **1.5 Tactile Micro-Interactions**
  - [x] Synthesized Web Audio clinic chime (`lib/sound.js` — C5 $\rightarrow$ E5 tone).
  - [x] Keyboard hotkey: Press `N` at reception desk to call the next patient.
  - [x] Digital boarding pass styling for patient tokens with live stepper (`/token/[id]`).

---

## ✅ Phase 2: Patient Engagement & Practice Operations (COMPLETE)

*Goal: Add real-world communication tools (zero-cost WhatsApp links), rescheduling, and accounting exports.*

- [x] **2.1 WhatsApp Notification Engine (100% Free)**
  - [x] Generate one-click `https://wa.me/` direct messaging links for reception to ping patients (`lib/whatsapp.js`).
  - [x] Auto-formatted WhatsApp template: *"Namaste [Patient], Token #04 is now called at Smile Care Clinic. Please walk in."*
  - [x] Patient one-click button: *"Chat with Reception on WhatsApp"*.
- [x] **2.2 Patient Self-Service Controls**
  - [x] Self-service "Running Late? Add +15m Buffer" button on token screen.
  - [x] Self-service cancellation button with instant queue rebalancing.
- [x] **2.3 Clinic Accounting & Daily Reports**
  - [x] Daily Revenue CSV / Excel Export endpoint (`/api/export`) for reception cash register.
  - [x] Printable Patient Treatment & Prescription Slip (Official letterhead PDF/print view for doctor in `/doctor`).
- [x] **2.4 Multi-Doctor Clinic Support & Rooms**
  - [x] Toggle between multiple doctors / rooms (*Dr. Rohan Joshi - Room 1* and *Dr. Ananya Sen - Room 2*).
  - [x] Room-specific calling in `/reception` and `/doctor`.
  - [x] Doctor selection in `/book` and walk-in registration.

---

## ✅ Phase 3: Hardware Integration & Waiting Room TV Mode (COMPLETE)

*Goal: Make the clinic look ultra-modern with hardware integrations that impress patients in person.*

- [x] **3.1 Waiting Room Big Screen TV Mode (`/display`)**
  - [x] Full-screen, distraction-free display board designed for a 43" or 55" waiting room TV ([/display](http://localhost:3001/display)).
  - [x] Audible two-tone hospital chime + voice synthesis: *"Token Number 4, please proceed to Room 1"*.
  - [x] QR Code card: *"Scan to track your token on your phone while having tea outside"*.
- [x] **3.2 Thermal Slip Printer Support (`/print/[id]`)**
  - [x] Web Print API formatting for standard 80mm / 58mm POS thermal receipt printers.
  - [x] Prints physical ticket slip for elderly or walk-in patients who prefer paper with mobile QR tracking.
  - [x] One-click "Print Slip" triggers on reception cards and instant walk-in notifications.
- [ ] **3.3 Offline Desktop App Packaging**
  - [ ] Package SlotCraft into a standalone Mac (`.dmg`) and Windows (`.exe`) app via **Pake** for front-desk PCs.
  - [ ] Auto-starts on PC boot without needing terminal commands.

---

## 🟡 Phase 4: Local Go-To-Market & Commercialization (CURRENT FOCUS)

*Goal: Turn SlotCraft into a pitchable, revenue-generating SaaS product for Dombivli and MMR clinics.*

- [x] **4.1 Clinic Settings & Configuration Wizard (`/settings`)**
  - [x] Self-serve settings form: Doctor/receptionist customizes clinic name, address, consultation fee, doctor credentials, and commuter rush hours.
  - [x] One-click demo reseed button for investor/doctor pitches.
- [ ] **4.2 One-Page Doctor Pitch Flyer (PDF)**
  - [ ] Designed flyer highlighting the core hook: *"Stop waiting room chaos during 6:30 PM–9:00 PM Dombivli commuter rush"*.
  - [ ] Pricing model comparison: ₹999/month flat SaaS vs ₹5,000+ clunky legacy systems.
- [ ] **4.3 Zero-Cost Cloud Deployment Guide**
  - [ ] 1-click deployment template on free Vercel + Turso SQLite / Supabase for clinics wanting remote access.
