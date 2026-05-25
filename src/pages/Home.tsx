import { Link } from "react-router-dom";
import {
  Eye,
  FileText,
  ScanSearch,
  Mountain,
  Type,
  Palette,
  ArrowRight,
  Sparkles,
  Zap,
  Shield,
} from "lucide-react";
import ParticleBackground from "@/components/ParticleBackground";
import { ANALYZE_MODES, type AnalyzeMode } from "@/services/api";

const FEATURE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  FileText,
  ScanSearch,
  Mountain,
  Type,
  Palette,
};

const FEATURE_COLORS: Record<AnalyzeMode, string> = {
  describe: "from-accent-purple to-accent-blue",
  object: "from-accent-blue to-cyan-400",
  scene: "from-emerald-400 to-accent-green",
  ocr: "from-amber-400 to-orange-500",
  color: "from-pink-400 to-accent-purple",
};

export default function Home() {
  return (
    <div className="min-h-screen">
      <ParticleBackground />

      {/* Hero 区域 */}
      <section className="relative pt-32 pb-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-purple/10 border border-accent-purple/20 text-accent-purple-light text-sm mb-8">
              <Sparkles className="w-4 h-4" />
              基于视觉大模型的智能分析
            </div>
          </div>

          <h1
            className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 animate-fade-in-up"
            style={{ animationDelay: "0.1s" }}
          >
            <span className="text-white">用 AI 重新</span>
            <br />
            <span className="gradient-text">理解每一张图片</span>
          </h1>

          <p
            className="text-dark-300 text-lg sm:text-xl max-w-2xl mx-auto mb-10 animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            上传任意图片，VisionAI 将为你提供智能描述、物体识别、场景分析、
            文字识别和色彩分析等多种 AI 视觉能力
          </p>

          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up"
            style={{ animationDelay: "0.3s" }}
          >
            <Link
              to="/analyze"
              className="btn-gradient inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-white font-medium text-base"
            >
              开始分析
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-dark-300 hover:text-white font-medium text-base border border-dark-600 hover:border-dark-400 transition-all"
            >
              了解更多
            </a>
          </div>

          {/* 统计数字 */}
          <div
            className="flex items-center justify-center gap-12 mt-16 animate-fade-in-up"
            style={{ animationDelay: "0.4s" }}
          >
            {[
              { value: "5", label: "分析模式" },
              { value: "2", label: "AI 模型" },
              { value: "<3s", label: "响应速度" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-display text-2xl font-bold gradient-text">
                  {stat.value}
                </div>
                <div className="text-dark-500 text-xs mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 功能介绍区域 */}
      <section id="features" className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">
              五大 AI 视觉能力
            </h2>
            <p className="text-dark-400 text-lg max-w-xl mx-auto">
              覆盖图像理解的各个维度，满足不同场景需求
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(Object.entries(ANALYZE_MODES) as [AnalyzeMode, (typeof ANALYZE_MODES)[AnalyzeMode]][]).map(
              ([mode, config], index) => {
                const Icon = FEATURE_ICONS[config.icon];
                const gradient = FEATURE_COLORS[mode];
                return (
                  <div
                    key={mode}
                    className="card-hover group p-6 rounded-2xl bg-dark-800/30 border border-white/5 backdrop-blur-sm animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                    >
                      {Icon && <Icon className="w-6 h-6 text-white" />}
                    </div>
                    <h3 className="font-display text-lg font-semibold text-white mb-2">
                      {config.label}
                    </h3>
                    <p className="text-dark-400 text-sm leading-relaxed">
                      {config.description}
                    </p>
                  </div>
                );
              }
            )}

            {/* 额外特性卡片 */}
            <div
              className="card-hover group p-6 rounded-2xl bg-gradient-to-br from-accent-purple/10 to-accent-blue/10 border border-accent-purple/20 backdrop-blur-sm animate-fade-in-up"
              style={{ animationDelay: "0.5s" }}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-purple to-accent-blue flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-display text-lg font-semibold text-white mb-2">
                流式输出
              </h3>
              <p className="text-dark-400 text-sm leading-relaxed">
                实时流式返回分析结果，无需等待，体验更流畅
              </p>
            </div>

            <div
              className="card-hover group p-6 rounded-2xl bg-gradient-to-br from-accent-green/10 to-emerald-400/10 border border-accent-green/20 backdrop-blur-sm animate-fade-in-up"
              style={{ animationDelay: "0.6s" }}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-green to-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-display text-lg font-semibold text-white mb-2">
                多模型支持
              </h3>
              <p className="text-dark-400 text-sm leading-relaxed">
                支持 OpenAI GPT-4V 和智谱 GLM-4V，灵活切换
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA 区域 */}
      <section className="relative py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="p-12 rounded-3xl bg-gradient-to-br from-dark-800/50 to-dark-800/30 border border-white/5 backdrop-blur-sm">
            <Eye className="w-12 h-12 text-accent-purple mx-auto mb-6" />
            <h2 className="font-display text-3xl font-bold text-white mb-4">
              准备好探索了吗？
            </h2>
            <p className="text-dark-400 text-lg mb-8">
              上传一张图片，让 AI 为你揭示图片中隐藏的信息
            </p>
            <Link
              to="/analyze"
              className="btn-gradient inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-white font-medium text-base"
            >
              立即体验
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 页脚 */}
      <footer className="py-8 px-4 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-accent-purple to-accent-blue flex items-center justify-center">
              <Eye className="w-3 h-3 text-white" />
            </div>
            <span className="font-display font-semibold text-sm text-dark-400">
              VisionAI
            </span>
          </div>
          <p className="text-dark-500 text-xs">
            Powered by GPT-4V & GLM-4V | Built with React + FastAPI
          </p>
        </div>
      </footer>
    </div>
  );
}
