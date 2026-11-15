'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Clock,
  MapPin,
  Phone,
  CheckCircle2,
  Share2,
  Train,
  Bell,
  Check,
  Circle,
  MessageSquare,
  XCircle
} from 'lucide-react';
import { playClinicChime } from '@/lib/sound';

function TokenContent() {
  const params = useParams();
  const id = params?.id;
  const [appointment, setAppointment] = useState(null);
  const [queueStats, setQueueStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [alertEnabled, setAlertEnabled] = useState(true);
  const [delaying, setDelaying] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState('');
  const prevTurnRef = useRef(false);

  const handleDelay = async () => {
    if (!id || delaying) return;
    setDelaying(true);
    try {
      await fetch('/api/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delay_patient', appointmentId: id })
      });
      setStatusFeedback('Your slot has been buffered (+15 mins) for local train arrival.');
      await fetchQueue();
    } catch (err) {
      console.error(err);
    } finally {
      setDelaying(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel your appointment slot?')) return;
    try {
      await fetch('/api/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel_appointment', appointmentId: id })
      });
      setStatusFeedback('Your appointment has been cancelled.');
      await fetchQueue();
    } catch (err) {
      console.error(err);
    }
  };

  const fetchQueue = async () => {
    try {
      const res = await fetch('/api/queue');
      const data = await res.json();
      if (data.success) {
        setQueueStats(data);
        const all = [
          ...(data.waiting || []),
          ...(data.upcoming || []),
          ...(data.completed || []),
          ...(data.nowServing ? [data.nowServing] : [])
        ];
        const found = all.find((a) => a.id === id);
        if (found) {
          setAppointment(found);
          // Trigger audible chime if state changed to in_progress
          if (found.status === 'in_progress' && !prevTurnRef.current && alertEnabled) {
            playClinicChime();
          }
          prevTurnRef.current = found.status === 'in_progress';
        }
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 3500);
    return () => clearInterval(interval);
  }, [id, alertEnabled]);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-teal-700 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-semibold">Loading your token...</span>
        </div>
      </div>
    );
  }

  const nowServingToken = queueStats?.stats?.nowServingToken || 0;
  const myToken = appointment?.token_number || 4;
  const isMyTurn = appointment?.status === 'in_progress';
  const isCompleted = appointment?.status === 'completed';
  const isArrived = appointment?.status === 'arrived';

  const patientsAhead = Math.max(0, myToken - nowServingToken - 1);
  const estimatedWaitMins = patientsAhead * 15;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans pb-16">
      {/* Top Navbar */}
      <div className="border-b border-slate-200 bg-white sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition active:scale-[0.97]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Clinic Home</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium flex items-center gap-1 transition"
              title="Copy token link to share"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
              <span className="text-[11px]">{copied ? 'Copied!' : 'Share'}</span>
            </button>

            <div className="flex items-center gap-2 text-xs text-teal-800 font-semibold bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse"></span>
              <span>Live Sync</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pt-6 space-y-4">
        {/* Urgent Turn Notification Banner */}
        {isMyTurn && (
          <div className="bg-emerald-600 text-white p-4 rounded-2xl shadow-md text-center animate-in fade-in duration-200">
            <div className="flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-wider">
              <CheckCircle2 className="w-5 h-5" />
              <span>It's Your Turn Now!</span>
            </div>
            <p className="text-xs font-medium mt-1 text-emerald-50">
              Please enter Dr. Rohan Joshi's consultation chamber.
            </p>
          </div>
        )}

        {isCompleted && (
          <div className="bg-white border border-slate-200 p-4 rounded-2xl text-center shadow-sm">
            <div className="flex items-center justify-center gap-2 text-sm font-bold text-slate-900">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Consultation Completed</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Thank you for visiting Smile Care Dental Clinic.</p>
          </div>
        )}

        {/* Tactile Digital Token Pass */}
        <div className="bg-white border border-slate-200/90 rounded-3xl shadow-sm overflow-hidden">
          {/* Card Header */}
          <div className="bg-teal-700 text-white p-6 text-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-teal-200">
              Clinic Digital Queue Pass
            </span>
            <h1 className="text-lg font-bold mt-1">Smile Care Dental Clinic</h1>
            <p className="text-xs text-teal-100">Opp. Dombivli Station, Phadke Road</p>
          </div>

          {/* Large Token Slip Body */}
          <div className="p-6 text-center">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Your Assigned Token</p>
            <div className="my-2">
              <span className="text-6xl font-black text-slate-900 tracking-tight">
                #{String(myToken).padStart(2, '0')}
              </span>
            </div>

            <div className="inline-block bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 mt-1">
              <p className="text-sm font-bold text-slate-900">{appointment?.patient_name || 'Rahul Kulkarni'}</p>
              <p className="text-xs text-slate-500">{appointment?.service_name || 'Dental Consultation & X-Ray'}</p>
            </div>
          </div>

          {/* Perforated Divider */}
          <div className="relative flex items-center justify-center px-4">
            <div className="w-5 h-5 bg-slate-100 rounded-full -ml-6 border-r border-slate-200"></div>
            <div className="flex-1 border-t-2 border-dashed border-slate-200"></div>
            <div className="w-5 h-5 bg-slate-100 rounded-full -mr-6 border-l border-slate-200"></div>
          </div>

          {/* Queue Metrics Strip */}
          <div className="p-6 bg-slate-50/70" role="status" aria-atomic="true">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="border-r border-slate-200 pr-2">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Now Inside</p>
                <p className="text-2xl font-black text-teal-700 mt-1">
                  {nowServingToken ? `#${String(nowServingToken).padStart(2, '0')}` : '--'}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">In Consultation</p>
              </div>

              <div className="pl-2">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Ahead of You</p>
                <p className="text-2xl font-black text-slate-900 mt-1">{patientsAhead}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {patientsAhead === 0 ? 'You are next!' : `~${estimatedWaitMins} mins wait`}
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Stepper */}
          <div className="px-6 py-4 border-t border-slate-100 bg-white">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Live Progress</p>
            <div className="flex items-center justify-between text-center relative">
              <div className="flex-1 flex flex-col items-center">
                <div className="w-6 h-6 rounded-full bg-teal-700 text-white flex items-center justify-center text-[10px] font-bold">
                  ✓
                </div>
                <span className="text-[10px] font-semibold text-slate-700 mt-1">Booked</span>
              </div>

              <div className={`h-0.5 flex-1 ${isArrived || isMyTurn || isCompleted ? 'bg-teal-700' : 'bg-slate-200'}`}></div>

              <div className="flex-1 flex flex-col items-center">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isArrived || isMyTurn || isCompleted ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-400 border border-slate-300'
                  }`}
                >
                  {isArrived || isMyTurn || isCompleted ? '✓' : '2'}
                </div>
                <span className="text-[10px] font-semibold text-slate-700 mt-1">In Lobby</span>
              </div>

              <div className={`h-0.5 flex-1 ${isMyTurn || isCompleted ? 'bg-teal-700' : 'bg-slate-200'}`}></div>

              <div className="flex-1 flex flex-col items-center">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isMyTurn ? 'bg-emerald-600 text-white animate-pulse' : isCompleted ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-400 border border-slate-300'
                  }`}
                >
                  {isCompleted ? '✓' : '3'}
                </div>
                <span className="text-[10px] font-semibold text-slate-700 mt-1">Doctor Room</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dombivli Commuter Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <Train className="w-4 h-4 text-teal-700" />
            <span>Phadke Road Commuter Guidance</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            The clinic is located 2 minutes on foot from Dombivli Station Platform 1 exit. When 1 patient remains ahead of you, start walking from the station.
          </p>

          {/* Running late self-service trigger */}
          {!isMyTurn && !isCompleted && appointment?.status !== 'cancelled' && (
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                onClick={handleDelay}
                disabled={delaying}
                className="flex-1 py-1.5 px-3 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-semibold rounded-lg transition text-center"
              >
                {delaying ? 'Buffering...' : '🚆 Running Late? Add +15m Buffer'}
              </button>
              <button
                onClick={handleCancel}
                className="py-1.5 px-3 text-slate-400 hover:text-rose-600 text-xs font-medium transition"
              >
                Cancel Slot
              </button>
            </div>
          )}
          {statusFeedback && (
            <p className="text-xs font-semibold text-teal-700 pt-1">{statusFeedback}</p>
          )}
        </div>

        {/* Chime Alert Setting */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Bell className="w-4 h-4 text-teal-700" />
            <div>
              <p className="text-xs font-bold text-slate-900">Audio Chime When Called</p>
              <p className="text-[11px] text-slate-500">Plays clinic bell when it's your turn</p>
            </div>
          </div>
          <button
            onClick={() => setAlertEnabled(!alertEnabled)}
            className={`w-10 h-6 rounded-full p-0.5 transition ${alertEnabled ? 'bg-teal-700' : 'bg-slate-300'}`}
          >
            <div className={`w-5 h-5 rounded-full bg-white transition transform ${alertEnabled ? 'translate-x-4' : 'translate-x-0'}`}></div>
          </button>
        </div>

        {/* Quick Contact & Navigation */}
        <div className="space-y-2">
          <a
            href="https://wa.me/919820144552?text=Namaste%20Smile%20Care%20Clinic,%20I%20have%20an%20inquiry%20regarding%20my%20appointment."
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-4 rounded-xl bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-xs font-semibold text-emerald-900 transition flex items-center justify-center gap-2 shadow-sm active:scale-[0.98]"
          >
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            <span>Chat with Reception on WhatsApp (+91 98201 44552)</span>
          </a>

          <a
            href="tel:+919820144552"
            className="w-full py-3 px-4 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-800 transition flex items-center justify-center gap-2 shadow-sm active:scale-[0.98]"
          >
            <Phone className="w-4 h-4 text-teal-700" />
            <span>Call Reception Desk</span>
          </a>
          <a
            href="https://maps.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-4 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-800 transition flex items-center justify-center gap-2 shadow-sm active:scale-[0.98]"
          >
            <MapPin className="w-4 h-4 text-slate-500" />
            <span>Open Location in Google Maps</span>
          </a>
        </div>
      </div>
    </div>
  );
}

export default function TokenPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-teal-700 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-semibold">Loading token tracker...</span>
          </div>
        </div>
      }
    >
      <TokenContent />
    </Suspense>
  );
}
