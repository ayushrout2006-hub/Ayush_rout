import React, { useState, useEffect } from 'react';
import {
  HillyRegion,
  CatchmentWard,
  WardRiskPrediction,
  MultiSourceTelemetry,
  WhatIfScenarioState,
} from '../types';
import {
  Sparkles,
  FileText,
  AlertCircle,
  RefreshCw,
  Printer,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
} from 'lucide-react';

interface AIAssessmentBriefingProps {
  region: HillyRegion;
  telemetry: MultiSourceTelemetry;
  predictions: Record<string, WardRiskPrediction>;
  scenario: WhatIfScenarioState;
}

export const AIAssessmentBriefing: React.FC<AIAssessmentBriefingProps> = ({
  region,
  telemetry,
  predictions,
  scenario,
}) => {
  const [briefingText, setBriefingText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // Generate or regenerate simple plain language situation report
  const generateAssessment = () => {
    setIsLoading(true);

    const highestRiskWard = region.wards.reduce((prev, curr) => {
      const prevRisk = predictions[prev.id]?.riskScore || 0;
      const currRisk = predictions[curr.id]?.riskScore || 0;
      return currRisk > prevRisk ? curr : prev;
    }, region.wards[0]);

    const topPred = predictions[highestRiskWard.id];

    setTimeout(() => {
      const isExtreme = (topPred?.riskScore || 0) >= 70;
      const isModerate = (topPred?.riskScore || 0) >= 35;

      const rainSeverity =
        telemetry.rainfallRateMmH > 40
          ? 'Cloudburst Torrent (Very Dangerous)'
          : telemetry.rainfallRateMmH > 15
          ? 'Heavy Downpour (Watch Alert)'
          : 'Light to Moderate Showers';

      const soilState =
        telemetry.soilSaturationPct > 80
          ? 'Soil is completely waterlogged like a soaked sponge. New rain will not sink in and will run directly into rivers.'
          : telemetry.soilSaturationPct > 60
          ? 'Soil is heavily wet from previous rains. Mountain streams are running fast.'
          : 'Soil moisture is normal. Ground can still absorb steady rain.';

      const leadH = Math.floor((topPred?.leadTimeMinutes || 180) / 60);
      const leadM = (topPred?.leadTimeMinutes || 180) % 60;

      const synthesis = `WEATHER & FLOOD SITUATION REPORT (PLAIN LANGUAGE BRIEFING)
Region: ${region.name} (${region.state})
Most Threatened Area: ${highestRiskWard.name} (${highestRiskWard.hindiName})
Time Issued: ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} IST · ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}

1. WEATHER & RAINFALL ALERT:
• Current Rain Status: ${rainSeverity} (${telemetry.rainfallRateMmH.toFixed(1)} mm per hour).
• Last 3 Hours Total: ${telemetry.rainfall3hMm.toFixed(1)} mm of accumulated rain.
• Storm Radar View: Radar reflectivity (${telemetry.radarReflectivityDbz} dBZ) confirms heavy storm clouds concentrated directly above the mountain peaks.

2. RIVER WATER LEVEL & GROUND STATUS:
• River Water Height: Currently ${telemetry.riverStageMeters.toFixed(2)} meters (Safe Limit: ${telemetry.riverDangerStageM.toFixed(2)} meters).
• Water Flow Rate: ${telemetry.dischargeM3s.toFixed(0)} cubic meters per second rushing through the valley gorge.
• Mountain Ground Condition: ${soilState}
• Landslide & Mud Threat: ${topPred?.debrisFlowRiskScore || 20}% risk of mud and loose rocks sliding down steep slopes.

3. EXPECTED TIMELINE & WHAT RESIDENTS SHOULD DO:
• Time Left Before Peak Flood Crest: Approximately ${leadH} hours ${leadM} minutes.
• Red Alert Instructions: ${
        isExtreme
          ? `IMMEDIATE EVACUATION for riverside families in ${highestRiskWard.name}. Walk quickly to the designated safe high ground at ${highestRiskWard.musterPoint.name} (${highestRiskWard.musterPoint.elevationMeters}m high). Do not try to cross swollen streams or wooden footbridges.`
          : isModerate
          ? `YELLOW ALERT: Stay awake and monitor water levels. Pack drinking water, medicine, and emergency identification papers. Keep cattle away from the river bank.`
          : `GREEN: Routine monitoring. All streams are currently flowing safely.`
      }
• Emergency Relief Teams: Local disaster teams and police are on standby along the main road.`;

      setBriefingText(synthesis);
      setIsLoading(false);
    }, 300);
  };

  useEffect(() => {
    generateAssessment();
  }, [region.id, scenario.isActive]);

  return (
    <div className="bg-[#0D131F] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
      {/* Header Accordion */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between p-4 bg-[#090E17] cursor-pointer hover:bg-slate-900/60 transition-colors border-b border-slate-800"
      >
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white tracking-tight">
            Weather & Flood Situation Report (Plain Language Summary)
          </h3>
          <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/70 px-2 py-0.5 rounded border border-cyan-800/40">
            Live AI Analysis
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              generateAssessment();
            }}
            disabled={isLoading}
            className="p-1 rounded text-slate-400 hover:text-white transition-colors"
            title="Update Report"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </div>

      {/* Briefing Text Content */}
      {isExpanded && (
        <div className="p-5 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-6 text-xs font-mono text-cyan-400 gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Analyzing rainfall radar and ground water sensors...</span>
            </div>
          ) : (
            <div className="space-y-4">
              <pre className="p-4 bg-[#080C14] border border-slate-800/90 rounded-lg font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                {briefingText}
              </pre>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60">
                <span className="text-[11px] text-slate-400">
                  Written in simple everyday language for operators, village chiefs, and volunteers.
                </span>
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Weather Notice</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
