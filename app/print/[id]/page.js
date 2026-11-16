'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Printer, ArrowLeft, Check, QrCode } from 'lucide-react';
import Navbar from '@/components/Navbar';

function PrintSlipContent() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;
  const [appointment, setAppointment] = useState(null);
  const [clinic, setClinic] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDetails() {
      try {
        const [qRes, cRes] = await Promise.all([
          fetch('/api/queue'),
          fetch('/api/clinic')
        ]);
        const qData = await qRes.json();
        const cData = await cRes.json();

        if (cData.success) setClinic(cData.clinic);
        if (qData.success) {
          const all = [
            ...(qData.nowServing ? [qData.nowServing] : []),
            ...(qData.waiting || []),
            ...(qData.upcoming || []),
            ...(qData.completed || [])
          ];
          const found = all.find((a) => a.id === id);
          if (found) setAppointment(found);
        }
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    }
    loadDetails();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="text-sm font-semibold text-slate-600 animate-pulse">Generating receipt slip...</div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 gap-4">
        <div className="text-base font-bold text-slate-800">Token slip not found</div>
        <Link href="/reception" className="text-sm text-teal-800 underline font-semibold">
          ← Return to Reception Desk
        </Link>
      </div>
    );
  }

  const tokenNum = String(appointment.token_number).padStart(2, '0');
  const roomName = appointment.room_number || 'Room 1';
  const doctorName = appointment.doctor_id === 'dr-ananya-sen' ? 'Dr. Ananya Sen' : 'Dr. Rohan Joshi';

  return (
    <div className="min-h-screen bg-slate-200/70 flex flex-col items-center justify-center p-4 print:p-0 print:bg-white font-mono">
      {/* Top Navbar (Hidden on Print) */}
      <div className="w-full fixed top-0 left-0 right-0 z-50 print:hidden">
        <Navbar />
      </div>

      {/* Floating Action Bar (Hidden on Print) */}
      <div className="w-full max-w-[340px] mt-20 mb-4 flex items-center justify-between print:hidden">
        <Link
          href="/reception"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white px-3.5 py-2 rounded-xl border border-slate-300 shadow-2xs min-h-[40px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Reception</span>
        </Link>
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 text-xs font-black text-white bg-teal-800 hover:bg-teal-900 px-4 py-2 rounded-xl shadow-xs transition min-h-[40px] active:scale-95"
        >
          <Printer className="w-4 h-4" />
          <span>Print Thermal Slip (80mm)</span>
        </button>
      </div>

      {/* POS Thermal Slip Container (80mm width standard) */}
      <div className="w-full max-w-[340px] bg-white border border-slate-300 print:border-none p-6 shadow-md print:shadow-none text-slate-950 text-xs rounded-2xl print:rounded-none">
        {/* Header */}
        <div className="text-center pb-3 border-b-2 border-dashed border-slate-400">
          <h1 className="text-sm font-black uppercase tracking-tight">
            {clinic?.name || 'SMILE CARE DENTAL CLINIC'}
          </h1>
          <p className="text-[11px] font-semibold text-slate-700 mt-0.5">
            {clinic?.locality || 'Phadke Road, Dombivli East'}
          </p>
          <p className="text-[10px] text-slate-500">Tel: {clinic?.phone || '+91 98201 44552'}</p>
        </div>

        {/* Token Big Number Box */}
        <div className="my-4 text-center py-3 bg-slate-50 border border-slate-300 rounded-xl print:border-slate-800">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Your Digital Token</p>
          <div className="text-5xl font-black tracking-tight my-1 text-slate-950">
            #{tokenNum}
          </div>
          <span className="inline-block text-[11px] font-bold px-2.5 py-0.5 bg-slate-900 text-white rounded">
            {roomName} · {doctorName}
          </span>
        </div>

        {/* Patient & Appointment Details */}
        <div className="space-y-1.5 py-2.5 border-b border-dashed border-slate-400 text-[11px]">
          <div className="flex justify-between">
            <span className="text-slate-600">Patient:</span>
            <span className="font-bold text-slate-900">{appointment.patient_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Treatment:</span>
            <span className="font-semibold text-right max-w-[190px] truncate">{appointment.service_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Slot Time:</span>
            <span className="font-semibold">{appointment.slot_time}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Consultation Fee:</span>
            <span className="font-bold">₹{appointment.service_price}</span>
          </div>
        </div>

        {/* Online Tracker QR Box */}
        <div className="my-3.5 text-center py-2.5 border border-slate-300 rounded-xl bg-slate-50 flex flex-col items-center gap-1.5">
          <div className="w-16 h-16 border-2 border-slate-900 rounded-lg p-1 flex items-center justify-center bg-white">
            <QrCode className="w-12 h-12 text-slate-900" />
          </div>
          <p className="text-[10px] font-bold text-slate-900 uppercase tracking-tight">
            Track Live Queue on Mobile
          </p>
          <p className="text-[9px] text-slate-500 font-mono">
            localhost:3001/token/{appointment.id}
          </p>
        </div>

        {/* Commuter Rush Instructions */}
        <div className="text-[10px] text-slate-600 leading-tight text-center pt-2.5 border-t border-dashed border-slate-400">
          <p className="font-semibold">🚆 Dombivli Commuter Note:</p>
          <p className="mt-0.5">
            Grab a tea outside or walk in when 1 patient remains ahead. Display monitors in lobby announce token with chime.
          </p>
          <p className="mt-2 text-[9px] text-slate-400">Printed: {new Date().toLocaleTimeString()} · SlotCraft v1.3</p>
        </div>
      </div>
    </div>
  );
}

export default function ThermalPrintSlip() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
          <div className="text-sm font-medium text-slate-600">Generating receipt slip...</div>
        </div>
      }
    >
      <PrintSlipContent />
    </Suspense>
  );
}
