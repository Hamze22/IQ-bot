// Audio Alert Synthesizer
export function playSoundAlert(type = 'signal') {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
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

export async function sendTelegramNotification(token, chatId, signal) {
  if (!token || !chatId) return;
  const message = `🚨 <b>Pocket Option AI Signal</b> 🚨
Pair: ${signal.pair}
Signal: <b>${signal.decision}</b> (${signal.suggestedExpiry})
Confidence: ${signal.confidence}%
Reason: ${signal.reason}`;

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'HTML' })
    });
  } catch (err) {
    console.error('Telegram dispatch error:', err);
  }
}