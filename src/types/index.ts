export type AlertSeverity = 'NORMAL' | 'WATCH' | 'WARNING' | 'EMERGENCY_EVACUATE';

export interface CatchmentWard {
  id: string;
  name: string;
  hindiName: string;
  district: string;
  elevationMeters: number;
  slopeAngleDeg: number;
  areaKm2: number;
  population: number;
  vulnerableHouseholds: number;
  soilType: string;
  baselineFoS: number; // Factor of Safety
  musterPoint: {
    name: string;
    elevationMeters: number;
    distanceKm: number;
    capacity: number;
  };
  coordinates: { x: number; y: number }; // Relative coordinates for topographic map [0-100]
  lat?: number;
  lng?: number;
}

export interface SensorNode {
  id: string;
  wardId: string;
  name: string;
  type: 'RAIN_GAUGE' | 'SOIL_PIEZOMETER' | 'RIVER_STAGE' | 'SLOPE_EXTENSOMETER';
  status: 'ONLINE' | 'CALIBRATING' | 'BATTERY_LOW' | 'WARNING';
  coordinates: { x: number; y: number };
  lat?: number;
  lng?: number;
  batteryVoltage: number; // e.g. 3.9V
  signalDbm: number; // e.g. -78 dBm
  lastReadingTime: string;
}

export interface MultiSourceTelemetry {
  // Rainfall Data (IMD Radar + AWS)
  rainfallRateMmH: number; // Current intensity
  rainfall3hMm: number;    // Cumulative 3 hours
  rainfall24hMm: number;   // Cumulative 24 hours
  radarReflectivityDbz: number; // Doppler dBZ
  antecedentPrecipitationIndex: number; // API in mm

  // Soil Moisture & Pore Water Pressure (IoT sensors)
  soilMoisture30cmVwc: number; // Volumetric Water Content % (0-100)
  soilMoisture60cmVwc: number;
  soilMoisture100cmVwc: number;
  poreWaterPressureKpa: number; // Matric suction / pore pressure
  soilSaturationPct: number;    // Overall soil saturation %

  // Slope Stability & Geotechnical
  factorOfSafety: number; // < 1.0 failure, 1.0-1.3 critical, > 1.5 stable
  overburdenDepthM: number;
  acousticEmissionCounts: number; // Subsurface fracture noise hits/min

  // Hydrological & River Stage
  riverStageMeters: number; // Gauge height
  riverDangerStageM: number; // Danger mark
  riverVelocityMs: number;  // Surface velocity m/s
  dischargeM3s: number;     // River discharge
}

export interface WardRiskPrediction {
  wardId: string;
  riskScore: number; // 0 - 100
  debrisFlowRiskScore: number; // 0 - 100
  severity: AlertSeverity;
  leadTimeMinutes: number; // Estimated time until hydrograph peak
  confidencePct: number;   // Model prediction confidence
  hydrographPeakDischargeM3s: number;
  timeToPeakMinutes: number;
  riskFactors: {
    rainfallWeight: number; // % contribution to total risk
    soilSaturationWeight: number;
    slopeInstabilityWeight: number;
    historicalVulnerabilityWeight: number;
    riverSurgeWeight: number;
  };
  recommendedAction: string;
}

export interface HillyRegion {
  id: string;
  name: string;
  state: string;
  basin: string;
  description: string;
  riverSystem: string;
  totalAreaKm2: number;
  activeSensorsCount: number;
  center?: { lat: number; lng: number };
  zoom?: number;
  wards: CatchmentWard[];
  sensors: SensorNode[];
  historicalEvents: {
    year: number;
    title: string;
    fatalities: number;
    rainfallMm: number;
    lesson: string;
  }[];
}

export type MLArchitectureType = 
  | 'PINN_HYDRO'       // Physics-Informed Neural Network (Saint-Venant + Green-Ampt)
  | 'ST_GRAPH_NN'      // Spatio-Temporal Graph Neural Network
  | 'HYBRID_XGBOOST'   // Extreme Gradient Boosting with Antecedent Features
  | 'RANDOM_FOREST_GEO';// Multi-Sensor Geotechnical Ensemble

export interface MLModelHyperparameters {
  architecture: MLArchitectureType;
  learningRate: number;
  epochs: number;
  batchSize: number;
  antecedentWindowHours: number;
  radarWeight: number;
  soilMoistureWeight: number;
  slopeAngleWeight: number;
  porePressureWeight: number;
  historicalGsiWeight: number;
}

export interface TrainingMetricPoint {
  epoch: number;
  trainLoss: number;
  valLoss: number;
  accuracy: number;
  valAccuracy: number;
}

export interface ConfusionMatrixData {
  truePositive: number;  // Correctly predicted flash floods
  falsePositive: number; // False alarms
  trueNegative: number;  // Correctly predicted calm state
  falseNegative: number; // Missed floods (critical safety)
}

export interface FeatureImportanceItem {
  feature: string;
  importance: number; // Normalized 0 - 1
  shapImpact: 'High Increase' | 'Moderate Increase' | 'Stabilizing';
}

export interface MLTrainingSummary {
  isTrained: boolean;
  trainedAt: string;
  architecture: MLArchitectureType;
  epochsCompleted: number;
  finalValLoss: number;
  rocAuc: number;
  f1Score: number;
  precision: number;
  recall: number;
  confusionMatrix: ConfusionMatrixData;
  featureImportances: FeatureImportanceItem[];
  history: TrainingMetricPoint[];
}

export interface WhatIfScenarioState {
  isActive: boolean;
  cloudburstIntensityMmH: number; // 0 to 160 mm/hr
  soilPreSaturationPct: number;   // 30% to 100%
  upstreamDebrisBreach: boolean;  // Landslide lake breach trigger
  snowmeltRateMultiplier: number;// 1x to 4x
}
