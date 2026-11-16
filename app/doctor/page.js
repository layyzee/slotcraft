'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Stethoscope,
  CheckCircle2,
  Clock,
  FileText,
  DollarSign,
  Users,
  ChevronRight,
  Save,
  Coffee,
  Check,
  Pill,
  Printer,
  Download,
  X,
  Settings,
  PhoneCall,
  User,
  Sparkles
} from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function DoctorPortal() {
  const [queueData, setQueueData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showRxModal, setShowRxModal] = useState(false);
  const [rxPatient, setRxPatient] = useState(null);
  const [notes, setNotes] = useState('');
  const [prescription, setPrescription] = useState('');
  const [saveStatus, setSaveStatus] = useState('');
  const [activeTab, setActiveTab] = useState('waiting');
  const [doctorRoom, setDoctorRoom] = useState('Room 1');
  const [mobileView, setMobileView] = useState('chamber'); // 'chamber' | 'queue' | 'history'

  const fetchQueue = async () => {
    try {
      const res = await fetch('/api/queue');
      const data = await res.json();
      if (data.success) {
        setQueueData(data);
        if (data.nowServing) {
          setNotes((prev) => (prev === '' ? data.nowServing.notes || '' : prev));
          setPrescription((prev) => (prev === '' ? data.nowServing.prescription || '' : prev));
        } else {
          setNotes('');
          setPrescription('');
        }
      }
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch queue:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSaveNotes = async () => {
    if (!queueData?.nowServing) return;
    setSaveStatus('saving');
    try {
      await fetch('/api/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_notes',
          appointmentId: queueData.nowServing.id,
          notes,
          prescription
        })
      });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(''), 2500);
    } catch (err) {
      console.error(err);
      setSaveStatus('error');
    }
  };

  const handleCompleteConsultation = async (andCallNext = true) => {
    if (!queueData?.nowServing) return;
    setActionLoading(true);
    try {
      await fetch('/api/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'complete_consultation',
          appointmentId: queueData.nowServing.id,
          notes,
          prescription
        })
      });

      if (andCallNext) {
        await fetch('/api/queue', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'call_next',
            roomNumber: doctorRoom,
            doctorId: doctorRoom === 'Room 2' ? 'dr-ananya-sen' : 'dr-rohan-joshi'
          })
        });
      }

      setNotes('');
      setPrescription('');
      await fetchQueue();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCallNextDirectly = async () => {
    setActionLoading(true);
    try {
      await fetch('/api/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'call_next',
          roomNumber: doctorRoom,
          doctorId: doctorRoom === 'Room 2' ? 'dr-ananya-sen' : 'dr-rohan-joshi'
        })
      });
      await fetchQueue();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const insertQuickDiagnosis = (tag) => {
    setNotes((prev) => (prev ? `${prev}; ${tag}` : tag));
  };

  const insertQuickRx = (rx) => {
    setPrescription((prev) => (prev ? `${prev}\n• ${rx}` : `• ${rx}`));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-teal-700 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-semibold">Opening Doctor Consultation Room...</span>
        </div>
      </div>
    );
  }

  const nowServing = queueData?.nowServing;
  const waiting = queueData?.waiting || [];
  const completed = queueData?.completed || [];
  const upcoming = queueData?.upcoming || [];
  const stats = queueData?.stats || {};

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-16 flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 space-y-6 w-full flex-1">
        {/* Practice Analytics Header */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                {doctorRoom} Active Chamber
              </span>
              <span className="text-xs text-slate-500 font-semibold hidden md:inline">
                Smile Care Dental · Phadke Road
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
              {doctorRoom === 'Room 1' ? 'Dr. Rohan Joshi (BDS, MDS)' : 'Dr. Ananya Sen (BDS, MDS)'}
            </h1>
            <p className="text-xs text-slate-500">
              {doctorRoom === 'Room 1' ? 'Orthodontics & Senior Dental Surgeon' : 'Pediatric & Cosmetic Dentistry'}
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-stretch sm:self-auto">
            {/* Room 1 vs Room 2 Toggle */}
            <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200 flex-1 sm:flex-none">
              <button
                onClick={() => setDoctorRoom('Room 1')}
                className={`flex-1 sm:flex-none px-3.5 py-2 text-xs font-bold rounded-lg transition min-h-[40px] ${
                  doctorRoom === 'Room 1'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Room 1
              </button>
              <button
                onClick={() => setDoctorRoom('Room 2')}
                className={`flex-1 sm:flex-none px-3.5 py-2 text-xs font-bold rounded-lg transition min-h-[40px] ${
                  doctorRoom === 'Room 2'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Room 2
              </button>
            </div>

            <Link
              href="/settings"
              className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 min-h-[40px] flex items-center gap-1.5"
              title="Settings"
            >
              <Settings className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Settings</span>
            </Link>
          </div>
        </div>

        {/* 4 Quick Stat Tiles */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Today's Revenue</span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
              ₹{(stats.revenueToday || 0).toLocaleString('en-IN')}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">Collected at reception</p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Patients Treated</span>
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-slate-900 mt-2">{stats.completedCount || 0}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Consultations finished</p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Waiting in Lobby</span>
              <Users className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-slate-900 mt-2">{stats.waitingCount || 0}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Ready outside</p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Avg Chair Time</span>
              <Clock className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-slate-900 mt-2">{stats.avgMinutesPerPatient || 20}m</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Paced Dombivli flow</p>
          </div>
        </section>

        {/* Mobile View Switcher (< 1024px) */}
        <div className="lg:hidden flex rounded-xl bg-slate-200/80 p-1 border border-slate-300/60">
          <button
            onClick={() => setMobileView('chamber')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition min-h-[40px] ${
              mobileView === 'chamber' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
            }`}
          >
            Active Consultation {nowServing ? `(#${nowServing.token_number})` : ''}
          </button>
          <button
            onClick={() => setMobileView('queue')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition min-h-[40px] flex items-center justify-center gap-1.5 ${
              mobileView === 'queue' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
            }`}
          >
            <span>Waiting Queue</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-900">
              {waiting.length}
            </span>
          </button>
        </div>

        {/* Main 2-Column Grid: Left EMR Notes / Right Queue Tabs */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Active Patient Consultation & Notes (7 cols) */}
          <div className={`lg:col-span-7 space-y-4 ${mobileView !== 'chamber' ? 'hidden lg:block' : ''}`}>
            {nowServing ? (
              <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs space-y-5">
                {/* Active Patient Bar */}
                <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-200 text-teal-900 flex flex-col items-center justify-center shrink-0">
                      <span className="text-[10px] font-bold uppercase text-teal-700">Token</span>
                      <span className="text-2xl font-black leading-none">#{nowServing.token_number}</span>
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-slate-900">{nowServing.patient_name}</h2>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span>📞 {nowServing.patient_phone}</span>
                        <span>·</span>
                        <span>Slot: {nowServing.slot_time}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-teal-900 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-xl inline-block">
                      {nowServing.service_name}
                    </span>
                    <p className="text-xs font-extrabold text-slate-900 mt-1">₹{nowServing.service_price}</p>
                  </div>
                </div>

                {/* Treatment Notes Field */}
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-teal-700" />
                        Clinical Examination & Notes
                      </label>
                      {saveStatus === 'saved' && (
                        <span className="text-xs text-emerald-700 font-bold flex items-center gap-1 animate-in fade-in">
                          <Check className="w-3.5 h-3.5" /> Saved
                        </span>
                      )}
                    </div>
                    <textarea
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. Tooth #36 deep caries, local anesthesia 2% lignocaine given. Composite laser filling completed."
                      className="w-full bg-white border border-slate-300 rounded-2xl p-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-700 focus:ring-1 focus:ring-teal-700"
                    />
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <span className="text-[11px] text-slate-400 self-center font-medium">Presets:</span>
                      {[
                        'Routine Examination & Scaling',
                        'Composite Laser Filling Done',
                        'RCT Canal Preparation & Dressing',
                        'Clear Aligner 3D Scan Taken'
                      ].map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => insertQuickDiagnosis(tag)}
                          className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg transition min-h-[30px]"
                        >
                          + {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Prescription */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                      <Pill className="w-3.5 h-3.5 text-blue-700" />
                      Prescription & Advice
                    </label>
                    <textarea
                      rows={2}
                      value={prescription}
                      onChange={(e) => setPrescription(e.target.value)}
                      placeholder="e.g. Tab Zerodol-SP BID x 3 days. Warm saline rinse 3x daily."
                      className="w-full bg-white border border-slate-300 rounded-2xl p-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-700 focus:ring-1 focus:ring-teal-700"
                    />
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <span className="text-[11px] text-slate-400 self-center font-medium">Rx:</span>
                      {[
                        'Amox-Clav 625mg BID x 5d',
                        'Zerodol-SP BID x 3d',
                        'Warm Saline Rinse 3x/day',
                        'Ketorol-DT SOS x 2d'
                      ].map((rx) => (
                        <button
                          key={rx}
                          type="button"
                          onClick={() => insertQuickRx(rx)}
                          className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg transition min-h-[30px]"
                        >
                          + {rx}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Consultation Actions Tray */}
                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={handleSaveNotes}
                      className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 min-h-[42px]"
                    >
                      <Save className="w-4 h-4 text-slate-600" />
                      <span>Save Notes</span>
                    </button>

                    <button
                      onClick={() => {
                        setRxPatient(nowServing);
                        setShowRxModal(true);
                      }}
                      className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 min-h-[42px]"
                      title="Preview and print official clinic prescription"
                    >
                      <Printer className="w-4 h-4 text-slate-600" />
                      <span>Print Rx</span>
                    </button>
                  </div>

                  <div className="w-full sm:w-auto flex items-center gap-2">
                    <button
                      onClick={() => handleCompleteConsultation(false)}
                      disabled={actionLoading}
                      className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition min-h-[42px]"
                    >
                      Finish Only
                    </button>

                    <button
                      onClick={() => handleCompleteConsultation(true)}
                      disabled={actionLoading}
                      className="flex-1 sm:flex-none px-5 py-2.5 bg-teal-800 hover:bg-teal-900 text-white text-xs font-extrabold rounded-xl transition shadow-sm flex items-center justify-center gap-1.5 min-h-[42px] active:scale-[0.98]"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{actionLoading ? 'Saving...' : 'Finish & Call Next'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-slate-200/90 rounded-3xl p-8 sm:p-12 text-center flex flex-col items-center justify-center min-h-[380px] shadow-xs">
                <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center mb-3">
                  <Stethoscope className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Consultation Chamber Ready</h3>
                <p className="text-xs text-slate-500 max-w-sm mt-1 mb-6">
                  {waiting.length > 0
                    ? `There are ${waiting.length} patients waiting in the front lobby.`
                    : 'No patients currently waiting in the lobby.'}
                </p>
                {waiting.length > 0 && (
                  <button
                    onClick={handleCallNextDirectly}
                    disabled={actionLoading}
                    className="px-6 py-3.5 bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold rounded-2xl shadow-sm transition flex items-center gap-2 active:scale-95 min-h-[48px]"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>Call Next Patient (#{waiting[0]?.token_number})</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Queue Sidebar & Tabs (5 cols) */}
          <div className={`lg:col-span-5 space-y-4 ${mobileView !== 'queue' ? 'hidden lg:block' : ''}`}>
            <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
              {/* Tab Selector */}
              <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
                <button
                  onClick={() => setActiveTab('waiting')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition min-h-[38px] flex items-center justify-center gap-1.5 ${
                    activeTab === 'waiting'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>Waiting</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-900">
                    {waiting.length}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('upcoming')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition min-h-[38px] flex items-center justify-center gap-1.5 ${
                    activeTab === 'upcoming'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>Upcoming</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-100 text-blue-900">
                    {upcoming.length}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('completed')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition min-h-[38px] flex items-center justify-center gap-1.5 ${
                    activeTab === 'completed'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>Done</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-900">
                    {completed.length}
                  </span>
                </button>
              </div>

              {/* Tab Content List */}
              <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                {activeTab === 'waiting' && (
                  waiting.length === 0 ? (
                    <div className="text-center p-8 text-xs text-slate-400">No patients waiting in lobby.</div>
                  ) : (
                    waiting.map((pt, idx) => (
                      <div
                        key={pt.id}
                        className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 font-black text-xs flex items-center justify-center shrink-0">
                            #{pt.token_number}
                          </span>
                          <div className="min-w-0">
                            <p className="font-bold text-xs text-slate-900 truncate">{pt.patient_name}</p>
                            <p className="text-[11px] text-slate-500 truncate">{pt.service_name}</p>
                          </div>
                        </div>
                        <span className="text-[11px] font-bold text-amber-800 shrink-0">
                          {idx === 0 ? 'Next Up' : `+${idx * 15}m`}
                        </span>
                      </div>
                    ))
                  )
                )}

                {activeTab === 'upcoming' && (
                  upcoming.length === 0 ? (
                    <div className="text-center p-8 text-xs text-slate-400">No more pre-booked slots today.</div>
                  ) : (
                    upcoming.map((pt) => (
                      <div
                        key={pt.id}
                        className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 transition flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="w-8 h-8 rounded-xl bg-blue-100 text-blue-900 font-black text-xs flex items-center justify-center shrink-0">
                            #{pt.token_number}
                          </span>
                          <div className="min-w-0">
                            <p className="font-bold text-xs text-slate-900 truncate">{pt.patient_name}</p>
                            <p className="text-[11px] text-slate-500 truncate">{pt.service_name}</p>
                          </div>
                        </div>
                        <span className="text-[11px] font-semibold text-slate-600 shrink-0">{pt.slot_time}</span>
                      </div>
                    ))
                  )
                )}

                {activeTab === 'completed' && (
                  completed.length === 0 ? (
                    <div className="text-center p-8 text-xs text-slate-400">No completed consultations yet.</div>
                  ) : (
                    completed.map((pt) => (
                      <div
                        key={pt.id}
                        className="p-3.5 rounded-2xl border border-slate-200 bg-white transition flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-900 font-black text-xs flex items-center justify-center shrink-0">
                            #{pt.token_number}
                          </span>
                          <div className="min-w-0">
                            <p className="font-bold text-xs text-slate-900 truncate">{pt.patient_name}</p>
                            <p className="text-[11px] text-slate-500 truncate">{pt.service_name}</p>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-emerald-800 shrink-0">₹{pt.service_price}</span>
                      </div>
                    ))
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Official Prescription Print Modal */}
      {showRxModal && rxPatient && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-sm">Print Prescription Letterhead</h3>
              <button
                onClick={() => setShowRxModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Simulated Medical Letterhead */}
            <div className="border border-slate-300 rounded-2xl p-6 bg-slate-50 text-xs font-mono space-y-3">
              <div className="text-center border-b pb-2">
                <p className="font-bold text-sm text-slate-900 uppercase">Smile Care Dental Clinic</p>
                <p className="text-[10px] text-slate-600">Phadke Road, Opp. Dombivli Station (East) · +91 98201 44552</p>
                <p className="text-[10px] text-teal-800 font-bold mt-0.5">
                  {doctorRoom === 'Room 1' ? 'Dr. Rohan Joshi (BDS, MDS)' : 'Dr. Ananya Sen (BDS, MDS)'}
                </p>
              </div>

              <div className="flex justify-between text-[11px]">
                <span>Patient: <b>{rxPatient.patient_name}</b></span>
                <span>Date: {new Date().toLocaleDateString('en-IN')}</span>
              </div>

              <div>
                <p className="font-bold text-slate-800">Clinical Diagnosis:</p>
                <p className="text-slate-700 italic">{notes || 'Routine dental consultation.'}</p>
              </div>

              <div>
                <p className="font-bold text-slate-800">Rx / Prescribed Medications:</p>
                <pre className="text-slate-800 whitespace-pre-wrap font-mono mt-1">
                  {prescription || '• Tab Zerodol-SP BID x 3 days\n• Warm saline gargle 3x/day'}
                </pre>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowRxModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2 text-xs font-bold text-white bg-teal-800 hover:bg-teal-900 rounded-xl shadow-xs flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Letterhead</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
