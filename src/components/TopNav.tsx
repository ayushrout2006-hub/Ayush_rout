import React from 'react';
import { Shield, ShieldAlert, Sparkles, RefreshCw, Radio } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { LanguageSelector } from './LanguageSelector';

interface TopNavProps {
  activeTab: 'dashboard' | 'gis-map' | 'telemetry' | 'ml-studio' | 'evacuation';
  setActiveTab: (tab: 'dashboard' | 'gis-map' | 'telemetry' | 'ml-studio' | 'evacuation') => void;
  isLiveStreaming: boolean;
  setIsLiveStreaming: (val: boolean | ((prev: boolean) => boolean)) => void;
  activeRegionName: string;
  onOpenStressTest: () => void;
  hasActiveScenario: boolean;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  setActiveTab,
  isLiveStreaming,
  setIsLiveStreaming,
  activeRegionName,
  onOpenStressTest,
  hasActiveScenario,
}) => {
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-40 bg-[#0B0F17]/95 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark with shield emblem */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-sm shadow-cyan-500/10">
            <Shield className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="flex flex-col">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('dashboard');
              }}
              className="text-lg font-extrabold tracking-tight text-white hover:text-cyan-400 transition-colors flex items-center gap-2"
            >
              <span>{t.appName}</span>
              <span className="text-[10px] font-mono font-normal uppercase px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                PRO
              </span>
            </a>
            <span className="text-[11px] font-sans text-slate-400 -mt-0.5 truncate max-w-[200px] sm:max-w-none">
              {t.tagline}
            </span>
          </div>
        </div>

        {/* Zone 2: Clean text navigation links in selected language */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`transition-colors relative py-1 text-xs tracking-wide uppercase ${
              activeTab === 'dashboard'
                ? 'text-cyan-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.navDashboard}
            {activeTab === 'dashboard' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('gis-map')}
            className={`transition-colors relative py-1 text-xs tracking-wide uppercase ${
              activeTab === 'gis-map'
                ? 'text-cyan-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.navMaps}
            {activeTab === 'gis-map' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('telemetry')}
            className={`transition-colors relative py-1 text-xs tracking-wide uppercase ${
              activeTab === 'telemetry'
                ? 'text-cyan-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.navTelemetry}
            {activeTab === 'telemetry' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('ml-studio')}
            className={`transition-colors relative py-1 text-xs tracking-wide uppercase ${
              activeTab === 'ml-studio'
                ? 'text-cyan-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.navMlStudio}
            {activeTab === 'ml-studio' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('evacuation')}
            className={`transition-colors relative py-1 text-xs tracking-wide uppercase ${
              activeTab === 'evacuation'
                ? 'text-cyan-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.navEvacuation}
            {activeTab === 'evacuation' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-full" />
            )}
          </button>
        </nav>

        {/* Zone 3: Language Selector + Primary Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Language Selector Dropdown */}
          <LanguageSelector />

          {/* Live Telemetry Toggle */}
          <button
            onClick={() => setIsLiveStreaming((prev) => !prev)}
            title={isLiveStreaming ? 'Pause live sensor stream' : 'Resume live sensor stream'}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono transition-colors border shadow-sm ${
              isLiveStreaming
                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60'
                : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isLiveStreaming ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
              }`}
            />
            <span className="hidden sm:inline">
              {isLiveStreaming ? t.liveStreaming : t.streamPaused}
            </span>
          </button>

          {/* Cloudburst Simulator Action */}
          <button
            onClick={onOpenStressTest}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shadow-sm ${
              hasActiveScenario
                ? 'bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 ring-2 ring-amber-400/50'
                : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{hasActiveScenario ? t.stormActive : t.simulateStorm}</span>
          </button>
        </div>
      </div>

      {/* Mobile / Tablet Horizontal Scrollable Tab Bar */}
      <div className="flex lg:hidden items-center gap-2 overflow-x-auto no-scrollbar pt-2.5 mt-2 border-t border-slate-800/60 text-xs">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`py-1 px-2.5 rounded-lg whitespace-nowrap font-medium text-xs transition-colors ${
            activeTab === 'dashboard'
              ? 'bg-cyan-500/20 text-cyan-400 font-bold border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {t.navDashboard}
        </button>
        <button
          onClick={() => setActiveTab('gis-map')}
          className={`py-1 px-2.5 rounded-lg whitespace-nowrap font-medium text-xs transition-colors ${
            activeTab === 'gis-map'
              ? 'bg-cyan-500/20 text-cyan-400 font-bold border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {t.navMaps}
        </button>
        <button
          onClick={() => setActiveTab('telemetry')}
          className={`py-1 px-2.5 rounded-lg whitespace-nowrap font-medium text-xs transition-colors ${
            activeTab === 'telemetry'
              ? 'bg-cyan-500/20 text-cyan-400 font-bold border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {t.navTelemetry}
        </button>
        <button
          onClick={() => setActiveTab('ml-studio')}
          className={`py-1 px-2.5 rounded-lg whitespace-nowrap font-medium text-xs transition-colors ${
            activeTab === 'ml-studio'
              ? 'bg-cyan-500/20 text-cyan-400 font-bold border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {t.navMlStudio}
        </button>
        <button
          onClick={() => setActiveTab('evacuation')}
          className={`py-1 px-2.5 rounded-lg whitespace-nowrap font-medium text-xs transition-colors ${
            activeTab === 'evacuation'
              ? 'bg-cyan-500/20 text-cyan-400 font-bold border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {t.navEvacuation}
        </button>
      </div>
    </header>
  );
};
