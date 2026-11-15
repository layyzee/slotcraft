'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Clock,
  MapPin,
  ShieldCheck,
  Stethoscope,
  QrCode,
  Train,
  ArrowLeft
} from 'lucide-react';
import { playClinicChime } from '@/lib/sound';

export default function DisplayPage() {
  const [queueData, setQueueData] = useState(null);
  const [clinic, setClinic] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const lastCalledTokenRef = useRef(null);

  // Clock ticker
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchQueue = async () => {
    try {
      const [qRes, cRes] = await Promise.all([
        fetch('/api/queue'),
        fetch('/api/clinic')
      ]);
      const qData = await qRes.json();
      const cData = await cRes.json();

      if (cData.success) setClinic(cData.clinic);
      if (qData.success) {
        setQueueData(qData);

        const currentToken = qData.nowServing ? qData.nowServing.token_number : null;
        if (currentToken && lastCalledTokenRef.current !== currentToken) {
          // Play hospital chime
          if (soundEnabled) {
            playClinicChime();
          }
          // Voice announce
          if (voiceEnabled && typeof window !== 'undefined' && 'speechSynthesis' in window) {
            try {
              const utter = new SpeechSynthesisUtterance(
                `Token Number ${currentToken}, please proceed to Consultation Room 1`
              );
              utter.rate = 0.9;
              window.speechSynthesis.speak(utter);
            } catch (e) {
              console.debug(e);
            }
          }
          lastCalledTokenRef.current = currentToken;
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 3000);
    return () => clearInterval(interval);
  }, [soundEnabled, voiceEnabled]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const nowServing = queueData?.nowServing;
  const waiting = queueData?.waiting || [];

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans flex flex-col justify-between selection:bg-teal-500 selection:text-slate-950 overflow-hidden">
      {/* Top Header Bar for Waiting Room */}
      <header className="border-b border-slate-800 bg-slate-950/80 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="p-2 -ml-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            title="Back to Hub"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center font-bold text-lg text-white">
            SC
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-3">
              <span>{clinic?.name || 'Smile Care Dental & Orthodontic Clinic'}</span>
              <span className="text-xs uppercase font-bold tracking-wider bg-teal-500/20 text-teal-400 border border-teal-500/30 px-2.5 py-0.5 rounded-full">
                Lobby Live Display
              </span>
            </h1>
            <p className="text-xs text-slate-400">Phadke Road, Opp. Dombivli Railway Station (East)</p>
          </div>
        </div>

        {/* Live Clock & Controls */}
        <div className="flex items-center gap-4">
          <div className="text-right pr-4 border-r border-slate-800 hidden sm:block">
            <p className="text-2xl font-mono font-bold text-teal-400 tracking-wider leading-none">
              {currentTime}
            </p>
            <p className="text-[11px] text-slate-500 mt-1 uppercase tracking-wider">Live Clinic Sync</p>
          </div>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2.5 rounded-xl border text-xs font-semibold transition flex items-center gap-1.5 ${
              soundEnabled
                ? 'bg-teal-950/70 border-teal-700 text-teal-300'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
            title="Toggle Chime"
          >
            {soundEnabled ? <Volume2 className="w-5 h-5 text-teal-400" /> : <VolumeX className="w-5 h-5" />}
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Main High-Impact Board */}
      <main className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-[1600px] w-full mx-auto">
        {/* Left Column: Big "Now Serving" Card (7 cols) */}
        <div className="lg:col-span-7 h-full flex flex-col justify-center">
          <div className="bg-slate-950 border-2 border-teal-500/40 rounded-3xl p-10 shadow-2xl relative overflow-hidden text-center flex flex-col items-center justify-center min-h-[460px]">
            <div className="absolute top-0 right-0 bg-teal-600 text-slate-950 text-xs font-black uppercase tracking-widest px-6 py-2 rounded-bl-2xl">
              Now In Consultation
            </div>

            <p className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-2">
              Please Proceed to Chamber 1
            </p>

            <div className="my-6">
              <span className="text-8xl sm:text-9xl font-black text-teal-400 tracking-tight drop-shadow-md">
                {nowServing ? `#${String(nowServing.token_number).padStart(2, '0')}` : '--'}
              </span>
            </div>

            <div className="mt-2 space-y-1">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
                {nowServing ? nowServing.patient_name : 'Consultation Chamber Open'}
              </h2>
              <p className="text-lg text-teal-300 font-medium">
                {nowServing ? nowServing.service_name : 'Doctor will call the next patient shortly'}
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-center gap-6 text-xs text-slate-400 uppercase tracking-wider font-semibold">
              <span className="flex items-center gap-1.5">
                <Stethoscope className="w-4 h-4 text-teal-400" />
                Dr. Rohan Joshi (BDS, MDS)
              </span>
              <span>·</span>
              <span>Consultation Room 1</span>
            </div>
          </div>
        </div>

        {/* Right Column: "Next in Line" & QR Code (5 cols) */}
        <div className="lg:col-span-5 h-full flex flex-col justify-between space-y-6">
          {/* Waiting Board */}
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
                <span>Next in Line ({waiting.length} Waiting)</span>
              </h3>
              <span className="text-xs text-slate-400 font-semibold">Est. Call Time</span>
            </div>

            <div className="space-y-3 flex-1">
              {waiting.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm">
                  No patients currently waiting in lobby.
                </div>
              ) : (
                waiting.slice(0, 4).map((pt, idx) => (
                  <div
                    key={pt.id}
                    className={`p-4 rounded-2xl border flex items-center justify-between transition ${
                      idx === 0
                        ? 'bg-amber-950/40 border-amber-600/50 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className={`w-12 h-12 rounded-xl font-black text-xl flex items-center justify-center shrink-0 ${
                        idx === 0 ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                      }`}>
                        #{pt.token_number}
                      </span>
                      <div>
                        <p className="font-bold text-base text-white">{pt.patient_name}</p>
                        <p className="text-xs text-slate-400">{pt.service_name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        idx === 0 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400'
                      }`}>
                        {idx === 0 ? 'NEXT UP' : `+${idx * 15} min`}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Commuter Tip */}
            <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center gap-3 text-xs text-slate-400">
              <Train className="w-5 h-5 text-teal-400 shrink-0" />
              <span>
                <b>Phadke Road Commuters:</b> Fast locals arrive every 7 mins. Start walking from the platform when 1 patient remains ahead.
              </span>
            </div>
          </div>

          {/* QR Code Card */}
          <div className="bg-gradient-to-r from-teal-950/50 to-slate-950 border border-teal-800/40 rounded-2xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-white p-1 flex items-center justify-center text-slate-950 shrink-0 shadow">
                <QrCode className="w-10 h-10" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Track Your Token on Your Phone</p>
                <p className="text-xs text-slate-400">Scan QR code or visit <span className="text-teal-300 font-mono">http://localhost:3001</span> to track while having tea outside.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Ticker Footer */}
      <footer className="bg-slate-950 border-t border-slate-800 px-8 py-3 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-4">
          <span className="text-teal-400 font-semibold">SlotCraft Digital Display</span>
          <span>·</span>
          <span>Smile Care Dental Clinic</span>
          <span>·</span>
          <span>Phadke Road, Dombivli East</span>
        </div>
        <div>
          <span>Emergency Assistance: <b>+91 98201 44552</b></span>
        </div>
      </footer>
    </div>
  );
}
