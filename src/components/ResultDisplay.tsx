import { useRef, useEffect } from "react";
import { Copy, RotateCcw, Download, Check } from "lucide-react";
import { useState } from "react";
import { useAnalysisStore } from "@/store/analysisStore";

export default function ResultDisplay() {
  const { result, isAnalyzing, error, resultId } = useAnalysisStore();
  const resultRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  // 自动滚动到底部
  useEffect(() => {
    if (resultRef.current && isAnalyzing) {
      resultRef.current.scrollTop = resultRef.current.scrollHeight;
    }
  }, [result, isAnalyzing]);

  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 降级方案
      const textarea = document.createElement("textarea");
      textarea.value = result;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleExport = () => {
    if (!result) return;
    const blob = new Blob([result], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `visionai-result-${resultId || Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 空状态
  if (!result && !isAnalyzing && !error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="w-20 h-20 rounded-2xl bg-dark-800/50 flex items-center justify-center mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-purple/20 to-accent-blue/20 flex items-center justify-center">
            <span className="text-2xl">🔍</span>
          </div>
        </div>
        <p className="text-dark-400 text-sm mb-1">上传图片并选择分析模式</p>
        <p className="text-dark-500 text-xs">AI 将为你提供详细的分析结果</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* 操作栏 */}
      {result && !isAnalyzing && (
        <div className="flex items-center gap-2 pb-3 border-b border-white/5 mb-3">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-dark-400 hover:text-white hover:bg-dark-800/50 transition-all"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-accent-green" />
                <span className="text-accent-green">已复制</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                复制
              </>
            )}
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-dark-400 hover:text-white hover:bg-dark-800/50 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            导出
          </button>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-dark-400 hover:text-white hover:bg-dark-800/50 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            重新分析
          </button>
        </div>
      )}

      {/* 结果内容 */}
      <div
        ref={resultRef}
        className="flex-1 overflow-y-auto pr-2"
        style={{ maxHeight: "calc(100vh - 300px)" }}
      >
        {/* 错误状态 */}
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            <p className="font-medium mb-1">分析失败</p>
            <p className="text-red-400/80">{error}</p>
          </div>
        )}

        {/* 加载状态 */}
        {isAnalyzing && !result && (
          <div className="space-y-3">
            <div className="skeleton h-6 w-3/4" />
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-4 w-5/6" />
            <div className="skeleton h-4 w-4/5" />
            <div className="skeleton h-4 w-2/3" />
          </div>
        )}

        {/* 结果展示 */}
        {result && (
          <div className={`markdown-content ${isAnalyzing ? "typing-cursor" : ""}`}>
            {result.split("\n").map((line, i) => {
              if (!line.trim()) return <br key={i} />;

              // 标题
              if (line.startsWith("### "))
                return (
                  <h3 key={i}>{line.slice(4)}</h3>
                );
              if (line.startsWith("## "))
                return (
                  <h2 key={i}>{line.slice(3)}</h2>
                );
              if (line.startsWith("# "))
                return (
                  <h1 key={i}>{line.slice(2)}</h1>
                );

              // 列表项
              if (line.startsWith("- ") || line.startsWith("* ")) {
                return (
                  <div key={i} className="flex gap-2 ml-2">
                    <span className="text-accent-purple mt-1">•</span>
                    <span>{renderInlineMarkdown(line.slice(2))}</span>
                  </div>
                );
              }

              // 有序列表
              const olMatch = line.match(/^(\d+)\.\s(.+)/);
              if (olMatch) {
                return (
                  <div key={i} className="flex gap-2 ml-2">
                    <span className="text-accent-purple font-medium">{olMatch[1]}.</span>
                    <span>{renderInlineMarkdown(olMatch[2])}</span>
                  </div>
                );
              }

              // 引用
              if (line.startsWith("> ")) {
                return (
                  <blockquote key={i}>{renderInlineMarkdown(line.slice(2))}</blockquote>
                );
              }

              // 普通段落
              return <p key={i}>{renderInlineMarkdown(line)}</p>;
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// 简单的行内 Markdown 渲染
function renderInlineMarkdown(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining) {
    // 加粗
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    // 行内代码
    const codeMatch = remaining.match(/`(.+?)`/);

    let firstMatch: { index: number; length: number; node: React.ReactNode } | null = null;

    if (boldMatch && boldMatch.index !== undefined) {
      const candidate = {
        index: boldMatch.index,
        length: boldMatch[0].length,
        node: <strong key={key++}>{boldMatch[1]}</strong>,
      };
      if (!firstMatch || candidate.index < firstMatch.index) firstMatch = candidate;
    }

    if (codeMatch && codeMatch.index !== undefined) {
      const candidate = {
        index: codeMatch.index,
        length: codeMatch[0].length,
        node: <code key={key++}>{codeMatch[1]}</code>,
      };
      if (!firstMatch || candidate.index < firstMatch.index) firstMatch = candidate;
    }

    if (!firstMatch) {
      parts.push(remaining);
      break;
    }

    if (firstMatch.index > 0) {
      parts.push(remaining.slice(0, firstMatch.index));
    }
    parts.push(firstMatch.node);
    remaining = remaining.slice(firstMatch.index + firstMatch.length);
  }

  return parts;
}
