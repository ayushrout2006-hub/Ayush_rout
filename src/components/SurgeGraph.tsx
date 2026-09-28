import React from 'react';
import { Waves, AlertTriangle, Clock, ArrowUpRight } from 'lucide-react';
import { generateHydrograph } from '../utils/mlEngine';

interface SurgeGraphProps {
  currentDischargeM3s: number;
  peakDischargeM3s: number;
  timeToPeakMinutes: number;
  dangerDischargeM3s?: number;
}

export const SurgeGraph: React.FC<SurgeGraphProps> = ({
  currentDischargeM3s,
  peakDischargeM3s,
  timeToPeakMinutes,
  dangerDischargeM3s = 450,
}) => {
  const points = generateHydrograph(peakDischargeM3s, timeToPeakMinutes, currentDischargeM3s);
  const maxDischarge = Math.max(...points.map((p) => p.discharge), dangerDischargeM3s * 1.25, 200);

  // SVG Coordinates
  const getCoordinates = (index: number, val: number) => {
    const x = (index / (points.length - 1)) * 520 + 35;
    const y = 160 - (val / maxDischarge) * 135;
    return { x, y };
  };

  const pathD = points
    .map((p, idx) => {
      const { x, y } = getCoordinates(idx, p.discharge);
      return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const areaD = `${pathD} L 555,160 L 35,160 Z`;

  const dangerY = 160 - (dangerDischargeM3s / maxDischarge) * 135;
  const isSurpassingDanger = peakDischargeM3s >= dangerDischargeM3s;

  const peakHour = (timeToPeakMinutes / 60).toFixed(1);

  return (
    <div className="bg-[#0D131F] border border-slate-800 rounded-xl p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-md bg-blue-950/80 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Waves className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Predicted River Flood Crest & Water Flow Surge (Next 8 Hours)
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            Real-time wave simulation showing expected water flow (m³/s) compared to safe bank limits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded text-xs font-mono font-bold flex items-center gap-1.5 ${
              isSurpassingDanger
                ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse'
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
            }`}
          >
            {isSurpassingDanger ? (
              <>
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>WILL CROSS DANGER LEVEL</span>
              </>
            ) : (
              <span>WITHIN SAFE LIMITS</span>
            )}
          </span>
        </div>
      </div>

      {/* Surge Wave SVG */}
      <div className="relative w-full h-44 bg-[#090E17]/60 rounded-lg border border-slate-800/80 p-2 overflow-hidden">
        <svg viewBox="0 0 580 180" className="w-full h-full">
          <defs>
            <linearGradient id="surgeAreaFill" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop
                offset="0%"
                stopColor={isSurpassingDanger ? '#EF4444' : '#0284C7'}
                stopOpacity="0.45"
              />
              <stop
                offset="100%"
                stopColor={isSurpassingDanger ? '#EF4444' : '#0284C7'}
                stopOpacity="0.0"
              />
            </linearGradient>
          </defs>

          {/* Danger mark horizontal dashed line */}
          <line
            x1="35"
            y1={dangerY}
            x2="555"
            y2={dangerY}
            stroke="#EF4444"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          <text
            x="550"
            y={dangerY - 5}
            textAnchor="end"
            fill="#EF4444"
            fontSize="9"
            fontFamily="JetBrains Mono"
            fontWeight="bold"
          >
            RED DANGER THRESHOLD ({dangerDischargeM3s} m³/s)
          </text>

          {/* Shaded Area under Curve */}
          <path d={areaD} fill="url(#surgeAreaFill)" />

          {/* Surge Line */}
          <path
            d={pathD}
            fill="none"
            stroke={isSurpassingDanger ? '#EF4444' : '#38BDF8'}
            strokeWidth="2.5"
          />

          {/* Peak Crest Marker */}
          {points.map((p, idx) => {
            if (!p.isPeak) return null;
            const { x, y } = getCoordinates(idx, p.discharge);
            return (
              <g key="peak-point">
                <circle cx={x} cy={y} r="5" fill="#FFFFFF" stroke="#EF4444" strokeWidth="2.5" />
                <rect
                  x={x - 45}
                  y={y - 28}
                  width="90"
                  height="20"
                  rx="4"
                  fill="#0F172A"
                  stroke="#EF4444"
                  strokeWidth="1"
                />
                <text
                  x={x}
                  y={y - 15}
                  textAnchor="middle"
                  fill="#F8FAFC"
                  fontSize="9"
                  fontFamily="JetBrains Mono"
                  fontWeight="bold"
                >
                  PEAK: {p.discharge} m³/s
                </text>
              </g>
            );
          })}

          {/* Time axis labels */}
          <text x="35" y="174" fill="#64748B" fontSize="9" fontFamily="JetBrains Mono">
            Now
          </text>
          <text x="165" y="174" fill="#64748B" fontSize="9" fontFamily="JetBrains Mono">
            +2 Hours
          </text>
          <text x="295" y="174" fill="#64748B" fontSize="9" fontFamily="JetBrains Mono">
            +4 Hours
          </text>
          <text x="425" y="174" fill="#64748B" fontSize="9" fontFamily="JetBrains Mono">
            +6 Hours
          </text>
          <text x="545" y="174" fill="#64748B" fontSize="9" textAnchor="end" fontFamily="JetBrains Mono">
            +8 Hours
          </text>
        </svg>
      </div>

      {/* Explanatory Callout in Plain Language */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-3 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>
            Highest flood water is projected to strike in approx.{' '}
            <strong className="text-cyan-300 font-mono">
              {Math.floor(timeToPeakMinutes / 60)} hours {timeToPeakMinutes % 60} mins
            </strong>
            .
          </span>
        </div>

        <div className="font-mono text-[11px] text-slate-400">
          Current: {currentDischargeM3s} m³/s → Projected Peak: {peakDischargeM3s} m³/s
        </div>
      </div>
    </div>
  );
};
