import React, { useState, useEffect } from 'react';
import {
  MLArchitectureType,
  MLModelHyperparameters,
  MLTrainingSummary,
} from '../types';
import { runSyntheticTraining, BENCHMARK_STORMS } from '../utils/mlEngine';
import {
  Cpu,
  Sliders,
  Play,
  CheckCircle2,
  TrendingDown,
  BarChart3,
  Layers,
  Sparkles,
  Zap,
  Target,
  RefreshCw,
  Award,
} from 'lucide-react';

interface ModelTrainingStudioProps {
  onDeployModel: (summary: MLTrainingSummary, hyperparams: MLModelHyperparameters) => void;
  currentSummary: MLTrainingSummary;
}

export const ModelTrainingStudio: React.FC<ModelTrainingStudioProps> = ({
  onDeployModel,
  currentSummary,
}) => {
  const [hyperparams, setHyperparams] = useState<MLModelHyperparameters>({
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

  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [activeEpochLoss, setActiveEpochLoss] = useState<number | null>(null);
  const [liveSummary, setLiveSummary] = useState<MLTrainingSummary>(currentSummary);
  const [selectedBenchmark, setSelectedBenchmark] = useState(BENCHMARK_STORMS[0]);
  const [deployedFeedback, setDeployedFeedback] = useState(false);

  const architectures: { id: MLArchitectureType; name: string; desc: string }[] = [
    {
      id: 'PINN_HYDRO',
      name: 'Physics-Informed Neural Net (PINN)',
      desc: 'Incorporates Saint-Venant hydraulic wave equations with Green-Ampt soil infiltration physics.',
    },
    {
      id: 'ST_GRAPH_NN',
      name: 'Spatio-Temporal Graph ConvNet',
      desc: 'Models catchment drainage topology as graph nodes with temporal LSTM message passing.',
    },
    {
      id: 'HYBRID_XGBOOST',
      name: 'Extreme Gradient Boosting (XGBoost)',
      desc: 'High-speed boosted decision ensembles trained on antecedent moisture and radar reflectivity.',
    },
    {
      id: 'RANDOM_FOREST_GEO',
      name: 'Geotechnical Random Forest',
      desc: 'Ensemble bagging prioritizing factor of safety and slope threshold discontinuities.',
    },
  ];

  const handleStartTraining = () => {
    setIsTraining(true);
    setTrainingProgress(0);

    const fullSummary = runSyntheticTraining(hyperparams);
    let step = 0;
    const totalSteps = hyperparams.epochs;

    const interval = setInterval(() => {
      step++;
      const pct = Math.round((step / totalSteps) * 100);
      setTrainingProgress(pct);

      if (fullSummary.history[step - 1]) {
        setActiveEpochLoss(fullSummary.history[step - 1].trainLoss);
      }

      if (step >= totalSteps) {
        clearInterval(interval);
        setIsTraining(false);
        setLiveSummary(fullSummary);
      }
    }, 45);
  };

  const handleDeploy = () => {
    onDeployModel(liveSummary, hyperparams);
    setDeployedFeedback(true);
    setTimeout(() => setDeployedFeedback(false), 2800);
  };

  // Helper for loss chart SVG bounds
  const historyPoints = liveSummary.history;
  const maxLoss = Math.max(...historyPoints.map((p) => p.valLoss), 1.0);
  const minLoss = Math.min(...historyPoints.map((p) => p.trainLoss), 0.05);

  const getSvgCoordinates = (epoch: number, loss: number) => {
    const x = ((epoch - 1) / (historyPoints.length - 1 || 1)) * 480 + 30;
    const y = 220 - ((loss - minLoss) / (maxLoss - minLoss || 1)) * 180;
    return { x, y };
  };

  const trainPath = historyPoints
    .map((p, idx) => {
      const { x, y } = getSvgCoordinates(p.epoch, p.trainLoss);
      return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const valPath = historyPoints
    .map((p, idx) => {
      const { x, y } = getSvgCoordinates(p.epoch, p.valLoss);
      return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <div className="space-y-6">
      {/* Studio Header Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 bg-[#0C121D] border border-slate-800 rounded-lg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              AI/ML Hydrological Model Training Studio
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Train, tune hyperparameters, and evaluate spatio-temporal neural networks for hyper-local flash flood prediction in steep mountainous terrains.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleStartTraining}
            disabled={isTraining}
            className={`px-4 py-2 rounded text-xs font-semibold flex items-center gap-2 transition-all ${
              isTraining
                ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-950'
            }`}
          >
            {isTraining ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Training Epochs ({trainingProgress}%)...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Initiate Training Cycle</span>
              </>
            )}
          </button>

          <button
            onClick={handleDeploy}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{deployedFeedback ? 'Model Active on Inferences!' : 'Deploy to Edge Live'}</span>
          </button>
        </div>
      </div>

      {/* Grid: Hyperparameter Configuration vs Live Training Loss & Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Model Selection & Hyperparameters (5 cols) */}
        <div className="lg:col-span-5 bg-[#0D131F] border border-slate-800 rounded-lg p-5 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs uppercase font-mono tracking-wider text-slate-400 flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              Model Architecture & Hyperparameters
            </span>
          </div>

          {/* Architecture Selector */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">
              Select Predictive Architecture
            </label>
            <div className="space-y-2">
              {architectures.map((arch) => (
                <div
                  key={arch.id}
                  onClick={() => setHyperparams({ ...hyperparams, architecture: arch.id })}
                  className={`p-3 rounded border cursor-pointer transition-all ${
                    hyperparams.architecture === arch.id
                      ? 'bg-cyan-950/40 border-cyan-500/80 text-white'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-200">{arch.name}</span>
                    <span className="text-[10px] font-mono text-cyan-400">
                      {hyperparams.architecture === arch.id ? 'ACTIVE' : ''}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{arch.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Training Hyperparameters */}
          <div className="space-y-4 pt-2 border-t border-slate-800/80">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Training Epochs</span>
                <span className="font-mono text-cyan-400">{hyperparams.epochs}</span>
              </div>
              <input
                type="range"
                min="10"
                max="80"
                step="5"
                value={hyperparams.epochs}
                onChange={(e) =>
                  setHyperparams({ ...hyperparams, epochs: parseInt(e.target.value) })
                }
                className="w-full accent-cyan-500 bg-slate-800 h-1.5 rounded"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Learning Rate (AdamW optimizer)</span>
                <span className="font-mono text-cyan-400">{hyperparams.learningRate}</span>
              </div>
              <input
                type="range"
                min="0.001"
                max="0.03"
                step="0.001"
                value={hyperparams.learningRate}
                onChange={(e) =>
                  setHyperparams({ ...hyperparams, learningRate: parseFloat(e.target.value) })
                }
                className="w-full accent-cyan-500 bg-slate-800 h-1.5 rounded"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Antecedent Memory Window</span>
                <span className="font-mono text-cyan-400">
                  {hyperparams.antecedentWindowHours} hours
                </span>
              </div>
              <input
                type="range"
                min="3"
                max="48"
                step="3"
                value={hyperparams.antecedentWindowHours}
                onChange={(e) =>
                  setHyperparams({
                    ...hyperparams,
                    antecedentWindowHours: parseInt(e.target.value),
                  })
                }
                className="w-full accent-cyan-500 bg-slate-800 h-1.5 rounded"
              />
            </div>
          </div>

          {/* Multi-Source Input Feature Weights */}
          <div className="space-y-3 pt-2 border-t border-slate-800/80">
            <span className="text-[11px] uppercase font-mono text-slate-400 block mb-1">
              Physics & Sensor Feature Weights
            </span>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-400">Doppler Radar Reflectivity & AWS Rain</span>
                <span className="font-mono text-slate-200">
                  {Math.round(hyperparams.radarWeight * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.6"
                step="0.05"
                value={hyperparams.radarWeight}
                onChange={(e) =>
                  setHyperparams({ ...hyperparams, radarWeight: parseFloat(e.target.value) })
                }
                className="w-full accent-cyan-500 bg-slate-800 h-1.5 rounded"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-400">IoT Soil Moisture VWC & Matric Suction</span>
                <span className="font-mono text-slate-200">
                  {Math.round(hyperparams.soilMoistureWeight * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.6"
                step="0.05"
                value={hyperparams.soilMoistureWeight}
                onChange={(e) =>
                  setHyperparams({
                    ...hyperparams,
                    soilMoistureWeight: parseFloat(e.target.value),
                  })
                }
                className="w-full accent-cyan-500 bg-slate-800 h-1.5 rounded"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-400">DEM Slope Gradient & Factor of Safety</span>
                <span className="font-mono text-slate-200">
                  {Math.round(hyperparams.slopeAngleWeight * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.5"
                step="0.05"
                value={hyperparams.slopeAngleWeight}
                onChange={(e) =>
                  setHyperparams({
                    ...hyperparams,
                    slopeAngleWeight: parseFloat(e.target.value),
                  })
                }
                className="w-full accent-cyan-500 bg-slate-800 h-1.5 rounded"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Training Curves, Metrics & SHAP (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#0D131F] border border-slate-800 rounded-lg p-3">
              <span className="text-[10px] uppercase font-mono text-slate-400 block mb-0.5">
                ROC-AUC Score
              </span>
              <span className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
                {liveSummary.rocAuc.toFixed(3)}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Discriminative Power</span>
            </div>

            <div className="bg-[#0D131F] border border-slate-800 rounded-lg p-3">
              <span className="text-[10px] uppercase font-mono text-slate-400 block mb-0.5">
                Safety Recall (TPR)
              </span>
              <span className="text-2xl font-bold font-mono text-cyan-400 tabular-nums">
                {(liveSummary.recall * 100).toFixed(1)}%
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Minimal Missed Floods</span>
            </div>

            <div className="bg-[#0D131F] border border-slate-800 rounded-lg p-3">
              <span className="text-[10px] uppercase font-mono text-slate-400 block mb-0.5">
                Precision (PPV)
              </span>
              <span className="text-2xl font-bold font-mono text-slate-200 tabular-nums">
                {(liveSummary.precision * 100).toFixed(1)}%
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Low False Alarm Rate</span>
            </div>

            <div className="bg-[#0D131F] border border-slate-800 rounded-lg p-3">
              <span className="text-[10px] uppercase font-mono text-slate-400 block mb-0.5">
                Final Validation Loss
              </span>
              <span className="text-2xl font-bold font-mono text-amber-400 tabular-nums">
                {liveSummary.finalValLoss.toFixed(4)}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">MSE + Physics Residual</span>
            </div>
          </div>

          {/* Convergence Chart (Train Loss vs Val Loss) */}
          <div className="bg-[#0D131F] border border-slate-800 rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-semibold text-white uppercase tracking-wider">
                  Epoch Loss Convergence Trajectory
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-cyan-400" />
                  <span className="text-slate-400">Train Loss</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-amber-400 border-dashed" />
                  <span className="text-slate-400">Val Loss</span>
                </div>
              </div>
            </div>

            {/* SVG Loss Curve */}
            <div className="relative w-full h-56 bg-[#080C14] rounded border border-slate-800/80 p-2 overflow-hidden">
              <svg viewBox="0 0 540 240" className="w-full h-full">
                {/* Horizontal reference grid lines */}
                <line x1="30" y1="40" x2="520" y2="40" stroke="#1E293B" strokeDasharray="3 3" />
                <line x1="30" y1="100" x2="520" y2="100" stroke="#1E293B" strokeDasharray="3 3" />
                <line x1="30" y1="160" x2="520" y2="160" stroke="#1E293B" strokeDasharray="3 3" />
                <line x1="30" y1="220" x2="520" y2="220" stroke="#334155" />

                {/* Y-axis labels */}
                <text x="25" y="44" fill="#64748B" fontSize="9" textAnchor="end" fontFamily="JetBrains Mono">
                  {maxLoss.toFixed(2)}
                </text>
                <text x="25" y="164" fill="#64748B" fontSize="9" textAnchor="end" fontFamily="JetBrains Mono">
                  {(minLoss + 0.2).toFixed(2)}
                </text>

                {/* Loss Paths */}
                <path d={trainPath} fill="none" stroke="#22D3EE" strokeWidth="2" />
                <path d={valPath} fill="none" stroke="#F59E0B" strokeWidth="2" strokeDasharray="4 4" />

                {/* Live Training indicator point */}
                {isTraining && historyPoints.length > 0 && (
                  <circle
                    cx={getSvgCoordinates(historyPoints.length, liveSummary.finalValLoss).x}
                    cy={getSvgCoordinates(historyPoints.length, liveSummary.finalValLoss).y}
                    r="4"
                    fill="#38BDF8"
                    className="animate-ping"
                  />
                )}
              </svg>
            </div>
          </div>

          {/* Lower Row: Confusion Matrix + SHAP Feature Importance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Confusion Matrix */}
            <div className="bg-[#0D131F] border border-slate-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase font-mono text-slate-300">
                  Validation Confusion Matrix
                </span>
                <span className="text-[10px] font-mono text-slate-500">1,200 Benchmark Storms</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="bg-emerald-950/30 border border-emerald-800/40 p-2.5 rounded">
                  <span className="text-[10px] text-emerald-400 block font-mono">True Positives</span>
                  <span className="text-lg font-bold font-mono text-emerald-300">
                    {liveSummary.confusionMatrix.truePositive}
                  </span>
                  <span className="text-[10px] text-slate-400 block">Timely Evacuations</span>
                </div>
                <div className="bg-amber-950/30 border border-amber-800/40 p-2.5 rounded">
                  <span className="text-[10px] text-amber-400 block font-mono">False Positives</span>
                  <span className="text-lg font-bold font-mono text-amber-300">
                    {liveSummary.confusionMatrix.falsePositive}
                  </span>
                  <span className="text-[10px] text-slate-400 block">False Alarms</span>
                </div>
                <div className="bg-rose-950/30 border border-rose-800/40 p-2.5 rounded">
                  <span className="text-[10px] text-rose-400 block font-mono">False Negatives</span>
                  <span className="text-lg font-bold font-mono text-rose-300">
                    {liveSummary.confusionMatrix.falseNegative}
                  </span>
                  <span className="text-[10px] text-slate-400 block">Missed Surges (Target: &lt;2%)</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-2.5 rounded">
                  <span className="text-[10px] text-slate-400 block font-mono">True Negatives</span>
                  <span className="text-lg font-bold font-mono text-slate-200">
                    {liveSummary.confusionMatrix.trueNegative}
                  </span>
                  <span className="text-[10px] text-slate-400 block">Calm Periods</span>
                </div>
              </div>
            </div>

            {/* SHAP Feature Importance */}
            <div className="bg-[#0D131F] border border-slate-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase font-mono text-slate-300">
                  SHAP Feature Attribution
                </span>
                <span className="text-[10px] font-mono text-slate-500">Explainable AI</span>
              </div>

              <div className="space-y-2.5">
                {liveSummary.featureImportances.map((item, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-300 truncate max-w-[180px]">{item.feature}</span>
                      <span className="font-mono text-cyan-400">
                        {Math.round(item.importance * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-cyan-500 h-full rounded-full transition-all"
                        style={{ width: `${item.importance * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Benchmark Testing Card */}
          <div className="bg-[#0D131F] border border-slate-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-semibold text-white uppercase tracking-wider">
                  Evaluate on Historical Storm Disasters
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {BENCHMARK_STORMS.map((storm) => (
                <div
                  key={storm.id}
                  onClick={() => setSelectedBenchmark(storm)}
                  className={`p-3 rounded border cursor-pointer transition-all ${
                    selectedBenchmark.id === storm.id
                      ? 'bg-cyan-950/40 border-cyan-500/80 text-white'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="text-xs font-bold text-slate-200 block mb-0.5">{storm.name}</span>
                  <span className="text-[10px] text-slate-400 block mb-2">{storm.location}</span>
                  <div className="space-y-1 text-[11px] font-mono">
                    <div className="text-slate-300">Rain: {storm.rainMm2h}mm / 2h</div>
                    <div className="text-emerald-400 font-semibold">{storm.pinnAccuracy}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
