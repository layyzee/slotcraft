// Web Audio API synthesized hospital/clinic chime (Zero external audio assets)
export function playClinicChime() {
  if (typeof window === 'undefined') return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    // Two-tone chime (C5 -> E5)
    const tones = [
      { freq: 523.25, time: 0, duration: 0.35 }, // C5
      { freq: 659.25, time: 0.18, duration: 0.55 } // E5
    ];

    tones.forEach((t) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(t.freq, ctx.currentTime + t.time);

      gain.gain.setValueAtTime(0, ctx.currentTime + t.time);
      gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + t.time + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + t.time + t.duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + t.time);
      osc.stop(ctx.currentTime + t.time + t.duration);
    });
  } catch (e) {
    console.debug('Audio chime playback omitted:', e);
  }
}
