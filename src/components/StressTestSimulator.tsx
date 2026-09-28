import React from 'react';
import { WhatIfScenarioState } from '../types';
import {
  CloudLightning,
  Droplets,
  Mountain,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Zap,
  CheckCircle,
} from 'lucide-react';

interface StressTestSimulatorProps {
  scenario: WhatIfScenarioState;
  onUpdateScenario: (updated: Partial<WhatIfScenarioState>) => void;
  onResetScenario: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const StressTestSimulator: React.FC<StressTestSimulatorProps> = ({
  scenario,
  onUpdateScenario,
  onResetScenario,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const presets = [
    {
      name: 'Baseline Telemetry',
      cloudburst: 0,
      soilSat: 55,
      debrisBreach: false,
      snowmelt: 1.0,
      desc: 'Typical pre-monsoon moisture levels with no abnormal upstream obstruction.',
    },
    {
      name: '2023 Beas Cloudburst',
      cloudburst: 110,
      soilSat: 92,
      debrisBreach: false,
      snowmelt: 1.4,
      desc: 'Severe orographic cloudburst dump >100mm/h over 2 hours into narrow gorge.',
    },
    {
      name: 'Glacial Rockfall & Debris Burst',
      cloudburst: 35,
      soilSat: 80,
      debrisBreach: true,
      snowmelt: 2.2,
      desc: 'Upstream landslide dam breach unleashing rapid high-density mud and boulder surge.',
    },
    {
      name: 'Wayanad Saturation Failure',
      cloudburst: 85,
      soilSat: 98,
      debrisBreach: false,
      snowmelt: 1.0,
      desc: 'Multi-day antecedent deluge saturating saprolite soils to complete fluidization.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-[#0D131F] border border-amber-500/40 rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-[#090D15] border-b border-slate-800">
          <div className="flex items-center gap-2">
            <CloudLightning className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white tracking-tight">
              Cloudburst & Multi-Source Stress Test Simulator
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-sm font-mono px-2 py-1"
          >
            ✕ Close
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          <p className="text-xs text-slate-300 leading-relaxed">
            Simulate extreme orographic cloudburst storms, saturated regolith conditions, and upstream landslide barrier failures to stress-test early warning lead times and village evacuation protocols.
          </p>

          {/* Quick Presets */}
          <div>
            <span className="text-[11px] uppercase font-mono text-slate-400 block mb-2">
              Quick Historical Disaster Presets
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {presets.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() =>
                    onUpdateScenario({
                      isActive: preset.cloudburst > 0 || preset.debrisBreach || preset.soilSat > 70,
                      cloudburstIntensityMmH: preset.cloudburst,
                      soilPreSaturationPct: preset.soilSat,
                      upstreamDebrisBreach: preset.debrisBreach,
                      snowmeltRateMultiplier: preset.snowmelt,
                    })
                  }
                  className="p-2.5 rounded border border-slate-800 bg-slate-900/60 hover:border-amber-500/60 hover:bg-slate-900 text-left transition-colors text-xs"
                >
                  <span className="font-bold text-slate-200 block mb-0.5">{preset.name}</span>
                  <span className="text-[11px] text-slate-400 line-clamp-2">{preset.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Sliders */}
          <div className="space-y-4 pt-3 border-t border-slate-800">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Cloudburst Rainfall Surge Rate</span>
                <span className="font-mono text-amber-400 font-bold tabular-nums">
                  +{scenario.cloudburstIntensityMmH} mm/h
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="160"
                step="5"
                value={scenario.cloudburstIntensityMmH}
                onChange={(e) =>
                  onUpdateScenario({
                    isActive: true,
                    cloudburstIntensityMmH: parseInt(e.target.value),
                  })
                }
                className="w-full accent-amber-500 bg-slate-800 h-2 rounded cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                <span>0 mm/h (Normal)</span>
                <span>50 mm/h (Heavy)</span>
                <span>100+ mm/h (Severe Cloudburst)</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Antecedent Catchment Soil Saturation</span>
                <span className="font-mono text-amber-400 font-bold tabular-nums">
                  {scenario.soilPreSaturationPct}%
                </span>
              </div>
              <input
                type="range"
                min="30"
                max="100"
                step="1"
                value={scenario.soilPreSaturationPct}
                onChange={(e) =>
                  onUpdateScenario({
                    isActive: true,
                    soilPreSaturationPct: parseInt(e.target.value),
                  })
                }
                className="w-full accent-amber-500 bg-slate-800 h-2 rounded cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                <span>30% (Dry)</span>
                <span>75% (High Moisture)</span>
                <span>100% (Complete Liquefaction)</span>
              </div>
            </div>

            {/* Toggle: Debris Lake Breach */}
            <div className="flex items-center justify-between p-3 rounded bg-slate-900/60 border border-slate-800">
              <div>
                <span className="text-xs font-semibold text-white block">
                  Upstream Landslide Dam / Moraine Lake Breach
                </span>
                <span className="text-[11px] text-slate-400">
                  Simulates sudden release of impounded mud and boulder lake (GLOF / rockfall surge)
                </span>
              </div>
              <button
                onClick={() =>
                  onUpdateScenario({
                    isActive: true,
                    upstreamDebrisBreach: !scenario.upstreamDebrisBreach,
                  })
                }
                className={`px-3 py-1.5 rounded text-xs font-bold font-mono transition-colors ${
                  scenario.upstreamDebrisBreach
                    ? 'bg-red-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                {scenario.upstreamDebrisBreach ? 'BREACH TRIGGERED' : 'OFF'}
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-4 bg-[#090D15] border-t border-slate-800">
          <button
            onClick={() => {
              onResetScenario();
            }}
            className="px-3 py-2 rounded text-xs font-medium text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Live Feeds</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-md"
          >
            Apply & View Dashboard Impact
          </button>
        </div>
      </div>
    </div>
  );
};
