'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Tv,
  Calendar,
  Users,
  Stethoscope,
  Settings,
  Volume2,
  Train,
  Menu,
  X,
  Printer,
  Sparkles
} from 'lucide-react';
import { playClinicChime } from '@/lib/sound';

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [chimePlaying, setChimePlaying] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const navLinks = [
    { href: '/', label: 'Overview', icon: Calendar },
    { href: '/book', label: 'Book Token', icon: Calendar },
    { href: '/reception', label: 'Reception Desk', icon: Users },
    { href: '/doctor', label: 'Doctor Room', icon: Stethoscope },
    { href: '/display', label: 'Lobby TV', icon: Tv, target: '_blank' },
    { href: '/print/apt-004', label: 'Thermal Slip', icon: Printer, target: '_blank' },
    { href: '/settings', label: 'Settings', icon: Settings }
  ];

  const handleTestChime = () => {
    playClinicChime();
    setChimePlaying(true);
    setTimeout(() => setChimePlaying(false), 1500);
  };

  return (
    <header className="border-b border-slate-200/90 bg-white/95 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-teal-800 text-white flex items-center justify-center font-black text-sm shadow-sm ring-2 ring-teal-700/20 group-hover:bg-teal-900 transition">
              SC
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 text-base tracking-tight">SlotCraft</span>
                <span className="text-slate-300">|</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 hidden sm:inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Zero-Cost SQLite
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Smile Care Clinic · Phadke Rd, Dombivli East
              </p>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                target={link.target}
                className={`text-xs font-semibold px-3 py-2 rounded-xl transition inline-flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-teal-50 text-teal-900 font-bold border border-teal-200 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <link.icon className={`w-3.5 h-3.5 ${isActive ? 'text-teal-700' : 'text-slate-400'}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Actions Bar */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Live Clock & Dombivli Commuter Indicator */}
          <div className="hidden md:flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
            <Train className="w-3.5 h-3.5 text-amber-600" />
            <span className="font-mono font-medium text-slate-700">
              {currentTime || '07:00 PM'}
            </span>
          </div>

          {/* Hospital Chime Tester */}
          <button
            onClick={handleTestChime}
            aria-label="Test pleasant hospital clinic chime"
            title="Test pleasant clinic chime"
            className={`min-h-[40px] min-w-[40px] p-2 rounded-xl border transition flex items-center justify-center gap-1.5 ${
              chimePlaying
                ? 'bg-teal-100 text-teal-800 border-teal-300 scale-95'
                : 'text-slate-600 hover:text-teal-800 hover:bg-teal-50 border-slate-200 bg-white'
            }`}
          >
            <Volume2 className="w-4 h-4 text-teal-700" />
            <span className="hidden xl:inline text-xs font-medium">Test Chime</span>
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="min-h-[40px] min-w-[40px] p-2 lg:hidden text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-center transition active:scale-95"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-1 shadow-lg animate-in slide-in-from-top-2 duration-150">
          <div className="pb-2 mb-2 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5 font-medium text-slate-700">
              <Train className="w-3.5 h-3.5 text-amber-600" />
              Dombivli Rush Mode: Active
            </span>
            <span className="font-mono">{currentTime}</span>
          </div>

          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                target={link.target}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold min-h-[48px] transition ${
                  isActive
                    ? 'bg-teal-50 text-teal-900 border border-teal-200 font-bold'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <link.icon className={`w-4 h-4 ${isActive ? 'text-teal-700' : 'text-slate-500'}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
