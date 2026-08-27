export function playSoundAlert(type: 'start' | 'stop' | 'signal' | 'warning' | 'win' | 'loss' = 'signal') {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'start' || type === 'signal') {
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
    } else if (type === 'stop') {
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.2);
    } else {
      osc.frequency.setValueAtTime(880, ctx.currentTime);
    }

    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);

    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  } catch (e) {
    console.log('Audio alert fallback', e);
  }
}
