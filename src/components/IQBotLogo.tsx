import React from 'react';

interface IQBotLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showSubtitle?: boolean;
  hideTextOnMobile?: boolean;
}

export const IQBotLogo: React.FC<IQBotLogoProps> = ({
  size = 'md',
  className = '',
  showSubtitle = true,
  hideTextOnMobile = false,
}) => {
  const dimensions = {
    sm: { width: 120, height: 40, iconSize: 28 },
    md: { width: 160, height: 50, iconSize: 36 },
    lg: { width: 220, height: 70, iconSize: 52 },
    xl: { width: 300, height: 95, iconSize: 72 },
  }[size];

  return (
    <div className={`inline-flex flex-col items-center select-none ${className}`}>
      <div className="flex items-center gap-2">
        {/* SVG Graphic with Candlesticks inside Q & Upward Arrow */}
        <svg
          width={dimensions.iconSize}
          height={dimensions.iconSize}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-[0_0_12px_rgba(37,99,235,0.6)]"
        >
          {/* Glowing Outer Circle */}
          <circle cx="50" cy="50" r="46" stroke="url(#blue_grad_ring)" strokeWidth="6" fill="#020617" />

          {/* Letter i */}
          <circle cx="28" cy="28" r="4" fill="#f8fafc" />
          <rect x="26" y="36" width="4" height="24" rx="2" fill="#f8fafc" />

          {/* Letter Q Outer Ring */}
          <circle cx="52" cy="48" r="22" stroke="url(#silver_grad)" strokeWidth="7" fill="none" />

          {/* Candlesticks inside Q */}
          {/* Green candle 1 */}
          <line x1="42" y1="36" x2="42" y2="52" stroke="#22c55e" strokeWidth="1.5" />
          <rect x="40.5" y="40" width="3" height="8" fill="#22c55e" rx="0.5" />

          {/* Green candle 2 */}
          <line x1="48" y1="32" x2="48" y2="50" stroke="#22c55e" strokeWidth="1.5" />
          <rect x="46.5" y="36" width="3" height="10" fill="#22c55e" rx="0.5" />

          {/* Red candle */}
          <line x1="54" y1="34" x2="54" y2="52" stroke="#ef4444" strokeWidth="1.5" />
          <rect x="52.5" y="38" width="3" height="9" fill="#ef4444" rx="0.5" />

          {/* Blue Arrow bursting out of Q */}
          <path
            d="M 40 62 L 56 46 L 62 50 L 76 30 L 78 40 L 76 30 L 66 32"
            stroke="#2563eb"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <path
            d="M 76 30 L 80 26 L 70 26 Z"
            fill="#38bdf8"
          />

          <defs>
            <linearGradient id="blue_grad_ring" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
              <stop stopColor="#3b82f6" />
              <stop offset="0.5" stopColor="#1d4ed8" />
              <stop offset="1" stopColor="#0284c7" />
            </linearGradient>
            <linearGradient id="silver_grad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
              <stop stopColor="#ffffff" />
              <stop offset="0.5" stopColor="#cbd5e1" />
              <stop offset="1" stopColor="#94a3b8" />
            </linearGradient>
          </defs>
        </svg>

        {/* Text 'iQ bot' */}
        <div className={`items-baseline ${hideTextOnMobile ? 'hidden sm:flex' : 'flex'}`}>
          <span className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight font-sans">
            iQ
          </span>
          <span className="text-xl sm:text-2xl font-black text-blue-500 tracking-tight ml-0.5 font-sans drop-shadow-[0_0_8px_rgba(37,99,235,0.5)]">
            bot
          </span>
        </div>
      </div>

      {showSubtitle && (
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="w-5 h-[1.5px] bg-blue-500/60 rounded-full" />
          <span className="text-[9px] sm:text-[10px] font-black tracking-[0.2em] text-slate-300 uppercase font-sans">
            IQ BOT TRADING
          </span>
          <span className="w-5 h-[1.5px] bg-blue-500/60 rounded-full" />
        </div>
      )}
    </div>
  );
};
