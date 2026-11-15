'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
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
  ExternalLink,
  Printer,
  Download,
  X
} from 'lucide-react';

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
          body: JSON.stringify({ action: 'call_next' })
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
        body: JSON.stringify({ action: 'call_next' })
      });
      await fetchQueue();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const insertQuickDiagnosis = (tag) => {
    setNotes((prev) => (prev ? `${prev}\n• ${tag}` : `• ${tag}`));
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
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-16">
      {/* Top Navbar */}
      <header className="border-b border-slate-200/80 bg-white sticky top-0 z-40 px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 -ml-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="h-4 w-px bg-slate-200"></div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-slate-900 text-sm sm:text-base">Dr. Rohan Joshi</h1>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-teal-800 px-2 py-0.5 rounded border border-teal-200">
                Consultation Room 1
              </span>
            </div>
            <p className="text-[11px] text-slate-500">Smile Care Dental Clinic · Phadke Road, Dombivli (E)</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/api/export"
            download
            className="text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg transition hidden md:inline-flex items-center gap-1.5 shadow-sm"
            title="Download today's clinical register as CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </a>

          <Link
            href="/reception"
            className="text-xs text-slate-600 hover:text-slate-900 font-medium px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition hidden sm:inline-flex items-center gap-1.5"
          >
            <span>Reception Desk</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </Link>
          <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Live Sync Active</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Practice Analytics Cards */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today's Revenue</span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-2">
              ₹{(stats.revenueToday || 0).toLocaleString('en-IN')}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">Collected at front desk</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Patients Treated</span>
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-2">{stats.completedCount || 0}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Completed today</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Waiting in Lobby</span>
              <Users className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-2">{stats.waitingCount || 0}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Checked in outside</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Avg Consultation</span>
              <Clock className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-2">{stats.avgMinutesPerPatient || 20}m</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Smooth flow</p>
          </div>
        </section>

        {/* Main Grid: Patient Examination & Queue Tabs */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Active Patient Examination (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {nowServing ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 flex flex-col items-center justify-center shrink-0">
                      <span className="text-[10px] font-bold uppercase text-teal-700">Token</span>
                      <span className="text-2xl font-black leading-none">#{nowServing.token_number}</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">{nowServing.patient_name}</h2>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span>📞 {nowServing.patient_phone}</span>
                        <span>·</span>
                        <span>Slot: {nowServing.slot_time}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-lg inline-block">
                      {nowServing.service_name}
                    </span>
                    <p className="text-xs font-bold text-slate-900 mt-1">₹{nowServing.service_price}</p>
                  </div>
                </div>

                {/* Treatment Notes Field */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-teal-700" />
                        Clinical Examination & Diagnosis
                      </label>
                      {saveStatus === 'saved' && (
                        <span className="text-xs text-teal-700 font-semibold flex items-center gap-1">
                          <Check className="w-3 h-3" /> Saved
                        </span>
                      )}
                    </div>
                    <textarea
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. Tooth #36 deep occlusal caries, local anesthesia 2% lignocaine given. Composite restoration completed."
                      className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-700 focus:ring-1 focus:ring-teal-700"
                    />
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <span className="text-xs text-slate-400 self-center">Presets:</span>
                      {[
                        'Routine Examination & Scaling',
                        'Composite Filling Done',
                        'RCT Canal Preparation',
                        'Clear Aligner Scan Taken'
                      ].map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => insertQuickDiagnosis(tag)}
                          className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded transition"
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
                      Prescription & Post-Op Instructions
                    </label>
                    <textarea
                      rows={2}
                      value={prescription}
                      onChange={(e) => setPrescription(e.target.value)}
                      placeholder="e.g. Tab Zerodol-SP BID x 3 days. Warm saline rinse 3x daily."
                      className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-700 focus:ring-1 focus:ring-teal-700"
                    />
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <span className="text-xs text-slate-400 self-center">Rx:</span>
                      {[
                        'Amox-Clav 625mg BID x 5d',
                        'Zerodol-SP BID x 3d',
                        'Warm Saline Rinse 3x/day'
                      ].map((rx) => (
                        <button
                          key={rx}
                          type="button"
                          onClick={() => insertQuickRx(rx)}
                          className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded transition"
                        >
                          + {rx}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={handleSaveNotes}
                      className="flex-1 sm:flex-none px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5 text-slate-600" />
                      <span>Save Notes</span>
                    </button>

                    <button
                      onClick={() => {
                        setRxPatient(nowServing);
                        setShowRxModal(true);
                      }}
                      className="flex-1 sm:flex-none px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5"
                      title="Preview and print official clinic prescription"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-600" />
                      <span>Print Rx</span>
                    </button>
                  </div>

                  <div className="w-full sm:w-auto flex items-center gap-2">
                    <button
                      onClick={() => handleCompleteConsultation(false)}
                      disabled={actionLoading}
                      className="flex-1 sm:flex-none px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition"
                    >
                      Finish Consultation
                    </button>

                    <button
                      onClick={() => handleCompleteConsultation(true)}
                      disabled={actionLoading}
                      className="flex-1 sm:flex-none px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-lg transition shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{actionLoading ? 'Saving...' : 'Complete & Call Next'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center flex flex-col items-center justify-center min-h-[340px] shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Consultation Chamber is Ready</h3>
                <p className="text-xs text-slate-500 max-w-sm mt-1 mb-5">
                  {waiting.length > 0
                    ? `There are ${waiting.length} patients waiting in the front lobby.`
                    : 'No patients currently waiting in the lobby.'}
                </p>
                {waiting.length > 0 && (
                  <button
                    onClick={handleCallNextDirectly}
                    disabled={actionLoading}
                    className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-lg transition shadow-sm flex items-center gap-2"
                  >
                    <Users className="w-4 h-4" />
                    <span>Call Token #{waiting[0]?.token_number} ({waiting[0]?.patient_name})</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Right: Queue Tabs (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl p-1.5 flex items-center gap-1 shadow-sm">
              <button
                onClick={() => setActiveTab('waiting')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
                  activeTab === 'waiting' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Waiting ({waiting.length})
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
                  activeTab === 'completed' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Treated ({completed.length})
              </button>
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
                  activeTab === 'upcoming' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Booked ({upcoming.length})
              </button>
            </div>

            {activeTab === 'waiting' && (
              <div className="space-y-2">
                {waiting.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-xs text-slate-400">
                    No patients waiting in lobby.
                  </div>
                ) : (
                  waiting.map((pt, idx) => (
                    <div
                      key={pt.id}
                      className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 font-bold text-xs flex items-center justify-center">
                          #{pt.token_number}
                        </span>
                        <div>
                          <p className="font-bold text-xs text-slate-900">{pt.patient_name}</p>
                          <p className="text-[11px] text-slate-500">{pt.service_name}</p>
                        </div>
                      </div>
                      <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                        {idx === 0 ? 'Next' : `+${idx * 15}m`}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'completed' && (
              <div className="space-y-2">
                {completed.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-xs text-slate-400">
                    No consultations completed yet today.
                  </div>
                ) : (
                  completed.map((pt) => (
                    <div
                      key={pt.id}
                      className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            #{pt.token_number}
                          </span>
                          <span className="font-semibold text-xs text-slate-900">{pt.patient_name}</span>
                        </div>
                        <span className="text-xs font-bold text-emerald-800">₹{pt.service_price}</span>
                      </div>
                      <p className="text-[11px] text-slate-500">{pt.service_name}</p>
                      {pt.notes && (
                        <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
                          {pt.notes}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'upcoming' && (
              <div className="space-y-2">
                {upcoming.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-xs text-slate-400">
                    No upcoming appointments booked for today.
                  </div>
                ) : (
                  upcoming.map((pt) => (
                    <div
                      key={pt.id}
                      className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 font-bold text-xs flex items-center justify-center">
                          #{pt.token_number}
                        </span>
                        <div>
                          <p className="font-bold text-xs text-slate-900">{pt.patient_name}</p>
                          <p className="text-[11px] text-slate-500">{pt.slot_time} · ₹{pt.service_price}</p>
                        </div>
                      </div>
                      <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                        Pre-booked
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Printable Prescription Slip Modal */}
      {showRxModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs uppercase font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                Official Clinical Prescription
              </span>
              <button
                onClick={() => setShowRxModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Letterhead */}
            <div className="text-center pb-4 border-b border-slate-200">
              <h3 className="text-lg font-black tracking-tight text-slate-900">
                SMILE CARE DENTAL & ORTHODONTIC CLINIC
              </h3>
              <p className="text-xs font-semibold text-teal-800">
                Dr. Rohan Joshi — BDS, MDS (Orthodontics), Reg No: MAH-48291
              </p>
              <p className="text-[11px] text-slate-500">
                Shop No. 4, Madhuban Complex, Phadke Road, Opp. Dombivli Station (East) · Phone: +91 98201 44552
              </p>
            </div>

            {/* Patient Header */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-slate-500">Patient Name:</p>
                <p className="font-bold text-slate-900">{rxPatient?.patient_name || 'Rahul Kulkarni'}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-500">Date & Token:</p>
                <p className="font-bold text-slate-900">
                  {new Date().toLocaleDateString('en-IN')} (Token #{rxPatient?.token_number || '04'})
                </p>
              </div>
            </div>

            {/* Clinical Notes */}
            <div className="space-y-1 text-xs">
              <p className="font-bold text-slate-700 uppercase tracking-wider">Clinical Examination & Diagnosis:</p>
              <p className="p-3 bg-white border border-slate-200 rounded-lg text-slate-800 whitespace-pre-line min-h-[60px]">
                {notes || rxPatient?.notes || 'Dental Examination completed. Oral hygiene instructions given.'}
              </p>
            </div>

            {/* Prescription */}
            <div className="space-y-1 text-xs">
              <p className="font-bold text-slate-700 uppercase tracking-wider">Rx (Prescribed Medications & Care):</p>
              <p className="p-3 bg-white border border-slate-200 rounded-lg text-slate-800 whitespace-pre-line min-h-[60px] font-mono text-xs">
                {prescription || rxPatient?.prescription || 'Tab Zerodol-SP BID x 3 days\nWarm saline rinses 3x daily\nFollow up after 7 days'}
              </p>
            </div>

            {/* Signature Area */}
            <div className="pt-4 flex items-end justify-between text-xs text-slate-500 border-t border-slate-100">
              <div>
                <p>Consultation Fee: ₹{rxPatient?.service_price || 500} (Paid)</p>
              </div>
              <div className="text-right">
                <div className="h-8 border-b border-slate-300 w-32 mb-1"></div>
                <p className="font-semibold text-slate-700">Dr. Rohan Joshi (MDS)</p>
              </div>
            </div>

            {/* Print Action */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowRxModal(false)}
                className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition shadow-sm flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Prescription</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
