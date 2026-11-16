'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Clock,
  MapPin,
  Phone,
  CheckCircle2,
  Share2,
  Train,
  Bell,
  Check,
  MessageSquare,
  XCircle,
  Printer,
  Sparkles,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import Navbar from '@/components/Navbar';
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
      setStatusFeedback('Your token has been buffered (+15 mins) for local train arrival.');
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
          ...(data.nowServing ? [data.nowServing] : []),
          ...(data.waiting || []),
          ...(data.upcoming || []),
          ...(data.completed || [])
        ];
        const found = all.find((a) => a.id === id);
        if (found) {
          setAppointment(found);
          const isNowMyTurn = found.status === 'in_progress';
          if (isNowMyTurn && !prevTurnRef.current && alertEnabled) {
            playClinicChime();
          }
          prevTurnRef.current = isNowMyTurn;
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
  const isCancelled = appointment?.status === 'cancelled';

  const patientsAhead = Math.max(0, myToken - nowServingToken - 1);
  const estimatedWaitMins = patientsAhead * 15;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans pb-16 flex flex-col">
      <Navbar />

      <main className="max-w-md mx-auto px-4 pt-6 space-y-4 w-full flex-1">
        {/* Urgent Turn Notification Banner */}
        {isMyTurn && (
          <div className="bg-emerald-700 text-white p-5 rounded-3xl shadow-lg text-center animate-in fade-in duration-200">
            <div className="flex items-center justify-center gap-2 text-sm font-black uppercase tracking-wider">
              <CheckCircle2 className="w-5 h-5 text-emerald-200" />
              <span>It's Your Turn Now!</span>
            </div>
            <p className="text-xs font-semibold mt-1 text-emerald-100">
              Please walk into {appointment?.room_number || 'Room 1'} ({appointment?.doctor_id === 'dr-ananya-sen' ? 'Dr. Ananya Sen' : 'Dr. Rohan Joshi'}).
            </p>
          </div>
        )}

        {isCompleted && (
          <div className="bg-white border border-slate-200 p-5 rounded-3xl text-center shadow-xs">
            <div className="flex items-center justify-center gap-2 text-sm font-bold text-slate-900">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Consultation Completed</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Thank you for visiting Smile Care Dental Clinic.</p>
          </div>
        )}

        {isCancelled && (
          <div className="bg-rose-50 border border-rose-200 p-4 rounded-3xl text-center text-xs font-semibold text-rose-800">
            This appointment token has been cancelled.
          </div>
        )}

        {/* Digital Boarding Pass Container */}
        <div className="bg-white border border-slate-200/90 rounded-3xl shadow-sm overflow-hidden">
          {/* Card Top Branding */}
          <div className="bg-teal-800 text-white p-6 text-center relative">
            <span className="text-[10px] font-bold uppercase tracking-widest text-teal-200">
              Digital Clinic Queue Pass
            </span>
            <h1 className="text-lg font-bold mt-1">Smile Care Dental Clinic</h1>
            <p className="text-xs text-teal-100">Opp. Dombivli Station, Phadke Road (East)</p>
          </div>

          {/* Large Token Slip Body */}
          <div className="p-6 text-center">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Your Assigned Token</p>
            <div className="my-2">
              <span className="text-6xl sm:text-7xl font-black text-slate-900 tracking-tight">
                #{String(myToken).padStart(2, '0')}
              </span>
            </div>

            <div className="inline-block bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 mt-1">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-900 text-white">
                  {appointment?.room_number || 'Room 1'}
                </span>
                <span className="text-xs font-bold text-slate-800">
                  {appointment?.doctor_id === 'dr-ananya-sen' ? 'Dr. Ananya Sen' : 'Dr. Rohan Joshi'}
                </span>
              </div>
              <p className="text-sm font-bold text-slate-900">{appointment?.patient_name || 'Rahul Kulkarni'}</p>
              <p className="text-xs text-slate-500">{appointment?.service_name || 'Comprehensive Consultation & X-Ray'}</p>
            </div>
          </div>

          {/* Notched Perforation Line */}
          <div className="relative flex items-center justify-center px-4">
            <div className="w-5 h-5 bg-slate-100 rounded-full -ml-6 border-r border-slate-200"></div>
            <div className="flex-1 border-t-2 border-dashed border-slate-200"></div>
            <div className="w-5 h-5 bg-slate-100 rounded-full -mr-6 border-l border-slate-200"></div>
          </div>

          {/* Live Queue Countdown Metrics */}
          <div className="p-6 bg-slate-50/70" role="status" aria-atomic="true">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="border-r border-slate-200 pr-2">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Now In Room</p>
                <p className="text-3xl font-black text-teal-800 mt-1">
                  {nowServingToken ? `#${String(nowServingToken).padStart(2, '0')}` : '--'}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">In Consultation</p>
              </div>

              <div className="pl-2">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Ahead of You</p>
                <p className="text-3xl font-black text-slate-900 mt-1">
                  {isMyTurn ? '0' : patientsAhead}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {isMyTurn ? 'Your turn!' : `~${estimatedWaitMins}m wait`}
                </p>
              </div>
            </div>

            {/* Commuter Journey Stepper */}
            <div className="mt-6 pt-5 border-t border-slate-200 space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Live Commuter Status</p>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 pt-1">
                <span className="flex items-center gap-1 text-teal-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                  <span>Token Confirmed</span>
                </span>
                <span>·</span>
                <span className={`flex items-center gap-1 ${patientsAhead <= 1 ? 'text-teal-800 font-bold' : 'text-slate-400'}`}>
                  <Train className="w-3.5 h-3.5 text-amber-600" />
                  <span>Platform Walk</span>
                </span>
                <span>·</span>
                <span className={`flex items-center gap-1 ${isMyTurn ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
                  <span>Chamber</span>
                </span>
              </div>
            </div>

            {/* Delay & Cancel Controls */}
            {!isMyTurn && !isCompleted && !isCancelled && (
              <div className="mt-5 pt-4 border-t border-slate-200 flex items-center justify-between gap-2">
                <button
                  onClick={handleDelay}
                  disabled={delaying}
                  className="flex-1 py-2.5 px-3 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold rounded-xl transition text-center min-h-[42px]"
                >
                  {delaying ? 'Buffering...' : '🚆 Running Late? Add +15m Buffer'}
                </button>
                <button
                  onClick={handleCancel}
                  className="py-2.5 px-3 text-slate-400 hover:text-rose-600 text-xs font-medium transition min-h-[42px]"
                >
                  Cancel
                </button>
              </div>
            )}

            {statusFeedback && (
              <p className="text-xs font-bold text-teal-800 pt-2 text-center">{statusFeedback}</p>
            )}
          </div>
        </div>

        {/* Chime Alert Setting */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="w-4 h-4 text-teal-700" />
            <div>
              <p className="text-xs font-bold text-slate-900">Audio Chime When Called</p>
              <p className="text-[11px] text-slate-500">Plays clinic bell when it's your turn</p>
            </div>
          </div>
          <button
            onClick={() => setAlertEnabled(!alertEnabled)}
            className={`w-11 h-6 rounded-full p-0.5 transition ${alertEnabled ? 'bg-teal-700' : 'bg-slate-300'}`}
            aria-label="Toggle chime alerts"
          >
            <div className={`w-5 h-5 rounded-full bg-white transition transform ${alertEnabled ? 'translate-x-5' : 'translate-x-0'}`}></div>
          </button>
        </div>

        {/* Action Buttons Tray */}
        <div className="space-y-2.5 pt-1">
          <div className="grid grid-cols-2 gap-2">
            <Link
              href={`/print/${id}`}
              target="_blank"
              className="py-3 px-3 rounded-2xl bg-white border border-slate-300 hover:bg-slate-50 text-xs font-bold text-slate-800 transition flex items-center justify-center gap-1.5 shadow-2xs min-h-[44px]"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>Print 80mm Slip</span>
            </Link>

            <button
              onClick={handleCopyLink}
              className="py-3 px-3 rounded-2xl bg-white border border-slate-300 hover:bg-slate-50 text-xs font-bold text-slate-800 transition flex items-center justify-center gap-1.5 shadow-2xs min-h-[44px]"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4 text-slate-600" />}
              <span>{copied ? 'Link Copied!' : 'Share Token'}</span>
            </button>
          </div>

          <a
            href="https://wa.me/919820144552?text=Namaste%20Smile%20Care%20Clinic,%20I%20have%20an%20inquiry%20regarding%20my%20appointment."
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-4 rounded-2xl bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-xs font-bold text-emerald-900 transition flex items-center justify-center gap-2 shadow-2xs min-h-[44px]"
          >
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            <span>Chat with Reception on WhatsApp (+91 98201 44552)</span>
          </a>
        </div>
      </main>
    </div>
  );
}

export default function TokenPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-700">
          <div className="text-sm font-semibold">Loading token...</div>
        </div>
      }
    >
      <TokenContent />
    </Suspense>
  );
}
