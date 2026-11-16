'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Clock,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Calendar as CalendarIcon,
  Phone,
  User,
  ArrowRight,
  ChevronRight,
  Stethoscope,
  Sparkles,
  Train
} from 'lucide-react';
import Navbar from '@/components/Navbar';

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
    if (e) e.preventDefault();
    setError('');

    if (!patientName.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!patientPhone.trim() || patientPhone.replace(/\D/g, '').length < 10) {
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
  const doctor = doctors.find((d) => d.id === selectedDoctor) || doctors[0];
  const services = clinicData?.services || [];
  const currentServiceObj = services.find((s) => s.id === selectedService) || services[0];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-28 sm:pb-16 flex flex-col">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 space-y-6 w-full flex-1">
        {/* Clinic & Doctor Banner */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-[10px] font-bold uppercase tracking-wider mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-pulse"></span>
                <span>Self-Service Mobile Booking</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {clinic?.name || 'Smile Care Dental Clinic'}
              </h1>
              <p className="text-xs text-slate-600 mt-1 font-medium">
                {clinic?.locality || 'Opp. Dombivli Railway Station, Phadke Road (East)'}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-teal-800 text-white flex items-center justify-center font-bold text-base shrink-0 shadow-xs">
              <Stethoscope className="w-6 h-6" />
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-600 font-medium">
            <span className="flex items-center gap-1.5">
              <Train className="w-4 h-4 text-amber-600" />
              <span>Dombivli Commuter Buffer Active</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-teal-700" />
              <span>Instant Digital Token Issued</span>
            </span>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <span>⚠️ {error}</span>
          </div>
        )}

        {/* Booking Form */}
        <form onSubmit={handleBooking} className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-6">
          {/* Step 1: Select Doctor & Room */}
          {doctors.length > 1 && (
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-3">
                1. Select Doctor & Room
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {doctors.map((doc) => {
                  const isSelected = selectedDoctor === doc.id;
                  return (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedDoctor(doc.id)}
                      className={`p-4 rounded-2xl border cursor-pointer transition min-h-[56px] flex flex-col justify-between ${
                        isSelected
                          ? 'border-teal-700 bg-teal-50/70 ring-2 ring-teal-700/20 shadow-2xs'
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
              {doctors.length > 1 ? '2.' : '1.'} Select Treatment
            </label>
            <div className="space-y-2.5">
              {services.map((srv) => {
                const isSelected = selectedService === srv.id;
                return (
                  <div
                    key={srv.id}
                    onClick={() => setSelectedService(srv.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition flex items-center justify-between gap-3 min-h-[56px] ${
                      isSelected
                        ? 'border-teal-700 bg-teal-50/60 ring-2 ring-teal-700/20 shadow-2xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          isSelected ? 'border-teal-700 bg-teal-700' : 'border-slate-300'
                        }`}
                      >
                        {isSelected && <div className="w-2 h-2 rounded-full bg-white"></div>}
                      </div>
                      <div className="min-w-0">
                        <p className={`text-sm font-bold truncate ${isSelected ? 'text-teal-950' : 'text-slate-900'}`}>
                          {srv.name}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">{srv.description}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-sm font-extrabold text-slate-900">₹{srv.price_inr}</span>
                      <p className="text-[10px] text-slate-400 font-medium">~{srv.duration_minutes || 20}m</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 3: Choose Time Slot */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                {doctors.length > 1 ? '3.' : '2.'} Select Preferred Time Slot (Today)
              </label>
              <span className="text-[11px] text-teal-800 font-semibold bg-teal-50 px-2 py-0.5 rounded">
                Evening Rush Slots
              </span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-3 gap-2.5">
              {slots.map((slot) => {
                const isSelected = selectedSlot === slot;
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={`py-3 px-2 text-xs font-bold rounded-xl border transition min-h-[46px] flex items-center justify-center ${
                      isSelected
                        ? 'bg-teal-800 border-teal-800 text-white shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 4: Patient Information */}
          <div className="space-y-4 pt-3 border-t border-slate-100">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              {doctors.length > 1 ? '4.' : '3.'} Patient Details
            </label>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Your Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Kulkarni"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-3.5 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-700 focus:ring-1 focus:ring-teal-700 min-h-[46px]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                WhatsApp Mobile Number (For Live Token Updates)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  inputMode="numeric"
                  required
                  placeholder="98200XXXXX"
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-3.5 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-700 focus:ring-1 focus:ring-teal-700 min-h-[46px]"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                We'll ping you on WhatsApp when you are 1 patient away. Zero spam.
              </p>
            </div>
          </div>

          {/* Submit Button (Desktop View) */}
          <div className="pt-2 hidden sm:block">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 text-sm font-bold text-white bg-teal-800 hover:bg-teal-900 rounded-2xl transition shadow-sm flex items-center justify-center gap-2 min-h-[50px] active:scale-[0.98] cursor-pointer"
            >
              <span>{submitting ? 'Issuing Digital Token...' : 'Confirm Slot & Get Digital Token'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </main>

      {/* Sticky Mobile Bottom Booking Bar (< 640px) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-3 shadow-lg">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-900 truncate">
              {currentServiceObj?.name || 'Consultation'}
            </p>
            <p className="text-[11px] text-teal-800 font-bold">
              {selectedSlot} · ₹{currentServiceObj?.price_inr || 500}
            </p>
          </div>
          <button
            onClick={handleBooking}
            disabled={submitting}
            className="px-5 py-3 text-xs font-bold text-white bg-teal-800 hover:bg-teal-900 rounded-xl transition shadow-sm shrink-0 min-h-[44px] flex items-center gap-1.5 active:scale-95"
          >
            <span>{submitting ? 'Issuing...' : 'Get Token'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
