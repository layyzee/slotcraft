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
  Play
} from 'lucide-react';
import { playClinicChime } from '@/lib/sound';

export default function Home() {
  const [clinic, setClinic] = useState(null);
  const [queueData, setQueueData] = useState(null);
  const [demoToken, setDemoToken] = useState(3);
  const [demoSimulated, setDemoSimulated] = useState(false);

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

  const nowServingToken = queueData?.stats?.nowServingToken || demoToken;
  const waitingCount = queueData?.stats?.waitingCount ?? 3;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="border-b border-slate-200/80 bg-white/95 backdrop-blur sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-700 text-white flex items-center justify-center font-bold text-base shadow-sm">
              SC
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm sm:text-base tracking-tight">SlotCraft</span>
                <span className="text-slate-300">|</span>
                <span className="text-xs text-slate-600 font-medium hidden sm:inline">Local Clinic SaaS</span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">Phadke Road · Dombivli East</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/display"
              target="_blank"
              className="text-xs text-slate-600 hover:text-slate-900 font-medium px-3 py-1.5 rounded-lg hover:bg-slate-100 transition hidden lg:inline-flex items-center gap-1.5"
            >
              <Tv className="w-3.5 h-3.5 text-teal-700" />
              <span>Lobby TV Mode</span>
            </Link>
            <Link
              href="/reception"
              className="text-xs text-slate-600 hover:text-slate-900 font-medium px-3 py-1.5 rounded-lg hover:bg-slate-100 transition hidden md:inline-flex items-center gap-1"
            >
              <span>Reception Desk</span>
            </Link>
            <Link
              href="/doctor"
              className="text-xs text-slate-600 hover:text-slate-900 font-medium px-3 py-1.5 rounded-lg hover:bg-slate-100 transition hidden md:inline-flex items-center gap-1"
            >
              <span>Doctor Room</span>
            </Link>
            <a
              href="https://wa.me/917540015522?text=Namaste%20Balaji,%20I%20am%20interested%20in%20a%20SlotCraft%20demo%20for%20my%20clinic."
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs sm:text-sm font-semibold bg-teal-700 hover:bg-teal-800 text-white px-4 py-2 rounded-lg transition shadow-sm flex items-center gap-1.5 active:scale-[0.98]"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Book 10-Min Demo</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-16">
        {/* Hero Section */}
        <div className="max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse"></span>
            <span>Built for Private Clinics in Dombivli, Kalyan & Suburban MMR</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
            Turn your crowded evening waiting room into an orderly, 5-star clinic.
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
            During the chaotic 6:30 PM to 9:00 PM Dombivli commuter rush, your patients track their live queue token from the Central Railway local train or from home. They walk in right when you're ready. Zero hardware to buy.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <a
              href="#pricing"
              className="px-5 py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-sm font-bold shadow-sm transition flex items-center gap-2 active:scale-[0.98]"
            >
              <span>Start 14-Day Zero-Risk Pilot</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="#interactive-demo"
              className="px-5 py-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold shadow-sm transition flex items-center gap-2"
            >
              <Play className="w-3.5 h-3.5 text-teal-700" />
              <span>Test Live Queue Simulation</span>
            </a>
          </div>
        </div>

        {/* Interactive Live Demo Widget (Show, Don't Tell) */}
        <section id="interactive-demo" className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs uppercase font-bold tracking-wider text-emerald-700">
                  Interactive Live Queue Simulator
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                Experience how patients & receptionists experience SlotCraft
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Click "Call Next Patient" below to hear the clinic chime and watch the tokens advance in real-time.
              </p>
            </div>

            <button
              onClick={handleSimulateCallNext}
              className="px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-2 shrink-0 active:scale-[0.97]"
            >
              <span>🔔 Test Call Next Patient</span>
            </button>
          </div>

          {demoSimulated && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-150">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Two-tone chime sounded! Token #{demoToken} called into Consultation Chamber 1.</span>
            </div>
          )}

          {/* 3-Way Synchronized Preview Strip */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. What Patient Sees on Phone */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-100/70 px-2 py-0.5 rounded">
                1. Commuter's Phone Screen
              </span>
              <p className="text-xs font-bold text-slate-900">Your Token: #{demoToken + 2}</p>
              <div className="bg-white p-3 rounded-xl border border-slate-200 text-center">
                <p className="text-[10px] text-slate-500 uppercase font-semibold">Now Inside</p>
                <p className="text-3xl font-black text-teal-700">#{demoToken}</p>
                <p className="text-[11px] text-slate-500 font-medium mt-1">2 patients ahead (~20m wait)</p>
                <div className="mt-2 text-[10px] text-slate-600 bg-teal-50/70 p-1.5 rounded">
                  🚆 Train at Dombivli? Walk over now!
                </div>
              </div>
            </div>

            {/* 2. What Receptionist Sees on Desktop */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 bg-blue-100/70 px-2 py-0.5 rounded">
                2. Reception Desk (1-Tap)
              </span>
              <p className="text-xs font-bold text-slate-900">Front Desk Queue</p>
              <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-700">In Chair: Token #{demoToken}</span>
                  <span className="text-emerald-700 font-bold">Active</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Next: Token #{demoToken + 1}</span>
                  <span>In Lobby</span>
                </div>
                <div className="pt-1 border-t border-slate-100 text-[10px] text-teal-700 font-semibold">
                  Press 'N' key to call next patient instantly
                </div>
              </div>
            </div>

            {/* 3. What Waiting Room TV Shows */}
            <div className="bg-slate-900 text-white rounded-2xl p-4 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-300 bg-teal-950 px-2 py-0.5 rounded border border-teal-800">
                3. Lobby TV Screen (43" / 55")
              </span>
              <p className="text-xs font-bold text-slate-200">Waiting Room TV Mode</p>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                <p className="text-[10px] uppercase text-slate-400">NOW SERVING</p>
                <p className="text-3xl font-black text-teal-400">#{demoToken}</p>
                <p className="text-[11px] text-slate-300">Chamber 1 · Dr. Rohan Joshi</p>
                <div className="mt-1.5 text-[10px] text-slate-400">
                  Voice: "Token #{demoToken}, please proceed"
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4 Dedicated Workspace Portals */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">Full System Portals (Ready to Use)</h3>
              <p className="text-xs text-slate-500">Everything a modern clinic needs on day one</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Patient Portal */}
            <Link
              href="/book"
              className="group bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-2xl p-5 transition flex flex-col justify-between shadow-sm"
            >
              <div className="space-y-3">
                <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800">For Commuters</span>
                  <h4 className="text-sm font-bold text-slate-900 mt-0.5 group-hover:text-teal-700 transition">
                    Mobile Booking & Token
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    3-step slot booking with instant live digital queue slip on phone.
                  </p>
                </div>
              </div>
              <span className="pt-4 text-xs font-semibold text-teal-700 inline-flex items-center gap-1">
                <span>Book Slot</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>

            {/* 2. Reception Desk */}
            <Link
              href="/reception"
              className="group bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-2xl p-5 transition flex flex-col justify-between shadow-sm"
            >
              <div className="space-y-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800">Front Desk</span>
                  <h4 className="text-sm font-bold text-slate-900 mt-0.5 group-hover:text-blue-700 transition">
                    Reception Command Desk
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Hotkeys (Key N), WhatsApp alerts, 5-sec walk-in modal, CSV export.
                  </p>
                </div>
              </div>
              <span className="pt-4 text-xs font-semibold text-blue-700 inline-flex items-center gap-1">
                <span>Open Front Desk</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>

            {/* 3. Doctor Room */}
            <Link
              href="/doctor"
              className="group bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-2xl p-5 transition flex flex-col justify-between shadow-sm"
            >
              <div className="space-y-3">
                <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800">Doctor Chamber</span>
                  <h4 className="text-sm font-bold text-slate-900 mt-0.5 group-hover:text-purple-700 transition">
                    Doctor EMR & Print Rx
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Patient examination notes, Rx presets, printable letterhead, revenue (₹).
                  </p>
                </div>
              </div>
              <span className="pt-4 text-xs font-semibold text-purple-700 inline-flex items-center gap-1">
                <span>Enter Doctor Room</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>

            {/* 4. TV Display Mode */}
            <Link
              href="/display"
              target="_blank"
              className="group bg-slate-900 hover:bg-slate-950 text-white border border-slate-800 rounded-2xl p-5 transition flex flex-col justify-between shadow-sm"
            >
              <div className="space-y-3">
                <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-500/40 text-teal-300 flex items-center justify-center">
                  <Tv className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400">Waiting Lobby</span>
                  <h4 className="text-sm font-bold text-white mt-0.5 group-hover:text-teal-300 transition">
                    Waiting Room TV Board
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Full-screen 43"/55" lobby TV monitor with auto-chime and voice caller.
                  </p>
                </div>
              </div>
              <span className="pt-4 text-xs font-semibold text-teal-400 inline-flex items-center gap-1">
                <span>Launch TV Mode</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </div>
        </section>

        {/* Before vs After Comparison */}
        <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="max-w-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-teal-800">The Real-World Difference</h3>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              Why Dombivli doctors upgrade from paper slips
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-rose-50/50 border border-rose-200 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
                <XCircle className="w-4 h-4 text-rose-600" />
                <span>Without SlotCraft (Traditional Clinic)</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="text-rose-500">✕</span>
                  <span>12-15 tired commuters crammed into a small waiting room after train journey.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500">✕</span>
                  <span>Receptionist harassed every 5 minutes: <i>"Kitna time lagega? Mera number kab aayega?"</i></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500">✕</span>
                  <span>2 to 4 appointment no-shows every evening costing ₹1,500–₹3,000 daily in lost fees.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500">✕</span>
                  <span>Doctor runs 45 minutes late every evening due to unpredictable patient flow.</span>
                </li>
              </ul>
            </div>

            <div className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>With SlotCraft (Modern Smart Clinic)</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600">✓</span>
                  <span>Patients wait at home or sip tea on Phadke Road, watching their token tick down live.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600">✓</span>
                  <span>Peaceful, quiet reception area with 98% show-up rate and zero receptionist stress.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600">✓</span>
                  <span>One-tap WhatsApp alerts and auto-chime keeps the consultation queue moving like clockwork.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600">✓</span>
                  <span>Doctor finishes consultations on time with digital clinical notes and 1-click printable Rx.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Pricing Section (The Commercial Hustle) */}
        <section id="pricing" className="space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-800 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full">
              Transparent, Zero-Cost Setup
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Affordable plans that pay for themselves on Day 1
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Preventing just 2 missed appointments a month covers the entire fee. No hidden setup costs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Starter Plan */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Single Practice</span>
                <h4 className="text-xl font-bold text-slate-900 mt-0.5">Starter Clinic</h4>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-900">₹999</span>
                  <span className="text-xs text-slate-500">/ month</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Billed annually at ₹9,999 (2 months free)</p>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-700 border-t border-slate-100 pt-4">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Unlimited Live Digital Queue Tokens</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Receptionist Command Desk + Hotkeys</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Doctor EMR Room + Printable Rx</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Direct WhatsApp Reminder Links</span>
                </li>
              </ul>

              <a
                href="https://wa.me/917540015522?text=Namaste%20Balaji,%20I%20want%20to%20start%20the%2014-Day%20Starter%20Pilot."
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition"
              >
                Start 14-Day Free Pilot
              </a>
            </div>

            {/* Pro Plan */}
            <div className="bg-white border-2 border-teal-700 rounded-3xl p-6 shadow-md space-y-5 relative">
              <div className="absolute -top-3 right-6 bg-teal-700 text-white text-[10px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full">
                Most Popular
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800">Busy High-Volume Clinic</span>
                <h4 className="text-xl font-bold text-slate-900 mt-0.5">Pro Clinic + TV Display</h4>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-black text-teal-800">₹1,499</span>
                  <span className="text-xs text-slate-500">/ month</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Billed annually at ₹14,999</p>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-700 border-t border-slate-100 pt-4">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span><b>Everything in Starter</b></span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span><b>Waiting Room 43"/55" Lobby TV Display Mode</b></span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span><b>Automated Voice Synthesis & Hospital Chimes</b></span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Daily Accounting CSV Export for Cash Register</span>
                </li>
              </ul>

              <a
                href="https://wa.me/917540015522?text=Namaste%20Balaji,%20I%20want%20the%20Pro%20Clinic%20with%20TV%20Display."
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center w-full py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition shadow-sm active:scale-[0.98]"
              >
                Get Pro with Lobby TV
              </a>
            </div>
          </div>
        </section>

        {/* Doctor FAQ Section */}
        <section className="bg-slate-100/70 border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="max-w-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Common Questions</h3>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">Frequently Asked by Doctors</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1.5 shadow-sm">
              <p className="font-bold text-slate-900 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-teal-700 shrink-0" />
                <span>What about senior citizens who don't use smartphones?</span>
              </p>
              <p className="text-slate-600 leading-relaxed pl-6">
                Zero friction. Your receptionist simply clicks "Walk-In Patient" and types their name in 5 seconds. Their token immediately appears on the Waiting Room TV board with an audible chime.
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1.5 shadow-sm">
              <p className="font-bold text-slate-900 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-teal-700 shrink-0" />
                <span>Do I need to buy expensive tablets or special hardware?</span>
              </p>
              <p className="text-slate-600 leading-relaxed pl-6">
                No. SlotCraft runs in any browser on your receptionist's current computer or tablet, and on any smart TV or monitor you already have in the clinic.
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1.5 shadow-sm">
              <p className="font-bold text-slate-900 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-teal-700 shrink-0" />
                <span>How long does it take to set up our clinic?</span>
              </p>
              <p className="text-slate-600 leading-relaxed pl-6">
                Under 5 minutes. We set your doctor name, clinic timings, and service pricing. Your live booking link and reception desk are active immediately.
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1.5 shadow-sm">
              <p className="font-bold text-slate-900 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-teal-700 shrink-0" />
                <span>What if my internet disconnects during clinic hours?</span>
              </p>
              <p className="text-slate-600 leading-relaxed pl-6">
                SlotCraft runs on an embedded local database architecture. Your queue data is stored safely right on your local PC and never disappears.
              </p>
            </div>
          </div>
        </section>

        {/* Final CTA Banner */}
        <section className="bg-teal-700 text-white rounded-3xl p-8 sm:p-10 shadow-lg text-center space-y-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Ready to give your patients a 5-star clinic experience?
          </h2>
          <p className="text-xs sm:text-sm text-teal-100 max-w-xl mx-auto leading-relaxed">
            Let's set up a 14-day zero-risk trial for your clinic this week. No commitments, no hardware costs.
          </p>
          <div className="pt-2 flex justify-center">
            <a
              href="https://wa.me/917540015522?text=Namaste%20Balaji,%20I%20want%20to%20set%20up%20SlotCraft%20for%20my%20clinic."
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-white text-teal-900 font-bold text-sm rounded-xl hover:bg-teal-50 transition shadow-md inline-flex items-center gap-2 active:scale-[0.98]"
            >
              <MessageSquare className="w-4 h-4 text-teal-700" />
              <span>Message Balaji on WhatsApp (+91 75400 15522)</span>
            </a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            <p className="font-semibold text-slate-800">SlotCraft — Smart Clinic Queue & Appointment SaaS</p>
            <p>Designed for local medical & dental practices in Dombivli & MMR</p>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/book" className="hover:text-slate-900">Patient Booking</Link>
            <Link href="/reception" className="hover:text-slate-900">Reception Desk</Link>
            <Link href="/doctor" className="hover:text-slate-900">Doctor Room</Link>
            <Link href="/display" className="hover:text-slate-900">Lobby TV</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
