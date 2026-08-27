import { ExpiryTime } from '../types';

/**
 * Calculates exact real-time seconds remaining in current wall-clock candle interval.
 * - 30s: 30 - (currentSecond % 30)
 * - 1m: 60 - (currentSecond % 60)
 * - 5m: 300 - ((currentMinute * 60 + currentSecond) % 300)
 */
export function getRealtimeCandleSeconds(expiryTime: ExpiryTime = '1m'): number {
  const now = new Date();
  const seconds = now.getSeconds();
  const minutes = now.getMinutes();

  if (expiryTime === '30s') {
    const rem = 30 - (seconds % 30);
    return rem === 0 ? 30 : rem;
  }
  if (expiryTime === '5m') {
    const totalSec = (minutes * 60) + seconds;
    const rem = 300 - (totalSec % 300);
    return rem === 0 ? 300 : rem;
  }
  // Default 1m
  const rem = 60 - (seconds % 60);
  return rem === 0 ? 60 : rem;
}

/**
 * Formats seconds into MM:SS string e.g. 00:45
 */
export function formatCandleTimer(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  const mStr = m < 10 ? `0${m}` : `${m}`;
  const sStr = s < 10 ? `0${s}` : `${s}`;
  return `${mStr}:${sStr}`;
}

/**
 * Gets unique candle timestamp identifier for current wall-clock candle.
 * E.g., for 1m candle at 14:05:22, returns timestamp of 14:05:00.
 */
export function getCurrentCandleId(expiryTime: ExpiryTime = '1m'): number {
  const now = new Date();
  const ms = now.getTime();
  const intervalMs = expiryTime === '30s' ? 30000 : expiryTime === '5m' ? 300000 : 60000;
  return Math.floor(ms / intervalMs) * intervalMs;
}
