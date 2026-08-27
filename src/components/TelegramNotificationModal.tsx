import React, { useState } from 'react';
import { TradingSettings } from '../types';
import { X, Bell, Send, Volume2, ShieldCheck } from 'lucide-react';

interface TelegramNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: TradingSettings;
  setSettings: React.Dispatch<React.SetStateAction<TradingSettings>>;
}

export const TelegramNotificationModal: React.FC<TelegramNotificationModalProps> = ({
  isOpen,
  onClose,
  settings,
  setSettings,
}) => {
  const [testSent, setTestSent] = useState(false);

  if (!isOpen) return null;

  const handleTestNotification = async () => {
    if (!settings.telegramToken || !settings.telegramChatId) {
      alert('Please enter both your Telegram Bot Token and Chat ID.');
      return;
    }

    const message = `🚀 <b>Pocket Option AI Test Alert</b>
Pair: EUR/USD
Signal: <b>CALL</b> (1m)
Confidence: 88%
Reason: Test notification dispatch successfully verified!`;

    try {
      const res = await fetch(
        `https://api.telegram.org/bot${settings.telegramToken}/sendMessage`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: settings.telegramChatId,
            text: message,
            parse_mode: 'HTML',
          }),
        }
      );

      if (res.ok) {
        setTestSent(true);
        setTimeout(() => setTestSent(false), 3000);
      } else {
        alert('Failed to send Telegram test message. Check your Bot Token & Chat ID.');
      }
    } catch (err) {
      alert('Network error connecting to Telegram API.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-5 space-y-4 text-slate-100 relative">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold">Sound & Telegram Signal Alerts</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          {/* Toggles */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-emerald-400" />
              <span>Audio Sound Alerts</span>
            </div>
            <input
              type="checkbox"
              checked={settings.soundAlerts}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, soundAlerts: e.target.checked }))
              }
              className="w-4 h-4 rounded bg-slate-900 border-slate-800 text-emerald-500"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-emerald-400" />
              <span>Desktop Browser Notifications</span>
            </div>
            <input
              type="checkbox"
              checked={settings.desktopNotifications}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, desktopNotifications: e.target.checked }))
              }
              className="w-4 h-4 rounded bg-slate-900 border-slate-800 text-emerald-500"
            />
          </div>

          {/* Telegram Credentials */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2.5">
            <div className="flex items-center gap-2 text-slate-200 font-semibold">
              <Send className="w-4 h-4 text-sky-400" />
              Telegram Instant Signal Webhook
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Telegram Bot Token</label>
              <input
                type="password"
                placeholder="123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                value={settings.telegramToken || ''}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, telegramToken: e.target.value }))
                }
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-100 font-mono text-xs focus:border-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Telegram Chat ID</label>
              <input
                type="text"
                placeholder="987654321"
                value={settings.telegramChatId || ''}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, telegramChatId: e.target.value }))
                }
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-100 font-mono text-xs focus:border-sky-500 focus:outline-none"
              />
            </div>

            <button
              onClick={handleTestNotification}
              className="w-full py-2 bg-sky-500 hover:bg-sky-600 text-slate-950 font-bold text-xs rounded-lg transition flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              {testSent ? '✓ Test Alert Sent!' : 'Send Test Telegram Alert'}
            </button>
          </div>
        </div>

        <div className="pt-2 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl transition"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};
