'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Users,
  CheckCircle2,
  Clock,
  PhoneCall,
  ChevronRight,
  RefreshCw,
  Plus,
  Stethoscope,
  X,
  Search,
  Volume2,
  VolumeX,
  Keyboard,
  Download,
  MessageSquare
} from 'lucide-react';
import { playClinicChime } from '@/lib/sound';
import { getWhatsAppTokenCalledUrl, getWhatsAppReminderUrl } from '@/lib/whatsapp';

export default function ReceptionDesk() {
  const [queueData, setQueueData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [toastMessage, setToastMessage] = useState('');

  // Walk-in modal state
  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [walkInName, setWalkInName] = useState('');
  const [walkInPhone, setWalkInPhone] = useState('');
  const [walkInService, setWalkInService] = useState('Comprehensive Dental Consultation & X-Ray');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const fetchQueue = async () => {
    try {
      const res = await fetch('/api/queue');
      const data = await res.json();
      if (data.success) {
        setQueueData(data);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleCallNext = async () => {
    if (!queueData?.waiting?.length) return;
    setActionLoading(true);
    const nextPt = queueData.waiting[0];
    try {
      await fetch('/api/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'call_next' })
      });
      if (soundEnabled) {
        playClinicChime();
      }
      showToast(`Token #${nextPt.token_number} (${nextPt.patient_name}) called into Doctor Chamber`);
      await fetchQueue();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  // Keyboard shortcut: Press 'n' to call next patient
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showWalkInModal) return;
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        handleCallNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [queueData, showWalkInModal, soundEnabled]);

  const handleMarkArrived = async (id, name) => {
    try {
      await fetch('/api/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_arrived', appointmentId: id })
      });
      showToast(`${name || 'Patient'} marked arrived in clinic lobby`);
      await fetchQueue();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkNoShow = async (id, name) => {
    if (!confirm(`Mark ${name || 'patient'} as No-Show?`)) return;
    try {
      await fetch('/api/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_no_show', appointmentId: id })
      });
      showToast(`Marked as No-Show`);
      await fetchQueue();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddWalkIn = async (e) => {
    e.preventDefault();
    if (!walkInName.trim()) return;
    try {
      const res = await fetch('/api/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_walk_in',
          patientName: walkInName,
          patientPhone: walkInPhone,
          serviceName: walkInService,
          servicePrice: 500
        })
      });
      const data = await res.json();
      showToast(`Walk-In registered: Token #${data.tokenNumber || ''} assigned`);
      setWalkInName('');
      setWalkInPhone('');
      setShowWalkInModal(false);
      await fetchQueue();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-teal-700 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-semibold">Opening Reception Desk...</span>
        </div>
      </div>
    );
  }

  const nowServing = queueData?.nowServing;
  const rawWaiting = queueData?.waiting || [];
  const rawUpcoming = queueData?.upcoming || [];
  const rawCompleted = queueData?.completed || [];

  const filterPt = (list) => {
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (p) =>
        (p.patient_name && p.patient_name.toLowerCase().includes(q)) ||
        (p.patient_phone && p.patient_phone.includes(q)) ||
        String(p.token_number).includes(q)
    );
  };

  const waiting = filterPt(rawWaiting);
  const upcoming = filterPt(rawUpcoming);
  const completed = filterPt(rawCompleted);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg border border-slate-700 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <header className="border-b border-slate-200/80 bg-white/95 backdrop-blur sticky top-0 z-40 px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 -ml-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition active:scale-[0.97]"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="h-4 w-px bg-slate-200"></div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-slate-900 text-sm sm:text-base">Front Desk Reception</h1>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                Staff Desk
              </span>
            </div>
            <p className="text-[11px] text-slate-500">Smile Care Dental · Phadke Road, Dombivli East</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Audio Chime Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-lg border text-xs font-medium transition flex items-center gap-1.5 ${
              soundEnabled
                ? 'bg-teal-50 border-teal-200 text-teal-800'
                : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'
            }`}
            title={soundEnabled ? 'Chime sound is ON' : 'Chime sound is MUTED'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-teal-700" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden md:inline text-[11px]">{soundEnabled ? 'Chime On' : 'Muted'}</span>
          </button>

          <Link
            href="/doctor"
            className="text-xs text-slate-600 hover:text-slate-900 font-medium px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition hidden sm:inline-flex items-center gap-1.5"
          >
            <Stethoscope className="w-3.5 h-3.5 text-slate-500" />
            <span>Doctor Room</span>
          </Link>

          <button
            onClick={() => setShowWalkInModal(true)}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-teal-700 hover:bg-teal-800 text-white transition flex items-center gap-1.5 shadow-sm active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Walk-In Patient</span>
          </button>

          <a
            href="/api/export"
            download
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition flex items-center gap-1.5 shadow-sm"
            title="Download today's daily register as CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Export CSV</span>
          </a>

          <button
            onClick={fetchQueue}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition"
            title="Refresh Queue"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Main "Call Next" & Current Patient Strip */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 flex flex-col items-center justify-center shrink-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700">Token</span>
              <span className="text-2xl font-black leading-none mt-0.5">
                {nowServing ? `#${String(nowServing.token_number).padStart(2, '0')}` : '--'}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">
                  {nowServing ? 'Inside Doctor Room' : 'Doctor Room Available'}
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                {nowServing ? nowServing.patient_name : 'No Patient in Consultation'}
              </h2>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-1">
                {nowServing && (
                  <>
                    <span>📞 {nowServing.patient_phone}</span>
                    <span>·</span>
                    <span className="font-medium text-slate-700">{nowServing.service_name}</span>
                    <span>·</span>
                    <span className="font-semibold text-slate-900">₹{nowServing.service_price}</span>
                  </>
                )}
                {!nowServing && (
                  <span>Click "Call Next Patient" or press "N" on your keyboard.</span>
                )}
              </div>
              {nowServing && (
                <div className="mt-2">
                  <a
                    href={getWhatsAppTokenCalledUrl(nowServing.patient_name, nowServing.patient_phone, nowServing.token_number)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg inline-flex items-center gap-1 transition"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Ping Patient on WhatsApp</span>
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Large Action Caller with Hotkey Indicator */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            <button
              onClick={handleCallNext}
              disabled={actionLoading || rawWaiting.length === 0}
              className={`px-6 py-3.5 rounded-xl font-bold text-sm transition shadow-sm flex items-center justify-center gap-2.5 active:scale-[0.98] ${
                rawWaiting.length > 0
                  ? 'bg-teal-700 hover:bg-teal-800 text-white'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
              }`}
            >
              <PhoneCall className="w-4 h-4" />
              <span>
                {actionLoading
                  ? 'Calling Patient...'
                  : rawWaiting.length > 0
                  ? `Call Next Patient (#${rawWaiting[0]?.token_number})`
                  : 'No Waiting Patients'}
              </span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-teal-800/80 text-teal-100 rounded border border-teal-600/50">
                Key N
              </kbd>
            </button>
          </div>
        </div>

        {/* Live Filter / Search Bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search patient name, phone, or token..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-700 focus:ring-1 focus:ring-teal-700"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="text-xs text-slate-500 font-medium hidden sm:block">
            <span>Shortcut: </span>
            <kbd className="px-1.5 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded text-[10px] font-mono">
              N
            </kbd>{' '}
            <span>calls next</span>
          </div>
        </div>

        {/* 3 Queue Kanban Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Column 1: Waiting in Clinic Lobby */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <h3 className="font-bold text-sm text-slate-900">Waiting in Lobby</h3>
              </div>
              <span className="text-xs font-semibold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                {waiting.length}
              </span>
            </div>

            {waiting.length === 0 ? (
              <div className="bg-white border border-dashed border-slate-200 rounded-xl p-8 text-center text-xs text-slate-400">
                {searchQuery ? 'No matching waiting patients.' : 'Lobby is empty. No patients currently waiting.'}
              </div>
            ) : (
              waiting.map((pt, idx) => (
                <div
                  key={pt.id}
                  className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-slate-300 transition space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 font-bold text-xs flex items-center justify-center">
                        #{pt.token_number}
                      </span>
                      <div>
                        <p className="font-bold text-sm text-slate-900">{pt.patient_name}</p>
                        <p className="text-[11px] text-slate-500">📞 {pt.patient_phone}</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                      {idx === 0 ? 'Next' : `+${idx * 15}m`}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
                    <p className="font-medium text-slate-800">{pt.service_name}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Slot: {pt.slot_time} · ₹{pt.service_price}</p>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/token/${pt.id}`}
                        target="_blank"
                        className="text-[11px] text-teal-700 hover:text-teal-900 font-semibold inline-flex items-center gap-0.5"
                      >
                        <span>Live Token</span>
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                      <a
                        href={getWhatsAppReminderUrl(pt.patient_name, pt.patient_phone, pt.token_number, idx)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-emerald-700 hover:text-emerald-900 font-semibold inline-flex items-center gap-1"
                        title="Send WhatsApp reminder"
                      >
                        <MessageSquare className="w-3 h-3 text-emerald-600" />
                        <span>WhatsApp</span>
                      </a>
                    </div>
                    <button
                      onClick={() => handleMarkNoShow(pt.id, pt.patient_name)}
                      className="text-[11px] text-slate-400 hover:text-rose-600 font-medium transition"
                    >
                      No-Show
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Column 2: Upcoming Booked Appointments */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                <h3 className="font-bold text-sm text-slate-900">Upcoming / Commuting</h3>
              </div>
              <span className="text-xs font-semibold bg-blue-100 text-blue-900 px-2 py-0.5 rounded-full">
                {upcoming.length}
              </span>
            </div>

            {upcoming.length === 0 ? (
              <div className="bg-white border border-dashed border-slate-200 rounded-xl p-8 text-center text-xs text-slate-400">
                {searchQuery ? 'No matching upcoming appointments.' : 'No more pre-booked slots scheduled for today.'}
              </div>
            ) : (
              upcoming.map((pt) => (
                <div
                  key={pt.id}
                  className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-slate-300 transition space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 font-bold text-xs flex items-center justify-center">
                        #{pt.token_number}
                      </span>
                      <div>
                        <p className="font-bold text-sm text-slate-900">{pt.patient_name}</p>
                        <p className="text-[11px] text-slate-500">📞 {pt.patient_phone}</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {pt.slot_time}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
                    <p className="font-medium text-slate-800">{pt.service_name}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">₹{pt.service_price}</p>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => handleMarkArrived(pt.id, pt.patient_name)}
                      className="w-full py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded transition flex items-center justify-center gap-1.5 active:scale-[0.98]"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                      <span>Mark Patient Arrived</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Column 3: Completed Consultations */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <h3 className="font-bold text-sm text-slate-900">Completed Today</h3>
              </div>
              <span className="text-xs font-semibold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full">
                {completed.length}
              </span>
            </div>

            {completed.length === 0 ? (
              <div className="bg-white border border-dashed border-slate-200 rounded-xl p-8 text-center text-xs text-slate-400">
                Completed patient records will appear here.
              </div>
            ) : (
              completed.map((pt) => (
                <div
                  key={pt.id}
                  className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm space-y-1.5 opacity-90 hover:opacity-100 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        #{pt.token_number}
                      </span>
                      <p className="font-semibold text-xs text-slate-900">{pt.patient_name}</p>
                    </div>
                    <span className="text-xs font-bold text-emerald-700">₹{pt.service_price}</span>
                  </div>
                  <p className="text-[11px] text-slate-500">{pt.service_name}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Walk-In Patient Modal */}
      {showWalkInModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Add Walk-In Patient</h3>
                <p className="text-xs text-slate-500">Issues next digital token immediately</p>
              </div>
              <button
                onClick={() => setShowWalkInModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddWalkIn} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Patient Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kulkarni"
                  value={walkInName}
                  onChange={(e) => setWalkInName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-700 focus:ring-1 focus:ring-teal-700"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Mobile Number</label>
                <input
                  type="tel"
                  placeholder="98200XXXXX"
                  value={walkInPhone}
                  onChange={(e) => setWalkInPhone(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-700 focus:ring-1 focus:ring-teal-700"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Reason / Service</label>
                <select
                  value={walkInService}
                  onChange={(e) => setWalkInService(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm text-slate-900 focus:outline-none focus:border-teal-700 focus:ring-1 focus:ring-teal-700"
                >
                  <option value="Comprehensive Dental Consultation & X-Ray">Dental Consultation & X-Ray (₹500)</option>
                  <option value="Ultrasonic Scaling & Teeth Polishing">Scaling & Cleaning (₹1,200)</option>
                  <option value="Tooth-Colored Composite Laser Filling">Laser Tooth Filling (₹1,500)</option>
                  <option value="Single-Sitting Painless Root Canal (RCT)">Root Canal Treatment (₹4,500)</option>
                  <option value="Toothache Emergency / Relief">Emergency Toothache Relief (₹500)</option>
                </select>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowWalkInModal(false)}
                  className="flex-1 py-2.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition shadow-sm active:scale-[0.98]"
                >
                  Add to Waiting Lobby
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
