import React, { useState } from 'react';
import { CatchmentWard, WardRiskPrediction, AlertSeverity } from '../types';
import {
  ShieldAlert,
  Footprints,
  Clock,
  Radio,
  Users,
  Printer,
  Download,
  AlertTriangle,
  Compass,
  CheckCircle,
  Copy,
} from 'lucide-react';

interface EvacuationModalProps {
  ward: CatchmentWard | null;
  prediction: WardRiskPrediction | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EvacuationModal: React.FC<EvacuationModalProps> = ({
  ward,
  prediction,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [langTab, setLangTab] = useState<'hindi' | 'english'>('hindi');

  if (!isOpen || !ward || !prediction) return null;

  const leadTimeHours = Math.floor(prediction.leadTimeMinutes / 60);
  const leadTimeMins = prediction.leadTimeMinutes % 60;

  const englishAlertText = `[CRITICAL FLASH FLOOD EVACUATION NOTICE - DDMA / NDMA]
Target Ward: ${ward.name} (${ward.district}, State)
Alert Level: ${prediction.severity.replace('_', ' ')}
Estimated Flood Peak Lead Time: ${leadTimeHours}h ${leadTimeMins}m
Action Required: IMMEDIATE EVACUATION of low-lying riverside households to designated high ground at ${ward.musterPoint.name} (Elevation: ${ward.musterPoint.elevationMeters}m).
Safety Instructions:
1. Avoid all valley culverts and wooden footbridges.
2. Follow green emergency ridge trails (Distance: ${ward.musterPoint.distanceKm} km).
3. Contact Ward Emergency Officer on LoRa Channel 4 / VHF 145.200 MHz.`;

  const hindiAlertText = `[राष्ट्रीय आपदा प्रबंधन प्राधिकरण (NDMA) - आपातकालीन बाढ़ चेतावनी]
प्रभावित क्षेत्र: ${ward.name} (${ward.hindiName}, ${ward.district})
चेतावनी स्तर: ${prediction.severity === 'EMERGENCY_EVACUATE' ? 'अति गंभीर (तत्काल निकासी)' : 'उच्च चेतावनी'}
बाढ़ आगमन का समय (लीड टाइम): ${leadTimeHours} घंटा ${leadTimeMins} मिनट
आवश्यक निर्देश: नदी किनारे के सभी ${ward.vulnerableHouseholds} कमजोर परिवारों को तुरंत सुरक्षित ऊंचाई वाले स्थल ${ward.musterPoint.name} (ऊंचाई: ${ward.musterPoint.elevationMeters} मी) की ओर स्थानांतरित किया जाए।
सुरक्षा नियम:
१. नदी के सभी पुलों और रपटों से दूर रहें।
२. निर्धारित सुरक्षित पहाड़ी पगडंडी मार्ग (${ward.musterPoint.distanceKm} किमी) का उपयोग करें।
३. वार्ड आपदा राहत दल से संपर्क करें।`;

  const handleCopyAlert = () => {
    navigator.clipboard.writeText(langTab === 'hindi' ? hindiAlertText : englishAlertText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0D131F] border border-cyan-500/40 rounded-xl w-full max-w-3xl overflow-hidden shadow-2xl animate-in fade-in duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-[#090D15] border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Ward Evacuation & Disaster Response Action Plan
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                {ward.name} · {ward.hindiName} · {ward.district}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-sm font-mono px-2 py-1"
          >
            ✕ Close
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Status & Lead Time Highlight */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 rounded bg-slate-900 border border-slate-800">
              <span className="text-[10px] uppercase font-mono text-slate-400 block mb-0.5">
                Current Severity Level
              </span>
              <span
                className={`text-base font-bold font-mono ${
                  prediction.severity === 'EMERGENCY_EVACUATE'
                    ? 'text-red-400'
                    : prediction.severity === 'WARNING'
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {prediction.severity.replace('_', ' ')}
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                Risk Score: {prediction.riskScore} / 100
              </span>
            </div>

            <div className="p-3 rounded bg-slate-900 border border-slate-800">
              <span className="text-[10px] uppercase font-mono text-slate-400 block mb-0.5">
                Actionable Lead Time
              </span>
              <span className="text-xl font-bold font-mono text-cyan-300 tabular-nums">
                {leadTimeHours}h {leadTimeMins}m
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                Before flood crest arrival
              </span>
            </div>

            <div className="p-3 rounded bg-slate-900 border border-slate-800">
              <span className="text-[10px] uppercase font-mono text-slate-400 block mb-0.5">
                Vulnerable Population
              </span>
              <span className="text-xl font-bold font-mono text-white tabular-nums">
                {ward.population.toLocaleString()}
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                {ward.vulnerableHouseholds} low-lying riverside homes
              </span>
            </div>
          </div>

          {/* Primary High-Ground Shelter Specifications */}
          <div className="bg-emerald-950/20 border border-emerald-800/40 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase font-mono">
                <Footprints className="w-4 h-4" />
                <span>Designated High-Ground Muster Shelter</span>
              </div>
              <span className="text-xs font-mono text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
                Safe Elevation Clearance: +{ward.musterPoint.elevationMeters - ward.elevationMeters}m
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block">Shelter Location:</span>
                <span className="text-sm font-semibold text-white">{ward.musterPoint.name}</span>
                <p className="text-slate-400 text-[11px] mt-1">
                  Located on stable granite/gneiss bedrock terrace with zero historical landslide scar.
                </p>
              </div>

              <div className="space-y-1 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">Shelter Altitude:</span>
                  <span className="text-slate-200">{ward.musterPoint.elevationMeters} meters</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Evacuation Trail Distance:</span>
                  <span className="text-slate-200">{ward.musterPoint.distanceKm} km (Est: 28 min walk)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Shelter Capacity:</span>
                  <span className="text-emerald-400 font-bold">
                    {ward.musterPoint.capacity.toLocaleString()} persons
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Evacuation Protocol Step Checklist */}
          <div>
            <span className="text-xs font-bold uppercase font-mono text-slate-300 block mb-2.5">
              Standard Operating Procedure (SOP) Action Checklist
            </span>
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2.5 p-2 rounded bg-slate-900/60 border border-slate-800">
                <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-200">
                    Phase 1: Automated Siren & Wireless Broadcast (T-0 to T+10m)
                  </span>
                  <p className="text-slate-400 text-[11px]">
                    Sound emergency solar horn sirens across Ward 04 riverbanks. Transmit bilingual CAP text alerts to registered mobile numbers.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2 rounded bg-slate-900/60 border border-slate-800">
                <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-200">
                    Phase 2: Vulnerable Resident Priority Evacuation (T+10m to T+45m)
                  </span>
                  <p className="text-slate-400 text-[11px]">
                    Dispatch ward disaster volunteers to assist {ward.vulnerableHouseholds} homes with elderly, infants, and cattle movement to high-ground corrals.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2 rounded bg-slate-900/60 border border-slate-800">
                <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-200">
                    Phase 3: River Corridor Isolation & NDRF Staging (T+45m onwards)
                  </span>
                  <p className="text-slate-400 text-[11px]">
                    Police barricading of river access roads and bridges. Establish VHF command post at {ward.musterPoint.name}.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bilingual CAP Siren Broadcast Preview */}
          <div className="bg-[#090D15] border border-slate-800 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-semibold text-white uppercase font-mono">
                  Common Alerting Protocol (CAP) Broadcast Draft
                </span>
              </div>

              <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded border border-slate-800 text-[11px]">
                <button
                  onClick={() => setLangTab('hindi')}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    langTab === 'hindi'
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  हिन्दी (Hindi)
                </button>
                <button
                  onClick={() => setLangTab('english')}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    langTab === 'english'
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  English
                </button>
              </div>
            </div>

            <pre className="p-3 bg-slate-950 border border-slate-900 rounded font-mono text-[11px] text-slate-300 whitespace-pre-wrap leading-relaxed">
              {langTab === 'hindi' ? hindiAlertText : englishAlertText}
            </pre>

            <div className="flex justify-end">
              <button
                onClick={handleCopyAlert}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-medium flex items-center gap-1.5 transition-colors border border-slate-700"
              >
                <Copy className="w-3.5 h-3.5 text-cyan-400" />
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Broadcast Text'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-4 bg-[#090D15] border-t border-slate-800">
          <button
            onClick={handlePrint}
            className="px-3 py-2 rounded text-xs font-medium text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Official Disaster Briefing</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition-colors"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};
