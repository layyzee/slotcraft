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
  CheckCircle2,
  Menu,
  X
} from 'lucide-react';
import { playClinicChime } from '@/lib/sound';

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
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
    { href: '/doctor', label: 'Doctor Chamber', icon: Stethoscope },
    { href: '/display', label: 'Lobby TV', icon: Tv, target: '_blank' },
    { href: '/settings', label: 'Settings & Rooms', icon: Settings }
  ];

  const handleTestChime = () => {
    playClinicChime();
  };

  return (
    <header className="border-b border-slate-200/90 bg-white/95 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-800 text-white flex items-center justify-center font-black text-base shadow-sm ring-2 ring-teal-700/20">
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

        {/* Center / Right Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                target={link.target}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition inline-flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-teal-50 text-teal-800 font-bold border border-teal-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <link.icon className={`w-3.5 h-3.5 ${isActive ? 'text-teal-700' : 'text-slate-400'}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Live Clock & Commuter Rush Badge */}
          <div className="hidden md:flex items-center gap-2 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
            <Train className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-[11px] font-mono font-medium text-slate-600">
              {currentTime || '07:00 PM'}
            </span>
          </div>

          {/* Chime Sound Test */}
          <button
            onClick={handleTestChime}
            title="Test pleasant clinic hospital chime"
            className="p-2 text-slate-500 hover:text-teal-800 hover:bg-teal-50 rounded-lg border border-slate-200 transition"
          >
            <Volume2 className="w-3.5 h-3.5" />
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 lg:hidden text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              target={link.target}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              <link.icon className="w-4 h-4 text-teal-700" />
              <span>{link.label}</span>
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
