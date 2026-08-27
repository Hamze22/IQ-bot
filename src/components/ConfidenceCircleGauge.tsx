import React from 'react';

interface ConfidenceCircleGaugeProps {
  confidence: number;
  minConfidence?: number;
  size?: number;
  strokeWidth?: number;
}

export const ConfidenceCircleGauge: React.FC<ConfidenceCircleGaugeProps> = ({
  confidence,
  minConfidence = 90,
  size = 64,
  strokeWidth = 6,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, confidence)) / 100) * circumference;
  
  const isHigh = confidence >= minConfidence;
  const strokeColor = isHigh ? '#10b981' : confidence >= 60 ? '#f59e0b' : '#f43f5e';

  return (
    <div
      className="relative flex items-center justify-center shrink-0"
      style={{ width: size, height: size, minWidth: size, minHeight: size }}
    >
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}>
        {/* Background Ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(30, 41, 59, 0.8)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress Circular Arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      {/* Centered Number inside circle */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none"
        style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
      >
        <span
          className="text-xs font-black tracking-tight font-mono leading-none"
          style={{ color: strokeColor }}
        >
          {confidence}%
        </span>
        <span className="text-[7px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
          CONF
        </span>
      </div>
    </div>
  );
};
