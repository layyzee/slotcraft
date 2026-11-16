'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Clock,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Calendar as CalendarIcon,
  Phone,
  User,
  ArrowRight,
  ChevronRight
} from 'lucide-react';

export default function BookPage() {
  const router = useRouter();
  const [clinicData, setClinicData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('07:15 PM');
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [error, setError] = useState('');

  const slots = [
    '10:30 AM', '11:15 AM', '12:00 PM',
    '06:15 PM', '06:45 PM', '07:15 PM', '07:45 PM', '08:15 PM', '08:45 PM'
  ];

  useEffect(() => {
    fetch('/api/clinic')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setClinicData(data);
          if (data.services && data.services.length > 0) {
            setSelectedService(data.services[0].id);
          }
          if (data.doctors && data.doctors.length > 0) {
            setSelectedDoctor(data.doctors[0].id);
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleBooking = async (e) => {
    e.preventDefault();
    setError('');

    if (!patientName.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!patientPhone.trim() || patientPhone.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName,
          patientPhone,
          serviceId: selectedService,
          slotTime: selectedSlot,
          doctorId: selectedDoctor
        })
      });

      const data = await res.json();
      if (data.success && data.appointment) {
        router.push(`/token/${data.appointment.id}`);
      } else {
        setError(data.error || 'Failed to book appointment');
        setSubmitting(false);
      }
    } catch (err) {
      setError('Connection error. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-teal-700 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-semibold">Loading clinic services...</span>
        </div>
      </div>
    );
  }

  const clinic = clinicData?.clinic;
  const doctors = clinicData?.doctors || [];
  const doctor = doctors.find(d => d.id === selectedDoctor) || doctors[0];
  const services = clinicData?.services || [];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-16">
      {/* Top Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Clinic Home</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-xs font-semibold text-slate-700">Smile Care Dental · Dombivli (E)</span>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-6 space-y-6">
        {/* Doctor Summary Header */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                Direct Appointment Booking
              </span>
              <h1 className="text-xl font-bold text-slate-900 mt-2">
                {doctor?.name || 'Dr. Rohan Joshi'}
              </h1>
              <p className="text-xs text-slate-600 mt-0.5 font-medium">
                {doctor?.qualification || 'BDS, MDS (Mumbai)'} · {doctor?.specialization || 'Senior Dental Surgeon'}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center font-bold text-sm">
              DR
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              Opp. Dombivli Station, Phadke Road
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Live digital token provided instantly
            </span>
          </div>
        </div>

        {/* Booking Form */}
        <form onSubmit={handleBooking} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          {/* Step 1: Select Doctor & Room */}
          {doctors.length > 1 && (
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-3">
                1. Select Doctor & Consultation Room
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {doctors.map((doc) => {
                  const isSelected = selectedDoctor === doc.id;
                  return (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedDoctor(doc.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition ${
                        isSelected
                          ? 'border-teal-700 bg-teal-50/50 ring-1 ring-teal-700'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-900 text-white">
                          {doc.room_number || 'Room 1'}
                        </span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-teal-700" />}
                      </div>
                      <p className="font-bold text-sm text-slate-900">{doc.name}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{doc.specialization}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: Select Treatment */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-3">
              {doctors.length > 1 ? '2.' : '1.'} Select Dental Treatment
            </label>
            <div className="space-y-2">
              {services.map((srv) => {
                const isSelected = selectedService === srv.id;
                return (
                  <div
                    key={srv.id}
                    onClick={() => setSelectedService(srv.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                      isSelected
                        ? 'border-teal-700 bg-teal-50/50 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-teal-700 bg-teal-700' : 'border-slate-300'
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                      </div>
                      <div>
                        <p className={`text-sm font-semibold ${isSelected ? 'text-teal-900' : 'text-slate-900'}`}>
                          {srv.name}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">{srv.description}</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-slate-900 ml-4 shrink-0">₹{srv.price_inr}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 2: Choose Slot */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                2. Select Preferred Time Slot (Today)
              </label>
              <span className="text-[11px] text-teal-700 font-medium">Evening commuter slots</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {slots.map((slot) => {
                const isSelected = selectedSlot === slot;
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border transition ${
                      isSelected
                        ? 'bg-teal-700 border-teal-700 text-white shadow-sm'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Patient Information */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              3. Patient Details
            </label>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Your Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Rahul Deshmukh"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-700 focus:ring-1 focus:ring-teal-700"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Mobile Number (for live token tracking)
              </label>
              <input
                type="tel"
                required
                placeholder="98200XXXXX"
                value={patientPhone}
                onChange={(e) => setPatientPhone(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-700 focus:ring-1 focus:ring-teal-700"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                You'll receive real-time queue notifications as patients are called.
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm rounded-xl transition shadow-sm flex items-center justify-center gap-2"
          >
            <span>{submitting ? 'Confirming Appointment...' : 'Confirm Appointment & Get Token'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </main>
    </div>
  );
}
