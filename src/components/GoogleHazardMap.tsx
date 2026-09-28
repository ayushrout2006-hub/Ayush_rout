import React, { useState, useEffect, useCallback } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
  useMap,
} from '@vis.gl/react-google-maps';
import {
  MapPin,
  Shield,
  Radio,
  Layers,
  CloudRain,
  AlertTriangle,
  Compass,
  CheckCircle2,
  ExternalLink,
  Info,
} from 'lucide-react';
import {
  HillyRegion,
  CatchmentWard,
  WardRiskPrediction,
  SensorNode,
} from '../types';
import { useLanguage } from '../context/LanguageContext';

interface GoogleHazardMapProps {
  region: HillyRegion;
  predictions: Record<string, WardRiskPrediction>;
  selectedWardId: string | null;
  onSelectWard: (wardId: string) => void;
  onOpenEvacuationPlan: (wardId: string) => void;
  currentRainfallMmH: number;
}

// Helper child component to smoothly pan/zoom map on region or ward change
function MapCameraHandler({
  center,
  zoom,
  selectedWard,
}: {
  center: { lat: number; lng: number };
  zoom: number;
  selectedWard?: CatchmentWard | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    if (selectedWard && selectedWard.lat && selectedWard.lng) {
      map.panTo({ lat: selectedWard.lat, lng: selectedWard.lng });
      map.setZoom(13);
    } else if (center && center.lat && center.lng) {
      map.panTo({ lat: center.lat, lng: center.lng });
      map.setZoom(zoom || 11);
    }
  }, [map, center, zoom, selectedWard]);

  return null;
}

export const GoogleHazardMap: React.FC<GoogleHazardMapProps> = ({
  region,
  predictions,
  selectedWardId,
  onSelectWard,
  onOpenEvacuationPlan,
  currentRainfallMmH,
}) => {
  const { t } = useLanguage();
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  // Active filter
  const [filter, setFilter] = useState<'all' | 'danger_only' | 'shelters' | 'sensors'>('all');
  const [mapTypeId, setMapTypeId] = useState<'terrain' | 'hybrid' | 'satellite' | 'roadmap'>('terrain');

  // InfoWindow State
  const [selectedItem, setSelectedItem] = useState<{
    type: 'ward' | 'shelter' | 'sensor';
    data: CatchmentWard | SensorNode;
    prediction?: WardRiskPrediction;
  } | null>(null);

  const selectedWard = region.wards.find((w) => w.id === selectedWardId) || null;
  const defaultCenter = region.center || { lat: 30.5564, lng: 79.5670 };
  const defaultZoom = region.zoom || 11;

  // Keep prediction fresh in open card without automatically opening if user closed it
  useEffect(() => {
    setSelectedItem((prev) => {
      if (prev && prev.type === 'ward') {
        const updatedPred = predictions[(prev.data as CatchmentWard).id];
        if (updatedPred) {
          return { ...prev, prediction: updatedPred };
        }
      }
      return prev;
    });
  }, [predictions]);

  const handleMarkerClick = useCallback(
    (ward: CatchmentWard) => {
      onSelectWard(ward.id);
      setSelectedItem({
        type: 'ward',
        data: ward,
        prediction: predictions[ward.id],
      });
    },
    [onSelectWard, predictions]
  );

  const handleShelterClick = useCallback((ward: CatchmentWard) => {
    setSelectedItem({
      type: 'shelter',
      data: ward,
      prediction: predictions[ward.id],
    });
  }, [predictions]);

  const handleSensorClick = useCallback((sensor: SensorNode) => {
    setSelectedItem({
      type: 'sensor',
      data: sensor,
    });
  }, []);

  return (
    <div className="bg-[#0D131F] border border-slate-800 rounded-xl overflow-hidden shadow-lg flex flex-col">
      {/* Top Map Control Bar */}
      <div className="p-3.5 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Map Title & Status */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Compass className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-wide">
                {t.mapTitle}
              </h2>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Official Satellite GIS
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {region.name} · {t.mapSubtitle}
            </p>
          </div>
        </div>

        {/* Center: Zone & Marker Filters */}
        <div className="flex items-center gap-1.5 bg-[#0B0F17] p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-2.5 py-1 rounded transition-colors font-medium ${
              filter === 'all'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t.allAreas} ({region.wards.length})
          </button>
          <button
            onClick={() => setFilter('danger_only')}
            className={`px-2.5 py-1 rounded transition-colors font-medium flex items-center gap-1.5 ${
              filter === 'danger_only'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-red-400 hover:text-red-300'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            {t.redDangerZones}
          </button>
          <button
            onClick={() => setFilter('shelters')}
            className={`px-2.5 py-1 rounded transition-colors font-medium flex items-center gap-1 ${
              filter === 'shelters'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-emerald-400 hover:text-emerald-300'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            {t.safeShelters}
          </button>
          <button
            onClick={() => setFilter('sensors')}
            className={`px-2.5 py-1 rounded transition-colors font-medium flex items-center gap-1 ${
              filter === 'sensors'
                ? 'bg-slate-700 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            {t.sensors} ({region.sensors.length})
          </button>
        </div>

        {/* Right: Map Type Toggle */}
        <div className="flex items-center gap-1 bg-[#0B0F17] p-1 rounded-lg border border-slate-800 text-xs font-mono">
          <Layers className="w-3.5 h-3.5 text-slate-400 ml-1" />
          {(['terrain', 'hybrid', 'roadmap'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setMapTypeId(type)}
              className={`px-2 py-0.5 rounded capitalize ${
                mapTypeId === type
                  ? 'bg-slate-700 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Map Container - Explicit Height Guarantee */}
      <div className="relative w-full h-[520px] min-h-[480px] bg-slate-950">
        <APIProvider apiKey={apiKey} libraries={['places', 'marker', 'geometry']}>
          <Map
            mapId="DEMO_MAP_ID"
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            defaultCenter={defaultCenter}
            defaultZoom={defaultZoom}
            mapTypeId={mapTypeId}
            gestureHandling="greedy"
            disableDefaultUI={false}
            fullscreenControl={true}
            zoomControl={true}
            style={{ width: '100%', height: '100%' }}
          >
            <MapCameraHandler
              center={defaultCenter}
              zoom={defaultZoom}
              selectedWard={selectedWard}
            />

            {/* Render Ward Risk Pins */}
            {region.wards
              .filter((ward) => {
                if (filter === 'shelters') return false;
                if (filter === 'sensors') return false;
                if (filter === 'danger_only') {
                  const pred = predictions[ward.id];
                  return pred?.severity === 'EMERGENCY_EVACUATE' || (pred?.riskScore || 0) >= 60;
                }
                return true;
              })
              .map((ward) => {
                if (!ward.lat || !ward.lng) return null;
                const pred = predictions[ward.id];
                const isSelected = selectedWardId === ward.id;
                const score = pred?.riskScore || 0;
                const isDanger = pred?.severity === 'EMERGENCY_EVACUATE' || score >= 70;
                const isWarning = pred?.severity === 'WARNING' || (score >= 35 && score < 70);

                const bgClass = isDanger
                  ? 'bg-red-600 text-white ring-4 ring-red-500/40 shadow-red-500/50'
                  : isWarning
                  ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-400/40 shadow-amber-500/50'
                  : 'bg-emerald-500 text-slate-950 ring-2 ring-emerald-400/30';

                return (
                  <AdvancedMarker
                    key={ward.id}
                    position={{ lat: ward.lat, lng: ward.lng }}
                    onClick={() => handleMarkerClick(ward)}
                  >
                    <div
                      className={`relative flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold cursor-pointer transition-all transform hover:scale-110 shadow-lg ${bgClass} ${
                        isSelected ? 'scale-115 ring-white' : ''
                      }`}
                    >
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span>{ward.name.split(' ')[0]}</span>
                      <span className="font-mono text-[11px] bg-black/20 px-1 rounded">
                        {score}%
                      </span>
                      {isDanger && (
                        <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                        </span>
                      )}
                    </div>
                  </AdvancedMarker>
                );
              })}

            {/* Render Safe Muster Point Shelters */}
            {(filter === 'all' || filter === 'shelters') &&
              region.wards.map((ward) => {
                if (!ward.lat || !ward.lng || !ward.musterPoint) return null;
                // Offset shelter pin slightly to avoid overlapping exactly on ward pin
                const shelterLat = ward.lat + 0.007;
                const shelterLng = ward.lng + 0.005;

                return (
                  <AdvancedMarker
                    key={`shelter-${ward.id}`}
                    position={{ lat: shelterLat, lng: shelterLng }}
                    onClick={() => handleShelterClick(ward)}
                  >
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-700 text-white border border-emerald-400/50 shadow-md hover:scale-110 cursor-pointer">
                      <Shield className="w-3 h-3 text-emerald-200" />
                      <span>{ward.musterPoint.name.split(' ')[0]} Shelter</span>
                    </div>
                  </AdvancedMarker>
                );
              })}

            {/* Render Sensor Stations */}
            {(filter === 'all' || filter === 'sensors') &&
              region.sensors.map((sensor) => {
                if (!sensor.lat || !sensor.lng) return null;
                return (
                  <AdvancedMarker
                    key={sensor.id}
                    position={{ lat: sensor.lat, lng: sensor.lng }}
                    onClick={() => handleSensorClick(sensor)}
                  >
                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-slate-900 text-cyan-300 border border-cyan-500/50 shadow hover:scale-110 cursor-pointer">
                      <Radio className="w-2.5 h-2.5 animate-pulse text-cyan-400" />
                      <span>{sensor.type === 'RAIN_GAUGE' ? 'AWS Rain' : sensor.type === 'RIVER_STAGE' ? 'River' : 'Soil'}</span>
                    </div>
                  </AdvancedMarker>
                );
              })}

            {/* Interactive Info Window */}
            {selectedItem && (
              <InfoWindow
                position={
                  selectedItem.type === 'shelter'
                    ? {
                        lat: (selectedItem.data as CatchmentWard).lat! + 0.007,
                        lng: (selectedItem.data as CatchmentWard).lng! + 0.005,
                      }
                    : {
                        lat: selectedItem.data.lat!,
                        lng: selectedItem.data.lng!,
                      }
                }
                onCloseClick={() => setSelectedItem(null)}
              >
                <div className="p-2 max-w-xs text-slate-900 font-sans">
                  {selectedItem.type === 'ward' && (
                    <div>
                      {/* Header */}
                      <div className="flex items-center justify-between border-b pb-1.5 mb-2 border-slate-200">
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 leading-tight">
                            {(selectedItem.data as CatchmentWard).name}
                          </h4>
                          <span className="text-xs text-slate-500">
                            {(selectedItem.data as CatchmentWard).hindiName} · {(selectedItem.data as CatchmentWard).district}
                          </span>
                        </div>
                        {selectedItem.prediction && (
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              selectedItem.prediction.severity === 'EMERGENCY_EVACUATE'
                                ? 'bg-red-100 text-red-700'
                                : selectedItem.prediction.severity === 'WARNING'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {selectedItem.prediction.severity === 'EMERGENCY_EVACUATE'
                              ? t.redZone
                              : selectedItem.prediction.severity === 'WARNING'
                              ? t.yellowZone
                              : t.greenZone}
                          </span>
                        )}
                      </div>

                      {/* Key metrics */}
                      <div className="grid grid-cols-2 gap-2 text-xs mb-2 bg-slate-50 p-2 rounded">
                        <div>
                          <span className="text-slate-500 block text-[10px]">{t.floodThreat}</span>
                          <span className="font-bold text-slate-900">
                            {selectedItem.prediction?.riskScore || 0}%
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">{t.timeLeftToEvacuate}</span>
                          <span className="font-bold text-cyan-700">
                            {Math.floor((selectedItem.prediction?.leadTimeMinutes || 120) / 60)}h{' '}
                            {(selectedItem.prediction?.leadTimeMinutes || 120) % 60}m
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">{t.population}</span>
                          <span className="font-semibold text-slate-800">
                            {(selectedItem.data as CatchmentWard).population.toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">{t.atRiskHomes}</span>
                          <span className="font-semibold text-red-600">
                            {(selectedItem.data as CatchmentWard).vulnerableHouseholds}
                          </span>
                        </div>
                      </div>

                      {/* Shelter link */}
                      {(selectedItem.data as CatchmentWard).musterPoint && (
                        <div className="bg-emerald-50 border border-emerald-200 rounded p-1.5 text-[11px] text-emerald-900 mb-2">
                          <span className="font-semibold block">
                            🛡️ {t.safeMusterPoint}: {(selectedItem.data as CatchmentWard).musterPoint.name}
                          </span>
                          <span className="text-emerald-700 text-[10px]">
                            {(selectedItem.data as CatchmentWard).musterPoint.elevationMeters}m (
                            {(selectedItem.data as CatchmentWard).musterPoint.distanceKm} km)
                          </span>
                        </div>
                      )}

                      {/* CTA Button */}
                      <button
                        onClick={() => {
                          onOpenEvacuationPlan((selectedItem.data as CatchmentWard).id);
                          setSelectedItem(null);
                        }}
                        className="w-full py-1.5 px-3 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                      >
                        <span>{t.viewEvacuationPlan}</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {selectedItem.type === 'shelter' && (
                    <div>
                      <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-sm mb-1">
                        <Shield className="w-4 h-4 text-emerald-600" />
                        <span>Safe High Ground Shelter</span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 mb-1">
                        {(selectedItem.data as CatchmentWard).musterPoint.name}
                      </h4>
                      <p className="text-xs text-slate-600 mb-2">
                        Serving {(selectedItem.data as CatchmentWard).name}. Above flash flood high-water line.
                      </p>
                      <div className="text-xs bg-emerald-50 p-2 rounded space-y-1 mb-2">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Elevation:</span>
                          <span className="font-bold text-slate-800">
                            {(selectedItem.data as CatchmentWard).musterPoint.elevationMeters} meters
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Shelter Capacity:</span>
                          <span className="font-bold text-emerald-700">
                            {(selectedItem.data as CatchmentWard).musterPoint.capacity.toLocaleString()} persons
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Walking Distance:</span>
                          <span className="font-semibold text-slate-800">
                            {(selectedItem.data as CatchmentWard).musterPoint.distanceKm} km
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          onOpenEvacuationPlan((selectedItem.data as CatchmentWard).id);
                          setSelectedItem(null);
                        }}
                        className="w-full py-1 px-2 bg-emerald-600 text-white rounded text-xs font-semibold hover:bg-emerald-700"
                      >
                        Show Route & Radio Channel
                      </button>
                    </div>
                  )}

                  {selectedItem.type === 'sensor' && (
                    <div>
                      <div className="flex items-center gap-1.5 text-cyan-800 font-bold text-sm mb-1">
                        <Radio className="w-4 h-4 text-cyan-600" />
                        <span>IoT Hydrological Sensor</span>
                      </div>
                      <h4 className="font-bold text-xs text-slate-900 mb-1">
                        {(selectedItem.data as SensorNode).name}
                      </h4>
                      <div className="text-[11px] bg-slate-50 p-2 rounded space-y-1">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Station Status:</span>
                          <span className="font-bold text-emerald-600">
                            {(selectedItem.data as SensorNode).status}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Battery:</span>
                          <span className="font-semibold text-slate-800">
                            {(selectedItem.data as SensorNode).batteryVoltage} V
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Last Telemetry:</span>
                          <span className="text-slate-600">
                            {(selectedItem.data as SensorNode).lastReadingTime}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </InfoWindow>
            )}
          </Map>
        </APIProvider>

        {/* Live Weather Overlay Card in Map Top-Right */}
        <div className="absolute top-3 right-3 z-10 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-lg p-2.5 text-white shadow-xl pointer-events-auto">
          <div className="flex items-center gap-2 mb-1">
            <CloudRain className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-semibold font-mono">{t.currentRain}</span>
          </div>
          <div className="text-lg font-bold font-mono text-cyan-300">
            {currentRainfallMmH.toFixed(1)} <span className="text-xs font-normal text-slate-400">mm/h</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            {currentRainfallMmH > 40
              ? `🔴 ${t.cloudburstTorrent}`
              : currentRainfallMmH > 15
              ? `🟡 ${t.heavyDownpour}`
              : `🟢 ${t.lightRain}`}
          </span>
        </div>

        {/* Map Legend Overlay in Bottom-Left */}
        <div className="absolute bottom-4 left-4 z-10 bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 shadow-xl flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
            <span className="text-[11px]">{t.safeArea}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
            <span className="text-[11px]">{t.watchZone}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-600 inline-block animate-pulse" />
            <span className="text-[11px] font-semibold text-red-300">{t.evacuateNow}</span>
          </div>
          <div className="flex items-center gap-1.5 border-l border-slate-700 pl-3">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px]">{t.safeShelters}</span>
          </div>
        </div>
      </div>

      {/* Footer Info Strip */}
      <div className="px-4 py-2.5 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>
            {t.liveMarkerTip}
          </span>
        </div>
        <div className="text-[11px] font-mono text-slate-500 hidden sm:block">
          Google Maps Platform · Topographic & Satellite GIS
        </div>
      </div>
    </div>
  );
};
