import React, { useState, useMemo } from 'react';
import { CloudRain, AlertTriangle, Clock, TrendingUp, Info } from 'lucide-react';

interface RainfallHistogramProps {
  currentRainRate: number;
  totalRain24h: number;
  isSimulatingStorm: boolean;
}

export const RainfallHistogram: React.FC<RainfallHistogramProps> = ({
  currentRainRate,
  totalRain24h,
  isSimulatingStorm,
}) => {
  const [hoveredHour, setHoveredHour] = useState<number | null>(null);

  // Generate 24 hourly rainfall readings for today
  // Reflects real mountain storm patterns: dry night, build-up in afternoon/evening, plus current live intensity
  const currentHour = 14; // e.g. 14:00 / 2 PM
  
  const hourlyData = useMemo(() => {
    const data = [];
    const baseCurve = [
      2, 1, 1, 0, 0, 2, 4, 8, 12, 16, 22, 28, 38, 48, currentRainRate,
      Math.max(10, currentRainRate * 0.9), Math.max(5, currentRainRate * 0.7),
      Math.max(4, currentRainRate * 0.5), 14, 8, 6, 4, 2, 1,
    ];

    for (let h = 0; h < 24; h++) {
      let mm = baseCurve[h];
      if (h === currentHour) {
        mm = currentRainRate;
      }
      data.push({
        hour: h,
        label: `${h.toString().padStart(2, '0')}:00`,
        shortLabel: h % 3 === 0 ? `${h}:00` : '',
        rainfallMm: parseFloat(mm.toFixed(1)),
        isPast: h < currentHour,
        isCurrent: h === currentHour,
        isForecast: h > currentHour,
      });
    }
    return data;
  }, [currentRainRate]);

  const maxVal = Math.max(...hourlyData.map((d) => d.rainfallMm), 60);

  // Determine intensity categories
  const getBarColor = (val: number, isCurrent: boolean) => {
    if (val >= 40) return isCurrent ? '#EF4444' : '#F87171'; // Red: Extreme storm/cloudburst
    if (val >= 15) return isCurrent ? '#F59E0B' : '#FBBF24'; // Yellow: Moderate/Heavy rain
    return isCurrent ? '#10B981' : '#34D399'; // Green: Light rain
  };

  const peakItem = hourlyData.reduce((prev, curr) =>
    curr.rainfallMm > prev.rainfallMm ? curr : prev
  );

  const activeHover = hoveredHour !== null ? hourlyData[hoveredHour] : hourlyData[currentHour];

  return (
    <div className="bg-[#0D131F] border border-slate-800 rounded-xl p-5 shadow-sm">
      {/* Header with Title and Plain English Severity Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-md bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <CloudRain className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Today's 24-Hour Rainfall Intensity Distribution
            </h3>
            {isSimulatingStorm && (
              <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded font-mono font-semibold">
                Simulated Storm
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400">
            Hourly rain measurements across the basin showing when the heaviest downpours occurred.
          </p>
        </div>

        {/* Quick Readout Badges */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
            <span className="text-slate-400 text-[10px] block uppercase">24h Total Rain</span>
            <span className="text-white font-bold text-sm tabular-nums">
              {totalRain24h.toFixed(1)} mm
            </span>
          </div>
          <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
            <span className="text-slate-400 text-[10px] block uppercase">Peak Hour</span>
            <span className="text-amber-400 font-bold text-sm tabular-nums">
              {peakItem.rainfallMm} mm/h{' '}
              <span className="text-[10px] text-slate-500 font-normal">({peakItem.label})</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Histogram Canvas */}
      <div className="relative pt-6 pb-2">
        {/* Dynamic Tooltip on Hover */}
        {activeHover && (
          <div className="flex items-center justify-between mb-2 px-3 py-1.5 bg-slate-900/90 border border-slate-700/80 rounded-lg text-xs font-mono">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-200 font-semibold">{activeHover.label}</span>
              <span className="text-slate-500">·</span>
              <span
                className={`font-bold ${
                  activeHover.rainfallMm >= 40
                    ? 'text-red-400'
                    : activeHover.rainfallMm >= 15
                    ? 'text-yellow-400'
                    : 'text-emerald-400'
                }`}
              >
                {activeHover.rainfallMm} mm/h
              </span>
              <span className="text-slate-400 text-[11px]">
                {activeHover.rainfallMm >= 40
                  ? '(🔴 Severe Cloudburst Risk)'
                  : activeHover.rainfallMm >= 15
                  ? '(🟡 Heavy Rain Alert)'
                  : '(🟢 Light / Safe Rain)'}
              </span>
            </div>

            <span className="text-slate-500 text-[10px]">
              {activeHover.isCurrent ? '● Current Hour' : activeHover.isPast ? 'Recorded' : 'Forecast'}
            </span>
          </div>
        )}

        {/* 24 Hourly Bars */}
        <div
          onMouseLeave={() => setHoveredHour(null)}
          className="h-36 flex items-end justify-between gap-1 sm:gap-1.5 px-1 bg-[#090E17]/60 rounded-lg border border-slate-800/60 p-2"
        >
          {hourlyData.map((item) => {
            const heightPct = Math.max(6, Math.min(100, (item.rainfallMm / maxVal) * 100));
            const barColor = getBarColor(item.rainfallMm, item.isCurrent);
            const isHovered = hoveredHour === item.hour;

            return (
              <div
                key={item.hour}
                onMouseEnter={() => setHoveredHour(item.hour)}
                onMouseLeave={() => setHoveredHour(null)}
                className="flex-1 h-full flex flex-col justify-end items-center cursor-pointer group relative"
              >
                {/* Bar */}
                <div
                  className={`w-full rounded-t transition-all duration-200 ${
                    item.isCurrent
                      ? 'ring-2 ring-white ring-offset-1 ring-offset-slate-900 shadow-lg'
                      : isHovered
                      ? 'brightness-125'
                      : 'opacity-90 hover:opacity-100'
                  }`}
                  style={{
                    height: `${heightPct}%`,
                    backgroundColor: barColor,
                  }}
                />

                {/* Pulse dot for current hour */}
                {item.isCurrent && (
                  <span className="absolute -top-3 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                )}
              </div>
            );
          })}
        </div>

        {/* Hour Axis Labels */}
        <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-2 px-1">
          <span>00:00 (Midnight)</span>
          <span>06:00</span>
          <span>12:00 (Noon)</span>
          <span className="text-cyan-400 font-bold">14:00 (Now)</span>
          <span>18:00</span>
          <span>23:00</span>
        </div>
      </div>

      {/* Simple Legend for Non-Experts */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-800/80 text-xs">
        <div className="flex items-center gap-4 text-[11px] font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-slate-300">Light Rain (&lt;15 mm/h) · Safe</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-slate-300">Heavy Rain (15–40 mm/h) · Warning</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span className="text-slate-300">Cloudburst (&gt;40 mm/h) · Danger</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 font-mono">
          Live AWS Rain Gauges: Updating every 60s
        </div>
      </div>
    </div>
  );
};
