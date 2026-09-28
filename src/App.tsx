import React, { useState, useEffect, useMemo } from 'react';
import { REGIONS_DATA } from './data/regionsData';
import {
  HillyRegion,
  MultiSourceTelemetry,
  WardRiskPrediction,
  WhatIfScenarioState,
  MLModelHyperparameters,
  MLTrainingSummary,
} from './types';
import { calculateWardRisk, runSyntheticTraining } from './utils/mlEngine';
import { TopNav } from './components/TopNav';
import { TopographicalMap } from './components/TopographicalMap';
import { ModelTrainingStudio } from './components/ModelTrainingStudio';
import { TelemetryGrid } from './components/TelemetryGrid';
import { EarlyWarningPanel } from './components/EarlyWarningPanel';
import { StressTestSimulator } from './components/StressTestSimulator';
import { EvacuationModal } from './components/EvacuationModal';
import { AIAssessmentBriefing } from './components/AIAssessmentBriefing';
import { RainfallHistogram } from './components/RainfallHistogram';
import { SurgeGraph } from './components/SurgeGraph';
import { GoogleHazardMap } from './components/GoogleHazardMap';
import { useLanguage } from './context/LanguageContext';
import {
  Activity,
  ShieldAlert,
  Clock,
  Compass,
  Radio,
  Cpu,
  Footprints,
  Layers,
  Sparkles,
  Info,
  ChevronRight,
  Droplets,
  CloudRain,
  Mountain,
  MapPin,
} from 'lucide-react';

export default function App() {
  const { t } = useLanguage();

  // Navigation & Region selection
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'gis-map' | 'telemetry' | 'ml-studio' | 'evacuation'
  >('dashboard');
  const [selectedRegionId, setSelectedRegionId] = useState<string>(REGIONS_DATA[0].id);
  const [selectedWardId, setSelectedWardId] = useState<string>(REGIONS_DATA[0].wards[0].id);
  const [mapViewMode, setMapViewMode] = useState<'google' | 'contour'>('google');

  // Google Maps Quota Handling State
  const [quotaExceeded, setQuotaExceeded] = useState<boolean>(false);
  useEffect(() => {
    const handleQuotaExceeded = () => setQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuotaExceeded);
  }, []);

  // Live Telemetry Stream
  const [isLiveStreaming, setIsLiveStreaming] = useState<boolean>(true);

  // Modals
  const [isStressTestOpen, setIsStressTestOpen] = useState<boolean>(false);
  const [isEvacuationModalOpen, setIsEvacuationModalOpen] = useState<boolean>(false);
  const [targetEvacWardId, setTargetEvacWardId] = useState<string | null>(null);

  // Active Region
  const activeRegion = useMemo(() => {
    return REGIONS_DATA.find((r) => r.id === selectedRegionId) || REGIONS_DATA[0];
  }, [selectedRegionId]);

  // Multi-Source Telemetry State
  const [telemetry, setTelemetry] = useState<MultiSourceTelemetry>({
    rainfallRateMmH: 28.5,
    rainfall3hMm: 64.2,
    rainfall24hMm: 112.0,
    radarReflectivityDbz: 42,
    antecedentPrecipitationIndex: 58.0,
    soilMoisture30cmVwc: 68.4,
    soilMoisture60cmVwc: 74.2,
    soilMoisture100cmVwc: 79.5,
    poreWaterPressureKpa: 16.8,
    soilSaturationPct: 76,
    factorOfSafety: 1.18,
    overburdenDepthM: 3.4,
    acousticEmissionCounts: 18,
    riverStageMeters: 3.65,
    riverDangerStageM: 5.20,
    riverVelocityMs: 3.8,
    dischargeM3s: 245,
  });

  // What-If Scenario State
  const [scenario, setScenario] = useState<WhatIfScenarioState>({
    isActive: false,
    cloudburstIntensityMmH: 0,
    soilPreSaturationPct: 60,
    upstreamDebrisBreach: false,
    snowmeltRateMultiplier: 1.0,
  });

  // ML Model State
  const [mlHyperparams, setMlHyperparams] = useState<MLModelHyperparameters>({
    architecture: 'PINN_HYDRO',
    learningRate: 0.005,
    epochs: 35,
    batchSize: 32,
    antecedentWindowHours: 12,
    radarWeight: 0.35,
    soilMoistureWeight: 0.30,
    slopeAngleWeight: 0.20,
    porePressureWeight: 0.10,
    historicalGsiWeight: 0.05,
  });

  const [mlSummary, setMlSummary] = useState<MLTrainingSummary>(() =>
    runSyntheticTraining(mlHyperparams)
  );

  // Periodic Telemetry Jitter to simulate realistic IoT sensor dynamics
  useEffect(() => {
    if (!isLiveStreaming) return;

    const interval = setInterval(() => {
      setTelemetry((prev) => {
        const rainJitter = (Math.random() - 0.49) * 0.8;
        const stageJitter = (Math.random() - 0.49) * 0.04;
        const soilJitter = (Math.random() - 0.49) * 0.2;

        return {
          ...prev,
          rainfallRateMmH: Math.max(0, Math.min(150, prev.rainfallRateMmH + rainJitter)),
          riverStageMeters: Math.max(1, Math.min(9, prev.riverStageMeters + stageJitter)),
          soilSaturationPct: Math.max(20, Math.min(100, prev.soilSaturationPct + soilJitter)),
          dischargeM3s: Math.max(20, Math.round(prev.dischargeM3s + (stageJitter * 80))),
        };
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isLiveStreaming]);

  // Compute real-time predictions for all wards in active region
  const predictions: Record<string, WardRiskPrediction> = useMemo(() => {
    const map: Record<string, WardRiskPrediction> = {};
    activeRegion.wards.forEach((ward) => {
      map[ward.id] = calculateWardRisk(ward, telemetry, scenario, mlHyperparams);
    });
    return map;
  }, [activeRegion, telemetry, scenario, mlHyperparams]);

  // Highest threat ward in current region
  const highestThreatWard = useMemo(() => {
    return activeRegion.wards.reduce((prev, curr) => {
      const prevScore = predictions[prev.id]?.riskScore || 0;
      const currScore = predictions[curr.id]?.riskScore || 0;
      return currScore > prevScore ? curr : prev;
    }, activeRegion.wards[0]);
  }, [activeRegion, predictions]);

  const topPrediction = predictions[highestThreatWard?.id] || {
    riskScore: 24,
    leadTimeMinutes: 240,
    severity: 'NORMAL',
  };

  const handleOpenEvacuationPlan = (wardId: string) => {
    setTargetEvacWardId(wardId);
    setIsEvacuationModalOpen(true);
  };

  const targetEvacWard =
    activeRegion.wards.find((w) => w.id === targetEvacWardId) ||
    activeRegion.wards.find((w) => w.id === selectedWardId) ||
    activeRegion.wards[0];

  return (
    <div className="min-h-screen bg-[#080C14] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/20 selection:text-cyan-300">
      {/* Google Maps Platform Quota Notice Banner */}
      {quotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      {/* Top Bar adhering to 3-zone contract */}
      <TopNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isLiveStreaming={isLiveStreaming}
        setIsLiveStreaming={setIsLiveStreaming}
        activeRegionName={activeRegion.name}
        onOpenStressTest={() => setIsStressTestOpen(true)}
        hasActiveScenario={scenario.isActive}
      />

      {/* Region Selector & Status Ticker Sub-Ribbon */}
      <div className="bg-[#0B101A] border-b border-slate-800/80 px-4 lg:px-8 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          {/* Region Tabs (Interactive Filter Buttons) */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 rounded border border-slate-800">
            {REGIONS_DATA.map((r) => (
              <button
                key={r.id}
                onClick={() => {
                  setSelectedRegionId(r.id);
                  setSelectedWardId(r.wards[0].id);
                }}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                  selectedRegionId === r.id
                    ? 'bg-cyan-500 text-slate-950 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {r.name}
              </button>
            ))}
          </div>

          {/* Regional Context Unboxed Metadata */}
          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span>{t.state}: {activeRegion.state}</span>
            <span aria-hidden="true">·</span>
            <span>{t.basinArea}: {activeRegion.totalAreaKm2} km²</span>
            <span aria-hidden="true">·</span>
            <span>{t.activeSensors}: {activeRegion.activeSensorsCount}</span>
            <span aria-hidden="true">·</span>
            <span className="text-cyan-400">PINN Model Calibrated</span>
          </div>
        </div>
      </div>

      {/* Main Content Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8 space-y-6">
        {/* Active Scenario Alert Banner if Cloudburst Simulation is running */}
        {scenario.isActive && (
          <div className="p-3 bg-amber-950/40 border border-amber-500/60 rounded-lg flex items-center justify-between gap-4 animate-in fade-in">
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-amber-300">
                  {t.stormActive}:
                </span>{' '}
                <span className="text-slate-200">
                  +{scenario.cloudburstIntensityMmH} mm/h · Saturation (
                  {scenario.soilPreSaturationPct}%)
                  {scenario.upstreamDebrisBreach ? ' · Debris Barrier Breach Triggered' : ''}
                </span>
              </div>
            </div>
            <button
              onClick={() =>
                setScenario({
                  isActive: false,
                  cloudburstIntensityMmH: 0,
                  soilPreSaturationPct: 60,
                  upstreamDebrisBreach: false,
                  snowmeltRateMultiplier: 1.0,
                })
              }
              className="text-xs font-mono text-amber-300 hover:text-white px-2 py-1 bg-amber-900/60 rounded border border-amber-700/60"
            >
              Reset to Live Feeds
            </button>
          </div>
        )}

        {/* Tab 1: Operational Executive Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Top Critical Key Metric Indicators (Plain Language) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Area Status & Zone */}
              <div className="bg-[#0D131F] border border-slate-800 rounded-xl p-4 shadow-sm">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[11px] uppercase font-mono text-slate-400">
                    {t.highestAlert}
                  </span>
                  <span
                    className={`text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-full ${
                      topPrediction?.severity === 'EMERGENCY_EVACUATE'
                        ? 'bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse'
                        : topPrediction?.severity === 'WARNING' || topPrediction?.severity === 'WATCH'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    }`}
                  >
                    {topPrediction?.severity === 'EMERGENCY_EVACUATE'
                      ? t.redZone
                      : topPrediction?.severity === 'WARNING' || topPrediction?.severity === 'WATCH'
                      ? t.yellowZone
                      : t.greenZone}
                  </span>
                </div>
                <div className="text-lg font-bold text-white tracking-tight truncate mt-1">
                  {highestThreatWard?.name || 'Monitoring Basin'}
                </div>
                <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-300">
                  <span>{t.floodDangerScore}:</span>
                  <span
                    className={`font-bold font-mono text-sm tabular-nums ${
                      (topPrediction?.riskScore || 0) >= 70
                        ? 'text-red-400'
                        : (topPrediction?.riskScore || 0) >= 35
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {topPrediction.riskScore} / 100
                  </span>
                </div>
              </div>

              {/* Card 2: Time left to evacuate */}
              <div className="bg-[#0D131F] border border-slate-800 rounded-xl p-4 shadow-sm">
                <span className="text-[11px] uppercase font-mono text-slate-400 block mb-1">
                  {t.timeLeftToEvacuate}
                </span>
                <div className="text-2xl font-bold font-mono text-cyan-300 tabular-nums">
                  {Math.floor(topPrediction.leadTimeMinutes / 60)}h{' '}
                  {topPrediction.leadTimeMinutes % 60}m
                </div>
                <span className="text-[11px] text-slate-400 block mt-1">
                  {t.beforeSurgeReaches}
                </span>
              </div>

              {/* Card 3: Current Rainfall Rate & Severity */}
              <div className="bg-[#0D131F] border border-slate-800 rounded-xl p-4 shadow-sm">
                <span className="text-[11px] uppercase font-mono text-slate-400 block mb-1">
                  {t.currentRainIntensity}
                </span>
                <div className="text-2xl font-bold font-mono text-amber-400 tabular-nums">
                  {telemetry.rainfallRateMmH.toFixed(1)}{' '}
                  <span className="text-xs font-normal text-slate-400">mm/hour</span>
                </div>
                <span className="text-[11px] text-slate-400 block mt-1">
                  {telemetry.rainfallRateMmH > 40
                    ? `🔴 ${t.cloudburstTorrent}`
                    : telemetry.rainfallRateMmH > 15
                    ? `🟡 ${t.heavyDownpour}`
                    : `🟢 ${t.lightRain}`} · 24h: {telemetry.rainfall24hMm.toFixed(0)}mm
                </span>
              </div>

              {/* Card 4: River Water Level */}
              <div className="bg-[#0D131F] border border-slate-800 rounded-xl p-4 shadow-sm">
                <span className="text-[11px] uppercase font-mono text-slate-400 block mb-1">
                  {t.riverWaterHeight}
                </span>
                <div
                  className={`text-2xl font-bold font-mono tabular-nums ${
                    telemetry.riverStageMeters >= telemetry.riverDangerStageM
                      ? 'text-red-400'
                      : 'text-white'
                  }`}
                >
                  {telemetry.riverStageMeters.toFixed(2)}{' '}
                  <span className="text-xs font-normal text-slate-400">meters</span>
                </div>
                <span className="text-[11px] text-slate-400 block mt-1">
                  {t.safeLimit}: {telemetry.riverDangerStageM.toFixed(2)}m (
                  {telemetry.riverDangerStageM - telemetry.riverStageMeters > 0
                    ? `${(telemetry.riverDangerStageM - telemetry.riverStageMeters).toFixed(2)}m ${t.margin}`
                    : t.overflowing}
                  )
                </span>
              </div>
            </div>

            {/* Graphs Grid: Mini-Histogram & River Surge Graph */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Mini-Histogram Component for 24h Rain Intensity Distribution */}
              <RainfallHistogram
                currentRainRate={telemetry.rainfallRateMmH}
                totalRain24h={telemetry.rainfall24hMm}
                isSimulatingStorm={scenario.isActive}
              />

              {/* River Flood Crest & Water Flow Surge Graph */}
              <SurgeGraph
                currentDischargeM3s={telemetry.dischargeM3s}
                peakDischargeM3s={topPrediction.hydrographPeakDischargeM3s}
                timeToPeakMinutes={topPrediction.timeToPeakMinutes}
                dangerDischargeM3s={450}
              />
            </div>

            {/* Mountain Hazard Map Section with Switcher */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0D131F] border border-slate-800 rounded-lg p-2.5">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Interactive Mountain Hazard GIS Map
                  </span>
                  <span className="text-[11px] text-slate-400 hidden sm:inline">
                    · Live Satellite & Hazard Zones
                  </span>
                </div>
                <div className="flex items-center gap-1 bg-[#0B0F17] p-1 rounded border border-slate-800 text-xs">
                  <button
                    onClick={() => setMapViewMode('google')}
                    className={`px-3 py-1 rounded transition-colors font-medium flex items-center gap-1.5 ${
                      mapViewMode === 'google'
                        ? 'bg-cyan-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>{t.googleMapsGis}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  </button>
                  <button
                    onClick={() => setMapViewMode('contour')}
                    className={`px-3 py-1 rounded transition-colors font-medium ${
                      mapViewMode === 'contour'
                        ? 'bg-cyan-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {t.contourSimulation}
                  </button>
                </div>
              </div>

              {mapViewMode === 'google' ? (
                <GoogleHazardMap
                  region={activeRegion}
                  predictions={predictions}
                  selectedWardId={selectedWardId}
                  onSelectWard={(id) => setSelectedWardId(id)}
                  onOpenEvacuationPlan={handleOpenEvacuationPlan}
                  currentRainfallMmH={telemetry.rainfallRateMmH}
                />
              ) : (
                <TopographicalMap
                  region={activeRegion}
                  predictions={predictions}
                  selectedWardId={selectedWardId}
                  onSelectWard={(id) => setSelectedWardId(id)}
                  onOpenEvacuationPlan={handleOpenEvacuationPlan}
                  soilSaturationPct={telemetry.soilSaturationPct}
                />
              )}
            </div>

            {/* Villages & Areas Classified into Green, Yellow, and Red Zones */}
            <EarlyWarningPanel
              wards={activeRegion.wards}
              predictions={predictions}
              onSelectWard={(id) => setSelectedWardId(id)}
              onOpenEvacuationPlan={handleOpenEvacuationPlan}
              onOpenBroadcastDraft={handleOpenEvacuationPlan}
            />

            {/* Weather & Flood Situation Report (Plain Language) */}
            <AIAssessmentBriefing
              region={activeRegion}
              telemetry={telemetry}
              predictions={predictions}
              scenario={scenario}
            />
          </div>
        )}

        {/* Tab 2: Google Maps & Topographic GIS View */}
        {activeTab === 'gis-map' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0D131F] border border-slate-800 rounded-lg p-2.5">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  {t.navMaps}
                </span>
              </div>
              <div className="flex items-center gap-1 bg-[#0B0F17] p-1 rounded border border-slate-800 text-xs">
                <button
                  onClick={() => setMapViewMode('google')}
                  className={`px-3 py-1 rounded transition-colors font-medium flex items-center gap-1.5 ${
                    mapViewMode === 'google'
                      ? 'bg-cyan-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>{t.googleMapsGis}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </button>
                <button
                  onClick={() => setMapViewMode('contour')}
                  className={`px-3 py-1 rounded transition-colors font-medium ${
                    mapViewMode === 'contour'
                      ? 'bg-cyan-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t.contourSimulation}
                </button>
              </div>
            </div>

            {mapViewMode === 'google' ? (
              <GoogleHazardMap
                region={activeRegion}
                predictions={predictions}
                selectedWardId={selectedWardId}
                onSelectWard={(id) => setSelectedWardId(id)}
                onOpenEvacuationPlan={handleOpenEvacuationPlan}
                currentRainfallMmH={telemetry.rainfallRateMmH}
              />
            ) : (
              <TopographicalMap
                region={activeRegion}
                predictions={predictions}
                selectedWardId={selectedWardId}
                onSelectWard={(id) => setSelectedWardId(id)}
                onOpenEvacuationPlan={handleOpenEvacuationPlan}
                soilSaturationPct={telemetry.soilSaturationPct}
              />
            )}

            {/* Watershed Morphometry & Slope Inventory */}
            <div className="bg-[#0D131F] border border-slate-800 rounded-lg p-5">
              <h3 className="text-sm font-bold text-white uppercase font-mono mb-3">
                Catchment Basin Morphometric Parameters
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                <div className="p-3 bg-slate-900/60 rounded border border-slate-800/80">
                  <span className="text-slate-400 block mb-1">Hypsometric Integral (HI)</span>
                  <span className="text-base font-bold text-cyan-400">0.58 (Dissected Relief)</span>
                  <p className="text-[11px] text-slate-500 mt-1 font-sans">
                    Indicates youthful, steep erosion stage prone to debris torrents.
                  </p>
                </div>
                <div className="p-3 bg-slate-900/60 rounded border border-slate-800/80">
                  <span className="text-slate-400 block mb-1">Drainage Density (Dd)</span>
                  <span className="text-base font-bold text-cyan-400">3.82 km / km²</span>
                  <p className="text-[11px] text-slate-500 mt-1 font-sans">
                    High tributary density accelerates basin concentration time (Tc).
                  </p>
                </div>
                <div className="p-3 bg-slate-900/60 rounded border border-slate-800/80">
                  <span className="text-slate-400 block mb-1">Circularity Ratio (Rc)</span>
                  <span className="text-base font-bold text-cyan-400">0.41 (Elongated Gorge)</span>
                  <p className="text-[11px] text-slate-500 mt-1 font-sans">
                    Elongated gorge funnels flash surges into rapid downstream torrents.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: IoT Sensor Grid View */}
        {activeTab === 'telemetry' && (
          <TelemetryGrid
            telemetry={telemetry}
            sensors={activeRegion.sensors}
            onUpdateTelemetry={(updated) => setTelemetry((prev) => ({ ...prev, ...updated }))}
            isLiveStreaming={isLiveStreaming}
          />
        )}

        {/* Tab 4: AI/ML Training Studio View */}
        {activeTab === 'ml-studio' && (
          <ModelTrainingStudio
            onDeployModel={(newSummary, newParams) => {
              setMlSummary(newSummary);
              setMlHyperparams(newParams);
            }}
            currentSummary={mlSummary}
          />
        )}

        {/* Tab 5: Evacuation Protocol & Disaster Plan View */}
        {activeTab === 'evacuation' && (
          <div className="space-y-6">
            <EarlyWarningPanel
              wards={activeRegion.wards}
              predictions={predictions}
              onSelectWard={(id) => setSelectedWardId(id)}
              onOpenEvacuationPlan={handleOpenEvacuationPlan}
              onOpenBroadcastDraft={handleOpenEvacuationPlan}
            />

            {/* Historical Flood & Landslide Lessons */}
            <div className="bg-[#0D131F] border border-slate-800 rounded-lg p-5">
              <h3 className="text-sm font-bold text-white uppercase font-mono mb-3">
                Historical Disaster Invariants & Ground Truth ({activeRegion.name})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeRegion.historicalEvents.map((evt, idx) => (
                  <div key={idx} className="p-4 rounded bg-slate-900/60 border border-slate-800 text-xs">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="font-bold text-slate-200">{evt.title}</span>
                      <span className="font-mono text-cyan-400">{evt.year}</span>
                    </div>
                    <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400 mb-2">
                      <span>Casualties: {evt.fatalities}</span>
                      <span>·</span>
                      <span>Rainfall: {evt.rainfallMm} mm</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed italic">
                      "{evt.lesson}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Cloudburst & Multi-Source Stress Test Modal */}
      <StressTestSimulator
        scenario={scenario}
        onUpdateScenario={(updated) => setScenario((prev) => ({ ...prev, ...updated }))}
        onResetScenario={() =>
          setScenario({
            isActive: false,
            cloudburstIntensityMmH: 0,
            soilPreSaturationPct: 60,
            upstreamDebrisBreach: false,
            snowmeltRateMultiplier: 1.0,
          })
        }
        isOpen={isStressTestOpen}
        onClose={() => setIsStressTestOpen(false)}
      />

      {/* Ward Evacuation Action Plan & CAP Broadcast Modal */}
      <EvacuationModal
        ward={targetEvacWard}
        prediction={predictions[targetEvacWard?.id] || null}
        isOpen={isEvacuationModalOpen}
        onClose={() => setIsEvacuationModalOpen(false)}
      />

      {/* Quiet Footer conforming to anti-slop guidelines */}
      <footer className="mt-auto border-t border-slate-800/80 bg-[#06090F] px-4 lg:px-8 py-5 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">{t.appName}</span>
            <span>·</span>
            <span>{t.tagline}</span>
          </div>
          <div className="flex items-center gap-4 font-mono text-[11px]">
            <span>IMD Radar Gridded API</span>
            <span>·</span>
            <span>GSI Landslide Susceptibility Atlas</span>
            <span>·</span>
            <span>LoRaWAN Mesh Telemetry</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
