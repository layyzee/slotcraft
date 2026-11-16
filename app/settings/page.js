'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
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
import Navbar from '@/components/Navbar';

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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans pb-16">
      <Navbar />

      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-sm font-medium animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 w-full space-y-6 flex-1">
        {/* Page Title */}
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <span>Clinic Settings & Rooms</span>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800">
              Admin Desk
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure clinic branding, doctor credentials, multi-room assignments, and commuter rush hours.
          </p>
        </div>

        {/* Section 1: Clinic Profile */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-800 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Clinic Profile & Branding</h2>
              <p className="text-xs text-slate-500">Appears on patient booking slips, TV mode, and WhatsApp messages</p>
            </div>
          </div>

          <form onSubmit={handleSaveClinic} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Clinic Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-700 min-h-[44px]"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Tagline / Specialty</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-700 min-h-[44px]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Address / Landmark</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-700 min-h-[44px]"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Locality / City</label>
                <input
                  type="text"
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-700 min-h-[44px]"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Official WhatsApp / Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-700 min-h-[44px]"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Clinic Opens</label>
                <input
                  type="text"
                  value={openTime}
                  onChange={(e) => setOpenTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-700 min-h-[44px]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Evening Rush Closes (Phadke Rd)
                </label>
                <input
                  type="text"
                  value={closeTime}
                  onChange={(e) => setCloseTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-700 min-h-[44px]"
                />
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                disabled={savingClinic}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-xs font-bold text-white bg-teal-800 hover:bg-teal-900 rounded-xl transition shadow-xs min-h-[44px]"
              >
                <Save className="w-4 h-4" />
                <span>{savingClinic ? 'Saving...' : 'Save Clinic Profile'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Section 2: Multi-Doctor & Consultation Rooms */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-800 flex items-center justify-center">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Multi-Doctor & Consultation Rooms</h2>
              <p className="text-xs text-slate-500">
                Doctor credentials and room assignments for concurrent patient routing
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {doctors.map((doc, idx) => (
              <div
                key={doc.id}
                className="p-5 sm:p-6 border border-slate-200 rounded-2xl bg-slate-50/70 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-slate-900 text-white">
                      {doc.room_number || `Room ${idx + 1}`}
                    </span>
                    <span className="text-sm font-bold text-slate-900">{doc.name}</span>
                  </div>
                  <span className="text-xs font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
                    Active Doctor
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Doctor Name</label>
                    <input
                      type="text"
                      value={doc.name}
                      onChange={(e) => {
                        const updated = [...doctors];
                        updated[idx].name = e.target.value;
                        setDoctors(updated);
                      }}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-700 min-h-[40px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Room Assignment</label>
                    <input
                      type="text"
                      value={doc.room_number || `Room ${idx + 1}`}
                      onChange={(e) => {
                        const updated = [...doctors];
                        updated[idx].room_number = e.target.value;
                        setDoctors(updated);
                      }}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-700 min-h-[40px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Qualifications</label>
                    <input
                      type="text"
                      value={doc.qualification}
                      onChange={(e) => {
                        const updated = [...doctors];
                        updated[idx].qualification = e.target.value;
                        setDoctors(updated);
                      }}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-700 min-h-[40px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Specialization</label>
                    <input
                      type="text"
                      value={doc.specialization}
                      onChange={(e) => {
                        const updated = [...doctors];
                        updated[idx].specialization = e.target.value;
                        setDoctors(updated);
                      }}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-700 min-h-[40px]"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => handleSaveDoctor(doc)}
                    disabled={savingDoctor}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-slate-800 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition min-h-[40px]"
                  >
                    <Save className="w-3.5 h-3.5 text-teal-700" />
                    <span>Save {doc.room_number || `Room ${idx + 1}`}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Demo Simulation Controls */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center shrink-0">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Demo Simulation & Reseed</h2>
              <p className="text-xs text-slate-500">
                Reseed clean Dombivli evening commuter rush appointments for presentation or testing
              </p>
            </div>
          </div>

          <button
            onClick={handleResetQueue}
            disabled={resetting}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 text-xs font-bold text-amber-950 bg-amber-100 hover:bg-amber-200 rounded-xl transition min-h-[44px]"
          >
            <RefreshCw className={`w-4 h-4 ${resetting ? 'animate-spin' : ''}`} />
            <span>{resetting ? 'Resetting...' : 'Reseed Demo Queue'}</span>
          </button>
        </div>
      </main>
    </div>
  );
}
