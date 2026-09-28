import React, { useState } from 'react';
import {
  CatchmentWard,
  WardRiskPrediction,
  AlertSeverity,
} from '../types';
import {
  ShieldAlert,
  Clock,
  Users,
  Footprints,
  Radio,
  AlertTriangle,
  CheckCircle2,
  Filter,
  ArrowUpRight,
} from 'lucide-react';

interface EarlyWarningPanelProps {
  wards: CatchmentWard[];
  predictions: Record<string, WardRiskPrediction>;
  onSelectWard: (wardId: string) => void;
  onOpenEvacuationPlan: (wardId: string) => void;
  onOpenBroadcastDraft: (wardId: string) => void;
}

export const EarlyWarningPanel: React.FC<EarlyWarningPanelProps> = ({
  wards,
  predictions,
  onSelectWard,
  onOpenEvacuationPlan,
  onOpenBroadcastDraft,
}) => {
  const [zoneFilter, setZoneFilter] = useState<'ALL' | 'RED' | 'YELLOW' | 'GREEN'>('ALL');

  // Categorize into Green, Yellow, Red zones
  const redWards = wards.filter((w) => {
    const s = predictions[w.id]?.severity;
    return s === 'EMERGENCY_EVACUATE';
  });

  const yellowWards = wards.filter((w) => {
    const s = predictions[w.id]?.severity;
    return s === 'WARNING' || s === 'WATCH';
  });

  const greenWards = wards.filter((w) => {
    const s = predictions[w.id]?.severity;
    return !s || s === 'NORMAL';
  });

  const filteredWards = wards.filter((w) => {
    const s = predictions[w.id]?.severity;
    if (zoneFilter === 'RED') return s === 'EMERGENCY_EVACUATE';
    if (zoneFilter === 'YELLOW') return s === 'WARNING' || s === 'WATCH';
    if (zoneFilter === 'GREEN') return !s || s === 'NORMAL';
    return true;
  });

  const getZoneBadge = (severity: AlertSeverity) => {
    if (severity === 'EMERGENCY_EVACUATE') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
          RED ZONE · DANGER (EVACUATE NOW)
        </span>
      );
    }
    if (severity === 'WARNING' || severity === 'WATCH') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          YELLOW ZONE · CAUTION (PREPARE)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
        GREEN ZONE · SAFE (NORMAL)
      </span>
    );
  };

  return (
    <div className="space-y-5">
      {/* Zone Summary & Category Filters */}
      <div className="bg-[#0D131F] border border-slate-800 rounded-xl p-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-cyan-400" />
              <span>Village & Ward Safety Status by Zone</span>
            </h3>
            <p className="text-xs text-slate-400">
              Areas classified into Red (Danger), Yellow (Caution), and Green (Safe) based on live rain and river sensors.
            </p>
          </div>

          {/* Interactive Zone Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setZoneFilter('ALL')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                zoneFilter === 'ALL'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Areas ({wards.length})
            </button>
            <button
              onClick={() => setZoneFilter('RED')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                zoneFilter === 'RED'
                  ? 'bg-red-500 text-slate-950 font-bold'
                  : 'text-red-400 hover:bg-red-950/30'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-red-400" />
              <span>Red ({redWards.length})</span>
            </button>
            <button
              onClick={() => setZoneFilter('YELLOW')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                zoneFilter === 'YELLOW'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-amber-400 hover:bg-amber-950/30'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Yellow ({yellowWards.length})</span>
            </button>
            <button
              onClick={() => setZoneFilter('GREEN')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                zoneFilter === 'GREEN'
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'text-emerald-400 hover:bg-emerald-950/30'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Green ({greenWards.length})</span>
            </button>
          </div>
        </div>

        {/* Big visual banner if any Red Zone area is active */}
        {redWards.length > 0 && (
          <div className="p-3 bg-red-950/40 border border-red-500/50 rounded-lg flex items-center justify-between gap-3 text-xs text-red-200">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 animate-bounce" />
              <div>
                <strong className="text-red-300 font-bold">EMERGENCY ACTION REQUIRED:</strong>{' '}
                <span>
                  {redWards.length} area(s) are in the Red Zone. River water is rising and mountain slopes are unstable.
                </span>
              </div>
            </div>
            <button
              onClick={() => onOpenEvacuationPlan(redWards[0].id)}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded text-xs font-semibold whitespace-nowrap transition-colors"
            >
              Start Evacuation
            </button>
          </div>
        )}
      </div>

      {/* Ward Cards List */}
      <div className="space-y-3">
        {filteredWards.map((ward) => {
          const pred = predictions[ward.id] || {
            riskScore: 20,
            debrisFlowRiskScore: 15,
            severity: 'NORMAL' as AlertSeverity,
            leadTimeMinutes: 240,
            hydrographPeakDischargeM3s: 50,
          };

          const isRed = pred.severity === 'EMERGENCY_EVACUATE';
          const isYellow = pred.severity === 'WARNING' || pred.severity === 'WATCH';
          const isGreen = !isRed && !isYellow;

          const leadHours = Math.floor(pred.leadTimeMinutes / 60);
          const leadMins = pred.leadTimeMinutes % 60;

          // Plain language explanation of risk
          let plainExplanation = 'Conditions are normal. River flow is safe, and mountain slopes are solid.';
          if (isRed) {
            plainExplanation = `Danger! High water will flood riverside homes in ~${leadHours}h ${leadMins}m. Ground is completely soaked with mudslide risk.`;
          } else if (isYellow) {
            plainExplanation = `Be alert! Moderate to heavy rain has swollen streams. High water level expected within ~${leadHours}h ${leadMins}m.`;
          }

          return (
            <div
              key={ward.id}
              className={`bg-[#0D131F] border rounded-xl p-5 transition-all shadow-sm ${
                isRed
                  ? 'border-red-500/60 bg-red-950/15 ring-1 ring-red-500/30'
                  : isYellow
                  ? 'border-amber-500/50 bg-amber-950/10'
                  : 'border-slate-800'
              }`}
            >
              {/* Header: Area Name & Zone Badge */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                <div>
                  <div className="flex items-center gap-3">
                    <h4 className="text-base font-bold text-white tracking-tight">
                      {ward.name}
                    </h4>
                    <span className="text-xs text-slate-400 font-medium">
                      ({ward.hindiName})
                    </span>
                    {getZoneBadge(pred.severity)}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    District: {ward.district} · Population: {ward.population.toLocaleString()} ({ward.vulnerableHouseholds} homes along river)
                  </div>
                </div>

                {/* Evacuation Time Remaining Pill */}
                <div
                  className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg border text-xs font-mono font-bold ${
                    isRed
                      ? 'bg-red-950/80 border-red-500/60 text-red-300'
                      : isYellow
                      ? 'bg-amber-950/80 border-amber-500/60 text-amber-300'
                      : 'bg-slate-900 border-slate-800 text-slate-300'
                  }`}
                >
                  <Clock className="w-4 h-4 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block font-normal uppercase">
                      Time to Flood Peak
                    </span>
                    <span>
                      {leadHours}h {leadMins}m
                    </span>
                  </div>
                </div>
              </div>

              {/* Body: Plain English Weather & Ground Alert */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 py-4 text-xs">
                {/* Plain Status Description */}
                <div className="md:col-span-6 space-y-2">
                  <span className="text-[11px] uppercase font-mono text-slate-400 block font-semibold">
                    Current Weather & Ground Threat
                  </span>
                  <p className="text-slate-200 text-sm leading-relaxed font-medium">
                    {plainExplanation}
                  </p>

                  <div className="flex items-center gap-3 pt-2 text-xs font-mono">
                    <span className="text-slate-400">Flood Risk Score:</span>
                    <span
                      className={`font-bold text-sm ${
                        isRed ? 'text-red-400' : isYellow ? 'text-amber-400' : 'text-emerald-400'
                      }`}
                    >
                      {pred.riskScore} / 100
                    </span>
                    <span className="text-slate-500">·</span>
                    <span className="text-slate-400">Mudslide Risk:</span>
                    <span
                      className={`font-bold text-sm ${
                        pred.debrisFlowRiskScore >= 50
                          ? 'text-red-400'
                          : pred.debrisFlowRiskScore >= 30
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {pred.debrisFlowRiskScore}%
                    </span>
                  </div>
                </div>

                {/* Safe High-Ground Shelter Information */}
                <div className="md:col-span-6 bg-slate-900/60 border border-slate-800 rounded-lg p-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold mb-1">
                      <Footprints className="w-4 h-4" />
                      <span>Designated High-Ground Shelter</span>
                    </div>
                    <p className="text-slate-100 font-semibold text-xs">
                      {ward.musterPoint.name}
                    </p>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Elevation: {ward.musterPoint.elevationMeters}m (+
                      {ward.musterPoint.elevationMeters - ward.elevationMeters}m higher than valley) ·{' '}
                      {ward.musterPoint.distanceKm} km walking trail
                    </p>
                  </div>

                  <div className="text-[11px] text-cyan-400 font-mono mt-2">
                    Capacity: Up to {ward.musterPoint.capacity.toLocaleString()} people
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
                <span className="text-xs text-slate-400 italic">
                  {isRed
                    ? 'Recommended: Ring alarm sirens and begin moving families to high ground.'
                    : isYellow
                    ? 'Recommended: Warn riverside families to keep emergency bags ready.'
                    : 'Recommended: Routine weather monitoring. No evacuation required.'}
                </span>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onOpenBroadcastDraft(ward.id)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition-colors flex items-center gap-1.5"
                  >
                    <Radio className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Send SMS/Siren</span>
                  </button>

                  <button
                    onClick={() => onOpenEvacuationPlan(ward.id)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                      isRed
                        ? 'bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-950'
                        : isYellow
                        ? 'bg-amber-600 hover:bg-amber-500 text-white'
                        : 'bg-cyan-600 hover:bg-cyan-500 text-white'
                    }`}
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Evacuation Guide</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
