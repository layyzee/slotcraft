'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
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
  Download,
  MessageSquare,
  Printer,
  Settings,
  Train,
  Check,
  Building2
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { playClinicChime } from '@/lib/sound';
import { getWhatsAppTokenCalledUrl, getWhatsAppReminderUrl } from '@/lib/whatsapp';

export default function ReceptionDesk() {
  const [queueData, setQueueData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('Room 1');
  const [mobileTab, setMobileTab] = useState('waiting'); // 'waiting' | 'upcoming' | 'completed'

  // Walk-in modal state
  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [walkInName, setWalkInName] = useState('');
  const [walkInPhone, setWalkInPhone] = useState('');
  const [walkInService, setWalkInService] = useState('Comprehensive Dental Consultation & X-Ray');
  const [walkInRoom, setWalkInRoom] = useState('Room 1');
  const [lastCreatedTokenId, setLastCreatedTokenId] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
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

  const handleCallNext = async (room = selectedRoom) => {
    if (!queueData?.waiting?.length) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'call_next',
          roomNumber: room,
          doctorId: room === 'Room 2' ? 'dr-ananya-sen' : 'dr-rohan-joshi'
        })
      });
      const data = await res.json();
      if (soundEnabled) {
        playClinicChime();
      }
      if (data.nextPatient) {
        showToast(`Token #${data.nextPatient.token_number} (${data.nextPatient.patient_name}) called into ${room}`);
      }
      await fetchQueue();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  // Keyboard shortcut: Press 'N' to call next patient
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showWalkInModal) return;
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        handleCallNext(selectedRoom);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [queueData, showWalkInModal, soundEnabled, selectedRoom]);

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
          servicePrice: 500,
          roomNumber: walkInRoom,
          doctorId: walkInRoom === 'Room 2' ? 'dr-ananya-sen' : 'dr-rohan-joshi'
        })
      });
      const data = await res.json();
      if (data.id) {
        setLastCreatedTokenId(data.id);
      }
      showToast(`Walk-In registered: Token #${data.tokenNumber || ''} assigned to ${walkInRoom}`);
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
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-16 flex flex-col">
      {/* Global Navbar */}
      <Navbar />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full space-y-6 flex-1">
        {/* Reception Command Bar: Active Caller & Quick Stats */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            {/* Left: Active Consultation Status */}
            <div className="flex items-start sm:items-center gap-4 w-full lg:w-auto">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-teal-50 border border-teal-200 text-teal-900 flex flex-col items-center justify-center shrink-0 shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700">Token</span>
                <span className="text-2xl sm:text-3xl font-black leading-none mt-0.5">
                  {nowServing ? `#${String(nowServing.token_number).padStart(2, '0')}` : '--'}
                </span>
                <span className="text-[9px] font-bold text-teal-800 mt-1 uppercase">
                  {nowServing?.room_number || 'Room 1'}
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">
                    {nowServing ? `Inside ${nowServing.room_number || 'Room 1'}` : 'Chamber Available'}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 truncate mt-0.5">
                  {nowServing ? nowServing.patient_name : 'No Patient in Consultation'}
                </h2>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-600 mt-1">
                  {nowServing ? (
                    <>
                      <span>📞 {nowServing.patient_phone}</span>
                      <span>·</span>
                      <span className="font-medium text-slate-700 truncate max-w-[200px] sm:max-w-none">
                        {nowServing.service_name}
                      </span>
                      <span>·</span>
                      <span className="font-bold text-slate-900">₹{nowServing.service_price}</span>
                    </>
                  ) : (
                    <span>Tap "Call Next Patient" or press "N" on keyboard.</span>
                  )}
                </div>

                {nowServing && (
                  <div className="mt-2.5 flex items-center gap-2">
                    <a
                      href={getWhatsAppTokenCalledUrl(nowServing.patient_name, nowServing.patient_phone, nowServing.token_number)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 text-xs font-semibold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl inline-flex items-center gap-1.5 transition min-h-[36px]"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Ping on WhatsApp</span>
                    </a>
                    <Link
                      href={`/print/${nowServing.id}`}
                      target="_blank"
                      className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl inline-flex items-center gap-1.5 transition min-h-[36px]"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-500" />
                      <span>Print Slip</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Room Switcher & Big Call Next Button */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
              {/* Room 1 vs Room 2 Toggle */}
              <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedRoom('Room 1')}
                  className={`flex-1 sm:flex-none px-3.5 py-2 rounded-lg text-xs font-bold transition min-h-[40px] ${
                    selectedRoom === 'Room 1'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Room 1 (Dr. Rohan)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRoom('Room 2')}
                  className={`flex-1 sm:flex-none px-3.5 py-2 rounded-lg text-xs font-bold transition min-h-[40px] ${
                    selectedRoom === 'Room 2'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Room 2 (Dr. Ananya)
                </button>
              </div>

              {/* Call Next Button */}
              <button
                onClick={() => handleCallNext(selectedRoom)}
                disabled={actionLoading || rawWaiting.length === 0}
                className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm transition shadow-sm flex items-center justify-center gap-2.5 min-h-[48px] active:scale-[0.98] ${
                  rawWaiting.length > 0
                    ? 'bg-teal-700 hover:bg-teal-800 text-white cursor-pointer'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                }`}
              >
                <PhoneCall className="w-4 h-4 shrink-0" />
                <span>
                  {actionLoading
                    ? 'Calling...'
                    : rawWaiting.length > 0
                    ? `Call Next → ${selectedRoom}`
                    : 'No Waiting Patients'}
                </span>
                <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-teal-800/80 text-teal-100 rounded border border-teal-600/50">
                  Key N
                </kbd>
              </button>
            </div>
          </div>
        </div>

        {/* Walk-in Thermal Slip Notification Banner */}
        {lastCreatedTokenId && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-3 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-medium animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Walk-in patient registered! Need a printed receipt slip for the patient?</span>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <Link
                href={`/print/${lastCreatedTokenId}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-xs transition min-h-[36px]"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print 80mm Slip</span>
              </Link>
              <button
                onClick={() => setLastCreatedTokenId(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5"
                aria-label="Dismiss banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Action Controls Strip: Search & Walk-In Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, phone, or token #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-9 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-700 focus:ring-1 focus:ring-teal-700 min-h-[42px]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowWalkInModal(true)}
              className="flex-1 sm:flex-none px-4 py-2.5 text-xs font-bold rounded-xl bg-teal-800 hover:bg-teal-900 text-white transition flex items-center justify-center gap-2 shadow-sm min-h-[42px] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Walk-In Patient</span>
            </button>

            <a
              href="/api/export"
              download
              className="px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition flex items-center justify-center gap-1.5 shadow-2xs min-h-[42px]"
              title="Download today's daily register as CSV"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">Export CSV</span>
            </a>

            <button
              onClick={fetchQueue}
              className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition min-h-[42px] min-w-[42px] flex items-center justify-center"
              title="Refresh Queue"
              aria-label="Refresh Queue"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Segmented Tab Switcher (< 1024px) */}
        <div className="lg:hidden flex rounded-xl bg-slate-200/80 p-1 border border-slate-300/60">
          <button
            onClick={() => setMobileTab('waiting')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition min-h-[40px] flex items-center justify-center gap-1.5 ${
              mobileTab === 'waiting'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600'
            }`}
          >
            <span>Waiting</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-900">
              {waiting.length}
            </span>
          </button>
          <button
            onClick={() => setMobileTab('upcoming')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition min-h-[40px] flex items-center justify-center gap-1.5 ${
              mobileTab === 'upcoming'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600'
            }`}
          >
            <span>Upcoming</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-100 text-blue-900">
              {upcoming.length}
            </span>
          </button>
          <button
            onClick={() => setMobileTab('completed')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition min-h-[40px] flex items-center justify-center gap-1.5 ${
              mobileTab === 'completed'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600'
            }`}
          >
            <span>Completed</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-900">
              {completed.length}
            </span>
          </button>
        </div>

        {/* 3 Queue Kanban Columns (Desktop: 3 cols, Mobile: filtered by active tab) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Waiting in Clinic Lobby */}
          <div className={`space-y-3 ${mobileTab !== 'waiting' ? 'hidden lg:block' : ''}`}>
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <h3 className="font-bold text-sm text-slate-900">Waiting in Lobby</h3>
              </div>
              <span className="text-xs font-semibold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full">
                {waiting.length}
              </span>
            </div>

            {waiting.length === 0 ? (
              <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-8 text-center text-xs text-slate-400">
                {searchQuery ? 'No matching waiting patients.' : 'Lobby is clear. No patients currently waiting.'}
              </div>
            ) : (
              waiting.map((pt, idx) => (
                <div
                  key={pt.id}
                  className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:border-slate-300 transition space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-bold text-xs flex items-center justify-center shrink-0">
                        #{pt.token_number}
                      </span>
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-slate-900 truncate">{pt.patient_name}</p>
                        <p className="text-[11px] text-slate-500">📞 {pt.patient_phone}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-900 text-white">
                        {pt.room_number || 'Room 1'}
                      </span>
                      <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                        {idx === 0 ? 'Next Up' : `+${idx * 15}m`}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <p className="font-medium text-slate-900 truncate">{pt.service_name}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Slot: {pt.slot_time} · ₹{pt.service_price}</p>
                  </div>

                  {/* Responsive Action Buttons Tray */}
                  <div className="flex items-center justify-between pt-1 gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Link
                        href={`/print/${pt.id}`}
                        target="_blank"
                        className="text-[11px] text-slate-700 hover:text-slate-950 font-bold inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg transition min-h-[34px]"
                        title="Print 80mm POS Thermal Slip"
                      >
                        <Printer className="w-3.5 h-3.5 text-slate-500" />
                        <span>Slip</span>
                      </Link>

                      <Link
                        href={`/token/${pt.id}`}
                        target="_blank"
                        className="text-[11px] text-teal-800 hover:text-teal-950 font-bold inline-flex items-center gap-1 bg-teal-50 hover:bg-teal-100 px-2.5 py-1.5 rounded-lg transition min-h-[34px]"
                      >
                        <span>Token</span>
                        <ChevronRight className="w-3 h-3 text-teal-600" />
                      </Link>

                      <a
                        href={getWhatsAppReminderUrl(pt.patient_name, pt.patient_phone, pt.token_number, idx)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-emerald-800 hover:text-emerald-950 font-bold inline-flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded-lg transition min-h-[34px]"
                        title="Send WhatsApp reminder"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                        <span>WA</span>
                      </a>
                    </div>

                    <button
                      onClick={() => handleMarkNoShow(pt.id, pt.patient_name)}
                      className="text-[11px] text-slate-400 hover:text-rose-600 font-medium transition px-2 py-1"
                    >
                      No-Show
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Column 2: Upcoming Booked Appointments */}
          <div className={`space-y-3 ${mobileTab !== 'upcoming' ? 'hidden lg:block' : ''}`}>
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                <h3 className="font-bold text-sm text-slate-900">Upcoming / Commuting</h3>
              </div>
              <span className="text-xs font-semibold bg-blue-100 text-blue-900 px-2.5 py-0.5 rounded-full">
                {upcoming.length}
              </span>
            </div>

            {upcoming.length === 0 ? (
              <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-8 text-center text-xs text-slate-400">
                {searchQuery ? 'No matching upcoming appointments.' : 'No more pre-booked slots for today.'}
              </div>
            ) : (
              upcoming.map((pt) => (
                <div
                  key={pt.id}
                  className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:border-slate-300 transition space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 font-bold text-xs flex items-center justify-center shrink-0">
                        #{pt.token_number}
                      </span>
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-slate-900 truncate">{pt.patient_name}</p>
                        <p className="text-[11px] text-slate-500">📞 {pt.patient_phone}</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded shrink-0">
                      {pt.slot_time}
                    </span>
                  </div>

                  <div className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <p className="font-medium text-slate-900 truncate">{pt.service_name}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">₹{pt.service_price} · {pt.room_number || 'Room 1'}</p>
                  </div>

                  <div className="pt-1">
                    <button
                      onClick={() => handleMarkArrived(pt.id, pt.patient_name)}
                      className="w-full py-2.5 text-xs font-bold bg-slate-100 hover:bg-teal-50 hover:text-teal-900 hover:border-teal-200 text-slate-800 rounded-xl transition flex items-center justify-center gap-2 active:scale-[0.98] min-h-[42px]"
                    >
                      <CheckCircle2 className="w-4 h-4 text-teal-600" />
                      <span>Mark Patient Arrived in Lobby</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Column 3: Completed Consultations */}
          <div className={`space-y-3 ${mobileTab !== 'completed' ? 'hidden lg:block' : ''}`}>
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <h3 className="font-bold text-sm text-slate-900">Completed Today</h3>
              </div>
              <span className="text-xs font-semibold bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded-full">
                {completed.length}
              </span>
            </div>

            {completed.length === 0 ? (
              <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-8 text-center text-xs text-slate-400">
                Completed patient records will appear here.
              </div>
            ) : (
              completed.map((pt) => (
                <div
                  key={pt.id}
                  className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs space-y-1.5 opacity-90 hover:opacity-100 transition"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0">
                        #{pt.token_number}
                      </span>
                      <p className="font-semibold text-xs text-slate-900 truncate">{pt.patient_name}</p>
                    </div>
                    <span className="text-xs font-bold text-emerald-800 shrink-0">₹{pt.service_price}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">{pt.service_name}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* High-Craft Walk-In Modal */}
      {showWalkInModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Add Walk-In Patient</h3>
                <p className="text-xs text-slate-500">Issues next digital token immediately</p>
              </div>
              <button
                onClick={() => setShowWalkInModal(false)}
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 min-h-[40px] min-w-[40px] flex items-center justify-center"
                aria-label="Close modal"
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
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-700 focus:ring-1 focus:ring-teal-700 min-h-[44px]"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Mobile Number</label>
                <input
                  type="tel"
                  placeholder="98200XXXXX"
                  value={walkInPhone}
                  onChange={(e) => setWalkInPhone(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-700 focus:ring-1 focus:ring-teal-700 min-h-[44px]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Consultation Room / Doctor</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setWalkInRoom('Room 1')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition text-left min-h-[48px] ${
                      walkInRoom === 'Room 1'
                        ? 'border-teal-700 bg-teal-50 text-teal-900 ring-2 ring-teal-700/20'
                        : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div>Room 1</div>
                    <div className="text-[10px] font-normal text-slate-500">Dr. Rohan Joshi</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setWalkInRoom('Room 2')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition text-left min-h-[48px] ${
                      walkInRoom === 'Room 2'
                        ? 'border-teal-700 bg-teal-50 text-teal-900 ring-2 ring-teal-700/20'
                        : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div>Room 2</div>
                    <div className="text-[10px] font-normal text-slate-500">Dr. Ananya Sen</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Treatment / Reason</label>
                <select
                  value={walkInService}
                  onChange={(e) => setWalkInService(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-teal-700 focus:ring-1 focus:ring-teal-700 min-h-[44px]"
                >
                  <option value="Comprehensive Dental Consultation & X-Ray">Dental Consultation & X-Ray (₹500)</option>
                  <option value="Ultrasonic Scaling & Teeth Polishing">Scaling & Cleaning (₹1,200)</option>
                  <option value="Tooth-Colored Composite Laser Filling">Laser Tooth Filling (₹1,500)</option>
                  <option value="Single-Sitting Painless Root Canal (RCT)">Root Canal Treatment (₹4,500)</option>
                  <option value="Toothache Emergency / Relief">Emergency Toothache Relief (₹500)</option>
                </select>
              </div>

              <div className="pt-3 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowWalkInModal(false)}
                  className="flex-1 py-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 text-xs font-bold text-white bg-teal-800 hover:bg-teal-900 rounded-xl transition shadow-sm min-h-[44px] active:scale-[0.98]"
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
