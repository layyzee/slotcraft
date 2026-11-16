'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Building2,
  Stethoscope,
  Clock,
  Save,
  CheckCircle2,
  RefreshCw,
  Phone,
  MapPin,
  Sparkles,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

export default function ClinicSettings() {
  const [loading, setLoading] = useState(true);
  const [savingClinic, setSavingClinic] = useState(false);
  const [savingDoctor, setSavingDoctor] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Clinic state
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [address, setAddress] = useState('');
  const [locality, setLocality] = useState('');
  const [phone, setPhone] = useState('');
  const [openTime, setOpenTime] = useState('10:00 AM');
  const [closeTime, setCloseTime] = useState('09:30 PM');

  // Doctors list
  const [doctors, setDoctors] = useState([]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const loadSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.success && data.clinic) {
        setName(data.clinic.name || '');
        setTagline(data.clinic.tagline || '');
        setAddress(data.clinic.address || '');
        setLocality(data.clinic.locality || '');
        setPhone(data.clinic.phone || '');
        setOpenTime(data.clinic.open_time || '10:00 AM');
        setCloseTime(data.clinic.close_time || '09:30 PM');
        setDoctors(data.doctors || []);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSaveClinic = async (e) => {
    e.preventDefault();
    setSavingClinic(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_clinic',
          name,
          tagline,
          address,
          locality,
          phone,
          open_time: openTime,
          close_time: closeTime
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Clinic profile updated successfully!');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingClinic(false);
    }
  };

  const handleSaveDoctor = async (doc) => {
    setSavingDoctor(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_doctor',
          id: doc.id,
          name: doc.name,
          qualification: doc.qualification,
          specialization: doc.specialization,
          avg_consultation_minutes: doc.avg_consultation_minutes,
          room_number: doc.room_number || 'Room 1'
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`${doc.name}'s profile saved!`);
        await loadSettings();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingDoctor(false);
    }
  };

  const handleResetQueue = async () => {
    if (!confirm("Reset today's queue and reseed fresh Dombivli demo appointments?")) return;
    setResetting(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset_queue' })
      });
      const data = await res.json();
      if (data.success) {
        showToast("Queue reseeded with today's fresh appointments!");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-sm font-semibold text-slate-600 animate-pulse">Loading clinic settings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-teal-900 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 text-sm font-medium animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-5 h-5 text-teal-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="w-9 h-9 rounded-lg border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <span>Clinic Settings & Rooms</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                  Admin Desk
                </span>
              </h1>
              <p className="text-xs text-slate-500">Customize clinic branding, doctors, and commuter hours</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/reception"
              className="text-xs font-semibold text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50"
            >
              Reception Desk
            </Link>
            <Link
              href="/doctor"
              className="text-xs font-semibold text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50"
            >
              Doctor Chamber
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 w-full space-y-8">
        {/* Section 1: Clinic Profile */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Clinic Profile & Branding</h2>
                <p className="text-xs text-slate-500">Displayed on patient booking slips, TV mode, and WhatsApp links</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSaveClinic} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Clinic Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tagline / Specialty</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Address / Landmark</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Locality / City</label>
                <input
                  type="text"
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Official WhatsApp / Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Clinic Opens</label>
                <input
                  type="text"
                  value={openTime}
                  onChange={(e) => setOpenTime(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Evening Rush Closes (Phadke Rd)
                </label>
                <input
                  type="text"
                  value={closeTime}
                  onChange={(e) => setCloseTime(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
                />
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                disabled={savingClinic}
                className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-teal-800 hover:bg-teal-900 rounded-lg transition shadow-sm"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingClinic ? 'Saving...' : 'Save Clinic Profile'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Section 2: Multi-Doctor & Consultation Rooms */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                <Stethoscope className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Multi-Doctor & Consultation Rooms</h2>
                <p className="text-xs text-slate-500">
                  Assign doctor names, qualifications, and room numbers for concurrent patient routing
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {doctors.map((doc, idx) => (
              <div
                key={doc.id}
                className="p-5 border border-slate-200 rounded-xl bg-slate-50/70 hover:bg-slate-50 transition"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-white">
                      {doc.room_number || `Room ${idx + 1}`}
                    </span>
                    <span className="text-sm font-bold text-slate-900">{doc.name}</span>
                  </div>
                  <span className="text-xs font-semibold text-teal-700">Active Practicing Doctor</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Doctor Name</label>
                    <input
                      type="text"
                      value={doc.name}
                      onChange={(e) => {
                        const updated = [...doctors];
                        updated[idx].name = e.target.value;
                        setDoctors(updated);
                      }}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Room Assignment</label>
                    <input
                      type="text"
                      value={doc.room_number || `Room ${idx + 1}`}
                      onChange={(e) => {
                        const updated = [...doctors];
                        updated[idx].room_number = e.target.value;
                        setDoctors(updated);
                      }}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Qualifications</label>
                    <input
                      type="text"
                      value={doc.qualification}
                      onChange={(e) => {
                        const updated = [...doctors];
                        updated[idx].qualification = e.target.value;
                        setDoctors(updated);
                      }}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Specialization</label>
                    <input
                      type="text"
                      value={doc.specialization}
                      onChange={(e) => {
                        const updated = [...doctors];
                        updated[idx].specialization = e.target.value;
                        setDoctors(updated);
                      }}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-700"
                    />
                  </div>
                </div>

                <div className="flex justify-end mt-4">
                  <button
                    type="button"
                    onClick={() => handleSaveDoctor(doc)}
                    disabled={savingDoctor}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition"
                  >
                    <Save className="w-3.5 h-3.5 text-teal-700" />
                    <span>Save {doc.room_number || `Room ${idx + 1}`}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Demo Data & Reset Controls */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                <RefreshCw className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Demo Simulation & Queue Reset</h2>
                <p className="text-xs text-slate-500">
                  Reseed realistic Dombivli evening commuter rush appointments for presentation or testing
                </p>
              </div>
            </div>

            <button
              onClick={handleResetQueue}
              disabled={resetting}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 rounded-lg transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
              <span>{resetting ? 'Resetting...' : 'Reseed Demo Queue'}</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
