'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  Users,
  Stethoscope,
  ArrowRight,
  MapPin,
  Phone,
  ShieldCheck,
  ChevronRight,
  Tv,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Sparkles,
  Train,
  DollarSign,
  HelpCircle,
  Play,
  Printer,
  Settings,
  Building2,
  FileText
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { playClinicChime } from '@/lib/sound';

export default function Home() {
  const [clinic, setClinic] = useState(null);
  const [queueData, setQueueData] = useState(null);
  const [demoToken, setDemoToken] = useState(3);
  const [demoSimulated, setDemoSimulated] = useState(false);

  // ROI Calculator states
  const [patientsPerDay, setPatientsPerDay] = useState(25);
  const [avgFee, setAvgFee] = useState(500);

  useEffect(() => {
    async function loadData() {
      try {
        const [cRes, qRes] = await Promise.all([
          fetch('/api/clinic'),
          fetch('/api/queue')
        ]);
        const cData = await cRes.json();
        const qData = await qRes.json();

        if (cData.success) setClinic(cData.clinic);
        if (qData.success) setQueueData(qData);
      } catch (err) {
        console.error('Failed to load clinic data:', err);
      }
    }
    loadData();
    const interval = setInterval(loadData, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSimulateCallNext = () => {
    playClinicChime();
    setDemoToken((prev) => prev + 1);
    setDemoSimulated(true);
    setTimeout(() => setDemoSimulated(false), 3000);
  };

  // ROI Math: 15% recovered no-shows
  const monthlyNoShowsLost = Math.round(patientsPerDay * 0.15 * 26);
  const monthlyRevenueRecovered = monthlyNoShowsLost * avgFee;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-14 space-y-14 sm:space-y-20">
        {/* Hero Section */}
        <section className="max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse"></span>
            <span>Tailored for Dombivli, Kalyan & Suburban MMR Private Clinics</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 leading-[1.12]">
            Turn your crowded evening waiting room into an orderly, 5-star clinic.
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl font-normal">
            During the peak 6:30 PM to 9:00 PM Dombivli commuter rush, your patients track their live queue token right from the Central Railway train or while grabbing tea outside. They walk in right when you're ready. Zero expensive hardware.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Link
              href="/book"
              className="px-6 py-3.5 rounded-2xl bg-teal-800 hover:bg-teal-900 text-white text-sm font-bold shadow-sm transition flex items-center justify-center gap-2 min-h-[48px] active:scale-[0.98]"
            >
              <span>Book Patient Slot & Test Token</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#interactive-demo"
              className="px-6 py-3.5 rounded-2xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold shadow-2xs transition flex items-center justify-center gap-2 min-h-[48px]"
            >
              <Play className="w-4 h-4 text-teal-700" />
              <span>Watch Live Queue Simulator</span>
            </a>
          </div>
        </section>

        {/* Interactive Live Demo Widget (Show, Don't Tell) */}
        <section id="interactive-demo" className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-800">
                  Interactive Live Queue Simulator
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                Experience how patients & front desk experience SlotCraft
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Tap "Test Call Next Patient" below to hear the harmonic hospital chime and watch the tokens advance in real-time.
              </p>
            </div>

            <button
              onClick={handleSimulateCallNext}
              className="px-5 py-3 bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs rounded-2xl shadow-sm transition flex items-center justify-center gap-2 shrink-0 active:scale-95 min-h-[44px]"
            >
              <span>🔔 Test Call Next Patient</span>
            </button>
          </div>

          {demoSimulated && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in duration-150">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Two-tone chime sounded! Token #{demoToken} called into Consultation Chamber 1.</span>
            </div>
          )}

          {/* 3-Way Synchronized Preview Strip */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. Commuter Phone Screen */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-100/70 px-2 py-0.5 rounded">
                1. Commuter's Phone Screen
              </span>
              <p className="text-xs font-bold text-slate-900">Your Token: #{demoToken + 2}</p>
              <div className="bg-white p-4 rounded-xl border border-slate-200 text-center shadow-2xs">
                <p className="text-[10px] text-slate-500 uppercase font-bold">Now Inside</p>
                <p className="text-4xl font-black text-teal-800 my-1">#{demoToken}</p>
                <p className="text-[11px] text-slate-600 font-semibold mt-1">2 patients ahead (~20m wait)</p>
                <div className="mt-2.5 text-[10px] text-slate-700 bg-teal-50 p-2 rounded-lg font-medium">
                  🚆 Train at Dombivli? Walk over to Phadke Rd now!
                </div>
              </div>
            </div>

            {/* 2. Reception Desk */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 bg-blue-100/70 px-2 py-0.5 rounded">
                2. Reception Desk (1-Tap)
              </span>
              <p className="text-xs font-bold text-slate-900">Front Desk Queue</p>
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2.5 text-xs shadow-2xs">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-800">In Chair: Token #{demoToken}</span>
                  <span className="text-emerald-700 font-extrabold bg-emerald-50 px-1.5 py-0.2 rounded">Active</span>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between text-[11px]">
                  <span>Next: Token #{demoToken + 1}</span>
                  <span className="text-amber-800 font-bold">In Lobby</span>
                </div>
                <p className="text-[10px] text-slate-500 font-mono">Press 'N' or tap Call Next</p>
              </div>
            </div>

            {/* 3. Lobby TV Screen */}
            <div className="bg-slate-950 text-white border border-slate-800 rounded-2xl p-4 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400 bg-teal-950 px-2 py-0.5 rounded border border-teal-800">
                3. Waiting Room TV Display
              </span>
              <p className="text-xs font-bold text-slate-300">Lobby Monitor (43"/55")</p>
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-center shadow-2xs">
                <p className="text-[10px] uppercase font-bold text-teal-400">Now Serving</p>
                <p className="text-4xl font-black text-white my-1">#{demoToken}</p>
                <p className="text-[10px] text-slate-400">Proceed to Consultation Room 1</p>
                <div className="mt-2 text-[9px] text-teal-300 font-mono">
                  🔊 Chime sounded + Voice call
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bento Grid: Dedicated Portals */}
        <section className="space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full">
              Full System Portals
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1.5">
              Everything your clinic needs from day one
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Engineered for seamless coordination between patients, receptionists, and doctors.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* 1. Patient Portal */}
            <Link
              href="/book"
              className="group bg-white hover:bg-slate-50/80 border border-slate-200/90 hover:border-slate-300 rounded-3xl p-6 transition flex flex-col justify-between shadow-xs hover:shadow-sm"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800">For Commuters</span>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5 group-hover:text-teal-800 transition">
                    Mobile Booking & Token
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Doctor & room selection, 3-step checkout style slot booking, and live digital queue slip.
                  </p>
                </div>
              </div>
              <span className="pt-4 text-xs font-bold text-teal-800 inline-flex items-center gap-1.5">
                <span>Book Slot</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>

            {/* 2. Reception Desk */}
            <Link
              href="/reception"
              className="group bg-white hover:bg-slate-50/80 border border-slate-200/90 hover:border-slate-300 rounded-3xl p-6 transition flex flex-col justify-between shadow-xs hover:shadow-sm"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 text-blue-800 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800">Front Desk</span>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5 group-hover:text-blue-800 transition">
                    Reception Command Desk
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Multi-room caller (Room 1 & 2), keyboard hotkey (N), WhatsApp alerts, and CSV register export.
                  </p>
                </div>
              </div>
              <span className="pt-4 text-xs font-bold text-blue-800 inline-flex items-center gap-1.5">
                <span>Open Front Desk</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>

            {/* 3. Doctor Room */}
            <Link
              href="/doctor"
              className="group bg-white hover:bg-slate-50/80 border border-slate-200/90 hover:border-slate-300 rounded-3xl p-6 transition flex flex-col justify-between shadow-xs hover:shadow-sm"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-200 text-purple-800 flex items-center justify-center">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800">Doctor Chamber</span>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5 group-hover:text-purple-800 transition">
                    Doctor EMR & Print Rx
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Patient examination notes, diagnosis presets, printable letterhead, and daily earnings counter (₹).
                  </p>
                </div>
              </div>
              <span className="pt-4 text-xs font-bold text-purple-800 inline-flex items-center gap-1.5">
                <span>Enter Doctor Room</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>

            {/* 4. TV Display Mode */}
            <Link
              href="/display"
              target="_blank"
              className="group bg-slate-950 hover:bg-slate-900 text-white border border-slate-800 rounded-3xl p-6 transition flex flex-col justify-between shadow-xs hover:shadow-sm"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-500/40 text-teal-300 flex items-center justify-center">
                  <Tv className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400">Waiting Lobby</span>
                  <h3 className="text-base font-bold text-white mt-0.5 group-hover:text-teal-300 transition">
                    Waiting Room TV Board
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Full-screen 43"/55" lobby TV monitor with automated two-tone hospital chimes and voice announcements.
                  </p>
                </div>
              </div>
              <span className="pt-4 text-xs font-bold text-teal-400 inline-flex items-center gap-1.5">
                <span>Launch TV Mode</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>

            {/* 5. Thermal Slip Printer */}
            <Link
              href="/print/apt-004"
              target="_blank"
              className="group bg-white hover:bg-slate-50/80 border border-slate-200/90 hover:border-slate-300 rounded-3xl p-6 transition flex flex-col justify-between shadow-xs hover:shadow-sm"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Walk-In Hardware</span>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5 group-hover:text-emerald-800 transition">
                    80mm POS Thermal Slip
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Print instant paper token tickets for elderly commuters with QR mobile queue tracker.
                  </p>
                </div>
              </div>
              <span className="pt-4 text-xs font-bold text-emerald-800 inline-flex items-center gap-1.5">
                <span>Test Print Slip</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>

            {/* 6. Settings & Rooms */}
            <Link
              href="/settings"
              className="group bg-white hover:bg-slate-50/80 border border-slate-200/90 hover:border-slate-300 rounded-3xl p-6 transition flex flex-col justify-between shadow-xs hover:shadow-sm"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Admin Control</span>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5 group-hover:text-amber-800 transition">
                    Clinic Settings & Rooms
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Manage Doctor 1 & 2 credentials/rooms, Dombivli evening rush hours, and reseed demo data.
                  </p>
                </div>
              </div>
              <span className="pt-4 text-xs font-bold text-amber-800 inline-flex items-center gap-1.5">
                <span>Configure Clinic</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </div>
        </section>

        {/* Interactive ROI Calculator for Dombivli Doctors */}
        <section id="pricing" className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="max-w-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full">
              Clinic Economics
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1.5">
              Calculate revenue recovered from eliminating waiting room walkouts
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Private dental and pediatric clinics in Dombivli typically lose 3–4 patients every evening when the waiting room gets packed.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Daily Patient Footfall: {patientsPerDay} patients</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="60"
                  step="5"
                  value={patientsPerDay}
                  onChange={(e) => setPatientsPerDay(Number(e.target.value))}
                  className="w-full accent-teal-700 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Average Consultation / Procedure Fee: ₹{avgFee}</span>
                </div>
                <input
                  type="range"
                  min="300"
                  max="2000"
                  step="100"
                  value={avgFee}
                  onChange={(e) => setAvgFee(Number(e.target.value))}
                  className="w-full accent-teal-700 cursor-pointer"
                />
              </div>
            </div>

            <div className="bg-teal-50/70 border border-teal-200 rounded-2xl p-6 text-center space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800">
                Estimated Monthly Revenue Saved
              </span>
              <p className="text-3xl sm:text-4xl font-black text-teal-900 tracking-tight">
                ₹{monthlyRevenueRecovered.toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-slate-600 font-medium">
                ~{monthlyNoShowsLost} patients saved from leaving without consulting per month.
              </p>
              <div className="pt-2">
                <span className="inline-block text-[11px] font-bold px-3 py-1 bg-teal-800 text-white rounded-full">
                  SlotCraft Plan: ₹999/mo (Zero Commission)
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 px-4 sm:px-6 mt-16 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-900">SlotCraft</span>
            <span>·</span>
            <span>Zero-Waiting-Room Local Clinic Queue SaaS</span>
          </div>
          <p className="text-center sm:text-right">
            Designed for Dombivli, Kalyan & Suburban Mumbai Transit Hubs. 100% Zero-Cost Local-First Architecture.
          </p>
        </div>
      </footer>
    </div>
  );
}
