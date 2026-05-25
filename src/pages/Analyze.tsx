import { useAnalysisStore } from "@/store/analysisStore";
import { analyzeImage } from "@/services/api";
import ImageUpload from "@/components/ImageUpload";
import ModeSelector from "@/components/ModeSelector";
import ResultDisplay from "@/components/ResultDisplay";
import { Sparkles, Cpu } from "lucide-react";

export default function Analyze() {
  const {
    uploadedFile,
    currentMode,
    currentModel,
    isAnalyzing,
    setModel,
    startAnalysis,
    appendResult,
    finishAnalysis,
    setError,
  } = useAnalysisStore();

  const handleAnalyze = async () => {
    if (!uploadedFile) return;

    startAnalysis();

    await analyzeImage(
      uploadedFile,
      currentMode,
      currentModel,
      (content) => appendResult(content),
      (id) => finishAnalysis(id),
      (error) => setError(error)
    );
  };

  return (
    <div className="min-h-screen pt-20 pb-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold text-white mb-2">
            图像分析
          </h1>
          <p className="text-dark-400 text-sm">
            上传图片，选择分析模式，AI 为你提供深度分析
          </p>
        </div>

        {/* 主内容区 - 双栏布局 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左栏：上传与配置 */}
          <div className="space-y-6">
            {/* 图片上传 */}
            <div className="p-6 rounded-2xl bg-dark-800/30 border border-white/5">
              <h2 className="font-display text-sm font-semibold text-dark-200 mb-4 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-accent-purple" />
                上传图片
              </h2>
              <ImageUpload />
            </div>

            {/* 分析模式 */}
            <div className="p-6 rounded-2xl bg-dark-800/30 border border-white/5">
              <h2 className="font-display text-sm font-semibold text-dark-200 mb-4 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-accent-blue" />
                分析模式
              </h2>
              <ModeSelector />
            </div>

            {/* 模型选择 + 分析按钮 */}
            <div className="p-6 rounded-2xl bg-dark-800/30 border border-white/5">
              <h2 className="font-display text-sm font-semibold text-dark-200 mb-4 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-accent-green" />
                AI 模型
              </h2>
              <div className="flex gap-3 mb-6">
                <button
                  onClick={() => !isAnalyzing && setModel("gpt-4v")}
                  disabled={isAnalyzing}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    currentModel === "gpt-4v"
                      ? "bg-accent-purple/15 text-accent-purple-light border border-accent-purple/30"
                      : "bg-dark-800/50 text-dark-400 border border-transparent hover:text-dark-200 hover:bg-dark-800"
                  } ${isAnalyzing ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <Cpu className="w-4 h-4" />
                  GPT-4V
                  <span className="text-xs text-dark-500 ml-1">需API Key</span>
                </button>
                <button
                  onClick={() => !isAnalyzing && setModel("glm-4v")}
                  disabled={isAnalyzing}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    currentModel === "glm-4v"
                      ? "bg-accent-purple/15 text-accent-purple-light border border-accent-purple/30"
                      : "bg-dark-800/50 text-dark-400 border border-transparent hover:text-dark-200 hover:bg-dark-800"
                  } ${isAnalyzing ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <Cpu className="w-4 h-4" />
                  GLM-4V-Flash
                </button>
              </div>

              <button
                onClick={handleAnalyze}
                disabled={!uploadedFile || isAnalyzing}
                className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium text-base transition-all ${
                  uploadedFile && !isAnalyzing
                    ? "btn-gradient text-white"
                    : "bg-dark-700/50 text-dark-500 cursor-not-allowed"
                }`}
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    分析中...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    开始分析
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 右栏：分析结果 */}
          <div className="p-6 rounded-2xl bg-dark-800/30 border border-white/5 min-h-[500px]">
            <h2 className="font-display text-sm font-semibold text-dark-200 mb-4 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-accent-green" />
              分析结果
            </h2>
            <ResultDisplay />
          </div>
        </div>
      </div>
    </div>
  );
}
