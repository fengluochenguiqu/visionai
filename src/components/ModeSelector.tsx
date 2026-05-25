import { useAnalysisStore } from "@/store/analysisStore";
import { ANALYZE_MODES, type AnalyzeMode } from "@/services/api";
import {
  FileText,
  ScanSearch,
  Mountain,
  Type,
  Palette,
} from "lucide-react";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  FileText,
  ScanSearch,
  Mountain,
  Type,
  Palette,
};

export default function ModeSelector() {
  const { currentMode, setMode, isAnalyzing } = useAnalysisStore();

  return (
    <div className="flex flex-wrap gap-2">
      {(Object.entries(ANALYZE_MODES) as [AnalyzeMode, (typeof ANALYZE_MODES)[AnalyzeMode]][]).map(
        ([mode, config]) => {
          const Icon = ICON_MAP[config.icon];
          const isActive = currentMode === mode;

          return (
            <button
              key={mode}
              onClick={() => !isAnalyzing && setMode(mode)}
              disabled={isAnalyzing}
              className={`mode-tab flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "active bg-accent-purple/15 text-accent-purple-light border border-accent-purple/30"
                  : "bg-dark-800/50 text-dark-400 border border-transparent hover:text-dark-200 hover:bg-dark-800"
              } ${isAnalyzing ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              {Icon && <Icon className="w-4 h-4" />}
              <span>{config.label}</span>
            </button>
          );
        }
      )}
    </div>
  );
}
