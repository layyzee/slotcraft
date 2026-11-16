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
  ArrowLeft,
  Tv,
  CheckCircle2
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
          // Voice announcement
          if (voiceEnabled && typeof window !== 'undefined' && 'speechSynthesis' in window) {
            try {
              const targetRoom = qData.nowServing?.room_number || 'Room 1';
              const utter = new SpeechSynthesisUtterance(
                `Token Number ${currentToken}, please proceed to Consultation ${targetRoom}`
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
  const nowServingList = queueData?.nowServingList || (nowServing ? [nowServing] : []);
  const waiting = queueData?.waiting || [];

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col justify-between selection:bg-teal-500 selection:text-slate-950">
      {/* Top Header Bar for Waiting Room Display */}
      <header className="border-b border-slate-800 bg-slate-950/95 px-4 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md">
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/"
            className="p-2 -ml-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition min-h-[40px] min-w-[40px] flex items-center justify-center"
            title="Back to Hub"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="w-10 h-10 rounded-2xl bg-teal-600 flex items-center justify-center font-black text-lg text-white shadow-sm shrink-0">
            SC
          </div>
          <div>
            <h1 className="text-base sm:text-xl font-black tracking-tight text-white flex items-center gap-2 sm:gap-3">
              <span>{clinic?.name || 'Smile Care Dental Clinic'}</span>
              <span className="text-[10px] sm:text-xs uppercase font-extrabold tracking-wider bg-teal-500/20 text-teal-400 border border-teal-500/30 px-2.5 py-0.5 rounded-full hidden xs:inline-block">
                Lobby TV Display
              </span>
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-400">Phadke Road, Opp. Dombivli Station (East)</p>
          </div>
        </div>

        {/* Live Clock & Action Controls */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="text-right pr-3 border-r border-slate-800 hidden sm:block">
            <p className="text-xl sm:text-2xl font-mono font-bold text-teal-400 tracking-wider leading-none">
              {currentTime || '07:00 PM'}
            </p>
            <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">Live Clinic Clock</p>
          </div>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2.5 rounded-xl border text-xs font-semibold transition min-h-[40px] min-w-[40px] flex items-center justify-center ${
              soundEnabled
                ? 'bg-teal-950/80 border-teal-700 text-teal-300'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
            title={soundEnabled ? 'Hospital Chime ON' : 'Chime MUTED'}
            aria-label="Toggle chime sound"
          >
            {soundEnabled ? <Volume2 className="w-5 h-5 text-teal-400" /> : <VolumeX className="w-5 h-5" />}
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition min-h-[40px] min-w-[40px] flex items-center justify-center"
            title="Toggle Fullscreen"
            aria-label="Toggle fullscreen display mode"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Main High-Impact Board Container */}
      <main className="flex-1 p-4 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center max-w-[1600px] w-full mx-auto">
        {/* Left Column: Big "Now Serving" Board (7 cols) */}
        <div className="lg:col-span-7 w-full flex flex-col justify-center">
          <div className="bg-slate-900 border-2 border-teal-500/50 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden text-center flex flex-col items-center justify-center min-h-[380px] sm:min-h-[460px]">
            <div className="absolute top-0 right-0 bg-teal-600 text-slate-950 text-[11px] font-black uppercase tracking-widest px-5 sm:px-6 py-2 rounded-bl-2xl">
              Now In Consultation
            </div>

            <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-slate-400 mb-2">
              Please Proceed to {nowServing?.room_number || 'Room 1'}
            </p>

            <div className="my-4 sm:my-6">
              <span className="text-7xl sm:text-9xl font-black text-teal-400 tracking-tight drop-shadow-lg">
                {nowServing ? `#${String(nowServing.token_number).padStart(2, '0')}` : '--'}
              </span>
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
                {nowServing ? nowServing.patient_name : 'Doctor Chamber Open'}
              </h2>
              <p className="text-sm sm:text-lg text-teal-300 font-medium">
                {nowServing ? nowServing.service_name : 'Please wait while doctor calls the next token'}
              </p>
            </div>

            <div className="mt-6 pt-5 border-t border-slate-800 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-slate-400 uppercase tracking-wider font-semibold">
              <span className="flex items-center gap-1.5 text-slate-300">
                <Stethoscope className="w-4 h-4 text-teal-400" />
                <span>{nowServing?.room_number === 'Room 2' ? 'Dr. Ananya Sen' : 'Dr. Rohan Joshi'}</span>
              </span>
              <span>·</span>
              <span className="text-teal-400">{nowServing?.room_number || 'Consultation Room 1'}</span>
            </div>
          </div>
        </div>

        {/* Right Column: "Next in Line" & QR Code (5 cols) */}
        <div className="lg:col-span-5 w-full flex flex-col justify-between space-y-6">
          {/* Waiting Board */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
                <span>Next in Line ({waiting.length} Waiting)</span>
              </h3>
              <span className="text-xs text-slate-400 font-semibold">Est. Wait</span>
            </div>

            <div className="space-y-2.5">
              {waiting.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs sm:text-sm">
                  Lobby is clear. No patients currently waiting.
                </div>
              ) : (
                waiting.slice(0, 4).map((pt, idx) => (
                  <div
                    key={pt.id}
                    className={`p-3.5 sm:p-4 rounded-2xl border flex items-center justify-between transition ${
                      idx === 0
                        ? 'bg-amber-950/40 border-amber-600/50 text-white shadow-2xs'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl font-black text-lg flex items-center justify-center shrink-0 ${
                        idx === 0 ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                      }`}>
                        #{pt.token_number}
                      </span>
                      <div className="min-w-0">
                        <p className="font-bold text-sm sm:text-base text-white truncate">{pt.patient_name}</p>
                        <p className="text-xs text-slate-400 truncate">{pt.service_name}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                        idx === 0
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'text-slate-400'
                      }`}>
                        {idx === 0 ? 'NEXT UP' : `+${idx * 15}m`}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Commuter Guidance Tip */}
            <div className="mt-4 pt-4 border-t border-slate-800 flex items-center gap-3 text-xs text-slate-400">
              <Train className="w-5 h-5 text-amber-500 shrink-0" />
              <span>
                <b>Phadke Road Commuters:</b> Fast locals arrive every 7 mins. Walk over from Dombivli platform when 1 patient remains ahead.
              </span>
            </div>
          </div>

          {/* QR Code Board Card */}
          <div className="bg-gradient-to-r from-teal-950/50 to-slate-900 border border-teal-800/40 rounded-3xl p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white p-1.5 flex items-center justify-center text-slate-950 shrink-0 shadow">
                <QrCode className="w-9 h-9" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Track Live Queue on Mobile</p>
                <p className="text-xs text-slate-400">
                  Scan QR or visit <span className="text-teal-300 font-mono">http://localhost:3001</span> to track while having tea outside.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Strip */}
      <footer className="bg-slate-950 border-t border-slate-800 px-4 sm:px-8 py-3 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-3">
          <span className="text-teal-400 font-bold">SlotCraft TV System</span>
          <span>·</span>
          <span>Smile Care Dental</span>
          <span>·</span>
          <span>Dombivli (E)</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Queue Synchronized</span>
        </div>
      </footer>
    </div>
  );
}
