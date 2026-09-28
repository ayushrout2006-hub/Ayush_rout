import React, { useState, useRef } from 'react';
import {
  HillyRegion,
  CatchmentWard,
  WardRiskPrediction,
  SensorNode,
  AlertSeverity,
} from '../types';
import {
  Layers,
  MapPin,
  Radio,
  Clock,
  Compass,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ShieldAlert,
  Users,
  Footprints,
  Info,
  X,
} from 'lucide-react';

interface TopographicalMapProps {
  region: HillyRegion;
  predictions: Record<string, WardRiskPrediction>;
  selectedWardId: string | null;
  onSelectWard: (wardId: string) => void;
  onOpenEvacuationPlan: (wardId: string) => void;
  soilSaturationPct: number;
}

export const TopographicalMap: React.FC<TopographicalMapProps> = ({
  region,
  predictions,
  selectedWardId,
  onSelectWard,
  onOpenEvacuationPlan,
  soilSaturationPct,
}) => {
  // Layer toggles
  const [showContours, setShowContours] = useState(true);
  const [showRunoffFlow, setShowRunoffFlow] = useState(true);
  const [showSoilHeatmap, setShowSoilHeatmap] = useState(false);
  const [showSensors, setShowSensors] = useState(true);
  const [showEvacRoutes, setShowEvacRoutes] = useState(true);

  // Viewport zoom
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedSensorNode, setSelectedSensorNode] = useState<SensorNode | null>(null);
  const [mouseCoords, setMouseCoords] = useState<{ x: number; y: number }>({ x: 30.34, y: 79.56 });

  const activeWard = region.wards.find((w) => w.id === selectedWardId) || region.wards[0];
  const activePred = predictions[activeWard?.id] || {
    riskScore: 22,
    severity: 'NORMAL' as AlertSeverity,
    leadTimeMinutes: 240,
    confidencePct: 92,
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width;
    const yPct = (e.clientY - rect.top) / rect.height;
    // Map to realistic coordinates around Himalayan / Western Ghats basin
    const lat = (30.2 + yPct * 0.4).toFixed(4);
    const lon = (79.4 + xPct * 0.4).toFixed(4);
    setMouseCoords({ x: parseFloat(lat), y: parseFloat(lon) });
  };

  const getSeverityColor = (severity: AlertSeverity) => {
    switch (severity) {
      case 'EMERGENCY_EVACUATE':
        return '#EF4444'; // Red
      case 'WARNING':
        return '#F59E0B'; // Amber
      case 'WATCH':
        return '#EAB308'; // Yellow
      case 'NORMAL':
      default:
        return '#10B981'; // Emerald
    }
  };

  return (
    <div className="bg-[#0D131F] border border-slate-800 rounded-lg overflow-hidden flex flex-col h-full min-h-[620px]">
      {/* Map Header & Controls Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-[#090D15] border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold text-slate-200">
            GIS Topographic DEM & Watershed Routing
          </span>
          <span className="text-slate-500">·</span>
          <span className="text-slate-400 font-mono text-[11px]">
            {region.basin}
          </span>
        </div>

        {/* Layer Checkboxes */}
        <div className="flex items-center gap-4 text-slate-300">
          <label className="flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors">
            <input
              type="checkbox"
              checked={showContours}
              onChange={(e) => setShowContours(e.target.checked)}
              className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0 w-3.5 h-3.5"
            />
            <span className="text-[11px]">Contours</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors">
            <input
              type="checkbox"
              checked={showRunoffFlow}
              onChange={(e) => setShowRunoffFlow(e.target.checked)}
              className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0 w-3.5 h-3.5"
            />
            <span className="text-[11px]">Runoff Flow</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors">
            <input
              type="checkbox"
              checked={showSoilHeatmap}
              onChange={(e) => setShowSoilHeatmap(e.target.checked)}
              className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0 w-3.5 h-3.5"
            />
            <span className="text-[11px]">Soil Saturation</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors">
            <input
              type="checkbox"
              checked={showSensors}
              onChange={(e) => setShowSensors(e.target.checked)}
              className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0 w-3.5 h-3.5"
            />
            <span className="text-[11px]">IoT Sensors</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors">
            <input
              type="checkbox"
              checked={showEvacRoutes}
              onChange={(e) => setShowEvacRoutes(e.target.checked)}
              className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0 w-3.5 h-3.5"
            />
            <span className="text-[11px]">Evacuation Corridors</span>
          </label>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setZoomLevel((z) => Math.min(1.6, z + 0.15))}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.max(0.85, z - 0.15))}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoomLevel(1)}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            title="Reset Zoom"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Map Stage + Side Inspector Drawer */}
      <div className="relative flex-1 flex overflow-hidden">
        {/* SVG Topographic Stage */}
        <div className="flex-1 relative bg-[#070B12] overflow-hidden flex items-center justify-center cursor-crosshair">
          <svg
            viewBox="0 0 1000 680"
            className="w-full h-full object-contain transition-transform duration-300 select-none"
            style={{ transform: `scale(${zoomLevel})` }}
            onMouseMove={handleMouseMove}
          >
            <defs>
              {/* Hypsometric Elevation Gradients */}
              <linearGradient id="elevationRamp" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1E293B" stopOpacity="0.8" />
                <stop offset="40%" stopColor="#0F172A" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#0B132B" stopOpacity="1" />
              </linearGradient>

              {/* Soil Saturation Heatmap filter */}
              <radialGradient id="soilGlowHigh" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.45" />
                <stop offset="60%" stopColor="#06B6D4" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#06B6D4" stopOpacity="0" />
              </radialGradient>

              {/* Pulse animation for high-risk red wards */}
              <radialGradient id="dangerPulse" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#EF4444" stopOpacity="0.6" />
                <stop offset="70%" stopColor="#EF4444" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
              </radialGradient>

              {/* River flow animated dash marker */}
              <marker
                id="flowArrow"
                viewBox="0 0 10 10"
                refX="5"
                refY="5"
                markerWidth="4"
                markerHeight="4"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 8 5 L 0 9 z" fill="#38BDF8" />
              </marker>
            </defs>

            {/* Base Terrain Background with Digital Elevation Model (DEM) fill */}
            <rect width="1000" height="680" fill="url(#elevationRamp)" />

            {/* Simulated DEM Topographic Contour Lines */}
            {showContours && (
              <g stroke="#1E293B" strokeWidth="1" fill="none" opacity="0.85">
                {/* 2,800m Upper Ridge line */}
                <path d="M 50,120 Q 220,60 480,90 T 920,80" stroke="#334155" strokeWidth="1.2" />
                {/* 2,400m Line */}
                <path d="M 40,180 Q 240,130 520,160 T 940,150" />
                {/* 2,000m Intermediate Contour */}
                <path d="M 60,250 Q 260,210 500,240 T 910,230" stroke="#334155" />
                {/* 1,600m Valley Slope Line */}
                <path d="M 30,340 Q 280,310 540,320 T 960,330" />
                {/* 1,200m River Gorge Contour */}
                <path d="M 80,430 Q 310,410 520,420 T 890,440" />
                {/* 800m Lower Valley Contour */}
                <path d="M 50,540 Q 290,520 530,550 T 940,560" stroke="#334155" />

                {/* Transverse Ridge Formations */}
                <path d="M 180,80 Q 210,300 240,580" strokeDasharray="3 3" opacity="0.4" />
                <path d="M 420,70 Q 450,290 480,610" strokeDasharray="3 3" opacity="0.4" />
                <path d="M 720,90 Q 750,320 780,600" strokeDasharray="3 3" opacity="0.4" />
              </g>
            )}

            {/* Soil Saturation Overlay Heatmap (if enabled) */}
            {showSoilHeatmap && (
              <g>
                <circle cx="550" cy="260" r="160" fill="url(#soilGlowHigh)" />
                <circle cx="380" cy="320" r="140" fill="url(#soilGlowHigh)" />
                <circle cx="680" cy="440" r="180" fill="url(#soilGlowHigh)" />
              </g>
            )}

            {/* Primary River Drainage & Tributaries Network */}
            <g>
              {/* Tributary 1: Northern Headwaters */}
              <path
                d="M 620,40 Q 580,140 540,240 T 480,360"
                stroke="#0284C7"
                strokeWidth="2.5"
                fill="none"
                opacity="0.7"
              />
              {/* Tributary 2: Eastern Glacial Gorge */}
              <path
                d="M 900,180 Q 760,260 620,340 T 480,360"
                stroke="#0284C7"
                strokeWidth="3"
                fill="none"
                opacity="0.8"
              />

              {/* Main Stem River Channel (Thick animated flow) */}
              <path
                id="mainRiverPath"
                d="M 480,360 Q 420,430 380,480 T 260,620"
                stroke="#38BDF8"
                strokeWidth={activePred.severity === 'EMERGENCY_EVACUATE' ? 6 : 4}
                fill="none"
                markerMid="url(#flowArrow)"
              />

              {/* Animated Runoff Flow Wave vectors */}
              {showRunoffFlow && (
                <path
                  d="M 480,360 Q 420,430 380,480 T 260,620"
                  stroke="#E0F2FE"
                  strokeWidth="2"
                  strokeDasharray="12 18"
                  fill="none"
                  className="animate-pulse"
                />
              )}
            </g>

            {/* Evacuation Corridors & Safe Muster Ridges */}
            {showEvacRoutes &&
              region.wards.map((ward) => {
                const wx = (ward.coordinates.x / 100) * 1000;
                const wy = (ward.coordinates.y / 100) * 680;
                // Muster point located slightly upslope towards ridge
                const mx = wx + (ward.coordinates.x > 50 ? 50 : -45);
                const my = wy - 75;

                return (
                  <g key={`evac-${ward.id}`}>
                    {/* Escape trail line */}
                    <line
                      x1={wx}
                      y1={wy}
                      x2={mx}
                      y2={my}
                      stroke="#10B981"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                      opacity="0.8"
                    />
                    {/* Muster Point Marker */}
                    <circle cx={mx} cy={my} r="5" fill="#10B981" stroke="#064E3B" strokeWidth="2" />
                    <text
                      x={mx + 8}
                      y={my + 4}
                      fill="#A7F3D0"
                      fontSize="9"
                      fontFamily="JetBrains Mono"
                      fontWeight="500"
                    >
                      Safe: {ward.musterPoint?.name?.split(' ')[0] || 'Shelter'} ({ward.musterPoint?.elevationMeters || 0}m)
                    </text>
                  </g>
                );
              })}

            {/* Village / Ward Centers and Threat Halos */}
            {region.wards.map((ward) => {
              const wx = (ward.coordinates.x / 100) * 1000;
              const wy = (ward.coordinates.y / 100) * 680;
              const pred = predictions[ward.id] || {
                riskScore: 20,
                severity: 'NORMAL' as AlertSeverity,
                leadTimeMinutes: 240,
              };
              const isSelected = ward.id === selectedWardId;
              const sevColor = getSeverityColor(pred.severity);

              return (
                <g
                  key={ward.id}
                  onClick={() => onSelectWard(ward.id)}
                  className="cursor-pointer group"
                >
                  {/* Danger halo for Warning / Emergency */}
                  {pred.severity === 'EMERGENCY_EVACUATE' && (
                    <circle
                      cx={wx}
                      cy={wy}
                      r="42"
                      fill="url(#dangerPulse)"
                      className="animate-ping origin-center"
                      style={{ transformOrigin: `${wx}px ${wy}px` }}
                    />
                  )}

                  {/* Village catchment area polygon approximation */}
                  <polygon
                    points={`${wx - 26},${wy - 18} ${wx + 24},${wy - 22} ${wx + 34},${wy + 16} ${wx - 20},${wy + 24}`}
                    fill={sevColor}
                    fillOpacity={isSelected ? 0.35 : 0.16}
                    stroke={sevColor}
                    strokeWidth={isSelected ? 2.5 : 1.2}
                    className="transition-all duration-200"
                  />

                  {/* Ward Marker Pin */}
                  <circle
                    cx={wx}
                    cy={wy}
                    r={isSelected ? 7 : 5}
                    fill={sevColor}
                    stroke="#0B0F17"
                    strokeWidth="2"
                  />

                  {/* Ward Label */}
                  <text
                    x={wx}
                    y={wy - 16}
                    textAnchor="middle"
                    fill="#F8FAFC"
                    fontSize="11"
                    fontWeight="600"
                    className="drop-shadow-md select-none"
                  >
                    {ward.name.split('(')[0].trim()}
                  </text>

                  {/* Risk Score Pill Text */}
                  <text
                    x={wx}
                    y={wy + 28}
                    textAnchor="middle"
                    fill={sevColor}
                    fontSize="9"
                    fontFamily="JetBrains Mono"
                    fontWeight="700"
                  >
                    {pred.riskScore}% RISK · {pred.leadTimeMinutes}m
                  </text>
                </g>
              );
            })}

            {/* IoT Sensor Nodes on Slopes */}
            {showSensors &&
              region.sensors.map((sensor) => {
                const sx = (sensor.coordinates.x / 100) * 1000;
                const sy = (sensor.coordinates.y / 100) * 680;

                return (
                  <g
                    key={sensor.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSensorNode(sensor);
                    }}
                    className="cursor-pointer"
                  >
                    <rect
                      x={sx - 5}
                      y={sy - 5}
                      width="10"
                      height="10"
                      fill="#0284C7"
                      stroke="#E0F2FE"
                      strokeWidth="1.5"
                      transform={`rotate(45 ${sx} ${sy})`}
                    />
                    <circle cx={sx} cy={sy} r="1.5" fill="#38BDF8" />
                  </g>
                );
              })}
          </svg>

          {/* Sensor Detail on Click */}
          {selectedSensorNode && (
            <div className="absolute top-4 left-4 bg-slate-900/95 border border-slate-700 rounded-lg p-3 text-xs shadow-2xl backdrop-blur-md max-w-xs z-20 animate-in fade-in">
              <div className="flex items-center justify-between mb-1.5">
                <div className="font-bold text-cyan-400 flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{selectedSensorNode.name}</span>
                </div>
                <button
                  onClick={() => setSelectedSensorNode(null)}
                  className="text-slate-400 hover:text-white p-0.5 rounded hover:bg-slate-800 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="space-y-1 text-slate-300 font-mono text-[11px]">
                <div>Type: {selectedSensorNode.type.replace('_', ' ')}</div>
                <div>Battery: {selectedSensorNode.batteryVoltage}V · Signal: {selectedSensorNode.signalDbm}dBm</div>
                <div className="text-emerald-400 font-semibold">Status: {selectedSensorNode.status} ({selectedSensorNode.lastReadingTime})</div>
              </div>
            </div>
          )}

          {/* Coordinate & Elevation HUD overlay */}
          <div className="absolute bottom-3 left-4 bg-[#090D15]/85 border border-slate-800 rounded px-2.5 py-1 text-[11px] font-mono text-slate-400 flex items-center gap-3">
            <span>
              GPS: {mouseCoords.x}°N, {mouseCoords.y}°E
            </span>
            <span>·</span>
            <span>Contour Interval: 400m</span>
            <span>·</span>
            <span className="text-cyan-400">Live Hydrological Routing</span>
          </div>

          {/* Map Legend */}
          <div className="absolute bottom-3 right-4 bg-[#090D15]/90 border border-slate-800 rounded p-2 text-[10px] space-y-1 text-slate-300">
            <div className="font-semibold text-slate-400 uppercase tracking-wider mb-1">Risk Levels</div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Normal (&lt;32%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
              <span>Watch (32–54%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Warning (55–77%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span>Emergency (&ge;78%)</span>
            </div>
          </div>
        </div>

        {/* Selected Ward Detail & Action Drawer */}
        <div className="w-80 border-l border-slate-800 bg-[#0A0E17] p-4 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] uppercase font-mono text-slate-400">
                Selected Area
              </span>
              <span
                className={`text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-full ${
                  activePred.severity === 'EMERGENCY_EVACUATE'
                    ? 'bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse'
                    : activePred.severity === 'WARNING' || activePred.severity === 'WATCH'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}
              >
                {activePred.severity === 'EMERGENCY_EVACUATE'
                  ? '🔴 RED ZONE'
                  : activePred.severity === 'WARNING' || activePred.severity === 'WATCH'
                  ? '🟡 YELLOW ZONE'
                  : '🟢 GREEN ZONE'}
              </span>
            </div>

            <h3 className="text-base font-bold text-white mb-0.5">
              {activeWard.name}
            </h3>
            <p className="text-xs text-slate-400 mb-3">{activeWard.hindiName} · {activeWard.district}</p>

            {/* Risk Gauge Bar */}
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 mb-3">
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-xs text-slate-300 font-medium">Flood Threat Score</span>
                <span className="text-base font-bold font-mono tabular-nums text-white">
                  {activePred.riskScore}
                  <span className="text-xs text-slate-400 font-normal"> / 100</span>
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full transition-all duration-500 ${
                    activePred.riskScore >= 70
                      ? 'bg-red-500'
                      : activePred.riskScore >= 35
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${activePred.riskScore}%` }}
                />
              </div>

              {/* Actionable Lead Time Readout */}
              <div className="flex items-center gap-2 text-xs pt-1 border-t border-slate-800/80">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-slate-300">Time Left to Move:</span>
                <span className="font-mono font-bold text-cyan-300 ml-auto">
                  {Math.floor(activePred.leadTimeMinutes / 60)}h{' '}
                  {activePred.leadTimeMinutes % 60}m
                </span>
              </div>
            </div>

            {/* Geographical & Community Metrics in Plain Language */}
            <div className="space-y-2 text-xs mb-4">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Valley Floor Height</span>
                <span className="font-mono text-slate-200">{activeWard.elevationMeters} meters</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Mountain Slope Incline</span>
                <span className="font-mono text-slate-200">{activeWard.slopeAngleDeg}° (Steep)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Soil Condition</span>
                <span className="text-slate-300 text-right truncate max-w-[150px]" title={activeWard.soilType}>
                  {activeWard.soilType}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Riverside Community</span>
                <span className="font-mono text-slate-200">
                  {activeWard.population.toLocaleString()} people ({activeWard.vulnerableHouseholds} houses)
                </span>
              </div>
            </div>

            {/* Designated Safe Muster Point */}
            {activeWard?.musterPoint && (
              <div className="bg-emerald-950/20 border border-emerald-800/40 rounded-lg p-3 mb-4 text-xs">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold mb-1">
                  <Footprints className="w-3.5 h-3.5" />
                  <span>Safe High-Ground Shelter</span>
                </div>
                <p className="text-slate-100 font-semibold">{activeWard.musterPoint.name}</p>
                <div className="text-[11px] font-mono text-slate-300 mt-1">
                  Elevation: {activeWard.musterPoint.elevationMeters}m (+
                  {activeWard.musterPoint.elevationMeters - activeWard.elevationMeters}m higher than river)
                </div>
                <div className="text-[11px] font-mono text-cyan-400 mt-0.5">
                  Walking Distance: {activeWard.musterPoint.distanceKm} km uphill
                </div>
              </div>
            )}
          </div>

          {/* Action Button */}
          <button
            onClick={() => onOpenEvacuationPlan(activeWard.id)}
            className="w-full py-2.5 px-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Open Evacuation Action Plan</span>
          </button>
        </div>
      </div>
    </div>
  );
};
