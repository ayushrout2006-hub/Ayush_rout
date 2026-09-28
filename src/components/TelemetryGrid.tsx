import React from 'react';
import { MultiSourceTelemetry, SensorNode } from '../types';
import {
  CloudRain,
  Droplet,
  Mountain,
  Waves,
  Radio,
  Wifi,
  Battery,
  AlertTriangle,
  Activity,
  Sliders,
} from 'lucide-react';

interface TelemetryGridProps {
  telemetry: MultiSourceTelemetry;
  sensors: SensorNode[];
  onUpdateTelemetry: (updated: Partial<MultiSourceTelemetry>) => void;
  isLiveStreaming: boolean;
}

export const TelemetryGrid: React.FC<TelemetryGridProps> = ({
  telemetry,
  sensors,
  onUpdateTelemetry,
  isLiveStreaming,
}) => {
  return (
    <div className="space-y-6">
      {/* Telemetry Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-[#0C121D] border border-slate-800 rounded-lg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Radio className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Multi-Source Sensor Telemetry Grid
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Real-time wireless IoT telemetry ingested from AWS rain stations, down-hole piezometers, slope extensometers, and ultrasonic river radars.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-300">
            {sensors.filter((s) => s.status === 'ONLINE').length} / {sensors.length} Nodes Online
          </span>
          <span className="text-slate-500">·</span>
          <span className="text-cyan-400">99.4% LoRaWAN Packet Delivery</span>
        </div>
      </div>

      {/* 4 Quadrants: Multi-Source Data Channels */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Quadrant 1: Rainfall & Radar Reflectivity */}
        <div className="bg-[#0D131F] border border-slate-800 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 uppercase tracking-wider">
              <CloudRain className="w-4 h-4 text-cyan-400" />
              <span>IMD Radar & AWS Rain</span>
            </div>
            <span className="text-[10px] font-mono text-cyan-400">CH-01</span>
          </div>

          <div>
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-xs text-slate-400">Precipitation Rate</span>
              <span className="text-xl font-bold font-mono text-cyan-300 tabular-nums">
                {telemetry.rainfallRateMmH.toFixed(1)}{' '}
                <span className="text-xs text-slate-400 font-normal">mm/h</span>
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="140"
              step="1"
              value={telemetry.rainfallRateMmH}
              onChange={(e) =>
                onUpdateTelemetry({ rainfallRateMmH: parseFloat(e.target.value) })
              }
              className="w-full accent-cyan-500 bg-slate-800 h-1.5 rounded"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>0 (Drizzle)</span>
              <span>65 (Heavy)</span>
              <span>100+ (Cloudburst)</span>
            </div>
          </div>

          <div className="space-y-2 text-xs pt-2 border-t border-slate-800/80">
            <div className="flex justify-between">
              <span className="text-slate-400">3-Hour Cumulative</span>
              <span className="font-mono text-slate-200 tabular-nums">
                {telemetry.rainfall3hMm.toFixed(1)} mm
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">24-Hour Antecedent Rain</span>
              <span className="font-mono text-slate-200 tabular-nums">
                {telemetry.rainfall24hMm.toFixed(1)} mm
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Doppler Reflectivity</span>
              <span className="font-mono text-amber-400 tabular-nums">
                {telemetry.radarReflectivityDbz} dBZ
              </span>
            </div>
          </div>
        </div>

        {/* Quadrant 2: IoT Soil Moisture & Saturation */}
        <div className="bg-[#0D131F] border border-slate-800 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 uppercase tracking-wider">
              <Droplet className="w-4 h-4 text-cyan-400" />
              <span>Soil Moisture & Piezometer</span>
            </div>
            <span className="text-[10px] font-mono text-cyan-400">CH-02</span>
          </div>

          <div>
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-xs text-slate-400">Catchment Saturation</span>
              <span className="text-xl font-bold font-mono text-cyan-300 tabular-nums">
                {telemetry.soilSaturationPct.toFixed(0)}%
              </span>
            </div>
            <input
              type="range"
              min="20"
              max="100"
              step="1"
              value={telemetry.soilSaturationPct}
              onChange={(e) =>
                onUpdateTelemetry({ soilSaturationPct: parseFloat(e.target.value) })
              }
              className="w-full accent-cyan-500 bg-slate-800 h-1.5 rounded"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>Dry (&lt;40%)</span>
              <span>Field Cap (70%)</span>
              <span>Liquefaction (90%+)</span>
            </div>
          </div>

          <div className="space-y-2 text-xs pt-2 border-t border-slate-800/80">
            <div className="flex justify-between">
              <span className="text-slate-400">VWC at 30cm Depth</span>
              <span className="font-mono text-slate-200 tabular-nums">
                {telemetry.soilMoisture30cmVwc.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">VWC at 60cm Depth</span>
              <span className="font-mono text-slate-200 tabular-nums">
                {telemetry.soilMoisture60cmVwc.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Pore-Water Suction</span>
              <span className="font-mono text-amber-400 tabular-nums">
                {telemetry.poreWaterPressureKpa.toFixed(1)} kPa
              </span>
            </div>
          </div>
        </div>

        {/* Quadrant 3: Geotechnical Slope Stability */}
        <div className="bg-[#0D131F] border border-slate-800 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 uppercase tracking-wider">
              <Mountain className="w-4 h-4 text-cyan-400" />
              <span>Slope Stability & InSAR</span>
            </div>
            <span className="text-[10px] font-mono text-cyan-400">CH-03</span>
          </div>

          <div>
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-xs text-slate-400">Factor of Safety (FoS)</span>
              <span
                className={`text-xl font-bold font-mono tabular-nums ${
                  telemetry.factorOfSafety < 1.05
                    ? 'text-red-400'
                    : telemetry.factorOfSafety < 1.25
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {telemetry.factorOfSafety.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0.85"
              max="1.8"
              step="0.02"
              value={telemetry.factorOfSafety}
              onChange={(e) =>
                onUpdateTelemetry({ factorOfSafety: parseFloat(e.target.value) })
              }
              className="w-full accent-cyan-500 bg-slate-800 h-1.5 rounded"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>Failure (&lt;1.0)</span>
              <span>Critical (1.1-1.3)</span>
              <span>Stable (&gt;1.5)</span>
            </div>
          </div>

          <div className="space-y-2 text-xs pt-2 border-t border-slate-800/80">
            <div className="flex justify-between">
              <span className="text-slate-400">Acoustic Rock Noise</span>
              <span className="font-mono text-slate-200 tabular-nums">
                {telemetry.acousticEmissionCounts} hits/min
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Overburden Depth</span>
              <span className="font-mono text-slate-200 tabular-nums">
                {telemetry.overburdenDepthM} m
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Colluvial Cohesion</span>
              <span className="font-mono text-slate-200 tabular-nums">14.2 kPa</span>
            </div>
          </div>
        </div>

        {/* Quadrant 4: Hydrological River Stage */}
        <div className="bg-[#0D131F] border border-slate-800 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 uppercase tracking-wider">
              <Waves className="w-4 h-4 text-cyan-400" />
              <span>River Stage & Discharge</span>
            </div>
            <span className="text-[10px] font-mono text-cyan-400">CH-04</span>
          </div>

          <div>
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-xs text-slate-400">River Stage Height</span>
              <span
                className={`text-xl font-bold font-mono tabular-nums ${
                  telemetry.riverStageMeters >= telemetry.riverDangerStageM
                    ? 'text-red-400'
                    : 'text-cyan-300'
                }`}
              >
                {telemetry.riverStageMeters.toFixed(2)}{' '}
                <span className="text-xs text-slate-400 font-normal">m</span>
              </span>
            </div>
            <input
              type="range"
              min="1.0"
              max="9.0"
              step="0.1"
              value={telemetry.riverStageMeters}
              onChange={(e) =>
                onUpdateTelemetry({ riverStageMeters: parseFloat(e.target.value) })
              }
              className="w-full accent-cyan-500 bg-slate-800 h-1.5 rounded"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>Base (1.5m)</span>
              <span>Warning (4.5m)</span>
              <span className="text-red-400">Danger ({telemetry.riverDangerStageM}m)</span>
            </div>
          </div>

          <div className="space-y-2 text-xs pt-2 border-t border-slate-800/80">
            <div className="flex justify-between">
              <span className="text-slate-400">Current Discharge</span>
              <span className="font-mono text-slate-200 tabular-nums">
                {telemetry.dischargeM3s.toFixed(0)} m³/s
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Flow Surface Velocity</span>
              <span className="font-mono text-slate-200 tabular-nums">
                {telemetry.riverVelocityMs.toFixed(1)} m/s
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Danger Level Clearance</span>
              <span
                className={`font-mono tabular-nums ${
                  telemetry.riverDangerStageM - telemetry.riverStageMeters < 0.5
                    ? 'text-red-400 font-bold'
                    : 'text-emerald-400'
                }`}
              >
                {(telemetry.riverDangerStageM - telemetry.riverStageMeters).toFixed(2)} m
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* IoT Hardware Health & LoRaWAN Node Status Table */}
      <div className="bg-[#0D131F] border border-slate-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs uppercase font-mono text-slate-300">
            Active Mountain Sensor Stations & Diagnostic Telemetry
          </span>
          <span className="text-[10px] font-mono text-slate-500">
            Solar / Supercapacitor Powered Nodes
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                <th className="py-2 px-3">Node ID</th>
                <th className="py-2 px-3">Station Name</th>
                <th className="py-2 px-3">Type</th>
                <th className="py-2 px-3">Status</th>
                <th className="py-2 px-3">Battery</th>
                <th className="py-2 px-3">Signal (RSSI)</th>
                <th className="py-2 px-3">Last Packet</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {sensors.map((node) => (
                <tr key={node.id} className="hover:bg-slate-900/40 text-slate-300">
                  <td className="py-2 px-3 text-cyan-400 font-semibold">{node.id}</td>
                  <td className="py-2 px-3 text-white font-sans">{node.name}</td>
                  <td className="py-2 px-3 text-slate-400">{node.type.replace('_', ' ')}</td>
                  <td className="py-2 px-3">
                    <span className="inline-flex items-center gap-1.5 text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      {node.status}
                    </span>
                  </td>
                  <td className="py-2 px-3 tabular-nums">
                    <span className="flex items-center gap-1">
                      <Battery className="w-3.5 h-3.5 text-slate-400" />
                      {node.batteryVoltage} V
                    </span>
                  </td>
                  <td className="py-2 px-3 tabular-nums">
                    <span className="flex items-center gap-1">
                      <Wifi className="w-3.5 h-3.5 text-slate-400" />
                      {node.signalDbm} dBm
                    </span>
                  </td>
                  <td className="py-2 px-3 text-slate-500">{node.lastReadingTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
